# prompts.py — Nyaya: All Gemini Prompt Templates
# This file is the single source of truth for every AI prompt in the app.
# Never write prompts inline in routers or services — always import from here.

# ─────────────────────────────────────────────────────────────────────────────
# CASE SUMMARY
# ─────────────────────────────────────────────────────────────────────────────

SUMMARY_PROMPT = """
You are a legal research assistant specialising in Indian law.
You are helping a fourth-year Indian law student study court judgments.

Analyse the following Indian court judgment and produce a structured summary.
Respond ONLY with a valid JSON object. No preamble, no markdown fences, no explanation.

JSON structure required:
{{
  "plain_summary": "3-4 sentences explaining what this case is about in plain English. Avoid legal jargon. Write as if explaining to an intelligent non-lawyer.",
  "key_issues": ["Issue 1 framed as a question", "Issue 2", ...],
  "holding": "The court's decision in 2-3 sentences. What did they actually decide?",
  "area_of_law": ["Tag1", "Tag2", ...],
  "significance": "1-2 sentences on why this case matters and what it changed."
}}

Judgment text (may be truncated):
{judgment_text}
"""

# ─────────────────────────────────────────────────────────────────────────────
# NATURAL LANGUAGE SEARCH EXTRACTION
# ─────────────────────────────────────────────────────────────────────────────

NLP_SEARCH_PROMPT = """
You are a legal research assistant for Indian law.
A law student has described a legal situation. Extract the key legal terms for searching Indian case law.

Respond ONLY with a valid JSON object. No preamble, no markdown fences.

JSON structure required:
{{
  "legal_principles": ["Principle 1", "Principle 2"],
  "relevant_articles": ["Article 21", "Article 22"],
  "relevant_acts_sections": ["Section 57 CrPC", "Section 41 CrPC"],
  "landmark_cases_to_include": ["D.K. Basu", "Maneka Gandhi"],
  "kanoon_search_query": "a short 5-10 word search query optimised for Indian Kanoon full-text search",
  "area_of_law": "Primary area of law",
  "from_year": 1950,
  "to_year": 2024
}}

Note: from_year and to_year are optional. If the student specifies a period (e.g. "cases from the 70s", "judgments between 1980 and 1995"), extract those years. Otherwise, omit them or set to null.

Student's description:
{user_query}
"""

# ─────────────────────────────────────────────────────────────────────────────
# MOOT COURT PREP
# ─────────────────────────────────────────────────────────────────────────────

MOOT_PREP_PROMPT = """
You are a senior moot court coach specialising in Indian constitutional and public law.
A law student needs to prepare arguments for a moot competition.

Analyse the proposition and generate structured arguments for the requested side(s).
Ground every argument in actual Indian case law. Be specific about cases and principles.

Respond ONLY with a valid JSON object. No preamble, no markdown fences.

JSON structure required:
{{
  "petitioner": {{
    "arguments": [
      {{
        "heading": "Concise argument heading (as it would appear in a memorial)",
        "body": "2-3 sentence development of the argument with legal reasoning",
        "supporting_cases": [
          {{"title": "Case Name", "year": 2017, "citation": "AIR 2017 SC 4161", "relevance": "Why this case supports this argument"}}
        ]
      }}
    ],
    "key_cases": ["Case 1", "Case 2"],
    "anticipated_counter": "The strongest counter-argument from the respondent and how to rebut it"
  }},
  "respondent": {{
    "arguments": [...same structure...],
    "key_cases": [...],
    "anticipated_counter": "..."
  }}
}}

Note: If side is "petitioner" only, include only the petitioner object. Same for respondent.

Moot proposition:
{proposition}

Side: {side}
Format: {format}
"""

# ─────────────────────────────────────────────────────────────────────────────
# DRAFT ASSISTANT — CASE SUGGESTIONS
# ─────────────────────────────────────────────────────────────────────────────

DRAFT_SUGGEST_PROMPT = """
You are a legal research assistant for Indian law.
A law student is drafting a legal document. Identify the legal arguments being made and suggest relevant Indian cases to cite.

Respond ONLY with a valid JSON object. No preamble, no markdown fences.

JSON structure required:
{{
  "detected_arguments": ["Argument 1 being made", "Argument 2"],
  "suggestions": [
    {{
      "title": "Case Name",
      "court": "SC",
      "year": 1997,
      "citation": "(1997) 1 SCC 416",
      "reason": "Why this case is relevant to the draft text",
      "relevance_score": 0.97
    }}
  ]
}}

Rank by relevance_score (highest first). Maximum {max_suggestions} suggestions.

Draft text:
{draft_text}
"""

# ─────────────────────────────────────────────────────────────────────────────
# LEGAL DICTIONARY / TERM EXPLAINER
# ─────────────────────────────────────────────────────────────────────────────

DICTIONARY_PROMPT = """
You are a legal research assistant for Indian law.
Explain the following legal term or maxim clearly for a law student.

Respond ONLY with a valid JSON object. No preamble, no markdown fences.

JSON structure required:
{{
  "term": "The legal term",
  "definition": "A clear, concise definition in plain English (1-2 sentences)",
  "context_india": "How this term is applied or interpreted in the Indian legal system (2-3 sentences)",
  "landmark_cases": ["Case 1", "Case 2"],
  "related_terms": ["Term 1", "Term 2"]
}}

Legal term to explain:
{term}
"""

# ─────────────────────────────────────────────────────────────────────────────
# JUDGE PROFILE
# ─────────────────────────────────────────────────────────────────────────────

JUDGE_PROFILE_PROMPT = """
You are a legal analyst specialising in Indian judiciary.
Based on the information provided about this judge, generate a profile for law students.

Respond ONLY with a valid JSON object. No preamble, no markdown fences.

JSON structure required:
{{
  "ideological_tendency": "One of: Rights-expansive | Textualist | Pragmatist | Conservative | Centrist",
  "profile_summary": "2-3 sentences describing this judge's judicial philosophy, notable contributions, and significance for law students to know about.",
  "known_for": ["Brief phrase 1", "Brief phrase 2", "Brief phrase 3"]
}}

Judge name: {judge_name}
Court: {court}
Sample of their notable judgments:
{judgments_sample}
"""

# ─────────────────────────────────────────────────────────────────────────────
# KNOW YOUR RIGHTS
# ─────────────────────────────────────────────────────────────────────────────

RIGHTS_PROMPT = """
You are a human rights advocate in India. Explain the following fundamental right clearly for a common person.

Respond ONLY with a valid JSON object. No preamble, no markdown fences.

JSON structure required:
{{
  "right_name": "The Fundamental Right",
  "article": "Article number(s)",
  "simple_explanation": "A clear, empathetic explanation in 3-4 sentences for someone with no legal background.",
  "what_you_can_do": ["Practical application 1", "Practical application 2"],
  "landmark_cases": ["Case 1", "Case 2"],
  "remedy": "How to enforce this right if violated (e.g. Writ petition)"
}}

Right to explain:
{right_query}
"""

# ─────────────────────────────────────────────────────────────────────────────
# DOCUMENT ANALYSER
# ─────────────────────────────────────────────────────────────────────────────

ANALYSE_PROMPT = """
You are a senior legal consultant. Analyse the following legal document (brief, petition, or contract) and provide a professional breakdown.

Respond ONLY with a valid JSON object. No preamble, no markdown fences.

JSON structure required:
{{
  "document_type": "e.g. Writ Petition, Sale Deed, etc.",
  "executive_summary": "2-3 sentences overview of the document",
  "key_clauses_or_points": [
    {{"point": "Clause/Point name", "description": "Explanation of its significance"}}
  ],
  "potential_risks_or_issues": ["Risk 1", "Risk 2"],
  "suggested_next_steps": ["Step 1", "Step 2"],
  "legal_strengths": ["Strength 1", "Strength 2"]
}}

Document text:
{doc_text}
"""

# ─────────────────────────────────────────────────────────────────────────────
# BARE ACT SECTION EXPLAINER
# ─────────────────────────────────────────────────────────────────────────────

BARE_ACT_EXPLAIN_PROMPT = """
You are a senior legal educator in India. Explain the following section from an Indian Bare Act in plain, easy-to-understand English for a law student.

Respond ONLY with a valid JSON object. No preamble, no markdown fences.

JSON structure required:
{{
  "section": "Section number and title",
  "act": "Full name of the Act",
  "simple_explanation": "A clear, 3-4 sentence explanation of what this section means in practice.",
  "key_points": ["Point 1", "Point 2"],
  "illustration": "A short hypothetical example illustrating the application of this section.",
  "related_sections": ["Section X", "Section Y"]
}}

Act: {act_name}
Section: {section_text}
"""

