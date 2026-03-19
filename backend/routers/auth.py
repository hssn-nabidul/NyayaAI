from fastapi import APIRouter, Depends
from services.firebase_auth import get_current_user, FirebaseUser
from services.rate_limiter import get_current_usage

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.get("/me")
async def read_current_user(current_user: FirebaseUser = Depends(get_current_user)):
    """
    Returns user details and current AI usage.
    Used for frontend session verification.
    """
    usage = get_current_usage(current_user.uid)
    return {
        "uid": current_user.uid,
        "email": current_user.email,
        "name": current_user.name,
        "picture": current_user.picture,
        "usage": usage,
    }
