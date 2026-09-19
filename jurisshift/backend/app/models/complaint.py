from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime

class ComplaintStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    REBALANCED = "REBALANCED"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"

class AuditLogItem(BaseModel):
    timestamp: str
    event: str
    from_ulb: Optional[str] = None
    to_ulb: Optional[str] = None
    reason: str
    details: Optional[str] = None

class ComplaintCreate(BaseModel):
    title: str = Field(..., description="Short summary of the complaint")
    description: str = Field(..., description="Full details of the grievance")
    latitude: float = Field(..., description="GPS latitude coordinate")
    longitude: float = Field(..., description="GPS longitude coordinate")
    citizen_name: Optional[str] = "Anonymous Citizen"
    citizen_phone: Optional[str] = "+91-9876543210"
    image_url: Optional[str] = None
    category_override: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: str
    title: str
    description: str
    latitude: float
    longitude: float
    category: str
    urgency: str
    ulb_code: str
    ulb_name: str
    ulb_type: str
    department: str
    sla_hours: int
    due_by: str
    status: ComplaintStatus
    citizen_name: str
    citizen_phone: str
    image_url: Optional[str] = None
    boundary_version_at_creation: str
    current_boundary_version: str
    timeline: List[AuditLogItem]
    created_at: str
    updated_at: str

class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus
    note: Optional[str] = None
