import os
import json
import re
from typing import List, Dict, Any, Optional
from pathlib import Path
import structlog

logger = structlog.get_logger()

# Point directly to the frontend's static data directory
FRONTEND_DATA_DIR = Path(__file__).parent.parent.parent / "frontend" / "src" / "data" / "acts"

PRIORITY_ACTS = [
    {"title": "Bharatiya Nyaya Sanhita 2023", "slug": "bns-2023"},
    {"title": "Bharatiya Nagarik Suraksha Sanhita 2023", "slug": "bnss-2023"},
    {"title": "Bharatiya Sakshya Adhiniyam 2023", "slug": "bsa-2023"},
    {"title": "Constitution of India", "slug": "constitution-of-india"},
    {"title": "Indian Penal Code 1860", "slug": "ipc-1860"},
    {"title": "Code of Criminal Procedure 1973", "slug": "crpc-1973"},
    {"title": "Indian Evidence Act 1872", "slug": "evidence-act-1872"},
    {"title": "Civil Procedure Code 1908", "slug": "cpc-1908"},
    {"title": "Contract Act 1872", "slug": "contract-act-1872"},
    {"title": "IT Act 2000", "slug": "it-act-2000"},
    {"title": "Consumer Protection Act 2019", "slug": "consumer-protection-2019"},
    {"title": "RTI Act 2005", "slug": "rti-act-2005"},
    {"title": "POCSO Act 2012", "slug": "pocso-act-2012"},
    {"title": "Domestic Violence Act 2005", "slug": "domestic-violence-2005"},
]

async def get_all_acts() -> List[Dict[str, str]]:
    """Return list of priority acts."""
    return PRIORITY_ACTS

def sort_sections(sections: List[Dict[str, Any]]):
    def get_key(s):
        num = str(s.get("number", "999"))
        match = re.match(r'(\d+)', num)
        if match:
            return (int(match.group(1)), num[match.end():])
        return (999, num)
    sections.sort(key=get_key)

async def get_act_details(act_slug: str) -> Dict[str, Any]:
    """
    Fetch the bare act details directly from the locally stored JSON files.
    """
    file_path = FRONTEND_DATA_DIR / f"{act_slug}.json"
    
    if not file_path.exists():
        logger.warning("act_json_not_found", act=act_slug, path=str(file_path))
        act_title = next((a["title"] for a in PRIORITY_ACTS if a["slug"] == act_slug), act_slug)
        return {"title": act_title, "slug": act_slug, "sections": []}
        
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        if "sections" in data:
            sort_sections(data["sections"])
            
        return data
    except Exception as e:
        logger.error("act_json_read_error", act=act_slug, error=str(e))
        act_title = next((a["title"] for a in PRIORITY_ACTS if a["slug"] == act_slug), act_slug)
        return {"title": act_title, "slug": act_slug, "sections": []}

async def search_in_act(act_slug: str, query: str) -> List[Dict[str, Any]]:
    act_data = await get_act_details(act_slug)
    q = query.lower()
    return [s for s in act_data.get("sections", []) if q in str(s.get("number")).lower() or q in s.get("title").lower()]

async def get_section_details(act_slug: str, section_number: str) -> Optional[Dict[str, Any]]:
    """
    Get a specific section's details from the local JSON file.
    """
    act_data = await get_act_details(act_slug)
    
    for s in act_data.get("sections", []):
        if str(s.get("number")) == str(section_number):
            # Ensure we return valid content if found
            if not s.get("content"):
                s["content"] = "[Content not populated in local database]"
            return s
            
    logger.warning("section_not_found_in_json", act=act_slug, section=section_number)
    return None
