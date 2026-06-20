"""
Citation Extractor — Parses Indian judgment text for legal citations.
No external API calls needed. Works entirely on the raw text.
"""

import re
from typing import List, Dict, Any

# ─────────────────────────────────────────────────────────────────────────────
# CITATION PATTERNS
# These cover the most common Indian legal citation formats.
# ─────────────────────────────────────────────────────────────────────────────

CITATION_PATTERNS = [
    # ── Standard Formats ──
    
    # (1994) 2 SCC 694
    (r'\((\d{4})\)\s+(\d+)\s+(SCC|SCALE|JT)\s+(\d+)', 'SCC'),
    # [2017] 10 SCC 1
    (r'\[(\d{4})\]\s+(\d+)\s+(SCC|SCALE|JT)\s+(\d+)', 'SCC'),
    # AIR 1952 SC 196
    (r'AIR\s+(\d{4})\s+(SC|HP|MP|AP|Kant|Mad|Bom|Guj|Del|Cal|Ker|Raj|All|Pat|J&K)\s+(\d+)', 'AIR'),
    # 1959 SCR 629
    (r'(\d{4})\s+SCR\s+(\d+)', 'SCR'),
    # (2005) 2 CriLJ 1234
    (r'\((\d{4})\)\s+\d+\s+(CriLJ)\s+\d+', 'CriLJ'),
    # (2005) 3 CompLJ 456
    (r'\((\d{4})\)\s+\d+\s+(CompLJ)\s+\d+', 'CompLJ'),
    # MANU/SC/0001/2022 type (Indian Kanoon neutral citations)
    (r'(MANU/[A-Z]+/\d+/\d{4})', 'MANU'),
    # 2022 SCC OnLine SC 1
    (r'(\d{4})\s+SCC\s+OnLine\s+(SC|HP|MP|AP|Kant|Mad|Bom|Guj|Del|Cal|Ker|Raj|All|Pat)\s+(\d+)', 'SCC Online'),
    # 1995 (2) SCALE 1
    (r'(\d{4})\s+\((\d+)\)\s+SCALE\s+(\d+)', 'SCALE'),
    # 40 ELT 123 (SC)
    (r'(\d+)\s+(ELT|STP|STC|ITR)\s+(\d+)\s+\((SC|HP|MP|AP|Kant|Mad|Bom|Guj|Del|Cal|Ker)\)', 'Tax'),
    
    # ── Indian Kanoon text format (Year-first) ──
    # These appear in the raw HTML text from the IK API
    
    # 1978 AIR 597  (year AIR page)
    (r'(\d{4})\s+AIR\s+(\d+)', 'AIR (IK)'),
    # 1978 SCC (1) 248  (year SCC (vol) page)
    (r'(\d{4})\s+SCC\s+\((\d+)\)\s+(\d+)', 'SCC (IK)'),
    # 1978 SCR (2) 621  (year SCR (vol) page)
    (r'(\d{4})\s+SCR\s+\((\d+)\)\s+(\d+)', 'SCR (IK)'),
    # 1978 SCALE 1  (year SCALE page)
    (r'(\d{4})\s+SCALE\s+(\d+)', 'SCALE (IK)'),
    # 1994 2 SCC 694  (year vol SCC page — no parentheses)
    (r'(\d{4})\s+(\d+)\s+SCC\s+(\d+)', 'SCC (compact)'),
    # 1994 2 SCR 1  (year vol SCR page)
    (r'(\d{4})\s+(\d+)\s+SCR\s+(\d+)', 'SCR (compact)'),
    # 1978 CriLJ 1234
    (r'(\d{4})\s+CriLJ\s+(\d+)', 'CriLJ (IK)'),

    # ── Indian Kanoon compact formats (no spaces between components) ──
    # These appear in the Equivalent Citations header of IK documents
    # e.g., AIR1978SC597  or  (1978)1SCC248  or  [1978]2SCR621

    # AIR1978SC597 (no spaces)
    (r'AIR\s*(\d{4})\s*(?:SC|HP|MP|AP|Kant|Mad|Bom|Guj|Del|Cal|Ker|Raj|All|Pat|J&K)\s*(\d+)', 'AIR (compact IK)'),
    # (1978)1SCC248 (no spaces after parentheses)
    (r'\((\d{4})\)\s*(\d+)\s*(SCC|SCALE|JT)\s*(\d+)', 'SCC (compact IK)'),
    # [1978]2SCR621 (bracket format, no spaces)
    (r'\[(\d{4})\]\s*(\d+)\s*(SCR|SCC|SCALE|JT)\s*(\d+)', 'Bracket (IK)'),
    # 1978 2 SCR 621 (year vol journal page)
    (r'(\d{4})\s+(\d+)\s+(SCR|SCC|SCALE|JT)\s+(\d+)', 'Compact (IK)'),
    
]


def extract_citations(text: str, max_citations: int = 40) -> List[Dict[str, Any]]:
    """
    Extract Indian legal citations from judgment text using regex patterns.
    
    Returns a deduplicated list of citation objects:
    [{ "citation": "(1994) 2 SCC 694", "year": 1994, "type": "SCC", "doc_id": null }]
    """
    seen = set()
    citations = []

    for pattern, citation_type in CITATION_PATTERNS:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            full_match = match.group(0).strip()
            if full_match not in seen:
                seen.add(full_match)
                
                # Extract year from the first capture group
                year_str = match.group(1)
                year = int(year_str) if year_str and year_str.isdigit() else None
                
                # Validate year is in a reasonable range
                if year is not None and (year < 1800 or year > 2099):
                    continue
                
                citations.append({
                    "citation": full_match,
                    "year": year,
                    "type": citation_type,
                    "doc_id": None,  # Will be resolved if searched
                })
    
    # Sort by year descending (newest first), then by type
    citations.sort(key=lambda c: -(c["year"] or 0))
    
    return citations[:max_citations]


def extract_citator_info(doc_text: str) -> List[Dict[str, Any]]:
    """
    Extract the CITATOR INFO section from Indian Kanoon judgment text.
    The CITATOR INFO section lists subsequent cases that have cited this judgment.
    Format: STATUS  YEAR  COURT  PAGE  (paragraphs)
    e.g., R    1978 SC1514    (12)
          RF   1979 SC 478    (90,91A,129,159)

    Returns a list of citation dicts with type "citator".
    """
    # Find the CITATOR INFO section
    citator_start = doc_text.find("CITATOR INFO")
    if citator_start < 0:
        return []

    # Extract until the next section or end of content
    citator_end = doc_text.find("</pre>", citator_start)
    if citator_end < 0:
        citator_end = citator_start + 3000

    citator_section = doc_text[citator_start:citator_end]

    # Pattern: Optional STATUS prefix, then YYYY COURT PAGE
    # e.g., R    1978 SC1514  or  RF    1979 SC 478
    pattern = r'(?:[A-Z&]+\s+)?(\d{4})\s+(SC|HP|MP|AP|Kant|Mad|Bom|Guj|Del|Cal|Ker|Raj|All|Pat|J&K|LB)\s*(\d{3,5})'

    citations = []
    seen = set()

    for match in re.finditer(pattern, citator_section):
        full_match = match.group(0).strip()
        # Deduplicate by the core citation (year + court + page)
        core = f"{match.group(1)} {match.group(2)} {match.group(3)}"
        if core in seen:
            continue
        seen.add(core)

        year = int(match.group(1))
        if year < 1800 or year > 2099:
            continue

        title = f"Unknown (citing this case)"

        citations.append({
            "citation": core,
            "year": year,
            "type": "citator",
            "doc_id": None,
            "title": title,
        })

    return citations


def case_names_from_citations(citations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Enhance citation objects with common short case names.
    This is a lookup table for well-known cases by their citation.
    Only the most commonly cited Indian cases are included.
    """
    LANDMARK_CASES = {
        "(1973) 4 SCC 225": "Kesavananda Bharati v. State of Kerala",
        "AIR 1973 SC 1461": "Kesavananda Bharati v. State of Kerala",
        "(1978) 1 SCC 248": "Maneka Gandhi v. Union of India",
        "AIR 1978 SC 597": "Maneka Gandhi v. Union of India",
        "AIR 1950 SC 27": "A.K. Gopalan v. State of Madras",
        "AIR 1962 SC 305": "Kharak Singh v. State of Uttar Pradesh",
        "(1970) 1 SCC 248": "R.C. Cooper v. Union of India",
        "AIR 1970 SC 564": "R.C. Cooper v. Union of India",
        "(1997) 1 SCC 15": "Vishaka v. State of Rajasthan",
        "AIR 2017 SC 4161": "Justice K.S. Puttaswamy v. Union of India",
        "(2017) 10 SCC 1": "Justice K.S. Puttaswamy v. Union of India",
        "(2005) 6 SCC 344": "Naz Foundation v. Govt. of NCT of Delhi",
        "(2018) 1 SCC 1": "Navtej Singh Johar v. Union of India",
        "(1950) SCR 88": "A.K. Gopalan v. State of Madras",
        "AIR 1952 SC 196": "Golaknath v. State of Punjab",
        "(1967) 2 SCR 762": "Golaknath v. State of Punjab",
        "AIR 1967 SC 1643": "Golaknath v. State of Punjab",
        "AIR 2013 SC 2329": "NALSA v. Union of India",
        "(2014) 5 SCC 438": "NALSA v. Union of India",
        "AIR 1996 SC 826": "S.R. Bommai v. Union of India",
        "(1994) 3 SCC 1": "S.R. Bommai v. Union of India",
        "AIR 1975 SC 1799": "ADM Jabalpur v. Shivakant Shukla",
        "(1976) 2 SCC 521": "ADM Jabalpur v. Shivakant Shukla",
        "AIR 1950 SC 124": "Romesh Thappar v. State of Madras",
        "AIR 1994 SC 268": "Unni Krishnan v. State of Andhra Pradesh",
        "(1993) 1 SCC 645": "Unni Krishnan v. State of Andhra Pradesh",
        "AIR 2002 SC 238": "TMA Pai Foundation v. State of Karnataka",
        "(2002) 8 SCC 481": "TMA Pai Foundation v. State of Karnataka",
        "AIR 2000 SC 1736": "B.R. Enterprises v. State of Uttar Pradesh",
        "AIR 1976 SC 578": "Bachan Singh v. State of Punjab",
        "(1980) 2 SCC 684": "Bachan Singh v. State of Punjab",
        "AIR 1978 SC 1025": "Mithun v. State of Punjab",
        "(1983) 2 SCC 277": "Mithun v. State of Punjab",
        "AIR 2010 SC 3678": "Vodafone International Holdings v. Union of India",
        "AIR 2009 SC 2309": "Vodafone Essar Ltd. v. Union of India",
        "AIR 2005 SC 1788": "State of Punjab v. Baldev Singh",
        "(1999) 6 SCC 172": "State of Punjab v. Baldev Singh",
        "AIR 2018 SC 4117": "Royale Venkateshwara Chit Fund v. Union of India",

        # IK format variations (year-first, no parentheses)
        "1978 SCC (1) 248": "Maneka Gandhi v. Union of India",
        "1978 AIR 597": "Maneka Gandhi v. Union of India",
        "1978 SCR (2) 621": "Maneka Gandhi v. Union of India",
        "1950 SCR 869": "A.K. Gopalan v. State of Madras",
        "AIR 1960 SC 1080": "T.M.A. Pai Foundation v. State of Karnataka",
    }
    
    for c in citations:
        cit = c.get("citation", "")
        if cit in LANDMARK_CASES:
            c["title"] = LANDMARK_CASES[cit]
    
    return citations
