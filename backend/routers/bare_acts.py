from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.bare_acts import get_section_details, get_act_details
from services.gemini import explain_bare_act_section
from services.firebase_auth import get_current_user, FirebaseUser

router = APIRouter(
    prefix="/acts",
    tags=["bare-acts"],
)

class ExplainRequest(BaseModel):
    act_slug: str
    section_number: str

@router.post("/explain-section")
async def explain_section(
    request: ExplainRequest,
    current_user: FirebaseUser = Depends(get_current_user)
):
    """Explain a section using AI. Requires authentication."""
    import structlog
    logger = structlog.get_logger()
    
    act_slug = request.act_slug
    section_number = request.section_number
    
    logger.info("explain_section_request", act=act_slug, section=section_number, user=current_user.uid)
    
    section = await get_section_details(act_slug, section_number)
    if not section:
        logger.warning("section_not_found", act=act_slug, section=section_number)
        raise HTTPException(status_code=404, detail="Section not found.")
        
    act_data = await get_act_details(act_slug)
    act_name = act_data.get("title", act_slug)
    
    section_text = f"Section {section['number']}: {section['title']}\n\n{section['content']}"
    
    try:
        explanation = await explain_bare_act_section(act_name, section_text)
        return explanation
    except Exception as e:
        logger.error("ai_explanation_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
