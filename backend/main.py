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
from contextlib import asynccontextmanager
from services.judis_scraper import judis_scraper

# Setup logging
log = structlog.get_logger()

# Load env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

def init_firebase():
    try:
        if firebase_admin._apps:
            return

        sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        if sa_json:
            sa_dict = json.loads(sa_json)
            cred = credentials.Certificate(sa_dict)
            firebase_admin.initialize_app(cred)
            print("Firebase initialized from environment variable")
            return
            
        sa_path = Path(__file__).parent / "nyaya-app-9712a-firebase-adminsdk-fbsvc-790c273478.json"
        if sa_path.exists() and sa_path.stat().st_size > 0:
            cred = credentials.Certificate(str(sa_path))
            firebase_admin.initialize_app(cred)
            print("Firebase initialized from file")
            return
            
        print("WARNING: Firebase not initialized - no credentials found")
    except Exception as e:
        print(f"Error initializing Firebase: {e}")

init_firebase()

# Initialize Engine DB
from engine import init_db as init_engine_db
init_engine_db()

# Now import routers
from routers import auth, search, cases, judges, moot, draft, legal_dictionary, analyse, rights, bare_acts, admin, internal_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("nyaya_startup", source="JUDIS — no API dependency")
    yield
    await judis_scraper.close()
    log.info("nyaya_shutdown")

app = FastAPI(title="Nyaya API", version="1.0.0", lifespan=lifespan)

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
    log.error("global_crash", path=request.url.path, error=str(exc))
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
app.include_router(internal_data.router)

@app.get("/")
async def root():
    return {"message": "Nyaya API is running"}

@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
