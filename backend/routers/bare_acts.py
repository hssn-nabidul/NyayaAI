from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from services.bare_acts import get_section_details, get_act_details
from services.gemini import explain_bare_act_section
from services.firebase_auth import get_current_user, FirebaseUser
from services.kanoon import search_judgments

router = APIRouter(
    prefix="/acts",
    tags=["bare-acts"],
)

# Mapping slugs to full names for accurate Kanoon searching
ACT_NAME_MAPPING = {
    "bns-2023": "Bharatiya Nyaya Sanhita",
    "bnss-2023": "Bharatiya Nagarik Suraksha Sanhita",
    "bsa-2023": "Bharatiya Sakshya Adhiniyam",
    "constitution-of-india": "Constitution of India",
    "ipc-1860": "Indian Penal Code",
    "crpc-1973": "Code of Criminal Procedure",
    "evidence-act-1872": "Indian Evidence Act",
    "cpc-1908": "Civil Procedure Code",
    "contract-act-1872": "Contract Act",
    "it-act-2000": "Information Technology Act",
    "consumer-protection-2019": "Consumer Protection Act",
    "rti-act-2005": "Right to Information Act",
    "pocso-act-2012": "Protection of Children from Sexual Offences Act",
    "domestic-violence-2005": "Protection of Women from Domestic Violence Act"
}

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

@router.get("/{act_slug}/sections/{section_number}/cases")
async def get_cases_for_section(act_slug: str, section_number: str):
    """Fetch judgments that interpret or cite a specific bare act section."""
    import structlog
    logger = structlog.get_logger()
    
    act_name = ACT_NAME_MAPPING.get(act_slug)
    if not act_name:
        # Fallback: try to format the slug
        act_name = act_slug.replace("-", " ").title()

    # Construct the query. Example: "Section 302" "Indian Penal Code"
    query = f'"Section {section_number}" "{act_name}"'
    
    # Handle Constitution Articles
    if act_slug == "constitution-of-india":
        query = f'"Article {section_number}" "{act_name}"'

    logger.info("fetch_cases_for_section", act=act_slug, section=section_number, query=query)

    try:
        results_data = await search_judgments(query=query, page=0)
        return {
            "act": act_name,
            "section": section_number,
            "query": query,
            "total": results_data.get("total", 0),
            "results": results_data.get("results", [])[:10] # Return top 10 most relevant
        }
    except Exception as e:
        logger.error("fetch_cases_for_section_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch related cases.")

