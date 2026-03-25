# NyayaAI Project

Nyaya is a legal engine designed for fast, AI-augmented research and discovery of Indian judgments.

## Current Project Status

The backend is currently a "hybrid" system that uses **Indian Kanoon (IK)** as a bridge while building its internal data store.

### Architecture Overview

- **Internal Store:** SQLite database (`nyaya_engine.db`) with full-text search.
- **Scraper Engine:** `SupremeCourtScraper` which uses IK as a source for doc links and raw documents.
- **Search Service:** `search_judgments` first checks local store, then falls back to IK API.
- **Doc Retrieval:** `get_doc_details` fetches from local store or triggers JIT scraping from IK.

### Why Indian Kanoon is currently used:
1. **The Discovery Problem:** Local DB only has a few cases; IK provides search for the historical record.
2. **The Source Problem:** IK is a unified bucket for raw documents; official court sites are more complex to scrape.
3. **The Citation Graph:** IK's indexing is used for "Cases citing this" and "Cases cited by this".

---

## Roadmap to 100% Independence

To make Nyaya completely independent of Indian Kanoon, the following pillars must be implemented:

### Pillar 1: Historical Bulk Ingestion (The Cold Start)
- **Goal:** Pre-populate the local database with millions of historical records so local search returns results for any historical case.
- **Strategy:** Either ingest existing open data dumps (e.g., Free Law datasets) or build a dedicated background crawler for court archives.

### Pillar 2: Local Citation Graph (The Brain)
- **Goal:** Build a "Citing/Cited By" graph locally.
- **Strategy:** An AI/Regex-powered citation indexer that scans every judgment text to extract references and link them to existing cases in our DB.

### Pillar 3: Direct Court Sync (The Live Feed)
- **Goal:** Pull the latest daily judgments directly from official sources (SCI, High Courts, e-Courts).
- **Strategy:** Expand scrapers to consume official cause lists and daily judgment uploads, bypassing third-party aggregators.

---

## Next Steps
- [ ] Finalize the strategy for Pillar 1 (Bulk Ingestion).
- [ ] Design the local citation extractor.
- [ ] Prototype the direct court sync for the Supreme Court.
