import React, { useState } from 'react';
import { GazetteShiftResponse } from '../types';
import { Building, Zap, RotateCcw, FileText, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface AdminPanelProps {
  activeVersion: string;
  onTriggerGazette: (version: string) => Promise<GazetteShiftResponse>;
  onReset: () => Promise<void>;
  onSeedDemo: () => Promise<void>;
  gazetteLog: GazetteShiftResponse | null;
  loading: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  activeVersion,
  onTriggerGazette,
  onReset,
  onSeedDemo,
  gazetteLog,
  loading,
}) => {
  const [publishing, setPublishing] = useState(false);

  const handleGazetteToggle = async () => {
    try {
      setPublishing(true);
      const target = activeVersion === 'v1' ? 'v2' : 'v1';
      await onTriggerGazette(target);
    } catch (err) {
      console.error("Gazette Shift trigger error:", err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building size={18} color="#f59e0b" />
          Gazette Jurisdiction Engine (Admin Control)
        </h3>
        <span className={`badge ${activeVersion === 'v2' ? 'badge-rebalanced' : 'badge-pending'}`}>
          Active Gazette: {activeVersion.toUpperCase()}
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
        Simulate real-time government Gazette notifications updating Urban Local Body (ULB) spatial polygons. JurisShift automatically recalculates Point-in-Polygon (PIP) locations and reassigns tickets and department SLAs.
      </p>

      {/* Gazette Trigger Button Banner */}
      <div style={{
        background: activeVersion === 'v2'
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)'
          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)',
        border: `1px solid ${activeVersion === 'v2' ? 'rgba(139, 92, 246, 0.5)' : 'rgba(245, 158, 11, 0.5)'}`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
              {activeVersion === 'v1'
                ? 'Gazette Notification v1: Base Municipal Limits'
                : '⚡ Gazette Notification v2: MCC Limits Expansion (Active)'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
              {activeVersion === 'v1'
                ? 'MCC, Hootagalli CMC, and Bogadi TP operate independently.'
                : 'Mysore City Corporation (MCC) absorbed Bogadi/Hootagalli buffer zone.'}
            </div>
          </div>

          <button
            onClick={handleGazetteToggle}
            disabled={publishing || loading}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: activeVersion === 'v1'
                ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: 'none',
              cursor: publishing ? 'wait' : 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Zap size={16} />
            {publishing ? 'Migrating Tickets...' : activeVersion === 'v1' ? 'Trigger Gazette Shift (v2)' : 'Revert to Gazette v1'}
          </button>
        </div>
      </div>

      {/* Gazette Log Result */}
      {gazetteLog && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '16px',
          fontSize: '0.8rem',
          color: '#e2e8f0'
        }}>
          <div style={{ fontWeight: 700, color: '#c084fc', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} />
            Gazette Rebalance Audit Log ({gazetteLog.notification_id})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>Checked Tickets: <strong>{gazetteLog.total_complaints_checked}</strong></div>
            <div>Shifted & Rebalanced: <strong style={{ color: '#c084fc' }}>{gazetteLog.rebalanced_count} tickets</strong></div>
          </div>
          {gazetteLog.rebalanced_ids.length > 0 && (
            <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
              Reassigned Ticket IDs: {gazetteLog.rebalanced_ids.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Action Helper Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onReset}
          disabled={loading}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid var(--border-color)',
            color: '#cbd5e1',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <RotateCcw size={14} />
          Reset Boundaries (v1)
        </button>

        <button
          onClick={onSeedDemo}
          disabled={loading}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#93c5fd',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Sparkles size={14} />
          Seed Demo Tickets
        </button>
      </div>
    </div>
  );
};
