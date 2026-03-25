from services.kanoon_api import kanoon_api_search, kanoon_api_get_document
from services.judis_scraper import judis_scraper
from services.cache import cache_service
import hashlib
import json
import structlog
from typing import Dict, Any, Optional

log = structlog.get_logger()

def _cache_key(*args) -> str:
    raw = "|".join(str(a) for a in args)
    return hashlib.md5(raw.encode()).hexdigest()

async def search_judgments(query: str, court: str = None,
                           from_year: int = None,
                           to_year: int = None,
                           page: int = 0) -> dict:
    """
    Primary: Indian Kanoon API (Pragmatic Launch Strategy)
    Secondary: JUDIS Scraper
    """
    key = _cache_key("search_v4_ik_primary", query, court, from_year, to_year, page)

    cached = cache_service.get("kanoon_cache", key)
    if cached:
        return cached

    # 1. Try Indian Kanoon API FIRST (Primary)
    log.info("search_ik_api_start", query=query)
    # Note: IK API handles years via the query string usually, 
    # but we'll use our wrapper which handles the token and pagenum.
    api_result = await kanoon_api_search(query, page=page)
    
    if api_result.get("results"):
        cache_service.set("kanoon_cache", key, api_result, ttl_days=7)
        return api_result

    # 2. Fallback to JUDIS only if API fails or returns zero results
    try:
        log.info("search_judis_fallback_start", query=query)
        result = await judis_scraper.search(
            query=query,
            from_year=from_year,
            to_year=to_year,
            page=page
        )
        if result.get("results"):
            cache_service.set("kanoon_cache", key, result, ttl_days=7)
            return result
    except Exception as e:
        log.error("judis_fallback_failed", error=str(e), query=query)

    return {"results": [], "total": 0, "query": query, "source": "none"}

async def get_doc_details(doc_id: str) -> dict:
    """
    Primary: Indian Kanoon API
    Secondary: JUDIS Scraper
    """
    key = _cache_key("doc_v4_ik_primary", doc_id)

    cached = cache_service.get("kanoon_cache", key)
    if cached:
        return cached

    # 1. Try Indian Kanoon API First
    api_result = await kanoon_api_get_document(doc_id)
    if api_result:
        # Standardize for frontend
        api_result["tid"] = doc_id
        api_result["doc_id"] = doc_id
        if "doc" not in api_result and "full_text" in api_result:
            api_result["doc"] = api_result["full_text"]
            
        cache_service.set("kanoon_cache", key, api_result, ttl_days=90)
        return api_result

    # 2. Fallback to JUDIS
    if "judis_" in doc_id or doc_id.isdigit():
        try:
            log.info("doc_judis_fallback_start", doc_id=doc_id)
            result = await judis_scraper.get_document(doc_id)
            cache_service.set("kanoon_cache", key, result, ttl_days=90)
            return result
        except Exception as e:
            log.error("judis_doc_fallback_failed", doc_id=doc_id, error=str(e))

    raise Exception(f"Case {doc_id} could not be retrieved from any source.")

async def get_cites(doc_id: str) -> dict:
    key = _cache_key("cites_v4", doc_id)

    cached = cache_service.get("kanoon_cache", key)
    if cached:
        return cached

    doc = await get_doc_details(doc_id)
    result = {
        "doc_id": doc_id,
        "tid": doc_id,
        "cites": doc.get("cited_cases", []),
        "cited_by": []
    }

    cache_service.set("kanoon_cache", key, result, ttl_days=30)
    return result

async def get_citedby(doc_id: str) -> dict:
    # IK API doesn't always provide cited_by in the basic doc call, 
    # but we return empty for now to maintain schema
    return {"results": []}

async def get_doc_meta(doc_id: str) -> dict:
    doc = await get_doc_details(doc_id)
    return {
        "doc_id": doc.get("doc_id"),
        "tid": doc.get("tid"),
        "title": doc.get("title"),
        "court": doc.get("court"),
        "date": doc.get("date"),
    }

async def search_by_judge(judge_name: str, page: int = 0) -> dict:
    # IK API works great with author: "Name"
    query = f'author: "{judge_name}"'
    return await search_judgments(query=query, page=page)
