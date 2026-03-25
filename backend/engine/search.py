from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from .database import SessionLocal
from .models import InternalJudgment

def search_internal_cases(query: str, court: str = None, limit: int = 10, offset: int = 0):
    """
    Perform a full-text search on internal judgments.
    """
    db = SessionLocal()
    try:
        filters = []
        if query:
            # Normalize query: remove extra whitespace
            q_clean = " ".join(query.split())
            q_wildcard = f"%{q_clean.lower()}%"
            
            from sqlalchemy import func
            filters.append(or_(
                func.lower(InternalJudgment.title).like(q_wildcard),
                func.lower(InternalJudgment.content_raw).like(q_wildcard),
                func.lower(InternalJudgment.bench).like(q_wildcard),
                func.lower(InternalJudgment.case_id).like(q_wildcard)
            ))
        
        if court and court != "all":
            filters.append(InternalJudgment.court == court)
            
        results = db.query(InternalJudgment).filter(*filters)\
            .order_by(desc(InternalJudgment.decision_date))\
            .limit(limit).offset(offset).all()
            
        return [r.to_dict() for r in results]
    finally:
        db.close()

if __name__ == "__main__":
    # Test Search
    print("Testing internal search for 'Kesavananda'...")
    results = search_internal_cases("Kesavananda")
    for r in results:
        print(f"- {r['title']} ({r['date']})")
