import httpx
import re
import asyncio
from bs4 import BeautifulSoup
from typing import Optional, List, Dict, Any
import structlog

log = structlog.get_logger()

JUDIS_BASE = "https://judis.nic.in"

# JUDIS is old government HTML — these headers are enough
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-IN,en-US;q=0.9,en;q=0.8",
}


class JudisScraper:

    def __init__(self):
        self.client = httpx.AsyncClient(
            headers=HEADERS,
            timeout=httpx.Timeout(8.0, connect=4.0), # Fail fast if unreachable
            follow_redirects=True,
            verify=False  # JUDIS has SSL cert issues sometimes
        )
        self._semaphore = asyncio.Semaphore(3)

    # ─────────────────────────────────────────
    # SEARCH
    # ─────────────────────────────────────────
    async def search(self, query: str, from_year: int = None,
                     to_year: int = None, page: int = 0) -> dict:
        """
        JUDIS search endpoint.
        Returns normalized results matching your existing search schema.
        """
        async with self._semaphore:
            try:
                url = f"{JUDIS_BASE}/supremecourt/chejudis.asp"
                params = {
                    "pjudgement": query,
                    "hfrom": str(from_year) if from_year else "1950",
                    "hto": str(to_year) if to_year else "2026",
                    "submit": "Go",
                }

                resp = await self.client.get(url, params=params)
                resp.raise_for_status()

                return self._parse_search(resp.text, query)

            except Exception as e:
                log.error("judis_search_failed", error=str(e), query=query)
                raise

    def _parse_search(self, html: str, query: str) -> dict:
        soup = BeautifulSoup(html, "lxml")
        results = []

        # JUDIS wraps results in a table — old school HTML
        result_table = soup.find("table", {"class": "case_det"}) or \
                       soup.find("table", width="95%")

        if not result_table:
            return {"results": [], "total": 0, "query": query}

        rows = result_table.find_all("tr")[1:]  # skip header row

        for row in rows:
            cells = row.find_all("td")
            if len(cells) < 3:
                continue

            # Extract link and doc ID
            link_tag = cells[0].find("a") or cells[1].find("a")
            if not link_tag:
                continue

            href = link_tag.get("href", "")
            doc_id = self._extract_doc_id(href)

            # JUDIS format: case name | date | bench
            title = cells[0].get_text(strip=True) or \
                    cells[1].get_text(strip=True)
            date = cells[-2].get_text(strip=True) \
                   if len(cells) >= 2 else ""
            bench = cells[-1].get_text(strip=True) \
                    if len(cells) >= 3 else ""

            if not doc_id or not title:
                continue

            results.append({
                "doc_id": f"judis_{doc_id}",
                "tid": f"judis_{doc_id}",
                "title": self._clean_text(title),
                "court": "Supreme Court of India",
                "date": date,
                "bench": bench,
                "headline": "",
                "source": "judis",
                "url": f"{JUDIS_BASE}/supremecourt/{href}"
            })

        return {
            "results": results,
            "total": len(results),
            "query": query,
            "source": "judis"
        }

    # ─────────────────────────────────────────
    # FULL DOCUMENT
    # ─────────────────────────────────────────
    async def get_document(self, doc_id: str) -> dict:
        """
        Fetch full judgment text from JUDIS.
        doc_id comes in as "judis_XXXXX" — strip prefix first.
        """
        raw_id = doc_id.replace("judis_", "")

        async with self._semaphore:
            try:
                url = f"{JUDIS_BASE}/supremecourt/jugement.aspx"
                params = {"filename": raw_id}

                resp = await self.client.get(url, params=params)
                resp.raise_for_status()

                return self._parse_document(resp.text, doc_id)

            except Exception as e:
                log.error("judis_doc_failed", 
                         error=str(e), doc_id=doc_id)
                raise

    def _parse_document(self, html: str, doc_id: str) -> dict:
        soup = BeautifulSoup(html, "lxml")

        # Title — usually in h2 or the first bold text
        title_tag = soup.find("h2") or soup.find("b")
        title = title_tag.get_text(strip=True) if title_tag else "Unknown"

        # JUDIS wraps judgment in div with id="judgment" 
        # or a large center-aligned table
        judgment_div = soup.find("div", {"id": "judgment"}) or \
                       soup.find("div", {"class": "judgment"})

        if judgment_div:
            full_text = judgment_div.get_text(separator="\n", strip=True)
        else:
            # Fallback — get all paragraph text
            paragraphs = soup.find_all("p")
            full_text = "\n".join(
                p.get_text(strip=True) 
                for p in paragraphs 
                if len(p.get_text(strip=True)) > 50
            )

        # Extract bench/judges
        bench = self._extract_bench(soup)

        # Extract date
        date = self._extract_date(full_text)

        # Extract citations from text
        citations = self._extract_citations(full_text)

        return {
            "doc_id": doc_id,
            "tid": doc_id,
            "title": self._clean_text(title),
            "court": "Supreme Court of India",
            "date": date,
            "bench": bench,
            "full_text": full_text,
            "doc": full_text, # Standard field for frontend
            "cited_cases": citations,
            "source": "judis",
            "source_url": f"{JUDIS_BASE}/supremecourt/jugement.aspx"
                         f"?filename={doc_id.replace('judis_', '')}"
        }

    # ─────────────────────────────────────────
    # CITATIONS (extracted from text)
    # ─────────────────────────────────────────
    def _extract_citations(self, text: str) -> list:
        """
        Extract Indian legal citations directly from judgment text.
        No external API needed.
        """
        citations = []
        seen = set()

        patterns = [
            # (1994) 2 SCC 694
            r'\((\d{4})\)\s+\d+\s+SCC\s+\d+',
            # AIR 1952 SC 196
            r'AIR\s+\d{4}\s+SC\s+\d+',
            # 1959 SCR 629
            r'\d{4}\s+SCR\s+\d+',
            # [2017] 10 SCC 1
            r'\[\d{4}\]\s+\d+\s+SCC\s+\d+',
        ]

        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if match not in seen:
                    seen.add(match)
                    citations.append({
                        "citation": match,
                        "doc_id": None  # resolve later if needed
                    })

        return citations[:30]  # cap at 30 citations

    # ─────────────────────────────────────────
    # HELPERS
    # ─────────────────────────────────────────
    def _extract_doc_id(self, href: str) -> Optional[str]:
        # JUDIS hrefs look like: jugement.aspx?filename=12345
        match = re.search(r'filename=([^&]+)', href, re.IGNORECASE)
        return match.group(1) if match else None

    def _extract_bench(self, soup: BeautifulSoup) -> str:
        # Look for judge names near top of document
        for tag in soup.find_all(["b", "strong"])[:20]:
            text = tag.get_text(strip=True)
            if "HON" in text.upper() or "JUSTICE" in text.upper():
                return text
        return ""

    def _extract_date(self, text: str) -> str:
        # Match dates like "12 January 2023" or "12/01/2023"
        match = re.search(
            r'\b(\d{1,2})\s+(January|February|March|April|May|June|'
            r'July|August|September|October|November|December)\s+(\d{4})\b',
            text
        )
        if match:
            return match.group(0)
        return ""

    def _clean_text(self, text: str) -> str:
        return re.sub(r'\s+', ' ', text).strip()

    async def close(self):
        await self.client.aclose()


# Singleton
judis_scraper = JudisScraper()
