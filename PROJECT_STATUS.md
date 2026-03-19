# Nyaya Project Status Report

**Date:** March 19, 2026
**Project:** Nyaya - AI-Powered Indian Legal Research App

---

## 1. BACKEND (Python FastAPI)

The backend provides all legal data endpoints and AI integrations.

### API Endpoints
| Method | Path | Protected | Description |
|---|---|---|---|
| **GET** | `/search/` | Public | Standard keyword search for judgments. |
| **POST** | `/search/nlp` | Protected | AI-powered natural language search. |
| **GET** | `/cases/{docid}` | Public | Fetch full judgment text and metadata. |
| **POST** | `/cases/{docid}/summary` | Protected | Generate AI summary for a case. |
| **GET** | `/cases/{docid}/citations` | Public | Fetch citation network data. |
| **POST** | `/analyse/` | Protected | AI breakdown of legal documents. |
| **POST** | `/draft/suggest` | Protected | Suggest cases for legal drafts. |
| **GET** | `/judges/{judge_name}` | Protected | Generate AI judge profile. |
| **GET** | `/dictionary/explain` | Protected | AI explanation of legal terms. |
| **GET** | `/dictionary/search` | Protected | Search dictionary maxims. |
| **POST** | `/moot/prep` | Protected | Generate moot court arguments. |
| **GET** | `/rights/explain` | Protected | AI explanation of fundamental rights. |
| **GET** | `/acts/` | Public | List all priority bare acts. |
| **GET** | `/acts/{act_slug}` | Public | Full text and TOC for a specific act. |
| **GET** | `/acts/{act_slug}/sections/{section}` | Public | Section details and related case search. |
| **POST** | `/acts/{act_slug}/sections/{section}/explain` | Protected | AI explanation of a specific section. |
| **GET** | `/auth/me` | Protected | Retrieve current user profile. |

*Note: Protected endpoints require a valid Firebase ID token and are subject to usage limits via `Depends(get_current_user)`.*

### Service Functions
*   **`services/gemini.py`:** `_clean_json_response`, `summarize_judgment`, `extract_search_params`, `generate_judge_profile`, `explain_legal_term`, `prepare_moot_arguments`, `analyse_legal_document`, `explain_fundamental_right`, `suggest_draft_cases`, `explain_bare_act_section`.
*   **`services/kanoon.py`:** `search_judgments`, `search_by_judge`, `get_doc_details`, `get_doc_meta`, `get_cites`, `get_citedby`, `_extract_citation`, `_extract_author`.
*   **`services/bare_acts.py`:** `get_all_acts`, `get_act_details`, `search_in_act`, `get_section_details`, `fetch_and_cache_act`.
*   **`services/rate_limiter.py`:** `init_db`, `check_and_increment`, `get_current_usage`.
*   **`services/firebase_auth.py`:** `get_current_user`.

### Pydantic Models
*   `FirebaseUser`: Defines `uid`, `email`, `name`, `picture` (located in `services/firebase_auth.py`).

---

## 2. FRONTEND (Next.js Web Dashboard)

The web frontend is the primary active focus and interacts closely with the backend via React Query.

### Page Routes (`src/app/`)
*   **Public:** `/` (Home), `/search`, `/cases/[docId]`, `/cases/[docId]/graph`, `/dictionary`, `/dictionary/[term]`, `/judges`, `/maxims`, `/maxims/[id]`, `/rights`, `/rights/[situation]`, `/auth/signin`.
*   **Protected (`(auth)/`):** `/analyse`, `/bookmarks`, `/draft`, `/moot`, `/settings`.

### Core Components (`src/components/`)
*   **Auth:** `AIUsageMeter`, `AuthGate`, `GoogleSignInButton`, `UserMenu`, `AuthProvider`.
*   **Case Details:** `CitationGraphPanel`, `ParagraphExplainer`, `CaseMetadataHeader`, `AISummaryPanel`, `CaseActionBar`, `JudgmentReader`.
*   **Search:** `SearchResultCard`, `SearchFilters`, `NLPSearchBox`, `SearchBar`, `SearchResultSkeleton`.
*   **AI Tools:** `DocumentAnalyser`, `DraftEditor`, `DraftSuggestionSidebar`, `MootPrepForm`, `MootPrepResult`.
*   **Dictionary/Rights:** `AIExplainer`, `MaximCard`, `MaximDetail`, `TermCard`, `TermDetail`, `RightsChatBox`, `RightsDetail`, `SituationCard`.

*All components are actively implemented and wired to Zustand/React Query logic. No empty UI shells remain.*

### Active API Hook Integrations (`src/features/`)
*   `useSearch` -> `GET /search/`
*   `useNLPSearch` -> `POST /search/nlp`
*   `useCase` -> `GET /cases/{docid}`
*   `useCaseSummary` -> `POST /cases/{docid}/summary`
*   `useCitations` -> `GET /cases/{docid}/citations`
*   `useAnalyse` -> `POST /analyse/`
*   `useDraftSuggest` -> `POST /draft/suggest`
*   `useJudgeProfile` -> `GET /judges/{judge_name}`
*   `useMoot` -> `POST /moot/prep`
*   `useRights` -> `GET /rights/explain`
*   `useTermExplain` -> `GET /dictionary/explain`

---

## 3. FLUTTER APP

The mobile app is officially **On Hold** while the web dashboard is prioritized.

*   **Dart Files:** `app/lib/main.dart` only.
*   **Widgets:** Contains only the default Flutter `MyApp` and `MyHomePage` (Counter App).
*   **Feature Folders:** The intended feature-first architecture (`lib/features/`) has not been scaffolded yet.

---

## 4. FEATURE RATINGS

*   ✅ **Search & NLP Search (Web/API):** Fully working end to end.
*   ✅ **Case Reader & Summarization (Web/API):** Fully working end to end.
*   ✅ **AI Power Tools (Moot, Draft, Analyse):** Fully working end to end.
*   🔄 **Citation Graph:** Partially implemented (Backend delivers nodes/links; Frontend `CitationGraphPanel` is dynamically imported to avoid SSR issues, but visualization refinement is ongoing).
*   🔄 **Bookmarks & User Settings:** Partially implemented (UI exists, stores exist, but backend lacks explicit CRUD tables for user profiles).
*   ⬜ **Flutter Mobile App:** File exists but empty/scaffold only.

---

## 5. ACTIVE ISSUES

*   **Flutter `build.gradle.kts` and `CMakeLists.txt`:** Standard generated `TODO` comments indicating missing Application IDs, signing configs, and ephemeral file movement.

---

## 6. DEPENDENCIES

### Backend (`requirements.txt`)
*   **Installed & Used:** `fastapi`, `uvicorn`, `httpx`, `google-generativeai`, `pydantic`, `pydantic-settings`, `python-dotenv`, `slowapi`, `structlog`, `firebase-admin`, `cachetools`.
*   *All packages appear fully utilized by the service logic.*

### Frontend (`package.json`)
*   **Installed & Used:** `next`, `react`, `react-dom`, `firebase`, `@tanstack/react-query`, `zustand`, `framer-motion`, `react-force-graph-2d`, `react-markdown`, `lucide-react`, `sonner`, `zod`.
*   **Flagged (Potentially underutilized):** `react-syntax-highlighter` is installed but likely only necessary if Moot Prep / Document Analyser responses start emitting heavy markdown code blocks.

### Flutter (`pubspec.yaml`)
*   Standard dependencies only (`flutter`, `cupertino_icons`).

---

## 7. ENVIRONMENT

### Backend (`backend/.env`)
*   Keys: `GEMINI_API_KEY`, `KANOON_API_TOKEN`, `FIREBASE_PROJECT_ID`, `ENVIRONMENT`, `DAILY_AI_REQUESTS_PER_USER`, `ALLOWED_ORIGINS`.
*   *Note: All referenced successfully in Python via `os.getenv`.*

### Frontend (`frontend/.env.local`)
*   Keys: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_API_URL`.
*   *Note: All standard Firebase config keys are present and mapped.*
