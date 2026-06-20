from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import StreamingResponse
from typing import Dict, Any
from services.gemini import analyse_legal_document, query_gemini, format_analysis_as_context, get_cache_key, prepare_text
from services.prompts import ANALYSE_STREAM_FIRST_PROMPT, ANALYSE_STREAM_FOLLOWUP_PROMPT
from services.rate_limiter import check_and_increment
from services.cache import cache_service
# Auth disabled for dev testing
import hashlib
import json

router = APIRouter(
    prefix="/analyse",
    tags=["analyse"],
)

from pydantic import BaseModel

class AnalyseRequest(BaseModel):
    doc_text: str

class ChatRequest(BaseModel):
    query: str
    context: str

@router.post("/")
async def analyse_document(
    request: AnalyseRequest
) -> Dict[str, Any]:
    """
    Analyse a legal document text and return structured insights.
    """
    usage = {"used": 0, "limit": 999, "remaining": 999}
    
    try:
        # 2. Analyse using Gemini
        analysis = await analyse_legal_document(request.doc_text)
        
        return {
            "analysis": analysis,
            "usage": usage
        }
    except Exception as e:
        print(f"Document analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stream")
async def stream_analysis(
    request: ChatRequest
):
    """
    Stream a deep-dive analysis or chat response.
    
    TOKEN-OPTIMIZED DUAL-MODE:
    - First call (no cached analysis): Uses full document text via ANALYSE_STREAM_FIRST_PROMPT.
      The structured analysis from POST /analyse/ is cached for reuse.
    - Follow-up (cached analysis exists): Uses compressed structured analysis (~500-1K chars)
      via ANALYSE_STREAM_FOLLOWUP_PROMPT. This saves ~90% tokens per message.
    - Identical queries also replay from chat_cache instantly (zero token cost).
    
    Uses the same truncation and cache key as POST /analyse/ so cached analyses are always found.
    """
    usage = {"used": 0, "limit": 999, "remaining": 999}

    query = request.query.strip()
    
    # ── Use prepare_text() — same truncation method as analyse_legal_document() ──
    truncated_context = prepare_text(request.context, max_chars=10000)
    
    # ── Check for cached structured analysis using SAME key as POST /analyse/ ──
    # Must hash the same string: prepare_text(text, max_chars=15000)
    analysis_cache_key = get_cache_key("analyse", prepare_text(request.context, max_chars=15000))
    cached_analysis = cache_service.get("ai_cache", analysis_cache_key)
    
    # ── Build prompt using appropriate mode ──
    if cached_analysis:
        # MODE: Follow-up — use compressed structured analysis as context (~500-1K chars)
        compressed_context = format_analysis_as_context(cached_analysis)
        prompt = ANALYSE_STREAM_FOLLOWUP_PROMPT.format(
            analysis_context=compressed_context,
            query=query
        )
        prompt_label = "followup"
    else:
        # MODE: First call — use full document text (~10K chars)
        prompt = ANALYSE_STREAM_FIRST_PROMPT.format(
            context=truncated_context,
            query=query
        )
        prompt_label = "first"
    
    # ── Generate stream response cache key ──
    context_hash = hashlib.md5(request.context.encode()).hexdigest()
    stream_cache_key = hashlib.md5(f"analyse_stream_{prompt_label}_{context_hash}_{query}".encode()).hexdigest()
    
    # Generate the response outside the async generator to avoid SDK compatibility issues
    cached_response = cache_service.get("chat_cache", stream_cache_key)
    response_content = cached_response if cached_response else await query_gemini(prompt)
    # Only cache non-empty responses to avoid caching errors
    if not cached_response and response_content and len(response_content) > 20:
        cache_service.set("chat_cache", stream_cache_key, response_content, ttl_days=30)
    
    async def stream_with_usage():
        if response_content:
            escaped = response_content.replace("\n", "\\n")
            yield f"data: {escaped}\n\n"
        yield f"event: usage\ndata: {json.dumps(usage)}\n\n"
        yield "event: end\ndata: end\n\n"

    return StreamingResponse(
        stream_with_usage(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
