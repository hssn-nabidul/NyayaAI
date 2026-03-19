# GEMINI_WEB.md — Nyaya Web: AI IDE Master Instructions
# Phase 1 — Website

> Read this ENTIRE file before writing a single line of code.
> This file governs the Nyaya **website** (Phase 1).
> The Android app (Phase 2) is documented separately in GEMINI.md.

---

## 🧠 What Is Nyaya Web?

Nyaya Web is a **free, browser-based legal research platform** for:
- Indian law students needing case law research
- Common people who need to understand legal terms, their rights, court notices, and legal documents
- Anyone who needs AI-powered legal assistance without paying ₹₹₹₹

It is the **web version of the Nyaya app** — same features, but accessible from any browser on any device, with no installation required.

**The defining design decision:** Users sign in with Google. That's it. No API keys. No subscriptions. No configuration. Google Sign-In → instant access to everything.

---

## 🔐 The Google Auth + Gemini Flow (Read This Carefully)

This is the core technical innovation of Phase 1. Understand it completely.

```
1. User clicks "Continue with Google"
2. Firebase Auth handles Google OAuth — completely free
3. Firebase returns an ID Token (JWT) to the browser
4. Every API request from the browser includes: Authorization: Bearer {firebase_id_token}
5. FastAPI backend receives the request
6. Backend calls Firebase Admin SDK to verify the token → gets the user's UID + email
7. Backend checks per-user rate limit (stored in-memory or Redis)
8. If within rate limit → calls Gemini API using the BACKEND'S OWN API key
9. Result returned to user
10. User never sees, touches, or needs an API key — ever
```

**Why this works:**
- Firebase Auth: Free up to 10,000 users/month (we will never exceed this for v1)
- Google Sign-In: Free forever
- Gemini 1.5 Flash free tier: 1,500 requests/day, 1M tokens/day
- Per-user rate limit: 50 AI requests/day per Google account (enforced on backend)
- Total cost to run: ₹0

**What "sign in with Google activates Gemini" means to the user:**
They click one button, they're in, AI features work. No setup. No friction.

---

## 🗂️ Project Structure

```
nyaya-web/
├── GEMINI_WEB.md              ← You are here
├── WEBSITE_PRD.md             ← Product requirements
├── WEBSITE_ARCHITECTURE.md    ← System architecture
├── WEBSITE_FILESTRUCTURE.md   ← Complete file tree
├── WEBSITE_PROMPTS.py         ← All AI prompts
│
├── frontend/                  ← Next.js 14 App Router
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── .env.local.example
│   └── src/
│       ├── app/               ← App Router pages
│       ├── components/        ← Shared UI components
│       ├── features/          ← Feature modules
│       ├── lib/               ← Utilities, Firebase, API client
│       └── types/             ← TypeScript types
│
└── backend/                   ← FastAPI (same as Phase 1 app backend, extended)
    ├── main.py
    ├── requirements.txt
    ├── routers/
    │   ├── search.py
    │   ├── cases.py
    │   ├── judges.py
    │   ├── moot.py
    │   ├── draft.py
    │   ├── legal_dictionary.py  ← NEW for web
    │   └── auth.py              ← NEW — Firebase token verification
    └── services/
        ├── kanoon.py
        ├── gemini.py
        ├── prompts.py
        ├── firebase_auth.py     ← NEW — Firebase Admin SDK
        └── rate_limiter.py      ← NEW — Per-user rate limiting
```

---

## ⚙️ Tech Stack — Non-Negotiable

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.x (App Router) | Framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| Firebase (client) | 10.x | Google Auth |
| TanStack Query | 5.x | Server state, caching |
| Zustand | 4.x | Client state |
| Framer Motion | 11.x | Animations |
| React Force Graph | latest | Citation graph visualisation |
| React Markdown | latest | Render AI summaries |
| Sonner | latest | Toast notifications |

### Backend (extended from Phase 1)
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.111.x | API framework |
| Firebase Admin SDK | 6.x | Verify Google ID tokens |
| google-generativeai | 0.5.x | Gemini API |
| httpx | 0.27.x | Indian Kanoon calls |
| slowapi | 0.1.x | Rate limiting |
| cachetools | 5.x | Per-user usage tracking |

### Hosting (all free)
| Service | What | Free Tier |
|---|---|---|
| Vercel | Next.js frontend | 100GB bandwidth/month |
| Render.com | FastAPI backend | 750 hrs/month |
| Firebase | Auth only | 10k users/month free |
| Firestore | User data (bookmarks, notes) | 1GB + 50k reads/day free |

**Do NOT use:** NextAuth.js (use Firebase directly), Prisma, any paid database, AWS, MongoDB Atlas paid tier, OpenAI API.

---

## 📋 Coding Rules

### General
- **TypeScript strict mode** — no `any` types, ever
- All components are **Server Components by default** — add `'use client'` only when necessary
- Data fetching happens in **Server Components** or **TanStack Query** — never in `useEffect`
- All user-facing strings in `src/lib/strings.ts` — never hardcoded inline
- All API calls go through `src/lib/api/client.ts` — never call fetch() directly in components
- Firebase ID token included automatically by the API client — never handle tokens in components
- Every page needs `loading.tsx` and `error.tsx` siblings

### TypeScript
- All API response shapes defined in `src/types/api.ts`
- All component props defined with explicit interfaces
- Zod for runtime validation of all API responses
- No optional chaining on things that should never be null — fix the type instead

### React/Next.js
- No `useEffect` for data fetching — use TanStack Query
- No prop drilling beyond 2 levels — use Zustand or Context
- All images use `next/image`
- All links use `next/link`
- Dynamic routes: `/cases/[docId]` not `/cases?id=...`
- Metadata exported from every page for SEO

### Styling
- Tailwind only — no inline styles, no CSS modules (except for animations)
- Dark theme is the default — light mode toggle is a settings option
- Design system colours defined in `tailwind.config.ts`
- All interactive elements: minimum 44px touch target

---

## 🔑 Environment Variables

### Frontend `.env.local`
```env
# Firebase (public — safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nyaya-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nyaya-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nyaya-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend `.env`
```env
GEMINI_API_KEY=
KANOON_API_TOKEN=
FIREBASE_PROJECT_ID=nyaya-app
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
ENVIRONMENT=development
DAILY_AI_REQUESTS_PER_USER=50
```

---

## 🔐 Auth Rules — Critical

```python
# Every protected endpoint MUST use this dependency
async def get_current_user(authorization: str = Header(...)) -> FirebaseUser:
    """Verify Firebase ID token and return user info."""
    token = authorization.replace("Bearer ", "")
    try:
        decoded = firebase_admin.auth.verify_id_token(token)
        return FirebaseUser(
            uid=decoded["uid"],
            email=decoded.get("email"),
            name=decoded.get("name"),
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
```

**Protected routes** (require Google sign-in):
- `POST /search/nlp` (AI-powered)
- `GET /cases/{id}/summary` (AI-generated)
- `POST /moot/prep` (AI-generated)
- `POST /draft/suggest` (AI-generated)
- `GET /judges/{name}` (AI-generated profile)
- `POST /legal-dictionary/explain` (AI-generated)
- All Firestore operations (bookmarks, annotations)

**Public routes** (no auth needed):
- `GET /search` (keyword search only)
- `GET /cases/{id}` (full text — public judgment)
- `GET /health`
- `GET /legal-dictionary` (pre-built term list)

---

## 🌐 Web-Exclusive Features (beyond the app)

### 1. Legal Dictionary + Explainer
- Searchable database of Indian legal terms, Latin maxims, legal doctrines
- AI explanation of any term in plain English
- Examples from real Indian cases
- "Explain this to me like I'm not a lawyer" mode

### 2. Document Analyser
- User pastes text from a legal notice, court order, or contract
- AI explains what it means in plain English
- Highlights important clauses, deadlines, obligations
- Tells the user what action they need to take

### 3. Know Your Rights
- Browseable cards by situation: "I've been arrested", "My landlord is evicting me", "I received a legal notice", etc.
- Each card explains rights in plain Hindi/English
- Links to relevant cases and bare acts
- "What should I do next?" guidance

### 4. Legal Maxims Library
- Complete library of Latin legal maxims used in Indian courts
- Pronunciation guide, literal translation, legal meaning
- Cases where Indian SC/HC applied this maxim
- Searchable and browseable

---

## 🏗️ Build Order — Phase 1 Website

```
Week 1 — Foundation
  [1]  Next.js project setup with TypeScript + Tailwind
  [2]  Firebase project setup (Auth only)
  [3]  Google Sign-In flow working end-to-end
  [4]  FastAPI backend with Firebase token verification
  [5]  Per-user rate limiter working
  [6]  API client in frontend (auto-attaches Firebase token)
  [7]  Basic layout: nav, sidebar, main content area

Week 2 — Core Search
  [8]  Search page (keyword search, no auth required)
  [9]  Search results display
  [10] Case detail page (full judgment text)
  [11] AI Summary (requires Google sign-in)
  [12] "Sign in with Google to unlock AI features" gate

Week 3 — AI Features
  [13] Legal Dictionary page (browse + search)
  [14] AI term explainer (sign-in required)
  [15] Judge profiles page
  [16] Citation graph (React Force Graph)
  [17] NLP search

Week 4 — Student + Common Person Tools
  [18] Moot Prep page
  [19] Know Your Rights page
  [20] Document Analyser
  [21] Legal Maxims Library
  [22] Bookmarks (Firestore)
  [23] Polish, responsive design, deploy
```

---

## ❌ Never Do These

1. **Never store Firebase ID tokens in localStorage** — use Firebase SDK's built-in persistence
2. **Never call Gemini from the frontend** — always go through the backend
3. **Never expose the Gemini API key** — it lives only in backend `.env`
4. **Never trust the user-sent UID** — always verify via Firebase Admin SDK on backend
5. **Never skip the rate limiter** — one user could exhaust the entire free tier
6. **Never hardcode court names or legal terms** — put them in constants files
7. **Never render AI output as raw HTML** — always use React Markdown with sanitisation
8. **Never make the sign-in gate hostile** — show a preview of what they'll get, then prompt sign-in
9. **Never use `getServerSideProps`** — this is App Router, use Server Components
10. **Never skip loading states** — every AI call takes 3-8 seconds, show progress

---

## ✅ Definition of Done (Web)

A feature is done when:
- [ ] Works on Chrome, Firefox, Safari (desktop)
- [ ] Works on mobile browser (responsive)
- [ ] Unauthenticated users see a proper sign-in prompt, not an error
- [ ] Loading state shown during all async operations
- [ ] Empty state shown when no results
- [ ] Error state shown gracefully when API fails
- [ ] AI-gated features clearly indicate why sign-in is needed
- [ ] Passes TypeScript strict mode with zero errors
- [ ] Page has proper `<title>` and meta description

---

*Document: GEMINI_WEB.md · Project: Nyaya Web · Phase: 1 · Stack: Next.js + Firebase + FastAPI + Gemini*
