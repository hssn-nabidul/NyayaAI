# WEBSITE_ARCHITECTURE.md — Nyaya Web Architecture

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User's Browser                                │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                   Next.js 14 App Router                       │  │
│   │                   [Hosted on Vercel — Free]                   │  │
│   │                                                               │  │
│   │  Server Components (SSR/SSG)    Client Components             │  │
│   │  ├── Page layouts               ├── Search input              │  │
│   │  ├── Case text rendering        ├── Citation graph            │  │
│   │  ├── Dictionary pages           ├── Chat interfaces           │  │
│   │  └── Rights cards              └── Auth state                │  │
│   │                                                               │  │
│   │  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │  │
│   │  │ TanStack    │  │   Zustand    │  │  Firebase SDK     │   │  │
│   │  │ Query       │  │   (UI state) │  │  (Auth client)    │   │  │
│   │  │ (API cache) │  └──────────────┘  └────────┬──────────┘   │  │
│   │  └──────┬──────┘                             │               │  │
│   └─────────│────────────────────────────────────│───────────────┘  │
└─────────────│────────────────────────────────────│─────────────────-┘
              │ HTTPS (with Bearer token)           │ Google OAuth
              ▼                                     ▼
┌─────────────────────────────┐    ┌────────────────────────────────┐
│   FastAPI Backend           │    │   Firebase / Google Services    │
│   [Render.com — Free]       │    │                                 │
│                             │    │  Firebase Auth (Google OAuth)   │
│  Auth Middleware            │◄───│  → Verifies ID tokens          │
│  (Firebase token verify)    │    │  → Free up to 10k users        │
│                             │    │                                 │
│  Rate Limiter               │    │  Firestore DB                  │
│  (50 AI calls/user/day)     │    │  → Bookmarks, notes, summaries │
│                             │    │  → 1GB free + 50k reads/day    │
│  Routers:                   │    └────────────────────────────────┘
│  /search /cases /judges     │
│  /moot /draft /legal-dict   │
│  /analyse /rights           │
│                             │
│  Services:                  │
│  kanoon.py                  │──────────────────────────────────────►
│  gemini.py                  │──────────────────────────────────────►
│  firebase_auth.py           │    ┌────────────────────────────────┐
│  rate_limiter.py            │    │   External APIs (Free)          │
└─────────────────────────────┘    │                                 │
                                   │  Indian Kanoon API              │
                                   │  api.indiankanoon.org           │
                                   │                                 │
                                   │  Google Gemini 1.5 Flash        │
                                   │  generativelanguage.google.com  │
                                   │  [1.5M tokens/day free]         │
                                   └────────────────────────────────┘
```

---

## 2. Authentication Flow — Detailed

```
FIRST VISIT (no auth):
Browser → Next.js → Renders public page
User sees search, dictionary, rights cards (no sign-in needed)

HITTING AN AUTH-GATED FEATURE:
User clicks "Generate AI Summary"
→ Frontend checks Firebase auth state (Zustand)
→ User not signed in → Shows AuthGate component (not a redirect)
→ AuthGate shows: preview skeleton + "Continue with Google" button

SIGN-IN:
User clicks "Continue with Google"
→ Firebase signInWithPopup(GoogleAuthProvider)
→ Google OAuth popup opens
→ User selects Google account
→ Firebase returns: User object + ID Token (JWT)
→ Zustand auth store updated: { user, idToken }
→ AuthGate disappears → AI Summary generates immediately

AUTHENTICATED API CALL:
Frontend → src/lib/api/client.ts
→ Gets current Firebase ID token (auto-refreshes every hour)
→ Adds header: Authorization: Bearer {idToken}
→ Sends to FastAPI backend

BACKEND TOKEN VERIFICATION:
FastAPI receives request
→ auth middleware extracts Bearer token
→ firebase_admin.auth.verify_id_token(token)
→ Returns: { uid, email, name }
→ rate_limiter.check(uid)  ← checks daily AI usage
→ If OK → proceeds with Gemini call
→ If rate limit exceeded → 429 response with friendly message

TOKEN REFRESH:
Firebase SDK auto-refreshes ID tokens every hour
Frontend API client calls getIdToken(true) before each request
No user action needed
```

---

## 3. Next.js App Router Structure

```
src/app/
│
├── layout.tsx                  # Root layout: fonts, providers, nav
├── page.tsx                    # Landing page (public, SSG)
├── loading.tsx                 # Global loading UI
├── error.tsx                   # Global error boundary
│
├── (public)/                   # Route group — no auth required
│   ├── search/
│   │   ├── page.tsx            # Search results (SSR, q param)
│   │   ├── loading.tsx
│   │   └── error.tsx
│   │
│   ├── cases/
│   │   └── [docId]/
│   │       ├── page.tsx        # Case detail (SSR, public)
│   │       ├── loading.tsx
│   │       └── graph/
│   │           └── page.tsx    # Citation graph (client, auth-gated)
│   │
│   ├── dictionary/
│   │   ├── page.tsx            # Browse all terms (SSG)
│   │   └── [term]/
│   │       └── page.tsx        # Term detail (SSG + AI explain = auth)
│   │
│   ├── maxims/
│   │   ├── page.tsx            # Browse all maxims (SSG)
│   │   └── [id]/
│   │       └── page.tsx        # Maxim detail + cases (SSG)
│   │
│   └── rights/
│       ├── page.tsx            # Situation cards (SSG)
│       └── [situation]/
│           └── page.tsx        # Rights detail (SSG, chat = auth)
│
├── (auth)/                     # Route group — requires sign-in
│   ├── layout.tsx              # Redirect to /auth/signin if not authed
│   ├── bookmarks/
│   │   └── page.tsx
│   ├── moot/
│   │   └── page.tsx
│   ├── draft/
│   │   └── page.tsx
│   ├── analyse/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
│
└── auth/
    └── signin/
        └── page.tsx            # Sign in page (redirect if already authed)
```

---

## 4. Frontend Component Architecture

```
src/components/
│
├── layout/
│   ├── Navbar.tsx              # Top navigation, auth state, sign-in button
│   ├── Sidebar.tsx             # Desktop sidebar (search, dictionary, etc.)
│   ├── MobileNav.tsx           # Bottom nav for mobile
│   └── Footer.tsx
│
├── auth/
│   ├── AuthGate.tsx            # Wraps auth-required features, shows sign-in prompt
│   ├── GoogleSignInButton.tsx  # The "Continue with Google" button
│   ├── UserMenu.tsx            # Avatar dropdown when signed in
│   └── AuthProvider.tsx        # Firebase auth context + Zustand sync
│
├── search/
│   ├── SearchBar.tsx           # Main search input (keyword)
│   ├── NLPSearchBox.tsx        # "Describe your situation" textarea
│   ├── SearchResultCard.tsx    # Individual result card
│   ├── SearchFilters.tsx       # Court, year, subject filters
│   └── SearchResultSkeleton.tsx
│
├── case/
│   ├── CaseMetadataHeader.tsx  # Court, date, citation, bench
│   ├── JudgmentReader.tsx      # Full text with paragraph selection
│   ├── AISummaryPanel.tsx      # Summary (auth-gated)
│   ├── CaseActionBar.tsx       # Download, share, bookmark, cite
│   ├── ParagraphExplainer.tsx  # "Explain this paragraph" (auth-gated)
│   └── CitationGraph.tsx       # Force graph (auth-gated)
│
├── dictionary/
│   ├── TermCard.tsx            # Term in browse view
│   ├── TermDetail.tsx          # Full term page
│   ├── AIExplainer.tsx         # "Explain this to me" panel (auth-gated)
│   ├── MaximCard.tsx
│   └── MaximDetail.tsx
│
├── rights/
│   ├── SituationCard.tsx       # "I was arrested" etc.
│   ├── RightsDetail.tsx        # Detailed rights for a situation
│   └── RightsChatBox.tsx       # Follow-up Q&A (auth-gated)
│
├── tools/
│   ├── DocumentAnalyser.tsx    # Paste + analyse (auth-gated)
│   ├── MootPrepForm.tsx        # Proposition input
│   ├── MootPrepResult.tsx      # Arguments display
│   ├── DraftEditor.tsx         # Text editor
│   └── DraftSuggestionSidebar.tsx
│
└── ui/                         # Design system primitives
    ├── Button.tsx
    ├── Card.tsx
    ├── Badge.tsx                # Court badge, area of law chip
    ├── Skeleton.tsx
    ├── EmptyState.tsx
    ├── ErrorState.tsx
    ├── Modal.tsx
    ├── Tooltip.tsx
    └── ProgressBar.tsx          # AI usage meter
```

---

## 5. State Management

### Zustand Stores

```typescript
// src/lib/stores/auth.store.ts
interface AuthStore {
  user: FirebaseUser | null;
  idToken: string | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<string>;
}

// src/lib/stores/ui.store.ts
interface UIStore {
  theme: 'dark' | 'light';
  fontSize: 'sm' | 'md' | 'lg';
  sidebarOpen: boolean;
  setTheme: (theme: 'dark' | 'light') => void;
}

// src/lib/stores/search.store.ts
interface SearchStore {
  recentSearches: string[];
  activeFilters: SearchFilters;
  addRecentSearch: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
}
```

### TanStack Query — Key Queries

```typescript
// Cases
const useCase = (docId: string) =>
  useQuery({ queryKey: ['case', docId], queryFn: () => api.cases.get(docId) });

const useCaseSummary = (docId: string) =>
  useQuery({
    queryKey: ['case-summary', docId],
    queryFn: () => api.cases.getSummary(docId),
    enabled: !!user,  // Only fetch when signed in
    staleTime: Infinity,  // Summary never goes stale
  });

// Search
const useSearch = (params: SearchParams) =>
  useQuery({
    queryKey: ['search', params],
    queryFn: () => api.search.keyword(params),
    placeholderData: keepPreviousData,
  });

// Dictionary
const useTerm = (term: string) =>
  useQuery({ queryKey: ['term', term], queryFn: () => api.dictionary.getTerm(term), staleTime: 24 * 60 * 60 * 1000 });
```

---

## 6. Firestore Data Model

```
firestore/
│
├── users/{uid}/
│   ├── profile: { displayName, email, createdAt, dailyAiUsage, lastUsageDate }
│   └── bookmarks/{docId}: { title, court, date, savedAt, note }
│
├── summaries/{docId}:          # Shared across all users (cached AI summaries)
│   └── { plainSummary, keyIssues, holding, precedents, areasOfLaw, generatedAt }
│
├── judgeProfiles/{judgeName}:  # Shared cached judge profiles
│   └── { ...profile data, generatedAt }
│
└── dictionary/{termSlug}:      # AI explanations cached
    └── { term, aiExplanation, aiExampleSimple, relatedCases, generatedAt }
```

**Key Firestore security rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    // Shared cached data — anyone authenticated can read, only backend writes
    match /summaries/{docId} {
      allow read: if request.auth != null;
      allow write: if false;  // Backend writes via Admin SDK
    }
    match /judgeProfiles/{name} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    match /dictionary/{term} {
      allow read: if true;  // Public
      allow write: if false;
    }
  }
}
```

---

## 7. API Client (Frontend)

```typescript
// src/lib/api/client.ts

import { getAuth } from 'firebase/auth';

class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL!;

  private async getHeaders(): Promise<HeadersInit> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken(); // auto-refreshes if expired
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    }

    return { 'Content-Type': 'application/json' };
  }

  async get<T>(path: string): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}${path}`, { headers });
    if (!res.ok) throw new ApiError(res.status, await res.json());
    return res.json();
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new ApiError(res.status, await res.json());
    return res.json();
  }
}

export const api = new ApiClient();
```

---

## 8. Backend Auth Middleware

```python
# backend/services/firebase_auth.py

import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Header
from pydantic import BaseModel

# Initialize Firebase Admin (once at startup)
cred = credentials.Certificate("firebase-service-account.json")
firebase_admin.initialize_app(cred)

class FirebaseUser(BaseModel):
    uid: str
    email: str | None = None
    name: str | None = None

async def get_current_user(authorization: str = Header(...)) -> FirebaseUser:
    """Dependency: verifies Firebase ID token, returns user info."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    token = authorization[7:]  # Strip "Bearer "

    try:
        decoded = auth.verify_id_token(token)
        return FirebaseUser(
            uid=decoded["uid"],
            email=decoded.get("email"),
            name=decoded.get("name"),
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired. Please sign in again.")
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed.")
```

---

## 9. Per-User Rate Limiter

```python
# backend/services/rate_limiter.py

from cachetools import TTLCache
from datetime import date
from fastapi import HTTPException

# In-memory: {uid: {date: count}}
# TTL: 25 hours (covers one full day + buffer)
_usage_cache: TTLCache = TTLCache(maxsize=10000, ttl=90000)

DAILY_LIMIT = 50  # AI requests per user per day

def check_and_increment(uid: str) -> dict:
    """
    Check if user is within daily AI limit.
    Returns usage info. Raises 429 if exceeded.
    """
    today = str(date.today())
    key = f"{uid}:{today}"

    current = _usage_cache.get(key, 0)

    if current >= DAILY_LIMIT:
        raise HTTPException(
            status_code=429,
            detail={
                "message": "You've used all 50 free AI requests for today. Come back tomorrow!",
                "limit": DAILY_LIMIT,
                "used": current,
                "resets": "midnight IST",
            }
        )

    _usage_cache[key] = current + 1
    return {"used": current + 1, "limit": DAILY_LIMIT, "remaining": DAILY_LIMIT - current - 1}
```

---

## 10. Rendering Strategy per Page

| Page | Strategy | Why |
|---|---|---|
| `/` (Landing) | SSG | Never changes |
| `/search` | SSR | Query param `q` |
| `/cases/[docId]` | SSR | Dynamic, indexed for SEO |
| `/dictionary` | SSG | Pre-built content |
| `/dictionary/[term]` | SSG | Pre-built, 500+ pages |
| `/maxims` | SSG | Pre-built content |
| `/rights` | SSG | Static cards |
| `/rights/[situation]` | SSG | Static content |
| `/bookmarks` | CSR | User-specific, no SEO |
| `/moot` | CSR | Interactive, auth-required |
| `/draft` | CSR | Interactive, auth-required |
| `/analyse` | CSR | Interactive, auth-required |

---

*Document: WEBSITE_ARCHITECTURE.md · Project: Nyaya Web · Phase: 1*
