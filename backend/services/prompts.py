# prompts.py — Nyaya: All Gemini Prompt Templates
# This file is the single source of truth for every AI prompt in the app.
# Never write prompts inline in routers or services — always import from here.

# ─────────────────────────────────────────────────────────────────────────────
# CASE SUMMARY
# ─────────────────────────────────────────────────────────────────────────────

SUMMARY_PROMPT = """
You are an Indian legal research assistant helping law students.
Analyse this court judgment and produce a structured JSON summary.
Respond ONLY with a valid JSON object. No preamble or markdown fences.

{{
  "plain_summary": "3-4 sentences in plain English for non-lawyers.",
  "key_issues": ["Issue 1?", "Issue 2?", ...],
  "holding": "The court's decision in 2-3 sentences.",
  "area_of_law": ["Tag1", "Tag2"],
  "significance": "1-2 sentences on legal impact/precedent."
}}

Judgment text:
{judgment_text}
"""

NLP_SEARCH_PROMPT = """
You are an Indian legal research assistant. Extract key terms for searching case law from this description.
Respond ONLY with a valid JSON object. No preamble or markdown fences.

{{
  "legal_principles": ["Principle 1"],
  "relevant_articles": ["Article X"],
  "relevant_acts_sections": ["Section Y Act Z"],
  "landmark_cases_to_include": ["Case 1"],
  "kanoon_search_query": "5-10 word search query for Indian Kanoon",
  "area_of_law": "Primary area",
  "from_year": 1950,
  "to_year": 2024
}}

Student description:
{user_query}
"""

MOOT_PREP_PROMPT = """
You are a senior Indian moot court coach. Generate structured arguments grounded in case law.
Respond ONLY with a valid JSON object. No preamble or markdown fences.

{{
  "petitioner": {{
    "arguments": [
      {{
        "heading": "Argument Heading",
        "body": "2-3 sentence legal reasoning",
        "supporting_cases": [
          {{"title": "Case", "year": 2024, "citation": "AIR...", "relevance": "Reason"}}
        ]
      }}
    ],
    "key_cases": ["Case 1"],
    "anticipated_counter": "Strongest counter-argument and rebuttal"
  }},
  "respondent": {{ ...same structure... }}
}}

Proposition: {proposition}
Side: {side}
"""

DRAFT_SUGGEST_PROMPT = """
You are an Indian legal assistant. Suggest relevant cases for this draft.
Respond ONLY with a valid JSON object. No preamble or markdown fences.

{{
  "detected_arguments": ["Argument 1"],
  "suggestions": [
    {{
      "title": "Case",
      "court": "SC",
      "year": 2020,
      "citation": "...",
      "reason": "Relevance to draft",
      "relevance_score": 0.95
    }}
  ]
}}

Draft: {draft_text}
Limit: {max_suggestions} suggestions.
"""

DICTIONARY_PROMPT = """
Explain this Indian legal term/maxim clearly for a student.
Respond ONLY with a valid JSON object. No preamble or markdown fences.

{{
  "term": "Term",
  "definition": "1-2 sentence definition",
  "context_india": "2-3 sentences on Indian application",
  "landmark_cases": ["Case 1"],
  "related_terms": ["Term 1"]
}}

Term: {term}
"""

JUDGE_PROFILE_PROMPT = """
Generate a profile for this Indian judge based on judgments.
Respond ONLY with a valid JSON object. No preamble or markdown fences.

{{
  "ideological_tendency": "Rights-expansive | Textualist | Pragmatist | Conservative | Centrist",
  "profile_summary": "2-3 sentences on judicial philosophy/significance",
  "known_for": ["Phrase 1", "Phrase 2"]
}}

Judge: {judge_name}
Court: {court}
Sample: {judgments_sample}
"""

RIGHTS_PROMPT = """
Explain this Indian fundamental right for a layperson.
Respond ONLY with a valid JSON object. No preamble or markdown fences.

{{
  "right_name": "The Right",
  "article": "Article X",
  "simple_explanation": "3-4 sentence empathetic explanation",
  "what_you_can_do": ["Action 1"],
  "landmark_cases": ["Case 1"],
  "remedy": "Legal remedy (e.g. Writ)"
}}

Right: {right_query}
"""

ANALYSE_PROMPT = """
Analyse this legal document and provide a breakdown.
Respond ONLY with a valid JSON object. No preamble or markdown fences.

{{
  "document_type": "Type",
  "executive_summary": "2-3 sentence overview",
  "key_clauses_or_points": [{{"point": "Name", "description": "Meaning"}}],
  "potential_risks_or_issues": ["Risk 1"],
  "suggested_next_steps": ["Step 1"],
  "legal_strengths": ["Strength 1"]
}}

Text: {doc_text}
"""

BARE_ACT_EXPLAIN_PROMPT = """
Explain this Indian Bare Act section for a student.
Respond ONLY with a valid JSON object. No preamble or markdown fences.

{{
  "section": "Section N: Title",
  "act": "Act Name",
  "simple_explanation": "3-4 sentence practice-focused explanation",
  "key_points": ["Point 1"],
  "illustration": "Short hypothetical example",
  "related_sections": ["Section X"],
  "related_cases": [
    {{"title": "Case", "citation": "AIR...", "relevance": "Reason"}}
  ]
}}

Act: {act_name}
Section: {section_text}
"""

