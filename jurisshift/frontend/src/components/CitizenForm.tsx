import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MapPin, Sparkles, Send, Crosshair, CheckCircle2, AlertCircle } from 'lucide-react';

interface CitizenFormProps {
  onSuccess: () => void;
  isPickerMode: boolean;
  setIsPickerMode: (val: boolean) => void;
  pickedLocation: { lat: number; lng: number } | null;
}

export const CitizenForm: React.FC<CitizenFormProps> = ({
  onSuccess,
  isPickerMode,
  setIsPickerMode,
  pickedLocation,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number>(12.3105);
  const [longitude, setLongitude] = useState<number>(76.6012);
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [categoryOverride, setCategoryOverride] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (pickedLocation) {
      setLatitude(parseFloat(pickedLocation.lat.toFixed(6)));
      setLongitude(parseFloat(pickedLocation.lng.toFixed(6)));
    }
  }, [pickedLocation]);

  // Quick preset sample scenarios
  const applyPreset = (type: 'bogadi' | 'hootagalli' | 'mcc') => {
    if (type === 'bogadi') {
      setTitle('Dangerous Deep Pothole near Bogadi Ring Road');
      setDescription('Large 2-meter wide crater causing bike accidents near Maruti temple junction.');
      setLatitude(12.3105);
      setLongitude(76.6012);
      setCategoryOverride('Roads & Infrastructure');
    } else if (type === 'hootagalli') {
      setTitle('Overflowing Garbage Dump at Hootagalli Signal');
      setDescription('Solid waste uncollected for over 4 days, blocking pedestrian footpath.');
      setLatitude(12.3550);
      setLongitude(76.5750);
      setCategoryOverride('Sanitation & Waste Management');
    } else if (type === 'mcc') {
      setTitle('Broken Streetlight & Exposed Electrical Wires');
      setDescription('Pole spark hazard on Sayyaji Rao Road near Mysore Palace.');
      setLatitude(12.3080);
      setLongitude(76.6500);
      setCategoryOverride('Electrical & Streetlighting');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please fill in both title and description.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const created = await api.createComplaint({
        title,
        description,
        latitude,
        longitude,
        citizen_name: citizenName || 'Anonymous Citizen',
        citizen_phone: citizenPhone || '+91-9876543210',
        category_override: categoryOverride || undefined,
      });

      setSuccessMsg(`Ticket ${created.id} registered! Auto-routed to ${created.ulb_name}.`);
      setTitle('');
      setDescription('');
      onSuccess();

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#8b5cf6" />
          Citizen Grievance Intake
        </h3>
        <span style={{ fontSize: '0.75rem', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
          AI & Spatial Auto-Routing
        </span>
      </div>

      {/* Preset Quick Fill Buttons */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
          Load Sample Scenarios:
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => applyPreset('bogadi')}
            style={{
              fontSize: '0.75rem',
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fcd34d',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              cursor: 'pointer'
            }}
          >
            🚧 Bogadi Buffer Pothole
          </button>
          <button
            type="button"
            onClick={() => applyPreset('hootagalli')}
            style={{
              fontSize: '0.75rem',
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#6ee7b7',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              cursor: 'pointer'
            }}
          >
            ♻️ Hootagalli Waste
          </button>
          <button
            type="button"
            onClick={() => applyPreset('mcc')}
            style={{
              fontSize: '0.75rem',
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'rgba(139, 92, 246, 0.15)',
              color: '#c084fc',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              cursor: 'pointer'
            }}
          >
            💡 MCC Streetlight
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#6ee7b7', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: 'rgba(244, 63, 94, 0.2)', border: '1px solid #f43f5e', color: '#fda4af', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            Complaint Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Deep pothole causing traffic obstruction"
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-color)',
              color: 'white',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            Grievance Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide specific details about the issue..."
            rows={3}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-color)',
              color: 'white',
              fontSize: '0.875rem',
              resize: 'vertical'
            }}
          />
        </div>

        {/* GPS Location Picker */}
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} color="#f43f5e" />
              GPS Coordinates
            </span>
            <button
              type="button"
              onClick={() => setIsPickerMode(!isPickerMode)}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '6px',
                background: isPickerMode ? '#f43f5e' : 'rgba(59, 130, 246, 0.2)',
                color: isPickerMode ? 'white' : '#93c5fd',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Crosshair size={12} />
              {isPickerMode ? 'Click Map Now...' : 'Select on Map'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Latitude</span>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem' }}
              />
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Longitude</span>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem' }}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: '6px',
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: 'none',
            cursor: submitting ? 'wait' : 'pointer',
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Send size={16} />
          {submitting ? 'Auto-Routing Ticket...' : 'File Grievance & Auto-Route'}
        </button>
      </form>
    </div>
  );
};
