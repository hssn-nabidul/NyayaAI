from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any
from services.gemini import explain_fundamental_right
from services.rate_limiter import check_and_increment
# Auth disabled for dev testing

router = APIRouter(
    prefix="/rights",
    tags=["rights"],
)

@router.get("/explain")
async def get_right_explanation(
    q: str = Query(..., description="Fundamental right to explain")
) -> Dict[str, Any]:
    """
    Explain a fundamental right in simple terms.
    
    CACHED BY INPUT HASH: Same query text returns cached result with zero token cost.
    """
    usage = {"used": 0, "limit": 999, "remaining": 999}
    
    try:
        # explain_fundamental_right() has internal caching via cache_key = f"right_{normalized_query}"
        explanation = await explain_fundamental_right(q)
        
        return {
            "query": q,
            "explanation": explanation,
            "usage": usage
        }
    except Exception as e:
        print(f"Rights explanation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
