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

    key = _cache_key("search_judis", query, court, from_year, to_year, page)

    cached = cache_service.get("kanoon_cache", key)
    if cached:
        return cached

    # JUDIS is primary — no fallback needed, no API key needed
    result = await judis_scraper.search(
        query=query,
        from_year=from_year,
        to_year=to_year,
        page=page
    )

    cache_service.set("kanoon_cache", key, result, ttl_days=7)
    return result


async def get_doc_details(doc_id: str) -> dict:
    key = _cache_key("doc_judis", doc_id)

    cached = cache_service.get("kanoon_cache", key)
    if cached:
        return cached

    result = await judis_scraper.get_document(doc_id)

    # Judgments never change — cache 90 days
    cache_service.set("kanoon_cache", key, result, ttl_days=90)
    return result


async def get_cites(doc_id: str) -> dict:
    key = _cache_key("cites_judis", doc_id)

    cached = cache_service.get("kanoon_cache", key)
    if cached:
        return cached

    # Get the doc and extract citations from its text
    doc = await get_doc_details(doc_id)
    result = {
        "doc_id": doc_id,
        "tid": doc_id,
        "cites": doc.get("cited_cases", []),
        "cited_by": []  # JUDIS doesn't provide this — future work
    }

    cache_service.set("kanoon_cache", key, result, ttl_days=30)
    return result

async def get_citedby(doc_id: str) -> dict:
    # JUDIS doesn't provide back-references easily via scraping
    return {"results": []}

async def get_doc_meta(doc_id: str) -> dict:
    # Minimal meta for search cards
    doc = await get_doc_details(doc_id)
    return {
        "doc_id": doc.get("doc_id"),
        "tid": doc.get("tid"),
        "title": doc.get("title"),
        "court": doc.get("court"),
        "date": doc.get("date"),
    }

async def search_by_judge(judge_name: str, page: int = 0) -> dict:
    # Use JUDIS search with judge name
    return await search_judgments(query=judge_name, page=page)
