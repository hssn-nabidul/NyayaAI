from services.utils import model, _clean_json_response
from typing import Dict, Any, List
from dotenv import load_dotenv
from services.cache import cache_service
import hashlib
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
    CASE_TIMELINE_PROMPT
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

async def summarize_judgment(judgment_text: str) -> Dict[str, Any]:
    """Summarize a judgment using Gemini 1.5 Flash."""
    truncated_text = prepare_text(judgment_text)
    cache_key = get_cache_key("sum", truncated_text)
    
    cached = cache_service.get("ai_cache", cache_key)
    if cached: return cached

    prompt = SUMMARY_PROMPT.format(judgment_text=truncated_text)
    try:
        response = await model.generate_content_async(prompt)
        result = _clean_json_response(response.text)
        cache_service.set("ai_cache", cache_key, result)
        return result
    except Exception as e:
        print(f"Gemini summarization failed: {e}")
        raise Exception("AI summarization failed.")

async def extract_search_params(user_query: str) -> Dict[str, Any]:
    """Use Gemini to extract search parameters."""
    cache_key = get_cache_key("nlp", user_query)
    cached = cache_service.get("ai_cache", cache_key)
    if cached: return cached

    prompt = NLP_SEARCH_PROMPT.format(user_query=user_query)
    try:
        response = await model.generate_content_async(prompt)
        result = _clean_json_response(response.text)
        cache_service.set("ai_cache", cache_key, result, ttl_days=7) # NLP search expires faster
        return result
    except Exception as e:
        print(f"Gemini NLP search extraction failed: {e}")
        raise Exception("Failed to process your query.")

async def generate_judge_profile(judge_name: str, judgments: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate a judicial profile."""
    cache_key = f"judge_v2_{judge_name.lower().replace(' ', '_')}"
    cached = cache_service.get("ai_cache", cache_key)
    if cached: return cached

    # Use up to 20 judgments for a better ideological and subject breakdown sample
    sample_texts = [f"Title: {j.get('title')}\nExcerpt: {j.get('headline', j.get('highlight', ''))}\n" for j in judgments[:20]]
    judgments_sample = "\n---\n".join(sample_texts)
    
    prompt = JUDGE_PROFILE_PROMPT.format(
        judge_name=judge_name,
        court="Indian Courts",
        judgments_sample=judgments_sample
    )
    
    try:
        response = await model.generate_content_async(prompt)
        result = _clean_json_response(response.text)
        cache_service.set("ai_cache", cache_key, result)
        return result
    except Exception as e:
        print(f"Gemini judge profile generation failed: {e}")
        raise Exception("Failed to generate judge profile.")

async def explain_legal_term(term: str) -> Dict[str, Any]:
    """Generate an explanation for a legal term or maxim."""
    cache_key = f"term_{term.lower().replace(' ', '_')}"
    cached = cache_service.get("ai_cache", cache_key)
    if cached: return cached

    prompt = DICTIONARY_PROMPT.format(term=term)
    try:
        response = await model.generate_content_async(prompt)
        result = _clean_json_response(response.text)
        cache_service.set("ai_cache", cache_key, result)
        return result
    except Exception as e:
        print(f"Gemini dictionary explanation failed for {term}: {e}")
        raise Exception(f"Failed to explain term '{term}'.")

async def prepare_moot_arguments(proposition: str, side: str = "both", format: str = "memorial") -> Dict[str, Any]:
    """Generate moot court arguments using Gemini."""
    cache_key = get_cache_key(f"moot_{side}_{format}", proposition)
    cached = cache_service.get("ai_cache", cache_key)
    if cached: return cached

    prompt = MOOT_PREP_PROMPT.format(proposition=proposition, side=side, format=format)
    try:
        response = await model.generate_content_async(prompt)
        result = _clean_json_response(response.text)
        cache_service.set("ai_cache", cache_key, result)
        return result
    except Exception as e:
        print(f"Gemini moot prep failed: {e}")
        raise Exception("Failed to generate moot arguments.")

async def analyse_legal_document(doc_text: str) -> Dict[str, Any]:
    """Analyse a legal document using Gemini."""
    truncated_text = prepare_text(doc_text, max_chars=15000)
    cache_key = get_cache_key("analyse", truncated_text)
    cached = cache_service.get("ai_cache", cache_key)
    if cached: return cached

    prompt = ANALYSE_PROMPT.format(doc_text=truncated_text)
    try:
        response = await model.generate_content_async(prompt)
        result = _clean_json_response(response.text)
        cache_service.set("ai_cache", cache_key, result)
        return result
    except Exception as e:
        print(f"Gemini document analysis failed: {e}")
        raise Exception("Failed to analyse document.")

async def explain_fundamental_right(right_query: str) -> Dict[str, Any]:
    """Explain a fundamental right using Gemini."""
    cache_key = f"right_{right_query.lower().replace(' ', '_')}"
    cached = cache_service.get("ai_cache", cache_key)
    if cached: return cached

    prompt = RIGHTS_PROMPT.format(right_query=right_query)
    try:
        response = await model.generate_content_async(prompt)
        result = _clean_json_response(response.text)
        cache_service.set("ai_cache", cache_key, result)
        return result
    except Exception as e:
        print(f"Gemini rights explanation failed for {right_query}: {e}")
        raise Exception(f"Failed to explain right '{right_query}'.")

async def explain_bare_act_section(act_name: str, section_text: str) -> Dict[str, Any]:
    """Explain a specific section of a Bare Act using Gemini."""
    # Use Section number/title for key if possible, or hash of text
    cache_key = get_cache_key(f"bare_{act_name.lower().replace(' ', '_')}", section_text)
    cached = cache_service.get("ai_cache", cache_key)
    if cached: return cached

    prompt = BARE_ACT_EXPLAIN_PROMPT.format(act_name=act_name, section_text=section_text)
    try:
        response = await model.generate_content_async(prompt)
        result = _clean_json_response(response.text)
        cache_service.set("ai_cache", cache_key, result)
        return result
    except Exception as e:
        print(f"Gemini bare act explanation failed: {e}")
        raise Exception("Failed to generate section explanation.")

async def suggest_draft_cases(draft_text: str, max_suggestions: int = 5) -> Dict[str, Any]:
    """Suggest relevant case law for a draft legal document."""
    truncated = prepare_text(draft_text)
    cache_key = get_cache_key(f"draft_{max_suggestions}", truncated)
    cached = cache_service.get("ai_cache", cache_key)
    if cached: return cached

    prompt = DRAFT_SUGGEST_PROMPT.format(draft_text=truncated, max_suggestions=max_suggestions)
    try:
        response = await model.generate_content_async(prompt)
        result = _clean_json_response(response.text)
        cache_service.set("ai_cache", cache_key, result)
        return result
    except Exception as e:
        print(f"Gemini draft suggestion failed: {e}")
        raise Exception("Failed to generate draft suggestions.")

async def extract_judgment_metadata(judgment_text: str) -> Dict[str, Any]:
    """Extract structured metadata from judgment text using Gemini."""
    # Use only first 10000 chars for metadata extraction to save tokens
    truncated = judgment_text[:10000]
    cache_key = get_cache_key("meta", truncated)
    cached = cache_service.get("ai_cache", cache_key)
    if cached: return cached

    prompt = METADATA_EXTRACTION_PROMPT.format(judgment_text=truncated)
    try:
        response = await model.generate_content_async(prompt)
        result = _clean_json_response(response.text)
        cache_service.set("ai_cache", cache_key, result)
        return result
    except Exception as e:
        print(f"Gemini metadata extraction failed: {e}")
        return {}

async def stream_gemini(prompt: str):
    """
    Stream a response from Gemini using the async generator.
    Yields chunks of text as they are generated.
    """
    try:
        # Use generate_content_async for non-blocking streaming in FastAPI
        response = await model.generate_content_async(prompt, stream=True)
        async for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        print(f"Streaming failed: {e}")
        yield f"Error during streaming: {str(e)}"

async def get_case_timeline(case_title: str, year: int) -> Dict[str, Any]:
    """Generate a legal timeline for a case issue."""
    cache_key = f"timeline_{hashlib.md5(case_title.encode()).hexdigest()}_{year}"
    cached = cache_service.get("ai_cache", cache_key)
    if cached: return cached

    prompt = CASE_TIMELINE_PROMPT.format(case_title=case_title, year=year)
    try:
        response = await model.generate_content_async(prompt)
        result = _clean_json_response(response.text)
        cache_service.set("ai_cache", cache_key, result)
        return result
    except Exception as e:
        print(f"Gemini timeline generation failed for {case_title}: {e}")
        raise Exception("Failed to generate case timeline.")
