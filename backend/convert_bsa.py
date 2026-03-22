import sys
import json
import os
import re

def roman_to_int(s):
    roman = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
    try:
        res = 0
        for i in range(len(s)):
            if i > 0 and roman.get(s[i], 0) > roman.get(s[i - 1], 0):
                res += roman.get(s[i], 0) - 2 * roman.get(s[i - 1], 0)
            else:
                res += roman.get(s[i], 0)
        return res
    except:
        return 0

def convert():
    if len(sys.argv) < 2:
        print("Usage: py -3.11 convert_bsa.py path/to/bsa-ocr.json")
        sys.exit(1)
        
    input_path = sys.argv[1]
    
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    elements = []
    
    if isinstance(data, dict):
        if "content" in data:
            data = [data]
        elif "pages" in data:
            data = data["pages"]
            
    for page in data:
        page_id = page.get("page_id", 0)
        content = page.get("content", [])
        
        for item in content:
            text = item.get("text", "").strip()
            
            # ignores
            if text == "." or text == ",," or len(text) < 2:
                continue
            
            position = item.get("position", [0, 0, 0, 0, 0, 0, 0, 0])
            y1 = position[1] if len(position) >= 2 else 0
            x1 = position[0] if len(position) >= 1 else 0
            
            # page number ignore (y > 750 and numeric)
            if y1 > 750 and re.match(r'^\d+$', text):
                continue
                
            elements.append({
                "page_id": page_id,
                "y": y1,
                "x": x1,
                "text": text
            })
            
    # sort by page_id (asc), y-position (top to bottom), x-position (left to right)
    elements.sort(key=lambda e: (e["page_id"], e["y"], e["x"]))
    
    # concatenate into a clean string
    concatenated_text = " ".join([e["text"] for e in elements])

    output = {
        "id": "bsa-2023",
        "title": "Bharatiya Sakshya Adhiniyam",
        "short_title": "BSA",
        "year": 2023,
        "replaces": "Indian Evidence Act, 1872",
        "source": "indiacode.nic.in",
        "total_sections": 0,
        "chapters": []
    }

    # regex patterns for CHAPTER and sections (1. ) 
    pattern = r'\bCHAPTER\s+([IVXLCDM]+|\d+)\b|(?<=\s|^)(\d+)\.\s+'
    matches = list(re.finditer(pattern, concatenated_text))
    
    tokens = []
    last_idx = 0
    
    for m in matches:
        start, end = m.span()
        text_before = concatenated_text[last_idx:start].strip()
        if text_before:
            tokens.append({"type": "text", "content": text_before})
            
        if m.group(1): # Chapter
            tokens.append({"type": "chapter", "value": m.group(1)})
        elif m.group(2): # Section
            tokens.append({"type": "section", "value": m.group(2)})
            
        last_idx = end
        
    text_after = concatenated_text[last_idx:].strip()
    if text_after:
        tokens.append({"type": "text", "content": text_after})
        
    chapters = []
    curr_chapter = None
    curr_section = None
    
    # Constructing segments
    for token in tokens:
        if token["type"] == "text":
            if curr_section:
                curr_section["raw_text"] = curr_section.get("raw_text", "") + " " + token["content"]
            elif curr_chapter:
                curr_chapter["raw_text"] = curr_chapter.get("raw_text", "") + " " + token["content"]
        elif token["type"] == "chapter":
            val_str = token["value"]
            if val_str.isdigit():
                c_num = int(val_str)
            else:
                c_num = roman_to_int(val_str)
                if c_num == 0:
                    c_num = val_str
                    
            curr_chapter = {
                "number": c_num,
                "title": "",
                "sections": [],
                "raw_text": ""
            }
            curr_section = None
            chapters.append(curr_chapter)
        elif token["type"] == "section":
            if not curr_chapter:
                curr_chapter = {
                    "number": 1,
                    "title": "PRELIMINARY",
                    "sections": [],
                    "raw_text": ""
                }
                chapters.append(curr_chapter)
                
            curr_section = {
                "number": token["value"],
                "raw_text": ""
            }
            curr_chapter["sections"].append(curr_section)

    section_count = 0
    for chapter in chapters:
        # Chapter title extraction
        chapter_title = chapter.get("raw_text", "").strip()
        chapter["title"] = chapter_title
        if "raw_text" in chapter:
            del chapter["raw_text"]
            
        for sec in chapter["sections"]:
            section_count += 1
            raw = sec.get("raw_text", "").strip()
            # Title ends at "—" or "." or next section number
            title_match = re.search(r'^(.*?)(?:—|–|-|\.\s|\.$)', raw)
            if title_match:
                sec["title"] = title_match.group(1).strip()
                sec["text"] = raw[title_match.end():].strip()
            else:
                sec["title"] = ""
                sec["text"] = raw
                
            if "raw_text" in sec:
                del sec["raw_text"]
                
    output["chapters"] = chapters
    output["total_sections"] = section_count
    
    # Save output to: frontend/src/lib/data/acts/bsa-2023.json
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(base_dir, "frontend", "src", "lib", "data", "acts")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "bsa-2023.json")
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
        
    print(f"Chapters found: {len(chapters)}")
    print(f"Sections found: {section_count}")
    print(f"Saved to: bsa-2023.json")

if __name__ == '__main__':
    convert()
