from fastapi import APIRouter, Depends, HTTPException, Query, Request
from typing import Dict, Any
from services.gemini import explain_legal_term
from services.rate_limiter import check_and_increment
# Auth disabled for dev testing

router = APIRouter(
    prefix="/dictionary",
    tags=["dictionary"],
)

@router.get("/explain")
async def explain_term(
    term: str = Query(..., description="Legal term to explain")
) -> Dict[str, Any]:
    """
    Get an AI-powered explanation for a legal term.
    
    CACHED BY INPUT HASH: Same term text returns cached result with zero token cost.
    """
    usage = {"used": 0, "limit": 999, "remaining": 999}

    try:
        # explain_legal_term() has internal caching via cache_key = f"term_{normalized_term}"
        explanation = await explain_legal_term(term)

        return {
            "term": term,
            "explanation": explanation,
            "usage": usage
        }
    except Exception as e:
        print(f"Dictionary explanation failed for {term}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/search")
async def search_dictionary(
    q: str = Query(..., min_length=2)
):
    """
    Placeholder for a static dictionary search if we add one later.
    For now, it just redirects to the AI explainer or returns empty.
    """
    return {"results": []}
