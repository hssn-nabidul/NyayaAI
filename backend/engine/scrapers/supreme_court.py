import re
import asyncio
import os
from datetime import datetime
from .base import BaseScraper
from services.gemini import extract_judgment_metadata

class SupremeCourtScraper(BaseScraper):
    """
    Scraper for the Supreme Court of India.
    Supports syncing from Indian Kanoon RSS feed and ingesting local PDF/HTML files.
    """
    def __init__(self):
        super().__init__(court_name="Supreme Court of India")

    def parse_metadata_robust(self, text: str) -> dict:
        """
        AI-augmented metadata extraction using Gemini.
        Falls back to heuristic parsing if AI fails or returns incomplete data.
        """
        try:
            # Check if we are already in an event loop (e.g. FastAPI)
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop and loop.is_running():
                # We are in FastAPI, we need to handle the coroutine differently
                # Since this scraper method is synchronous, we use a trick to run async in sync
                import nest_asyncio
                nest_asyncio.apply()
                meta = asyncio.run(extract_judgment_metadata(text))
            else:
                # Standard CLI execution
                meta = asyncio.run(extract_judgment_metadata(text))
            
            # Convert decision_date string to datetime object
            if meta.get("decision_date"):
                try:
                    meta["decision_date"] = datetime.strptime(meta["decision_date"], "%Y-%m-%d")
                except:
                    meta["decision_date"] = datetime.now()
            else:
                meta["decision_date"] = datetime.now()
            
            # If Gemini missed critical fields, try heuristic as fallback for those fields
            if not meta.get("case_id") or meta.get("case_id") == "Unknown ID":
                heuristic = self.parse_metadata_heuristic(text)
                meta["case_id"] = heuristic["case_id"]
                
            return meta
        except Exception as e:
            print(f"DEBUG: Gemini metadata extraction failed: {e}")
            return self.parse_metadata_heuristic(text)

    def parse_metadata_heuristic(self, text: str) -> dict:
        """
        Heuristic parsing of judgment text to extract metadata.
        Uses regex patterns common in Supreme Court judgments.
        """
        metadata = {
            "title": "Unknown Title",
            "bench": "Unknown Bench",
            "decision_date": datetime.now(),
            "case_id": "Unknown ID"
        }

        # 1. Extract Case ID (e.g., Civil Appeal No. 123 of 2024)
        case_id_pattern = r"(?:CIVIL|CRIMINAL)\s+(?:APPEAL|WRIT\s+PETITION)\s+(?:NO[.\s]+|NOS[.\s]+)(\d+\s+OF\s+\d{4})"
        case_id_match = re.search(case_id_pattern, text, re.IGNORECASE)
        if case_id_match:
            metadata["case_id"] = " ".join(case_id_match.group(0).split())

        # 2. Extract Date (e.g., March 23, 2026 or 23.03.2026)
        date_patterns = [
            r"Dated?:\s*([A-Z][a-z]+\s+\d{1,2},\s+\d{4})",
            r"(\d{1,2}[./-]\d{1,2}[./-]\d{4})",
            r"ON\s+([A-Z]+\s+\d{1,2},\s+\d{4})"
        ]
        for pattern in date_patterns:
            date_match = re.search(pattern, text, re.IGNORECASE)
            if date_match:
                date_str = date_match.group(1).replace('.', '-').replace('/', '-')
                try:
                    # Try a few formats
                    for fmt in ("%B %d, %Y", "%d-%m-%Y", "%Y-%m-%d"):
                        try:
                            metadata["decision_date"] = datetime.strptime(date_str, fmt)
                            break
                        except: continue
                except: pass
                break

        # 3. Extract Bench
        bench_pattern = r"CORAM:\s*([\w\s,.]+?)(?:\n|$|JUDGMENT)"
        bench_match = re.search(bench_pattern, text, re.IGNORECASE)
        if bench_match:
            metadata["bench"] = bench_match.group(1).strip()

        return metadata

    def process_case(self, case_id: str, source_url: str, title: str):
        """Process a single SCI case link."""
        try:
            # Download/Fetch the source
            response = self.client.get(source_url)
            if response.status_code != 200:
                print(f"Failed to fetch {source_url} (Status: {response.status_code})")
                return

            raw_text = ""
            if "application/pdf" in response.headers.get("Content-Type", "").lower():
                # It's a PDF - save to cache and extract
                filename = f"IK_{case_id.replace('IK-', '')}.pdf"
                path = os.path.join("backend", "cache", "judgments", filename)
                os.makedirs(os.path.dirname(path), exist_ok=True)
                with open(path, "wb") as f:
                    f.write(response.content)
                raw_text = self.extract_text_from_pdf(path)
            else:
                # It's HTML (Indian Kanoon default)
                raw_text = self.extract_text_from_html(response.text)
            
            if not raw_text or len(raw_text.strip()) < 100:
                print(f"WARNING: Extracted text too short for {case_id}")
                return

            # Enrich with AI Metadata
            meta = self.parse_metadata_robust(raw_text)
            
            # Prioritize original doc_id (IK-123) over heuristic case numbers (Civil Appeal...)
            # for the primary database key, to avoid "Unknown ID" or mismatch issues.
            final_case_id = case_id
            if not final_case_id or "Unknown" in str(final_case_id):
                final_case_id = meta.get("case_id") or f"UN-{datetime.now().timestamp()}"

            # Prioritize the title from search results (passed as 'title')
            # Only use AI/Heuristic title if the passed one is clearly a placeholder
            final_title = title
            if not title or title.lower() in ["unknown", "unknown title", "case detail"]:
                if meta.get("title") and meta.get("title").lower() != "unknown title":
                    final_title = meta.get("title")
            
            # If still unknown, use a better placeholder
            if not final_title or final_title.lower() == "unknown":
                final_title = f"Case {case_id}"

            judgment_data = {
                "case_id": final_case_id,
                "source_url": source_url,
                "title": final_title,
                "court": self.court_name,
                "decision_date": meta.get("decision_date") or datetime.now(),
                "content_raw": raw_text,
                "bench": meta.get("bench") or "Unknown Bench"
            }
            
            self.save_judgment(judgment_data)
            
        except Exception as e:
            print(f"Failed to process case {case_id}: {e}")

    def ingest_local_folder(self, folder_path: str):
        """Ingest all PDFs/HTMLs from a local folder."""
        if not os.path.exists(folder_path):
            print(f"Folder not found: {folder_path}")
            return

        for filename in os.listdir(folder_path):
            path = os.path.join(folder_path, filename)
            try:
                raw_text = ""
                if filename.endswith(".pdf"):
                    raw_text = self.extract_text_from_pdf(path)
                elif filename.endswith((".html", ".htm", ".txt")):
                    with open(path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        if filename.endswith(".txt"):
                            raw_text = content
                        else:
                            raw_text = self.extract_text_from_html(content)
                
                if not raw_text: continue

                meta = self.parse_metadata_robust(raw_text)
                
                judgment_data = {
                    "case_id": meta.get("case_id") or filename.split(".")[0],
                    "source_url": f"local://{filename}",
                    "title": meta.get("title") or filename.split(".")[0],
                    "court": self.court_name,
                    "decision_date": meta.get("decision_date") or datetime.now(),
                    "content_raw": raw_text,
                    "bench": meta.get("bench") or "Unknown Bench"
                }
                
                self.save_judgment(judgment_data)
            except Exception as e:
                print(f"Failed to ingest local file {filename}: {e}")

    def sync_latest_judgments(self):
        """
        Polls the Indian Kanoon RSS feed for the absolute latest SC judgments.
        """
        rss_url = "https://indiankanoon.org/feeds/latest/supremecourt/"
        print(f"NYAYA ENGINE: Synchronizing with latest feed at {rss_url}...")

        try:
            response = self.client.get(rss_url)
            if response.status_code != 200:
                print(f"NYAYA ENGINE: Feed synchronization failed (Status: {response.status_code})")
                return

            from bs4 import BeautifulSoup
            soup = BeautifulSoup(response.text, 'xml')
            
            items = soup.find_all('item')
            new_cases_found = 0

            for item in items:
                title_tag = item.find('title')
                link_tag = item.find('link')
                
                if not title_tag or not link_tag: continue

                title = title_tag.get_text(strip=True)
                link = link_tag.get_text(strip=True)
                
                # Extract Doc ID from link
                doc_id_match = re.search(r'/doc/(\d+)/', link)
                if doc_id_match:
                    ik_doc_id = doc_id_match.group(1)
                    self.process_case(f"IK-{ik_doc_id}", link, title)
                    new_cases_found += 1

            if new_cases_found == 0:
                print("NYAYA ENGINE: No new records in feed.")
            else:
                print(f"NYAYA ENGINE: Successfully synchronized {new_cases_found} records to local archive.")

        except Exception as e:
            print(f"NYAYA ENGINE: Critical failure during RSS sync: {e}")

    def run(self, mode="latest", **kwargs):
        """
        Main execution loop.
        mode: 'latest' (RSS sync), 'folder' (bulk local)
        """
        if mode == "latest":
            self.sync_latest_judgments()
        elif mode == "folder" and kwargs.get("folder_path"):
            self.ingest_local_folder(kwargs.get("folder_path"))

if __name__ == "__main__":
    scraper = SupremeCourtScraper()
    scraper.run()
