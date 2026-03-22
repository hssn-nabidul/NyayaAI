import httpx
import time
import json
import os
import re
from bs4 import BeautifulSoup
from pathlib import Path
import urllib.parse

# Configuration
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
        "url": "https://indiacode.nic.in/handle/123456789/2263",
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
    "constitution": {
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
        "url": "https://indiacode.nic.in/handle/123456789/20946",
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
    }
}

OUTPUT_DIR = Path("frontend/src/data/acts")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
}

client = httpx.Client(headers=HEADERS, timeout=30.0, follow_redirects=True)

def fetch_with_retry(url, label="Page", is_ajax=False):
    """Fetch URL with retry logic for 403/429."""
    headers = HEADERS.copy()
    if is_ajax:
        headers["X-Requested-With"] = "XMLHttpRequest"
        
    try:
        resp = client.get(url, headers=headers)
        if resp.status_code in [403, 429]:
            print(f"\n⚠️  Received {resp.status_code} for {label}. Waiting 10s and retrying...")
            time.sleep(10)
            resp = client.get(url, headers=headers)
        
        resp.raise_for_status()
        return resp
    except Exception as e:
        print(f"\n❌  Error fetching {label}: {e}")
        return None

def extract_section_links(soup):
    """Extract section links and their params from the handle page."""
    sections = []
    links = soup.find_all('a', href=True)
    
    for a in links:
        href = a['href']
        if 'sectionId=' in href or 'sectionID=' in href or 'articleno=' in href:
            text = a.get_text(strip=True)
            # Match "Section 1. Title" or "Art. 14. Title" or "1. Title"
            match = re.match(r'^(?:Section|Art\.?|Art)?\s*(\w+)\.?\s*(.*)', text, re.IGNORECASE)
            if match:
                number = match.group(1)
                title = match.group(2).strip() or text
                
                # Parse actid and sectionId from href
                parsed = urllib.parse.urlparse(href)
                params = urllib.parse.parse_qs(parsed.query)
                
                actid = params.get('actid', [None])[0]
                secId = params.get('sectionId', params.get('sectionID', params.get('articleno', [None])))[0]
                
                if actid and secId:
                    sections.append({
                        "number": number,
                        "title": title,
                        "actid": actid,
                        "sectionID": secId
                    })
    return sections

def scrape_act(slug, config):
    print(f"Scraping {config['short_title']}...")
    
    # 1. Get the handle page
    resp = fetch_with_retry(config['url'], f"{config['short_title']} Handle")
    if not resp:
        return

    soup = BeautifulSoup(resp.text, 'html.parser')
    section_links = extract_section_links(soup)
    
    if not section_links:
        # Try browse view
        browse_url = config['url'] + "?view_type=browse"
        resp = fetch_with_retry(browse_url, f"{config['short_title']} Browse")
        if resp:
            soup = BeautifulSoup(resp.text, 'html.parser')
            section_links = extract_section_links(soup)

    if not section_links:
        print(f"   No sections found for {config['short_title']}. Skipping.")
        return

    print(f"   Found {len(section_links)} sections. Starting content extraction...")
    
    total = len(section_links)
    final_sections = []
    
    for i, sec in enumerate(section_links):
        print(f"   ➜ {config['short_title']}... Section {i+1}/{total}: {sec['number']} ", end='\r')
        
        # 1 second delay between section fetches
        time.sleep(1)
        
        # Construct AJAX URL
        ajax_url = f"https://www.indiacode.nic.in/SectionPageContent?actid={sec['actid']}&sectionID={sec['sectionID']}"
        
        ajax_resp = fetch_with_retry(ajax_url, f"Sec {sec['number']} Content", is_ajax=True)
        if not ajax_resp:
            continue
            
        try:
            data = ajax_resp.json()
            content_html = data.get('content', '')
            # Clean HTML to text
            sec_soup = BeautifulSoup(content_html, 'html.parser')
            content = sec_soup.get_text(separator='\n', strip=True)
            
            final_sections.append({
                "number": sec['number'],
                "title": sec['title'],
                "content": content
            })
        except Exception as e:
            print(f"\n   Failed to parse JSON for Section {sec['number']}: {e}")
            continue
            
        # Save partial progress
        if (i + 1) % 50 == 0:
            save_act_data(slug, config, final_sections)

    save_act_data(slug, config, final_sections)
    print(f"\n✅  Completed {config['short_title']} ({len(final_sections)} sections).")

def save_act_data(slug, config, sections):
    data = {
        "title": config["title"],
        "shortTitle": config["short_title"],
        "year": config["year"],
        "slug": slug,
        "replaces": config.get("replaces"),
        "totalSections": len(sections),
        "sections": sections
    }
    file_path = OUTPUT_DIR / f"{slug}.json"
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    print("⚖️  Nyaya Act Scraper v2: AJAX Engine")
    print("-" * 40)
    
    for slug, config in ACTS.items():
        try:
            scrape_act(slug, config)
            # 2 second delay between each act request
            time.sleep(2)
        except KeyboardInterrupt:
            print("\n🛑  Scraper stopped by user.")
            break
        except Exception as e:
            print(f"\n💥  Critical error scraping {slug}: {e}")
            continue
            
    print("-" * 40)
    print("🎉  All tasks finished.")

if __name__ == "__main__":
    main()
