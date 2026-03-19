# WEBSITE_PRD.md — Nyaya Web: Product Requirements

**Phase:** 1 (Website)  
**Platform:** Web (desktop + mobile browser)  
**Framework:** Next.js 14 App Router  
**Auth:** Firebase Google Sign-In  
**Cost to user:** ₹0

---

## 1. Problem Statement

Two distinct groups need Nyaya Web:

**Group A — Law Students**
Same as the app — need case research, summaries, judge analytics, moot prep — but want it on a browser with a bigger screen, not just a phone.

**Group B — Common People (the bigger opportunity)**
A person receives a legal notice. They have no lawyer. They have no money. They don't know what "sub judice" means. They go to Google, get nothing useful, panic.

Nyaya Web serves both groups with one platform — advanced tools for students, plain-language explanations for everyone else.

---

## 2. Users

### User A: Law Student
- 3rd/4th year, LLB or BA LLB
- Uses laptop in college library
- Needs: case search, AI summaries, moot prep, judge analytics
- Has Google account (everyone does)
- Will not pay for any tool

### User B: Common Person
- Received a legal notice, FIR, court summons, eviction notice
- No legal background
- Speaks Hindi and/or English
- Needs: plain English explanation of their situation + what to do
- Has a smartphone with browser access
- Has never heard of Indian Kanoon

---

## 3. Core Features — Public (No Login Required)

### 3.1 Keyword Case Search
- Search box on homepage
- Searches Indian Kanoon via backend
- Returns: title, court, date, citation, one-line snippet
- Filters: court, year range, subject area
- No login required — anyone can search

### 3.2 Case Full Text View
- Any case from search results is viewable in full
- Clean reading view — proper typography, line spacing
- Judge names are clickable → judge profile
- Citation number displayed prominently
- No login required

### 3.3 Legal Dictionary — Browse
- Alphabetically browseable list of legal terms
- Pre-built glossary of 500+ Indian legal terms
- Each term: name, brief definition, area of law tag
- No login required to browse

### 3.4 Legal Maxims Library — Browse
- Complete library of Latin maxims used in Indian courts
- Each entry: Latin phrase, pronunciation, literal meaning, legal meaning
- No login required to browse

### 3.5 Know Your Rights — Static Cards
- Situation-based guide for common people
- Categories: Arrest & Police, Landlord-Tenant, Consumer Rights, Domestic Violence, Employment, Property Dispute, Legal Notice Received
- Each card: what are your rights, what can police/landlord/etc. NOT do, what to do next
- Written in plain English (and Hindi where possible)
- No login required

---

## 4. Core Features — Requires Google Sign-In

### 4.1 AI Case Summary
- Available on any case detail page
- Button: "✨ Generate AI Summary"
- If user is not signed in → prompt: "Sign in with Google to unlock AI summaries — it's free"
- Once signed in → generates summary via Gemini
- Cached in Firestore against the user's UID + docId (so not regenerated on revisit)
- Summary sections: Plain English Summary, Key Issues, Holding, Precedents, Significance

### 4.2 Natural Language Search
- Separate tab on search page: "Describe your legal issue"
- Textarea for detailed situation description
- AI extracts legal terms → runs enhanced Kanoon search
- Returns ranked results with match explanation
- Requires sign-in

### 4.3 AI Legal Term Explainer
- On any term in the Legal Dictionary, button: "Explain this to me"
- Gemini explains the term with: plain English meaning, an example situation, relevant Indian cases that applied it
- Has "Explain even simpler" button for non-lawyers
- Requires sign-in

### 4.4 Document Analyser
- Dedicated page: "Understand Your Legal Document"
- User pastes text from: legal notice, court order, FIR, rental agreement, employment contract
- AI analyses and produces:
  - What this document is (type identification)
  - What it means in plain English
  - Important dates and deadlines highlighted
  - What the user must do (action items)
  - What rights the user has in this situation
  - Warning flags (unusual clauses, unreasonable demands)
- Requires sign-in
- Max document length: 5,000 words

### 4.5 Judge Profiles
- AI-generated profile of any judge (tap their name in any judgment)
- Stats: total judgments, subject breakdown, notable cases, ideological tendency
- Requires sign-in (Gemini generates the profile text)

### 4.6 Citation Graph
- Interactive force-directed graph on any case page
- Shows: cases this judgment cites (outward) + cases that cite this judgment (inward)
- Clickable nodes navigate to those cases
- Requires sign-in

### 4.7 Moot Court Prep
- Dedicated page for law students
- Input: moot proposition + select side (Petitioner / Respondent / Both)
- Output: structured arguments, supporting cases, anticipated counters
- Save result as PDF
- Requires sign-in

### 4.8 AI Draft Assistant
- Simple text editor with real-time case suggestion sidebar
- As user types legal arguments, AI suggests relevant cases
- Click a suggestion to insert the citation
- Requires sign-in

### 4.9 Bookmarks & Notes
- Bookmark any case — stored in Firestore under user's Google UID
- Add a personal note to any bookmarked case
- Bookmarks page: manage all saved cases
- Requires sign-in
- Syncs across devices (since it's web + Firestore)

---

## 5. Web-Exclusive Features (Not in App)

### 5.1 Legal Dictionary — AI Explain (expanded)
Beyond what the app has — web gets:
- "Explain in Hindi" button (Gemini responds in Hindi)
- "Give me an example from my life" contextual examples
- Related maxims and doctrines linked
- Cases where this term was central

### 5.2 Know Your Rights — Interactive
- User selects their situation from cards
- Can then ask follow-up questions in a chat: "But what if the police say X?"
- AI answers based on Indian law, not generic advice
- Requires sign-in for chat feature

### 5.3 Legal Notice Received — Step by Step Guide
- Special flow for the most common common-person scenario
- "I received a legal notice — what do I do?"
- Walks through: what type of notice is this, what does it mean, what's your deadline, what are your options
- Connects to Document Analyser

### 5.4 "Explain This Paragraph" (in Case Reader)
- User selects any paragraph in a judgment
- Right-click / floating button: "Explain this paragraph"
- Gemini explains that specific passage in plain English
- Requires sign-in

### 5.5 Legal Maxims — Case Examples
- On each maxim page, show 3-5 Indian cases where this maxim was applied
- Quote the relevant excerpt from the judgment
- Show how the court used the maxim to reach its decision

---

## 6. Pages List

| Page | Route | Auth | Description |
|---|---|---|---|
| Landing | `/` | Public | Hero, features, sign-in CTA |
| Search | `/search` | Public | Keyword + NLP search |
| Case Detail | `/cases/[docId]` | Public (summary requires auth) | Full judgment |
| Judge Profile | `/judges/[name]` | Auth | Judge analytics |
| Citation Graph | `/cases/[docId]/graph` | Auth | Visual graph |
| Legal Dictionary | `/dictionary` | Public | Browse terms |
| Term Detail | `/dictionary/[term]` | Public (AI explain = auth) | Term page |
| Legal Maxims | `/maxims` | Public | Browse maxims |
| Maxim Detail | `/maxims/[id]` | Public | Maxim + cases |
| Know Your Rights | `/rights` | Public | Situation cards |
| Rights Detail | `/rights/[situation]` | Public (chat = auth) | Rights guide |
| Document Analyser | `/analyse` | Auth | Paste + analyse |
| Moot Prep | `/moot` | Auth | Moot generator |
| Draft | `/draft` | Auth | AI drafting |
| Bookmarks | `/bookmarks` | Auth | Saved cases |
| Settings | `/settings` | Auth | Theme, font size |
| Sign In | `/auth/signin` | Public | Google sign-in |

---

## 7. Sign-In Experience Design

The sign-in prompt must be **inviting, not hostile**. Rules:

- Never show a sign-in wall before the user has seen value
- Public features always work without sign-in
- When a user hits an auth-gated feature, show:
  - A preview/skeleton of what they'll see
  - Text: "Sign in with Google to unlock this — it's completely free"
  - One button: "Continue with Google"
  - Small print: "We use your Google account only to identify you. We don't read your emails or contacts."
- After sign-in → immediately continue to what they were doing (redirect back)
- First sign-in → show a brief "Welcome to Nyaya" modal explaining what they now have access to

---

## 8. Legal Dictionary — Pre-built Content

The dictionary must include at minimum:

**Categories:**
- Constitutional Law terms (Art. 21, Writ, Habeas Corpus, Locus Standi, PIL...)
- Criminal Law terms (FIR, Chargesheet, Bail, Cognizable, Non-cognizable...)
- Civil Law terms (Plaint, Written Statement, Interlocutory, Ex-parte...)
- Property Law terms (Conveyance, Easement, Encumbrance, Adverse Possession...)
- Contract Law terms (Consideration, Void, Voidable, Specific Performance...)
- Family Law terms (Maintenance, Custody, HUF, Restitution of Conjugal Rights...)
- Latin Maxims (200+ entries)

**Each term entry:**
```json
{
  "term": "Habeas Corpus",
  "pronunciation": "HAY-bee-us KOR-pus",
  "type": "Writ | Latin Maxim | Legal Doctrine | Procedural Term",
  "plain_meaning": "A court order requiring a person under arrest to be brought before a judge",
  "legal_meaning": "...",
  "area_of_law": ["Constitutional Law", "Criminal Procedure"],
  "landmark_cases": ["ADM Jabalpur v. Shivkant Shukla", "Maneka Gandhi v. UoI"],
  "related_terms": ["Mandamus", "Certiorari", "Quo Warranto"]
}
```

---

## 9. Non-Functional Requirements

### Performance
- Largest Contentful Paint: < 2.5s (Vercel Edge)
- Time to Interactive: < 3s
- AI responses: show streaming where possible, spinner otherwise
- Search results: < 2s on good connection

### Mobile
- Fully responsive down to 375px width
- Bottom navigation on mobile (not sidebar)
- Touch-friendly: all tap targets ≥ 44px
- Works on Android Chrome and iOS Safari

### SEO
- Every case page indexed: `/cases/[docId]` → proper title, meta description
- Legal dictionary terms indexed: `/dictionary/[term]`
- Sitemap generated automatically
- Open Graph tags on all public pages

### Privacy
- No tracking beyond Firebase Auth (which is Google's own system)
- No analytics without user consent
- Search queries are not stored or linked to user identity
- Privacy policy page required before launch

---

## 10. Out of Scope (Phase 1 Web)

- Payment / premium tier (everything is free)
- Hindi UI (English only for now — Hindi content in Know Your Rights only)
- PDF upload for document analysis (text paste only)
- Real-time collaboration
- Comments or community features
- Email notifications
- PWA / offline support (that's the app's job)

---

*Document: WEBSITE_PRD.md · Project: Nyaya Web · Phase: 1*
