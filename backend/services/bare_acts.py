import httpx
import os
import json
import re
from typing import List, Dict, Any, Optional
from pathlib import Path
import structlog
from services.utils import model, _clean_json_response

logger = structlog.get_logger()

# Cache directory for Bare Acts
CACHE_DIR = Path(__file__).parent.parent / "cache" / "acts"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

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

def get_gemini_model():
    from services.utils import model, _clean_json_response
    return model, _clean_json_response

async def get_all_acts() -> List[Dict[str, str]]:
    """Return list of priority acts."""
    return PRIORITY_ACTS

async def hydrate_act_with_ai(act_title: str, section_number: str) -> Dict[str, str]:
    """
    Use Gemini to fetch the actual text of a section.
    """
    model, _clean_json_response = get_gemini_model()
    prompt = f"""
    You are a professional legal research database.
    Provide the exact, verbatim text of Section {section_number} of the '{act_title}' (Indian Law).
    
    Respond ONLY with a valid JSON object:
    {{
      "number": "{section_number}",
      "title": "Exact Official Section Title",
      "content": "Verbatim text including all sub-sections..."
    }}
    
    If text is absolutely unavailable, set content to "[Content temporarily unavailable]".
    """
    try:
        response = model.generate_content(prompt)
        data = _clean_json_response(response.text)
        if not data.get("title") or data["title"].strip() == "":
            data["title"] = f"Section {section_number}"
        return data
    except Exception as e:
        logger.error("ai_hydration_failed", act=act_title, section=section_number, error=str(e))
        return {
            "number": section_number,
            "title": f"Section {section_number}",
            "content": "[Content temporarily unavailable]"
        }

async def fetch_act_toc(act_title: str) -> List[Dict[str, str]]:
    """
    Use Gemini to fetch the full Table of Contents.
    """
    model, _clean_json_response = get_gemini_model()
    prompt = f"""
    Provide the complete Table of Contents for the '{act_title}' (Indian Law).
    List every section number and its title. Include at least 150 sections if they exist.
    
    Respond ONLY with a valid JSON array of objects:
    [ {{"number": "1", "title": "..."}}, {{"number": "2", "title": "..."}} ]
    """
    try:
        response = model.generate_content(prompt)
        sections = _clean_json_response(response.text)
        if isinstance(sections, list):
            for s in sections:
                if not s.get("title"): s["title"] = f"Section {s.get('number')}"
            return sections
        return []
    except Exception as e:
        logger.error("toc_fetch_failed", act=act_title, error=str(e))
        return []

def sort_sections(sections: List[Dict[str, Any]]):
    def get_key(s):
        num = str(s.get("number", "999"))
        match = re.match(r'(\d+)', num)
        if match:
            return (int(match.group(1)), num[match.end():])
        return (999, num)
    sections.sort(key=get_key)

async def fetch_and_cache_act(act_slug: str) -> Dict[str, Any]:
    cache_path = CACHE_DIR / f"{act_slug}.json"
    data = None
    
    if cache_path.exists():
        with open(cache_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                content_str = json.dumps(data)
                # Purge if it has placeholders or very few sections
                if "[Placeholder content]" in content_str or len(data.get("sections", [])) < 5:
                    data = None
            except:
                data = None

    if not data:
        act_title = next((a["title"] for a in PRIORITY_ACTS if a["slug"] == act_slug), act_slug)
        data = {"title": act_title, "slug": act_slug, "sections": []}
        data["sections"] = await fetch_act_toc(act_title)
        
        # Immediate hydrate Section 1
        s1 = await hydrate_act_with_ai(act_title, "1")
        data["sections"] = [s for s in data["sections"] if str(s.get("number")) != "1"]
        data["sections"].append(s1)
        sort_sections(data["sections"])
        
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
    return data

async def get_act_details(act_slug: str) -> Dict[str, Any]:
    return await fetch_and_cache_act(act_slug)

async def search_in_act(act_slug: str, query: str) -> List[Dict[str, Any]]:
    act_data = await get_act_details(act_slug)
    q = query.lower()
    return [s for s in act_data.get("sections", []) if q in str(s.get("number")).lower() or q in s.get("title").lower()]

async def get_section_details(act_slug: str, section_number: str) -> Optional[Dict[str, Any]]:
    act_data = await get_act_details(act_slug)
    act_title = act_data["title"]
    
    target = None
    for s in act_data.get("sections", []):
        if str(s.get("number")) == section_number:
            # If content is missing or is a failure placeholder, hydrate it
            if not s.get("content") or "[Content temporarily unavailable]" in s.get("content"):
                target = await hydrate_act_with_ai(act_title, section_number)
                # Update and save only if success
                if "[Content temporarily unavailable]" not in target["content"]:
                    act_data["sections"] = [x for x in act_data["sections"] if str(x.get("number")) != section_number]
                    act_data["sections"].append(target)
                    sort_sections(act_data["sections"])
                    with open(CACHE_DIR / f"{act_slug}.json", "w", encoding="utf-8") as f:
                        json.dump(act_data, f, ensure_ascii=False, indent=2)
            else:
                target = s
            break
            
    if not target:
        target = await hydrate_act_with_ai(act_title, section_number)
        if "[Content temporarily unavailable]" not in target["content"]:
            act_data["sections"].append(target)
            sort_sections(act_data["sections"])
            with open(CACHE_DIR / f"{act_slug}.json", "w", encoding="utf-8") as f:
                json.dump(act_data, f, ensure_ascii=False, indent=2)
                
    return target
