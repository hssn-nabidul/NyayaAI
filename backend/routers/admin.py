from fastapi import APIRouter, Request, HTTPException
from services.cache import cache_service
from typing import Dict, Any

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/cache-stats")
async def get_cache_stats(request: Request) -> Dict[str, Any]:
    """
    Returns cache health metrics.
    Only callable from localhost.
    """
    client_host = request.client.host
    # 127.0.0.1 is the standard localhost loopback
    # ::1 is the IPv6 loopback
    if client_host not in ["127.0.0.1", "::1", "localhost"]:
        raise HTTPException(status_code=403, detail="Access denied. Admin endpoints only available from localhost.")
        
    return cache_service.get_stats()
