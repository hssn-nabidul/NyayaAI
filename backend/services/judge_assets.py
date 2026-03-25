import httpx
from typing import Optional
import structlog

logger = structlog.get_logger()

# Mapping of judge names to their image URLs (Hardcoded for common ones)
JUDGE_PHOTOS = {
    "chandrachud": "https://commons.wikimedia.org/wiki/Special:FilePath/Justice_D.Y._Chandrachud.jpg",
    "nagarathna": "https://commons.wikimedia.org/wiki/Special:FilePath/B.V._Nagarathna.jpg",
    "kaul": "https://commons.wikimedia.org/wiki/Special:FilePath/Sanjay_Kishan_Kaul_(cropped).jpg",
    "hima kohli": "https://commons.wikimedia.org/wiki/Special:FilePath/Justice_Hima_Kohli.jpg",
    "pardiwala": "https://commons.wikimedia.org/wiki/Special:FilePath/Justice_Jamshed_Burjor_Pardiwala.jpg",
    "oka": "https://commons.wikimedia.org/wiki/Special:FilePath/Abhay_Shriniwas_Oka.jpg"
}

async def search_wikimedia_photo(judge_name: str) -> Optional[str]:
    """
    Search Wikimedia Commons for a judge's photo and get the direct URL.
    """
    # 1. Search for the file
    search_url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "list": "search",
        "srsearch": f"Justice {judge_name}",
        "srnamespace": 6,
        "srlimit": 1
    }
    headers = {"User-Agent": "NyayaApp/1.0"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Step A: Find the file title
            resp = await client.get(search_url, params=params, headers=headers)
            data = resp.json()
            search_results = data.get("query", {}).get("search", [])
            
            if not search_results:
                return None
                
            file_title = search_results[0]["title"]
            
            # Step B: Get direct image info
            info_params = {
                "action": "query",
                "format": "json",
                "prop": "imageinfo",
                "iiprop": "url",
                "titles": file_title
            }
            info_resp = await client.get(search_url, params=info_params, headers=headers)
            info_data = info_resp.json()
            pages = info_data.get("query", {}).get("pages", {})
            
            for page_id in pages:
                ii = pages[page_id].get("imageinfo", [])
                if ii:
                    return ii[0].get("url")
                    
    except Exception as e:
        logger.error("wikimedia_direct_url_failed", judge=judge_name, error=str(e))
    
    return None

def get_judge_photo(judge_name: str) -> str:
    # 1. Extreme normalization: remove all non-alphanumeric chars
    raw_input = judge_name.lower().strip()
    clean_input = "".join(filter(str.isalnum, raw_input.replace("justice", "").replace("shri", "")))
    
    # 2. Check hardcoded map
    for key, url in JUDGE_PHOTOS.items():
        clean_key = "".join(filter(str.isalnum, key))
        if clean_key in clean_input or clean_input in clean_key:
            return url
            
    # 3. Default fallback (avatar)
    return "https://ui-avatars.com/api/?name=" + judge_name.replace(" ", "+") + "&background=1A2E44&color=FFD700&size=256&bold=true"
