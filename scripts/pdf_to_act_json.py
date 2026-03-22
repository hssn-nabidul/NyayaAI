import PyPDF2
import json
import re
import os
from pathlib import Path

def clean_text_formatting(text):
    """
    Remove messy PDF line breaks and preserve words in a readable paragraph format.
    """
    # 1. Replace all single newlines with spaces
    # This prevents sentences from being broken in the middle
    text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)
    
    # 2. Fix multiple spaces caused by the newline removal
    text = re.sub(r' +', ' ', text)
    
    # 3. Re-insert logical breaks for legal formatting
    # Break before subsections like (1), (2) or (a), (b)
    # But only if they are at the start of a logical unit
    text = re.sub(r' (\(\d+\)) ', r'\n\1 ', text)
    text = re.sub(r' (\([a-z]\)) ', r'\n\1 ', text)
    
    # 4. Remove page numbers and headers that might have been missed
    text = re.sub(r'\n\s*\d+\s*\n', '\n', text)
    
    return text.strip()

def parse_pdf_to_act(pdf_path, act_slug, act_title, short_title, year, category):
    print(f"📄 Processing {pdf_path}...")
    try:
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            full_text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    full_text += page_text + "\n"
        
        # Initial cleanup of headers
        headers = [
            r'The Bharatiya Sakshya Adhiniyam, 2023',
            r'Bharatiya Nagarik Suraksha Sanhita, 2023',
            r'Bharatiya Nyaya Sanhita, 2023',
        ]
        for h in headers:
            full_text = re.sub(h, '', full_text, flags=re.IGNORECASE)

        preamble_match = re.search(r'BE it enacted by Parliament', full_text, re.IGNORECASE)
        start_search_at = preamble_match.end() if preamble_match else 0
            
        sections = []
        current_num = 1
        search_from = start_search_at
        current_chapter = "General"
        
        while True:
            # Look for Section start
            pattern = rf'(?:^|\n|\s)({current_num})\.[\s––—]*'
            sec_match = re.search(pattern, full_text[search_from:])
            
            if not sec_match:
                # Fallback: try without dot
                sec_match = re.search(rf'(?:^|\n|\s)({current_num})[\s––—]+[A-Z]', full_text[search_from:])
                if not sec_match:
                    break
            
            # Check for Chapter marker BEFORE this section
            # We look in the text since the last section
            pre_sec_text = full_text[search_from:search_from + sec_match.start()]
            chap_match = re.search(r'(CHAPTER|PART)\s+([IVXLCDM\d]+)\s*\n([^\n]+)', pre_sec_text, re.IGNORECASE)
            if chap_match:
                current_chapter = f"{chap_match.group(1)} {chap_match.group(2)}: {chap_match.group(3).strip()}"

            match_start = search_from + sec_match.start()
            
            # Find next section to determine end
            next_num = current_num + 1
            next_pattern = rf'(?:^|\n|\s)({next_num})\.[\s––—]*'
            next_sec_match = re.search(next_pattern, full_text[match_start + 5:])
            
            if next_sec_match:
                end_pos = match_start + 5 + next_sec_match.start()
            else:
                end_pos = full_text.find("THE FIRST SCHEDULE", match_start)
                if end_pos == -1:
                    end_pos = len(full_text)
            
            section_chunk = full_text[match_start:end_pos].strip()
            content_all = re.sub(rf'^{current_num}\.[\s––—]*', '', section_chunk)
            
            # Split title and content
            title_sep = re.search(r'[\. ]*[––—]\s*|\.\s+(?=\()|\n', content_all)
            if title_sep:
                title = content_all[:title_sep.start()].strip()
                content = content_all[title_sep.end():].strip()
            else:
                parts = content_all.split('\n', 1)
                title = parts[0].strip()
                content = parts[1].strip() if len(parts) > 1 else ""

            # APPLY INTENSE FORMATTING CLEANUP
            formatted_content = clean_text_formatting(content)

            sections.append({
                "number": str(current_num),
                "title": title.replace('\n', ' ').strip(),
                "content": formatted_content,
                "chapter": current_chapter
            })
            
            search_from = end_pos
            current_num += 1
            if current_num > 2000: break
            
        print(f"✅ Extracted {len(sections)} sections.")
        
        return {
            "title": act_title, "shortTitle": short_title, "year": year,
            "slug": act_slug, "category": category, "sections": sections
        }
    except Exception as e:
        print(f"❌ Error processing {pdf_path}: {e}")
        return None

def main():
    PDF_DIR = Path("pdfs")
    OUT_DIR = Path("frontend/src/data/acts")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    
    config = [
        {"pdf": "BSA 2023.pdf", "slug": "bsa-2023", "title": "Bharatiya Sakshya Adhiniyam, 2023", "short": "BSA", "year": 2023, "cat": "criminal"},
        {"pdf": "BNSS 23.pdf", "slug": "bnss-2023", "title": "Bharatiya Nagarik Suraksha Sanhita, 2023", "short": "BNSS", "year": 2023, "cat": "criminal"},
        {"pdf": "BNS 23.pdf", "slug": "bns-2023", "title": "Bharatiya Nyaya Sanhita, 2023", "short": "BNS", "year": 2023, "cat": "criminal"}
    ]
    
    for item in config:
        pdf_path = PDF_DIR / item["pdf"]
        if not pdf_path.exists(): continue
        data = parse_pdf_to_act(str(pdf_path), item["slug"], item["title"], item["short"], item["year"], item["cat"])
        if data:
            with open(OUT_DIR / f"{item['slug']}.json", 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"💾 Saved to {item['slug']}.json")

if __name__ == "__main__":
    main()
