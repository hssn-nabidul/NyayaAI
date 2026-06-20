import httpx
import os
import structlog
from typing import Dict, Any, Optional

logger = structlog.get_logger()

KANOON_API_TOKEN = os.getenv("KANOON_API_TOKEN")
BASE_URL = "https://api.indiankanoon.org"

async def kanoon_api_search(query: str, page: int = 0) -> Dict[str, Any]:
    """Search via official Indian Kanoon API."""
    if not KANOON_API_TOKEN:
        return {"results": [], "total": 0}
        
    try:
        headers = {"Authorization": f"Token {KANOON_API_TOKEN}"}
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{BASE_URL}/search/", 
                data={"formInput": query, "pagenum": page},
                headers=headers
            )
            if resp.status_code == 200:
                data = resp.json()
                # API returns "docs" and "found" (not "results" and "total")
                docs = data.get("docs", [])
                results = []
                for doc in docs:
                    results.append({
                        "doc_id": str(doc.get("tid", "")),
                        "tid": str(doc.get("tid", "")),
                        "title": doc.get("title", ""),
                        "court": doc.get("docsource", "Supreme Court of India"),
                        "date": doc.get("publishdate", ""),
                        "headline": doc.get("headline", ""),
                        "author": doc.get("author", ""),
                        "citation": doc.get("citation", ""),
                        "numcites": doc.get("numcites", 0),
                        "numcitedby": doc.get("numcitedby", 0),
                        "docsource": doc.get("docsource", ""),
                        "source": "kanoon_api",
                    })
                return {
                    "results": results,
                    "total": data.get("found", len(results)),
                    "source": "api"
                }
    except Exception as e:
        logger.error("kanoon_api_search_failed", error=str(e))
    
    return {"results": [], "total": 0}

async def kanoon_api_get_document(docid: str) -> Optional[Dict[str, Any]]:
    """Fetch full document via Indian Kanoon API."""
    if not KANOON_API_TOKEN:
        return None
        
    # Strip IK prefix if present
    clean_id = docid.replace("IK-", "")
    
    try:
        headers = {"Authorization": f"Token {KANOON_API_TOKEN}"}
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(f"{BASE_URL}/doc/{clean_id}/", headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                data["source"] = "api"
                return data
    except Exception as e:
        logger.error("kanoon_api_doc_failed", docid=docid, error=str(e))
    
    return None
