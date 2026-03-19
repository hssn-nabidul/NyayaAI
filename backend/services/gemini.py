from services.utils import model, _clean_json_response
from typing import Dict, Any, List
from dotenv import load_dotenv
from services.prompts import (
    SUMMARY_PROMPT, 
    NLP_SEARCH_PROMPT, 
    JUDGE_PROFILE_PROMPT, 
    DICTIONARY_PROMPT,
    MOOT_PREP_PROMPT,
    ANALYSE_PROMPT,
    RIGHTS_PROMPT,
    DRAFT_SUGGEST_PROMPT,
    BARE_ACT_EXPLAIN_PROMPT
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

async def summarize_judgment(judgment_text: str) -> Dict[str, Any]:
    """
    Summarize a judgment using Gemini 1.5 Flash.
    """
    truncated_text = prepare_text(judgment_text)
    prompt = SUMMARY_PROMPT.format(judgment_text=truncated_text)
    
    try:
        response = model.generate_content(prompt)
        return _clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini summarization failed: {e}")
        raise Exception("AI summarization failed.")

async def extract_search_params(user_query: str) -> Dict[str, Any]:
    """
    Use Gemini to extract structured search parameters from a natural language query.
    """
    prompt = NLP_SEARCH_PROMPT.format(user_query=user_query)
    
    try:
        response = model.generate_content(prompt)
        return _clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini NLP search extraction failed: {e}")
        raise Exception("Failed to process your query.")

async def generate_judge_profile(judge_name: str, judgments: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate a judicial profile based on a judge's name and a sample of their judgments.
    """
    # Create a text sample of titles and highlights
    sample_texts = []
    for j in judgments[:10]:
        sample_texts.append(f"Title: {j.get('title')}\nExcerpt: {j.get('highlight')}\n")
    
    judgments_sample = "\n---\n".join(sample_texts)
    
    prompt = JUDGE_PROFILE_PROMPT.format(
        judge_name=judge_name,
        court="Indian Courts", # Can be more specific if available
        judgments_sample=judgments_sample
    )
    
    try:
        response = model.generate_content(prompt)
        return _clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini judge profile generation failed: {e}")
        raise Exception("Failed to generate judge profile.")

async def explain_legal_term(term: str) -> Dict[str, Any]:
    """
    Generate an explanation for a legal term or maxim using Gemini.
    """
    prompt = DICTIONARY_PROMPT.format(term=term)
    
    try:
        response = model.generate_content(prompt)
        return _clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini dictionary explanation failed for {term}: {e}")
        raise Exception(f"Failed to explain term '{term}'.")

async def prepare_moot_arguments(proposition: str, side: str = "both", format: str = "memorial") -> Dict[str, Any]:
    """
    Generate moot court arguments using Gemini.
    """
    prompt = MOOT_PREP_PROMPT.format(
        proposition=proposition,
        side=side,
        format=format
    )
    
    try:
        response = model.generate_content(prompt)
        return _clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini moot prep failed: {e}")
        raise Exception("Failed to generate moot arguments.")

async def analyse_legal_document(doc_text: str) -> Dict[str, Any]:
    """
    Analyse a legal document using Gemini.
    """
    # Truncate if too long
    truncated_text = prepare_text(doc_text, max_chars=15000)
    prompt = ANALYSE_PROMPT.format(doc_text=truncated_text)
    
    try:
        response = model.generate_content(prompt)
        return _clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini document analysis failed: {e}")
        raise Exception("Failed to analyse document.")

async def explain_fundamental_right(right_query: str) -> Dict[str, Any]:
    """
    Explain a fundamental right using Gemini.
    """
    prompt = RIGHTS_PROMPT.format(right_query=right_query)
    
    try:
        response = model.generate_content(prompt)
        return _clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini rights explanation failed for {right_query}: {e}")
        raise Exception(f"Failed to explain right '{right_query}'.")

async def explain_bare_act_section(act_name: str, section_text: str) -> Dict[str, Any]:
    """
    Explain a specific section of a Bare Act using Gemini.
    """
    prompt = BARE_ACT_EXPLAIN_PROMPT.format(
        act_name=act_name,
        section_text=section_text
    )
    
    try:
        response = model.generate_content(prompt)
        return _clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini bare act explanation failed: {e}")
        raise Exception("Failed to generate section explanation.")

async def suggest_draft_cases(draft_text: str, max_suggestions: int = 5) -> Dict[str, Any]:
    """
    Suggest relevant case law for a draft legal document.
    """
    prompt = DRAFT_SUGGEST_PROMPT.format(
        draft_text=prepare_text(draft_text),
        max_suggestions=max_suggestions
    )
    
    try:
        response = model.generate_content(prompt)
        return _clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini draft suggestion failed: {e}")
        raise Exception("Failed to generate draft suggestions.")
