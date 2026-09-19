import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Grievance } from '../types';
import { Navigation, Building2, Layers, Map as MapIcon, Globe, Moon } from 'lucide-react';

interface MapViewerProps {
  boundariesGeoJSON: any;
  complaints: Grievance[];
  activeVersion: string;
  selectedComplaint: Grievance | null;
  onSelectComplaint: (c: Grievance) => void;
  isPickerMode: boolean;
  pickedLocation: { lat: number; lng: number } | null;
  onLocationPicked: (lat: number, lng: number) => void;
}

// Custom Marker Pins
const createCustomIcon = (category: string, status: string, isSelected: boolean) => {
  let color = '#3b82f6';
  if (category.includes('Roads')) color = '#f59e0b';
  else if (category.includes('Sanitation')) color = '#10b981';
  else if (category.includes('Electrical')) color = '#8b5cf6';
  else if (category.includes('Water')) color = '#06b6d4';

  const isRebalanced = status === 'REBALANCED';
  const borderStyle = isRebalanced ? '3px solid #c084fc' : '2px solid white';
  const animation = isRebalanced ? 'pulse-border 2s infinite' : 'none';
  const size = isSelected ? 38 : 30;

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border: ${borderStyle};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 14px rgba(0,0,0,0.6);
      animation: ${animation};
      font-size: 15px;
      font-weight: bold;
    ">
      ${isRebalanced ? '⚡' : '📍'}
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-leaflet-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const pickerIcon = L.divIcon({
  html: `
    <div style="
      width: 40px;
      height: 40px;
      background: #f43f5e;
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 0 20px rgba(244, 63, 94, 0.9);
      font-size: 20px;
      animation: pulse-border 1.5s infinite;
    ">
      🎯
    </div>
  `,
  className: 'custom-picker-pin',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function MapClickHandler({ isPickerMode, onLocationPicked }: { isPickerMode: boolean; onLocationPicked: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (isPickerMode) {
        onLocationPicked(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  boundariesGeoJSON,
  complaints,
  activeVersion,
  selectedComplaint,
  onSelectComplaint,
  isPickerMode,
  pickedLocation,
  onLocationPicked,
}) => {
  // Map Layer Style Switcher state: 'google_roadmap', 'google_satellite', 'google_dark'
  const [mapStyle, setMapStyle] = useState<'google_roadmap' | 'google_satellite' | 'google_dark'>('google_dark');

  // Mysore Center Coordinates
  const centerLat = 12.3150;
  const centerLng = 76.6150;

  // Google Maps Tile Configurations (Zero API Key required)
  const tileConfigs = {
    google_roadmap: {
      url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps',
      className: ''
    },
    google_satellite: {
      url: 'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps Imagery',
      className: ''
    },
    google_dark: {
      url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps Dark',
      className: 'google-dark-tiles'
    }
  };

  const currentTile = tileConfigs[mapStyle];

  const geoJsonStyle = (feature: any) => {
    const props = feature.properties || {};
    return {
      fillColor: props.fill_color || 'rgba(139, 92, 246, 0.35)',
      weight: 3,
      opacity: 0.9,
      color: props.color || '#8b5cf6',
      dashArray: activeVersion === 'v2' && props.ulb_code === 'ULB-MCC-01' ? '6, 6' : 'none',
      fillOpacity: 0.35,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties || {};
    const popupContent = `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 6px; min-width: 180px;">
        <strong style="color: #8b5cf6; font-size: 14px;">${props.ulb_name || 'ULB Zone'}</strong><br/>
        <span style="font-size: 12px; color: #475569; font-weight: 600;">Code: ${props.ulb_code || ''} (${props.ulb_type || ''})</span><br/>
        <span style="font-size: 11px; color: #64748b;">Helpline: ${props.contact_helpline || 'N/A'}</span>
      </div>
    `;
    layer.bindPopup(popupContent);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '600px', borderRadius: '16px', overflow: 'hidden' }}>
      {/* Picker Notification Banner */}
      {isPickerMode && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: '#f43f5e',
          color: 'white',
          padding: '10px 22px',
          borderRadius: '30px',
          fontWeight: 700,
          fontSize: '0.85rem',
          boxShadow: '0 8px 24px rgba(244, 63, 94, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Navigation size={18} className="animate-spin" />
          Click anywhere on Google Maps to select complaint coordinates!
        </div>
      )}

      {/* Map Style Switcher Control */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '12px',
        padding: '6px',
        display: 'flex',
        gap: '4px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
      }}>
        <button
          onClick={() => setMapStyle('google_dark')}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            background: mapStyle === 'google_dark' ? '#8b5cf6' : 'transparent',
            color: mapStyle === 'google_dark' ? 'white' : '#cbd5e1',
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Moon size={14} />
          Google Dark
        </button>

        <button
          onClick={() => setMapStyle('google_roadmap')}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            background: mapStyle === 'google_roadmap' ? '#8b5cf6' : 'transparent',
            color: mapStyle === 'google_roadmap' ? 'white' : '#cbd5e1',
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <MapIcon size={14} />
          Google Map
        </button>

        <button
          onClick={() => setMapStyle('google_satellite')}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            background: mapStyle === 'google_satellite' ? '#8b5cf6' : 'transparent',
            color: mapStyle === 'google_satellite' ? 'white' : '#cbd5e1',
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Globe size={14} />
          Satellite
        </button>
      </div>

      <MapContainer
        center={[centerLat, centerLng]}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '600px', borderRadius: '16px' }}
      >
        <TileLayer
          key={mapStyle}
          attribution={currentTile.attribution}
          url={currentTile.url}
          subdomains={currentTile.subdomains}
          className={currentTile.className}
          maxZoom={20}
        />

        <MapClickHandler isPickerMode={isPickerMode} onLocationPicked={onLocationPicked} />

        {boundariesGeoJSON && (
          <GeoJSON
            key={`geojson-${activeVersion}-${mapStyle}`}
            data={boundariesGeoJSON}
            style={geoJsonStyle}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Complaint Markers */}
        {complaints.map((c) => {
          const isSelected = selectedComplaint?.id === c.id;
          return (
            <Marker
              key={c.id}
              position={[c.latitude, c.longitude]}
              icon={createCustomIcon(c.category, c.status, isSelected)}
              eventHandlers={{
                click: () => onSelectComplaint(c),
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'sans-serif', maxWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: c.status === 'REBALANCED' ? '#8b5cf6' : '#f59e0b' }}>
                      {c.status}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>({c.id})</span>
                  </div>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{c.title}</strong>
                  <p style={{ fontSize: '11px', color: '#475569', margin: '4px 0' }}>{c.description}</p>
                  <div style={{ fontSize: '11px', background: '#f1f5f9', padding: '4px 6px', borderRadius: '4px', marginTop: '6px' }}>
                    <strong>Assigned:</strong> {c.ulb_name}<br/>
                    <strong>Dept:</strong> {c.department} ({c.sla_hours}h SLA)
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Target Picker Marker */}
        {pickedLocation && (
          <Marker position={[pickedLocation.lat, pickedLocation.lng]} icon={pickerIcon}>
            <Popup>
              <div style={{ fontSize: '12px' }}>
                <strong>Selected GPS Location</strong><br/>
                Lat: {pickedLocation.lat.toFixed(5)}<br/>
                Lng: {pickedLocation.lng.toFixed(5)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map Legend */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.15)',
        padding: '12px 16px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        color: '#e2e8f0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontWeight: 700, marginBottom: '8px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building2 size={14} color="#8b5cf6" />
          Mysore Municipal Boundaries (Google Maps Dark Mode)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#8b5cf6', display: 'inline-block' }}></span>
            <span>MCC (City Corp)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981', display: 'inline-block' }}></span>
            <span>Hootagalli CMC</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b', display: 'inline-block' }}></span>
            <span>Bogadi TP</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #c084fc', background: '#8b5cf6', display: 'inline-block' }}></span>
            <span>⚡ Gazette Shifted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
