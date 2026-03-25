import sys
import os
from datetime import datetime
from sqlalchemy.orm import Session

# Add the parent directory to path so we can import engine
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.database import SessionLocal, init_db
from engine.models import InternalJudgment

def ingest_sample_case():
    """
    Manually ingest a landmark case to verify the storage pipeline.
    """
    db = SessionLocal()
    
    # Check if already exists
    existing = db.query(InternalJudgment).filter(InternalJudgment.case_id == "W.P.(C) 135/1970").first()
    if existing:
        print(f"Case already exists: {existing.title}")
        db.close()
        return

    sample_case = InternalJudgment(
        case_id="W.P.(C) 135/1970",
        source_url="https://main.sci.gov.in/supremecourt/1970/135/135_1970_Judgement_24-Apr-1973.pdf",
        title="Kesavananda Bharati v. State of Kerala",
        court="Supreme Court of India",
        decision_date=datetime(1973, 4, 24),
        content_raw="""[SAMPLE TEXT] The basic structure of the Constitution cannot be amended... 
        Kesavananda Bharati Sripadagalvaru and Ors. v. State of Kerala and Anr. 
        is a landmark decision of the Supreme Court of India that outlined 
        the basic structure doctrine of the Constitution.""",
        bench="S.M. Sikri, J.M. Shelat, K.S. Hegde, A.N. Grover, B. Jaganmohan Reddy, D.G. Palekar, H.R. Khanna, A.K. Mukherjee, Y.V. Chandrachud, P. Jaganmohan Reddy, S.N. Dwivedi, M.H. Beg, Chandrachud",
        parties={"appellant": "Kesavananda Bharati", "respondent": "State of Kerala"},
        ai_summary={
            "holding": "The Parliament has the power to amend any part of the Constitution but cannot destroy its Basic Structure.",
            "issues": ["Scope of Article 368", "Validity of 24th, 25th and 29th Amendments"],
            "brief": "Landmark case establishing the Basic Structure Doctrine."
        }
    )

    try:
        db.add(sample_case)
        db.commit()
        print(f"Successfully ingested: {sample_case.title}")
    except Exception as e:
        print(f"Error ingesting case: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    ingest_sample_case()
