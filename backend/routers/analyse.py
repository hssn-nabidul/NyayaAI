from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any
from services.gemini import analyse_legal_document
from services.rate_limiter import check_and_increment
from services.firebase_auth import get_current_user, FirebaseUser

router = APIRouter(
    prefix="/analyse",
    tags=["analyse"],
)

@router.post("/")
async def analyse_document(
    doc_text: str = Body(..., embed=True),
    current_user: FirebaseUser = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Analyse a legal document text and return structured insights.
    """
    # 1. Check AI Rate Limit
    usage = check_and_increment(current_user.uid)
    
    try:
        # 2. Analyse using Gemini
        analysis = await analyse_legal_document(doc_text)
        
        return {
            "analysis": analysis,
            "usage": usage
        }
    except Exception as e:
        print(f"Document analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
