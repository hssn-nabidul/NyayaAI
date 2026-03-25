from datetime import datetime
from engine.scrapers.supreme_court import SupremeCourtScraper

def test_past_date():
    scraper = SupremeCourtScraper()
    # Test a date that definitely has judgments (e.g., March 1, 2024)
    test_date = datetime(2024, 3, 1)
    scraper.fetch_daily_judgments(target_date=test_date)

if __name__ == "__main__":
    test_past_date()
