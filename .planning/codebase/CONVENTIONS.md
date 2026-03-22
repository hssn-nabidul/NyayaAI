# Nyaya Coding Conventions

This document outlines the coding standards, naming conventions, and project-specific patterns for the Nyaya project.

---

## 🏗️ General Standards (Quality Focus)

- **Production-Ready Code:** All code must be written with scalability, security, and performance in mind. No "quick hacks."
- **Asynchronous First:** Use `async/await` for all I/O operations (network, database, file system). Never use synchronous blocking calls.
- **Strict Typing:** 
    - **Python:** Use Pydantic models for all data structures and Type Hints for all function signatures.
    - **TypeScript:** No `any` types allowed. Use Zod for runtime validation of API responses.
    - **Dart:** No `dynamic` types allowed.
- **Documentation:**
    - **Python:** Every function and class must have a `docstring`.
    - **Dart:** Every function and class must have a `/// doc comment`.
- **Error Handling:** Catch and handle all exceptions gracefully. Never let the application crash. Use standardized error responses in the API.
- **Logging:** No `print()` statements in production code. Use `structlog` (Python) or a proper logger in Flutter/Web.
- **Centralization:**
    - AI Prompts live in `backend/services/prompts.py`.
    - API constants live in `lib/core/constants/api_constants.dart` (App) and `src/lib/api/client.ts` (Web).
    - Hardcoded strings live in a centralized constants file.

---

## 🐍 Backend Conventions (Python FastAPI)

- **Framework:** FastAPI with Python 3.11+.
- **Naming:**
    - Files/Folders/Variables/Functions: `snake_case`.
    - Classes/Models: `PascalCase`.
- **Models:** Use **Pydantic v2** for all request and response schemas.
- **HTTP Client:** Use **httpx** (async) for all external API calls (Indian Kanoon, Gemini).
- **Service Layer:** Keep business logic in `services/`. Routers should handle request/response orchestration and dependency injection.
- **Environment:** Use `python-dotenv` for managing environment variables.
- **Rate Limiting:** Every endpoint must be rate-limited using `slowapi`.

---

## 🌐 Web Frontend Conventions (Next.js)

- **Framework:** Next.js 14 (App Router).
- **Language:** TypeScript.
- **Naming:**
    - Components: `PascalCase`.
    - Variables/Functions: `camelCase`.
    - Hooks: `useCamelCase`.
- **State Management:**
    - **Server State:** TanStack Query (v5).
    - **Client State:** Zustand (v4).
- **Data Fetching:**
    - All API calls must go through the centralized `apiClient` in `src/lib/api/client.ts`.
    - No `useEffect` for data fetching; use TanStack Query hooks in `src/features/`.
- **Components:**
    - Use Server Components by default.
    - Add `'use client'` only when interactivity or hooks are required.
    - Every page must have a `loading.tsx` and `error.tsx` sibling.
- **Styling:**
    - Tailwind CSS exclusively.
    - Dark mode by default.
    - Use `lucide-react` for icons.

---

## 📱 Flutter App Conventions (Planned)

- **State Management:** Riverpod 2.x exclusively. No `setState` for app-wide state.
- **Database:** Drift (SQLite) with type-safe DAOs.
- **Folder Structure:** Feature-first structure (e.g., `lib/features/search/`).
- **Models:** Use `freezed` for immutable data models and JSON serialization.
- **Navigation:** Use `go_router` for all navigation.
- **UI:** Use `const` constructors wherever possible. Break up widgets that exceed 150 lines.

---

## ❌ Forbidden Practices

1. **Hardcoding Secrets:** Never commit API keys or sensitive tokens.
2. **God Objects:** Avoid files or classes that handle too many responsibilities.
3. **Prop Drilling:** Avoid passing props more than 2 levels deep in React; use Zustand or Context.
4. **Blocking the UI:** Never perform heavy computations or I/O on the main thread.
5. **Ignoring Errors:** Never use empty `except:` or `catch` blocks.
