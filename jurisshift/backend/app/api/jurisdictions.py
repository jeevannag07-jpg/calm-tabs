from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, Any
from app.models.jurisdiction import GazettePushRequest, GazettePushResponse
from app.database import get_active_version
from app.services.spatial_engine import spatial_engine
from app.services.migrator import execute_gazette_migration

router = APIRouter(prefix="/api/jurisdictions", tags=["Jurisdictions & Gazette Shift"])

@router.get("/boundaries")
async def get_boundaries(version: Optional[str] = Query(None, description="v1 or v2")):
    active_ver = get_active_version()
    target_ver = version if version in ["v1", "v2"] else active_ver

    try:
        geojson_data = spatial_engine.load_boundaries(version=target_ver)
        return {
            "active_version": active_ver,
            "requested_version": target_ver,
            "geojson": geojson_data
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/gazette-push", response_model=GazettePushResponse)
async def publish_gazette_notification(payload: GazettePushRequest):
    target_ver = payload.version if payload.version in ["v1", "v2"] else "v2"
    result = execute_gazette_migration(
        target_version=target_ver,
        gazette_id=payload.gazette_notification_id or "GAZETTE/KAR/2026/MYS-087",
        notification_title=payload.notification_title or "MCC Annexation Gazette Shift"
    )
    return result

@router.post("/reset")
async def reset_boundaries():
    result = execute_gazette_migration(
        target_version="v1",
        gazette_id="SYSTEM-RESET",
        notification_title="Reverting ULB Boundaries to Base Gazette v1"
    )
    return {"status": "SUCCESS", "message": "Jurisdiction boundaries reset to v1", "migration": result}
