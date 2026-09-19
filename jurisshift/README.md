# ⚡ JurisShift: Dynamic Municipal Grievance Routing & Gazette Shift Engine

> **The Intelligent Geospatial Engine that Automatically Re-routes Municipal Tickets When City Boundaries Change.**

---

## 💡 What is JurisShift? (The Plain English Story)

Imagine a citizen reports a dangerous pothole in their neighborhood. At the time of reporting, their area falls under **Bogadi Town Panchayat**.

Two days later, the state government publishes an official **Gazette Notification** expanding **Mysore City Corporation (MCC)** to absorb their neighborhood. 

### ❌ The Old Problem:
Under traditional government systems:
- The ticket remains stuck at the old Town Panchayat office.
- Officers ignore it because they no longer have jurisdiction or funds for that road.
- The citizen waits endlessly, receiving no updates as service deadlines (SLAs) expire.

### ✅ The JurisShift Solution:
**JurisShift** acts as an **Automated GPS Traffic Controller for Municipal Governance**:
1. When a citizen files a complaint by dropping a pin on **Google Maps**, JurisShift immediately identifies the exact municipal authority responsible for that location.
2. When the government issues a **Gazette Boundary Update**, JurisShift automatically scans all pending complaints, recalculates their GPS locations against the new boundary lines, and **instantly transfers the ticket to the new City Corporation**—updating department contacts and service deadlines in seconds!

---

## 🌟 Key Features at a Glance

| Feature | What it Does | Why it Matters |
| :--- | :--- | :--- |
| 📍 **Point-in-Polygon (PIP) GPS Routing** | Pinpoints exact latitude & longitude coordinates inside municipal boundaries. | Eliminates manual dispatch errors and wrong department assignments. |
| 🤖 **AI Complaint Classifier** | Reads complaint text (e.g. *"Water pipe burst near school"*) to extract category & urgency. | Automatically assigns correct department (Water Board) & SLA hours. |
| ⚡ **Live Gazette Shift Simulator** | Simulates official government boundary expansion notifications (v1 ➔ v2). | Automatically rebalances pending tickets across city councils in real time. |
| 📜 **Audit Trail & History** | Tracks every single ticket movement with exact timestamps and legal references. | Complete transparency for citizens and municipal auditors. |
| 🗺️ **Google Maps Dashboard** | Interactive map view with Google Roadmap, Satellite, and Dark Mode themes. | User-friendly visual interface for both citizens and city administrators. |

---

## 🏗️ How it Works (Under the Hood for Techies)

```
                            ┌───────────────────────────────┐
                            │   Citizen GPS Intake (Form)   │
                            └───────────────┬───────────────┘
                                            │ (Lat/Lng + Text)
                                            ▼
                            ┌───────────────────────────────┐
                            │      FastAPI Backend API      │
                            └───────────────┬───────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
       ┌───────────────────────────┐                 ┌───────────────────────────┐
       │   Shapely PIP Engine      │                 │  LLM / Heuristic Classifier│
       │ (GeoJSON Polygon Matching)│                 │   (Category & Urgency)    │
       └─────────────┬─────────────┘                 └─────────────┬─────────────┘
                     │                                             │
                     └──────────────────────┬──────────────────────┘
                                            │
                                            ▼
                            ┌───────────────────────────────┐
                            │   Department SLA Assignment   │
                            └───────────────┬───────────────┘
                                            │
                                            ▼
                            ┌───────────────────────────────┐
                            │  SQLite Database & Timeline   │
                            └───────────────┬───────────────┘
                                            │
                  ┌─────────────────────────┴─────────────────────────┐
                  │      GAZETTE NOTIFICATION TRIGGER (v1 ➔ v2)       │
                  └─────────────────────────┬─────────────────────────┘
                                            │
                                            ▼
                            ┌───────────────────────────────┐
                            │    Auto-Migration Engine      │
                            │  (Recalculates PIP & Resets   │
                            │   SLA for Annexed Tickets)    │
                            └───────────────────────────────┘
```

### 🛠️ Tech Stack & Architecture

- **Backend Framework**: Python **FastAPI** (Async REST API with interactive Swagger docs at `/docs`)
- **Geospatial Engine**: **Shapely** (`shapely.geometry.Point` & `Polygon` spatial containment algorithms)
- **Database**: **SQLite** (Zero-configuration persistent SQL storage with JSON timeline logs)
- **AI Classification**: Dual-engine (**Groq / Gemini LLM** integration + smart keyword fallback classifier)
- **Frontend App**: **React 18** + **TypeScript** + **Vite** (Lightning-fast client rendering)
- **Mapping Engine**: **Leaflet** + **React-Leaflet** with **Google Maps Vector & Dark Tile Layers**
- **UI Components & Icons**: Modern glassmorphism CSS, **Lucide-React** icon suite

---

## 📁 Directory Structure Overview

```
jurisshift/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point & API routes
│   │   ├── config.py                # Database paths & environment settings
│   │   ├── database.py              # SQLite connection & CRUD operations
│   │   ├── api/
│   │   │   ├── complaints.py        # /api/complaints endpoints (Create, List, Seed)
│   │   │   └── jurisdictions.py     # /api/jurisdictions endpoints (Gazette Shift, Boundaries)
│   │   ├── services/
│   │   │   ├── spatial_engine.py    # Shapely Point-in-Polygon containment matching
│   │   │   ├── classifier.py        # AI text category & urgency classification
│   │   │   └── migrator.py          # Auto-rebalance migration engine on boundary update
│   │   ├── data/
│   │   │   ├── boundaries_v1.geojson # Base map (MCC + Hootagalli CMC + Bogadi TP)
│   │   │   ├── boundaries_v2.geojson # Post-Gazette expansion map (MCC expansion)
│   │   │   └── department_slas.json  # Department SLA mapping matrix
│   │   └── models/
│   │       ├── complaint.py         # Pydantic data validation schemas
│   │       └── jurisdiction.py      # Gazette request/response schemas
│   ├── requirements.txt             # Python dependencies (fastapi, shapely, uvicorn)
│   └── test_spatial.py              # Geospatial verification test script
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapViewer.tsx        # Leaflet + Google Maps viewer component
│   │   │   ├── CitizenForm.tsx      # Citizen grievance submission form with location picker
│   │   │   ├── AdminPanel.tsx       # Gazette Shift simulator control panel
│   │   │   └── TicketTimeline.tsx   # Legal audit history modal drawer
│   │   ├── hooks/
│   │   │   └── useGrievances.ts     # Custom React hook for API data & polling
│   │   ├── services/
│   │   │   └── api.ts               # Axios API client
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces & types
│   │   ├── pages/
│   │   │   └── index.tsx            # Split-screen main dashboard page
│   │   └── styles/
│   │       └── globals.css          # Glassmorphic dark theme CSS styling
│   ├── package.json                 # Frontend dependencies (leaflet, react, lucide-react)
│   └── vite.config.ts               # Vite build configuration
│
└── README.md                        # Project documentation (You are here!)
```

---

## 🚀 Easy 2-Step Setup Guide

### 1️⃣ Start the Backend Server (Python FastAPI)
Open your terminal and run:
```bash
cd jurisshift/backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```
> 💡 *The backend API will run live at `http://127.0.0.1:8000`. You can inspect interactive API docs at `http://127.0.0.1:8000/docs`.*

### 2️⃣ Start the Frontend Web App (React + Vite)
Open a second terminal window and run:
```bash
cd jurisshift/frontend
npm install
npm run dev
```
> 🌐 *Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)** to launch JurisShift!*
