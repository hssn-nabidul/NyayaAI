from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any
from services.gemini import suggest_draft_cases
from services.rate_limiter import check_and_increment
from services.firebase_auth import get_current_user, FirebaseUser

router = APIRouter(
    prefix="/draft",
    tags=["draft"],
)

@router.post("/suggest")
async def get_draft_suggestions(
    draft_text: str = Body(..., embed=True),
    max_suggestions: int = Body(5, embed=True),
    current_user: FirebaseUser = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get relevant case law suggestions for a draft legal document.
    """
    # 1. Check AI Rate Limit
    usage = check_and_increment(current_user.uid)
    
    try:
        # 2. Get suggestions using Gemini
        suggestions = await suggest_draft_cases(draft_text, max_suggestions)
        
        return {
            "analysis": suggestions,
            "usage": usage
        }
    except Exception as e:
        print(f"Draft suggestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
