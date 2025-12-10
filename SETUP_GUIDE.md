# RenovAlte Setup Guide

Quick start guide for running the RenovAlte project with RAG (Retrieval-Augmented Generation) and Qdrant vector database.

---

## Prerequisites

- **Docker Desktop** installed and running
- **Python 3.12+** installed
- **Node.js 16+** and npm installed
- **Git** (to clone the repository)


## Step 2: Start Qdrant Vector Database

Run Qdrant in a Docker container:

```bash
docker run -d --name qdrant -p 6333:6333 qdrant/qdrant
```

**Verify it's running:**
- Open http://localhost:6333 in your browser
- You should see JSON with version info

**To check container status:**
```bash
docker ps | findstr qdrant     # Windows
docker ps | grep qdrant        # Mac/Linux
```

**To restart if stopped:**
```bash
docker start qdrant
```

---

## Step 3: Backend Setup

### 3.1 Create Python Virtual Environment

```bash
cd backend
python -m venv .venv
```

### 3.2 Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\.venv\Scripts\activate
```

**Mac/Linux:**
```bash
source .venv/bin/activate
```

### 3.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 3.4 Set Environment Variables (Optional)

**Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="your_gemini_api_key_here"
```

**Mac/Linux:**
```bash
export GEMINI_API_KEY="your_gemini_api_key_here"
```

> **Note:** If you skip this step, the system will use a mock service (still functional for testing).

### 3.5 Index Documents into Qdrant

```bash
cd core/api/planning_work/rag
python index_documents.py
```

**Expected output:**
```
✓ Loaded 5 PDFs (39 chunks)
✓ Created collection 'renovation_docs'
✓ Indexed 39 documents
Collection: renovation_docs | Points: 39 | Status: green
```

### 3.6 Start Django Backend

```bash
cd ../../../..   # Back to backend root
python manage.py runserver 0.0.0.0:8000
```

Backend will be available at: **http://localhost:8000**

---

## Step 4: Frontend Setup

Open a **new terminal** (keep backend running):

### 4.1 Navigate to Frontend

```bash
cd frontend
```

### 4.2 Install Dependencies

```bash
npm install
```

### 4.3 Start Development Server

```bash
npm start
```

Frontend will open automatically at: **http://localhost:3000** (or 3001 if 3000 is taken)

---

## Step 5: Test the Application

1. Open **http://localhost:3000** in your browser
2. Fill out the renovation planning form
3. Submit to generate a plan
4. Backend will:
   - Retrieve context from Qdrant (RAG)
   - Generate plan using Gemini API (or mock)
   - Return structured JSON response

---

## Quick Restart Checklist

When restarting after a break:

1. **Start Qdrant:**
   ```bash
   docker start qdrant
   ```

2. **Backend (in terminal 1):**
   ```bash
   cd backend
   .\.venv\Scripts\activate              # Windows
   # source .venv/bin/activate           # Mac/Linux
   $env:GEMINI_API_KEY="your_key"       # Optional
   python manage.py runserver 0.0.0.0:8000
   ```

3. **Frontend (in terminal 2):**
   ```bash
   cd frontend
   npm start
   ```

---

## Troubleshooting

### Qdrant Connection Error (`[WinError 10061]`)
- **Cause:** Qdrant container not running
- **Fix:** `docker start qdrant`
- **Verify:** Open http://localhost:6333

### ModuleNotFoundError (e.g., `sentence_transformers`)
- **Cause:** Dependencies not installed
- **Fix:** 
  ```bash
  cd backend
  .\.venv\Scripts\activate
  pip install -r requirements.txt
  ```

### Port Already in Use
- **Frontend (3000):** Will auto-switch to 3001
- **Backend (8000):** Kill existing process or change port in `runserver` command

### Gemini API 404 Error
- **Cause:** API key tier doesn't support the model
- **Effect:** System falls back to mock service (still works)
- **Fix:** Upgrade API key or continue with mock

---

## Architecture Overview

```
Frontend (React)
    ↓
Django Backend (/api/renovation/generate-plan/)
    ↓
RAG Retrieval (Qdrant Vector DB)
    ↓
Gemini API (or Mock Fallback)
    ↓
JSON Response (Plan + Phases + Budget + KfW)
```

---

## Key Technologies

- **Backend:** Django 5.2.8 + Django REST Framework
- **Vector DB:** Qdrant (Docker container)
- **Embeddings:** sentence-transformers (all-MiniLM-L6-v2)
- **Document Processing:** LangChain + PyPDF
- **AI:** Google Gemini API (with mock fallback)
- **Frontend:** React + TypeScript

---

## Need Help?

- Check the main docs: `RAG_AND_VECTOR_DB_IMPLEMENTATION_DETAILED.md`
- Backend API docs: `backend/planning/README-planning-api.md`
- Docker logs: `docker logs qdrant`
- Backend logs: Check terminal running `runserver`

---

