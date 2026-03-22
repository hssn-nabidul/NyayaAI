# External Integrations

**Analysis Date:** 2026-03-21

## APIs & External Services

**AI & Language Models:**
- Google Gemini API - Primary LLM for summarization, analysis, and NLP search.
  - SDK/Client: `google-generativeai` (Python)
  - Auth: `GEMINI_API_KEY` (in `backend/.env`)

**Legal Data:**
- Indian Kanoon API - Source for judgments, citations, and search results.
  - SDK/Client: Custom implementation using `httpx` (`backend/services/kanoon.py`)
  - Auth: `KANOON_API_TOKEN` (in `backend/.env`)

## Data Storage

**Databases:**
- Firebase (Cloud Firestore/Auth)
  - Connection: `FIREBASE_PROJECT_ID` (env var)
  - Client: `firebase-admin` (Backend), `firebase` (Frontend)

**File Storage:**
- Local Filesystem - Disk-based caching for bare acts.
  - Location: `backend/cache/acts/`
- Firebase Storage - Referenced for potential asset storage.

**Caching:**
- `cachetools` - In-memory LRU/TTL caching for API responses in backend (`backend/services/bare_acts.py`).
- Disk Cache - Persistent JSON storage for bare acts (`backend/services/bare_acts.py`).

## Authentication & Identity

**Auth Provider:**
- Firebase Authentication
  - Implementation: `backend/services/firebase_auth.py` (Verification via `Depends(get_current_user)`)
  - Frontend: `frontend/src/app/auth/` components and context providers.
  - Features: Google Sign-In, ID Token validation.

## Monitoring & Observability

**Error Tracking:**
- None detected (standard Python/React error boundaries likely).

**Logs:**
- `structlog` - Structured JSON/Console logging in the backend.
- Log File: `backend/backend_logs.txt`

## CI/CD & Deployment

**Hosting:**
- [Not Specified] - Standard directory structure supports Vercel (Frontend) and containerized backends (Dockerized Python).

**CI Pipeline:**
- None detected.

## Environment Configuration

**Required env vars:**
- `GEMINI_API_KEY`, `KANOON_API_TOKEN`, `FIREBASE_PROJECT_ID` (Backend)
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_API_URL` (Frontend)

**Secrets location:**
- `.env` files (not committed).
- `firebase-service-account.json` - Required for backend admin access (referenced in `backend/.env.example`).

## Webhooks & Callbacks

**Incoming:**
- None detected.

**Outgoing:**
- None detected.

---

*Integration audit: 2026-03-21*
