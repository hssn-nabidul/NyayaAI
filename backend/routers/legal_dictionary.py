from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any
from services.gemini import explain_legal_term
from services.rate_limiter import check_and_increment
from services.firebase_auth import get_current_user, FirebaseUser

router = APIRouter(
    prefix="/dictionary",
    tags=["dictionary"],
)

@router.get("/explain")
async def get_term_explanation(
    term: str = Query(..., min_length=2),
    current_user: FirebaseUser = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get an AI-powered explanation for a legal term.
    """
    # 1. Check AI Rate Limit
    usage = check_and_increment(current_user.uid)
    
    try:
        # 2. Generate explanation using Gemini
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
    q: str = Query(..., min_length=2),
    current_user: FirebaseUser = Depends(get_current_user)
):
    """
    Placeholder for a static dictionary search if we add one later.
    For now, it just redirects to the AI explainer or returns empty.
    """
    return {"results": []}
