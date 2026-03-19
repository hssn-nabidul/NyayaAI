# ARCHITECTURE.md — Nyaya System Architecture

---

## 1. High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                  Android Device                          │
│                                                         │
│   ┌─────────────────────────────────────────────────┐  │
│   │              Flutter App (Dart)                  │  │
│   │                                                  │  │
│   │  ┌────────────┐  ┌──────────────┐               │  │
│   │  │  UI Layer  │  │  Riverpod    │               │  │
│   │  │ (Screens,  │←→│  Providers   │               │  │
│   │  │  Widgets)  │  │  (State)     │               │  │
│   │  └────────────┘  └──────┬───────┘               │  │
│   │                         │                        │  │
│   │                  ┌──────▼───────┐                │  │
│   │                  │ Repositories │                │  │
│   │                  └──────┬───────┘                │  │
│   │                         │                        │  │
│   │         ┌───────────────┼───────────────┐        │  │
│   │         │               │               │        │  │
│   │   ┌─────▼──────┐ ┌──────▼──────┐        │        │  │
│   │   │  Drift DB  │ │  Dio HTTP   │        │        │  │
│   │   │  (SQLite)  │ │  Client     │        │        │  │
│   │   │  OFFLINE   │ └──────┬──────┘        │        │  │
│   │   └────────────┘        │               │        │  │
│   └─────────────────────────│───────────────┘        │  │
└─────────────────────────────│───────────────────────--┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────┐
│                FastAPI Backend (Python)                  │
│                    [Render.com — Free]                   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                    Routers                        │  │
│  │  /search  /cases  /judges  /moot  /draft         │  │
│  └──────────────────┬───────────────────────────────┘  │
│                     │                                   │
│         ┌───────────┼───────────────┐                  │
│         │           │               │                  │
│  ┌──────▼──────┐ ┌──▼───────┐ ┌────▼──────┐           │
│  │  kanoon.py  │ │gemini.py │ │ cache.py  │           │
│  │  (API wrap) │ │(AI calls)│ │(in-memory)│           │
│  └──────┬──────┘ └──────────┘ └───────────┘           │
└─────────│─────────────────────────────────────────────--┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│               External APIs (Free)                       │
│                                                         │
│   Indian Kanoon API          Google Gemini 1.5 Flash    │
│   api.indiankanoon.org       generativelanguage.google  │
│   [Academic - Free]          [1M tokens/day - Free]     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Flutter App Architecture

### Pattern: Feature-First + Repository Pattern + Riverpod

```
lib/
├── main.dart                    # App entry point
├── app.dart                     # MaterialApp, router setup
│
├── core/
│   ├── database/
│   │   ├── app_database.dart    # Drift database definition
│   │   ├── app_database.g.dart  # Generated code
│   │   └── daos/
│   │       ├── cases_dao.dart
│   │       ├── summaries_dao.dart
│   │       ├── annotations_dao.dart
│   │       ├── judges_dao.dart
│   │       └── history_dao.dart
│   │
│   ├── api/
│   │   ├── api_client.dart      # Dio setup, interceptors
│   │   └── api_exception.dart   # Typed errors
│   │
│   ├── theme/
│   │   ├── app_theme.dart
│   │   ├── app_colors.dart
│   │   └── app_typography.dart
│   │
│   └── constants/
│       ├── api_constants.dart   # Base URLs
│       ├── strings.dart         # All UI strings
│       └── app_constants.dart   # Max storage, pagination, etc.
│
├── features/
│   ├── home/
│   │   ├── screens/home_screen.dart
│   │   ├── widgets/case_feed_card.dart
│   │   ├── widgets/feed_filter_bar.dart
│   │   ├── controllers/home_controller.dart
│   │   └── repositories/feed_repository.dart
│   │
│   ├── search/
│   │   ├── screens/search_screen.dart
│   │   ├── screens/nlp_search_screen.dart
│   │   ├── widgets/search_result_card.dart
│   │   ├── widgets/search_filters.dart
│   │   ├── controllers/search_controller.dart
│   │   └── repositories/search_repository.dart
│   │
│   ├── case_detail/
│   │   ├── screens/case_detail_screen.dart
│   │   ├── widgets/case_metadata_header.dart
│   │   ├── widgets/judgment_text_view.dart
│   │   ├── widgets/case_action_bar.dart
│   │   ├── controllers/case_detail_controller.dart
│   │   └── repositories/case_repository.dart
│   │
│   ├── summary/
│   │   ├── screens/summary_screen.dart
│   │   ├── widgets/summary_card.dart
│   │   ├── widgets/key_issues_list.dart
│   │   ├── controllers/summary_controller.dart
│   │   └── repositories/summary_repository.dart
│   │
│   ├── citation_graph/
│   │   ├── screens/citation_graph_screen.dart
│   │   ├── painters/graph_painter.dart      # CustomPainter
│   │   ├── models/graph_node.dart
│   │   ├── controllers/graph_controller.dart
│   │   └── repositories/citation_repository.dart
│   │
│   ├── judge/
│   │   ├── screens/judge_profile_screen.dart
│   │   ├── widgets/judge_stats_card.dart
│   │   ├── widgets/subject_bar_chart.dart
│   │   ├── controllers/judge_controller.dart
│   │   └── repositories/judge_repository.dart
│   │
│   ├── annotations/
│   │   ├── screens/annotate_screen.dart
│   │   ├── widgets/highlightable_text.dart
│   │   ├── widgets/annotation_toolbar.dart
│   │   ├── widgets/note_popup.dart
│   │   ├── controllers/annotation_controller.dart
│   │   └── repositories/annotation_repository.dart
│   │
│   ├── moot_prep/
│   │   ├── screens/moot_input_screen.dart
│   │   ├── screens/moot_result_screen.dart
│   │   ├── widgets/argument_card.dart
│   │   ├── widgets/side_selector.dart
│   │   ├── controllers/moot_controller.dart
│   │   └── repositories/moot_repository.dart
│   │
│   ├── ask_ai/
│   │   ├── screens/ask_ai_screen.dart
│   │   ├── widgets/chat_bubble.dart
│   │   ├── widgets/chat_input_bar.dart
│   │   ├── controllers/ask_ai_controller.dart
│   │   └── repositories/ask_ai_repository.dart
│   │
│   ├── draft/
│   │   ├── screens/draft_screen.dart
│   │   ├── widgets/draft_editor.dart
│   │   ├── widgets/suggestion_sidebar.dart
│   │   ├── controllers/draft_controller.dart
│   │   └── repositories/draft_repository.dart
│   │
│   └── library/
│       ├── screens/library_screen.dart
│       ├── widgets/saved_case_card.dart
│       ├── widgets/storage_meter.dart
│       ├── controllers/library_controller.dart
│       └── repositories/library_repository.dart
│
└── shared/
    ├── widgets/
    │   ├── nyaya_app_bar.dart
    │   ├── loading_indicator.dart
    │   ├── error_view.dart
    │   ├── empty_state_view.dart
    │   ├── court_badge.dart
    │   └── area_of_law_chip.dart
    └── utils/
        ├── date_formatter.dart
        ├── citation_formatter.dart
        ├── text_sanitiser.dart        # Clean Kanoon HTML
        └── storage_calculator.dart
```

---

## 3. Backend Architecture

```
backend/
├── main.py                      # FastAPI app, middleware, CORS
├── config.py                    # Settings (pydantic-settings)
├── requirements.txt
├── .env.example
│
├── routers/
│   ├── search.py                # GET /search, GET /search/nlp
│   ├── cases.py                 # GET /cases/{id}, GET /cases/{id}/cites
│   ├── judges.py                # GET /judges/{name}
│   ├── moot.py                  # POST /moot/prep
│   └── draft.py                 # POST /draft/suggest
│
├── services/
│   ├── kanoon.py                # Indian Kanoon API wrapper
│   ├── gemini.py                # All Gemini AI calls
│   ├── prompts.py               # All prompt templates
│   ├── citation.py              # Build citation graph data
│   ├── judge_profile.py         # Build judge profile data
│   └── cache.py                 # Simple TTL in-memory cache
│
└── models/
    ├── case.py                  # Case, CaseMetadata, SearchResult
    ├── summary.py               # AISummary, MootPrep, DraftSuggestion
    └── judge.py                 # JudgeProfile, JudgeStats
```

---

## 4. Data Flow: Case Search → Summary → Offline Save

```
User types "right to privacy article 21"
        │
        ▼
SearchController.search(query)
        │
        ▼
SearchRepository.search(query)
        │
        ├── Check local DB (SearchHistory)
        │
        ▼
ApiClient.get('/search?q=right+to+privacy+article+21')
        │
        ▼
[Backend] routers/search.py
        │
        ▼
[Backend] kanoon.search(query)
→ POST api.indiankanoon.org/search/
        │
        ▼
Returns: List<CaseMetadata> with docids
        │
        ▼
Flutter renders SearchResultCard list
        │
        ▼ (user taps a result)
        │
CaseDetailController.loadCase(docId)
        │
        ├── Check local DB (cases table) ──→ [FOUND] render immediately
        │
        └── [NOT FOUND] ApiClient.get('/cases/{docId}')
                │
                ▼
        [Backend] kanoon.get_full_doc(docId)
        → POST api.indiankanoon.org/doc/{docId}/
                │
                ▼
        Returns: full judgment text
                │
                ▼
        Flutter renders JudgmentTextView (paginated)
                │
                ▼ (user taps "Download & Summarise")
                │
        SummaryController.generateSummary(docId)
                │
                ├── Check local DB (summaries table) → [FOUND] render
                │
                └── [NOT FOUND] ApiClient.post('/cases/{docId}/summary')
                        │
                        ▼
                [Backend] gemini.summarise(fullText)
                → Gemini 1.5 Flash API
                        │
                        ▼
                Returns: AISummary JSON
                        │
                        ▼
                Flutter saves to Drift DB:
                - cases table (full text)
                - summaries table (AI summary)
                        │
                        ▼
                Renders SummaryScreen
                (works offline forever from here)
```

---

## 5. Offline Strategy

| Data | Storage | Eviction |
|---|---|---|
| Downloaded cases (full text) | Drift SQLite | Manual by user only |
| AI summaries | Drift SQLite | Never (unless case deleted) |
| Search results | In-memory only | On app restart |
| Annotations | Drift SQLite | Manual by user only |
| Search history | Drift SQLite | Auto: keep last 50 |
| Judge profiles | Drift SQLite | Auto: refresh after 30 days |
| Citation graphs | Drift SQLite | Auto: refresh after 7 days |
| Bare acts | Drift SQLite | Manual |
| Recent feed | In-memory | On app restart |

---

## 6. Riverpod Provider Tree

```dart
// Core providers (available app-wide)
final databaseProvider = Provider<AppDatabase>(...);
final apiClientProvider = Provider<ApiClient>(...);

// Feature providers
final searchProvider = StateNotifierProvider<SearchController, SearchState>(...);
final caseDetailProvider = FutureProvider.family<Case, String>((ref, docId) {...});
final summaryProvider = FutureProvider.family<AISummary, String>((ref, docId) {...});
final libraryProvider = StreamProvider<List<SavedCase>>(...);       // watches DB stream
final annotationsProvider = StreamProvider.family<List<Annotation>, String>(...);
final judgeProvider = FutureProvider.family<JudgeProfile, String>(...);
final mootProvider = StateNotifierProvider<MootController, MootState>(...);
final askAiProvider = StateNotifierProvider.family<AskAiController, AskAiState, String>(...);
```

---

## 7. Error Handling Strategy

```
Network Error
    → Show snackbar "No internet connection"
    → If case is in DB → load from DB silently
    → If case is NOT in DB → show EmptyStateView with "Download when online" message

Gemini API Error
    → Log error
    → Show "AI Summary unavailable right now. Try again later."
    → If cached summary exists → show cached version

Indian Kanoon API Error
    → Show "Search unavailable. Check your connection."
    → Show cached search history suggestions

Database Error
    → Log error with structlog
    → Show generic error screen with "Restart App" button
    → Never expose raw error messages to user
```

---

*Document: ARCHITECTURE.md · Project: Nyaya · Version: 1.0*
