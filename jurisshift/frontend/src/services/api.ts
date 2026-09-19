import axios from 'axios';
import { Grievance, GazetteShiftResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const api = {
  // Fetch all complaints
  async getComplaints(ulbCode?: string, status?: string): Promise<Grievance[]> {
    const params: Record<string, string> = {};
    if (ulbCode) params.ulb_code = ulbCode;
    if (status) params.status = status;
    const res = await axios.get<Grievance[]>(`${API_BASE_URL}/complaints`, { params });
    return res.data;
  },

  // Get single complaint details
  async getComplaint(id: string): Promise<Grievance> {
    const res = await axios.get<Grievance>(`${API_BASE_URL}/complaints/${id}`);
    return res.data;
  },

  // Create new complaint intake
  async createComplaint(payload: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    citizen_name?: string;
    citizen_phone?: string;
    category_override?: string;
  }): Promise<Grievance> {
    const res = await axios.post<Grievance>(`${API_BASE_URL}/complaints`, payload);
    return res.data;
  },

  // Fetch GeoJSON boundary polygons
  async getBoundaries(version?: string): Promise<{ active_version: string; requested_version: string; geojson: any }> {
    const params: Record<string, string> = {};
    if (version) params.version = version;
    const res = await axios.get(`${API_BASE_URL}/jurisdictions/boundaries`, { params });
    return res.data;
  },

  // Trigger Gazette Boundary Shift Simulation
  async pushGazetteUpdate(version: string = 'v2', notificationId?: string): Promise<GazetteShiftResponse> {
    const res = await axios.post<GazetteShiftResponse>(`${API_BASE_URL}/jurisdictions/gazette-push`, {
      version,
      gazette_notification_id: notificationId || 'GAZETTE/KAR/2026/MYS-087',
      notification_title: 'Mysore City Corporation (MCC) Limits Annexation Gazette Expansion'
    });
    return res.data;
  },

  // Reset to Gazette v1
  async resetBoundaries(): Promise<any> {
    const res = await axios.post(`${API_BASE_URL}/jurisdictions/reset`);
    return res.data;
  },

  // Reset demo complaints seed data
  async seedDemo(): Promise<any> {
    const res = await axios.post(`${API_BASE_URL}/complaints/reset-demo/seed`);
    return res.data;
  }
};
