# Phase 2: Power Features - Research

**Researched:** 2024-05-22
**Domain:** Flutter, FastAPI, Gemini AI, Legal Data Scraping
**Confidence:** HIGH

## Summary
Phase 2 focuses on "Power Features" that differentiate Nyaya from basic legal search tools. The core technical challenges involve interactive visualization (Citation Graph), persistent local state (Annotations), and specialized AI integration (NLP Search, Judge Analytics, Bare Acts). The backend infrastructure for several of these features is already partially present (NLP Search, Judge Profile generation, and basic Bare Acts routing), but requires refinement and frontend implementation in Flutter.

**Primary recommendation:** Use `CustomPainter` with `InteractiveViewer` for the Citation Graph to ensure high performance and smooth interaction on mobile.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `drift` | ^2.14.0 | Local Persistence | Type-safe SQLite for Flutter (Offsets for highlights) |
| `interactive_viewer` | Native | Pan/Zoom | Built-in Flutter widget for graph navigation |
| `google_generative_ai` | ^0.2.0 | AI Logic | Official SDK for Gemini 1.5 Flash |
| `shared_preferences` | ^2.2.0 | Simple Cache | For "localStorage" requirement (Bare Act explanations) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `beautifulsoup4` | ^4.12.0 | Scraping | For `legislative.gov.in` (India Code) scraping in backend |
| `httpx` | ^0.25.0 | Async HTTP | Backend requests to Indian Kanoon |

## Architecture Patterns

### Recommended Project Structure
```
lib/features/
├── search/
│   └── controllers/nlp_search_provider.dart
├── citation_graph/
│   ├── painters/graph_painter.dart
│   └── widgets/interactive_graph.dart
├── annotations/
│   ├── models/highlight_model.dart
│   └── logic/offset_calculator.dart
└── bare_acts/
    └── repositories/act_repository.dart
```

### Pattern 1: Offset-Based Highlighting
**What:** Store start/end integers relative to the plain text of the judgment.
**Example:**
```dart
// Drift Table Definition
class Annotations extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get docId => text()();
  IntColumn get startOffset => integer()();
  IntColumn get endOffset => integer()();
  TextColumn get note => text().nullable()();
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Graph Layout | Manual Math | `graphview` (optional) | Handling non-overlapping nodes is complex |
| PDF Parsing | Manual Scraper | `indiacode.nic.in` | Better structured than `legislative.gov.in` |

## User Constraints

### Locked Decisions (from CONTEXT.md / Instructions)
- **Bare Acts Gemini Call:** ONLY use `POST /acts/explain-section`.
- **Trigger:** Must be user-triggered via "Explain Section X" button.
- **Caching:** Response MUST be cached in `localStorage` (key: `section_explain_{actId}_{sectionNumber}`).
- **Efficiency:** Never call the API twice for the same section.

## Common Pitfalls

### Pitfall 1: Coordinate Mismatch in Highlights
**What goes wrong:** Highlighting offsets drift if text is cleaned/formatted differently between save and load.
**Prevention:** Always use the raw `doc` text from Indian Kanoon for offset calculation, and apply formatting/sanitization *after* mapping offsets.

### Pitfall 2: Graph Performance
**What goes wrong:** Drawing 50+ nodes with `CustomPainter` causes frame drops.
**Prevention:** Use `RepaintBoundary` and avoid `setState` for non-position changes.

## Code Examples

### Bare Act Cache Logic (Flutter/Web)
```dart
// Cache key: section_explain_{actId}_{sectionNumber}
final cacheKey = 'section_explain_${actId}_$sectionNumber';
final cachedData = prefs.getString(cacheKey);

if (cachedData == null) {
  final response = await api.explainSection(actId, sectionNumber);
  await prefs.setString(cacheKey, response);
}
```

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NL-SEARCH | NLP Search via Gemini | Backend `/search/nlp` is ready; needs frontend wiring. |
| CIT-GRAPH | Visual Citation Graph | Backend `/cases/{id}/citations` provides nodes/links. |
| ANNO-INL | Inline Annotations | Drift DB schema identified for offset storage. |
| JDG-ANLY | Judge Analytics | Backend `/judges/{name}` uses Gemini to generate profiles. |
| BACT-INT | Bare Acts Integration | `indiacode.nic.in` identified as superior source over `legislative.gov.in`. |

## Sources
- Indian Kanoon API Docs (Official)
- Flutter `CustomPainter` Documentation
- India Code Portal Structure (Manual Audit)
- Existing Nyaya Backend Codebase (Routers: `search.py`, `cases.py`, `judges.py`, `bare_acts.py`)
