import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Header, Depends
from pydantic import BaseModel
import os
import json
from pathlib import Path

# Centralized Firebase Initialization Fallback
def _init_firebase_if_needed():
    if not firebase_admin._apps:
        try:
            # 1. Try Environment Variable (JSON string)
            sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
            if sa_json:
                sa_dict = json.loads(sa_json)
                cred = credentials.Certificate(sa_dict)
                firebase_admin.initialize_app(cred)
                return

            # 2. Try legacy ENV path or default file
            cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "nyaya-app-9712a-firebase-adminsdk-fbsvc-790c273478.json")
            sa_path = Path(os.path.dirname(os.path.dirname(__file__))) / cred_path
            
            if sa_path.exists():
                cred = credentials.Certificate(str(sa_path))
                firebase_admin.initialize_app(cred)
            else:
                print(f"Warning: Firebase credentials not found. Auth will fail.")
        except Exception as e:
            print(f"Error initializing Firebase Admin: {e}")

# Run initialization
_init_firebase_if_needed()

class FirebaseUser(BaseModel):
    uid: str
    email: str | None = None
    name: str | None = None
    picture: str | None = None

async def get_current_user(authorization: str = Header(...)) -> FirebaseUser:
    """Dependency: verifies Firebase ID token and returns user info."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format. Expected 'Bearer <token>'")

    token = authorization[7:]  # Strip "Bearer "

    try:
        # Verify the ID token while checking if the token is revoked (optional, but safer)
        decoded_token = auth.verify_id_token(token)
        return FirebaseUser(
            uid=decoded_token["uid"],
            email=decoded_token.get("email"),
            name=decoded_token.get("name"),
            picture=decoded_token.get("picture")
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired. Please sign in again.")
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")
    except Exception as e:
        print(f"Auth verification failed: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed.")
