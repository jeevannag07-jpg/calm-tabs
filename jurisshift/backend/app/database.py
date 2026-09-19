import sqlite3
import json
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from app.config import DB_PATH
from app.models.complaint import ComplaintResponse, ComplaintStatus, AuditLogItem

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            category TEXT NOT NULL,
            urgency TEXT NOT NULL,
            ulb_code TEXT NOT NULL,
            ulb_name TEXT NOT NULL,
            ulb_type TEXT NOT NULL,
            department TEXT NOT NULL,
            sla_hours INTEGER NOT NULL,
            due_by TEXT NOT NULL,
            status TEXT NOT NULL,
            citizen_name TEXT NOT NULL,
            citizen_phone TEXT NOT NULL,
            image_url TEXT,
            boundary_version_at_creation TEXT NOT NULL,
            current_boundary_version TEXT NOT NULL,
            timeline TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_state (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
    """)
    
    # Initialize active boundary version if not present
    cursor.execute("INSERT OR IGNORE INTO system_state (key, value) VALUES ('active_boundary_version', 'v1');")
    conn.commit()
    conn.close()

def get_active_version() -> str:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM system_state WHERE key = 'active_boundary_version';")
    row = cursor.fetchone()
    conn.close()
    return row["value"] if row else "v1"

def set_active_version(version: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO system_state (key, value) VALUES ('active_boundary_version', ?);", (version,))
    conn.commit()
    conn.close()

def row_to_complaint(row) -> Dict[str, Any]:
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "category": row["category"],
        "urgency": row["urgency"],
        "ulb_code": row["ulb_code"],
        "ulb_name": row["ulb_name"],
        "ulb_type": row["ulb_type"],
        "department": row["department"],
        "sla_hours": row["sla_hours"],
        "due_by": row["due_by"],
        "status": row["status"],
        "citizen_name": row["citizen_name"],
        "citizen_phone": row["citizen_phone"],
        "image_url": row["image_url"],
        "boundary_version_at_creation": row["boundary_version_at_creation"],
        "current_boundary_version": row["current_boundary_version"],
        "timeline": json.loads(row["timeline"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }

def save_complaint(data: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    timeline_str = json.dumps(data["timeline"])
    cursor.execute("""
        INSERT OR REPLACE INTO complaints (
            id, title, description, latitude, longitude, category, urgency,
            ulb_code, ulb_name, ulb_type, department, sla_hours, due_by,
            status, citizen_name, citizen_phone, image_url,
            boundary_version_at_creation, current_boundary_version,
            timeline, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        data["id"], data["title"], data["description"], data["latitude"], data["longitude"],
        data["category"], data["urgency"], data["ulb_code"], data["ulb_name"],
        data["ulb_type"], data["department"], data["sla_hours"], data["due_by"],
        data["status"], data["citizen_name"], data["citizen_phone"], data.get("image_url"),
        data["boundary_version_at_creation"], data["current_boundary_version"],
        timeline_str, data["created_at"], data["updated_at"]
    ))
    conn.commit()
    conn.close()

def get_complaint_by_id(complaint_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints WHERE id = ?;", (complaint_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return row_to_complaint(row)
    return None

def get_all_complaints() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints ORDER BY created_at DESC;")
    rows = cursor.fetchall()
    conn.close()
    return [row_to_complaint(r) for r in rows]

def clear_all_complaints():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM complaints;")
    cursor.execute("INSERT OR REPLACE INTO system_state (key, value) VALUES ('active_boundary_version', 'v1');")
    conn.commit()
    conn.close()
