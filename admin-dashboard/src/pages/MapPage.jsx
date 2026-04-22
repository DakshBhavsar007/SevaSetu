import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { needs as needsApi, analytics } from '../services/api';

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const heatLayerRef = useRef(null);
  const [mapNeeds, setMapNeeds] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchMarkerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => { loadMapData(); }, [filter]);

  // Auto-refresh map every 30s
  useEffect(() => {
    pollRef.current = setInterval(() => { loadMapData(); }, 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [filter]);

  async function loadMapData() {
    try {
      const params = {};
      if (filter) params.category = filter;
      const [data, heatData] = await Promise.all([
        needsApi.getForMap(params),
        analytics.getHeatmap(params),
      ]);
      setMapNeeds(data);
      setHeatmapData(heatData);
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

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    setTimeout(() => { map.invalidateSize(); }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        heatLayerRef.current = null;
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

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
        <div style="font-family: Inter, sans-serif; min-width: 220px;">
          <h4 style="margin: 0 0 4px; font-size: 14px;">${catIcons[need.category] || '📋'} ${need.title}</h4>
          <p style="margin: 0; color: #666; font-size: 12px;">
            Category: <strong>${need.category}</strong><br/>
            Urgency: <strong>${'🔴'.repeat(need.urgency)}${'⚪'.repeat(5 - need.urgency)}</strong> (${need.urgency}/5)<br/>
            People: <strong>${need.people_affected}</strong><br/>
            Status: <strong>${need.status}</strong>
          </p>
        </div>
      `);

      markersLayer.addLayer(marker);

      if (need.urgency >= 4) {
        const pulse = L.circleMarker([need.latitude, need.longitude], {
          radius: radius + 8, fillColor: color, color: color,
          weight: 1, opacity: 0.3, fillOpacity: 0.1,
        });
        markersLayer.addLayer(pulse);
      }
    });

    if (mapNeeds.length > 0) {
      const bounds = L.latLngBounds(mapNeeds.map(n => [n.latitude, n.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [mapNeeds]);

  // Toggle heatmap layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing heatmap
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (showHeatmap && heatmapData.length > 0) {
      const heatPoints = heatmapData.map(p => [
        p.latitude, p.longitude, p.intensity || 50
      ]);

      heatLayerRef.current = L.heatLayer(heatPoints, {
        radius: 35,
        blur: 25,
        maxZoom: 17,
        max: 100,
        gradient: {
          0.2: '#2563EB',
          0.4: '#06B6D4',
          0.6: '#10B981',
          0.8: '#F97316',
          1.0: '#EF4444',
        },
      }).addTo(map);
    }
  }, [showHeatmap, heatmapData]);

  // Location search using Nominatim
  function handleSearchInput(value) {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (value.length < 3) { setSearchResults([]); return; }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&countrycodes=in`,
          { headers: { 'User-Agent': 'SmartAlloc/1.0' } }
        );
        const data = await res.json();
        setSearchResults(data);
      } catch (e) {
        console.error('Search failed:', e);
      }
      setSearching(false);
    }, 400);
  }

  function flyToLocation(lat, lon, name) {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old search marker
    if (searchMarkerRef.current) {
      map.removeLayer(searchMarkerRef.current);
    }

    map.flyTo([lat, lon], 14, { duration: 1.5 });

    // Add a pulsing search marker
    searchMarkerRef.current = L.circleMarker([lat, lon], {
      radius: 12, fillColor: '#FBBF24', color: '#F59E0B',
      weight: 3, opacity: 1, fillOpacity: 0.4,
    }).addTo(map);
    searchMarkerRef.current.bindPopup(`<b>📍 ${name}</b>`).openPopup();

    setSearchQuery(name);
    setSearchResults([]);
  }

  const categories = ['medical', 'food', 'shelter', 'water', 'rescue', 'education', 'clothing', 'sanitation'];
  const catIcons = { medical: '🏥', food: '🍚', shelter: '🏠', water: '💧', rescue: '🚨', education: '📚', clothing: '👕', sanitation: '🧹' };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>🗺️ Live Crisis Map</h2>
          <div className="subtitle">
            {loading ? 'Loading...' : `${mapNeeds.length} active needs on map`}
            <span style={{ marginLeft: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>🟢 Auto-refresh 30s</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn btn-sm ${showHeatmap ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowHeatmap(!showHeatmap)}
          >
            🔥 {showHeatmap ? 'Hide' : 'Show'} Heatmap
          </button>
          <button className="btn btn-primary" onClick={loadMapData}>↻ Refresh</button>
        </div>
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

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="🔍 Search location (e.g. Dharavi, Mumbai, Kurla)"
              value={searchQuery}
              onChange={e => handleSearchInput(e.target.value)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: '10px',
                border: '1px solid var(--border-color)', background: 'var(--bg-input)',
                color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
              }}
            />
            {searchQuery && (
              <button className="btn btn-outline btn-sm" onClick={() => {
                setSearchQuery(''); setSearchResults([]);
                if (searchMarkerRef.current && mapInstanceRef.current) {
                  mapInstanceRef.current.removeLayer(searchMarkerRef.current);
                  searchMarkerRef.current = null;
                }
              }}>✕</button>
            )}
          </div>
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: '10px', marginTop: '4px', overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  onClick={() => flyToLocation(parseFloat(r.lat), parseFloat(r.lon), r.display_name.split(',')[0])}
                  style={{
                    padding: '10px 16px', cursor: 'pointer', fontSize: '13px',
                    borderBottom: i < searchResults.length - 1 ? '1px solid var(--border-color)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontWeight: 600 }}>📍 {r.display_name.split(',').slice(0, 2).join(', ')}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {r.display_name}
                  </div>
                </div>
              ))}
            </div>
          )}
          {searching && (
            <div style={{ position: 'absolute', right: '60px', top: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>Searching...</div>
          )}
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
          <span style={{ marginLeft: '16px' }}>○ Large circle = High urgency</span>
          {showHeatmap && (
            <span style={{ marginLeft: '8px' }}>
              🔥 Heatmap: <span style={{ color: '#2563EB' }}>Low</span> → <span style={{ color: '#F97316' }}>Med</span> → <span style={{ color: '#EF4444' }}>High</span> density
            </span>
          )}
        </div>
      </div>
    </>
  );
}
