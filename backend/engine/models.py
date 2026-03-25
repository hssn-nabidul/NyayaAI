from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class InternalJudgment(Base):
    """
    Core model for Nyaya's internal legal database.
    Stores raw judgment text and enriched AI metadata.
    """
    __tablename__ = "internal_judgments"

    id = Column(Integer, primary_key=True, index=True)
    source_url = Column(String(500), unique=True, index=True)
    case_id = Column(String(100), unique=True, index=True)  # Official registry/case number
    
    title = Column(String(500), nullable=False, index=True)
    court = Column(String(200), nullable=False, index=True)
    decision_date = Column(DateTime, nullable=False, index=True)
    
    # Content storage
    content_raw = Column(Text, nullable=False)  # Full raw judgment text
    content_clean = Column(Text)  # Sanitized/Parsed text
    
    # Metadata
    bench = Column(String(500))
    parties = Column(JSON)  # {appellant: "", respondent: ""}
    citations = Column(JSON)  # List of cases cited
    
    # AI Enrichment (Stored permanently to avoid re-calling Gemini)
    ai_summary = Column(JSON)  # {holding: "", issues: [], brief: ""}
    
    # Internal Tracking
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Indexes for performance
    __table_args__ = (
        Index('idx_judgment_search', 'title', 'court'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "case_id": self.case_id,
            "title": self.title,
            "court": self.court,
            "date": self.decision_date.isoformat() if self.decision_date else None,
            "summary": self.ai_summary
        }
