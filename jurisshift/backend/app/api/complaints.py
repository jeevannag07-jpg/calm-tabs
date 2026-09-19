import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.complaint import ComplaintCreate, ComplaintResponse, ComplaintStatus, ComplaintStatusUpdate
from app.database import get_active_version, save_complaint, get_complaint_by_id, get_all_complaints, clear_all_complaints
from app.services.spatial_engine import find_jurisdiction
from app.services.classifier import classify_complaint
from app.services.migrator import get_department_info

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

@router.post("", response_model=ComplaintResponse, status_code=210)
@router.post("/", response_model=ComplaintResponse, status_code=201)
async def create_complaint(payload: ComplaintCreate):
    # 1. Active boundary version
    active_ver = get_active_version()

    # 2. Point-in-polygon spatial routing
    jurisdiction = find_jurisdiction(payload.latitude, payload.longitude, version=active_ver)
    ulb_code = jurisdiction["ulb_code"]
    ulb_name = jurisdiction["ulb_name"]
    ulb_type = jurisdiction["ulb_type"]

    # 3. AI classification of grievance text
    category, urgency = await classify_complaint(
        payload.title,
        payload.description,
        payload.category_override
    )

    # 4. Lookup SLA & Department mapping
    dept_info = get_department_info(ulb_code, category)
    department = dept_info["department"]
    sla_hours = dept_info["sla_hours"]

    # 5. Build record & timeline
    now_dt = datetime.now(timezone.utc)
    now_iso = now_dt.isoformat()
    due_by_iso = (now_dt + timedelta(hours=sla_hours)).isoformat()
    complaint_id = f"TICK-{uuid.uuid4().hex[:8].upper()}"

    initial_audit_log = [
        {
            "timestamp": now_iso,
            "event": "COMPLAINT_FILED",
            "from_ulb": None,
            "to_ulb": f"{ulb_name} ({ulb_code})",
            "reason": "Citizen Intake via GPS Location Picker",
            "details": f"Spatial routing placed coordinates ({payload.latitude}, {payload.longitude}) inside {ulb_name}. Classified as '{category}' with {urgency} urgency."
        }
    ]

    record = {
        "id": complaint_id,
        "title": payload.title,
        "description": payload.description,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "category": category,
        "urgency": urgency,
        "ulb_code": ulb_code,
        "ulb_name": ulb_name,
        "ulb_type": ulb_type,
        "department": department,
        "sla_hours": sla_hours,
        "due_by": due_by_iso,
        "status": ComplaintStatus.PENDING,
        "citizen_name": payload.citizen_name or "Anonymous Citizen",
        "citizen_phone": payload.citizen_phone or "+91-9876543210",
        "image_url": payload.image_url,
        "boundary_version_at_creation": active_ver,
        "current_boundary_version": active_ver,
        "timeline": initial_audit_log,
        "created_at": now_iso,
        "updated_at": now_iso
    }

    save_complaint(record)
    return record

@router.get("", response_model=List[ComplaintResponse])
@router.get("/", response_model=List[ComplaintResponse])
async def list_complaints(
    ulb_code: Optional[str] = Query(None, description="Filter by ULB code"),
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category")
):
    all_records = get_all_complaints()
    filtered = all_records

    if ulb_code:
        filtered = [c for c in filtered if c["ulb_code"] == ulb_code]
    if status:
        filtered = [c for c in filtered if c["status"] == status]
    if category:
        filtered = [c for c in filtered if c["category"] == category]

    return filtered

@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(complaint_id: str):
    complaint = get_complaint_by_id(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail=f"Complaint ID {complaint_id} not found")
    return complaint

@router.patch("/{complaint_id}/status", response_model=ComplaintResponse)
async def update_complaint_status(complaint_id: str, payload: ComplaintStatusUpdate):
    complaint = get_complaint_by_id(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail=f"Complaint ID {complaint_id} not found")

    now_iso = datetime.now(timezone.utc).isoformat()
    old_status = complaint["status"]
    complaint["status"] = payload.status
    complaint["updated_at"] = now_iso

    audit_entry = {
        "timestamp": now_iso,
        "event": "STATUS_UPDATE",
        "from_ulb": complaint["ulb_name"],
        "to_ulb": complaint["ulb_name"],
        "reason": f"Status updated from {old_status} to {payload.status}",
        "details": payload.note or "Manual officer update"
    }
    complaint["timeline"].append(audit_entry)
    save_complaint(complaint)

    return complaint

@router.post("/reset-demo/seed")
async def seed_demo_complaints():
    clear_all_complaints()
    active_ver = get_active_version()

    seed_items = [
        {
            "title": "Severe Deep Pothole on Bogadi Main Road",
            "description": "Hazardous 3-foot wide pothole near Maruti Temple on Bogadi Ring Road Junction, causing traffic slowdowns and bike slips.",
            "latitude": 12.3105,
            "longitude": 76.6012, # In Bogadi TP under v1, shifted to MCC under v2!
            "category_override": "Roads & Infrastructure",
            "citizen_name": "Ramesh Kumar",
            "citizen_phone": "+91-9980123456"
        },
        {
            "title": "Uncollected Solid Waste Dump near Hootagalli Industrial Suburb",
            "description": "Garbage piles lying uncollected for 4 days near Hootagalli Signal, causing foul odor and stray dog nuisance.",
            "latitude": 12.3550,
            "longitude": 76.5750, # In Hootagalli CMC
            "category_override": "Sanitation & Waste Management",
            "citizen_name": "Sunita Patil",
            "citizen_phone": "+91-9845011223"
        },
        {
            "title": "Flickering Streetlights & Broken Electric Pole",
            "description": "Streetlight pole hanging dangerously on Devaraj Urs Road, Mysore city center.",
            "latitude": 12.3080,
            "longitude": 76.6500, # In MCC core city
            "category_override": "Electrical & Streetlighting",
            "citizen_name": "Anil Rao",
            "citizen_phone": "+91-9740055667"
        },
        {
            "title": "Major Drinking Water Pipeline Leakage",
            "description": "Clean drinking water leaking continuously onto the road near Bogadi-Hootagalli buffer border.",
            "latitude": 12.3250,
            "longitude": 76.5980, # Border area! Shifts from Bogadi to MCC in v2
            "category_override": "Water Supply & Drainage",
            "citizen_name": "Priya Sharma",
            "citizen_phone": "+91-9611223344"
        }
    ]

    created = []
    for item in seed_items:
        jurisdiction = find_jurisdiction(item["latitude"], item["longitude"], version=active_ver)
        ulb_code = jurisdiction["ulb_code"]
        ulb_name = jurisdiction["ulb_name"]
        ulb_type = jurisdiction["ulb_type"]

        category, urgency = await classify_complaint(
            item["title"],
            item["description"],
            item.get("category_override")
        )

        dept_info = get_department_info(ulb_code, category)
        department = dept_info["department"]
        sla_hours = dept_info["sla_hours"]

        now_dt = datetime.now(timezone.utc)
        now_iso = now_dt.isoformat()
        due_by_iso = (now_dt + timedelta(hours=sla_hours)).isoformat()
        cid = f"TICK-{uuid.uuid4().hex[:8].upper()}"

        record = {
            "id": cid,
            "title": item["title"],
            "description": item["description"],
            "latitude": item["latitude"],
            "longitude": item["longitude"],
            "category": category,
            "urgency": urgency,
            "ulb_code": ulb_code,
            "ulb_name": ulb_name,
            "ulb_type": ulb_type,
            "department": department,
            "sla_hours": sla_hours,
            "due_by": due_by_iso,
            "status": ComplaintStatus.PENDING,
            "citizen_name": item["citizen_name"],
            "citizen_phone": item["citizen_phone"],
            "image_url": None,
            "boundary_version_at_creation": active_ver,
            "current_boundary_version": active_ver,
            "timeline": [
                {
                    "timestamp": now_iso,
                    "event": "COMPLAINT_FILED",
                    "from_ulb": None,
                    "to_ulb": f"{ulb_name} ({ulb_code})",
                    "reason": "Demo Seed Complaint Intake",
                    "details": f"Placed at coordinates ({item['latitude']}, {item['longitude']}) inside {ulb_name}."
                }
            ],
            "created_at": now_iso,
            "updated_at": now_iso
        }
        save_complaint(record)
        created.append(record)

    return {"status": "SUCCESS", "seeded_count": len(created), "items": created}
