from fastapi import APIRouter, Depends, Query, HTTPException, Body
from typing import List, Dict, Any, Optional
from services.bare_acts import get_all_acts, get_act_details, search_in_act, get_section_details
from services.gemini import explain_bare_act_section
from services.kanoon import search_judgments
from services.firebase_auth import get_current_user, FirebaseUser

router = APIRouter(
    prefix="/acts",
    tags=["bare-acts"],
)

@router.get("")
async def list_acts():
    """List all priority bare acts."""
    return await get_all_acts()

@router.get("/{act_slug}")
async def act_full_text(act_slug: str):
    """Get full text and table of contents for an act."""
    try:
        return await get_act_details(act_slug)
    except Exception as e:
        raise HTTPException(status_code=404, detail="Act not found.")

@router.get("/{act_slug}/search")
async def search_act(act_slug: str, q: str = Query(...)):
    """Search for keywords or sections within a specific act."""
    return await search_in_act(act_slug, q)

@router.get("/{act_slug}/sections/{section_number}")
async def section_detail(act_slug: str, section_number: str):
    """Get specific section details and find related cases."""
    section = await get_section_details(act_slug, section_number)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found.")
        
    act_data = await get_act_details(act_slug)
    act_title = act_data.get("title", "")
    
    # Search for related cases using Kanoon
    # Query: "Section 302 IPC" or similar
    case_query = f"Section {section_number} {act_title}"
    related_cases = await search_judgments(query=case_query, pagenum=0)
    
    return {
        "section": section,
        "act_title": act_title,
        "related_cases": related_cases.get("results", [])[:10],
        "total_cases": related_cases.get("total", 0)
    }

@router.post("/{act_slug}/sections/{section_number}/explain")
async def explain_section(
    act_slug: str, 
    section_number: str,
    current_user: FirebaseUser = Depends(get_current_user)
):
    """Explain a section using AI. Requires authentication."""
    import structlog
    logger = structlog.get_logger()
    
    logger.info("explain_section_request", act=act_slug, section=section_number, user=current_user.uid)
    
    section = await get_section_details(act_slug, section_number)
    if not section:
        logger.warning("section_not_found", act=act_slug, section=section_number)
        raise HTTPException(status_code=404, detail="Section not found.")
        
    act_data = await get_act_details(act_slug)
    act_name = act_data.get("title", act_slug)
    
    logger.info("fetched_section_for_ai", act_name=act_name, section_title=section.get('title'))
    
    section_text = f"Section {section['number']}: {section['title']}\n\n{section['content']}"
    
    try:
        explanation = await explain_bare_act_section(act_name, section_text)
        return explanation
    except Exception as e:
        logger.error("ai_explanation_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
