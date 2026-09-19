import React from 'react';
import { Grievance } from '../types';
import { X, Clock, MapPin, Building, ShieldCheck, Zap, History, User } from 'lucide-react';

interface TicketTimelineProps {
  complaint: Grievance;
  onClose: () => void;
}

export const TicketTimeline: React.FC<TicketTimelineProps> = ({ complaint, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2000,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '650px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#94a3b8',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Header Header */}
        <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className={`badge ${complaint.status === 'REBALANCED' ? 'badge-rebalanced' : 'badge-pending'}`}>
              {complaint.status}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>{complaint.id}</span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', padding: '2px 8px', borderRadius: '6px' }}>
              {complaint.category}
            </span>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
            {complaint.title}
          </h2>

          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            {complaint.description}
          </p>
        </div>

        {/* Metadata Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '14px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          marginBottom: '20px'
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building size={12} color="#8b5cf6" /> Current Responsible ULB
            </span>
            <strong style={{ fontSize: '0.85rem', color: '#f8fafc' }}>{complaint.ulb_name}</strong>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} color="#10b981" /> Assigned Department & SLA
            </span>
            <strong style={{ fontSize: '0.85rem', color: '#f8fafc' }}>{complaint.department} ({complaint.sla_hours}h)</strong>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} color="#f43f5e" /> GPS Coordinates
            </span>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{complaint.latitude}, {complaint.longitude}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={12} color="#3b82f6" /> Citizen Reporter
            </span>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{complaint.citizen_name}</span>
          </div>
        </div>

        {/* Timeline Audit Trail */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={16} color="#8b5cf6" />
            Audit Trail & Gazette Shift History
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '16px' }}>
            {/* Vertical Line */}
            <div style={{
              position: 'absolute',
              left: '6px',
              top: '8px',
              bottom: '8px',
              width: '2px',
              background: 'rgba(255, 255, 255, 0.1)'
            }} />

            {complaint.timeline.map((item, idx) => {
              const isGazette = item.event === 'GAZETTE_AUTO_REASSIGNMENT';
              return (
                <div key={idx} style={{ position: 'relative' }}>
                  {/* Timeline Dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-14px',
                    top: '4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: isGazette ? '#8b5cf6' : '#3b82f6',
                    border: '2px solid #0f172a',
                    boxShadow: isGazette ? '0 0 10px #8b5cf6' : 'none'
                  }} />

                  <div style={{
                    background: isGazette ? 'rgba(139, 92, 246, 0.15)' : 'rgba(30, 41, 59, 0.6)',
                    border: `1px solid ${isGazette ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '10px',
                    padding: '12px 14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isGazette ? '#c084fc' : '#93c5fd', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isGazette ? <Zap size={12} /> : <ShieldCheck size={12} />}
                        {item.event}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600, marginBottom: '2px' }}>
                      {item.reason}
                    </div>

                    {item.from_ulb && item.to_ulb && (
                      <div style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '4px 0', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                        <span style={{ color: '#f43f5e' }}>{item.from_ulb}</span> &rarr; <span style={{ color: '#10b981', fontWeight: 700 }}>{item.to_ulb}</span>
                      </div>
                    )}

                    {item.details && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                        {item.details}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
