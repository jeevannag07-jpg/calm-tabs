export type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'REBALANCED' | 'RESOLVED' | 'REJECTED';
export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Emergency';

export interface AuditLogItem {
  timestamp: string;
  event: string;
  from_ulb?: string | null;
  to_ulb?: string | null;
  reason: string;
  details?: string | null;
}

export interface Grievance {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  urgency: UrgencyLevel;
  ulb_code: string;
  ulb_name: string;
  ulb_type: string;
  department: string;
  sla_hours: number;
  due_by: string;
  status: ComplaintStatus;
  citizen_name: string;
  citizen_phone: string;
  image_url?: string | null;
  boundary_version_at_creation: string;
  current_boundary_version: string;
  timeline: AuditLogItem[];
  created_at: string;
  updated_at: string;
}

export interface GazetteShiftResponse {
  status: string;
  active_version: string;
  notification_id: string;
  total_complaints_checked: number;
  rebalanced_count: number;
  rebalanced_ids: string[];
  timestamp: string;
}

export interface ULBProperties {
  ulb_code: string;
  ulb_name: string;
  ulb_type: string;
  district: string;
  state: string;
  color: string;
  fill_color: string;
  contact_helpline: string;
}
