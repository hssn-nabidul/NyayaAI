from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import StreamingResponse
from typing import Dict, Any, List, Optional
from services.kanoon import get_doc_details, get_cites, get_citedby, get_doc_meta
from services.gemini import summarize_judgment, get_case_timeline, query_gemini, find_similar_cases, prepare_text, get_or_generate_summary, format_summary_as_context
from services.rate_limiter import check_and_increment
# Auth disabled for dev testing — will be re-enabled before deployment
from services.prompts import CASE_CHAT_FIRST_PROMPT, CASE_CHAT_FOLLOWUP_PROMPT
from services.cache import cache_service
import asyncio
import json
import re
import hashlib

router = APIRouter(
    prefix="/cases",
    tags=["cases"],
)

@router.get("/recent")
async def list_recent_cases(
    limit: int = 20,
    offset: int = 0
) -> Dict[str, Any]:
    """
    List recently scraped cases from the internal database.
    Used for the Library or Recent Cases view.
    """
    from engine.search import search_internal_cases
    try:
        # Pass empty query to get latest cases
        results = search_internal_cases(query="", limit=limit, offset=offset)
        return {
            "total": len(results), # This is current page count, search_internal_cases doesn't return total yet
            "results": results
        }
    except Exception as e:
        print(f"Failed to list cases: {e}")
        return {"results": [], "total": 0}

@router.get("/{docid}")
async def get_case_detail(
    docid: str
) -> Dict[str, Any]:
    """
    Fetch full judgment text and metadata for a specific case.
    Publicly accessible.
    """
    try:
        result = await get_doc_details(docid)
        return result
    except Exception as e:
        print(f"Failed to fetch case {docid}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch case details for ID {docid}.")

@router.post("/{docid}/summary")
async def get_case_summary(
    docid: str
) -> Dict[str, Any]:
    """
    Generate an AI summary for a case.
    """
    usage = {"used": 0, "limit": 999, "remaining": 999}
    
    try:
        case_data = await get_doc_details(docid)
        if not case_data:
            raise HTTPException(status_code=404, detail="Case not found")
            
        doc_text = case_data.get("doc", "") or case_data.get("text", "") or ""
        
        if not doc_text:
            raise HTTPException(status_code=404, detail="Judgment text not found for this case.")
        
        # Summarize using the truncated text
        summary = await summarize_judgment(doc_text[:12000])
        
        return {
            "summary": summary,
            "usage": usage
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Summarization failed for {docid}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{docid}/citations")
async def get_case_citations(
    docid: str
) -> Dict[str, Any]:
    """
    Fetch citation data for a case and format it for a graph (nodes and links).
    Expanded to Depth-1 (citations of the citations) for a richer network.
    """
    try:
        # 1. Fetch Primary Layer
        cites_task = get_cites(docid)
        citedby_task = get_citedby(docid)
        meta_task = get_doc_meta(docid)
        
        cites_data, citedby_data, meta_data = await asyncio.gather(cites_task, citedby_task, meta_task)
        
        nodes_dict = {}
        links = []
        
        # Helper to add nodes safely
        def add_node(tid, doc_obj, node_type, val=10):
            # Determine title from various possible fields
            title = doc_obj.get("title", "") or doc_obj.get("citation", f"Case {tid}")
            if not title or title == f"Case {tid}":
                title = f"Case {tid}"
            
            # Extract year
            year = doc_obj.get("year")
            if not year:
                date_str = doc_obj.get("date", "")
                if date_str:
                    try: year = int(str(date_str).split("-")[0])
                    except: pass
            if not year and title:
                year_match = re.search(r'\b(19\d{2}|20\d{2})\b', str(title))
                if year_match: year = int(year_match.group(1))
            if not year: year = 2024
            
            if tid not in nodes_dict:
                nodes_dict[tid] = {
                    "id": tid,
                    "title": title,
                    "type": node_type,
                    "val": val,
                    "year": year
                }
            elif node_type == "root":
                nodes_dict[tid]["type"] = "root"
                nodes_dict[tid]["val"] = 20
                if year: nodes_dict[tid]["year"] = year

        # Add root node
        add_node(docid, meta_data, "root", 20)
        
        # Process Primary 'Cites' — extracted from judgment text via regex
        primary_cites = cites_data.get("results") or []
        for doc in primary_cites:
            cit = doc.get("citation", "") or doc.get("title", "")
            if not cit:
                continue
            # Use citation string as node ID (unique, stable)
            tid = f"cit_{hash(cit) & 0xFFFFFF:06x}"
            
            title = doc.get("title", "") or cit
            
            citation_obj = {"title": title, "citation": cit, "year": doc.get("year")}
            add_node(tid, citation_obj, "cites", 12)
            links.append({"source": docid, "target": tid, "label": "cites"})

        # Process Primary 'Cited By' (IK API rarely returns this)
        primary_citedby = citedby_data.get("results") or []
        for doc in primary_citedby:
            tid = str(doc.get("doc_id") or doc.get("tid") or "")
            if not tid or tid == docid: continue
            
            add_node(tid, doc, "citedby", 12)
            links.append({"source": tid, "target": docid, "label": "citedby"})

        # Note: Secondary layer expansion (Depth-1) is not performed for text-extracted
        # citations since they use hash-based IDs without real doc_ids for API lookup.
        # The primary text extraction already provides a comprehensive set of citations.
            
        return {
            "nodes": list(nodes_dict.values()),
            "links": links
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Failed to fetch expanded citations for {docid}: {e}")
        return {
            "nodes": [{"id": docid, "title": "Current Case", "type": "root", "val": 20}],
            "links": [],
            "error": str(e)
        }

@router.get("/{docid}/timeline")
async def get_case_timeline_endpoint(
    docid: str
) -> Dict[str, Any]:
    """
    Fetch a legal timeline for a case.
    """
    try:
        case_data = await get_doc_meta(docid)
        if not case_data or not case_data.get("title"):
            raise HTTPException(status_code=404, detail="Case not found")
        
        title = case_data.get("title", "Unknown Case")
        date_str = case_data.get("date", "")
        year = 2024
        if date_str:
            try: year = int(date_str.split("-")[0])
            except: pass
        
        timeline = await get_case_timeline(title, year)
        return timeline
    except Exception as e:
        print(f"Failed to fetch timeline for {docid}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{docid}/chat")
async def chat_about_case(
    docid: str,
    query: str = Body(..., embed=True),
    history: str = Body(default="", embed=True),
):
    """
    Stream a chat response about a specific case.
    
    TOKEN-OPTIMIZED DUAL-MODE:
    - First call (history empty): Uses full judgment text (~5K chars) to generate a comprehensive brief.
      The structured summary is cached after generation.
    - Follow-up calls (history present): Uses the cached structured summary (~800-1,200 chars)
      as context instead of re-sending the full judgment text. This saves ~75% tokens per message.
    - Chat responses are also cached per query hash for instant replay on repeated questions.
    """
    usage = {"used": 0, "limit": 999, "remaining": 999}
    
    try:
        doc_text = ""
        case_data = await get_doc_details(docid)
        if not case_data:
            raise HTTPException(status_code=404, detail="Case not found")
        
        doc_text = case_data.get("doc", "") or case_data.get("text", "") or ""
        if not doc_text:
            raise HTTPException(status_code=404, detail="Judgment text not found for this case.")
        
        user_query = query if query else "Please summarize this case comprehensively."
        is_first_call = not history or history.strip() == "" or history == "No previous conversation."
        
        if is_first_call:
            # ── MODE 1: FIRST CALL — Full judgment text ──
            judgment_excerpt = prepare_text(doc_text, max_chars=5000)
            
            prompt = CASE_CHAT_FIRST_PROMPT.format(
                judgment_text=judgment_excerpt,
                history=history or "No previous conversation.",
                query=user_query
            )
        else:
            # ── MODE 2: FOLLOW-UP — Cached structured summary ──
            # Try to get the cached structured summary; if not available, generate it silently
            summary_dict = None
            try:
                summary_dict = await get_or_generate_summary(docid, doc_text)
            except Exception as e:
                print(f"Could not generate structured summary for follow-up chat: {e}")
            
            if summary_dict:
                # Use the rich structured summary as context (~800-1,200 chars instead of 5,000)
                context = format_summary_as_context(summary_dict)
                prompt = CASE_CHAT_FOLLOWUP_PROMPT.format(
                    structured_summary=context,
                    history=history or "No previous conversation.",
                    query=user_query
                )
            else:
                # Fallback: use truncated text if summary generation failed
                judgment_excerpt = prepare_text(doc_text, max_chars=2000)
                prompt = CASE_CHAT_FOLLOWUP_PROMPT.format(
                    structured_summary=judgment_excerpt,
                    history=history or "No previous conversation.",
                    query=user_query
                )
        
        # ── Stream the response (with chat response caching) ──
        # Generate a stable cache key for the exact prompt
        chat_cache_key = hashlib.md5(f"chat_{docid}_{prompt[:500]}".encode()).hexdigest()
        
        # Generate the response outside the async generator to avoid SDK compatibility issues
        cached_response = cache_service.get("chat_cache", chat_cache_key)
        response_content = cached_response if cached_response else await query_gemini(prompt)
        # Only cache non-empty responses to avoid caching errors
        if not cached_response and response_content and len(response_content) > 20:
            cache_service.set("chat_cache", chat_cache_key, response_content, ttl_days=30)
        
        async def generate():
            try:
                if response_content:
                    escaped = response_content.replace("\n", "\\n")
                    yield f"data: {escaped}\n\n"
            except Exception as e:
                print(f"Stream generation failed: {e}")
                import traceback
                traceback.print_exc()
                yield f"data: [Error generating response: {str(e)}]\n\n"
            else:
                yield f"event: usage\ndata: {json.dumps(usage)}\n\n"
                yield "event: end\ndata: end\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Case chat failed for {docid}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{docid}/similar")
async def get_similar_cases(
    docid: str
) -> Dict[str, Any]:
    """
    Find thematically similar cases using Gemini AI analysis.
    Goes beyond direct citations to find cases sharing the same legal principles.
    """
    usage = {"used": 0, "limit": 999, "remaining": 999}
    
    try:
        # 1. Fetch the case for analysis
        case_data = await get_doc_details(docid)
        if not case_data:
            raise HTTPException(status_code=404, detail="Case not found")
        
        doc_text = case_data.get("doc", "") or case_data.get("text", "") or ""
        case_title = case_data.get("title", "Unknown Case")
        
        if not doc_text:
            raise HTTPException(status_code=404, detail="Judgment text not found for this case.")
        
        # 2. Gemini analyzes the case and finds thematically similar cases
        ai_analysis = await find_similar_cases(case_title, doc_text)
        
        return {
            "case_title": case_title,
            "thematic_analysis": ai_analysis.get("thematic_analysis", {}),
            "similar_cases": ai_analysis.get("similar_cases", []),
            "usage": usage
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Similar cases failed for {docid}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
