# 🧘 Calm Tabs (TabZen AI) & JurisShift Workspace

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-v5.2.1-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](LICENSE)

A dual-purpose workspace featuring **Calm Tabs (TabZen AI)** — an AI-powered browser tab organizer designed to reduce digital clutter and boost focus — alongside **JurisShift**, an intelligent municipal grievance routing engine.

---

## 🚀 Projects Included

### 1. 🧘 Calm Tabs (TabZen AI)
An intuitive web application that analyzes open browser URLs, categorizes tabs (e.g., Development, Research, Learning), identifies low-value ("dead") tabs, and calculates a personalized **Focus Score** to restore browser calm.

* **Frontend**: Responsive, modern glassmorphism dark-mode UI built with vanilla HTML5, CSS3, and JavaScript ([`public/index.html`](file:///C:/Users/JEEVAN%20NAG%20N/.gemini/antigravity-ide/scratch/calm-tabs/public/index.html)).
* **Backend**: Lightweight Node.js & Express REST API ([`server.js`](file:///C:/Users/JEEVAN%20NAG%20N/.gemini/antigravity-ide/scratch/calm-tabs/server.js)).

### 2. ⚡ JurisShift (`/jurisshift`)
An advanced geospatial engine that automatically re-routes municipal tickets when city boundaries shift due to gazette updates.

* **Backend**: Python FastAPI with Shapely for spatial polygon matching.
* **Frontend**: React + Vite + Leaflet interactive mapping dashboard.

---

## 🌟 Key Features of Calm Tabs

* 📥 **Multi-URL Analyzer**: Paste dozens of open browser tabs at once.
* 🤖 **AI Productivity Status**: Automatically flags tabs as **Keep** (useful), **Save** (reference), or **Close** (dead/login pages).
* 📊 **Focus Analytics**: Real-time stats dashboard calculating:
  * **Total Tabs**
  * **Dead / Distraction Tabs**
  * **Focus Score Percentage**
  * **Learning / Research Tabs**
* 💎 **Glassmorphism UI**: Radial gradients, glowing cards, and micro-interactions.

---

## 🛠️ Tech Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Calm Tabs Backend** | Node.js, Express.js (`v5.2.1`), CORS |
| **Calm Tabs Frontend** | HTML5, CSS3 (Glassmorphism), JavaScript (Fetch API), Google Fonts (Inter) |
| **JurisShift Subproject** | Python 3.10, FastAPI, Shapely, React, Vite, Leaflet |
| **Process & Cloud Ops** | PM2 (`ecosystem.config.js`), Render (`render.yaml`) |

---

## 📁 Repository Structure

```text
calm-tabs/
├── public/
│   └── index.html          # Calm Tabs (TabZen AI) SPA
├── jurisshift/             # Municipal Grievance Routing Engine Subproject
│   ├── backend/            # FastAPI Python server
│   ├── frontend/           # React + Vite + Leaflet mapping UI
│   └── README.md           # JurisShift detailed documentation
├── server.js               # Node.js Express server for Calm Tabs (/api/analyze-tabs)
├── package.json            # Node.js project configuration & dependencies
├── ecosystem.config.js     # PM2 multi-process configuration
├── render.yaml             # Render infrastructure-as-code deployment config
└── README.md               # Repository documentation
