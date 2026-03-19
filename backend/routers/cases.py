from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List, Optional
from services.kanoon import get_doc_details, get_cites, get_citedby, get_doc_meta
from services.gemini import summarize_judgment
from services.rate_limiter import check_and_increment
from services.firebase_auth import get_current_user, FirebaseUser
import asyncio

router = APIRouter(
    prefix="/cases",
    tags=["cases"],
)

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
    docid: str,
    current_user: FirebaseUser = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate an AI summary for a case.
    Requires authentication and checks AI rate limits.
    """
    usage = check_and_increment(current_user.uid)
    
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
    Publicly accessible.
    """
    try:
        # Run requests in parallel
        cites_task = get_cites(docid)
        citedby_task = get_citedby(docid)
        meta_task = get_doc_meta(docid)
        
        cites_data, citedby_data, meta_data = await asyncio.gather(cites_task, citedby_task, meta_task)
        
        nodes = []
        links = []
        
        # 1. Add root node (the current case)
        nodes.append({
            "id": docid,
            "title": meta_data.get("title", f"Case {docid}"),
            "type": "root",
            "val": 20 # size in graph
        })
        
        # 2. Add 'cites' nodes (cases this doc cites)
        # We call search_judgments which returns results in "results" key
        cites_list = cites_data.get("results") or cites_data.get("docs") or []
        for doc in cites_list:
            # search_judgments already maps to "doc_id"
            tid = str(doc.get("doc_id") or doc.get("tid") or doc.get("docid") or "")
            if not tid: continue
            
            nodes.append({
                "id": tid,
                "title": doc.get("title", f"Case {tid}"),
                "type": "cites",
                "val": 10
            })
            links.append({
                "source": docid,
                "target": tid,
                "label": "cites"
            })
            
        # 3. Add 'citedby' nodes (cases that cite this doc)
        citedby_list = citedby_data.get("results") or citedby_data.get("docs") or []
        for doc in citedby_list:
            tid = str(doc.get("doc_id") or doc.get("tid") or doc.get("docid") or "")
            if not tid: continue

            # Avoid duplicate nodes
            if not any(n["id"] == tid for n in nodes):
                nodes.append({
                    "id": tid,
                    "title": doc.get("title", f"Case {tid}"),
                    "type": "citedby",
                    "val": 10
                })
            links.append({
                "source": tid,
                "target": docid,
                "label": "citedby"
            })
            
        return {
            "nodes": nodes,
            "links": links
        }
    except Exception as e:
        print(f"Failed to fetch citations for {docid}: {e}")
        # Return empty state instead of crashing
        return {
            "nodes": [{
                "id": docid,
                "title": "Current Case",
                "type": "root",
                "val": 20
            }],
            "links": [],
            "error": str(e)
        }
