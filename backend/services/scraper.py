import httpx
from bs4 import BeautifulSoup
import asyncio
import re
import os
from typing import Optional, Tuple, List, Dict, Any
from tenacity import retry, stop_after_attempt, wait_exponential
import structlog
from pathlib import Path
from dotenv import load_dotenv

logger = structlog.get_logger()

# Load environment for local dev if needed
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "max-age=0",
}

SCRAPE_BASE_URL = "https://indiankanoon.org"
API_BASE_URL = "https://api.indiankanoon.org"


class NyayaScraper:
    def __init__(self, api_token: Optional[str] = None):
        self.client = httpx.AsyncClient(
            headers=HEADERS,
            timeout=20.0,
            follow_redirects=True,
            verify=False
        )
        self._semaphore = asyncio.Semaphore(3)
        self.api_token = api_token or os.getenv("KANOON_API_TOKEN")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=8)
    )
    async def _fetch_with_retry(self, url: str, params: Optional[Dict[str, Any]] = None):
        async with self._semaphore:
            logger.info("scraper_fetch_start", url=url)
            resp = await self.client.get(url, params=params)
            
            if resp.status_code >= 400:
                body_snippet = resp.text[:500]
                logger.error("scraper_http_error", 
                             status_code=resp.status_code, 
                             url=str(resp.url),
                             body=body_snippet)
            
            if resp.status_code == 429:
                retry_after = int(resp.headers.get("Retry-After", 5))
                logger.warning("scraper_rate_limited", retry_after=retry_after)
                await asyncio.sleep(retry_after)
                raise Exception(f"Rate limited (429), retrying after {retry_after}s")
            
            resp.raise_for_status()
            return resp

    async def search(self, form_input: str, page: int = 0) -> dict:
        """Search indiankanoon.org with automatic API fallback."""
        try:
            # 1. Try Scraper first
            url = f"{SCRAPE_BASE_URL}/search/"
            params = {
                "formInput": form_input,
                "pagenum": page
            }
            
            resp = await self._fetch_with_retry(url, params=params)
            soup = BeautifulSoup(resp.text, "lxml")
            
            results = []
            result_items = soup.select(".result")
                
            for result_div in result_items:
                title_tag = result_div.select_one(".result_title a")
                if not title_tag:
                    continue
                
                doc_url = title_tag.get("href", "")
                doc_id = self._extract_doc_id(doc_url)
                
                headline = result_div.select_one(".headline")
                snippet = headline.get_text(strip=True) if headline else ""
                
                meta = result_div.select_one(".hlbottom") or result_div.select_one(".docsource_main")
                court, date_str = self._parse_meta(meta)
                
                title_text = ""
                for content in title_tag.contents:
                    title_text += content.get_text(strip=True) + " "
                title_text = " ".join(title_text.split())
                
                results.append({
                    "doc_id": doc_id,
                    "tid": doc_id,
                    "title": title_text,
                    "headline": snippet[:500],
                    "court": court,
                    "docsource": court,
                    "date": date_str,
                    "url": f"{SCRAPE_BASE_URL}{doc_url}",
                    "is_internal": False
                })
            
            total_tag = soup.select_one("div#search_stats")
            total = self._parse_total(total_tag)
            
            return {
                "results": results,
                "total": total,
                "page": page,
                "query": form_input,
                "source": "scraper"
            }
        except Exception as e:
            logger.error("scraper_search_failed", error=str(e))
            
            # 2. Fallback to API if scraper fails and token is available
            if self.api_token:
                logger.info("api_search_fallback_trigger", query=form_input)
                try:
                    return await self.get_api_search(form_input, page)
                except Exception as api_e:
                    logger.error("api_search_fallback_failed", error=str(api_e))
                    raise api_e
            
            raise e

    async def get_document(self, doc_id: str) -> dict:
        """Fetch document with automatic API fallback."""
        try:
            url = f"{SCRAPE_BASE_URL}/doc/{doc_id}/"
            resp = await self._fetch_with_retry(url)
            soup = BeautifulSoup(resp.text, "lxml")
            
            title = soup.select_one(".doc_title")
            title_text = title.get_text(strip=True) if title else "Unknown"
            
            doc_source = soup.select_one(".docsource_main")
            court, date = self._parse_meta(doc_source)
            
            author = soup.select_one("div.doc_author")
            bench = author.get_text(strip=True) if author else ""
            if bench.lower().startswith("author:"):
                bench = bench[7:].strip()
                
            judgment_div = soup.select_one("div#judgments") or soup.select_one("div.judgments")
            
            if judgment_div:
                for a_tag in judgment_div.find_all("a"):
                    a_tag.replace_with(a_tag.get_text())
                full_text = judgment_div.get_text(separator="\n", strip=True)
                raw_html = str(judgment_div)
            else:
                full_text = ""
                raw_html = soup.get_text(separator="\n", strip=True)
                logger.warning("scraper_missing_judgments_div", doc_id=doc_id)
            
            cites = self._extract_cited_cases(soup)
            
            return {
                "tid": doc_id,
                "doc_id": doc_id,
                "title": title_text,
                "court": court,
                "docsource": court,
                "date": date,
                "author": bench,
                "bench": bench,
                "full_text": full_text,
                "doc": raw_html,
                "cited_cases": cites,
                "source_url": url,
                "is_internal": False,
                "source": "scraper"
            }
        except Exception as e:
            logger.error("scraper_doc_failed", doc_id=doc_id, error=str(e))
            if self.api_token:
                logger.info("api_doc_fallback_trigger", doc_id=doc_id)
                try:
                   return await self.get_api_document(doc_id)
                except Exception as api_e:
                    logger.error("api_doc_fallback_failed", error=str(api_e))
                    raise api_e
            raise e

    async def get_api_search(self, form_input: str, page: int = 0) -> dict:
        """Search via Indian Kanoon API."""
        url = f"{API_BASE_URL}/search/"
        headers = {"Authorization": f"Token {self.api_token}"}
        params = {"formInput": form_input, "pagenum": page}
        resp = await self.client.post(url, headers=headers, params=params)
        resp.raise_for_status()
        data = resp.json()
        data["source"] = "api"
        return data

    async def get_api_document(self, doc_id: str) -> dict:
        """Fetch document via Indian Kanoon API."""
        url = f"{API_BASE_URL}/doc/{doc_id}/"
        headers = {"Authorization": f"Token {self.api_token}"}
        resp = await self.client.post(url, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        data["source"] = "api"
        return data

    async def get_api_docmeta(self, doc_id: str) -> dict:
        """Fetch docmeta via Indian Kanoon API."""
        url = f"{API_BASE_URL}/docmeta/{doc_id}/"
        headers = {"Authorization": f"Token {self.api_token}"}
        resp = await self.client.post(url, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        data["source"] = "api"
        return data

    async def get_citations(self, doc_id: str) -> dict:
        """Scrape citation graphs via search"""
        cites_url = f"{SCRAPE_BASE_URL}/search/"
        cited_by_url = f"{SCRAPE_BASE_URL}/search/"
        
        cites_resp, cited_by_resp = await asyncio.gather(
            self._fetch_with_retry(cites_url, params={"formInput": f"cites:{doc_id}"}),
            self._fetch_with_retry(cited_by_url, params={"formInput": f"citedby:{doc_id}"}),
            return_exceptions=True
        )
        
        cites = []
        cited_by = []
        
        if not isinstance(cites_resp, Exception):
            cites = self._parse_citation_results(BeautifulSoup(cites_resp.text, "lxml"))
            
        if not isinstance(cited_by_resp, Exception):
            cited_by = self._parse_citation_results(BeautifulSoup(cited_by_resp.text, "lxml"))
            
        return {
            "doc_id": doc_id,
            "cites": cites,
            "cited_by": cited_by
        }

    def _extract_doc_id(self, href: str) -> str:
        match = re.search(r'/(?:doc|docfragment)/(\d+)/', href)
        return match.group(1) if match else href

    def _parse_meta(self, meta_tag) -> Tuple[str, str]:
        if not meta_tag:
            return "Unknown Court", ""
        
        text = meta_tag.get_text(strip=True)
        
        if "Cites" in text or "Cited by" in text:
            court_part = text.split("Cites")[0].split("Cited by")[0].strip()
            date_match = re.search(r"on\s+(\d{1,2}\s+\w+,\s+\d{4})", text)
            date = date_match.group(1) if date_match else ""
            return court_part or "Unknown Court", date
            
        if "|" in text:
            parts = text.split("|")
            court = parts[0].strip()
            date = parts[1].strip() if len(parts) > 1 else ""
            return court, date
            
        return text or "Unknown Court", ""

    def _parse_total(self, tag) -> int:
        if not tag:
            return 0
        text = tag.get_text()
        match = re.search(r'([\d,]+)\s+result', text)
        if match:
            return int(match.group(1).replace(",", ""))
        return 0

    def _extract_cited_cases(self, soup) -> List[Dict[str, str]]:
        cited = []
        for link in soup.select("div#judgments a[href*='/doc/'], div#judgments a[href*='/docfragment/']"):
            doc_id = self._extract_doc_id(link.get("href", ""))
            title = link.get_text(strip=True)
            if doc_id and title:
                cited.append({"doc_id": doc_id, "title": title})
        return cited

    def _parse_citation_results(self, soup) -> List[Dict[str, str]]:
        results = []
        for div in soup.select(".result")[:20]:
            title_tag = div.select_one(".result_title a")
            if title_tag:
                doc_id = self._extract_doc_id(title_tag.get("href", ""))
                title_text = ""
                for content in title_tag.contents:
                    title_text += content.get_text(strip=True) + " "
                title_text = " ".join(title_text.split())
                results.append({"doc_id": doc_id, "title": title_text})
        return results

    async def close(self):
        await self.client.aclose()

# Singleton instance
scraper_client = NyayaScraper()
