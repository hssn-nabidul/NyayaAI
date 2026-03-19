import asyncio
import time
import os
import sys
from pathlib import Path

# Add backend to path so we can import services
sys.path.append(str(Path(__file__).parent / "backend"))

from backend.services.kanoon import search_judgments, get_doc_details
from backend.services.gemini import summarize_judgment

async def test_search_performance():
    print("Testing Search Performance for 'Maneka Gandhi'...")
    start_time = time.time()
    try:
        results = await search_judgments("Maneka Gandhi")
        duration = time.time() - start_time
        count = len(results.get("results", []))
        print(f"Search returned {count} results in {duration:.2f} seconds.")
        return results.get("results", [])[0] if count > 0 else None
    except Exception as e:
        print(f"Search failed: {e}")
        return None

async def test_summary_performance(doc_id):
    if not doc_id:
        print("No doc_id provided for summary test.")
        return

    print(f"Testing Summary Performance for doc_id: {doc_id}...")
    try:
        # 1. Fetch case details
        case_data = await get_doc_details(doc_id)
        doc_text = case_data.get("doc", "") or case_data.get("text", "")
        
        if not doc_text:
            print("No text found to summarize.")
            return

        # 2. Summarize
        start_time = time.time()
        summary = await summarize_judgment(doc_text)
        duration = time.time() - start_time
        
        print(f"Summary generated in {duration:.2f} seconds.")
        # print("Summary Preview:", str(summary)[:200] + "...")
    except Exception as e:
        print(f"Summarization failed: {e}")

async def main():
    first_case = await test_search_performance()
    if first_case:
        await test_summary_performance(first_case['doc_id'])

if __name__ == "__main__":
    asyncio.run(main())
