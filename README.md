<div align="center">

# 🏗️ RenovAlte — AI-Powered Renovation Planning Platform

**An intelligent end-to-end renovation management system for the German market, powered by Google Gemini, RAG pipelines, and vector search.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Django](https://img.shields.io/badge/Django-4.2-092E20?logo=django&logoColor=white)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-2.5-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 📋 Table of Contents

- [Project Mission](#-project-mission)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Core Modules](#-core-modules)
- [Tech Stack](#-tech-stack)
- [RAG Pipeline](#-rag-pipeline--knowledge-retrieval)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Author](#-author)

---

## 🎯 Project Mission

**RenovAlte** is an AI-driven renovation management platform designed to simplify the complex journey of home renovation in Germany. By combining **Generative AI** with localized technical knowledge, the platform transforms vague renovation ideas into **actionable, regulation-compliant plans**.

The system provides two primary entry points for project planning:
- A **Conversational Chatbot** for natural language interaction
- A **Structured Planning Wizard** for detail-oriented users

Both paths converge into a unified backend that leverages **Retrieval-Augmented Generation (RAG)** to ensure all suggestions align with German building standards such as **GEG** (Building Energy Act) and **KfW** financing requirements.

---

## ✨ Key Features

### 🤖 AI Chatbot Assistant
- Conversational renovation planning powered by **Google Gemini**
- Adaptive questioning — asks **context-aware follow-up questions** instead of rigid forms
- Persistent memory across sessions (user preferences, past conversations)
- **Image upload support** for property analysis by AI
- Automatic extraction of structured data from natural conversation (4–8 exchanges)

### 📊 Renovation Plan Generation
- AI-generated **multi-phase renovation roadmaps** with 6 phases:
  - Analysis & Planning → Detail Planning & Tendering → Permitting & Financing → Contractor Selection → Implementation → Acceptance & Handover
- Phase-by-phase **cost breakdowns** with German market pricing
- **Gantt chart timeline**, permit checklists, and stakeholder information
- RAG-enhanced accuracy using indexed German building regulation PDFs
- Dual input modes: **Manual 5-step form** or **AI Dynamic questioning**

### 💰 AI Financing Assistant
- Cost estimation with **regional German pricing data**
- KfW grant eligibility analysis
- Budget optimization suggestions
- Material cost comparisons across quality tiers (budget → premium)

### 🔧 Contractor Management
- AI-powered contractor search via **Google Places API**
- Automated **invitation email generation** with AI
- Offer extraction, analysis, and **side-by-side comparison**
- **Gmail OAuth 2.0 integration** for direct contractor communication
- AI conversation agent for facilitating user–contractor negotiations

### 🧠 AI Suggestions Engine
- Real-time contextual recommendations based on current user inputs
- Suggests relevant KfW grants, explore options, and scheduling tips
- Updates dynamically as the user fills in project details

### 📄 Document Intelligence (RAG)
- PDF knowledge base indexing with **semantic chunking**
- Vector similarity search using **Qdrant + Sentence-Transformers**
- Context-aware responses grounded in **GEG regulations, KfW guidelines, and permit requirements**
- Automatic re-indexing when documents are added, removed, or modified

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER (React 19)                   │
│  Planning.tsx · ProjectSetupWizard · RenovationPhases · TimelineGantt│
│  PermitChecklist · AISuggestions · ChatWindow · FinancingAssistant   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ REST API (fetch + CSRF)
┌──────────────────────────────▼──────────────────────────────────────┐
│                  APPLICATION LAYER (Django REST Framework)           │
│    /generate-plan/  ·  /generate-question/  ·  /suggestions/        │
│    /message/  ·  /sessions/  ·  /extract-and-generate/  ·  /memory/ │
│    /cost-estimate/  ·  /kfw-check/  ·  /invite/  ·  /offers/        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                           │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  Chatbot   │  │  Planning   │  │ Contracting  │  │ Financing │  │
│  │  Service   │  │  Service    │  │   Service    │  │  Service  │  │
│  └──────┬─────┘  └──────┬──────┘  └──────┬───────┘  └─────┬─────┘  │
│         └────────┬──────┴────────┬───────┘               │         │
│                  ▼               ▼                        ▼         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │            Google Gemini API (gemini-2.5-flash)               │   │
│  └──────────────────────┬───────────────────────────────────────┘   │
│                         │                                           │
│  ┌──────────────────────▼───────────────────────────────────────┐   │
│  │       RAG Pipeline (Qdrant + Sentence-Transformers)           │   │
│  │   PDFs → Chunk (1000/200) → Embed (384-dim) → Vector Search  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                       DATA ACCESS LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐     │
│  │  SQLite DB   │  │  Qdrant DB   │  │  Gmail API (OAuth 2.0) │     │
│  │  (Django ORM)│  │  (Vectors)   │  │  (Email Integration)   │     │
│  └──────────────┘  └──────────────┘  └────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Core Modules

### 1. Planning the Work Module
The central module responsible for **interactive renovation planning**. It dynamically asks context-aware questions, generates structured renovation plans, provides real-time AI suggestions, and ensures alignment with German regulations.

**User Flow:**
1. Select/create a project → Open Planning module
2. Choose input mode: **Manual form** (5-step wizard) or **AI Dynamic** (contextual questions)
3. System collects data → Calls Gemini with RAG context from German PDFs
4. View results: **Renovation phases, Gantt timeline, permit checklist, stakeholders**
5. Export as PDF or continue to Financing

### 2. Chatbot Module
A conversational alternative to manual forms. Users describe their project naturally, and the AI **extracts structured data** after 4–8 exchanges. Supports session history, image uploads for property analysis, and persistent user memory.

### 3. Financing Module
AI-powered cost estimation using German market data. Analyzes KfW grant eligibility, generates budget breakdowns by trade, and compares material costs across quality tiers.

### 4. Contracting Module  
Manages the full contractor lifecycle: AI-generated search queries, automated invitation emails, offer extraction from PDFs, AI-powered offer comparison, and direct Gmail communication.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, TypeScript, Tailwind CSS | Component-based UI with responsive design |
| **UI Components** | Radix UI, Framer Motion, Recharts | Accessible primitives, animations, data charts |
| **Backend** | Django 4.2, Django REST Framework | API server, authentication, ORM |
| **LLM** | Google Gemini 2.5 Flash | Text generation, plan creation, data extraction |
| **Vector Database** | Qdrant (local / cloud) | Semantic search over knowledge base |
| **Embeddings** | Sentence-Transformers (`all-MiniLM-L6-v2`) | 384-dimensional text embeddings |
| **PDF Processing** | PyPDF2 | Text extraction from regulation documents |
| **Email Integration** | Gmail API (OAuth 2.0) | Contractor communication |
| **Image Generation** | Vertex AI Imagen | AI-generated renovation visualizations |
| **Task Queue** | Django-Q2 | Background email polling |
| **Database** | SQLite (Django ORM) | Session, chat, plan, and user data persistence |

---

## 🧠 RAG Pipeline & Knowledge Retrieval

### How RAG Works in RenovAlte

```
┌─────────────────────────────────────────────────────────┐
│                   INDEXING PHASE (one-time)               │
│                                                           │
│  German PDFs (GEG, KfW, permits)                          │
│       ↓                                                   │
│  Text Extraction (PyPDF2)                                 │
│       ↓                                                   │
│  Semantic Chunking (1000 chars, 200 overlap)              │
│       ↓                                                   │
│  Embedding (all-MiniLM-L6-v2 → 384-dim vectors)          │
│       ↓                                                   │
│  Store in Qdrant (Cosine similarity index)                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   RETRIEVAL PHASE (per query)             │
│                                                           │
│  User Input (building type, location, budget, goals)      │
│       ↓                                                   │
│  Convert to query embedding (384-dim vector)              │
│       ↓                                                   │
│  Qdrant cosine similarity search → Top 6 chunks           │
│       ↓                                                   │
│  Inject retrieved context into Gemini prompt              │
│       ↓                                                   │
│  Generate RAG-enhanced renovation plan                    │
└─────────────────────────────────────────────────────────┘
```

### Configuration

| Parameter | Value |
|-----------|-------|
| Vector Database | Qdrant (local or cloud) |
| Embedding Model | `all-MiniLM-L6-v2` (384 dimensions) |
| Distance Metric | Cosine Similarity |
| Chunk Size | 1000 characters |
| Chunk Overlap | 200 characters |
| Top-K Results | 6 most relevant chunks |
| LLM Temperature | 0.3 (deterministic outputs) |
| Auto-Reindexing | Tracks PDF metadata, reindexes on changes |

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Google Gemini API Key** — [Get one here](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/Aniket04-cod/RenovAlte.git
cd RenovAlte
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env → add your GEMINI_API_KEY

# Run migrations
python manage.py migrate

# Start backend server
python manage.py runserver
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Quick Start (Windows)

```cmd
# From project root — starts both servers
run-dev.bat
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend App | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Admin Panel | http://localhost:8000/admin |

---

## 📁 Project Structure

```
RenovAlte/
├── backend/
│   ├── core/
│   │   ├── api/
│   │   │   ├── chatbot/            # AI chatbot service & views
│   │   │   ├── planning_work/      # Plan generation, RAG service, suggestions
│   │   │   ├── contracting/        # Contractor management & AI offers
│   │   │   ├── financing/          # Cost estimation & KfW analysis
│   │   │   ├── contractors/        # Contractor CRUD + Google Places
│   │   │   ├── gmail/              # Gmail OAuth 2.0 integration
│   │   │   ├── auth/               # User authentication
│   │   │   └── projects/           # Project management
│   │   ├── models/
│   │   │   ├── chat_session.py     # Conversation session storage
│   │   │   ├── chat_message.py     # Message history persistence
│   │   │   ├── user_memory.py      # Cross-session user preferences
│   │   │   ├── renovation_plan.py  # Generated plan storage
│   │   │   ├── contractor.py       # Contractor data model
│   │   │   └── offer.py            # Contractor offer model
│   │   ├── services/
│   │   │   ├── gemini_service/     # Gemini AI client (singleton)
│   │   │   ├── contracting_service/# AI contractor communication agent
│   │   │   ├── gmail_service.py    # Gmail API wrapper
│   │   │   └── prompt_builder.py   # German market cost prompts
│   │   └── tasks/                  # Background jobs (email polling)
│   ├── knowledge_base/
│   │   └── pdfs/                   # German regulation PDFs (GEG, KfW)
│   └── server/
│       └── settings.py             # Django configuration
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── AIAssistant/        # Chatbot interface
│       │   ├── CostCalculator/     # Financing calculator
│       │   ├── OfferComparison/    # Contractor offer comparison
│       │   ├── FinancingAssistant/ # Budget recommendations
│       │   └── Sidebar/            # Navigation
│       ├── pages/
│       │   ├── Home/               # Dashboard
│       │   ├── Planning/           # AI renovation planning
│       │   ├── Contracting/        # Contractor management
│       │   ├── Financing/          # Budget & grants
│       │   └── Landing/            # Public landing page
│       ├── services/               # API client layer
│       ├── contexts/               # React Context (Auth, Project)
│       └── types/                  # TypeScript definitions
│
└── run-dev.bat                     # One-click dev startup (Windows)
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | User registration |
| POST | `/api/auth/login/` | User login |
| POST | `/api/auth/logout/` | User logout |

### Renovation Planning
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/renovation/generate-plan/` | Generate AI renovation plan |
| POST | `/api/renovation/generate-question/` | Get next dynamic AI question |
| POST | `/api/renovation/suggestions/` | Get contextual AI suggestions |

### Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/message/` | Send message to AI assistant |
| GET | `/api/chatbot/sessions/` | Manage chat sessions |
| POST | `/api/chatbot/extract-and-generate/` | Extract data & generate plan |
| GET/POST | `/api/chatbot/memory/` | User preference memory |

### Financing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/financing/cost-estimate/` | AI cost estimation |
| POST | `/api/financing/kfw-check/` | KfW grant eligibility check |

### Contracting
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contracting/planning/` | Get contracting plans |
| POST | `/api/contracting/invite/` | AI-generated contractor invitations |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/projects/` | List / create projects |

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

```env
# Required — Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Optional — Qdrant Vector DB (leave empty for local storage)
QDRANT_URL=
QDRANT_API_KEY=

# Optional — Vertex AI Image Generation
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
VERTEX_AI_IMAGEN_MODEL=imagen-3.0-generate-001
```

### Frontend (`frontend/.env`)

```env
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
REACT_APP_GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

---

## 📸 Screenshots

> *Screenshots coming soon — chatbot, renovation plan phases, Gantt timeline, financing dashboard, contractor management.*

---

## 👤 Author

**Aniket** — [@Aniket04-cod](https://github.com/Aniket04-cod)

---

## 📄 License

This project is for educational and portfolio purposes.
