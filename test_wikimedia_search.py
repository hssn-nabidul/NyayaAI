import httpx
import asyncio
from typing import Optional

async def search_wikimedia_photo(judge_name: str) -> Optional[str]:
    search_url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "list": "search",
        "srsearch": f"Justice {judge_name}",
        "srnamespace": 6, # File namespace
        "srlimit": 1
    }
    headers = {
        "User-Agent": "NyayaLegalApp/1.0 (https://github.com/yourusername/nyaya; contact@example.com)"
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(search_url, params=params, headers=headers)
            data = resp.json()
            search_results = data.get("query", {}).get("search", [])
            
            if search_results:
                filename = search_results[0]["title"] # e.g. "File:Justice D.Y. Chandrachud.jpg"
                clean_filename = filename.replace("File:", "")
                return f"https://commons.wikimedia.org/wiki/Special:FilePath/{clean_filename}"
    except Exception as e:
        print(f"Wikimedia search failed for {judge_name}: {e}")
    return None

async def test_search():
    judges = ["D.Y. Chandrachud", "Sanjay Kishan Kaul", "Hima Kohli", "Indu Malhotra"]
    for j in judges:
        url = await search_wikimedia_photo(j)
        print(f"Judge: {j} -> URL: {url}")

if __name__ == "__main__":
    asyncio.run(test_search())
