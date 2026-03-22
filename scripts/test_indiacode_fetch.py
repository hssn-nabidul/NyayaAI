import httpx
import sys
import argparse

async def try_fetch(url: str):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest"
    }
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=20.0) as client:
        try:
            response = await client.get(url)
            print(f"Status: {response.status_code}")
            print(f"Final URL: {response.url}")
            print(f"Content-Type: {response.headers.get('Content-Type')}")
            
            print("\n--- RAW TEXT PREVIEW ---")
            print(response.text[:2000])
            print("\n--- END RAW TEXT ---")

        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="https://www.indiacode.nic.in/handle/123456789/20062")
    args = parser.parse_args()
    
    import asyncio
    asyncio.run(try_fetch(args.url))
