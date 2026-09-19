import { useState, useEffect, useCallback } from 'react';
import { Grievance, GazetteShiftResponse } from '../types';
import { api } from '../services/api';

export function useGrievances() {
  const [complaints, setComplaints] = useState<Grievance[]>([]);
  const [boundariesGeoJSON, setBoundariesGeoJSON] = useState<any>(null);
  const [activeVersion, setActiveVersion] = useState<string>('v1');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Grievance | null>(null);
  const [isPickerMode, setIsPickerMode] = useState<boolean>(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gazetteLog, setGazetteLog] = useState<GazetteShiftResponse | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load active boundaries & complaints
      const boundaryRes = await api.getBoundaries();
      setBoundariesGeoJSON(boundaryRes.geojson);
      setActiveVersion(boundaryRes.active_version);

      const complaintsData = await api.getComplaints();
      setComplaints(complaintsData);
    } catch (err: any) {
      console.error("Failed to load JurisShift data:", err);
      setError(err.message || "Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const triggerGazetteShift = async (targetVersion: string = 'v2') => {
    try {
      setLoading(true);
      const res = await api.pushGazetteUpdate(targetVersion);
      setGazetteLog(res);
      await refreshData();
      return res;
    } catch (err: any) {
      setError(err.message || "Gazette Shift failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetToV1 = async () => {
    try {
      setLoading(true);
      await api.resetBoundaries();
      setGazetteLog(null);
      await refreshData();
    } catch (err: any) {
      setError(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const seedDemoData = async () => {
    try {
      setLoading(true);
      await api.seedDemo();
      await refreshData();
    } catch (err: any) {
      setError(err.message || "Seed failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    complaints,
    boundariesGeoJSON,
    activeVersion,
    loading,
    error,
    selectedComplaint,
    setSelectedComplaint,
    isPickerMode,
    setIsPickerMode,
    pickedLocation,
    setPickedLocation,
    gazetteLog,
    triggerGazetteShift,
    resetToV1,
    seedDemoData,
    refreshData
  };
}
