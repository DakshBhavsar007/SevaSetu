import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { needs as needsApi } from '../services/api';

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [mapNeeds, setMapNeeds] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadMapData(); }, [filter]);

  async function loadMapData() {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.category = filter;
      const data = await needsApi.getForMap(params);
      setMapNeeds(data);
    } catch (err) {
      console.error('Failed to load map data:', err);
    }
    setLoading(false);
  }

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([19.076, 72.878], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    // Create a layer group for markers
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Force a resize after mount to fix grey tiles
    setTimeout(() => { map.invalidateSize(); }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Clear existing markers
    markersLayer.clearLayers();

    const catColors = {
      medical: '#EF4444', food: '#F97316', shelter: '#3B82F6',
      water: '#06B6D4', rescue: '#A855F7', education: '#10B981',
      clothing: '#EAB308', sanitation: '#14B8A6', other: '#6B7280',
    };
    const catIcons = {
      medical: '🏥', food: '🍚', shelter: '🏠', water: '💧',
      rescue: '🚨', education: '📚', clothing: '👕', sanitation: '🧹', other: '📋',
    };

    mapNeeds.forEach(need => {
      const color = catColors[need.category] || '#6B7280';
      const radius = 6 + (need.urgency * 2);

      const marker = L.circleMarker([need.latitude, need.longitude], {
        radius,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.6,
      });

      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 200px;">
          <h4 style="margin: 0 0 4px; font-size: 14px;">${catIcons[need.category] || '📋'} ${need.title}</h4>
          <p style="margin: 0; color: #666; font-size: 12px;">
            Category: <strong>${need.category}</strong><br/>
            Urgency: <strong>${need.urgency}/5</strong><br/>
            People: <strong>${need.people_affected}</strong><br/>
            Status: <strong>${need.status}</strong>
          </p>
        </div>
      `);

      markersLayer.addLayer(marker);

      // Pulse ring for high urgency
      if (need.urgency >= 4) {
        const pulse = L.circleMarker([need.latitude, need.longitude], {
          radius: radius + 8,
          fillColor: color,
          color: color,
          weight: 1,
          opacity: 0.3,
          fillOpacity: 0.1,
        });
        markersLayer.addLayer(pulse);
      }
    });

    // Fit bounds if we have data
    if (mapNeeds.length > 0) {
      const bounds = L.latLngBounds(mapNeeds.map(n => [n.latitude, n.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [mapNeeds]);

  const categories = ['medical', 'food', 'shelter', 'water', 'rescue', 'education', 'clothing', 'sanitation'];
  const catIcons = { medical: '🏥', food: '🍚', shelter: '🏠', water: '💧', rescue: '🚨', education: '📚', clothing: '👕', sanitation: '🧹' };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>🗺️ Live Crisis Map</h2>
          <div className="subtitle">
            {loading ? 'Loading...' : `${mapNeeds.length} active needs on map`}
          </div>
        </div>
        <button className="btn btn-primary" onClick={loadMapData}>↻ Refresh</button>
      </div>

      <div className="page-body">
        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${!filter ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(filter === cat ? '' : cat)}
            >
              {catIcons[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Map */}
        <div
          className="map-container"
          style={{
            height: '600px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
          }}
        >
          <div ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex', gap: '16px', marginTop: '12px',
          flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-secondary)',
        }}>
          {Object.entries({
            medical: '#EF4444', food: '#F97316', shelter: '#3B82F6',
            water: '#06B6D4', rescue: '#A855F7', education: '#10B981',
            clothing: '#EAB308', sanitation: '#14B8A6',
          }).map(([cat, color]) => (
            <span key={cat} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: color, display: 'inline-block',
              }}></span>
              {cat}
            </span>
          ))}
          <span style={{ marginLeft: '16px' }}>
            ○ Large circle = High urgency (4-5)
          </span>
        </div>
      </div>
    </>
  );
}
