from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List, Optional
from services.kanoon import get_doc_details, get_cites, get_citedby, get_doc_meta
from services.gemini import summarize_judgment, get_case_timeline
from services.rate_limiter import check_and_increment
from services.firebase_auth import get_current_user, FirebaseUser
import asyncio

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
    docid: str,
    current_user: FirebaseUser = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate an AI summary for a case.
    Requires authentication and checks AI rate limits.
    """
    usage = await check_and_increment(current_user.uid)
    
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
            title = doc_obj.get("title", f"Case {tid}")
            date_str = doc_obj.get("date", "")
            
            # Extract year
            year = None
            if date_str:
                try: year = int(date_str.split("-")[0])
                except: pass
            
            if not year and title:
                import re
                year_match = re.search(r'\b(19\d{2}|20\d{2})\b', title)
                if year_match: year = int(year_match.group(1))
            
            if not year: year = 2024 # Fallback
            
            if tid not in nodes_dict:
                nodes_dict[tid] = {
                    "id": tid,
                    "title": title,
                    "type": node_type,
                    "val": val,
                    "year": year
                }
            elif node_type == "root": # Root always wins
                nodes_dict[tid]["type"] = "root"
                nodes_dict[tid]["val"] = 20
                if year: nodes_dict[tid]["year"] = year

        # Add root node
        add_node(docid, meta_data, "root", 20)
        
        # Process Primary 'Cites' (Cases this case cites)
        primary_cites = cites_data.get("results") or []
        for doc in primary_cites:
            tid = str(doc.get("doc_id") or doc.get("tid") or "")
            if not tid or tid == docid: continue
            
            add_node(tid, doc, "cites", 12)
            links.append({"source": docid, "target": tid, "label": "cites"})

        # Process Primary 'Cited By' (Cases that cite this case)
        primary_citedby = citedby_data.get("results") or []
        for doc in primary_citedby:
            tid = str(doc.get("doc_id") or doc.get("tid") or "")
            if not tid or tid == docid: continue
            
            add_node(tid, doc, "citedby", 12)
            links.append({"source": tid, "target": docid, "label": "citedby"})

        # 2. Fetch Secondary Layer (Depth-1 Expansion)
        # To avoid overloading, we only expand the top 5 from each side
        to_expand_cites = [n["id"] for n in list(nodes_dict.values()) if n["type"] == "cites"][:5]
        to_expand_citedby = [n["id"] for n in list(nodes_dict.values()) if n["type"] == "citedby"][:5]
        
        # Create tasks for secondary expansion
        secondary_tasks = []
        for tid in to_expand_cites:
            secondary_tasks.append(get_cites(tid))
        for tid in to_expand_citedby:
            secondary_tasks.append(get_citedby(tid))
            
        if secondary_tasks:
            secondary_results = await asyncio.gather(*secondary_tasks, return_exceptions=True)
            
            # Map results back to their parent IDs
            idx = 0
            # Process secondary cites
            for parent_id in to_expand_cites:
                res = secondary_results[idx]
                idx += 1
                if isinstance(res, Exception): continue
                
                # Limit to 5 secondary nodes per parent
                for doc in (res.get("results") or [])[:5]:
                    tid = str(doc.get("doc_id") or doc.get("tid") or "")
                    if not tid or tid == docid or tid == parent_id: continue
                    
                    add_node(tid, doc.get("title"), "secondary", 8)
                    # Check if link already exists
                    if not any(l["source"] == parent_id and l["target"] == tid for l in links):
                        links.append({"source": parent_id, "target": tid, "label": "cites"})

            # Process secondary citedby
            for parent_id in to_expand_citedby:
                res = secondary_results[idx]
                idx += 1
                if isinstance(res, Exception): continue
                
                for doc in (res.get("results") or [])[:5]:
                    tid = str(doc.get("doc_id") or doc.get("tid") or "")
                    if not tid or tid == docid or tid == parent_id: continue
                    
                    add_node(tid, doc.get("title"), "secondary", 8)
                    if not any(l["source"] == tid and l["target"] == parent_id for l in links):
                        links.append({"source": tid, "target": parent_id, "label": "citedby"})
            
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
