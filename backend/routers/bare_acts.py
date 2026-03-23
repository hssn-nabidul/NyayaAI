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
    act_id: str
    section_number: str
    section_title: str
    section_text: str

@router.post("/explain-section")
async def explain_section(
    request: Request,
    current_user: FirebaseUser = Depends(get_current_user)
):
    """Explain a section using AI. Requires authentication."""
    import structlog
    logger = structlog.get_logger()

    try:
        body = await request.json()
        print(f"DEBUG explain-section received: {body}")
        
        # Manually validate against SectionExplainRequest for debugging
        req_data = SectionExplainRequest(**body)
    except Exception as e:
        print(f"DEBUG explain-section validation failed: {e}")
        # Still try to extract if possible for partial success
        try:
            body = await request.json()
            req_data = SectionExplainRequest(
                act_id=body.get("act_id") or body.get("act_slug") or "",
                section_number=body.get("section_number") or "",
                section_title=body.get("section_title") or "",
                section_text=body.get("section_text") or body.get("content") or ""
            )
        except:
            raise HTTPException(status_code=422, detail=f"Validation error: {str(e)}")
    
    act_id = req_data.act_id
    section_number = req_data.section_number
    
    logger.info("explain_section_request", act=act_id, section=section_number, user=current_user.uid)
    
    # We now get the text directly from the request for faster performance and better reliability
    full_section_text = f"Section {section_number}: {req_data.section_title}\n\n{req_data.section_text}"
    
    try:
        explanation = await explain_bare_act_section(act_id, full_section_text)
        return explanation
    except Exception as e:
        logger.error("ai_explanation_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
