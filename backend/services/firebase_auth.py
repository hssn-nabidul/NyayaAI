import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Header, Depends
from pydantic import BaseModel
import os

# Initialize Firebase Admin
# In production, the credentials can be loaded from an environment variable or a path
# For local development, we use the JSON file provided via FIREBASE_CREDENTIALS_PATH
try:
    if not firebase_admin._apps:
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "nyaya-app-9712a-firebase-adminsdk-fbsvc-790c273478.json")
        # Handle absolute or relative paths
        if not os.path.isabs(cred_path):
            cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), cred_path)
            
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            print(f"Warning: Firebase credentials not found at {cred_path}. Auth will fail.")
except Exception as e:
    print(f"Error initializing Firebase Admin: {e}")

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
