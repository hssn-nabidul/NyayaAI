from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from engine.database import get_db
from engine.search import search_internal_cases
from typing import Optional

router = APIRouter(prefix="/internal/cases", tags=["Internal Data Engine"])

@router.get("/search")
async def internal_search(
    q: str = Query(..., description="Search query"),
    court: Optional[str] = Query(None, description="Filter by court"),
    limit: int = 10,
    offset: int = 0
):
    """
    Search endpoint for Nyaya's internal judgment repository.
    This will eventually replace the Indian Kanoon dependency.
    """
    results = search_internal_cases(q, court, limit, offset)
    return {
        "status": "success",
        "count": len(results),
        "results": results,
        "provider": "Nyaya Internal"
    }

@router.get("/health")
async def engine_health():
    """
    Check the status of the internal data engine.
    """
    return {"status": "operational", "engine": "Nyaya Data Engine v1.0"}
