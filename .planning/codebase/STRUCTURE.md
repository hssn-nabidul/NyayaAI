# Project Structure - NyayaAI

The NyayaAI codebase is organized into several distinct sub-projects, each handling a specific part of the ecosystem.

## Root Directory

-   `backend/`: The core API serving as the backbone for both the web and mobile applications.
-   `app/`: The mobile application developed using Flutter (currently in development).
-   `frontend/`: The web application built using Next.js (App Router).
-   `docs/`: Extensive project documentation including PRDs, architectural overviews, and database schemas.
-   `.planning/`: Internal planning and architectural focus documents.
-   `test_bare_acts.py`: A root-level test script for verifying Bare Act functionality.
-   `PROJECT_STATUS.md`: A high-level overview of the project's current state and roadmap.

---

## 1. Backend (`/backend`)

The backend is built with **FastAPI** (Python) and follows a service-oriented architecture.

-   `main.py`: The entry point for the FastAPI application, configuring middleware (CORS, logging) and including all routers.
-   `routers/`: Defines the API endpoints, organized by feature (e.g., `search.py`, `analyse.py`, `bare_acts.py`).
-   `services/`: Contains the business logic and external integrations:
    -   `kanoon.py`: Interface for the Indian Kanoon API.
    -   `gemini.py`: Integration with Google Gemini 1.5 Flash for AI-powered summaries and analysis.
    -   `firebase_auth.py`: Authentication logic using Firebase Admin SDK.
    -   `prompts.py`: Centralized management of LLM prompts.
-   `cache/`: Local storage for Bare Acts and other persistent data to reduce API calls.
-   `requirements.txt`: Python dependencies.

---

## 2. Web Frontend (`/frontend`)

The web frontend is a modern **Next.js** application utilizing the App Router.

-   `src/app/`: Contains the page routes and layout.
    -   `(auth)/`: Protected routes requiring authentication.
    -   `(public)/`: Publicly accessible pages.
-   `src/components/`: Reusable React components (UI elements, search bars, etc.).
-   `src/features/`: Feature-specific logic and UI (e.g., search results, analysis view).
-   `src/lib/`: Utility functions, store management (Zustand/auth), and API clients.
-   `tailwind.config.ts`: Styling configuration using Tailwind CSS.

---

## 3. Mobile App (`/app`)

The mobile application is built with **Flutter** for cross-platform support (Android/iOS).

-   `lib/`: The core Dart source code.
    -   `main.dart`: The main entry point and top-level widget.
-   `android/`, `ios/`, `linux/`, `macos/`, `windows/`, `web/`: Platform-specific configuration and build files.
-   `pubspec.yaml`: Flutter dependencies and project metadata.

---

## 4. Documentation (`/docs`)

Comprehensive documentation split into `app` and `web` contexts.

-   `app/`: Documentation focused on the Flutter app (PRD, Architecture, API).
-   `web/`: Documentation focused on the Next.js web app (Auth Flow, Website PRD).
-   `FILESTRUCTURE.md`: (Internal to docs) Detailed breakdown of the project hierarchy.
-   `GEMINI.md`: Guidelines and instructions for AI agents working on this project.
