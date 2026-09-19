import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Database configuration
DB_PATH = os.getenv("DB_PATH", str(BASE_DIR / "jurisshift.db"))

# LLM API Keys (Groq / Gemini)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# GeoJSON paths
BOUNDARIES_V1_PATH = BASE_DIR / "data" / "boundaries_v1.geojson"
BOUNDARIES_V2_PATH = BASE_DIR / "data" / "boundaries_v2.geojson"
DEPARTMENT_SLAS_PATH = BASE_DIR / "data" / "department_slas.json"

# Active boundary version in state ("v1" or "v2")
CURRENT_BOUNDARY_VERSION = "v1"
