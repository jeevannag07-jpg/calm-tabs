# JurisShift Backend

FastAPI spatial Point-in-Polygon (PIP) grievance routing and Gazette notification migration engine.

## Run Backend
```bash
pip install -r requirements.txt
python test_spatial.py
python -m uvicorn app.main:app --reload --port 8000
```
Docs available at `http://127.0.0.1:8000/docs`.
