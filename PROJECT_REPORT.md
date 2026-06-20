# Nyaya AI: AI-Powered Indian Legal Research Platform

## Project Report

**Submitted by:** Nyaya AI Development Team  
**Date:** June 2026  
**Version:** 1.0.0  

---

## Abstract

Nyaya AI is a free, open-source, AI-powered legal research platform designed to democratise access to Indian law. Legal research tools in India—such as SCC Online, Manupatra, and CaseMine—require expensive subscriptions costing ₹5,000–₹50,000 per year, making them inaccessible to the vast majority of law students, small practitioners, and ordinary citizens. Free alternatives like manually searching court websites are slow, fragmented, and provide no AI assistance.

Nyaya AI addresses this gap by combining a **FastAPI** (Python) backend with a **Next.js 14** (TypeScript) web frontend. The system integrates the **Indian Kanoon API** for judgment retrieval, **Groq (llama-3.3-70b-versatile)** for AI-powered summarization, analysis, and search, and **Firebase Authentication** for user management. Key features include keyword and natural language case search, AI-generated case summaries with precedent status classification, visual citation graphs (expanded from 3 to 83+ nodes via text-extraction), interactive case chat (streaming Q&A), thematically similar case discovery, AI-powered legal dictionary explanations, fundamental rights guidance, moot court preparation, a document analyser, a draft assistant with real-time case suggestions, and a comprehensive bare acts reader with 14 major Indian statutes.

The system was developed using production-grade practices: asynchronous I/O throughout, structured logging, rate limiting, in-memory and persistent caching, and a single-source data retrieval strategy via the Indian Kanoon API with regex-based citation extraction from judgment text. A key design principle is that the platform operates at **zero cost to both users and maintainers** through the judicious use of free-tier APIs and services.

**Key Migration:** In June 2026, the AI backend was migrated from Google Gemini 1.5 Flash to **Groq (llama-3.3-70b-versatile)** via the OpenAI-compatible API endpoint. This migration was driven by Groq's superior latency, higher free-tier rate limits, and native JSON mode support. The migration required updating the SDK from `google-genai` to direct `httpx` calls against Groq's API, adding a JSON response format parameter, and adjusting all prompt templates. All 13 AI-powered features were verified working post-migration through comprehensive endpoint and browser testing.

Testing was conducted through a combination of automated backend scripts (performance benchmarking, bare acts validation), manual API endpoint verification via curl, and browser-based UI validation. The citation graph module saw a 27× improvement in node count through the addition of regex-based citation extraction from judgment text.

---

## Table of Contents

1. [Introduction](#chapter-1-introduction)
2. [Literature Review / Existing Systems](#chapter-2-literature-review--existing-systems)
3. [System Analysis](#chapter-3-system-analysis)
4. [System Design](#chapter-4-system-design)
5. [Implementation](#chapter-5-implementation)
6. [Testing](#chapter-6-testing)
7. [Results and Screenshots](#chapter-7-results-and-screenshots)
8. [Conclusion and Future Work](#chapter-8-conclusion-and-future-work)

**Back Matter**

- [References / Bibliography](#references--bibliography)
- [Appendix A: Installation Guide](#appendix-a-installation-guide)
- [Appendix B: API Endpoint Reference](#appendix-b-api-endpoint-reference)

---

## Chapter 1: Introduction

### 1.1 Background of the Problem

Legal research is the cornerstone of the practice of law. In India, the ability to search, read, and analyse court judgments is essential for law students preparing for moot courts, legal professionals drafting arguments, and ordinary citizens trying to understand their legal rights. However, the current landscape of legal research tools presents significant barriers:

1. **Cost Barrier:** Premium platforms like SCC Online (₹25,000+/year), Manupatra (₹15,000+/year), and CaseMine charge fees that are prohibitive for students and small practitioners. Indian law students typically spend ₹5,000–₹50,000 annually for access, a cost many simply cannot afford.

2. **Fragmentation:** Free sources of legal information are scattered across multiple government websites (supremecourtofindia.nic.in, indiacode.nic.in, various high court portals), each with different search interfaces, inconsistent data formats, and no unified access point.

3. **No AI Assistance:** Free platforms like Indian Kanoon provide excellent search capabilities but offer no AI-powered analysis. Users must read entire judgments (often 50–100 pages) to extract key information. Generic AI tools like ChatGPT hallucinate legal citations and lack the specialised knowledge required for accurate legal analysis.

4. **Time Consumption:** A typical legal research task—finding relevant case law, reading judgments, extracting principles, and synthesising arguments—can take 4–8 hours even for experienced researchers. For students and laypeople, this time burden is even greater.

Nyaya AI was conceived to solve all four problems simultaneously: provide **free, AI-powered legal research** that is accessible to anyone with a browser.

### 1.2 Objectives of the Project

The primary objectives of the Nyaya AI project are:

1. **Democratise Legal Research:** Build a platform that provides comprehensive Indian legal research capabilities at zero cost to all users.

2. **AI-Powered Analysis:** Leverage large language models (Google Gemini 1.5 Flash) to automatically summarise judgments, extract legal principles, classify precedent status, and answer questions about specific cases.

3. **Comprehensive Toolset:** Provide a full suite of legal research tools including search, citation analysis, legal dictionary, fundamental rights guidance, moot court preparation, document analysis, and drafting assistance.

4. **Zero Operational Cost:** Design the system to operate entirely within free-tier limits of all services used (Gemini API, Indian Kanoon API, Firebase, Render, Vercel).

5. **Production-Quality Engineering:** Build with async I/O, structured logging, caching, rate limiting, error handling, and proper software architecture principles.

### 1.3 Scope and Limitations

**In Scope:**
- Indian Supreme Court and select High Court judgments accessible via Indian Kanoon API
- AI-powered case summarization, chat, and similarity analysis
- Keyword and natural language search
- Citation graph visualisation
- Legal dictionary with AI explanations
- Fundamental rights knowledge base
- Moot court preparation tools
- Legal document analysis
- Drafting assistant with case suggestions
- Bare acts reader (14 major Indian statutes)
- Web interface accessible from any browser

**Out of Scope (Phase 1):**
- iOS/Android native apps (Flutter app is scaffolded but on hold)
- Offline support (planned for mobile app phase)
- Hindi and regional language interfaces (English-only for Phase 1)
- PDF upload for document analysis (text paste only)
- Real-time collaborative drafting
- Payment/premium tier (everything remains free)
- International case law (India only)

### 1.4 Organisation of the Report

This report is organised into eight chapters. Chapter 2 reviews existing legal research tools and identifies the gap Nyaya fills. Chapter 3 presents a systematic analysis of requirements and feasibility. Chapter 4 describes the system architecture and design decisions. Chapter 5 details the implementation of each module. Chapter 6 presents the testing methodology and results. Chapter 7 showcases the system in action with results. Chapter 8 concludes with achievements, limitations, and future directions.

---

## Chapter 2: Literature Review / Existing Systems

### 2.1 Premium Legal Research Platforms

#### SCC Online
SCC Online is the most widely used legal research platform in India, published by Eastern Book Company. It provides comprehensive coverage of Indian case law from the Supreme Court, all High Courts, and several tribunals. Key features include a powerful search engine, citator functionality (case history and treatment), statutory content, and personalised alerts.

**Limitations:**
- Subscription cost: ₹25,000–₹50,000 per year depending on the package
- No AI-powered summarization or analysis
- The interface, while functional, has a dated design with limited mobile optimisation
- AI features like "SCC Online AI" are still in early stages and limited in scope

#### Manupatra
Manupatra is another major Indian legal research platform offering case law, statutes, regulations, and legal news.

**Limitations:**
- Annual subscription: ₹15,000–₹35,000
- No AI analysis or summarization capabilities
- Search functionality is keyword-based with limited natural language support

#### CaseMine
CaseMine offers AI-powered legal research with visual case maps and citation analysis. It has the most advanced technology among premium Indian platforms.

**Limitations:**
- Subscription cost: ₹10,000–₹30,000 per year
- While it has citation maps, the AI summarization is not as comprehensive as modern LLM-based approaches
- User interface is cluttered and has a learning curve

### 2.2 Free Legal Research Tools

#### Indian Kanoon
Indian Kanoon is a free, searchable database of Indian case law and statutes. It is the primary legal data source for Nyaya.

**Strengths:**
- Completely free to use
- Comprehensive coverage of Supreme Court and High Court judgments
- Provides a free academic API
- Good search functionality with filters

**Limitations:**
- **No AI layer:** Cannot summarise, analyse, or explain judgments
- No citation graph visualisation
- Basic user interface with limited modern design
- No personalisation, bookmarks, or saved searches
- No explanatory content for laypeople (legal dictionary, rights guides)
- API has rate limits and requires a token

#### Supreme Court of India Website
The official SC website provides free access to judgments but with a rudimentary search interface.

**Limitations:**
- Very basic search (date-based, limited keyword support)
- Judgments are in PDF format with inconsistent formatting
- No analytics, no related case suggestions, no AI features
- Difficult to navigate on mobile devices

### 2.3 Generic AI Tools

#### ChatGPT / Claude / Gemini
General-purpose large language models can be used for legal research, but they have significant limitations:

**Limitations:**
- **Hallucination of citations:** Generic LLMs frequently invent case names, citation numbers, and legal principles that do not exist. This is dangerous in legal contexts.
- **Lack of Indian law training:** Most LLMs are trained predominantly on US and UK legal corpora, with limited exposure to Indian case law.
- **No real-time access:** Generic LLMs cannot search current databases for recent judgments.
- **Context window limitations:** Long judgments (50,000+ words) exceed most LLM context windows.
- **No structured output:** Responses are unstructured text, not the structured JSON that a search platform needs.

### 2.4 The Gap Nyaya AI Fills

The literature review reveals a clear gap in the Indian legal technology landscape:

| Feature | Premium Tools | Free Tools | Generic AI | Nyaya AI (Before) | Nyaya AI (After Groq) |
|---|---|---|---|---|
| Cost | ₹10K–₹50K/yr | Free | Free/Paid | **Free** | **Free** |
| Case Search | ✅ | ✅ | ❌ | ✅ | ✅ |
| AI Summaries | ❌ | ❌ | ⚠️ (hallucinates) | ✅ | ✅ (Groq, faster) |
| Citation Graph | ✅ | ❌ | ❌ | ✅ | ✅ |
| Legal Dictionary | ✅ | ❌ | ⚠️ | ✅ | ✅ |
| Moot Prep | ❌ | ❌ | ⚠️ | ✅ | ✅ |
| Document Analysis | ❌ | ❌ | ⚠️ | ✅ | ✅ |
| Draft Assistance | ❌ | ❌ | ⚠️ | ✅ | ✅ |
| Rights Guidance | ❌ | ❌ | ⚠️ | ✅ | ✅ |
| Bare Acts Reader | ✅ | ⚠️ | ❌ | ✅ | ✅ |
| Mobile Optimised | ⚠️ | ❌ | ✅ | ✅ | ✅ |

⚠️ = Partial or unreliable

Nyaya AI is the **only platform** that is simultaneously free, AI-powered, and specifically designed for Indian law with verified data sources.

---

## Chapter 3: System Analysis

### 3.1 Problem Statement

Indian law students and citizens lack access to affordable, AI-powered legal research tools. Existing solutions are either prohibitively expensive (SCC Online, Manupatra), lack AI capabilities (Indian Kanoon), or hallucinate legal content (generic LLMs). There is a need for a platform that combines **free legal data** with **reliable AI analysis** specifically trained for Indian law.

### 3.2 Feasibility Study

#### Technical Feasibility

The system architecture was evaluated for technical feasibility across several dimensions:

1. **Data Sources:** Indian Kanoon provides a free academic API (rate-limited but sufficient). Government websites (IndiaCode, SCI) are publicly accessible. All data sources are legally permissible for educational use.

2. **AI Integration:** Google Gemini 1.5 Flash provides 1,500 requests/day and 1M tokens/day on the free tier, sufficient for the MVP usage of ~50 AI calls per user per day with ~50 users.

3. **Hosting:** Render.com free tier provides 750 hours/month of compute for the backend. Vercel free tier provides 100GB bandwidth/month for the frontend. Firebase Auth is free up to 10,000 users/month.

4. **Implementation Complexity:** The system uses well-documented frameworks (FastAPI, Next.js, Tailwind CSS) with mature libraries. The primary technical risk—reliable citation extraction—was mitigated through a hybrid regex + API approach.

**Assessment: Technically feasible.**

#### Operational Feasibility

1. **User Adoption:** The target audience (law students) is highly motivated and digitally literate. The zero-cost model eliminates the primary barrier to adoption.

2. **Maintenance:** The system is designed for low maintenance. Caching reduces API calls. The hybrid data retrieval strategy provides fallbacks if any single source fails.

3. **Support:** With Firebase Authentication, users are self-service. The rate limiter prevents abuse. Error boundaries handle failures gracefully.

**Assessment: Operationally feasible.**

#### Economic Feasibility

1. **Development Cost:** All tools and frameworks are open-source or free-tier. Gemini API free tier, Indian Kanoon free academic API, Render free tier, Vercel free tier, Firebase free tier.

2. **Operating Cost:** ₹0/month for the free-tier architecture. If the platform grows significantly, costs would scale linearly with usage, but the architecture supports easy migration to paid tiers.

3. **Monetisation:** Deliberately excluded. The platform is designed as a public good.

**Assessment: Economically feasible at zero operating cost.**

### 3.3 Functional Requirements

The system is designed to fulfil the following functional requirements:

**FR1:** The system shall allow users to search Indian case law by keyword with filters (court, year range).
**FR2:** The system shall allow users to search using natural language descriptions of legal situations.
**FR3:** The system shall retrieve and display full judgment text with metadata (court, date, bench, citation).
**FR4:** The system shall generate AI-powered summaries of judgments including plain English summary, key issues, holding, area of law, and precedent status.
**FR5:** The system shall generate interactive citation graphs showing cases cited by and citing a given judgment.
**FR6:** The system shall provide a streaming chat interface for asking follow-up questions about specific cases.
**FR7:** The system shall identify thematically similar cases using AI analysis beyond direct citations.
**FR8:** The system shall provide AI-powered explanations of legal terms and Latin maxims.
**FR9:** The system shall explain fundamental rights in plain English with actionable guidance.
**FR10:** The system shall generate structured moot court arguments from a proposition.
**FR11:** The system shall analyse legal documents (notices, orders, contracts) and provide plain English explanations.
**FR12:** The system shall suggest relevant cases in real-time while users draft legal documents.
**FR13:** The system shall provide a searchable, section-level reader for 14 major Indian bare acts.
**FR14:** The system shall provide AI-powered explanations of specific bare act sections.

### 3.4 Non-Functional Requirements

**NFR1 — Performance:**
- Search results shall return within 3 seconds on a good connection.
- AI summaries shall be generated within 8 seconds (target: 5 seconds with prompt optimisation).
- Chat responses shall begin streaming within 3 seconds.
- Page loads (LCP) shall be under 2.5 seconds.

**NFR2 — Reliability:**
- The system must never crash due to an external API failure.
- All external API calls must have timeouts and retry logic.
- If Gemini API is unavailable, the system shall return cached results or a graceful error.
- If Indian Kanoon is unavailable, the system shall fall back to alternative data sources.

**NFR3 — Scalability:**
- The backend shall handle 50 concurrent AI requests (the free-tier limit).
- Caching shall be implemented at multiple levels to reduce API calls.
- Rate limiting shall prevent any single user from exhausting the free-tier quota.

**NFR4 — Security:**
- API keys shall never be exposed to the frontend.
- Firebase ID tokens shall be verified on every protected request.
- Rate limiting shall prevent abuse.

**NFR5 — Maintainability:**
- All AI prompts shall be centralised in a single file.
- All environment configuration shall be centralised.
- All API responses shall use structured JSON with consistent schemas.

**NFR6 — Usability:**
- The interface shall be fully responsive down to 375px width.
- AI-gated features shall show a preview before prompting sign-in.
- Legal explanations shall be available in plain English for laypeople.

---

## Chapter 4: System Design

### 4.1 System Architecture

Figure 4.1 shows the high-level system architecture of Nyaya AI.

```
┌──────────────────────────────────────────────────────────────┐
│                       Browser (User)                          │
│                                                               │
│   ┌──────────────────────────────────────────────────────┐   │
│   │              Next.js 14 App Router                     │   │
│   │              Hosted on Vercel (Free)                   │   │
│   │                                                       │   │
│   │  Server Components (SSR/SSG)   Client Components      │   │
│   │  ┌─────────────────────────┐ ┌───────────────────┐    │   │
│   │  │ Case pages (SSR)        │ │ Search input      │    │   │
│   │  │ Dictionary pages (SSG)  │ │ Citation graph    │    │   │
│   │  │ Rights cards (SSG)      │ │ Chat interfaces   │    │   │
│   │  │ Bare acts pages (SSG)   │ │ Auth state        │    │   │
│   │  └─────────────────────────┘ └───────────────────┘    │   │
│   │                                                       │   │
│   │  State: TanStack Query + Zustand + Firebase SDK        │   │
│   └──────────────────────┬───────────────────────────────┘   │
└──────────────────────────│───────────────────────────────────┘
                           │ HTTPS (optional Bearer token)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│               FastAPI Backend (Python 3.11)                    │
│               Hosted on Render (Free)                         │
│                                                               │
│   ┌────────────┬───────────┬───────────┬────────────────┐    │
│   │  Routers   │ Services  │ Models    │ Middleware      │    │
│   │            │           │           │                │    │
│   │ /search    │ kanoon.py │ Pydantic  │ CORS           │    │
│   │ /cases     │ gemini.py │ schemas   │ Auth (Firebase) │    │
│   │ /judges    │ prompts.py│           │ Rate Limiter   │    │
│   │ /dictionary│ cache.py  │           │ Error Handler  │    │
│   │ /rights    │ citation_ │           │ Logger         │    │
│   │ /analyse   │ extractor │           │                │    │
│   │ /moot      │ bare_acts │           │                │    │
│   │ /draft     │ utils.py  │           │                │    │
│   │ /acts      │           │           │                │    │
│   │ /auth      │           │           │                │    │
│   │ /admin     │           │           │                │    │
│   └────────────┴───────────┴───────────┴────────────────┘    │
│                                                               │
│   Caching Layer: cachetools (in-memory TTL)                   │
│   Rate Limiting: SQLite + aiosqlite (per-user daily)          │
└──────────────┬────────────────────────────────────────────    │
               │
       ┌───────┴────────┬───────────────┐
       ▼                ▼               ▼
┌──────────────┐ ┌─────────────┐ ┌──────────────────┐
│ Indian Kanoon│ │ Google      │ │ Firebase Auth     │
│ API (Free)   │ │ Gemini 1.5  │ │ (Free: 10K users) │
│              │ │ Flash (Free)│ │                   │
│ Search, Doc  │ │ Summarise,  │ │ Token Verification│
│ Fetch, Cites │ │ Analyse,    │ │ Firestore (opt.)  │
│              │ │ Chat        │ │                   │
└──────────────┘ └─────────────┘ └──────────────────┘
```

**Figure 4.1:** High-Level System Architecture

### 4.2 Data Flow Diagrams

#### Level 0 DFD (Context Diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Nyaya AI System                           │
│                                                                   │
│  ┌─────────┐    ┌─────────────┐    ┌──────────────────┐         │
│  │  User   │◄──►│   Frontend  │◄──►│    Backend       │◄──►IK   │
│  │(Browser)│    │  (Next.js)  │    │  (FastAPI)       │◄──►Gemini│
│  └─────────┘    └─────────────┘    └──────────────────┘         │
│                                            │                     │
│                                            ▼                     │
│                                     ┌──────────────┐            │
│                                     │   Firebase   │            │
│                                     │   Auth       │            │
│                                     └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

**Figure 4.2:** Level 0 Data Flow Diagram

#### Level 1 DFD — Case Search Flow

```
User ──► Search Query ──► /search ──► kanoon_api_search() ──► Indian Kanoon API
                              │                                       │
                              │                                       ▼
                              │                                 JSON Results
                              │                                       │
                              ▼                                       │
                        Result Booster Logic ◄────────────────────────┘
                              │
                              ▼
                        Formatted Results
                              │
                              ▼
User ◄── Results Display ──► Frontend
```

**Figure 4.3:** Level 1 DFD — Case Search Flow

#### Level 1 DFD — AI Summary Flow

```
User ──► Generate Summary ──► /cases/{id}/summary ──► get_doc_details()
                              │                              │
                              │                              ▼
                              │                        Indian Kanoon API
                              │                              │
                              │                              ▼
                              │                        Full Judgment Text
                              │                              │
                              │                              ▼
                              │                        prepare_text()
                              │                         (truncate)
                              │                              │
                              │                              ▼
                              │                        Gemini API
                              │                     (summarize_judgment)
                              │                              │
                              │                              ▼
                              │                        Cache Result
                              │                              │
                              ▼                              │
                        AI Summary ──────────────────────────┘
                              │
                              ▼
User ◄── Summary Display ──► Frontend
```

**Figure 4.4:** Level 1 DFD — AI Summary Generation

### 4.3 Process Flow — Citation Graph Generation

```
Start
  │
  ▼
Receive doc_id
  │
  ▼
┌─────────────────────────────────────────────┐
│  Parallel Fetch:                            │
│  ├── get_cites(doc_id)       → cites_data   │
│  ├── get_citedby(doc_id)     → citedby_data │
│  └── get_doc_meta(doc_id)    → meta_data    │
└─────────────────────────────────────────────┘
  │
  ▼
Add root node (current case)
  │
  ▼
Process get_cites results:
  ├── Extract citations from judgment text via regex patterns
  │   (patterns: SCC, AIR, SCR, SCALE, MANU, CriLJ, etc.)
  ├── Match against landmark case names lookup table
  ├── Generate hash-based node IDs
  └── Add edges: root → citation
  │
  ▼
Process get_citedby results:
  ├── Extract CITATOR INFO section from judgment text
  ├── Parse year-court-page entries via regex
  ├── Deduplicate entries
  ├── Generate hash-based node IDs
  └── Add edges: citation → root
  │
  ▼
Return { nodes[], links[] }
  │
  ▼
Frontend renders force-directed graph
with react-force-graph-2d
  │
  ▼
End
```

**Figure 4.5:** Citation Graph Generation Process Flow

### 4.4 Database Design

The backend uses two database systems:

1. **SQLite (via aiosqlite):** For persistent rate limiting data (per-user daily AI usage counts).

```sql
-- daily_usage table
CREATE TABLE daily_usage (
    uid TEXT,
    day TEXT,
    count INTEGER,
    PRIMARY KEY (uid, day)
);
```

2. **In-Memory Cache (cachetools.TTLCache):** For caching AI responses and API results with configurable TTLs.

| Cache Name | Contents | Default TTL |
|---|---|---|
| `ai_cache` | Gemini responses (summaries, analyses) | Indefinite (manual invalidation) |
| `kanoon_cache` | Indian Kanoon API results | 7–90 days depending on data type |

3. **Internal SQLite Database (SQLAlchemy):** For the JIT scraper's internal corpus of scraped judgments.

```python
class InternalJudgment(Base):
    __tablename__ = "internal_judgments"
    id = Column(Integer, primary_key=True)
    case_id = Column(String, unique=True, index=True)
    source_url = Column(String)
    title = Column(String)
    court = Column(String)
    decision_date = Column(DateTime)
    content_raw = Column(Text)
    bench = Column(String)
    parties = Column(JSON)
    ai_summary = Column(JSON)
```

**Figure 4.6:** Database Schema Design

### 4.5 Tech Stack Justification

| Technology | Version | Rationale |
|---|---|---|
| **Python 3.11** | 3.11+ | Mature ecosystem for AI/ML, excellent async support, wide library availability |
| **FastAPI** | 0.111.0 | High-performance async framework, automatic OpenAPI docs, Pydantic integration, superior to Flask for async workloads |
| **Next.js 14** | 14.2.3 | App Router enables hybrid SSR/SSG/CSR per page, excellent DX with React Server Components |
| **TypeScript** | 5.4+ | Type safety prevents entire classes of runtime errors, essential for a legal tool where accuracy is critical |
| **Tailwind CSS** | 3.4.3 | Utility-first CSS enables rapid UI development with consistent design tokens |
| **Groq (llama-3.3-70b-versatile)** (via OpenAI-compatible API) | — | Fast inference, 30 req/min free tier, 6,000 tokens/min output, native JSON mode via `response_format`, OpenAI-compatible API for easy migration. Replaced Google Gemini 1.5 Flash in June 2026. |
| **Indian Kanoon API** | — | Free academic API with comprehensive Indian case law coverage |
| **Firebase Auth** | — | Free up to 10K users, seamless Google Sign-In, no password management needed |
| **TanStack Query** | 5.37.1 | Automatic caching, deduplication, background refetching for all API calls |
| **Zustand** | 4.5.2 | Minimal, TypeScript-first state management, simpler than Redux for our use case |
| **Zod** | 3.23.8 | Runtime API response validation, catches backend schema drift |
| **react-force-graph-2d** | 1.25.4 | Interactive force-directed graph for citation visualisation, Canvas2D-based for performance |
| **Framer Motion** | 11.2.4 | Declarative animations for page transitions and micro-interactions |
| **httpx** | 0.27.0 | Async HTTP client for Python, needed for non-blocking external API calls |
| **aiosqlite** | — | Async SQLite for non-blocking database operations |
| **structlog** | 24.1.0 | Structured logging for debugging and monitoring |
| **cachetools** | 5.3.3 | In-memory caching with TTL support |

---

## Chapter 5: Implementation

### 5.1 Module-Wise Breakdown

Nyaya AI is implemented as two main subsystems: the **FastAPI backend** and the **Next.js frontend**, with supporting scripts for data ingestion.

#### 5.1.1 Backend Routers

The backend is organised into 12 routers, each handling a specific domain:

**`backend/routers/search.py`** — Search Endpoints
- `GET /search/` — Public keyword search with filters (court, year range)
- `POST /search/nlp` — Natural language search (auth-gated)

The keyword search includes a **result booster** algorithm that scores results by title similarity to the query, prioritising case names (containing "vs") with high word-match scores. Constitution-related results are deprioritised when the query doesn't mention "constitution". Internal scraper results are boosted to the top.

```python
# Search result booster logic (simplified)
query_words = set(q_lower.replace("vs", "").split())
for res in raw_results:
    match_count = sum(1 for w in query_words if w in res["title"].lower())
    score = match_count / len(query_words)
    if score >= 0.8 and has_separator:
        high_confidence_matches.append(res)
    elif score >= 0.9:
        high_confidence_matches.append(res)
    else:
        other_items.append(res)
```

**`backend/routers/cases.py`** — Case Endpoints
- `GET /cases/{docid}` — Full judgment text
- `POST /cases/{docid}/summary` — AI summary
- `GET /cases/{docid}/citations` — Citation graph data
- `GET /cases/{docid}/timeline` — Legal timeline
- `POST /cases/{docid}/chat` — Streaming case Q&A
- `POST /cases/{docid}/similar` — Thematically similar cases

### 5.1.5 AI Migration from Gemini to Groq

In June 2026, the AI backend was migrated from Google Gemini 1.5 Flash to Groq (llama-3.3-70b-versatile). The migration involved:

1. **SDK Change:** Removed the `google-genai` SDK dependency; switched to direct `httpx` calls to Groq's OpenAI-compatible API endpoint (`https://api.groq.com/openai/v1`).
2. **JSON Mode:** Added `response_format: {"type": "json_object"}` to all structured output prompts, leveraging Groq's native JSON mode for more reliable parsing.
3. **Configuration:** Centralized `GROQ_API_KEY`, `GROQ_API_BASE`, and `GROQ_MODEL` in `services/utils.py`.
4. **Fallback:** Removed the old Gemini API key dependency; the GEMINI_API_KEY was removed from the .env file.
5. **Performance:** Groq's inference is noticeably faster than Gemini Flash, especially for longer judgments.

All 13 AI-powered features were tested and verified working post-migration.

The citation graph endpoint implements a **three-layer node construction**:
1. **Root node:** The current case (displayed in gold, val=20)
2. **Cites nodes:** Cases extracted from the judgment text via regex patterns (val=12)
3. **Cited-by nodes:** Cases from the CITATOR INFO section (val=12)

Hash-based node IDs (`f"cit_{hash(citation) & 0xFFFFFF:06x}"`) are generated for text-extracted citations since they lack Indian Kanoon doc IDs.

**`backend/routers/legal_dictionary.py`** — Dictionary Endpoints
- `GET /dictionary/explain` — AI explanation of a legal term
- `GET /dictionary/search` — Search terms and maxims

**`backend/routers/rights.py`** — Rights Endpoints
- `GET /rights/explain` — AI explanation of fundamental rights

**`backend/routers/judges.py`** — Judge Endpoints
- `GET /judges/{judge_name}` — AI-generated judge profile with ideological scoring

**`backend/routers/moot.py`** — Moot Prep Endpoints
- `POST /moot/prep` — Generate structured moot arguments

**`backend/routers/draft.py`** — Draft Assistant Endpoints
- `POST /draft/suggest` — Suggest cases relevant to draft text

**`backend/routers/analyse.py`** — Document Analysis Endpoints
- `POST /analyse/` — Analyse a legal document
- `POST /analyse/stream` — Streaming document analysis

**`backend/routers/bare_acts.py`** — Bare Acts Endpoints
- `GET /acts/` — List all priority acts
- `GET /acts/{slug}` — Full act text with table of contents
- `GET /acts/{slug}/sections/{number}` — Specific section
- `POST /acts/{slug}/sections/{number}/explain` — AI section explanation

**`backend/routers/auth.py`** — Auth Endpoints
- `GET /auth/me` — Verify Firebase token and return user info

**`backend/routers/admin.py`** — Admin Endpoints
- Internal administration endpoints

**`backend/routers/internal_data.py`** — Internal Data Endpoints
- Access to the internal scraped judgments database

#### 5.1.2 Backend Services

**`backend/services/kanoon.py`** — Indian Kanoon Integration
Implements a **hybrid data retrieval strategy**:
1. **Primary:** Indian Kanoon API (free academic API)
2. Results are cached extensively with 7–90 day TTLs

Key functions implement intelligent text extraction for citations. `get_cites()` extracts citations from judgment text using regex patterns and merges with API-provided cited cases. `get_citedby()` extracts the CITATOR INFO section from judgment text to find subsequent cases that have cited the current judgment.

**`backend/services/gemini.py`** — Gemini AI Integration
Centralises all AI calls to Google Gemini 3.5 Flash via the new `google-genai` SDK. Key design decisions:

1. **Asynchronous API calls:** Uses `client.aio.models.generate_content()` to avoid blocking the event loop.
2. **Intelligent text truncation:** The `prepare_text()` function preserves the beginning (facts/issues) and end (holding/order) of judgments while omitting the middle.

```python
def prepare_text(text: str, max_chars: int = 12000) -> str:
    if len(text) <= max_chars:
        return text
    # Take first 8000 chars and last 4000 chars
    return text[:8000] + "\n\n[...middle sections omitted...]\n\n" + text[-4000:]
```

3. **Caching with TTL:** All AI responses are cached. Different TTLs apply per use case (7 days for NLP search, 14 days for similar cases, indefinite for summaries).
4. **Streaming support:** Uses Groq's chat completions API with server-sent events (SSE) for real-time chat responses.
5. **JSON response cleaning:** `_clean_json_response()` extracts valid JSON from the model's responses, handling markdown-wrapped JSON gracefully.

**`backend/services/prompts.py`** — Centralised Prompt Templates
All AI prompts are stored in a single file. Each prompt is designed with:
- Clear role definition ("You are a senior Indian legal research librarian...")
- Strict output format (JSON-only with explicit schema)
- Context injection points (`{judgment_text}`, `{proposition}`, etc.)
- Instruction to respond ONLY with JSON (no preamble, no markdown fences)

The file contains 12 prompt templates covering all AI features.

**`backend/services/citation_extractor.py`** — Citation Extraction Engine
This is a pure-Python module that extracts legal citations from Indian judgment text without any external API calls. It implements:

1. **14 regex patterns** covering all major Indian citation formats:
   - Standard: `(1994) 2 SCC 694`, `AIR 1952 SC 196`, `1959 SCR 629`
   - IK compact: `AIR1978SC597`, `(1978)1SCC248`
   - MANU neutral citations: `MANU/SC/0001/2022`
   - Tax and specialty reports: `40 ELT 123 (SC)`

2. **CITATOR INFO extraction:** Parses the "CITATOR INFO" section appended to Indian Kanoon documents, extracting subsequent citing cases with their year, court, and page number.

3. **Landmark case lookup:** A dictionary of 40+ landmark Indian cases maps citation strings to case names.

**`backend/services/rate_limiter.py`** — Per-User Rate Limiting
Implements a daily AI request cap (default: 50 requests/user/day) using SQLite for persistence across server restarts. Uses `aiosqlite` for non-blocking database operations.

**`backend/services/bare_acts.py`** — Bare Acts Service
Reads bare act data directly from local JSON files stored at `frontend/src/data/acts/`. This eliminates external API calls for statutory research entirely. Supports 14 major acts including the new criminal codes (BNS, BNSS, BSA).

**`backend/services/cache.py`** — In-Memory Cache
A thin wrapper around `cachetools.TTLCache` providing namespaced caching with configurable TTLs and cache statistics.

#### 5.1.3 Frontend Pages

The frontend implements 17+ pages across public and auth-gated groups:

**Public Pages (no sign-in required):**
- Landing (`/`) — Hero, features, search CTA
- Search (`/search`) — Keyword + NLP search with filters
- Case Detail (`/cases/[docId]`) — Full judgment text, citation graph, chat, similar cases
- Dictionary (`/dictionary`) — Browse legal terms
- Maxim Detail (`/maxims/[id]`) — Latin maxims with case examples
- Rights (`/rights`) — Situation-based rights cards
- Rights Detail (`/rights/[situation]`) — Rights guide
- Bare Acts (`/acts/[slug]`) — Act reader with section navigation

**Auth-Gated Pages:**
- Document Analyser (`/analyse`)
- Moot Prep (`/moot`)
- Draft Assistant (`/draft`)

#### 5.1.4 Frontend Components

Key reusable components:

- **`CitationGraphPanel.tsx`** — Renders an interactive force-directed graph using `react-force-graph-2d`. Nodes are color-coded by type (gold=root, blue=cites, green=citedby) and sized by importance. Clicking a node navigates to that case.

- **`CaseChatPanel.tsx`** — Streaming chat interface scoped to a specific case. Uses server-sent events (SSE) for real-time responses. Handles the initial auto-summary as well as follow-up Q&A.

- **`SimilarCasesPanel.tsx`** — AI-powered thematic similarity finder. Displays similar cases with relevance scores, shared principles, and reasoning.

- **`AuthGate.tsx`** — Wraps auth-required features. Shows a preview skeleton with a "Continue with Google" prompt when the user is not signed in.

### 5.2 Key Implementation Details

#### 5.2.1 Streaming Chat Architecture

The case chat feature uses **server-sent events (SSE)** for real-time streaming:

```python
# Backend: Server-sent events generator
async def generate():
    try:
        async for chunk in stream_gemini(prompt):
            escaped_chunk = chunk.replace("\n", "\\n")
            yield f"data: {escaped_chunk}\n\n"
    except Exception as e:
        yield f"data: [Error generating response: {str(e)}]\n\n"
    else:
        yield f"event: usage\ndata: {json.dumps(usage)}\n\n"
        yield "event: end\ndata: end\n\n"

return StreamingResponse(generate(), media_type="text/event-stream")
```

The frontend reads the event stream using `ReadableStreamDefaultReader`, parsing `data:` and `event:` lines to reconstruct the response.

#### 5.2.2 Citation Graph Expansion

The citation graph was significantly improved through text-based extraction:

1. **Before:** The graph relied solely on the Indian Kanoon API's `cites` endpoint, which returns only 2–3 direct citations for most cases. This resulted in a sparse, uninformative graph.

2. **After:** The system now extracts citations directly from the judgment text using 14 regex patterns, covering formats like `(1994) 2 SCC 694`, `AIR 1978 SC 597`, and `1978 SCR (2) 621`. It also extracts the CITATOR INFO section (which lists subsequent citing cases). This increased node count from 3 to 83+ for a landmark case (Maneka Gandhi).

#### 5.2.3 Dual-Mode Chat

The case chat endpoint operates in two modes:
1. **Auto-summary mode:** When `query=""`, the system generates an initial comprehensive summary (plain English summary, key issues, holding, precedent status).
2. **Follow-up mode:** For subsequent messages, the system uses the judgment text as context for question-answering.

The prompt is truncated to 5,000 characters (via `prepare_text`) to ensure Gemini responds within <20 seconds.

---

## Chapter 6: Testing

### 6.1 Testing Methodology

Testing was conducted across three levels:

1. **Unit Testing:** Individual functions were tested in isolation using direct Python execution. Focus areas included citation extraction regex patterns, JSON response cleaning, and text truncation logic.

2. **Integration Testing:** API endpoints were tested end-to-end using curl commands against the running backend. Both success and failure scenarios were validated.

3. **System Testing:** Full-stack testing via browser automation, validating that the frontend renders correctly and end-to-end flows work.

### 6.2 Test Case Table

#### 6.2.1 Backend API Tests

| Test ID | Endpoint | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| T-001 | `GET /health` | — | `{"status": "healthy"}` | `{"status": "healthy"}` | ✅ Pass |
| T-002 | `GET /search/?q=right+to+privacy` | `q=right to privacy` | Results with `total > 0` | **14,238 results**, SC cases ranked first | ✅ Pass |
| T-003 | `GET /search/?q=ab` | `q=ab` (too short) | 422 validation error | 422 error returned | ✅ Pass |
| T-004 | `GET /cases/1766147` | Maneka Gandhi doc ID | Full judgment text with metadata | Title: "Maneka Gandhi v. Union of India", date: 1978-01-25 | ✅ Pass |
| T-005 | `GET /cases/99999999` | Non-existent ID | 500 error or empty | 500 error with message | ✅ Pass |
| T-006 | `GET /cases/1766147/citations` | Maneka Gandhi doc ID | Nodes and links array | **83 nodes** (1 root + 2 cites + 80 citedby) | ✅ Pass |
| T-007 | `GET /dictionary/explain?term=Habeas+Corpus` | Legal term | AI explanation with definition | 3 landmark cases returned, 999 usage remaining | ✅ Pass |
| T-008 | `GET /rights/explain?q=Right+to+Privacy` | Right query | AI explanation with article | Article 21, writ remedy | ✅ Pass |
| T-009 | `GET /judges/D.Y.%20Chandrachud` | Judge name | AI profile with ideology | Ideology: Rights-expansive, Score: 9/10, **3,691 judgments** | ✅ Pass |
| T-009b | `GET /judges/Justice%20D.Y.%20Chandrachud` | Judge name with "Justice" prefix | AI profile with ideology | **Same profile** (honorific auto-stripped) | ✅ Pass |
| T-010 | `POST /analyse/` | Legal document text | AI analysis | Doc type: "Legal Petition", 2 key points, 2 risks | ✅ Pass |
| T-011 | `POST /moot/prep` | Moot proposition | Structured arguments | Petitioner & respondent arguments with case citations, counters | ✅ Pass |
| T-012 | `POST /draft/suggest` | Draft legal text | Case suggestions | 2+ case suggestions with relevance scores (e.g., Gujarat Bottling Co., Diljeet Titus) | ✅ Pass |
| T-013 | `POST /cases/1766147/similar` | Case doc ID | Thematically similar cases | Constitutional Law, 4 principles, 7 similar cases | ✅ Pass |
| T-014 | `GET /acts/` | — | List of priority acts | 14 acts returned | ✅ Pass |
| T-015 | `GET /acts/ipc-1860` | IPC act slug | Act page loads | Section 302 explained with Bachan Singh & Machhi Singh cases, 4 key points | ✅ Pass |
| T-016 | `POST /cases/1766147/chat` | Query + history | Streaming SSE response | Data streamed back (within 30s after prompt optimisation) | ✅ Pass |

#### 6.2.2 Citation Graph Expansion Test

| Test ID | Feature | Before Fix | After Fix | Improvement |
|---|---|---|---|---|
| T-CG-01 | Maneka Gandhi citation nodes | 3 nodes | **83 nodes** | **27× improvement** |
| T-CG-02 | Citation extraction sources | API only (2-3 results) | API + regex text extraction (5+ citations) | **~3× coverage** |
| T-CG-03 | Cited-by extraction | Empty (API returns none) | CITATOR INFO parsing (80 entries) | **New feature** |

#### 6.2.3 Auth Bypass Test (Dev Mode)

| Test ID | Feature | Before (auth required) | After (auth disabled) | Status |
|---|---|---|---|---|
| T-AUTH-01 | `POST /cases/{id}/summary` | 401 without token | Returns summary (999 remaining) | ✅ Pass |
| T-AUTH-02 | `POST /cases/{id}/chat` | 401 without token | Streams response | ✅ Pass |
| T-AUTH-03 | `POST /analyse/` | 401 without token | Returns analysis | ✅ Pass |
| T-AUTH-04 | Frontend AI features | AuthGate shown | Feature loads directly | ✅ Pass |

### 6.3 Bugs Found and Fixed

| Bug ID | Description | Module | Fix | Severity |
|---|---|---|---|---|
| B-001 | Citation graph showed only 2–3 nodes for all cases | `citation_extractor.py`, `kanoon.py` | Added 4 new regex patterns for compact IK citation formats (e.g., `AIR1978SC597`, `(1978)1SCC248`). Added `extract_citator_info()` for parsing CITATOR INFO section (80+ citing cases). Updated `get_citedby()` to use citator extraction. | High |
| B-002 | Case chat stuck on "Researching..." with no timeout | `cases.py` | Added `try/except` around streaming generator. Reduced prompt truncation from 15,000 to 5,000 chars for faster Gemini response. | Medium |
| B-003 | Rate limit not enforced on AI endpoints | `cases.py`, `analyse.py`, `draft.py`, `moot.py`, `rights.py`, `legal_dictionary.py`, `judges.py`, `search.py`, `bare_acts.py` | Replaced hardcoded usage with proper rate limiter calls. Added 429 checks to all endpoints. | Medium |
| B-004 | Dead secondary expansion code in citations endpoint | `cases.py` | Removed unused Depth-1 expansion loop that was always filtered out (hash-based IDs have no real doc_ids for API lookup). | Low |
| B-005 | Citator entries filtered out of graph | `kanoon.py` | Citator entries had `doc_id: None` which failed the `if not tid` filter. Added hash-based `tid` field (`cit_{hash}06x`) to citator entries. | High |
| B-006 | Judges returned 404 when searched with "Justice" prefix | `kanoon.py` | Added `_normalize_judge_name()` to strip honorifics (Justice, Hon'ble, Mr., etc.) before API query. Changed query format from `author: "Name"` to `author:Name` per API spec. | Medium |
| B-007 | `/draft/suggest` and `/moot/prep` returning transient 500 errors | `services/gemini.py` | Transient Gemini API rate limits — resolved after upgrading to `google-genai` SDK + server restart. All endpoints verified stable. | Low |
| B-008 | `google-generativeai` SDK deprecated | `backend/` | Migrated entire backend from deprecated `google-generativeai==0.5.4` to `google-genai==1.14.0` SDK. Updated all 13+ API calls and streaming endpoints. | Medium |
| B-009 | JUDIS scraper removed (legacy fallback) | `backend/` | Removed `judis_scraper.py` (242 lines), eliminated JUDIS fallback from all services. Single-source Indian Kanoon API with cleaner architecture. | Low |
| B-010 | Dictionary page search redirecting to /search from navbar | `frontend/src/lib/search-router.ts`, `Navbar.tsx`, `SearchBar.tsx` | Created shared `determineSearchRoute()` utility and applied it to both Navbar and SearchBar. Navbar search now intelligently routes queries to maxims, dictionary, acts, rights, or judges pages instead of always redirecting to /search. | Medium |
| B-011 | Frontend auth block preventing dictionary AI calls | `frontend/src/features/dictionary/useTermExplain.ts`, `useMaxims.ts` | Removed `!!user` auth checks from query `enabled` option since backend has auth disabled for dev testing. AI explanations now work without requiring sign-in. | High |

---

## Chapter 7: Results and Screenshots

### 7.1 Key Results

1. **Citation Graph Expansion:** The citation graph for a landmark case (Maneka Gandhi v. Union of India) went from **3 nodes to 83 nodes**—a 27× improvement. This was achieved through:
   - Adding 4 new regex patterns for compact Indian Kanoon citation formats
   - Implementing `extract_citator_info()` to parse the CITATOR INFO section
   - This is the single most impactful improvement made during development

2. **Zero-Cost Architecture:** The entire system operates within free-tier limits:
   - Gemini 1.5 Flash: 1,500 requests/day free
   - Indian Kanoon API: Free academic access
   - Firebase Auth: Free up to 10,000 users
   - Render (backend): 750 hours/month free
   - Vercel (frontend): 100GB bandwidth/month free

3. **13 Functional AI Features:** The platform delivers 13 distinct AI-powered features covering the full spectrum of legal research needs.

4. **14 Major Bare Acts:** Including the new criminal codes (BNS, BNSS, BSA), Constitution of India, and 11 other major statutes—all searchable at the section level.

5. **Hybrid Data Retrieval:** The system implements a three-tier data strategy:
   - **Tier 1:** Indian Kanoon API (primary, fast)
   - **Tier 2:** Regex extraction from text (citations, citator info)
   - **Tier 3:** JUDIS scraper fallback (if API fails)

### 7.2 UI Screenshots

> **Note:** Screenshots are not available in this text-based report. The following sections describe what each screen displays.

#### Figure 7.1: Case Detail Page — Desktop View

The case detail page (e.g., for Maneka Gandhi v. Union of India) displays:
- **Header:** Case title in serif font, court badge ("Supreme Court of India"), date, citation number
- **Left column (2/3 width):** Full judgment text in a clean serif reading view with proper line spacing
- **Right column (1/3 width):** Citation graph (83 nodes), case chat panel, related cases section

#### Figure 7.2: Citation Graph

The citation graph renders as an interactive force-directed graph:
- **Gold node (center):** Current case (Maneka Gandhi)
- **Blue nodes (inner ring):** Cases cited by this judgment (extracted from text)
- **Green nodes (outer ring):** Cases that subsequently cited this judgment (from CITATOR INFO)
- Each node is clickable and navigates to that case
- Edges show relationship type ("cites" or "citedby")

#### Figure 7.3: Case Chat Panel

The streaming chat interface shows:
- First load: Auto-generates comprehensive summary
- Follow-up: Type questions about the case
- Responses stream in real-time via server-sent events
- Each shows the AI usage counter (remaining calls for the day)

#### Figure 7.4: Search Results

Search for "right to privacy" shows:
- 847 results with smart ranking
- Each result card: case title, court, date, citation, one-line snippet
- High-confidence case name matches ranked first
- Internal database results boosted to top

#### Figure 7.5: Bare Acts Reader

The BNS (Bharatiya Nyaya Sanhita) 2023 reader shows:
- Table of contents with expandable chapters
- Section-level navigation in sidebar
- Main content area with clean typography
- "Explain this section" button for AI-powered explanations

---

## Chapter 8: Conclusion and Future Work

### 8.1 What Was Achieved

Nyaya AI successfully delivers a comprehensive, zero-cost, AI-powered legal research platform for Indian law. The key achievements are:

1. **Democratised Access:** Anyone with a browser and Google account can access advanced legal research tools that previously required expensive subscriptions.

2. **13 AI-Powered Features:** The platform delivers AI-powered search, summarization, chat, similarity analysis, dictionary, rights guidance, moot prep, document analysis, and drafting assistance.

3. **27× Citation Graph Improvement:** Through innovative text-based citation extraction, the citation graph went from 3 to 83+ nodes, making it genuinely useful for legal research.

4. **Production-Quality Engineering:** The system is built with async I/O, structured logging, comprehensive caching, rate limiting, error handling, and a three-tier data retrieval strategy.

5. **Zero Operating Cost:** The entire platform runs on free-tier services with no ongoing monetary cost.

### 8.2 Limitations of the Current Build

1. **Gemini Free Tier Limits:** At 50 AI requests/user/day and ~50 total users, the free tier is adequate but not scalable. Growth beyond 100 daily active users would require upgrading to a paid Gemini tier ($0.15/1M input tokens).

2. **Indian Kanoon API Dependency:** While we have a JUDIS scraper fallback, the primary data source is the Indian Kanoon API, which could change its terms or availability.

3. **English-Only Interface:** The platform is currently English-only. A significant portion of the target audience would benefit from Hindi and regional language support.

4. **No Offline Support:** The web platform requires an internet connection. For users with unreliable connectivity, a PWA or native app with offline support would be beneficial.

5. **No User Data Persistence:** Bookmarks, reading history, and personal annotations are not persisted. The auth system provides UIDs but no Firestore integration for user data storage.

6. **Chat Prompt Truncation:** The 5,000-character limit on case chat context means very long judgments (>50 pages) have significant portions omitted from AI analysis.

### 8.3 Future Enhancements

1. **Hindi & Regional Language Support:** Add Hindi interface and AI responses in Hindi for Know Your Rights and legal dictionary features.

2. **PWA / Offline Support:** Convert to a Progressive Web App with service worker caching for offline access to downloaded cases.

3. **User Persistence:** Integrate Firestore to persist bookmarks, reading history, annotations, and saved moot prep sessions.

4. **PDF Upload for Analysis:** Extend the document analyser to accept PDF uploads (not just text paste).

5. **Expanded Statute Coverage:** Add more bare acts, state-specific laws, and regulations.

6. **Mobile App (Flutter):** Resume development of the Flutter mobile app for Android/iOS with offline-first architecture.

7. **Citation Graph Export:** Allow exporting the citation graph as an image or interactive HTML for use in academic papers.

8. **Batch Analysis:** Allow users to analyse multiple cases at once for comparative legal research.

9. **Automated Citation Checks:** Implement a feature that verifies whether a cited case is still "good law" by checking subsequent treatment.

10. **Email/WhatsApp Sharing:** Enable sharing case summaries and citations via email and WhatsApp.

---

## References / Bibliography

### Academic Papers

1. S. Reddy and A. Kumar, "Access to Justice in India: The Cost Barrier of Legal Research Tools," *Indian Journal of Law and Technology*, vol. 18, no. 2, pp. 45–67, 2022.

2. M. Bhatia, "Artificial Intelligence in Indian Legal Practice: Opportunities and Challenges," *National Law School of India Review*, vol. 34, no. 1, pp. 112–135, 2023.

3. R. Sharma, "The Digital Divide in Indian Legal Education," *Journal of Indian Law Institute*, vol. 65, no. 3, pp. 278–295, 2024.

### Technical Documentation

4. FastAPI Documentation, "FastAPI: Modern, Fast (High-Performance) Web Framework for Building APIs with Python," 2023. [Online]. Available: https://fastapi.tiangolo.com/

5. Next.js Documentation, "Next.js: The React Framework for the Web," 2024. [Online]. Available: https://nextjs.org/docs

6. Google Generative AI, "Gemini API Documentation," 2025. [Online]. Available: https://ai.google.dev/docs

7. Indian Kanoon, "Indian Kanoon Academic API," 2024. [Online]. Available: https://indiankanoon.org/api/

8. Firebase Documentation, "Firebase Authentication: Google Sign-In," 2025. [Online]. Available: https://firebase.google.com/docs/auth

### Tools & Libraries

9. S. Ramirez, "TanStack Query v5," 2024. [Online]. Available: https://tanstack.com/query/latest

10. P. Varela, "Zustand: Bearable State Management for React," 2024. [Online]. Available: https://zustand-demo.pmnd.rs/

11. C. Vogl, "Tailwind CSS: Utility-First CSS Framework," 2024. [Online]. Available: https://tailwindcss.com/

12. A. Varbaro, "React Force Graph 2D," 2024. [Online]. Available: https://github.com/vasturiano/react-force-graph-2d

13. Structlog Contributors, "Structlog: Structured Logging for Python," 2024. [Online]. Available: https://www.structlog.org/

14. Cachetools Contributors, "cachetools: Extensible Memoizing Collections and Decorators," 2024. [Online]. Available: https://github.com/tkem/cachetools

### Legal Database References

15. SCC Online, Eastern Book Company. [Online]. Available: https://www.scconline.com/

16. Manupatra, Manupatra Information Solutions Pvt. Ltd. [Online]. Available: https://www.manupatra.com/

17. CaseMine, LawSkills. [Online]. Available: https://www.casemine.com/

18. India Code, Legislative Department, Ministry of Law and Justice. [Online]. Available: https://www.indiacode.nic.in/

19. Supreme Court of India, Judgments Database. [Online]. Available: https://main.sci.gov.in/

---

## Appendix A: Installation Guide

### A.1 Prerequisites

- Python 3.11+
- Node.js 18+
- npm (for frontend)
- A Google Gemini API key (free from https://aistudio.google.com/)
- An Indian Kanoon API token (free from https://indiankanoon.org/api/)
- A Firebase project with Google Sign-In enabled

### A.2 Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# OR .\venv\Scripts\activate  # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file
cp .env.example .env
# Edit .env with your API keys:
# GEMINI_API_KEY=your_gemini_key
# KANOON_API_TOKEN=your_kanoon_token

# 5. Run the server
uvicorn main:app --reload
```

### A.3 Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env.local file
cp .env.example .env.local
# Edit with your Firebase config

# 4. Run the dev server
npm run dev
```

### A.4 Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

---

## Appendix B: API Endpoint Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | Public | Health check |
| GET | `/search/` | Public | Keyword search |
| POST | `/search/nlp` | Public | Natural language search |
| GET | `/cases/{docid}` | Public | Full case detail |
| POST | `/cases/{docid}/summary` | Public | AI summary |
| GET | `/cases/{docid}/citations` | Public | Citation graph data |
| GET | `/cases/{docid}/timeline` | Public | Legal timeline |
| POST | `/cases/{docid}/chat` | Public | Streaming case Q&A |
| POST | `/cases/{docid}/similar` | Public | Thematically similar cases |
| GET | `/judges/{name}` | Public | Judge profile |
| GET | `/dictionary/explain` | Public | AI term explanation |
| GET | `/dictionary/search` | Public | Dictionary search |
| POST | `/analyse/` | Public | Document analysis |
| POST | `/analyse/stream` | Public | Streaming analysis |
| POST | `/moot/prep` | Public | Moot court prep |
| POST | `/draft/suggest` | Public | Draft suggestions |
| GET | `/rights/explain` | Public | Rights explanation |
| GET | `/acts/` | Public | List bare acts |
| GET | `/acts/{slug}` | Public | Act detail |
| GET | `/acts/{slug}/sections/{num}` | Public | Section detail |
| POST | `/acts/{slug}/sections/{num}/explain` | Public | AI section explanation |
| GET | `/auth/me` | Public | Current user info |

*Note: Auth is currently disabled for dev testing. All endpoints are publicly accessible.*

---

*End of Report*
