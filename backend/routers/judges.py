from fastapi import APIRouter, Depends, HTTPException, Query, Response
from typing import Dict, Any, Optional
import httpx
import hashlib
from services.kanoon import search_by_judge
from services.gemini import generate_judge_profile
from services.rate_limiter import check_and_increment
from services.firebase_auth import get_current_user, FirebaseUser
from services.judge_assets import get_judge_photo, search_wikimedia_photo
from services.cache import cache_service

router = APIRouter(
    prefix="/judges",
    tags=["judges"],
)

@router.get("/photo/{judge_name}")
async def get_judge_photo_proxy(judge_name: str):
    """
    Proxy judge images to bypass hotlinking protection.
    Automatically searches Wikimedia if not found in hardcoded list.
    """
    # 1. Check Hardcoded List First
    photo_url = get_judge_photo(judge_name)
    
    # 2. If it's a fallback (avatar), try searching Wikimedia
    if "ui-avatars.com" in photo_url:
        # Check cache for previous searches
        cache_key = f"judge_photo_search_{hashlib.md5(judge_name.lower().encode()).hexdigest()}"
        cached_url = cache_service.get("kanoon_cache", cache_key)
        
        if cached_url:
            photo_url = cached_url
        else:
            searched_url = await search_wikimedia_photo(judge_name)
            if searched_url:
                photo_url = searched_url
                # Cache for 30 days
                cache_service.set("kanoon_cache", cache_key, photo_url, ttl_days=30)

    # 3. Final Fallback check
    if "ui-avatars.com" in photo_url:
        return Response(status_code=307, headers={"Location": photo_url})

    # 4. Proxy the Image
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://commons.wikimedia.org/"
        }
        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            resp = await client.get(photo_url, headers=headers)
            
            if resp.status_code == 200:
                # Cache the image content? No, just serve it for now.
                content_type = resp.headers.get("Content-Type", "image/jpeg")
                return Response(content=resp.content, media_type=content_type)
            else:
                # If proxy fails, redirect to avatar
                fallback = f"https://ui-avatars.com/api/?name={judge_name.replace(' ', '+')}&background=1A2E44&color=FFD700&size=256"
                return Response(status_code=307, headers={"Location": fallback})
    except Exception as e:
        print(f"Photo proxy failed for {judge_name}: {e}")
        fallback = f"https://ui-avatars.com/api/?name={judge_name.replace(' ', '+')}&background=1A2E44&color=FFD700&size=256"
        return Response(status_code=307, headers={"Location": fallback})

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
    usage = await check_and_increment(current_user.uid)
    
    try:
        # 2. Search for judgments by this judge
        results = await search_by_judge(judge_name, pagenum=0)
        judgments = results.get("results", [])
        
        if not judgments:
            # We use a 404 here which will be caught by the generic handler if not careful
            raise HTTPException(status_code=404, detail=f"No judgments found for judge '{judge_name}'")
        
        # 3. Generate profile using Gemini based on the top results
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
    except HTTPException as he:
        # Re-raise HTTPExceptions as-is
        raise he
    except Exception as e:
        import structlog
        logger = structlog.get_logger()
        logger.error("judge_analytics_failed", judge=judge_name, error=str(e))
        raise HTTPException(status_code=500, detail="Internal analysis error")
