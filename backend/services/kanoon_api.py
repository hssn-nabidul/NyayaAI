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
                params={"formInput": query, "pagenum": page},
                headers=headers
            )
            if resp.status_code == 200:
                data = resp.json()
                # Normalize results to match our internal schema
                results = data.get("results", [])
                for r in results:
                    r["source"] = "kanoon_api"
                    r["docid"] = str(r.get("docid", ""))
                return {
                    "results": results,
                    "total": data.get("total", 0),
                    "source": "api"
                }
    except Exception as e:
        logger.error("kanoon_api_search_failed", error=str(e))
    
    return {"results": [], "total": 0}

async def kanoon_api_get_document(docid: str) -> Optional[Dict[str, Any]]:
    """Fetch full document via Indian Kanoon API."""
    if not KANOON_API_TOKEN:
        return None
        
    # Strip prefixes if any
    clean_id = docid.replace("judis_", "").replace("IK-", "")
    
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
