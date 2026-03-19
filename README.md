# NyayaAI: AI-Powered Indian Legal Research

Nyaya is a comprehensive legal research platform designed for Indian law students and professionals. It leverages **Google Gemini 1.5 Flash** and the **Indian Kanoon API** to provide intelligent search, summarization, and analysis of Indian case law and Bare Acts.

## 🚀 Key Features
- **Intelligent Search**: NLP-powered extraction of legal principles from natural language queries.
- **AI Case Summarization**: Summarize long judgments into plain English, highlighting key issues and holdings.
- **Bare Acts Explorer**: Access BNS, BNSS, BSA, and other major Indian acts with AI-powered section explanations.
- **Citation Universe**: Visual and textual maps of how cases cite each other.
- **Legal Tools**: Moot Court preparation, AI Drafting Assistant, and Document Analyser.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, TypeScript, React Query, Zustand.
- **Backend**: FastAPI (Python 3.11), Gemini AI (Google Generative AI SDK), Indian Kanoon Academic API.
- **Auth**: Firebase Authentication (Google Sign-In).

## 📦 Project Structure
- `/frontend`: Next.js web application.
- `/backend`: FastAPI Python server.
- `/docs`: Detailed product, architecture, and API documentation.
- `/app`: (WIP) Flutter mobile application.

## ⚙️ Setup Instructions

### Backend Setup
1. `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `source venv/bin/activate` (Linux/Mac) or `.\venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and add your API keys.
6. Run the server: `uvicorn main:app --reload`

### Frontend Setup
1. `cd frontend`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and add your Firebase config.
4. Run the app: `npm run dev`

## ⚖️ License
This project is for educational and research purposes. All legal data is sourced from Indian Kanoon.
