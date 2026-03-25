from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import StreamingResponse
from typing import Dict, Any
from services.gemini import analyse_legal_document, stream_gemini
from services.prompts import AI_CHAT_PROMPT
from services.rate_limiter import check_and_increment
from services.firebase_auth import get_current_user, FirebaseUser

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
    request: AnalyseRequest,
    current_user: FirebaseUser = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Analyse a legal document text and return structured insights.
    """
    # 1. Check AI Rate Limit
    usage = await check_and_increment(current_user.uid)
    
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
    request: ChatRequest,
    current_user: FirebaseUser = Depends(get_current_user)
):
    """
    Stream a deep-dive analysis or chat response.
    """
    # 1. Check AI Rate Limit and get current usage
    usage = await check_and_increment(current_user.uid)

    prompt = AI_CHAT_PROMPT.format(context=request.context[:10000], query=request.query)
    
    async def stream_with_usage():
        async for chunk in stream_gemini(prompt):
            # Escape newlines for SSE data: lines
            escaped_chunk = chunk.replace("\n", "\\n")
            yield f"data: {escaped_chunk}\n\n"
        
        # Send usage as a final JSON event
        import json
        yield f"event: usage\ndata: {json.dumps(usage)}\n\n"
        yield "event: end\ndata: end\n\n"

    return StreamingResponse(
        stream_with_usage(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Critical for Nginx/Safari
        }
    )
