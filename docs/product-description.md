# Nyaya AI — Product Description

**Product:** Nyaya AI — AI-Powered Indian Legal Research Platform  
**Website:** NyayaAI (self-hosted)  
**Version:** 1.0.0  
**Last Updated:** June 2026  
**Cost to user:** ₹0 (free, always)

---

## 1. What is Nyaya?

Nyaya is a **free, open-source, AI-powered legal research platform** built specifically for Indian law. It enables law students, legal professionals, and ordinary citizens to search, read, summarise, and analyse Indian case law and statutes — without expensive subscriptions.

The name "Nyaya" means "justice" in Sanskrit and many Indian languages, reflecting the platform's mission to democratise access to legal information.

---

## 2. Problem It Solves

| Problem | Impact | How Nyaya Solves It |
|---|---|---|
| Premium legal tools cost ₹5,000–₹50,000/year | Inaccessible to students and small practitioners | Completely free, no paid tier planned |
| Free tools (Indian Kanoon) have no AI layer | Users must read entire 100-page judgments manually | AI summarises, explains, and analyses |
| Generic AI (ChatGPT) hallucinates Indian citations | Dangerous in legal contexts | AI is grounded in verified Indian Kanoon data |
| Legal knowledge is fragmented across portals | Hard to find and connect related cases | Unified search + citation graphs + AI similarity |

---

## 3. Target Users

| User Persona | Needs | How Nyaya Helps |
|---|---|---|
| **Law Student** (3rd/4th year LLB) | Case research, moot prep, assignments | AI summaries, citation graphs, moot court generator, draft assistant |
| **Legal Professional** (junior advocate, paralegal) | Fast case discovery, document analysis | NLP search, document analyser, streaming case chat |
| **Common Citizen** (receives a legal notice) | Understand legal situation, know rights | Legal dictionary, Know Your Rights guides, document analyser |

---

## 4. Core Features

### 4.1 Case Search & Discovery
- **Keyword Search:** Search Indian case law by party name, citation, court, or keyword
- **Natural Language Search:** Describe a legal situation in plain English; AI extracts legal principles and retrieves relevant cases
- **Filters:** Court (Supreme Court / High Court), year range, subject area
- **Result Booster:** Smart ranking prioritises case-name matches and internal database results

### 4.2 Case Reading & Analysis
- **Full Judgment Text:** Clean reading view with proper typography and line spacing
- **AI Case Summary:** Plain English summary, key legal issues, court's holding, precedent status, area of law
- **Streaming Case Chat:** Real-time Q&A about a specific case (server-sent events)
- **Thematically Similar Cases:** AI identifies cases sharing legal principles beyond direct citations

### 4.3 Citation Graph
- **Interactive Force-Directed Graph:** Visualises cases cited by and citing a given judgment
- **Node Types:** Gold = current case, Blue = cases it cites, Green = cases that cite it
- **Text-Based Extraction:** Regex-based citation extraction from judgment text expands graphs from 3 to 83+ nodes
- **Clickable Nodes:** Tap any node to navigate to that case

### 4.4 Legal Dictionary & Maxims
- **500+ Legal Terms:** Pre-built glossary with pronunciations, definitions, area-of-law tags
- **AI Term Explainer:** Get a plain-English explanation with landmark case examples
- **200+ Latin Maxims:** Browse with case examples showing how courts applied them

### 4.5 Know Your Rights
- **Situation-Based Guides:** Arrest & Police, Landlord-Tenant, Consumer Rights, Domestic Violence, Employment, Property Dispute, Legal Notice Received
- **Actionable Guidance:** What your rights are, what authorities CANNOT do, what to do next

### 4.6 Bare Acts Reader
- **14 Major Indian Statutes:** BNS 2023, BNSS 2023, BSA 2023, Constitution of India, IPC 1860, CrPC 1973, Indian Evidence Act 1872, Indian Contract Act 1872, Transfer of Property Act 1882, CPC 1908, Limitation Act 1963, NI Act 1881, Hindu Marriage Act 1955, Hindu Succession Act 1956
- **Section-Level Navigation:** Browse by chapter and section
- **AI Section Explanation:** Plain English explanation of any section with case examples

### 4.7 Advanced Legal Tools (Auth-Gated)
- **Moot Court Prep:** Generate structured arguments (petitioner/respondent) from a moot proposition, with supporting cases and anticipated counters
- **Document Analyser:** Paste a legal notice, court order, FIR, or contract; AI identifies document type, explains in plain English, highlights deadlines, flags risks
- **Draft Assistant:** Rich text editor with real-time case suggestions as you type legal arguments
- **Judge Profiles:** AI-generated profiles with ideological scoring, subject-matter breakdown, notable judgments

---

## 5. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14 (TypeScript) | React framework with SSR/SSG, App Router |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS framework |
| **State** | TanStack Query + Zustand | API caching + UI state |
| **Validation** | Zod 3.23 | Runtime API response validation |
| **Charts** | react-force-graph-2d | Citation graph visualisation |
| **Animations** | Framer Motion 11 | Page transitions, micro-interactions |
| **Backend** | FastAPI (Python 3.11) | Async REST API |
| **AI** | Groq (llama-3.3-70b-versatile) | AI inference via OpenAI-compatible API |
| **Legal Data** | Indian Kanoon API | Free academic API for case law |
| **Auth** | Firebase Authentication | Google Sign-In (free up to 10K users) |
| **Hosting** | Render (backend) + Vercel (frontend) | Free-tier hosting |
| **Caching** | cachetools (in-memory TTL) | AI and API response caching |
| **Rate Limiting** | SQLite + aiosqlite | Per-user daily AI usage caps (50 req/day) |
| **Logging** | structlog | Structured logging |

---

## 6. API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | Public | Health check |
| GET | `/search/` | Public | Keyword case search |
| POST | `/search/nlp` | Public | Natural language search |
| GET | `/cases/{docid}` | Public | Full case detail with judgment text |
| POST | `/cases/{docid}/summary` | Public | AI-powered case summary |
| GET | `/cases/{docid}/citations` | Public | Citation graph data |
| POST | `/cases/{docid}/chat` | Public | Streaming case Q&A (SSE) |
| POST | `/cases/{docid}/similar` | Public | Thematically similar cases |
| GET | `/judges/{name}` | Public | AI judge profile |
| GET | `/dictionary/explain` | Public | AI legal term explanation |
| GET | `/dictionary/search` | Public | Dictionary term search |
| POST | `/analyse/` | Public | Legal document analysis |
| POST | `/moot/prep` | Public | Moot court preparation |
| POST | `/draft/suggest` | Public | Draft case suggestions |
| GET | `/rights/explain` | Public | Fundamental rights explanation |
| GET | `/acts/` | Public | List bare acts |
| GET | `/acts/{slug}` | Public | Full act text |
| GET | `/acts/{slug}/sections/{num}` | Public | Specific section |
| POST | `/acts/{slug}/sections/{num}/explain` | Public | AI section explanation |
| GET | `/auth/me` | Public | Current user info |

> **Note:** Auth is currently disabled in dev mode. All endpoints are publicly accessible for testing.

---

## 7. System Architecture

```
Browser (User)
    │
    ▼
Next.js 14 App (Vercel)
    ├── Server Components (SSR/SSG)
    │   ├── Case pages, Dictionary pages
    │   ├── Rights cards, Bare Acts pages
    └── Client Components
        ├── Search input, Citation graph
        ├── Chat interfaces, Auth state
    │
    ▼
FastAPI Backend (Python 3.11, Render)
    ├── Routers: search, cases, judges, dictionary
    │           analyse, moot, draft, rights, acts, auth
    ├── Services: kanoon.py (data), gemini.py (AI → now Groq)
    │            prompts.py, cache.py, rate_limiter.py
    │            citation_extractor.py, bare_acts.py
    └── Middleware: CORS, Auth (Firebase), Rate Limiter
    │
    ├──── Indian Kanoon API (legal data)
    ├──── Groq API (AI inference)
    └──── Firebase Auth (user management)
```

### Key Architecture Decisions

1. **Single-Source Data:** Indian Kanoon API is the primary (and only active) data source for case law. A JUDIS scraper was removed in favour of cleaner architecture.

2. **Citation Extraction:** 14 regex patterns extract citations from judgment text (formats like `(1994) 2 SCC 694`, `AIR 1978 SC 597`), plus CITATOR INFO section parsing — producing 27× more nodes than API alone.

3. **AI Migration (June 2026):** Migrated from Google Gemini 1.5 Flash to Groq (llama-3.3-70b-versatile) for faster inference, higher rate limits, and native JSON mode support.

4. **Zero-Cost Design:** All services operate within free tiers. 50 AI requests/user/day cap prevents quota exhaustion.

5. **Caching Strategy:** AI responses cached indefinitely; API results cached 7–90 days depending on data type.

---

## 8. Pages / Routes

| Route | Auth | Content |
|---|---|---|
| `/` | Public | Landing page with hero, features, search CTA |
| `/search` | Public | Keyword + NLP search with filters |
| `/cases/[docId]` | Public | Full judgment, summary, citation graph, chat, similar cases |
| `/dictionary` | Public | Browse legal terms alphabetically |
| `/dictionary/[term]` | Public | Term detail with AI explain button |
| `/maxims` | Public | Browse Latin maxims library |
| `/maxims/[id]` | Public | Maxim detail with case examples |
| `/rights` | Public | Situation-based rights cards |
| `/rights/[situation]` | Public | Rights guide with chat |
| `/acts/[slug]` | Public | Bare acts reader with section navigation |
| `/analyse` | Auth | Document analyser |
| `/moot` | Auth | Moot court prep |
| `/draft` | Auth | AI drafting assistant |
| `/bookmarks` | Auth | Saved cases |
| `/settings` | Auth | Theme, font size |

---

## 9. Current Status

- **13 AI-powered features** fully operational
- **14 major bare acts** with section-level search and AI explanations
- **Citation graph** achieves 83+ nodes for landmark cases (27× improvement over baseline)
- **Auth disabled in dev mode** — all endpoints publicly accessible
- **Flutter mobile app** scaffolded but development on hold
- **~50 AI requests/user/day** free-tier limit enforced via rate limiter

### Known Limitations
- English-only interface (Hindi content planned for rights section)
- No offline support (web-only; app would add offline)
- No user data persistence (bookmarks, annotations not stored)
- Chat context limited to 5,000 characters per query

---

## 10. Key Differentiators

| Feature | Nyaya AI | SCC Online | Manupatra | Indian Kanoon | ChatGPT |
|---|---|---|---|---|---|
| Cost | **Free** | ₹25K–₹50K/yr | ₹15K–₹35K/yr | Free | Free/Paid |
| AI Summaries | ✅ | ❌ | ❌ | ❌ | ⚠️ Hallucinates |
| Citation Graphs | ✅ | ✅ | ✅ | ❌ | ❌ |
| Legal Dictionary | ✅ | ✅ | ✅ | ❌ | ⚠️ |
| Document Analysis | ✅ | ❌ | ❌ | ❌ | ⚠️ |
| Moot Prep | ✅ | ❌ | ❌ | ❌ | ⚠️ |
| Draft Assistant | ✅ | ❌ | ❌ | ❌ | ⚠️ |
| Mobile Optimised | ✅ | ⚠️ | ❌ | ❌ | ✅ |
| Indian Law Specific | ✅ | ✅ | ✅ | ✅ | ❌ |

✅ = Available & reliable | ⚠️ = Partial or unreliable

---

*Document: product-description.md · Project: Nyaya AI · Version: 1.0.0*
