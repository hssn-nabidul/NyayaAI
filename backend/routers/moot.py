from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any, Optional
from services.gemini import prepare_moot_arguments
from services.rate_limiter import check_and_increment
from services.firebase_auth import get_current_user, FirebaseUser

router = APIRouter(
    prefix="/moot",
    tags=["moot"],
)

@router.post("/prep")
async def get_moot_prep(
    proposition: str = Body(..., embed=True),
    side: str = Body("both", embed=True),
    format: str = Body("memorial", embed=True),
    current_user: FirebaseUser = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate structured moot court arguments.
    """
    # 1. Check AI Rate Limit
    usage = check_and_increment(current_user.uid)
    
    try:
        # 2. Generate arguments using Gemini
        analysis = await prepare_moot_arguments(proposition, side, format)
        
        return {
            "proposition": proposition,
            "side": side,
            "analysis": analysis,
            "usage": usage
        }
    except Exception as e:
        print(f"Moot prep failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
