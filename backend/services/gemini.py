from services.utils import GROQ_MODEL, _clean_json_response, GROQ_API_KEY, GROQ_API_BASE
from typing import Dict, Any, List
from services.cache import cache_service
import hashlib
import httpx
import json
import os
from services.prompts import (
    SUMMARY_PROMPT,
    NLP_SEARCH_PROMPT,
    JUDGE_PROFILE_PROMPT,
    DICTIONARY_PROMPT,
    MOOT_PREP_PROMPT,
    ANALYSE_PROMPT,
    RIGHTS_PROMPT,
    DRAFT_SUGGEST_PROMPT,
    BARE_ACT_EXPLAIN_PROMPT,
    METADATA_EXTRACTION_PROMPT,
    CASE_TIMELINE_PROMPT,
    SIMILAR_CASES_PROMPT,
    CASE_CHAT_FIRST_PROMPT,
    CASE_CHAT_FOLLOWUP_PROMPT,
    AI_CHAT_PROMPT,
)


def prepare_text(text: str, max_chars: int = 12000) -> str:
    """
    Intelligently truncate text for legal documents.
    Preserves the start (facts/issues) and the end (holding/order).
    """
    if len(text) <= max_chars:
        return text

    # Take first 8000 chars and last 4000 chars
    return text[:8000] + "\n\n[...middle sections omitted...]\n\n" + text[-4000:]


def get_cache_key(prefix: str, content: str) -> str:
    """Generate a stable hash for cache keys."""
    return f"{prefix}_{hashlib.md5(content.encode()).hexdigest()}"


async def _generate(prompt: str, json_mode: bool = True) -> str:
    """
    Helper: send a prompt to Groq via OpenAI-compatible API and return the text response.
    
    Args:
        prompt: The prompt text to send.
        json_mode: If True, enables structured JSON output via response_format.
    """
    import structlog
    log = structlog.get_logger()
    
    url = f"{GROQ_API_BASE}/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    
    if not GROQ_API_KEY:
        log.error("groq_api_key_missing")
        raise Exception("GROQ_API_KEY is not configured. Set it in backend/.env")
    
    log.info("groq_api_call", model=GROQ_MODEL, json_mode=json_mode, prompt_len=len(prompt))
    try:
        async with httpx.AsyncClient(timeout=60.0) as http_client:
            resp = await http_client.post(url, json=payload, headers=headers)
            log.info("groq_api_response", status=resp.status_code)
            resp.raise_for_status()
            data = resp.json()
        choices = data.get("choices", [])
        if choices:
            content = choices[0].get("message", {}).get("content", "")
            log.info("groq_api_success", content_len=len(content))
            return content if content else ""
        log.warning("groq_api_no_choices", response=data)
        return ""
    except httpx.HTTPStatusError as e:
        log.error("groq_api_http_error", status=e.response.status_code, body=e.response.text[:500])
        raise Exception(f"Groq API returned HTTP {e.response.status_code}: {e.response.text[:200]}")
    except httpx.TimeoutException:
        log.error("groq_api_timeout")
        raise Exception("Groq API request timed out after 60 seconds")
    except Exception as e:
        log.error("groq_api_error", error=str(e))
        raise


async def _generate_and_cache(prompt: str, cache_key: str, ttl_days: int | None = None) -> Dict[str, Any]:
    """Helper: generate content, parse JSON, cache, and return."""
    result = _clean_json_response(await _generate(prompt))
    if ttl_days:
        cache_service.set("ai_cache", cache_key, result, ttl_days=ttl_days)
    else:
        cache_service.set("ai_cache", cache_key, result)
    return result


async def summarize_judgment(judgment_text: str) -> Dict[str, Any]:
    """Summarize a judgment using Gemini."""
    truncated_text = prepare_text(judgment_text)
    cache_key = get_cache_key("sum", truncated_text)

    cached = cache_service.get("ai_cache", cache_key)
    if cached:
        return cached

    prompt = SUMMARY_PROMPT.format(judgment_text=truncated_text)
    try:
        return await _generate_and_cache(prompt, cache_key)
    except Exception as e:
        print(f"Gemini summarization failed: {e}")
        raise Exception("AI summarization failed.")


async def extract_search_params(user_query: str) -> Dict[str, Any]:
    """Use Gemini to extract search parameters."""
    cache_key = get_cache_key("nlp", user_query)
    cached = cache_service.get("ai_cache", cache_key)
    if cached:
        return cached

    prompt = NLP_SEARCH_PROMPT.format(user_query=user_query)
    try:
        return await _generate_and_cache(prompt, cache_key, ttl_days=7)
    except Exception as e:
        print(f"Gemini NLP search extraction failed: {e}")
        raise Exception("Failed to process your query.")


async def generate_judge_profile(judge_name: str, judgments: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate a judicial profile."""
    cache_key = f"judge_v2_{judge_name.lower().replace(' ', '_')}"
    cached = cache_service.get("ai_cache", cache_key)
    if cached:
        return cached

    sample_texts = [
        f"Title: {j.get('title')}\nExcerpt: {j.get('headline', j.get('highlight', ''))}\n"
        for j in judgments[:20]
    ]
    judgments_sample = "\n---\n".join(sample_texts)

    prompt = JUDGE_PROFILE_PROMPT.format(
        judge_name=judge_name,
        court="Indian Courts",
        judgments_sample=judgments_sample,
    )

    try:
        return await _generate_and_cache(prompt, cache_key)
    except Exception as e:
        print(f"Gemini judge profile generation failed: {e}")
        raise Exception("Failed to generate judge profile.")


async def explain_legal_term(term: str) -> Dict[str, Any]:
    """Generate an explanation for a legal term or maxim."""
    cache_key = f"term_{term.lower().replace(' ', '_')}"
    cached = cache_service.get("ai_cache", cache_key)
    if cached:
        return cached

    prompt = DICTIONARY_PROMPT.format(term=term)
    try:
        return await _generate_and_cache(prompt, cache_key)
    except Exception as e:
        print(f"Gemini dictionary explanation failed for {term}: {e}")
        raise Exception(f"Failed to explain term '{term}'.")


async def prepare_moot_arguments(proposition: str, side: str = "both", format: str = "memorial") -> Dict[str, Any]:
    """Generate moot court arguments using Gemini."""
    cache_key = get_cache_key(f"moot_{side}_{format}", proposition)
    cached = cache_service.get("ai_cache", cache_key)
    if cached:
        return cached

    prompt = MOOT_PREP_PROMPT.format(proposition=proposition, side=side, format=format)
    try:
        return await _generate_and_cache(prompt, cache_key)
    except Exception as e:
        print(f"Gemini moot prep failed: {e}")
        raise Exception("Failed to generate moot arguments.")


async def analyse_legal_document(doc_text: str) -> Dict[str, Any]:
    """Analyse a legal document using Gemini."""
    truncated_text = prepare_text(doc_text, max_chars=15000)
    cache_key = get_cache_key("analyse", truncated_text)
    cached = cache_service.get("ai_cache", cache_key)
    if cached:
        return cached

    prompt = ANALYSE_PROMPT.format(doc_text=truncated_text)
    try:
        return await _generate_and_cache(prompt, cache_key)
    except Exception as e:
        print(f"Gemini document analysis failed: {e}")
        raise Exception("Failed to analyse document.")


async def explain_fundamental_right(right_query: str) -> Dict[str, Any]:
    """Explain a fundamental right using Gemini."""
    cache_key = f"right_{right_query.lower().replace(' ', '_')}"
    cached = cache_service.get("ai_cache", cache_key)
    if cached:
        return cached

    prompt = RIGHTS_PROMPT.format(right_query=right_query)
    try:
        return await _generate_and_cache(prompt, cache_key)
    except Exception as e:
        print(f"Gemini rights explanation failed for {right_query}: {e}")
        raise Exception(f"Failed to explain right '{right_query}'.")


async def explain_bare_act_section(act_name: str, section_text: str) -> Dict[str, Any]:
    """Explain a specific section of a Bare Act using Gemini."""
    cache_key = get_cache_key(f"bare_{act_name.lower().replace(' ', '_')}", section_text)
    cached = cache_service.get("ai_cache", cache_key)
    if cached:
        return cached

    prompt = BARE_ACT_EXPLAIN_PROMPT.format(act_name=act_name, section_text=section_text)
    try:
        return await _generate_and_cache(prompt, cache_key)
    except Exception as e:
        print(f"Gemini bare act explanation failed: {e}")
        raise Exception("Failed to generate section explanation.")


async def suggest_draft_cases(draft_text: str, max_suggestions: int = 5) -> Dict[str, Any]:
    """Suggest relevant case law for a draft legal document."""
    truncated = prepare_text(draft_text)
    cache_key = get_cache_key(f"draft_{max_suggestions}", truncated)
    cached = cache_service.get("ai_cache", cache_key)
    if cached:
        return cached

    prompt = DRAFT_SUGGEST_PROMPT.format(draft_text=truncated, max_suggestions=max_suggestions)
    try:
        return await _generate_and_cache(prompt, cache_key)
    except Exception as e:
        print(f"Gemini draft suggestion failed: {e}")
        raise Exception("Failed to generate draft suggestions.")


async def extract_judgment_metadata(judgment_text: str) -> Dict[str, Any]:
    """Extract structured metadata from judgment text using Gemini."""
    truncated = judgment_text[:10000]
    cache_key = get_cache_key("meta", truncated)
    cached = cache_service.get("ai_cache", cache_key)
    if cached:
        return cached

    prompt = METADATA_EXTRACTION_PROMPT.format(judgment_text=truncated)
    try:
        return await _generate_and_cache(prompt, cache_key)
    except Exception as e:
        print(f"Gemini metadata extraction failed: {e}")
        return {}


async def query_gemini(prompt: str) -> str:
    """
    Query Groq via OpenAI-compatible API and return the full response text.
    Uses json_mode=False for free-text responses (chat, analysis streaming).
    Delegates to the non-streaming _generate() for reliability.
    """
    try:
        return await _generate(prompt, json_mode=False)
    except Exception as e:
        return ""  # Return empty on error


def format_analysis_as_context(analysis_dict: Dict[str, Any]) -> str:
    """
    Convert a structured document analysis JSON into a compact context string
    for follow-up Q&A. Only non-empty fields included.

    This is ~500-1,000 chars vs the ~10,000 chars of raw document text.
    Handles both string lists and dict lists safely.
    """
    parts = []

    _add = lambda label, val: parts.append(f"{label}: {val}") if val else None

    def _add_str_list(label, items):
        """Add a list of strings."""
        if not items:
            return
        formatted = [str(item) for item in items]
        parts.append(f"{label}: {'; '.join(formatted)}")

    _add("Document Type", analysis_dict.get("document_type"))
    _add("Executive Summary", analysis_dict.get("executive_summary"))

    key_points = analysis_dict.get("key_clauses_or_points", [])
    if key_points:
        formatted_points = []
        for kp in key_points:
            if isinstance(kp, dict):
                formatted_points.append(f"{kp.get('point', '')}: {kp.get('description', '')}")
            else:
                formatted_points.append(str(kp))
        parts.append(f"Key Points: {'; '.join(formatted_points)}")

    _add_str_list("Potential Risks", analysis_dict.get("potential_risks_or_issues"))
    _add_str_list("Suggested Next Steps", analysis_dict.get("suggested_next_steps"))
    _add_str_list("Legal Strengths", analysis_dict.get("legal_strengths"))

    return "\n".join(parts)


async def get_or_generate_summary(doc_id: str, doc_text: str) -> Dict[str, Any]:
    """
    Get a cached structured summary for a case, or generate + cache one.
    This rich summary is used as context for follow-up chat messages,
    dramatically reducing token usage compared to re-sending the full judgment text.

    Returns the structured JSON summary dict.
    """
    summary_cache_key = f"sum_v2_{doc_id}"

    cached = cache_service.get("ai_cache", summary_cache_key)
    if cached:
        return cached

    summary = await summarize_judgment(doc_text)
    cache_service.set("ai_cache", summary_cache_key, summary, ttl_days=90)
    return summary


def format_summary_as_context(summary_dict: Dict[str, Any]) -> str:
    """
    Convert a structured summary dict into a compact, readable context string
    for injection into follow-up chat prompts.

    This is ~800-1,200 chars vs the ~5,000 chars of raw judgment text.
    Only non-empty fields are included to minimize token usage.
    """
    parts = []

    _add = lambda label, val: parts.append(f"{label}: {val}") if val else None
    _add_list = lambda label, items: parts.append(f"{label}: {'; '.join(items)}") if items else None

    _add("Case Summary", summary_dict.get("plain_summary"))
    _add("Facts", summary_dict.get("case_facts_brief"))
    _add_list("Key Issues", summary_dict.get("key_issues"))
    _add("Ratio Decidendi", summary_dict.get("ratio_decidendi"))
    _add("Holding", summary_dict.get("holding"))
    _add_list("Obiter Dicta", summary_dict.get("obiter_dicta"))
    _add("Dissenting Opinion", summary_dict.get("dissenting_opinion"))
    _add_list("Area of Law", summary_dict.get("area_of_law"))
    _add_list("Statutes Interpreted", summary_dict.get("statutes_interpreted"))

    precedent = summary_dict.get("precedent_status")
    status_reason = summary_dict.get("status_reason")
    if precedent:
        reason = f" — {status_reason}" if status_reason else ""
        _add("Precedent Status", f"{precedent}{reason}")

    _add("Practical Takeaway", summary_dict.get("practical_takeaway"))
    _add_list("Key Precedents", summary_dict.get("case_law_referenced"))
    _add("Legal Significance", summary_dict.get("significance"))

    return "\n".join(parts)


async def get_case_timeline(case_title: str, year: int) -> Dict[str, Any]:
    """Generate a legal timeline for a case issue."""
    cache_key = f"timeline_{hashlib.md5(case_title.encode()).hexdigest()}_{year}"
    cached = cache_service.get("ai_cache", cache_key)
    if cached:
        return cached

    prompt = CASE_TIMELINE_PROMPT.format(case_title=case_title, year=year)
    try:
        return await _generate_and_cache(prompt, cache_key)
    except Exception as e:
        print(f"Gemini timeline generation failed for {case_title}: {e}")
        raise Exception("Failed to generate case timeline.")


async def find_similar_cases(case_title: str, case_text: str) -> Dict[str, Any]:
    """
    Use Gemini to find thematically similar cases beyond direct citations.
    Returns thematic analysis + suggested similar cases + search queries.
    """
    truncated = prepare_text(case_text, max_chars=10000)
    cache_key = get_cache_key("similar", f"{case_title}_{truncated[:1000]}")

    cached = cache_service.get("ai_cache", cache_key)
    if cached:
        return cached

    prompt = SIMILAR_CASES_PROMPT.format(case_title=case_title, judgment_excerpt=truncated)
    try:
        return await _generate_and_cache(prompt, cache_key, ttl_days=14)
    except Exception as e:
        print(f"Gemini similar cases analysis failed: {e}")
        raise Exception("Failed to find similar cases.")
