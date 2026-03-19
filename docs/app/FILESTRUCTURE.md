# FILESTRUCTURE.md — Nyaya: Complete File Tree

> Every file that needs to exist. Create them all before writing logic.
> Files marked `[GENERATE]` have code that Gemini should generate in full.
> Files marked `[SCAFFOLD]` need basic structure only.
> Files marked `[CONFIG]` are config/setup files with no logic.

---

## Backend (`/backend`)

```
backend/
│
├── [CONFIG]  .env.example
├── [CONFIG]  .gitignore
├── [CONFIG]  requirements.txt
├── [CONFIG]  render.yaml                    ← Render.com deploy config
│
├── [GENERATE] main.py                       ← FastAPI app setup, CORS, middleware
├── [GENERATE] config.py                     ← Pydantic Settings, env vars
│
├── routers/
│   ├── [CONFIG]   __init__.py
│   ├── [GENERATE] search.py                 ← GET /search, POST /search/nlp
│   ├── [GENERATE] cases.py                  ← GET /cases/{id}, GET /cases/{id}/summary, GET /cases/{id}/citations
│   ├── [GENERATE] judges.py                 ← GET /judges/{name}
│   ├── [GENERATE] moot.py                   ← POST /moot/prep
│   └── [GENERATE] draft.py                  ← POST /draft/suggest
│
├── services/
│   ├── [CONFIG]   __init__.py
│   ├── [GENERATE] kanoon.py                 ← Indian Kanoon API wrapper (async httpx)
│   ├── [GENERATE] gemini.py                 ← All Gemini AI calls
│   ├── [GENERATE] prompts.py                ← All prompt templates (see below)
│   ├── [GENERATE] citation.py               ← Build citation graph from cites/citedby
│   ├── [GENERATE] judge_profile.py          ← Aggregate judgment data into judge profile
│   └── [GENERATE] cache.py                  ← Simple TTL dict cache
│
└── models/
    ├── [CONFIG]   __init__.py
    ├── [GENERATE] case.py                   ← Case, CaseMetadata, SearchResult (Pydantic)
    ├── [GENERATE] summary.py                ← AISummary, MootPrep, DraftSuggestion
    └── [GENERATE] judge.py                  ← JudgeProfile, JudgeStats
```

---

## Flutter App (`/app`)

```
app/
│
├── [CONFIG]  pubspec.yaml
├── [CONFIG]  pubspec.lock
├── [CONFIG]  analysis_options.yaml
├── [CONFIG]  .gitignore
├── [CONFIG]  android/
│             └── app/
│                 └── src/main/
│                     ├── AndroidManifest.xml    ← Add INTERNET permission
│                     └── res/                   ← App icons
│
└── lib/
    │
    ├── [GENERATE] main.dart                 ← Entry point, Riverpod ProviderScope
    ├── [GENERATE] app.dart                  ← MaterialApp.router, GoRouter setup, theme
    │
    ├── core/
    │   │
    │   ├── database/
    │   │   ├── [GENERATE] app_database.dart         ← @DriftDatabase class
    │   │   ├── [GENERATE] app_database.g.dart       ← Generated (run build_runner)
    │   │   └── daos/
    │   │       ├── [GENERATE] cases_dao.dart
    │   │       ├── [GENERATE] summaries_dao.dart
    │   │       ├── [GENERATE] annotations_dao.dart
    │   │       ├── [GENERATE] search_history_dao.dart
    │   │       └── [GENERATE] judge_profiles_dao.dart
    │   │
    │   ├── api/
    │   │   ├── [GENERATE] api_client.dart           ← Dio setup, base URL, interceptors
    │   │   └── [GENERATE] api_exception.dart        ← Custom exception types
    │   │
    │   ├── theme/
    │   │   ├── [GENERATE] app_theme.dart            ← ThemeData (dark theme)
    │   │   ├── [GENERATE] app_colors.dart           ← Color constants
    │   │   └── [GENERATE] app_typography.dart       ← TextStyle definitions
    │   │
    │   └── constants/
    │       ├── [CONFIG]   api_constants.dart        ← Base URLs
    │       ├── [CONFIG]   strings.dart              ← All UI strings
    │       └── [CONFIG]   app_constants.dart        ← Max storage, pagination sizes
    │
    ├── features/
    │   │
    │   ├── home/
    │   │   ├── screens/
    │   │   │   └── [GENERATE] home_screen.dart
    │   │   ├── widgets/
    │   │   │   ├── [GENERATE] case_feed_card.dart
    │   │   │   └── [GENERATE] feed_filter_bar.dart
    │   │   ├── controllers/
    │   │   │   └── [GENERATE] home_controller.dart  ← StateNotifier, fetches feed
    │   │   └── repositories/
    │   │       └── [GENERATE] feed_repository.dart
    │   │
    │   ├── search/
    │   │   ├── screens/
    │   │   │   ├── [GENERATE] search_screen.dart
    │   │   │   └── [GENERATE] nlp_search_screen.dart
    │   │   ├── widgets/
    │   │   │   ├── [GENERATE] search_result_card.dart
    │   │   │   └── [GENERATE] search_filters.dart
    │   │   ├── controllers/
    │   │   │   └── [GENERATE] search_controller.dart
    │   │   └── repositories/
    │   │       └── [GENERATE] search_repository.dart
    │   │
    │   ├── case_detail/
    │   │   ├── screens/
    │   │   │   └── [GENERATE] case_detail_screen.dart
    │   │   ├── widgets/
    │   │   │   ├── [GENERATE] case_metadata_header.dart
    │   │   │   ├── [GENERATE] judgment_text_view.dart
    │   │   │   └── [GENERATE] case_action_bar.dart
    │   │   ├── controllers/
    │   │   │   └── [GENERATE] case_detail_controller.dart
    │   │   └── repositories/
    │   │       └── [GENERATE] case_repository.dart
    │   │
    │   ├── summary/
    │   │   ├── screens/
    │   │   │   └── [GENERATE] summary_screen.dart
    │   │   ├── widgets/
    │   │   │   ├── [GENERATE] summary_card.dart
    │   │   │   └── [GENERATE] key_issues_list.dart
    │   │   ├── controllers/
    │   │   │   └── [GENERATE] summary_controller.dart
    │   │   └── repositories/
    │   │       └── [GENERATE] summary_repository.dart
    │   │
    │   ├── citation_graph/
    │   │   ├── screens/
    │   │   │   └── [GENERATE] citation_graph_screen.dart
    │   │   ├── painters/
    │   │   │   └── [GENERATE] graph_painter.dart    ← CustomPainter node graph
    │   │   ├── models/
    │   │   │   └── [GENERATE] graph_node.dart       ← freezed model
    │   │   ├── controllers/
    │   │   │   └── [GENERATE] graph_controller.dart
    │   │   └── repositories/
    │   │       └── [GENERATE] citation_repository.dart
    │   │
    │   ├── judge/
    │   │   ├── screens/
    │   │   │   └── [GENERATE] judge_profile_screen.dart
    │   │   ├── widgets/
    │   │   │   ├── [GENERATE] judge_stats_card.dart
    │   │   │   └── [GENERATE] subject_bar_chart.dart  ← fl_chart
    │   │   ├── controllers/
    │   │   │   └── [GENERATE] judge_controller.dart
    │   │   └── repositories/
    │   │       └── [GENERATE] judge_repository.dart
    │   │
    │   ├── annotations/
    │   │   ├── screens/
    │   │   │   └── [GENERATE] annotate_screen.dart
    │   │   ├── widgets/
    │   │   │   ├── [GENERATE] highlightable_text.dart
    │   │   │   ├── [GENERATE] annotation_toolbar.dart
    │   │   │   └── [GENERATE] note_popup.dart
    │   │   ├── controllers/
    │   │   │   └── [GENERATE] annotation_controller.dart
    │   │   └── repositories/
    │   │       └── [GENERATE] annotation_repository.dart
    │   │
    │   ├── moot_prep/
    │   │   ├── screens/
    │   │   │   ├── [GENERATE] moot_input_screen.dart
    │   │   │   └── [GENERATE] moot_result_screen.dart
    │   │   ├── widgets/
    │   │   │   ├── [GENERATE] argument_card.dart
    │   │   │   └── [GENERATE] side_selector.dart
    │   │   ├── controllers/
    │   │   │   └── [GENERATE] moot_controller.dart
    │   │   └── repositories/
    │   │       └── [GENERATE] moot_repository.dart
    │   │
    │   ├── ask_ai/
    │   │   ├── screens/
    │   │   │   └── [GENERATE] ask_ai_screen.dart
    │   │   ├── widgets/
    │   │   │   ├── [GENERATE] chat_bubble.dart
    │   │   │   └── [GENERATE] chat_input_bar.dart
    │   │   ├── controllers/
    │   │   │   └── [GENERATE] ask_ai_controller.dart
    │   │   └── repositories/
    │   │       └── [GENERATE] ask_ai_repository.dart
    │   │
    │   ├── draft/
    │   │   ├── screens/
    │   │   │   └── [GENERATE] draft_screen.dart
    │   │   ├── widgets/
    │   │   │   ├── [GENERATE] draft_editor.dart
    │   │   │   └── [GENERATE] suggestion_sidebar.dart
    │   │   ├── controllers/
    │   │   │   └── [GENERATE] draft_controller.dart
    │   │   └── repositories/
    │   │       └── [GENERATE] draft_repository.dart
    │   │
    │   └── library/
    │       ├── screens/
    │       │   └── [GENERATE] library_screen.dart
    │       ├── widgets/
    │       │   ├── [GENERATE] saved_case_card.dart
    │       │   └── [GENERATE] storage_meter.dart
    │       ├── controllers/
    │       │   └── [GENERATE] library_controller.dart
    │       └── repositories/
    │           └── [GENERATE] library_repository.dart
    │
    └── shared/
        ├── widgets/
        │   ├── [GENERATE] nyaya_app_bar.dart
        │   ├── [GENERATE] loading_indicator.dart
        │   ├── [GENERATE] error_view.dart
        │   ├── [GENERATE] empty_state_view.dart
        │   ├── [GENERATE] court_badge.dart
        │   └── [GENERATE] area_of_law_chip.dart
        └── utils/
            ├── [GENERATE] date_formatter.dart
            ├── [GENERATE] citation_formatter.dart
            ├── [GENERATE] text_sanitiser.dart
            └── [GENERATE] storage_calculator.dart
```

---

## pubspec.yaml (Flutter dependencies)

```yaml
name: nyaya
description: Free AI-powered legal research for Indian law students
publish_to: none
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter

  # State management
  flutter_riverpod: ^2.5.1
  riverpod_annotation: ^2.3.5

  # Navigation
  go_router: ^13.2.0

  # Database (local, offline)
  drift: ^2.18.0
  sqlite3_flutter_libs: ^0.5.0
  path_provider: ^2.1.2
  path: ^1.9.0

  # HTTP client
  dio: ^5.4.3

  # Code generation helpers
  freezed_annotation: ^2.4.1
  json_annotation: ^4.9.0

  # Charts (Judge analytics)
  fl_chart: ^0.67.0

  # PDF export
  pdf: ^3.11.0
  printing: ^5.13.0

  # Sharing
  share_plus: ^9.0.0

  # Markdown rendering (AI summaries)
  flutter_markdown: ^0.7.1

  # Storage info
  disk_space: ^0.2.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  drift_dev: ^2.18.0
  build_runner: ^2.4.9
  riverpod_generator: ^2.3.10
  freezed: ^2.5.2
  json_serializable: ^6.8.0
  flutter_lints: ^4.0.0
```

---

## requirements.txt (Python backend)

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
httpx==0.27.0
google-generativeai==0.5.4
pydantic==2.7.1
pydantic-settings==2.2.1
python-dotenv==1.0.1
slowapi==0.1.9
structlog==24.1.0
```

---

## render.yaml (Render.com deployment)

```yaml
services:
  - type: web
    name: nyaya-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: GEMINI_API_KEY
        sync: false
      - key: KANOON_API_TOKEN
        sync: false
      - key: ENVIRONMENT
        value: production
```

---

*Document: FILESTRUCTURE.md · Project: Nyaya · Version: 1.0*
