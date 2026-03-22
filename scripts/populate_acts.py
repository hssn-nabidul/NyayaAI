import asyncio
import sys
import json
import os
from pathlib import Path

# Add backend to path to use services
sys.path.append(str(Path(__file__).parent.parent / "backend"))

try:
    from services.bare_acts import get_all_acts, get_act_details, get_section_details, PRIORITY_ACTS
except ImportError:
    # If direct import fails, try relative to current script
    sys.path.append(str(Path(__file__).parent.parent))
    from backend.services.bare_acts import get_all_acts, get_act_details, get_section_details, PRIORITY_ACTS

# Output directory for frontend
DATA_DIR = Path(__file__).parent.parent / "frontend" / "src" / "data" / "acts"
DATA_DIR.mkdir(parents=True, exist_ok=True)

async def populate_acts():
    """
    Fetch all priority acts and their sections from Gemini/Cache
    and save them as JSON files in the frontend data directory.
    """
    print(f"🚀 Starting act population to {DATA_DIR}...")
    
    # Simple Category mapping
    category_map = {
        'bns-2023': 'criminal',
        'bnss-2023': 'criminal',
        'bsa-2023': 'criminal',
        'ipc-1860': 'criminal',
        'crpc-1973': 'criminal',
        'evidence-act-1872': 'criminal',
        'cpc-1908': 'civil',
        'contract-act-1872': 'civil',
        'it-act-2000': 'special',
        'consumer-protection-2019': 'special',
        'rti-act-2005': 'special',
        'pocso-act-2012': 'special',
        'domestic-violence-2005': 'special',
        'constitution-of-india': 'constitutional'
    }
    
    # Short Title mapping
    short_title_map = {
        'bns-2023': 'BNS',
        'bnss-2023': 'BNSS',
        'bsa-2023': 'BSA',
        'ipc-1860': 'IPC',
        'crpc-1973': 'CrPC',
        'evidence-act-1872': 'IEA',
        'cpc-1908': 'CPC',
        'contract-act-1872': 'ICA',
        'it-act-2000': 'IT Act',
        'consumer-protection-2019': 'CPA',
        'rti-act-2005': 'RTI',
        'pocso-act-2012': 'POCSO',
        'domestic-violence-2005': 'PWDVA',
        'constitution-of-india': 'COI'
    }

    acts = await get_all_acts()
    
    for act_info in acts:
        slug = act_info['slug']
        title = act_info['title']
        print(f"\n📂 Processing {title} ({slug})...")
        
        try:
            # 1. Get TOC and initial data
            details = await get_act_details(slug)
            
            output_file = DATA_DIR / f"{slug}.json"
            
            final_data = {
                "title": details.get("title", title),
                "shortTitle": short_title_map.get(slug, slug.split('-')[0].upper()),
                "year": int(slug.split('-')[-1]) if slug.split('-')[-1].isdigit() else 1950,
                "slug": slug,
                "category": category_map.get(slug, 'special'),
                "sections": details.get("sections", [])
            }
            
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(final_data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ Saved {len(final_data['sections'])} sections to {output_file.name}")
            
        except Exception as e:
            print(f"❌ Failed to process {slug}: {e}")

if __name__ == "__main__":
    asyncio.run(populate_acts())
