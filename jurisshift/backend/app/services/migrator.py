import json
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List
from app.config import DEPARTMENT_SLAS_PATH
from app.database import get_all_complaints, save_complaint, set_active_version
from app.services.spatial_engine import find_jurisdiction

def load_department_slas() -> Dict[str, Any]:
    if DEPARTMENT_SLAS_PATH.exists():
        with open(DEPARTMENT_SLAS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def get_department_info(ulb_code: str, category: str) -> Dict[str, Any]:
    slas = load_department_slas()
    ulb_info = slas.get(ulb_code, {})
    cat_info = ulb_info.get(category, {})
    
    dept = cat_info.get("department", f"{ulb_code} General Works")
    hours = cat_info.get("sla_hours", 48)
    return {"department": dept, "sla_hours": hours}

def execute_gazette_migration(target_version: str = "v2", gazette_id: str = "GAZETTE/KAR/2026/MYS-087", notification_title: str = "MCC Expansion Gazette Shift") -> Dict[str, Any]:
    complaints = get_all_complaints()
    rebalanced_ids = []
    
    now_iso = datetime.now(timezone.utc).isoformat()

    for c in complaints:
        # Check spatial PIP against target boundary version
        new_jurisdiction = find_jurisdiction(c["latitude"], c["longitude"], version=target_version)
        new_ulb_code = new_jurisdiction["ulb_code"]
        old_ulb_code = c["ulb_code"]

        if new_ulb_code != old_ulb_code:
            old_ulb_name = c["ulb_name"]
            new_ulb_name = new_jurisdiction["ulb_name"]

            # Lookup new SLA & Department
            dept_info = get_department_info(new_ulb_code, c["category"])
            new_dept = dept_info["department"]
            new_sla = dept_info["sla_hours"]

            # Calculate new due date
            due_dt = datetime.now(timezone.utc) + timedelta(hours=new_sla)
            new_due_by = due_dt.isoformat()

            # Create audit timeline entry
            audit_item = {
                "timestamp": now_iso,
                "event": "GAZETTE_AUTO_REASSIGNMENT",
                "from_ulb": f"{old_ulb_name} ({old_ulb_code})",
                "to_ulb": f"{new_ulb_name} ({new_ulb_code})",
                "reason": f"Gazette Notification {gazette_id} ({notification_title})",
                "details": f"Spatial PIP boundary recalculation assigned ticket to {new_dept} with recalculated SLA ({new_sla} hours)."
            }

            c["ulb_code"] = new_ulb_code
            c["ulb_name"] = new_ulb_name
            c["ulb_type"] = new_jurisdiction["ulb_type"]
            c["department"] = new_dept
            c["sla_hours"] = new_sla
            c["due_by"] = new_due_by
            c["current_boundary_version"] = target_version
            c["status"] = "REBALANCED"
            c["updated_at"] = now_iso
            c["timeline"].append(audit_item)

            save_complaint(c)
            rebalanced_ids.append(c["id"])
        else:
            # Update active version marker even if ULB remains the same
            c["current_boundary_version"] = target_version
            c["updated_at"] = now_iso
            save_complaint(c)

    # Persist system active version state
    set_active_version(target_version)

    return {
        "status": "SUCCESS",
        "active_version": target_version,
        "notification_id": gazette_id,
        "total_complaints_checked": len(complaints),
        "rebalanced_count": len(rebalanced_ids),
        "rebalanced_ids": rebalanced_ids,
        "timestamp": now_iso
    }
