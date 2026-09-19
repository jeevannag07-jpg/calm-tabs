from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class GazettePushRequest(BaseModel):
    version: str = "v2"
    gazette_notification_id: Optional[str] = "GAZETTE/KAR/2026/MYS-087"
    notification_title: Optional[str] = "Mysore City Corporation (MCC) Municipal Limits Annexation Expansion"
    custom_geojson: Optional[Dict[str, Any]] = None

class GazettePushResponse(BaseModel):
    status: str
    active_version: str
    notification_id: str
    total_complaints_checked: int
    rebalanced_count: int
    rebalanced_ids: List[str]
    timestamp: str
