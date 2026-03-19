import httpx
import os
import re
from typing import Dict, Any, Optional
from dotenv import load_dotenv

from pathlib import Path

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
    """
    Extract citation from various fields or construct one as a fallback.
    """
    # 1. Try direct citation fields
    citation = doc.get("citation") or doc.get("cite") or doc.get("docsource_citation")
    if citation:
        return citation

    title = doc.get("title", "")
    
    # 2. Try to extract from title (e.g., "Case Name (2020) 1 SCC 123")
    # Common patterns: (Year) Vol Reporter Page, Year (Vol) Reporter Page
    citation_patterns = [
        r"\(\d{4}\)\s+\d+\s+\w+\s+\d+", # (2017) 4 SCC 225
        r"\d{4}\s+\(\d+\)\s+\w+\s+\d+", # 2017 (4) SCC 225
        r"AIR\s+\d{4}\s+\w+\s+\d+",    # AIR 2017 SC 4161
        r"\d{4}\s+INSC\s+\d+",         # 2023 INSC 123
    ]
    
    for pattern in citation_patterns:
        match = re.search(pattern, title)
        if match:
            return match.group(0)

    # 3. Last resort: Court + Year
    court = doc.get("docsource") or "Court"
    date_str = doc.get("date")
    year = "n.d."
    if date_str:
        try:
            # Indian Kanoon usually returns YYYY-MM-DD
            year = date_str.split("-")[0]
        except Exception as e:
            import structlog
            logger = structlog.get_logger()
            logger.warning("kanoon_parse_failed", error=str(e))
    elif "(" in title and ")" in title:
        # Try to find a 4-digit year in parentheses in the title
        year_match = re.search(r"\((\d{4})\)", title)
        if year_match:
            year = year_match.group(1)

    return f"{court} ({year})"

async def search_judgments(
    query: str, 
    court: str = "all",
    pagenum: int = 0, 
    fromdate: Optional[str] = None, 
    todate: Optional[str] = None,
    sortby: str = "relevance"
) -> Dict[str, Any]:
    """
    Search Indian Kanoon for judgments based on query and filters.
    Parses the raw response into a structured format for the frontend.
    """
    headers = {
        "Authorization": f"Token {KANOON_API_TOKEN}"
    }
    
    # Construct formInput with court filter if specified
    form_input = query
    if court != "all" and court in COURT_MAPPING:
        form_input += f" doctypes: {COURT_MAPPING[court]}"
    
    # Add date filters directly into formInput string as Indian Kanoon handles them there
    if fromdate:
        form_input += f" fromdate: {fromdate}"
    if todate:
        form_input += f" todate: {todate}"
    
    params = {
        "formInput": form_input,
        "pagenum": pagenum,
        "sortby": sortby
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(f"{BASE_URL}/search/", data=params, headers=headers)
            response.raise_for_status()
            raw_data = response.json()
            
            # 1. Extract results from "docs"
            docs = raw_data.get("docs", [])
            
            # 2. Map each doc to our SearchResult model with Deduplication
            mapped_results = []
            seen_ids = set()
            
            for doc in docs:
                tid = str(doc.get("tid"))
                if tid in seen_ids:
                    continue
                seen_ids.add(tid)
                
                # Fallback date extraction if 'date' field is null
                res_date = doc.get("date")
                if not res_date:
                    # Try to extract from title like "... on 2 December, 2010"
                    date_match = re.search(r"on\s+(\d{1,2}\s+\w+,\s+\d{4})", doc.get("title", ""))
                    if date_match:
                        # We'll keep it as a string for now, but this helps the frontend
                        res_date = date_match.group(1)
                
                mapped_results.append({
                    "doc_id": str(doc.get("tid")),
                    "title": doc.get("title", "").replace("<b>", "").replace("</b>", ""), # Clean bold tags in title
                    "court": doc.get("docsource"),
                    "date": res_date,
                    "headline": doc.get("headline", ""),
                    "citation": _extract_citation(doc)
                })
                
            # 3. Parse total field (e.g. "1 - 10 of 4886" -> 4886)
            # Some versions of the API return 'found' instead of 'total'
            raw_total = raw_data.get("total")
            if raw_total is None:
                raw_total = raw_data.get("found", "0")
            
            total_count = 0
            try:
                if isinstance(raw_total, str) and "of" in raw_total:
                    # Extract the number after "of"
                    parts = raw_total.split("of")
                    total_count = int(parts[-1].strip().replace(",", ""))
                else:
                    total_count = int(raw_total) if raw_total else 0
            except (ValueError, AttributeError, IndexError):
                total_count = len(mapped_results)

            return {
                "results": mapped_results,
                "total": total_count,
                "page": pagenum
            }
        except Exception as e:
            print(f"Search API failed: {e}")
            return {"results": [], "total": 0, "page": pagenum}

async def search_by_judge(judge_name: str, pagenum: int = 0) -> Dict[str, Any]:
    """
    Search judgments by a specific judge name.
    """
    query = f"author: {judge_name}"
    return await search_judgments(query=query, pagenum=pagenum)

def _extract_author(doc_data: Dict[str, Any]) -> Optional[str]:
    """
    Extract author/judge from metadata or from the doc HTML.
    """
    # 1. Check direct metadata fields
    author = doc_data.get("author") or doc_data.get("authorstr") or doc_data.get("judge")
    if author:
        return author

    # 2. Extract from HTML 'doc' field
    doc_html = doc_data.get("doc", "")
    if doc_html:
        # Pattern 1: <h3 class="doc_author">Author: ...</h3>
        author_match = re.search(r'class="doc_author">Author:\s*<[^>]+>([^<]+)</a>', doc_html)
        if author_match:
            return author_match.group(1).strip()
        
        # Pattern 2: AUTHOR: ... in preformatted text
        pre_match = re.search(r'AUTHOR:\s*([^\n<]+)', doc_html, re.IGNORECASE)
        if pre_match:
            return pre_match.group(1).strip()

        # Pattern 3: BENCH: ... then the first name is often the authoring judge
        bench_match = re.search(r'BENCH:\s*([^\n<]+)', doc_html, re.IGNORECASE)
        if bench_match:
            # Take the first name in the bench list
            names = bench_match.group(1).split(",")
            if names:
                return names[0].strip()

    return None

async def get_doc_details(docid: str) -> Dict[str, Any]:
    """
    Fetch full judgment text and metadata for a specific docid.
    """
    headers = {
        "Authorization": f"Token {KANOON_API_TOKEN}"
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(f"{BASE_URL}/doc/{docid}/", headers=headers)
        response.raise_for_status()
        data = response.json()
        
        # Ensure citation is present in the response
        if not data.get("citation"):
            # Try to get it from docmeta if missing in full doc
            meta = await get_doc_meta(docid)
            # Use the more robust extraction
            data["citation"] = _extract_citation(meta)
        
        # Extract author if missing
        if not data.get("author"):
            data["author"] = _extract_author(data)
            
        return data


async def get_doc_meta(docid: str) -> Dict[str, Any]:
    """
    Fetch ONLY metadata for a specific docid.
    """
    headers = {
        "Authorization": f"Token {KANOON_API_TOKEN}"
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(f"{BASE_URL}/docmeta/{docid}/", headers=headers)
        response.raise_for_status()
        return response.json()

async def get_cites(docid: str) -> Dict[str, Any]:
    """
    Fetch cases that this document cites using search filter.
    """
    return await search_judgments(query=f"cites: {docid}")

async def get_citedby(docid: str) -> Dict[str, Any]:
    """
    Fetch cases that cite this document using search filter.
    """
    return await search_judgments(query=f"citedby: {docid}")
