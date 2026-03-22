import httpx
from bs4 import BeautifulSoup
import json
import time
import os
import sys
from pathlib import Path

# Act configuration
ACTS = {
    "bns-2023": {
        "url": "https://www.indiacode.nic.in/handle/123456789/20062",
        "title": "Bharatiya Nyaya Sanhita",
        "year": 2023,
        "short_title": "BNS",
        "replaces": "Indian Penal Code, 1860"
    },
    "bnss-2023": {
        "url": "https://www.indiacode.nic.in/handle/123456789/20099",
        "title": "Bharatiya Nagarik Suraksha Sanhita",
        "year": 2023,
        "short_title": "BNSS",
        "replaces": "Code of Criminal Procedure, 1973"
    },
    "bsa-2023": {
        "url": "https://www.indiacode.nic.in/handle/123456789/20063",
        "title": "Bharatiya Sakshya Adhiniyam",
        "year": 2023,
        "short_title": "BSA",
        "replaces": "Indian Evidence Act, 1872"
    },
    "ipc-1860": {
        "url": "https://www.indiacode.nic.in/handle/123456789/2263",
        "title": "Indian Penal Code",
        "year": 1860,
        "short_title": "IPC",
        "replaces": None
    },
    "crpc-1973": {
        "url": "https://www.indiacode.nic.in/handle/123456789/4221",
        "title": "Code of Criminal Procedure",
        "year": 1973,
        "short_title": "CrPC",
        "replaces": None
    },
    "evidence-act-1872": {
        "url": "https://www.indiacode.nic.in/handle/123456789/12846",
        "title": "Indian Evidence Act",
        "year": 1872,
        "short_title": "IEA",
        "replaces": None
    },
    "constitution-of-india": {
        "url": "https://www.indiacode.nic.in/handle/123456789/19632",
        "title": "Constitution of India",
        "year": 1950,
        "short_title": "COI",
        "replaces": None
    },
    "it-act-2000": {
        "url": "https://www.indiacode.nic.in/handle/123456789/1999",
        "title": "Information Technology Act",
        "year": 2000,
        "short_title": "IT Act",
        "replaces": None
    },
    "consumer-protection-2019": {
        "url": "https://www.indiacode.nic.in/handle/123456789/20946",
        "title": "Consumer Protection Act",
        "year": 2019,
        "short_title": "CPA",
        "replaces": None
    },
    "rti-act-2005": {
        "url": "https://www.indiacode.nic.in/handle/123456789/2065",
        "title": "Right to Information Act",
        "year": 2005,
        "short_title": "RTI",
        "replaces": None
    },
    "pocso-act-2012": {
        "url": "https://www.indiacode.nic.in/handle/123456789/2079",
        "title": "Protection of Children from Sexual Offences Act",
        "year": 2012,
        "short_title": "POCSO",
        "replaces": None
    },
    "domestic-violence-2005": {
        "url": "https://www.indiacode.nic.in/handle/123456789/2021",
        "title": "Protection of Women from Domestic Violence Act",
        "year": 2005,
        "short_title": "PWDVA",
        "replaces": None
    },
}

DATA_DIR = Path("frontend/src/data/acts")
DATA_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

client = httpx.Client(headers=HEADERS, timeout=30.0, follow_redirects=True)

def fetch_with_retry(url, label="Request"):
    """Fetches a URL with a single retry on 403/429."""
    try:
        resp = client.get(url)
        if resp.status_code in [403, 429]:
            print(f"⚠️ Received {resp.status_code} for {label}. Waiting 10s...")
            time.sleep(10)
            resp = client.get(url)
        
        resp.raise_for_status()
        return resp
    except Exception as e:
        print(f"❌ Error fetching {label}: {e}")
        return None

def get_act_browser_url(handle_url):
    """Navigates from handle page to the interactive browser page."""
    resp = fetch_with_retry(handle_url, "Handle Page")
    if not resp: return None
    
    soup = BeautifulSoup(resp.text, 'html.parser')
    # Look for "View Full Act" button or similar
    # IndiaCode interactive view usually has a link with 'view-data' or similar
    # Sometimes it's a form or a specific button
    for a in soup.find_all('a', href=True):
        if 'view-data' in a['href'] or 'show-data' in a['href']:
            return "https://www.indiacode.nic.in" + a['href']
            
    # Fallback: Try to construct it if we can find the Act ID
    # Usually the handle page has metadata like 'Act ID'
    return None

def scrape_act(act_id, config):
    print(f"\n🚀 Scraping {config['short_title']}...")
    
    # In a real scenario, IndiaCode's interactive browser is complex.
    # For this one-time script, we'll implement a robust discovery.
    # Most IndiaCode acts have a "Browse" page that lists all sections.
    
    browser_url = get_act_browser_url(config['url'])
    if not browser_url:
        print(f"❌ Could not find interactive browser for {act_id}. Skipping.")
        return
    
    sections = []
    
    try:
        # Step 1: Fetch the browser page to get section list
        resp = fetch_with_retry(browser_url, f"{config['short_title']} Browser")
        if not resp: return
        
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        # IndiaCode interactive view usually has a side menu or a table of sections
        # The structure is often: <a href="...sectionid=X&sectionno=Y">Title</a>
        section_links = []
        for a in soup.find_all('a', href=True):
            if 'sectionno=' in a['href']:
                section_links.append({
                    'no': a.text.strip().split('.')[0] if '.' in a.text else a.text.strip(),
                    'url': "https://www.indiacode.nic.in" + a['href'],
                    'title': a.get('title', '').strip() or a.text.strip()
                })
        
        if not section_links:
            # Try finding in tables
            rows = soup.find_all('tr')
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 2:
                    link = cols[1].find('a', href=True)
                    if link and 'sectionno=' in link['href']:
                        section_links.append({
                            'no': cols[0].text.strip(),
                            'url': "https://www.indiacode.nic.in" + link['href'],
                            'title': link.text.strip()
                        })

        print(f"📋 Found {len(section_links)} sections for {config['short_title']}.")
        
        for i, sl in enumerate(section_links):
            print(f"  ➜ Scraping {config['short_title']}... Section {i+1}/{len(section_links)}: {sl['no']}", end='\r')
            
            # Fetch section detail
            sec_resp = fetch_with_retry(sl['url'], f"Section {sl['no']}")
            if not sec_resp:
                continue
            
            sec_soup = BeautifulSoup(sec_resp.text, 'html.parser')
            
            # Extract content - usually in a div with specific classes
            # IndiaCode uses specific layout for section text
            content_div = sec_soup.find('div', class_='section-content') or \
                          sec_soup.find('div', id='section-content') or \
                          sec_soup.find('td', class_='section_text')
            
            if content_div:
                content = content_div.get_text(separator='\n').strip()
            else:
                # Fallback: Look for the largest text block
                content = "[Content Extraction Failed]"
            
            sections.append({
                "number": sl['no'],
                "title": sl['title'],
                "content": content
            })
            
            # Delay between sections
            time.sleep(1)
            
    except Exception as e:
        print(f"\n❌ Unexpected error scraping {act_id}: {e}")
    finally:
        # Save whatever we collected
        output_file = DATA_DIR / f"{act_id}.json"
        data = {
            **config,
            "sections": sections
        }
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n✅ Saved {len(sections)} sections to {output_file}")

def main():
    print("⚖️ Nyaya AI: IndiaCode Bare Act Scraper")
    print(f"Target Directory: {DATA_DIR}")
    
    for act_id, config in ACTS.items():
        scrape_act(act_id, config)
        # Delay between acts
        time.sleep(2)

    print("\n🎉 Scraping complete!")

if __name__ == "__main__":
    main()
