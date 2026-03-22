# Codebase Concerns & Technical Debt

This document details identified issues, technical debt, security considerations, and potential bottlenecks in the NyayaAI codebase.

## 1. Performance & Scalability Bottlenecks

### ⚠️ Synchronous AI Calls (Critical)
In `backend/services/gemini.py`, the code uses `model.generate_content(prompt)`, which is a **synchronous** blocking call in the Google Generative AI SDK. Although the wrapper functions are marked `async`, they do not `await` the AI response. This blocks the entire FastAPI event loop for every AI request, preventing the server from handling other concurrent requests.
*   **Fix:** Switch to `model.generate_content_async(prompt)` and `await` the response.

### ⚠️ Synchronous Database Operations
The `backend/services/rate_limiter.py` uses standard `sqlite3` calls which are synchronous. This blocks the event loop for every protected API request.
*   **Fix:** Use `aiosqlite` for asynchronous database interactions or run DB calls in a separate thread.

### Inefficient HTTP Client Management
In `backend/services/kanoon.py`, a new `httpx.AsyncClient()` is instantiated for every request. This is inefficient as it doesn't reuse connections (TCP/TLS handshake overhead).
*   **Fix:** Use a single persistent `httpx.AsyncClient` instance, managed via FastAPI's lifespan events.

## 2. Technical Debt

### Incomplete User Persistence
The `PROJECT_STATUS.md` and codebase analysis confirm that while the Frontend has UI for "Bookmarks" and "Settings", the Backend lacks the necessary database tables and CRUD endpoints to support these features. User data currently exists only in session state (Zand/Zustand) and is lost on refresh or not persisted to a permanent store.

### Flutter App "On Hold"
The `app/` directory contains only a standard Flutter counter app template. This represents significant debt if mobile parity is a project goal, as none of the core legal research features have been implemented or shared via a common library.

### Naive Text Truncation
The `prepare_text` logic in `backend/services/gemini.py` simply takes the first 8,000 and last 4,000 characters. While this preserves facts and holdings, it may omit critical middle sections (like intermediate reasoning) that the AI needs for accurate summarization or analysis.

### Underutilized Frontend Dependencies
`react-syntax-highlighter` is installed but likely unused, contributing to unnecessary bundle size.

## 3. Security Considerations

### ⚠️ Sensitive Error Leakage
The `global_exception_handler` in `backend/main.py` returns `str(exc)` directly to the client. In a production environment, this can leak internal path structures, database schema details, or third-party API error messages that might contain sensitive info.
*   **Fix:** Log the full error internally and return a generic message to the client in production.

### Missing Token Revocation Check
In `backend/services/firebase_auth.py`, the `verify_id_token` call does not enable `check_revoked=True`. This means a user whose account was disabled or whose session was revoked can still access protected endpoints until their current ID token (usually valid for 1 hour) expires.

### CORS Configuration
`ALLOWED_ORIGINS` defaults to `localhost`. While correct for development, the production deployment script must ensure this is strictly limited to the production domain to prevent Cross-Origin attacks.

### Lack of Input Validation Limits
Many endpoints (e.g., `/search/nlp`) accept text bodies without explicit maximum length constraints at the Pydantic level. While truncation happens before AI processing, extremely large payloads could be used for Denial of Service (DoS) attacks by exhausting memory.

## 4. Stability & Reliability

### Basic Error Handling in Services
The `kanoon.py` service has some `try-except` blocks that return empty results on failure, but `get_doc_details` lacks robust error handling for network timeouts or API errors, which could lead to unhandled exceptions in the routers.

### Fragmented Env Loading
`.env` is loaded in multiple places (`main.py`, `kanoon.py`, `utils.py`) using `pathlib` and `load_dotenv`. This is redundant and could lead to issues if the working directory changes.
*   **Fix:** Use a centralized `config.py` using `pydantic-settings`.
