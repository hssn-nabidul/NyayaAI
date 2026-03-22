# Technology Stack

**Analysis Date:** 2026-03-21

## Languages

**Primary:**
- Python 3.10+ - Backend logic and API implementation (`backend/main.py`)
- TypeScript 5.4+ - Frontend web application development (`frontend/tsconfig.json`)

**Secondary:**
- Dart 3.10+ - Mobile application development (Currently on hold, `app/lib/main.dart`)

## Runtime

**Environment:**
- Node.js 18+ (Frontend)
- Python 3.10+ (Backend)
- Flutter/Dart SDK (Mobile)

**Package Manager:**
- npm - Frontend dependency management (`frontend/package.json`)
- pip - Backend dependency management (`backend/requirements.txt`)
- pub - Mobile dependency management (`app/pubspec.yaml`)
- Lockfiles: `frontend/package-lock.json` (present), `app/pubspec.lock` (present)

## Frameworks

**Core:**
- FastAPI 0.111.0 - Asynchronous backend API framework (`backend/main.py`)
- Next.js 14.2.3 - Frontend React framework with App Router (`frontend/package.json`)
- React 18.3.1 - Frontend UI library (`frontend/package.json`)
- Flutter (SDK ^3.10.4) - Cross-platform mobile framework (`app/pubspec.yaml`)

**Testing:**
- Pytest (inferred) - Performance and unit tests exist (`test_performance.py`, `test_bare_acts.py`)
- Flutter Test - Included in `app/pubspec.yaml`

**Build/Dev:**
- Uvicorn 0.29.0 - ASGI server for backend (`backend/requirements.txt`)
- Tailwind CSS 3.4.3 - Utility-first CSS framework (`frontend/tailwind.config.ts`)
- PostCSS/Autoprefixer - CSS transformation tools (`frontend/postcss.config.js`)

## Key Dependencies

**Critical:**
- `google-generativeai` 0.5.4 - Google Gemini AI integration (`backend/services/gemini.py`)
- `firebase-admin` 6.5.0 - Backend Firebase SDK for authentication (`backend/services/firebase_auth.py`)
- `firebase` 10.11.1 - Frontend Firebase Client SDK (`frontend/src/app/auth/`)
- `@tanstack/react-query` 5.37.1 - Asynchronous state management and data fetching (`frontend/package.json`)
- `zustand` 4.5.2 - Lightweight state management for frontend (`frontend/package.json`)
- `pydantic` 2.7.1 - Data validation and settings management (`backend/requirements.txt`)
- `httpx` 0.27.0 - Asynchronous HTTP client for Python (`backend/services/kanoon.py`)

**Infrastructure:**
- `slowapi` 0.1.9 - Rate limiting for FastAPI endpoints (`backend/services/rate_limiter.py`)
- `structlog` 24.1.0 - Structured logging for backend (`backend/requirements.txt`)
- `cachetools` 5.3.3 - In-memory caching for backend services (`backend/requirements.txt`)
- `framer-motion` 11.2.4 - Animation library for React (`frontend/package.json`)
- `react-force-graph-2d` 1.25.4 - Citation network visualization (`frontend/package.json`)

## Configuration

**Environment:**
- `.env` files for local development (ignored by git)
- `backend/.env.example` - Template for backend secrets (Gemini, Kanoon, Firebase)
- `frontend/.env.example` - Template for frontend public/private keys

**Build:**
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `analysis_options.yaml` - Flutter/Dart linting configuration (`app/analysis_options.yaml`)

## Platform Requirements

**Development:**
- Python 3.10+
- Node.js 18+
- Flutter SDK 3.10.4+

**Production:**
- Backend: ASGI-compatible server (e.g., Uvicorn/Gunicorn)
- Frontend: Vercel or Node.js runtime
- Auth/DB: Firebase Project

---

*Stack analysis: 2026-03-21*
