from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from services.bare_acts import get_section_details, get_act_details
from services.gemini import explain_bare_act_section
from services.firebase_auth import get_current_user, FirebaseUser

router = APIRouter(
    prefix="/acts",
    tags=["bare-acts"],
)

class SectionExplainRequest(BaseModel):
    # Support both act_id (new) and act_slug (old)
    act_id: str | None = None
    act_slug: str | None = None
    section_number: str
    section_title: str | None = ""
    section_text: str | None = ""

@router.post("/explain-section")
async def explain_section(
    request: SectionExplainRequest,
    current_user: FirebaseUser = Depends(get_current_user)
):
    """Explain a section using AI. Requires authentication."""
    import structlog
    logger = structlog.get_logger()
    
    # Resolve act identifier
    act_id = request.act_id or request.act_slug
    if not act_id:
        raise HTTPException(status_code=422, detail="Missing act identifier (act_id or act_slug)")
    
    section_number = request.section_number
    
    logger.info("explain_section_request", act=act_id, section=section_number, user=current_user.uid)
    
    # If we have the full text, use it. Otherwise, fetch it (backward compatibility)
    if request.section_text and request.section_title:
        full_section_text = f"Section {section_number}: {request.section_title}\n\n{request.section_text}"
    else:
        # Legacy fallback: fetch details if text not provided by client
        section = await get_section_details(act_id, section_number)
        if not section:
            raise HTTPException(status_code=404, detail="Section text not found.")
        full_section_text = f"Section {section['number']}: {section['title']}\n\n{section['content']}"
    
    try:
        explanation = await explain_bare_act_section(act_id, full_section_text)
        return explanation
    except Exception as e:
        logger.error("ai_explanation_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
