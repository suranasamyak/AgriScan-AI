# AgroScan AI 🌾
> *"Detect Early. Track Smart. Protect Every Crop."*

An AI-powered agricultural web application designed for Indian farmers. AgroScan AI enables early crop disease identification, disease progress tracking over time, epidemiological microclimate risk forecasting, Integrated Pest Management (IPM) decision support, and conversational AI guidance.

---

## 🌟 Key Features

1. **Dashboard:** Consolidated KPIs of monitored plots, total scans, urgent inspection warnings, and Open-Meteo microclimate summary.
2. **AI Crop Scanner:** Multi-crop vision diagnosis with **AI Confidence Guard** (< 70% confidence threshold prompts confirmation before spraying).
3. **Temporal Disease Progress Tracker:** Side-by-side comparative inspection across growth cycles to monitor treatment response.
4. **Live Field Tracking:** Interactive Leaflet map with OpenStreetMap, polygonal field boundaries, and GPS scout location tracking.
5. **Disease Risk Forecast:** Rule-based epidemiological model powered by live Open-Meteo temperature, humidity, and rainfall data.
6. **Treatment Decision Support:** Multi-tier IPM strategy (Cultural, Biological, Chemical) with local market price cost estimation.
7. **AI Farmer Assistant (Kisan Mitra):** Powered by Google Gemini (`gemini-3.8-flash`) supporting English, Hindi (हिन्दी), and Marathi (मराठी).
8. **Community Alerts:** Crowdsourced, privacy-protected disease sighting bulletin to detect local clusters without exposing farm coordinates.
9. **Offline PWA Support:** Service worker shell caching with IndexedDB offline queue and sync when network reconnects.
10. **Reports & Analytics:** Filterable scans archive, printable diagnostic dossiers, and CSV data export.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Leaflet, IndexedDB.
- **Backend (Python):** FastAPI, Uvicorn, SQLAlchemy, Pydantic, Passlib (Bcrypt), Python-JOSE.
- **Backend (Fullstack Dev Server):** Node.js, Express, tsx, Google GenAI SDK (`@google/genai`).
- **Database:** SQLite (local zero-configuration ACID persistence, PostgreSQL compatible).
- **APIs:** Open-Meteo (Live Microclimate Weather), Google Gemini 3.8 Flash.

---

## 💻 Local Setup Guide (Windows 11)

### Prerequisites

1. **Node.js (v18 or v20 LTS):** Download and install from [nodejs.org](https://nodejs.org/).
2. **Python (3.10+):** Download from [python.org](https://www.python.org/downloads/windows/). During installation, **check the box "Add python.exe to PATH"**.
3. **Git:** Download and install from [git-scm.com](https://git-scm.com/).

---

### Step 1: Clone or Open the Repository

Open Windows Terminal or PowerShell:
```powershell
git clone https://github.com/your-username/agroscan-ai.git
cd agroscan-ai
```

---

### Step 2: Running the Full-Stack Dev Server (Default AI Studio Mode)

The root workspace includes an integrated full-stack server running Vite + Express with built-in database persistence, Gemini AI integration, and Open-Meteo weather proxies.

```powershell
# Install Node dependencies
npm install

# Start the full-stack server
npm run dev
```

The application is now live at:
- **Web Application:** `http://localhost:3000`

---

### Step 3: Running the Python FastAPI Backend (Standalone Mode)

If you prefer to run the standalone Python FastAPI backend:

1. Open PowerShell and navigate to the backend folder:
   ```powershell
   cd backend
   ```

2. Create a virtual environment:
   ```powershell
   python -m venv .venv
   ```

3. Activate the virtual environment:
   ```powershell
   # Windows PowerShell
   .\.venv\Scripts\Activate.ps1
   
   # If you receive an Execution Policy error in PowerShell, run:
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
   .\.venv\Scripts\Activate.ps1
   ```

4. Install Python dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

5. Configure environment variables:
   ```powershell
   copy .env.example .env
   ```
   Edit `.env` to optionally insert your `GEMINI_API_KEY`.

6. Launch the FastAPI server:
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```

- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`
- **Health Check Endpoint:** `http://localhost:8000/api/health`

---

### Step 4: Running Automated Tests

Run backend verification tests using `pytest`:

```powershell
cd backend
pytest tests/test_api.py -v
```

---

## 🔑 Environment Variables Configuration

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for Kisan Mitra assistant & vision | Injected by AI Studio |
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./agroscan.db` |
| `APP_ENV` | Application environment (`development` / `production`) | `development` |
| `PORT` | Web server listening port | `3000` |

---

## 🚜 Demonstration Mode for Judges

AgroScan AI includes a pre-calibrated Hackathon Demonstration Dataset for Ramesh Patil, a progressive farmer in Nashik, Maharashtra:
- **Tomato Block A:** Monitored Early Blight progression with baseline vs Day 7 copper response.
- **Riverbank Cotton:** Bacterial Blight alert triggering epidemiological risk warnings.
- **South Slope Soybean:** Healthy pod development scouting logs.
- One-click reload or clear demo data via **Settings > Hackathon Demonstration Dataset**.

---

## 🛡️ License & Ethical Agronomy Statement

AgroScan AI is designed to empower smallholder farmers. All diagnostic insights follow the Integrated Pest Management (IPM) guidelines published by the Indian Council of Agricultural Research (ICAR). Treatment prescriptions encourage cultural sanitization and bio-control before chemical intervention.
