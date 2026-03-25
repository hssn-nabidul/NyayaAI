import asyncio
import httpx
import time

async def test_jit_caching():
    url = "http://127.0.0.1:8000/search/"
    params = {"q": "jai bir singh", "page": 0}
    
    print("--- Request 1 (Expect Scraper) ---")
    start = time.time()
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp1 = await client.get(url, params=params)
    end = time.time()
    print(f"Status: {resp1.status_code}")
    print(f"Time: {end - start:.2f}s")
    
    print("\n--- Request 2 (Expect Cache Hit) ---")
    start = time.time()
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp2 = await client.get(url, params=params)
    end = time.time()
    print(f"Status: {resp2.status_code}")
    print(f"Time: {end - start:.2f}s")

if __name__ == "__main__":
    asyncio.run(test_jit_caching())
