# WEBSITE_FILESTRUCTURE.md — Nyaya Web: Complete File Tree

> `[GENERATE]` = Gemini writes full implementation
> `[SCAFFOLD]` = Gemini writes basic structure/boilerplate
> `[CONFIG]` = Configuration file (mostly manual setup)
> `[SSG]` = Static Site Generation (no user data)
> `[SSR]` = Server Side Rendering
> `[CSR]` = Client Side Rendering (useClient)

---

## Frontend (`/frontend`)

```
frontend/
│
├── [CONFIG]  package.json
├── [CONFIG]  next.config.ts
├── [CONFIG]  tailwind.config.ts          ← Design system colours, fonts
├── [CONFIG]  tsconfig.json
├── [CONFIG]  .env.local.example
├── [CONFIG]  .gitignore
│
└── src/
    │
    ├── app/                              ← Next.js App Router
    │   │
    │   ├── [GENERATE] layout.tsx         ← Root layout: Providers, fonts, Navbar
    │   ├── [GENERATE] page.tsx           ← Landing page [SSG]
    │   ├── [SCAFFOLD] loading.tsx        ← Global loading spinner
    │   ├── [SCAFFOLD] error.tsx          ← Global error boundary
    │   ├── [SCAFFOLD] not-found.tsx      ← 404 page
    │   │
    │   ├── (public)/                     ← No auth required
    │   │   ├── search/
    │   │   │   ├── [GENERATE] page.tsx   ← Search results [SSR]
    │   │   │   └── [SCAFFOLD] loading.tsx
    │   │   │
    │   │   ├── cases/
    │   │   │   └── [docId]/
    │   │   │       ├── [GENERATE] page.tsx        ← Case detail [SSR]
    │   │   │       ├── [SCAFFOLD] loading.tsx
    │   │   │       └── graph/
    │   │   │           └── [GENERATE] page.tsx    ← Citation graph [CSR, auth]
    │   │   │
    │   │   ├── dictionary/
    │   │   │   ├── [GENERATE] page.tsx            ← Browse all terms [SSG]
    │   │   │   └── [term]/
    │   │   │       └── [GENERATE] page.tsx        ← Term detail [SSG]
    │   │   │
    │   │   ├── maxims/
    │   │   │   ├── [GENERATE] page.tsx            ← Browse all maxims [SSG]
    │   │   │   └── [id]/
    │   │   │       └── [GENERATE] page.tsx        ← Maxim detail [SSG]
    │   │   │
    │   │   └── rights/
    │   │       ├── [GENERATE] page.tsx            ← Situation cards [SSG]
    │   │       └── [situation]/
    │   │           └── [GENERATE] page.tsx        ← Rights detail [SSG]
    │   │
    │   ├── (auth)/                       ← Requires sign-in (layout redirects)
    │   │   ├── [GENERATE] layout.tsx     ← Auth guard: redirect to /auth/signin if not authed
    │   │   ├── bookmarks/
    │   │   │   └── [GENERATE] page.tsx   ← Saved cases [CSR]
    │   │   ├── moot/
    │   │   │   └── [GENERATE] page.tsx   ← Moot prep [CSR]
    │   │   ├── draft/
    │   │   │   └── [GENERATE] page.tsx   ← AI draft [CSR]
    │   │   ├── analyse/
    │   │   │   └── [GENERATE] page.tsx   ← Document analyser [CSR]
    │   │   └── settings/
    │   │       └── [GENERATE] page.tsx   ← User settings [CSR]
    │   │
    │   └── auth/
    │       └── signin/
    │           └── [GENERATE] page.tsx   ← Google sign-in page
    │
    ├── components/
    │   │
    │   ├── layout/
    │   │   ├── [GENERATE] Navbar.tsx             ← Top nav, auth state, Google sign-in btn
    │   │   ├── [GENERATE] Sidebar.tsx            ← Desktop sidebar
    │   │   ├── [GENERATE] MobileNav.tsx          ← Bottom nav on mobile
    │   │   └── [SCAFFOLD] Footer.tsx
    │   │
    │   ├── auth/
    │   │   ├── [GENERATE] AuthGate.tsx           ← Wraps auth-gated features
    │   │   ├── [GENERATE] GoogleSignInButton.tsx ← "Continue with Google" button
    │   │   ├── [GENERATE] UserMenu.tsx           ← Avatar + dropdown
    │   │   ├── [GENERATE] AuthProvider.tsx       ← Firebase auth context
    │   │   └── [GENERATE] AIUsageMeter.tsx       ← Shows X/50 AI calls used today
    │   │
    │   ├── search/
    │   │   ├── [GENERATE] SearchBar.tsx
    │   │   ├── [GENERATE] NLPSearchBox.tsx
    │   │   ├── [GENERATE] SearchResultCard.tsx
    │   │   ├── [GENERATE] SearchFilters.tsx
    │   │   └── [SCAFFOLD] SearchResultSkeleton.tsx
    │   │
    │   ├── case/
    │   │   ├── [GENERATE] CaseMetadataHeader.tsx
    │   │   ├── [GENERATE] JudgmentReader.tsx     ← Full text + paragraph selection
    │   │   ├── [GENERATE] AISummaryPanel.tsx     ← Auth-gated summary
    │   │   ├── [GENERATE] CaseActionBar.tsx      ← Bookmark, share, cite, download
    │   │   ├── [GENERATE] ParagraphExplainer.tsx ← Select text → explain
    │   │   └── [GENERATE] CitationGraphPanel.tsx ← Force graph
    │   │
    │   ├── dictionary/
    │   │   ├── [GENERATE] TermCard.tsx
    │   │   ├── [GENERATE] TermDetail.tsx
    │   │   ├── [GENERATE] AIExplainer.tsx        ← Explain in plain English
    │   │   ├── [GENERATE] MaximCard.tsx
    │   │   └── [GENERATE] MaximDetail.tsx
    │   │
    │   ├── rights/
    │   │   ├── [GENERATE] SituationCard.tsx      ← "I was arrested" card
    │   │   ├── [GENERATE] RightsDetail.tsx
    │   │   └── [GENERATE] RightsChatBox.tsx      ← Auth-gated chat
    │   │
    │   ├── tools/
    │   │   ├── [GENERATE] DocumentAnalyser.tsx
    │   │   ├── [GENERATE] MootPrepForm.tsx
    │   │   ├── [GENERATE] MootPrepResult.tsx
    │   │   ├── [GENERATE] DraftEditor.tsx
    │   │   └── [GENERATE] DraftSuggestionSidebar.tsx
    │   │
    │   └── ui/                                   ← Design system
    │       ├── [GENERATE] Button.tsx
    │       ├── [GENERATE] Card.tsx
    │       ├── [GENERATE] Badge.tsx
    │       ├── [GENERATE] Skeleton.tsx
    │       ├── [GENERATE] EmptyState.tsx
    │       ├── [GENERATE] ErrorState.tsx
    │       ├── [GENERATE] Modal.tsx
    │       ├── [GENERATE] Tooltip.tsx
    │       └── [GENERATE] ProgressBar.tsx
    │
    ├── features/                                 ← Business logic per feature
    │   ├── search/
    │   │   ├── [GENERATE] useSearch.ts           ← TanStack Query hook
    │   │   ├── [GENERATE] useNLPSearch.ts
    │   │   └── [GENERATE] search.types.ts
    │   ├── cases/
    │   │   ├── [GENERATE] useCase.ts
    │   │   ├── [GENERATE] useCaseSummary.ts
    │   │   ├── [GENERATE] useCitations.ts
    │   │   └── [GENERATE] useBookmark.ts        ← Firestore bookmark toggle
    │   ├── dictionary/
    │   │   ├── [GENERATE] useTerm.ts
    │   │   └── [GENERATE] useTermExplain.ts
    │   ├── judges/
    │   │   └── [GENERATE] useJudgeProfile.ts
    │   ├── moot/
    │   │   └── [GENERATE] useMootPrep.ts
    │   ├── draft/
    │   │   └── [GENERATE] useDraftSuggest.ts
    │   └── analyse/
    │       └── [GENERATE] useDocumentAnalyse.ts
    │
    ├── lib/
    │   ├── firebase/
    │   │   ├── [GENERATE] firebase.ts            ← Firebase app init
    │   │   ├── [GENERATE] auth.ts                ← signIn, signOut, onAuthStateChanged
    │   │   └── [GENERATE] firestore.ts           ← Firestore helpers
    │   │
    │   ├── api/
    │   │   ├── [GENERATE] client.ts              ← ApiClient class (auto-attaches token)
    │   │   ├── [GENERATE] api.ts                 ← All API functions
    │   │   └── [GENERATE] api.types.ts           ← API response shapes (Zod + types)
    │   │
    │   ├── stores/
    │   │   ├── [GENERATE] auth.store.ts          ← Zustand auth store
    │   │   ├── [GENERATE] ui.store.ts            ← Theme, font size
    │   │   └── [GENERATE] search.store.ts        ← Recent searches, filters
    │   │
    │   ├── data/
    │   │   ├── [CONFIG]   dictionary.ts          ← 500+ legal term definitions
    │   │   ├── [CONFIG]   maxims.ts              ← 200+ Latin maxims
    │   │   └── [CONFIG]   rights.ts              ← Know Your Rights content
    │   │
    │   └── utils/
    │       ├── [GENERATE] citation-formatter.ts  ← Format Indian citations
    │       ├── [GENERATE] date-formatter.ts
    │       └── [GENERATE] text-sanitiser.ts      ← Clean Kanoon HTML
    │
    └── types/
        ├── [GENERATE] api.ts                     ← All API response types
        ├── [GENERATE] case.ts                    ← Case, SearchResult types
        ├── [GENERATE] user.ts                    ← FirebaseUser, AuthState
        └── [GENERATE] dictionary.ts              ← Term, Maxim types
```

---

## Backend Extensions (`/backend`)

These files are **added to** the existing Phase 1 backend:

```
backend/
│
├── [GENERATE] routers/auth.py              ← GET /auth/me (verify + return user info)
├── [GENERATE] routers/legal_dictionary.py  ← GET /dictionary, POST /dictionary/explain
├── [GENERATE] routers/analyse.py           ← POST /analyse (document analyser)
├── [GENERATE] routers/rights.py            ← POST /rights/chat (rights chatbot)
│
├── [GENERATE] services/firebase_auth.py    ← Firebase Admin SDK verification
├── [GENERATE] services/rate_limiter.py     ← Per-user daily AI limit
│
└── [CONFIG]   firebase-service-account.json ← Downloaded from Firebase Console
                                               (NEVER commit to git — in .gitignore)
```

---

## package.json (Key Dependencies)

```json
{
  "dependencies": {
    "next": "14.2.x",
    "react": "^18.3.x",
    "react-dom": "^18.3.x",
    "typescript": "^5.x",

    "firebase": "^10.x",

    "@tanstack/react-query": "^5.x",
    "zustand": "^4.x",

    "framer-motion": "^11.x",
    "react-force-graph-2d": "^1.x",
    "react-markdown": "^9.x",
    "react-syntax-highlighter": "^15.x",
    "sonner": "^1.x",

    "zod": "^3.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "@types/react": "^18.x",
    "@types/node": "^20.x",
    "eslint": "^8.x",
    "eslint-config-next": "14.x"
  }
}
```

---

## tailwind.config.ts (Design System)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Nyaya brand colours
        gold: {
          DEFAULT: '#D4A843',
          light: '#E8C470',
          dim: 'rgba(212,168,67,0.12)',
        },
        ink: {
          DEFAULT: '#0B0C0F',
          2: '#13141A',
          3: '#1A1B22',
          card: '#16171E',
        },
        cream: {
          DEFAULT: '#F2ECD8',
          mid: '#C8BFA8',
          dim: '#9A9080',
        },
        status: {
          green: '#3ECF8E',
          red: '#F06060',
          blue: '#5B9CF6',
          purple: '#A78BFA',
        }
      },
      fontFamily: {
        serif: ['Libre Baskerville', 'Georgia', 'serif'],
        sans: ['Cabinet Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease both',
        'pulse-dot': 'pulse 2s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## New Backend Prompts (add to WEBSITE_PROMPTS.py)

```python
# Document Analyser
DOCUMENT_ANALYSE_PROMPT = """
You are a legal assistant helping a common Indian citizen understand a legal document.
The person may have no legal background. Be clear, direct, and compassionate.

Analyse the document and respond ONLY with a valid JSON object:
{{
  "document_type": "Legal Notice | Court Summons | FIR Copy | Rental Agreement | Employment Contract | Court Order | Other",
  "plain_summary": "2-3 sentences: what is this document and why did they receive it?",
  "what_it_means": "Plain English explanation of the key content",
  "important_dates": [{{"description": "Respond by", "date": "15 March 2025"}}],
  "action_items": ["What the person must do, in order of priority"],
  "their_rights": ["Rights the person has in this specific situation"],
  "warning_flags": ["Anything unusual, unreasonable, or potentially unlawful in the document"],
  "urgency": "immediate | within_week | within_month | no_deadline",
  "recommended_next_step": "The single most important thing they should do right now"
}}

Document text:
{document_text}
"""

# Know Your Rights Chat
RIGHTS_CHAT_PROMPT = """
You are a legal rights advisor for common Indian citizens.
You are answering a follow-up question about the user's rights in a specific situation.
Be concise, accurate, and cite Indian law (Constitution articles, IPC sections, etc.) where relevant.
Remind the user that this is general legal information, not legal advice, and they should consult a lawyer for their specific case.

Situation context: {situation}
Conversation so far:
{conversation_history}

User's question: {user_question}
"""

# Legal Term AI Explainer (Plain Language)
TERM_EXPLAIN_PROMPT = """
You are explaining an Indian legal term to someone who has no legal background.
Use simple language. Use an example from everyday Indian life.
Respond ONLY with a valid JSON object:
{{
  "plain_explanation": "What this term means in plain English (2-3 sentences)",
  "everyday_example": "A real-life example from Indian context that illustrates this term",
  "simpler_version": "Explain it as if talking to a 12-year-old",
  "why_it_matters": "When would an ordinary person encounter this term?",
  "related_indian_cases": ["Case name that famously applied this term (1-2 cases)"]
}}

Term to explain: {term}
Legal definition: {legal_definition}
"""
```

---

*Document: WEBSITE_FILESTRUCTURE.md · Project: Nyaya Web · Phase: 1*
