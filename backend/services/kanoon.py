from services.judis_scraper import judis_scraper
from services.kanoon_api import kanoon_api_search, kanoon_api_get_document
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
    Search across multiple sources:
    1. Check Cache
    2. Try JUDIS Scraper (Live)
    3. Fallback to Indian Kanoon API
    """
    key = _cache_key("search_v3", query, court, from_year, to_year, page)

    cached = cache_service.get("kanoon_cache", key)
    if cached:
        return cached

    # 1. Try JUDIS first
    try:
        log.info("search_judis_start", query=query)
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
        log.error("judis_search_failed_falling_back", error=str(e), query=query)

    # 2. Fallback to Indian Kanoon API
    log.info("search_api_fallback_start", query=query)
    api_result = await kanoon_api_search(query, page=page)
    if api_result.get("results"):
        cache_service.set("kanoon_cache", key, api_result, ttl_days=7)
        return api_result

    return {"results": [], "total": 0, "query": query, "source": "none"}

async def get_doc_details(doc_id: str) -> dict:
    """Fetch full judgment text with multi-source fallback."""
    key = _cache_key("doc_v3", doc_id)

    cached = cache_service.get("kanoon_cache", key)
    if cached:
        return cached

    # 1. Try JUDIS if ID is prefixed or looks like a filename
    if "judis_" in doc_id or doc_id.isdigit():
        try:
            result = await judis_scraper.get_document(doc_id)
            cache_service.set("kanoon_cache", key, result, ttl_days=90)
            return result
        except Exception as e:
            log.error("judis_doc_failed_falling_back", doc_id=doc_id, error=str(e))

    # 2. Try Indian Kanoon API Fallback
    api_result = await kanoon_api_get_document(doc_id)
    if api_result:
        # Standardize for frontend
        api_result["tid"] = doc_id
        api_result["doc_id"] = doc_id
        if "doc" not in api_result and "full_text" in api_result:
            api_result["doc"] = api_result["full_text"]
            
        cache_service.set("kanoon_cache", key, api_result, ttl_days=90)
        return api_result

    raise Exception(f"Case {doc_id} could not be retrieved from any source.")

async def get_cites(doc_id: str) -> dict:
    key = _cache_key("cites_v3", doc_id)

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
    return await search_judgments(query=judge_name, page=page)
