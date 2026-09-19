import React, { useState } from 'react';
import { useGrievances } from '../hooks/useGrievances';
import { MapViewer } from '../components/MapViewer';
import { CitizenForm } from '../components/CitizenForm';
import { AdminPanel } from '../components/AdminPanel';
import { TicketTimeline } from '../components/TicketTimeline';
import { Grievance } from '../types';
import { Building2, MapPin, Zap, RefreshCw, PlusCircle, SlidersHorizontal, ShieldCheck, Search } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
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
    refreshData,
  } = useGrievances();

  const [activeTab, setActiveTab] = useState<'feed' | 'form' | 'admin'>('feed');
  const [filterUlb, setFilterUlb] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleLocationPicked = (lat: number, lng: number) => {
    setPickedLocation({ lat, lng });
    setIsPickerMode(false);
    setActiveTab('form'); // Auto switch to intake form
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesUlb = filterUlb === 'ALL' || c.ulb_code === filterUlb;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUlb && matchesSearch;
  });

  // Calculate statistics
  const totalCount = complaints.length;
  const rebalancedCount = complaints.filter((c) => c.status === 'REBALANCED').length;
  const mccCount = complaints.filter((c) => c.ulb_code === 'ULB-MCC-01').length;
  const hootagalliCount = complaints.filter((c) => c.ulb_code === 'ULB-HTC-02').length;
  const bogadiCount = complaints.filter((c) => c.ulb_code === 'ULB-BGD-03').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Navbar */}
      <header style={{
        height: '64px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
          }}>
            ⚡
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              JurisShift
              <span style={{ fontSize: '0.65rem', background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.4)', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                Municipal Spatial Engine
              </span>
            </h1>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Mysore Region ULB Spatial PIP Routing & Dynamic Gazette Migration
            </span>
          </div>
        </div>

        {/* Top Analytics Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', color: '#cbd5e1' }}>
            Total Tickets: <strong style={{ color: 'white' }}>{totalCount}</strong>
          </div>

          <div style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.4)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} />
            Gazette Rebalanced: <strong>{rebalancedCount}</strong>
          </div>

          <button
            onClick={refreshData}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid var(--border-color)',
              color: '#cbd5e1',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Side: Map Container */}
        <div style={{ flex: 1.2, position: 'relative', padding: '16px', background: '#090d16' }}>
          <MapViewer
            boundariesGeoJSON={boundariesGeoJSON}
            complaints={complaints}
            activeVersion={activeVersion}
            selectedComplaint={selectedComplaint}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
            isPickerMode={isPickerMode}
            pickedLocation={pickedLocation}
            onLocationPicked={handleLocationPicked}
          />
        </div>

        {/* Right Side: Control & Grievance Feed Panel */}
        <div style={{
          flex: 1,
          maxWidth: '520px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          gap: '16px',
          overflowY: 'auto'
        }}>
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.7)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setActiveTab('feed')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'feed' ? 'var(--accent-purple)' : 'transparent',
                color: activeTab === 'feed' ? 'white' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📋 Live Grievances ({totalCount})
            </button>

            <button
              onClick={() => setActiveTab('form')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'form' ? 'var(--accent-purple)' : 'transparent',
                color: activeTab === 'form' ? 'white' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ➕ File Intake
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'admin' ? 'var(--accent-purple)' : 'transparent',
                color: activeTab === 'admin' ? 'white' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🏛️ Gazette Simulator
            </button>
          </div>

          {/* TAB 1: Live Grievance Feed */}
          {activeTab === 'feed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Filter & Search Bar */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ticket title or ID..."
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 30px',
                      borderRadius: '8px',
                      background: 'rgba(30, 41, 59, 0.7)',
                      border: '1px solid var(--border-color)',
                      color: 'white',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>

                <select
                  value={filterUlb}
                  onChange={(e) => setFilterUlb(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value="ALL">All ULBs</option>
                  <option value="ULB-MCC-01">MCC Mysore ({mccCount})</option>
                  <option value="ULB-HTC-02">Hootagalli CMC ({hootagalliCount})</option>
                  <option value="ULB-BGD-03">Bogadi TP ({bogadiCount})</option>
                </select>
              </div>

              {/* Complaint List Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredComplaints.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                    No grievances match the filter criteria.
                  </div>
                ) : (
                  filteredComplaints.map((c) => (
                    <div
                      key={c.id}
                      className="glass-card"
                      onClick={() => setSelectedComplaint(c)}
                      style={{
                        padding: '14px',
                        cursor: 'pointer',
                        borderLeft: c.status === 'REBALANCED' ? '4px solid #8b5cf6' : '4px solid #3b82f6'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8' }}>{c.id}</span>
                        <span className={`badge ${c.status === 'REBALANCED' ? 'badge-rebalanced' : 'badge-pending'}`}>
                          {c.status}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                        {c.title}
                      </h4>

                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {c.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', background: 'rgba(15, 23, 42, 0.4)', padding: '6px 10px', borderRadius: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#c084fc' }}>🏛️ {c.ulb_name}</span>
                        <span>⏱️ {c.sla_hours}h SLA ({c.department})</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Citizen Intake Form */}
          {activeTab === 'form' && (
            <CitizenForm
              onSuccess={() => {
                refreshData();
                setActiveTab('feed');
              }}
              isPickerMode={isPickerMode}
              setIsPickerMode={setIsPickerMode}
              pickedLocation={pickedLocation}
            />
          )}

          {/* TAB 3: Admin Gazette Simulator */}
          {activeTab === 'admin' && (
            <AdminPanel
              activeVersion={activeVersion}
              onTriggerGazette={triggerGazetteShift}
              onReset={resetToV1}
              onSeedDemo={seedDemoData}
              gazetteLog={gazetteLog}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Ticket Timeline Audit Modal */}
      {selectedComplaint && (
        <TicketTimeline
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
};
