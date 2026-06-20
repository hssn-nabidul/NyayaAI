from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any
from services.gemini import suggest_draft_cases
from services.rate_limiter import check_and_increment
# Auth disabled for dev testing

router = APIRouter(
    prefix="/draft",
    tags=["draft"],
)

from pydantic import BaseModel

class DraftSuggestRequest(BaseModel):
    draft_text: str
    max_suggestions: int = 5

@router.post("/suggest")
async def get_draft_suggestions(
    request: DraftSuggestRequest
) -> Dict[str, Any]:
    """
    Get relevant case law suggestions for a draft legal document.
    
    CACHED BY INPUT HASH: Identical draft text + max_suggestions returns
    cached result with zero token cost. Cache TTL: 30 days.
    """
    usage = {"used": 0, "limit": 999, "remaining": 999}
    
    try:
        # suggest_draft_cases() has internal caching via get_cache_key("draft_{max}", truncated)
        suggestions = await suggest_draft_cases(request.draft_text, request.max_suggestions)
        
        return {
            **suggestions,
            "usage": usage
        }
    except Exception as e:
        print(f"Draft suggestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
