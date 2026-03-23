from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.bare_acts import get_section_details, get_act_details
from services.gemini import explain_bare_act_section
from services.firebase_auth import get_current_user, FirebaseUser

router = APIRouter(
    prefix="/acts",
    tags=["bare-acts"],
)

class SectionExplainRequest(BaseModel):
    act_id: str
    section_number: str
    section_title: str
    section_text: str

@router.post("/explain-section")
async def explain_section(
    request: SectionExplainRequest,
    current_user: FirebaseUser = Depends(get_current_user)
):
    """Explain a section using AI. Requires authentication."""
    import structlog
    logger = structlog.get_logger()
    
    act_id = request.act_id
    section_number = request.section_number
    
    logger.info("explain_section_request", act=act_id, section=section_number, user=current_user.uid)
    
    # We now get the text directly from the request for faster performance and better reliability
    full_section_text = f"Section {section_number}: {request.section_title}\n\n{request.section_text}"
    
    try:
        explanation = await explain_bare_act_section(act_id, full_section_text)
        return explanation
    except Exception as e:
        logger.error("ai_explanation_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
