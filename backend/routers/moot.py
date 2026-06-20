from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any, Optional
from services.gemini import prepare_moot_arguments
from services.rate_limiter import check_and_increment
# Auth disabled for dev testing

router = APIRouter(
    prefix="/moot",
    tags=["moot"],
)

from pydantic import BaseModel

class MootPrepRequest(BaseModel):
    proposition: str
    side: str = "both"
    format: str = "memorial"

@router.post("/prep")
async def get_moot_prep(
    request: MootPrepRequest
) -> Dict[str, Any]:
    """
    Generate structured moot court arguments.
    
    CACHED BY INPUT HASH: Same proposition + side + format returns cached
    result with zero token cost. Cache TTL: 30 days.
    """
    usage = {"used": 0, "limit": 999, "remaining": 999}
    
    try:
        # prepare_moot_arguments() has internal caching via get_cache_key("moot_{side}_{format}", proposition)
        analysis = await prepare_moot_arguments(request.proposition, request.side, request.format)
        
        return {
            "proposition": request.proposition,
            "side": request.side,
            "analysis": analysis,
            "usage": usage
        }
    except Exception as e:
        print(f"Moot prep failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
