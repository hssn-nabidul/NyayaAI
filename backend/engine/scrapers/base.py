import os
import httpx
import pdfplumber
from datetime import datetime
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import InternalJudgment

class BaseScraper:
    """
    Abstract base class for all court scrapers.
    Handles common tasks like downloading PDFs, extracting text, and saving to DB.
    """
    def __init__(self, court_name: str):
        self.court_name = court_name
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
        # Use httpx.Client with session-like behavior
        self.client = httpx.Client(
            timeout=60.0, 
            follow_redirects=True, 
            verify=False,
            headers=self.headers
        )

    def download_pdf(self, url: str, filename: str) -> str:
        """Download a PDF and return the local path."""
        path = os.path.join("backend", "cache", "judgments", filename)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        if os.path.exists(path):
            return path

        response = self.client.get(url)
        print(f"DEBUG: Downloaded {url}. Content-Type: {response.headers.get('Content-Type')}. Status: {response.status_code}")
        
        with open(path, "wb") as f:
            for chunk in response.iter_bytes():
                f.write(chunk)
        
        # Check if it's actually a PDF
        with open(path, "rb") as f:
            header = f.read(100)
            if not header.startswith(b"%PDF"):
                print(f"DEBUG: File is NOT a PDF. First 100 bytes: {header}")
        
        return path

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract raw text from a PDF file."""
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text

    def extract_text_from_html(self, html_content: str) -> str:
        """Extract judgment text from Indian Kanoon HTML."""
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Indian Kanoon judgments are usually inside a div with class 'judgments'
        judgment_div = soup.find('div', class_='judgments')
        if judgment_div:
            return judgment_div.get_text(separator='\n', strip=True)
        
        # Fallback: get all text if 'judgments' div not found
        return soup.get_text(separator='\n', strip=True)

    def save_judgment(self, data: dict):
        """Save a parsed judgment to the internal database."""
        from services.kanoon import logger # Reuse the logger
        db = SessionLocal()
        try:
            # Prevent duplicates
            existing = db.query(InternalJudgment).filter(
                InternalJudgment.case_id == data['case_id']
            ).first()
            
            if existing:
                logger.info("save_judgment_skip_duplicate", case_id=data['case_id'])
                return

            judgment = InternalJudgment(**data)
            db.add(judgment)
            db.commit()
            logger.info("save_judgment_success", case_id=data['case_id'], title=judgment.title)
        except Exception as e:
            db.rollback()
            logger.error("save_judgment_error", error=str(e))
        finally:
            db.close()

    def run(self, **kwargs):
        """Main execution loop to be implemented by subclasses."""
        raise NotImplementedError("Subclasses must implement run()")
