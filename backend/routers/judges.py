from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any
from services.kanoon import search_by_judge
from services.gemini import generate_judge_profile
from services.rate_limiter import check_and_increment
from services.firebase_auth import get_current_user, FirebaseUser

router = APIRouter(
    prefix="/judges",
    tags=["judges"],
)

@router.get("/{judge_name}")
async def get_judge_analytics(
    judge_name: str,
    current_user: FirebaseUser = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate a judicial profile and list recent judgments for a judge.
    Checks AI rate limits.
    """
    # 1. Check AI Rate Limit
    usage = check_and_increment(current_user.uid)
    
    try:
        # 2. Search for judgments by this judge
        results = await search_by_judge(judge_name)
        judgments = results.get("results", [])
        
        if not judgments:
            raise HTTPException(status_code=404, detail=f"No judgments found for judge '{judge_name}'")
        
        # 3. Generate profile using Gemini
        profile = await generate_judge_profile(judge_name, judgments)
        
        return {
            "judge_name": judge_name,
            "profile": profile,
            "recent_judgments": judgments[:5], # top 5 recent
            "stats": {
                "total_found": results.get("total", 0)
            },
            "usage": usage
        }
    except Exception as e:
        print(f"Judge analytics failed for {judge_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
