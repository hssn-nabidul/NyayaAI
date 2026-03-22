import os
import json
import firebase_admin
from firebase_admin import credentials
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog
from dotenv import load_dotenv
from pathlib import Path

# Setup logging
logger = structlog.get_logger()

# Load env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

def init_firebase():
    try:
        # Check if already initialized
        if firebase_admin._apps:
            return

        # Try environment variable first (production/Render)
        sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        if sa_json:
            sa_dict = json.loads(sa_json)
            cred = credentials.Certificate(sa_dict)
            firebase_admin.initialize_app(cred)
            print("Firebase initialized from environment variable")
            return
            
        # Fallback to file (local development)
        sa_path = Path(__file__).parent / "nyaya-app-9712a-firebase-adminsdk-fbsvc-790c273478.json"
        if sa_path.exists() and sa_path.stat().st_size > 0:
            cred = credentials.Certificate(str(sa_path))
            firebase_admin.initialize_app(cred)
            print("Firebase initialized from file")
            return
            
        print("WARNING: Firebase not initialized - no credentials found")
    except Exception as e:
        print(f"Error initializing Firebase: {e}")

# Initialize Firebase before importing routers
init_firebase()

# Now import routers
from routers import auth, search, cases, judges, moot, draft, legal_dictionary, analyse, rights, bare_acts, admin

app = FastAPI(title="Nyaya API", version="1.0.0")

# Configure CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("global_crash", path=request.url.path, error=str(exc))
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"}
    )

# Include routers
app.include_router(auth.router)
app.include_router(search.router)
app.include_router(cases.router)
app.include_router(judges.router)
app.include_router(moot.router)
app.include_router(draft.router)
app.include_router(legal_dictionary.router)
app.include_router(analyse.router)
app.include_router(rights.router)
app.include_router(bare_acts.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {"message": "Nyaya API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
