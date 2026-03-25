import httpx
import os
import re
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from pathlib import Path
from services.cache import cache_service
from engine.search import search_internal_cases
from engine.database import SessionLocal
from engine.models import InternalJudgment
import hashlib
import json
import structlog
import asyncio
from services.scraper import scraper_client

logger = structlog.get_logger()

# Get the absolute path to the .env file in the backend directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

KANOON_API_TOKEN = os.getenv("KANOON_API_TOKEN")

# Mapping of our court codes to Indian Kanoon doctypes
COURT_MAPPING = {
    "supremecourt": "supremecourt",
    "delhi": "delhi",
    "bombay": "bombay",
    "madras": "madras",
    "karnataka": "karnataka",
    "allahabad": "allahabad",
    "calcutta": "calcutta",
    "gujarat": "gujarat",
    "rajasthan": "rajasthan",
    "punjab": "punjab",
    "madhyapradesh": "madhyapradesh",
    "kerala": "kerala",
    "andhra": "andhra",
}

def _extract_citation(doc: Dict[str, Any]) -> str:
    """Extract citation from various fields or construct one as a fallback."""
    citation = doc.get("citation") or doc.get("cite") or doc.get("docsource_citation")
    if citation: return citation

    title = doc.get("title", "")
    citation_patterns = [
        r"\(\d{4}\)\s+\d+\s+\w+\s+\d+", # (2017) 4 SCC 225
        r"\d{4}\s+\(\d+\)\s+\w+\s+\d+", # 2017 (4) SCC 225
        r"AIR\s+\d{4}\s+\w+\s+\d+",    # AIR 2017 SC 4161
        r"\d{4}\s+INSC\s+\d+",         # 2023 INSC 123
    ]
    for pattern in citation_patterns:
        match = re.search(pattern, title)
        if match: return match.group(0)

    court = doc.get("docsource") or "Court"
    date_str = doc.get("date")
    year = "n.d."
    if date_str:
        try: year = date_str.split("-")[0]
        except: pass
    elif "(" in title and ")" in title:
        year_match = re.search(r"\((\d{4})\)", title)
        if year_match: year = year_match.group(1)

    return f"{court} ({year})"

async def search_judgments(
    query: str, 
    court: str = "all",
    pagenum: int = 0, 
    fromdate: Optional[str] = None, 
    todate: Optional[str] = None,
    sortby: str = "relevance"
) -> Dict[str, Any]:
    """Search Indian Kanoon, prioritized by internal local store."""
    logger.info("search_judgments_start", query=query)
    
    # 1. Search Internal Store First
    internal_results = []
    try:
        limit = 10
        offset = pagenum * limit
        raw_internal = search_internal_cases(query, court=court, limit=limit, offset=offset)
        logger.info("internal_search_results", query=query, count=len(raw_internal))
        
        for r in raw_internal:
            title = r["title"]
            if not title or title.lower() in ["unknown", "unknown title", "null"]:
                continue
            
            if "Auto-Scraped Case" in title:
                title = title.replace("Auto-Scraped Case", "Case").strip()

            internal_results.append({
                "doc_id": r["case_id"], 
                "tid": r["case_id"],
                "title": title,
                "court": r["court"],
                "docsource": r["court"],
                "date": r["date"],
                "headline": "", 
                "citation": r.get("case_id"), 
                "is_internal": True
            })
    except Exception as e:
        logger.error("internal_search_failed", error=str(e))

    # 2. Build Form Input for Scraper/API
    form_input = query
    if court != "all" and court in COURT_MAPPING:
        form_input += f" doctypes: {COURT_MAPPING[court]}"
    if fromdate: form_input += f" fromdate: {fromdate}"
    if todate: form_input += f" todate: {todate}"
    
    cache_key_raw = f"search_v2|{form_input}|{pagenum}"
    cache_key = hashlib.md5(cache_key_raw.encode()).hexdigest()
    
    cached = cache_service.get("kanoon_cache", cache_key)
    
    # 3. Get Scraper/API Results (if not cached)
    scraper_results = []
    ik_total = 0
    if cached:
        scraper_results = cached.get("results", [])
        ik_total = cached.get("total", 0)
    else:
        try:
            # Now handles automatic API fallback internally
            scraper_result = await scraper_client.search(form_input, page=pagenum)
            scraper_results = scraper_result.get("results", [])
            ik_total = scraper_result.get("total", 0)
            
            for r in scraper_results:
                if not r.get("citation"):
                    r["citation"] = _extract_citation(r)
                    
            cache_service.set("kanoon_cache", cache_key, {"results": scraper_results, "total": ik_total}, ttl_days=7)
        except Exception as e:
            logger.error("external_search_failed", error=str(e))

    # 4. Merge and Deduplicate
    seen_ids = set()
    final_results = []

    for r in scraper_results:
        tid = str(r.get("doc_id", ""))
        if not tid: continue
        
        seen_ids.add(tid)
        seen_ids.add(f"IK-{tid}")
        if tid.startswith("IK-"):
            seen_ids.add(tid.replace("IK-", ""))
            
        final_results.append(r)

    for r in internal_results:
        internal_id = str(r["doc_id"])
        if internal_id in seen_ids:
            continue
            
        if r["title"].startswith("Case ") or r["court"].lower() == "unknown court":
            continue
            
        seen_ids.add(internal_id)
        final_results.append(r)

    return {
        "results": final_results, 
        "total": max(ik_total, len(final_results)), 
        "page": pagenum
    }

async def get_doc_details(docid: str) -> Dict[str, Any]:
    """Fetch full judgment text with JIT ingestion and automatic API fallback."""
    # 1. Check Internal Store first
    db = SessionLocal()
    internal = None
    try:
        internal = db.query(InternalJudgment).filter(
            (InternalJudgment.case_id == docid) | 
            (InternalJudgment.case_id == f"IK-{docid}")
        ).first()

        if not internal:
            ik_url = f"https://indiankanoon.org/doc/{docid}/"
            internal = db.query(InternalJudgment).filter(
                InternalJudgment.source_url == ik_url
            ).first()

        if internal:
            title = internal.title
            if not title or "Auto-Scraped Case" in title or title.startswith("Case "):
                logger.info("internal_low_quality_title_refetch", doc_id=docid, title=title)
            else:
                return {
                    "tid": internal.case_id,
                    "doc_id": internal.case_id,
                    "title": internal.title,
                    "docsource": internal.court,
                    "court": internal.court,
                    "date": internal.decision_date.strftime("%Y-%m-%d"),
                    "doc": internal.content_raw,
                    "full_text": internal.content_raw,
                    "author": internal.bench,
                    "bench": internal.bench,
                    "citation": internal.case_id,
                    "is_internal": True
                }
    except Exception as e:
        logger.error("internal_check_failed", error=str(e))
    finally:
        db.close()

    # 2. Check simple cache
    cache_key = hashlib.md5(f"doc_v4|{docid}".encode()).hexdigest()
    cached = cache_service.get("kanoon_cache", cache_key)
    if cached:
        return cached

    # 3. Trigger JIT Scraper (with automatic API fallback)
    try:
        result = await scraper_client.get_document(docid)
        if not result.get("citation"):
            result["citation"] = _extract_citation(result)
            
        cache_service.set("kanoon_cache", cache_key, result, ttl_days=30)
        
        # Trigger background internal DB ingestion
        from engine.scrapers.supreme_court import SupremeCourtScraper
        import threading
        def background_ingest():
            try:
                scraper = SupremeCourtScraper()
                scraper.process_case(f"IK-{docid}", f"https://indiankanoon.org/doc/{docid}/", result.get("title", f"Case {docid}"))
            except Exception as e:
                logger.error("background_ingest_failed", error=str(e))
        threading.Thread(target=background_ingest, daemon=True).start()

        return result
    except Exception as e:
        logger.error("jit_retrieval_failed", docid=docid, error=str(e))
        raise Exception(f"Case {docid} could not be retrieved from the archives.")

async def get_doc_meta(docid: str) -> Dict[str, Any]:
    """Fetch metadata with internal store and API fallback support."""
    db = SessionLocal()
    try:
        internal = db.query(InternalJudgment).filter(
            (InternalJudgment.case_id == docid) | 
            (InternalJudgment.case_id == f"IK-{docid}")
        ).first()
        if internal:
            return {
                "tid": internal.case_id,
                "doc_id": internal.case_id,
                "title": internal.title,
                "docsource": internal.court,
                "court": internal.court,
                "date": internal.decision_date.strftime("%Y-%m-%d"),
                "citation": internal.case_id,
                "is_internal": True
            }
    except Exception as e:
        logger.error("internal_meta_failed", error=str(e))
    finally:
        db.close()

    cached = cache_service.get("kanoon_cache", f"meta_{docid}")
    if cached: return cached

    if KANOON_API_TOKEN:
        try:
            data = await scraper_client.get_api_docmeta(docid)
            cache_service.set("kanoon_cache", f"meta_{docid}", data, ttl_days=30)
            return data
        except Exception as e:
            logger.error("api_meta_fallback_failed", docid=docid, error=str(e))

    return {}

def _extract_author(doc_data: Dict[str, Any]) -> Optional[str]:
    author = doc_data.get("author") or doc_data.get("authorstr") or doc_data.get("judge")
    if author: return author
    doc_html = doc_data.get("doc", "")
    if doc_html:
        author_match = re.search(r'class="doc_author">Author:\s*<[^>]+>([^<]+)</a>', doc_html)
        if author_match: return author_match.group(1).strip()
        pre_match = re.search(r'AUTHOR:\s*([^\n<]+)', doc_html, re.IGNORECASE)
        if pre_match: return pre_match.group(1).strip()
        bench_match = re.search(r'BENCH:\s*([^\n<]+)', doc_html, re.IGNORECASE)
        if bench_match:
            names = bench_match.group(1).split(",")
            if names: return names[0].strip()
    return None

async def _fetch_cites_graph(docid: str) -> Dict[str, Any]:
    cache_key = hashlib.md5(f"cites_graph_v3|{docid}".encode()).hexdigest()
    cached = cache_service.get("kanoon_cache", cache_key)
    if cached:
        return cached
        
    try:
        result = await scraper_client.get_citations(docid)
        logger.info("scraper_cites_result", doc_id=docid, cites=len(result.get("cites", [])), cited_by=len(result.get("cited_by", [])))
        cache_service.set("kanoon_cache", cache_key, result, ttl_days=14)
        return result
    except Exception as e:
        logger.error("scraper_cites_failed", error=str(e))
        return {"doc_id": docid, "cites": [], "cited_by": []}

async def get_cites(docid: str) -> Dict[str, Any]:
    graph = await _fetch_cites_graph(docid)
    return {"results": graph.get("cites", [])}

async def get_citedby(docid: str) -> Dict[str, Any]:
    graph = await _fetch_cites_graph(docid)
    return {"results": graph.get("cited_by", [])}

async def search_by_judge(judge_name: str, pagenum: int = 0) -> Dict[str, Any]:
    """Search for judgments by a specific judge."""
    query = f"author: {judge_name}"
    results = await search_judgments(query=query, pagenum=pagenum)
    
    if not results.get("results") or results.get("total") == 0:
        simplified = " ".join([p for p in judge_name.replace(".", "").split() if len(p) > 1])
        if simplified != judge_name:
            logger.info("retry_simplified_judge_search", original=judge_name, simplified=simplified)
            query = f"author: {simplified}"
            results = await search_judgments(query=query, pagenum=pagenum)
            
    if not results.get("results") or results.get("total") == 0:
        logger.info("retry_keyword_judge_search", judge=judge_name)
        results = await search_judgments(query=judge_name, pagenum=pagenum)
        
    return results
