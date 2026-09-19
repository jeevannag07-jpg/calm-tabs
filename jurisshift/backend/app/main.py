import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db, get_all_complaints, set_active_version
from app.api.complaints import router as complaints_router, seed_demo_complaints
from app.api.jurisdictions import router as jurisdictions_router

app = FastAPI(
    title="JurisShift - Municipal Grievance Spatial & Gazette Migration Engine",
    description="Automated Point-in-Polygon complaint routing and dynamic Gazette notification re-balancing for Urban Local Bodies (ULBs).",
    version="1.0.0"
)

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints_router)
app.include_router(jurisdictions_router)

@app.on_event("startup")
async def startup_event():
    init_db()
    # If no complaints exist, seed default demo complaints
    existing = get_all_complaints()
    if not existing:
        print("[JurisShift] No existing complaints found. Seeding initial demo tickets...")
        await seed_demo_complaints()
    print("[JurisShift] Backend Engine operational.")

@app.get("/")
async def root():
    return {
        "system": "JurisShift Engine API",
        "status": "ONLINE",
        "docs": "/docs",
        "endpoints": [
            "/api/complaints",
            "/api/jurisdictions/boundaries",
            "/api/jurisdictions/gazette-push"
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
