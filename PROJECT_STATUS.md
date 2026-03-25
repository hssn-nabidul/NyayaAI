# Nyaya Project Status Report

**Date:** March 25, 2026
**Project:** Nyaya - AI-Powered Indian Legal Research App

---

## 1. BACKEND (Python FastAPI)

The backend provides all legal data endpoints and AI integrations, optimized for high performance, reliability, and independence from external API rate limits.

### API Endpoints
| Method | Path | Protected | Description |
|---|---|---|---|
| **GET** | `/search/` | Public | Standard keyword search for judgments. |
| **POST** | `/search/nlp` | Protected | AI-powered natural language search. |
| **GET** | `/cases/{docid}` | Public | Fetch full judgment text (via JIT Scraper). |
| **GET** | `/cases/{docid}/timeline` | Public | **[NEW]** AI-generated legal case timeline. |
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

### Core Infrastructure & Dependency Bypassing
*   **JIT Scraper (Just-In-Time Ingestion):** To bypass IndianKanoon API rate limits and token costs, a custom JIT scraper has been implemented. When a document is requested, the system first checks the internal SQLite store, then attempts a direct scrape of the source DOM. This results in 0-cost retrieval for previously accessed or publicly available cases.
*   **Internal Data Corpus:** Every JIT-scraped case is automatically ingested into our background `InternalJudgment` database (SQLite), creating a growing offline repository of Indian Law.
*   **Bare Acts Optimization:** Now reads directly from local JSON files in `frontend/src/data/acts`, completely removing the need for external API calls for statutory research.
*   **Deployment Ready:** Added support for loading Firebase credentials from `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable (Render-compatible).
*   **Scraper Health:** Implemented background `canary_check` on startup to monitor IndianKanoon DOM changes.

---

## 2. FRONTEND (Next.js Web Dashboard)

The web dashboard has undergone a major visual and structural transformation, focusing on "Modern Law Library" aesthetics and professional legal tooling.

### Key Features
*   **Case Timeline:** A high-fidelity visual timeline of the legal issue's history, from trial court origins to final appellate decisions, generated via Gemini 1.5 Pro.
*   **UI/UX Overhaul:** High-contrast, serif-first design inspired by modern legal publications.
*   **Mobile-First:** Complete overhaul of mobile responsiveness, including a specialized mobile navigation system.
*   **Auth Gates:** Implemented high-fidelity `AuthModal` to gate AI features, ensuring a seamless upgrade path for users.

### Core Technical Updates
*   **Error Handling:** Implemented global `error.tsx` boundary and safe rendering logic to handle complex AI response objects (React Error #31 fix).
*   **Type Safety:** Consolidated search result types and improved Zod schema validation across all forms.

---

## 3. FLUTTER APP

The mobile app remains officially **On Hold** while the web dashboard is prioritized. No significant updates since March 19.

---

## 4. FEATURE RATINGS (Updated)

*   ✅ **Search & NLP Search (Web/API):** Fully working end to end with Court and Date filters.
*   ✅ **JIT Scraper & API Bypass:** Successfully fetching documents directly from source without API dependency.
*   ✅ **Gemini Response Streaming:** **[NEW]** Real-time AI streaming implemented for Deep Analysis Chat, significantly improving perceived speed.
*   ✅ **Case Timeline:** Fully functional AI-driven timeline visualization.
*   ✅ **Bare Acts Reader:** Optimized with local data; significantly faster and more reliable.
*   ✅ **AI Power Tools (Moot, Draft, Analyse):** Fully working with high-fidelity Auth gating.
*   ✅ **Mobile UX:** Fully responsive and overhauled for the "Modern Law Library" aesthetic.
*   🔄 **Citation Graph:** UI visualization refinement ongoing.
*   🔄 **Bookmarks & Persistence:** UI exists; Backend storage for bookmarks is currently being scoped for SQLite/Production-Migration.
*   ⬜ **Flutter Mobile App:** Scaffold only.

---

## 5. NEW UTILITIES (Scripts)

Located in `scripts/` and `backend/`:
*   `pdf_to_act_json.py`: Converts raw legal PDF files (BNS, BNSS, BSA) into structured JSON.
*   `scrape_indiacode.py`: Specialized scraper for extracting bare acts from IndiaCode.
*   `test_jit.py`: Dedicated testing suite for the JIT scraping and caching layer.

---

## 6. ACTIVE ISSUES & TODOs

*   **Database Persistence:** Implement a persistent storage solution (Redis or Persistent Volume) for Render deployments, as the current SQLite storage is ephemeral.
*   **Citation Refinement:** Improve the extraction of citations from judgment text for better graph accuracy.
