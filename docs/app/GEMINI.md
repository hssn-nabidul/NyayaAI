# GEMINI.md — Nyaya App: AI IDE Master Instructions

> This file is the single source of truth for how you (Gemini) should work on the Nyaya project.
> Read this ENTIRE file before writing a single line of code.

---

## 🧠 What Is Nyaya?

Nyaya is a **free, offline-first Android legal research app** for Indian law students.
It replaces paid apps like SCC Online, Manupatra, CaseMine, and LegitQuest — at zero cost.

The app is built in **Flutter** (frontend) and **Python FastAPI** (backend).
All case data comes from the **Indian Kanoon Academic API**.
All AI features are powered by **Google Gemini 1.5 Flash** (free tier).
The local database is **Drift + SQLite** (on-device, no cloud).

---

## 🗂️ Project Structure

```
nyaya/
├── GEMINI.md                  ← You are here
├── PRD.md                     ← Full product requirements
├── ARCHITECTURE.md            ← System architecture
├── DATABASE.md                ← Drift schema & queries
├── API.md                     ← Backend API contracts
├── FILESTRUCTURE.md           ← Complete file tree
│
├── backend/                   ← Python FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── routers/
│   │   ├── search.py
│   │   ├── cases.py
│   │   ├── judges.py
│   │   ├── moot.py
│   │   └── draft.py
│   ├── services/
│   │   ├── kanoon.py          ← Indian Kanoon API wrapper
│   │   ├── gemini.py          ← All Gemini AI calls
│   │   ├── citation.py        ← Citation graph builder
│   │   └── judge_profile.py   ← Judge analytics builder
│   └── models/
│       ├── case.py
│       ├── summary.py
│       └── judge.py
│
└── app/                       ← Flutter Android app
    ├── pubspec.yaml
    ├── lib/
    │   ├── main.dart
    │   ├── app.dart
    │   ├── core/
    │   │   ├── database/      ← Drift DB
    │   │   ├── api/           ← HTTP client
    │   │   └── theme/         ← App theme
    │   ├── features/
    │   │   ├── home/
    │   │   ├── search/
    │   │   ├── case_detail/
    │   │   ├── summary/
    │   │   ├── judge/
    │   │   ├── moot_prep/
    │   │   ├── draft/
    │   │   ├── annotations/
    │   │   ├── citation_graph/
    │   │   └── library/
    │   └── shared/
    │       ├── widgets/
    │       └── utils/
    └── test/
```

---

## ⚙️ Tech Stack — Non-Negotiable

| Layer | Technology | Why |
|---|---|---|
| Android App | Flutter 3.x (Dart) | Cross-platform, native performance |
| Local DB | Drift 2.x + SQLite | Type-safe, offline, on-device |
| HTTP Client (app) | Dio 5.x | Interceptors, error handling |
| State Management | Riverpod 2.x | Scalable, testable |
| Backend | Python 3.11 + FastAPI | Lightweight, async |
| AI | Google Gemini 1.5 Flash | 1M tokens/day free |
| Legal Data | Indian Kanoon API | Free academic access |
| Hosting | Render.com (free tier) | 750 hrs/month free |
| Graph Rendering | fl_chart + CustomPainter | Native Flutter graph |
| PDF Export | pdf 3.x (Flutter) | Export annotated cases |

**Do NOT suggest or use:** Firebase, Supabase, any paid API, AWS, MongoDB, GraphQL.
**Do NOT use:** `setState` for app-wide state — use Riverpod exclusively.
**Do NOT use:** Any package that requires payment or has no free tier.

---

## 📋 Coding Rules — Follow These Exactly

### General
- Write **production-quality code** — not demo/prototype code
- Every function must have a **docstring** (Python) or **/// doc comment** (Dart)
- Use **async/await** everywhere — no synchronous blocking calls
- All errors must be **caught and handled gracefully** — never let the app crash
- Use **const** constructors in Flutter wherever possible
- All hardcoded strings go in `lib/core/constants/strings.dart`
- All API URLs go in `backend/config.py` and `lib/core/constants/api_constants.dart`

### Python (Backend)
- Use **Pydantic v2** for all request/response models
- Use **httpx** (async) for all HTTP calls — not requests
- Use **python-dotenv** for environment variables
- All Gemini prompts go in `backend/services/prompts.py` — never inline
- Rate limit all endpoints with **slowapi**
- Log all errors with **structlog**

### Dart/Flutter (App)
- Feature-first folder structure — each feature is self-contained
- Every feature has: `screen.dart`, `controller.dart`, `repository.dart`
- Use **freezed** for immutable data models
- Use **go_router** for navigation
- Never access the database or API directly from a widget — always through a repository
- All Drift database operations in `lib/core/database/daos/`

---

## 🔑 Environment Variables

### Backend `.env`
```
GEMINI_API_KEY=your_key_here
KANOON_API_TOKEN=your_token_here
ENVIRONMENT=development
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000
```

### Flutter `lib/core/constants/env.dart`
```dart
// These point to the deployed backend
const String kBaseUrl = String.fromEnvironment(
  'BASE_URL',
  defaultValue: 'http://10.0.2.2:8000', // Android emulator localhost
);
```

---

## 🤖 Gemini AI — How To Use It

All Gemini calls go through `backend/services/gemini.py`.
**Never call the Gemini API directly from a router or anywhere else.**

### Model to use
```python
model = genai.GenerativeModel("gemini-1.5-flash")  # Always Flash, not Pro
```

### Token budget
- Case summary: max 2000 output tokens
- NLP search extraction: max 200 output tokens
- Moot prep: max 3000 output tokens
- Draft suggestions: max 500 output tokens
- Judge profile: max 1500 output tokens

### Truncation rule
Always truncate judgment text before sending to Gemini:
```python
text[:12000]  # ~3000 tokens, leaves room for prompt + output
```

### All prompts live in `backend/services/prompts.py`
```python
SUMMARY_PROMPT = """..."""
NLP_SEARCH_PROMPT = """..."""
MOOT_PREP_PROMPT = """..."""
DRAFT_SUGGEST_PROMPT = """..."""
JUDGE_PROFILE_PROMPT = """..."""
```

---

## 🗄️ Database Rules — Drift

- **Never delete** a downloaded case unless the user explicitly requests it
- Always use `insertOnConflictUpdate` — never plain `insert`
- All heavy queries (full text search, filter by area of law) must use **indexes**
- Annotations are stored as a JSON list in a single column — not a separate row per highlight
- The `summaries` table is separate from `cases` — so summaries can be regenerated independently
- Search history is capped at **50 entries** — delete oldest on insert when over limit

---

## 📡 Indian Kanoon API — Rules

Base URL: `https://api.indiankanoon.org`
Auth: `Token YOUR_TOKEN` in Authorization header

### Endpoints used
```
POST /search/          ← Search judgments
POST /doc/{docid}/     ← Get full judgment
POST /docmeta/{docid}/ ← Get metadata only
POST /cites/{docid}/   ← Get cases this doc cites
POST /citedby/{docid}/ ← Get cases that cite this doc
```

### Rate limiting
- Max 5 requests/second to Kanoon API
- Cache all responses in Redis (or in-memory dict for MVP) for 24 hours
- Never call Kanoon for a doc that's already in the local Flutter DB

---

## 🏗️ Feature Implementation Order

Build in this exact order. Do not skip ahead.

```
Phase 1 — Core (build this first, get it working end-to-end)
  [1] FastAPI server boots, health check endpoint works
  [2] Indian Kanoon search endpoint works
  [3] Case detail fetch works
  [4] Gemini summary works
  [5] Flutter app boots, connects to backend
  [6] Search screen works
  [7] Case detail screen works
  [8] Summary screen works
  [9] Drift DB saves cases + summaries
  [10] Offline load from DB works

Phase 2 — Power Features
  [11] Natural Language Search (Gemini pre-processes query)
  [12] Citation Graph (fetch cites + citedby, render with CustomPainter)
  [13] Inline Annotations (highlight + notes stored in DB)
  [14] Judge Analytics (build profiles from judgment metadata)
  [15] Bare Acts integration (legislative.gov.in scraper)

Phase 3 — Student Superpowers
  [16] Moot Prep Mode
  [17] Ask AI About Case (chat UI, case-scoped Gemini)
  [18] AI Drafting Assistant
  [19] PDF Export (annotated)
  [20] Share via WhatsApp/email
```

---

## ❌ Common Mistakes — Never Do These

1. **Never hardcode API keys** in any source file
2. **Never call Gemini for a case that already has a summary** in the local DB
3. **Never load the full judgment text into Flutter memory** before displaying — stream it
4. **Never use `print()`** in production code — use the logger
5. **Never block the UI thread** — all DB and network calls must be async
6. **Never skip error states in UI** — every screen needs loading / error / empty states
7. **Never assume Indian Kanoon returns clean text** — always sanitize HTML entities
8. **Never send the full judgment to Gemini** without truncating — you'll exceed token limits
9. **Never use `dynamic` type in Dart** — everything must be typed
10. **Never create a God widget** — if a widget exceeds 150 lines, break it up

---

## ✅ Definition of Done

A feature is only "done" when:
- [ ] It works on first install (cold start)
- [ ] It works with no internet connection (if it's supposed to)
- [ ] It handles the error state (no results, network failure, API error)
- [ ] It handles the empty state (no saved cases, no search history)
- [ ] The loading state is shown while data is fetching
- [ ] It doesn't crash when the user taps rapidly or navigates back mid-load
- [ ] The code is formatted (`flutter format` / `black`)

---

## 📞 When You're Unsure

1. Check `PRD.md` for what the feature should do
2. Check `API.md` for the exact endpoint contract
3. Check `DATABASE.md` for the exact schema
4. Check `ARCHITECTURE.md` for where the code should live
5. If still unsure — ask before implementing, don't guess

---

*Last updated: 2025 · Project: Nyaya · Stack: Flutter + FastAPI + Gemini + Indian Kanoon*
