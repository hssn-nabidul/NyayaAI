# High-Level Architecture - NyayaAI

NyayaAI is an AI-powered legal platform designed to democratise access to Indian law. This document details the high-level system architecture, data flow, and key components.

## 1. System Overview

The system is composed of three primary layers:
-   **Client Layer**: Web (Next.js) and Mobile (Flutter) applications.
-   **API Gateway/Backend Layer**: A central FastAPI server handling business logic, authentication, and orchestration.
-   **Data & AI Layer**: External legal data (Indian Kanoon), AI processing (Google Gemini), and authentication (Firebase).

## 2. Key Components

### A. Frontend (Client)
-   **Web (Next.js)**: A responsive, modern interface built with React. It uses Zustand for state management and interacts with the FastAPI backend over REST.
-   **Mobile (Flutter)**: A cross-platform app designed for on-the-go legal research, providing offline-first capabilities where possible.

### B. Backend (FastAPI)
-   **FastAPI Framework**: Chosen for its high performance, asynchronous support, and automatic API documentation (Swagger/Redoc).
-   **Service-Oriented Logic**: Each feature (search, summarization, analysis) is encapsulated in dedicated services within the `backend/services/` directory.
-   **External Integration Services**:
    -   `KanoonService`: Fetches judgments and metadata from the Indian Kanoon API.
    -   `GeminiService`: Uses the Google Generative AI (1.5 Flash) model to perform complex tasks like summarization, NLP-based search extraction, and document analysis.
    -   `FirebaseAuthService`: Validates user tokens and handles secure access to protected resources.

### C. Data & AI Providers
-   **Indian Kanoon API**: The primary source for Indian court judgments and legislative text.
-   **Google Gemini (1.5 Flash)**: The LLM powering AI features, including legal dictionary explanations, case summaries, and moot court preparation.

---

## 3. Data Flow

### A. Typical Request Lifecycle
1.  **Request Initiation**: The user performs a search (e.g., "right to privacy") on the Next.js or Flutter app.
2.  **API Request**: The client sends an asynchronous REST request to the FastAPI backend.
3.  **NLP Extraction (Optional)**: If the search is natural language, the `search.py` router calls `gemini.py` to extract structured parameters (keywords, court names, years).
4.  **Data Retrieval**: The backend calls the Indian Kanoon API to fetch relevant results.
5.  **AI Enhancement**: For specific requests (like "Summarize this case"), the backend fetches the full text from Kanoon and sends it to Gemini for processing.
6.  **Response Delivery**: The structured JSON response is returned to the client, which updates the UI.

### B. Flutter to FastAPI Communication
-   Flutter communicates with FastAPI through the standard HTTP package.
-   Endpoints are designed to be mobile-friendly, returning concise JSON.
-   Authentication tokens from Firebase are included in the `Authorization` header.

### C. Backend to External Services
-   **Kanoon**: Communicates via HTTP POST requests with a token-based authentication system.
-   **Gemini**: Uses the official `google-generativeai` Python SDK for model interaction.
-   **Caching**: The backend implements local file-based caching (in `/backend/cache`) for frequent requests like Bare Act sections to minimize external latency.

---

## 4. Security & Authentication
-   **Firebase Auth**: All user authentication is handled via Firebase, ensuring secure sign-ins and identity management.
-   **JWT Validation**: The FastAPI backend verifies the Firebase ID tokens for all protected routes using the `firebase-admin` SDK.
-   **CORS**: Middleware is configured to allow requests only from authorized frontend origins.
