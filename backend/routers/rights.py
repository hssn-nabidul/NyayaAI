from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any
from services.gemini import explain_fundamental_right
from services.rate_limiter import check_and_increment
from services.firebase_auth import get_current_user, FirebaseUser

router = APIRouter(
    prefix="/rights",
    tags=["rights"],
)

@router.get("/explain")
async def get_right_explanation(
    q: str = Query(..., description="Fundamental right to explain"),
    current_user: FirebaseUser = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Explain a fundamental right in simple terms.
    """
    # 1. Check AI Rate Limit
    usage = check_and_increment(current_user.uid)
    
    try:
        # 2. Explain using Gemini
        explanation = await explain_fundamental_right(q)
        
        return {
            "query": q,
            "explanation": explanation,
            "usage": usage
        }
    except Exception as e:
        print(f"Rights explanation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
