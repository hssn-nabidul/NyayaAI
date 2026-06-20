from services.kanoon_api import kanoon_api_search, kanoon_api_get_document
from services.cache import cache_service
from services.citation_extractor import extract_citations, extract_citator_info, case_names_from_citations
import hashlib
import json
import structlog
from typing import Dict, Any
import re

log = structlog.get_logger()

def _cache_key(*args) -> str:
    raw = "|".join(str(a) for a in args)
    return hashlib.md5(raw.encode()).hexdigest()

async def search_judgments(query: str, court: str = None,
                           from_year: int = None,
                           to_year: int = None,
                           page: int = 0) -> dict:
    """
    Search judgments via Indian Kanoon API (primary and only source).
    Results are cached for 7 days.
    """
    key = _cache_key("search_v5_ik", query, court, from_year, to_year, page)

    cached = cache_service.get("kanoon_cache", key)
    if cached:
        return cached

    log.info("search_ik_api_start", query=query)
    api_result = await kanoon_api_search(query, page=page)
    
    if api_result.get("results"):
        cache_service.set("kanoon_cache", key, api_result, ttl_days=7)
        return api_result

    return {"results": [], "total": 0, "query": query, "source": "none"}

async def get_doc_details(doc_id: str) -> dict:
    """
    Fetch full judgment text via Indian Kanoon API (primary and only source).
    Results are cached for 90 days.
    """
    key = _cache_key("doc_v5_ik", doc_id)

    cached = cache_service.get("kanoon_cache", key)
    if cached:
        return cached

    api_result = await kanoon_api_get_document(doc_id)
    if api_result:
        api_result["tid"] = doc_id
        api_result["doc_id"] = doc_id
        if "doc" not in api_result and "full_text" in api_result:
            api_result["doc"] = api_result["full_text"]
            
        cache_service.set("kanoon_cache", key, api_result, ttl_days=90)
        return api_result

    raise Exception(f"Case {doc_id} could not be retrieved from Indian Kanoon API.")

async def get_cites(doc_id: str) -> dict:
    """
    Extract citations from the judgment text using regex patterns.
    Falls back to the API's cited_cases field if available, but primarily
    parses the judgment text directly for SCC, AIR, SCR citations.
    """
    key = _cache_key("cites_v5_text", doc_id)

    cached = cache_service.get("kanoon_cache", key)
    if cached:
        return cached

    doc = await get_doc_details(doc_id)
    
    # 1. Try to extract citations from the judgment text (primary)
    doc_text = doc.get("doc", "") or doc.get("full_text", "") or ""
    text_citations = []
    if doc_text and len(doc_text) > 200:
        raw_citations = extract_citations(doc_text)
        # Enhance with known case names
        text_citations = case_names_from_citations(raw_citations)
    
    # 2. Also include any cited_cases from the API response (secondary)
    api_cited = doc.get("cited_cases", []) or []
    
    # Merge: prefer text-extracted, add API citations if they have doc_ids
    merged = list(text_citations)
    seen_citations = {c.get("citation", "") for c in merged}
    
    for api_c in api_cited:
        cit_str = api_c.get("citation", "") or api_c.get("title", "")
        if cit_str and cit_str not in seen_citations:
            seen_citations.add(cit_str)
            merged.append({
                "citation": cit_str,
                "year": api_c.get("year"),
                "type": "api",
                "doc_id": api_c.get("doc_id"),
                "title": api_c.get("title", ""),
            })

    result = {
        "doc_id": doc_id,
        "tid": doc_id,
        "results": merged,  # Changed from "cites" to "results" for consistency
        "total": len(merged),
        "source": "text_extraction"
    }

    cache_service.set("kanoon_cache", key, result, ttl_days=30)
    return result

async def get_citedby(doc_id: str) -> dict:
    """
    Extract cases that cited this judgment from the CITATOR INFO section.
    The CITATOR INFO section in Indian Kanoon documents lists subsequent
    cases that have cited this judgment.
    """
    key = _cache_key("citedby_v1_citator", doc_id)

    cached = cache_service.get("kanoon_cache", key)
    if cached:
        return cached

    doc = await get_doc_details(doc_id)
    doc_text = doc.get("doc", "") or doc.get("full_text", "") or ""

    citator_entries = []
    if doc_text and len(doc_text) > 200:
        raw = extract_citator_info(doc_text)
        for entry in raw:
            # Generate hash-based tid so the citations endpoint can use it
            cit = entry.get("citation", "")
            entry["tid"] = f"cit_{hash(cit) & 0xFFFFFF:06x}"
            citator_entries.append(entry)

    result = {
        "results": citator_entries,
        "total": len(citator_entries),
        "source": "citator_info"
    }

    cache_service.set("kanoon_cache", key, result, ttl_days=30)
    return result

async def get_doc_meta(doc_id: str) -> dict:
    doc = await get_doc_details(doc_id)
    return {
        "doc_id": doc.get("doc_id"),
        "tid": doc.get("tid"),
        "title": doc.get("title"),
        "court": doc.get("court"),
        "date": doc.get("date"),
    }

def _normalize_judge_name(raw: str) -> str:
    """
    Strip honorifics/prefices from a judge name for API querying.
    
    The Indian Kanoon API stores author names without prefixes like "Justice"
    or "Hon'ble". E.g. "Justice D.Y. Chandrachud" → "D.Y. Chandrachud".
    """
    honorifics = [
        r'^Justice\s+',
        r"^Hon'ble\s+",
        r'^Honourable\s+',
        r'^Mr\.?\s+',
        r'^Mrs\.?\s+',
        r'^Ms\.?\s+',
        r'^Shri\s+',
        r'^Smt\.?\s+',
        r'^Dr\.?\s+',
    ]
    name = raw.strip()
    for pattern in honorifics:
        name = re.sub(pattern, '', name, count=1, flags=re.IGNORECASE)
    return name.strip()


async def search_by_judge(judge_name: str, page: int = 0) -> dict:
    """
    Search for judgments authored by a specific judge via Indian Kanoon API.
    
    Automatically strips honorifics (e.g. "Justice") so the API finds matching
    records — the Indian Kanoon API stores author names without prefixes.
    CACHED BY INPUT HASH: Same judge name returns cached results with zero cost.
    """
    clean_name = _normalize_judge_name(judge_name)
    if not clean_name:
        clean_name = judge_name.strip()  # fallback: use the original name as-is
    query = f'author:{clean_name}'
    return await search_judgments(query=query, page=page)
