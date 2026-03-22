# Nyaya Testing Strategy

This document outlines the testing strategy, existing test suites, and how to verify the functional and performance aspects of the Nyaya ecosystem.

---

## 🧪 Testing Overview (Quality Focus)

Testing is foundational to the "Offline-First" and "Free-for-All" philosophy of Nyaya. Our goals are:
- **Functional Integrity:** Ensure legal data is fetched, cached, and displayed correctly.
- **AI Accuracy:** Verify that Gemini-generated summaries and analyses are structurally sound and relevant.
- **Performance:** Ensure that AI processing (summarization, search) and data retrieval (Indian Kanoon) are fast and efficient.

---

## 🐍 Backend Testing (Python)

Current testing for the backend is focused on functional validation of core services.

### Existing Tests
- **`test_bare_acts.py`:** 
    - **Scope:** Validates the scraper and service logic for Bare Acts.
    - **Actions:** Tests listing priority acts, fetching act details, retrieving specific sections, and searching related cases.
- **`test_performance.py`:**
    - **Scope:** Evaluates the response times for critical operations.
    - **Actions:** Measures search performance for landmark cases and summarization performance using Gemini 1.5 Flash.

### Running Tests
To run the existing backend tests, navigate to the project root and execute the scripts directly:
```bash
python test_bare_acts.py
python test_performance.py
```

### Future Strategy
- **Framework:** Moving towards `pytest` for structured unit and integration tests.
- **Mocking:** Implementing mocks for external dependencies (`Indian Kanoon API`, `Google Gemini API`) to ensure reliable, isolated testing.
- **Coverage:** Aiming for 80%+ coverage on all core services and routers.

---

## 🌐 Web Frontend Testing (Next.js)

The web dashboard uses modern tools to ensure a smooth, error-free experience.

### Strategy
- **Unit/Integration:** Testing of shared UI components and server/client state logic using `Vitest` and `React Testing Library`.
- **E2E:** End-to-end testing of critical user flows (Sign-in, Search, AI Summarization) using `Playwright`.
- **Validation:** Use of **Zod** to validate all API response shapes at runtime, preventing silent frontend crashes.

### How to Run (Planned)
```bash
cd frontend
npm test          # Runs unit tests
npm run test:e2e  # Runs Playwright E2E tests
```

---

## 📱 Flutter App Testing (Planned)

Flutter testing will focus on offline reliability.

### Strategy
- **Unit Tests:** For business logic in controllers and repositories.
- **Widget Tests:** For UI components and page layouts.
- **Integration Tests:** End-to-end testing on Android emulators/devices.
- **Database Testing:** Verification of Drift schema migrations and query accuracy.

### How to Run (Planned)
```bash
cd app
flutter test
```

---

## ✅ Quality Checkpoints

A feature is considered "tested" when:
1. It handles **offline/no-network** states gracefully.
2. It handles **empty results** from the API without crashing.
3. It validates **authentication/gated features** correctly.
4. AI responses are **JSON-safe** and correctly parsed by the frontend.
5. All tests pass with zero errors in the console/terminal.
