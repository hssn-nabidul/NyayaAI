import asyncio
import os
import sys
from datetime import datetime

# Add root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.gemini import extract_judgment_metadata
from engine.database import SessionLocal, init_db
from engine.models import InternalJudgment

async def test_robust_extraction():
    print("--- STARTING ROBUST METADATA EXTRACTION TEST ---")
    
    # 1. Read mock judgment
    current_dir = os.path.dirname(os.path.abspath(__file__))
    mock_file_path = os.path.join(current_dir, "test_mock_judgment.txt")
    
    with open(mock_file_path, "r") as f:
        judgment_text = f.read()
    
    print("DEBUG: Sending text to Gemini for metadata extraction...")
    
    # 2. Call Gemini
    start_time = datetime.now()
    metadata = await extract_judgment_metadata(judgment_text)
    duration = (datetime.now() - start_time).total_seconds()
    
    print(f"DEBUG: Gemini responded in {duration:.2f}s")
    print("\n--- EXTRACTED METADATA ---")
    import json
    print(json.dumps(metadata, indent=2))
    
    # 3. Verify specific fields we expect from the mock text
    expected_case_id = "Civil Appeal No. 4567 of 2024"
    extracted_case_id = metadata.get("case_id")
    
    print(f"\nVerification:")
    print(f"- Expected Case ID: {expected_case_id}")
    print(f"- Extracted Case ID: {extracted_case_id}")
    
    if extracted_case_id and "4567" in extracted_case_id:
        print("✅ SUCCESS: Case ID correctly identified.")
    else:
        print("❌ FAILURE: Case ID mismatch.")

    # 4. Attempt to save to DB to test the full pipeline
    db = SessionLocal()
    try:
        # Clean up old test if exists
        db.query(InternalJudgment).filter(InternalJudgment.case_id == extracted_case_id).delete()
        
        # Prepare date
        decision_date = datetime.now()
        if metadata.get("decision_date"):
            try:
                decision_date = datetime.strptime(metadata["decision_date"], "%Y-%m-%d")
            except: pass

        new_case = InternalJudgment(
            case_id=extracted_case_id or "TEST-ID",
            title=metadata.get("title", "Test Title"),
            court=metadata.get("court", "Supreme Court of India"),
            decision_date=decision_date,
            content_raw=judgment_text,
            bench=metadata.get("bench", "Unknown"),
            source_url="local://test_mock_judgment.txt"
        )
        
        db.add(new_case)
        db.commit()
        print(f"✅ SUCCESS: Saved extracted record to Nyaya Data Engine.")
    except Exception as e:
        print(f"❌ FAILURE: Database save failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    asyncio.run(test_robust_extraction())
