import httpx
import os
import re
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from pathlib import Path
from services.cache import cache_service

# Get the absolute path to the .env file in the backend directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

KANOON_API_TOKEN = os.getenv("KANOON_API_TOKEN")
BASE_URL = "https://api.indiankanoon.org"

# Mapping of our court codes to Indian Kanoon doctypes
COURT_MAPPING = {
    "SC": "supremecourt",
    "DHC": "delhi",
    "BHC": "bombay",
    "MHC": "madras",
    "KHC": "karnataka",
    "AHC": "allahabad",
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
    """Search Indian Kanoon."""
    headers = {"Authorization": f"Token {KANOON_API_TOKEN}"}
    form_input = query
    if court != "all" and court in COURT_MAPPING:
        form_input += f" doctypes: {COURT_MAPPING[court]}"
    if fromdate: form_input += f" fromdate: {fromdate}"
    if todate: form_input += f" todate: {todate}"
    
    params = {"formInput": form_input, "pagenum": pagenum, "sortby": sortby}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(f"{BASE_URL}/search/", data=params, headers=headers)
            response.raise_for_status()
            raw_data = response.json()
            docs = raw_data.get("docs", [])
            mapped_results = []
            seen_ids = set()
            for doc in docs:
                tid = str(doc.get("tid"))
                if tid in seen_ids: continue
                seen_ids.add(tid)
                res_date = doc.get("date")
                if not res_date:
                    date_match = re.search(r"on\s+(\d{1,2}\s+\w+,\s+\d{4})", doc.get("title", ""))
                    if date_match: res_date = date_match.group(1)
                
                mapped_results.append({
                    "doc_id": tid,
                    "title": doc.get("title", "").replace("<b>", "").replace("</b>", ""),
                    "court": doc.get("docsource"),
                    "date": res_date,
                    "headline": doc.get("headline", ""),
                    "citation": _extract_citation(doc)
                })
                
            raw_total = raw_data.get("total") or raw_data.get("found", "0")
            total_count = 0
            try:
                if isinstance(raw_total, str) and "of" in raw_total:
                    total_count = int(raw_total.split("of")[-1].strip().replace(",", ""))
                else:
                    total_count = int(raw_total) if raw_total else 0
            except:
                total_count = len(mapped_results)

            return {"results": mapped_results, "total": total_count, "page": pagenum}
        except Exception as e:
            print(f"Search API failed: {e}")
            return {"results": [], "total": 0, "page": pagenum}

async def get_doc_details(docid: str) -> Dict[str, Any]:
    """Fetch full judgment text with persistent caching."""
    cached = cache_service.get("kanoon_cache", f"doc_{docid}")
    if cached: return cached

    headers = {"Authorization": f"Token {KANOON_API_TOKEN}"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(f"{BASE_URL}/doc/{docid}/", headers=headers)
        response.raise_for_status()
        data = response.json()
        
        if not data.get("citation"):
            meta = await get_doc_meta(docid)
            data["citation"] = _extract_citation(meta)
        
        if not data.get("author"):
            data["author"] = _extract_author(data)
            
        cache_service.set("kanoon_cache", f"doc_{docid}", data, ttl_days=30)
        return data

async def get_doc_meta(docid: str) -> Dict[str, Any]:
    """Fetch ONLY metadata with persistent caching."""
    cached = cache_service.get("kanoon_cache", f"meta_{docid}")
    if cached: return cached

    headers = {"Authorization": f"Token {KANOON_API_TOKEN}"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(f"{BASE_URL}/docmeta/{docid}/", headers=headers)
        response.raise_for_status()
        data = response.json()
        cache_service.set("kanoon_cache", f"meta_{docid}", data, ttl_days=30)
        return data

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

async def get_cites(docid: str) -> Dict[str, Any]:
    return await search_judgments(query=f"cites: {docid}")

async def get_citedby(docid: str) -> Dict[str, Any]:
    return await search_judgments(query=f"citedby: {docid}")
