import { useState, useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { needs as needsApi, analytics } from '../services/api';
import { Map as MapIcon, RefreshCw, Flame, Search, X, CloudRain, Box } from 'lucide-react';
import {
  getOWMTileUrl, fetchWeatherWithAlerts,
  WEATHER_LAYERS, INDIA_CENTER,
} from '../services/weatherService';

const OWM_API_KEY = import.meta.env.VITE_OWM_API_KEY || '';

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const searchMarkerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const pollRef = useRef(null);
  const weatherPollRef = useRef(null);
  const markersRef = useRef([]);

  const [mapNeeds, setMapNeeds] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');
  const mapStyleRef = useRef(theme === 'dark' ? 'https://tiles.openfreemap.org/styles/dark' : 'https://tiles.openfreemap.org/styles/liberty');

  // Weather state
  const [showWeather, setShowWeather] = useState(false);
  const [activeWeatherLayer, setActiveWeatherLayer] = useState('precipitation_new');
  const [weatherAlert, setWeatherAlert] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: INDIA_CENTER.lat, lng: INDIA_CENTER.lng });

  useEffect(() => { loadMapData(); }, [filter]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const newStyle = theme === 'dark'
      ? 'https://tiles.openfreemap.org/styles/dark'
      : 'https://tiles.openfreemap.org/styles/liberty';

    if (mapStyleRef.current === newStyle) return;
    mapStyleRef.current = newStyle;

    setIsMapLoaded(false);
    map.setStyle(newStyle);

    map.once('style.load', () => {
      setIsMapLoaded(true);
      if (map.getLayer('building-3d')) {
        map.setLayoutProperty('building-3d', 'visibility', map.getPitch() > 0 ? 'visible' : 'none');
        map.setPaintProperty('building-3d', 'fill-extrusion-opacity', 0.88);
      }
    });
  }, [theme]);

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

  // Weather alert fetch
  const loadWeatherAlert = useCallback(async (center = mapCenter) => {
    if (!OWM_API_KEY) return;
    setWeatherLoading(true);
    const result = await fetchWeatherWithAlerts(center.lat, center.lng, OWM_API_KEY);
    if (result) setWeatherAlert(result);
    setWeatherLoading(false);
  }, [mapCenter]);

  // Poll weather every 5 minutes when overlay is on
  useEffect(() => {
    if (!showWeather) {
      if (weatherPollRef.current) clearInterval(weatherPollRef.current);
      return;
    }
    loadWeatherAlert();
    weatherPollRef.current = setInterval(() => loadWeatherAlert(), 5 * 60 * 1000);
    return () => { if (weatherPollRef.current) clearInterval(weatherPollRef.current); };
  }, [showWeather, loadWeatherAlert]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: mapStyleRef.current, // Use dynamic style based on initial theme
      center: [73.5, 22.0],
      zoom: 6,
      minZoom: 3,
      maxZoom: 20,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-left');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-right');
    map.addControl(new maplibregl.FullscreenControl(), 'top-left');

    map.on('load', () => {
      setIsMapLoaded(true);
      if (map.getLayer('building-3d')) {
        map.setLayoutProperty('building-3d', 'visibility', 'none');
        map.setPaintProperty('building-3d', 'fill-extrusion-opacity', 0.88);
      }
    });

    map.on('moveend', () => {
      const c = map.getCenter();
      setMapCenter({ lat: c.lat, lng: c.lng });
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Weather tile layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapLoaded) return;

    if (map.getLayer('weather-layer')) map.removeLayer('weather-layer');
    if (map.getSource('weather')) map.removeSource('weather');

    if (!showWeather || !OWM_API_KEY) return;
    const tileUrl = getOWMTileUrl(activeWeatherLayer, OWM_API_KEY);
    if (tileUrl) {
      map.addSource('weather', {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
      });
      // Add layer just before building-3d if it exists, or just on top
      map.addLayer({
        id: 'weather-layer',
        type: 'raster',
        source: 'weather',
        paint: { 'raster-opacity': 0.65 },
      }, map.getLayer('building-3d') ? 'building-3d' : undefined);
    }
  }, [showWeather, activeWeatherLayer, isMapLoaded]);

  // Heatmap layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapLoaded) return;

    if (map.getLayer('heatmap-layer')) map.removeLayer('heatmap-layer');
    if (map.getSource('heatmap-source')) map.removeSource('heatmap-source');

    if (showHeatmap && heatmapData.length > 0) {
      map.addSource('heatmap-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: heatmapData.map(p => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
            properties: { intensity: p.intensity || 50 }
          }))
        }
      });
      map.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'heatmap-source',
        maxzoom: 17,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'intensity'], 0, 0, 100, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(37,99,235,0)',
            0.2, '#2563EB',
            0.4, '#06B6D4',
            0.6, '#10B981',
            0.8, '#F97316',
            1.0, '#EF4444'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 10, 15, 40],
          'heatmap-opacity': 0.8
        }
      }, map.getLayer('building-3d') ? 'building-3d' : undefined);
    }
  }, [showHeatmap, heatmapData, isMapLoaded]);

  // Need markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (showHeatmap) return; // Hide markers when heatmap is on

    const catColors = {
      medical: '#EF4444', food: '#F97316', shelter: '#3B82F6',
      water: '#06B6D4', rescue: '#A855F7', education: '#10B981',
      clothing: '#EAB308', sanitation: '#14B8A6', other: '#6B7280',
    };

    const bounds = new maplibregl.LngLatBounds();
    let hasPoints = false;

    mapNeeds.forEach(need => {
      const color = catColors[need.category] || '#6B7280';
      const radius = 6 + (need.urgency * 2);

      const el = document.createElement('div');
      el.style.width = `${radius * 2}px`;
      el.style.height = `${radius * 2}px`;
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.opacity = '0.9';
      el.style.border = '2px solid white';
      if (need.urgency >= 4) {
        el.style.boxShadow = `0 0 12px ${color}, 0 0 24px ${color}`;
      }

      let urgencyHtml = '<div style="display:flex;gap:2px;margin-top:2px;">';
      for (let i = 1; i <= 5; i++) {
        urgencyHtml += `<div style="width:6px;height:6px;border-radius:50%;background:${i <= need.urgency ? '#EF4444' : '#ccc'}"></div>`;
      }
      urgencyHtml += '</div>';

      const popup = new maplibregl.Popup({ offset: radius + 2, closeButton: true, maxWidth: '280px' }).setHTML(`
        <div style="font-family: Inter, sans-serif; min-width: 220px; padding: 4px;">
          <h4 style="margin: 0 0 4px; font-size: 14px;">${need.title}</h4>
          <p style="margin: 0; color: #666; font-size: 12px; line-height: 1.5;">
            Category: <strong style="text-transform:capitalize">${need.category}</strong><br/>
            Urgency: ${urgencyHtml} (${need.urgency}/5)<br/>
            People: <strong>${need.people_affected}</strong><br/>
            Status: <strong style="text-transform:capitalize">${need.status}</strong>
          </p>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([need.longitude, need.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([need.longitude, need.latitude]);
      hasPoints = true;
    });

    if (hasPoints && !is3D) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [mapNeeds, showHeatmap, is3D]);

  // 3D Toggle function
  function toggle3D() {
    const map = mapInstanceRef.current;
    if (!map) return;
    const new3D = !is3D;
    setIs3D(new3D);

    if (new3D) {
      const targetZoom = Math.max(map.getZoom(), 15.5);
      map.easeTo({
        pitch: 58,
        bearing: -20,
        zoom: targetZoom,
        duration: 1400,
        easing: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      });
      if (map.getLayer('building-3d')) {
        map.setLayoutProperty('building-3d', 'visibility', 'visible');
      }
    } else {
      map.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
      if (map.getLayer('building-3d')) {
        map.setLayoutProperty('building-3d', 'visibility', 'none');
      }
    }
  }

  // Search
  function handleSearchInput(value) {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!value || value.length < 3) { setSearchResults([]); return; }
    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&countrycodes=in`,
          { headers: { 'User-Agent': 'SevaSetu/1.0' } }
        );
        setSearchResults(await res.json());
      } catch (e) { console.error('Search failed:', e); }
      setSearching(false);
    }, 400);
  }

  function flyToLocation(lat, lon, name) {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo({ center: [lon, lat], zoom: 14, duration: 1500 });

    if (searchMarkerRef.current) searchMarkerRef.current.remove();

    const el = document.createElement('div');
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#FBBF24';
    el.style.border = '3px solid #F59E0B';
    el.style.boxShadow = '0 0 10px rgba(245,158,11,0.6)';

    searchMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([lon, lat])
      .setPopup(new maplibregl.Popup({ offset: 15 }).setHTML(`<b>Location: ${name}</b>`))
      .addTo(map);

    searchMarkerRef.current.togglePopup();

    setSearchQuery(name);
    setSearchResults([]);
    if (showWeather) loadWeatherAlert({ lat, lng: lon });
  }

  const categories = ['medical', 'food', 'shelter', 'water', 'rescue', 'education', 'clothing', 'sanitation'];

  // Styles for MapLibre Popups to match previous Leaflet look
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .maplibregl-popup-content {
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        border: 1px solid var(--border-color);
        padding: 12px;
      }
      .maplibregl-popup-close-button {
        font-size: 16px;
        color: #999;
        padding: 4px 8px;
        right: 0;
        top: 0;
      }
      .maplibregl-popup-close-button:hover {
        background: transparent;
        color: #333;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapIcon size={24} color="var(--accent)" /> Live Crisis Map</h2>
          <div className="subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loading ? 'Loading...' : `${mapNeeds.length} active needs on map`}
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--border-color)', fontFamily: 'monospace' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 4px rgba(34,197,94,0.6)' }}></span> Auto-refresh 30s
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${is3D ? 'btn-primary' : 'btn-outline'}`}
            onClick={toggle3D}
          >
            <Box size={16} /> {is3D ? '2D View' : '3D View'}
          </button>
          <button
            className={`btn ${showWeather ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowWeather(!showWeather)}
          >
            <CloudRain size={16} /> {showWeather ? 'Hide Weather' : 'Weather Overlay'}
          </button>
          <button
            className={`btn ${showHeatmap ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowHeatmap(!showHeatmap)}
          >
            <Flame size={16} /> {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
          </button>
          <button className="btn btn-primary" onClick={loadMapData}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Weather: No API Key notice */}
        {showWeather && !OWM_API_KEY && (
          <div style={{
            marginBottom: '16px', padding: '12px 18px',
            background: 'rgba(100,116,139,0.1)',
            border: '1px solid rgba(100,116,139,0.3)',
            borderRadius: '12px', fontSize: '13px', color: 'var(--text-secondary)',
          }}>
            <CloudRain size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
            Weather overlay needs an API key. Add <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '4px' }}>VITE_OWM_API_KEY=your-key</code> to <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '4px' }}>.env</code> (free at openweathermap.org)
          </div>
        )}

        {/* Weather Alert Banner */}
        {showWeather && weatherAlert && (
          <div style={{
            marginBottom: '16px', padding: '12px 18px',
            background: weatherAlert.bg || 'rgba(16,185,129,0.08)',
            border: `1px solid ${weatherAlert.color || '#10B981'}40`,
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <img
              src={`https://openweathermap.org/img/wn/${weatherAlert.icon || '01d'}@2x.png`}
              alt={weatherAlert.description} style={{ width: 44, height: 44 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: weatherAlert.color }}>
                {weatherAlert.label || 'All Clear'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', textTransform: 'capitalize' }}>
                {weatherAlert.description} &middot; {weatherAlert.temp}&deg;C &middot; Wind: {weatherAlert.wind_speed} km/h &middot; Humidity: {weatherAlert.humidity}%
                {weatherAlert.rain1h > 0 ? ` · Rain: ${weatherAlert.rain1h}mm/h` : ''}
                {weatherAlert.cityName ? ` · ${weatherAlert.cityName}` : ''}
              </div>
            </div>
            {weatherLoading && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Updating...</span>}
            {!OWM_API_KEY && <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '8px' }}>Demo Mode</span>}
          </div>
        )}

        {/* Weather Layer Selector */}
        {showWeather && OWM_API_KEY && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {WEATHER_LAYERS.map(layer => (
              <button
                key={layer.id}
                className={`btn btn-sm ${activeWeatherLayer === layer.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveWeatherLayer(layer.id)}
                title={layer.desc}
                style={{ fontSize: '11px' }}
              >
                {layer.name}
              </button>
            ))}
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="filter-bar">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginRight: '4px' }}>Filter</span>
            <button className={`btn btn-sm ${!filter ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('')} style={{ borderRadius: '20px' }}>All</button>
            {categories.map(cat => {
              const catColors = {
                medical: '#EF4444', food: '#F97316', shelter: '#3B82F6',
                water: '#06B6D4', rescue: '#A855F7', education: '#10B981',
                clothing: '#EAB308', sanitation: '#14B8A6',
              };
              return (
                <button
                  key={cat}
                  className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setFilter(filter === cat ? '' : cat)}
                  style={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '20px', borderColor: filter === cat ? catColors[cat] : '', background: filter === cat ? catColors[cat] : '' }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: filter === cat ? '#fff' : catColors[cat] }}></span>
                  {cat}
                </button>
              )
            })}
          </div>

          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0 12px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search location (e.g. Dharavi, Mumbai, Vadodara)"
                value={searchQuery}
                onChange={e => handleSearchInput(e.target.value)}
                style={{
                  flex: 1, padding: '10px 4px', border: 'none', background: 'transparent',
                  color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
                }}
              />
              {searchQuery && (
                <button className="btn" onClick={() => {
                  setSearchQuery(''); setSearchResults([]);
                  if (searchMarkerRef.current) {
                    searchMarkerRef.current.remove();
                    searchMarkerRef.current = null;
                  }
                }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px' }}>
                  <X size={24} />
                </button>
              )}
            </div>
            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: '10px', marginTop: '4px', overflow: 'hidden',
                boxShadow: 'var(--shadow-card)',
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
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontWeight: 600 }}>Location: {r.display_name.split(',').slice(0, 2).join(', ')}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {r.display_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {searching && (
              <div style={{ position: 'absolute', right: '40px', top: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>Searching...</div>
            )}
          </div>
        </div>

        {/* Map Card */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ padding: '20px 24px 16px', margin: 0, borderBottom: '1px solid var(--border-color)' }}>
            <span className="card-title">Interactive Live Map</span>
          </div>
          <div className="map-container" style={{ position: 'relative', height: '600px', width: '100%', border: 'none', borderRadius: '0' }}>
            <div ref={mapRef} style={{ height: '100%', width: '100%', zIndex: 1 }}></div>

            {/* Stats Panel */}
            <div style={{
              position: 'absolute', top: '16px', right: '16px', background: theme === 'dark' ? 'rgba(21, 26, 37, 0.85)' : 'rgba(255,255,255,0.95)',
              border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px 16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)', backdropFilter: 'blur(8px)', zIndex: 500, minWidth: '180px',
              color: 'var(--text-primary)'
            }}>
              <h4 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 10px 0' }}>Active Needs</h4>
              {categories.map(cat => {
                const count = mapNeeds.filter(n => n.category === cat).length;
                const catColors = {
                  medical: '#EF4444', food: '#F97316', shelter: '#3B82F6',
                  water: '#06B6D4', rescue: '#A855F7', education: '#10B981',
                  clothing: '#EAB308', sanitation: '#14B8A6',
                };
                return (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'capitalize' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: catColors[cat] || '#6B7280' }}></span>
                      {cat}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Floating Legend */}
            <div style={{
              position: 'absolute', bottom: '28px', left: '16px', background: theme === 'dark' ? 'rgba(21, 26, 37, 0.85)' : 'rgba(255,255,255,0.95)',
              border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)', backdropFilter: 'blur(8px)', display: 'flex', flexWrap: 'wrap',
              gap: '8px 14px', maxWidth: '560px', zIndex: 500, color: 'var(--text-primary)'
            }}>
              {categories.map(cat => {
                const catColors = {
                  medical: '#EF4444', food: '#F97316', shelter: '#3B82F6',
                  water: '#06B6D4', rescue: '#A855F7', education: '#10B981',
                  clothing: '#EAB308', sanitation: '#14B8A6',
                };
                return (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 500, textTransform: 'capitalize' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: catColors[cat] || '#6B7280' }}></span>
                    {cat}
                  </div>
                );
              })}
              <div style={{ width: '1px', background: 'var(--border-color)', alignSelf: 'stretch' }}></div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #6b7280', background: 'transparent' }}></span>
                Large = High urgency
              </div>
              {is3D && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  🏢 3D buildings visible at zoom 14+
                </div>
              )}
              {showWeather && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CloudRain size={12} color="var(--accent)" /> Weather active
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
