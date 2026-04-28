import { useState, useEffect, useRef } from 'react';
import { volunteers } from '../services/api';
import {
  Users, CheckCircle2, Clock, XCircle, Car, Star,
  RefreshCw, MapPin, Phone, Zap, UserPlus, Search
} from 'lucide-react';

const STATUS_CONFIG = {
  available: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2, label: 'Available' },
  busy:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: Clock,        label: 'Busy' },
  offline:   { color: '#64748b', bg: 'rgba(100,116,139,0.1)', icon: XCircle,      label: 'Offline' },
};

const SKILL_COLORS = [
  'rgba(59,130,246,0.15)', 'rgba(139,92,246,0.15)', 'rgba(16,185,129,0.15)',
  'rgba(245,158,11,0.15)', 'rgba(239,68,68,0.15)',   'rgba(6,182,212,0.15)',
];

function VolunteerCard({ vol, isNew }) {
  const cfg = STATUS_CONFIG[vol.availability] || STATUS_CONFIG.offline;
  const Icon = cfg.icon;
  const initials = (vol.user_name || 'V').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  const avatarColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
  const avatarColor = avatarColors[(vol.user_name?.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${isNew ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`,
      borderRadius: '20px',
      padding: '20px',
      boxShadow: isNew
        ? '0 4px 20px rgba(16,185,129,0.12), var(--shadow-card)'
        : 'var(--shadow-card)',
      transition: 'all 0.25s',
      position: 'relative',
      overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isNew ? '0 4px 20px rgba(16,185,129,0.12), var(--shadow-card)' : 'var(--shadow-card)'; }}
    >
      {/* "NEW" badge */}
      {isNew && (
        <div style={{
          position: 'absolute', top: '14px', right: '14px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#fff', fontSize: '9px', fontWeight: 800,
          padding: '3px 8px', borderRadius: '20px',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          boxShadow: '0 2px 8px rgba(16,185,129,0.4)',
          animation: 'newPulse 2s ease-in-out infinite',
        }}>
          NEW
        </div>
      )}

      {/* Top row: avatar + name + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
        {/* Avatar */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}aa)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: 800, color: '#fff',
          boxShadow: `0 4px 12px ${avatarColor}40`,
        }}>
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {vol.user_name || 'Unknown'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {vol.user_email}
          </div>
        </div>

        {/* Status badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          background: cfg.bg, color: cfg.color,
          padding: '4px 10px', borderRadius: '20px',
          fontSize: '11px', fontWeight: 700,
          flexShrink: 0,
        }}>
          <Icon size={11} />
          {cfg.label}
        </span>
      </div>

      {/* Skills */}
      {vol.skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
          {vol.skills.slice(0, 5).map((s, i) => (
            <span key={s} style={{
              fontSize: '10px', padding: '3px 9px', borderRadius: '12px', fontWeight: 600,
              background: SKILL_COLORS[i % SKILL_COLORS.length],
              color: 'var(--text-secondary)',
            }}>
              {s.replace('_', ' ')}
            </span>
          ))}
          {vol.skills.length > 5 && (
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', padding: '3px 0' }}>
              +{vol.skills.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Stats row */}
      <div style={{
        display: 'flex', gap: '8px',
        padding: '10px 0', borderTop: '1px solid var(--border-color)',
      }}>
        {/* Tasks */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)' }}>{vol.tasks_completed}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '1px' }}>Tasks</div>
        </div>

        {/* Rating */}
        <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color: vol.rating >= 4 ? '#10b981' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
            {vol.rating?.toFixed(1) || '—'}
            {vol.rating >= 4 && <Star size={13} fill="currentColor" />}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '1px' }}>Rating</div>
        </div>

        {/* Vehicle */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {vol.has_vehicle ? <Car size={18} color="var(--accent)" /> : <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>—</span>}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '1px' }}>
            {vol.has_vehicle ? (vol.vehicle_type || 'Vehicle') : 'No vehicle'}
          </div>
        </div>
      </div>

      {/* Location */}
      {(vol.address || vol.latitude) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <MapPin size={12} />
          {vol.address || `${vol.latitude?.toFixed(3)}, ${vol.longitude?.toFixed(3)}`}
        </div>
      )}

      <style>{`
        @keyframes newPulse {
          0%, 100% { box-shadow: 0 2px 8px rgba(16,185,129,0.4); }
          50% { box-shadow: 0 2px 16px rgba(16,185,129,0.7); }
        }
      `}</style>
    </div>
  );
}

export default function VolunteersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [newIds, setNewIds] = useState(new Set());
  const prevIdsRef = useRef(new Set());
  const pollRef = useRef(null);

  useEffect(() => {
    loadVolunteers();
    // Auto-refresh every 15 seconds to catch new registrations
    pollRef.current = setInterval(() => loadVolunteers(true), 15000);
    return () => clearInterval(pollRef.current);
  }, []); // Only fetch on mount and refresh, not on filter change

  async function loadVolunteers(silent = false) {
    if (!silent) setLoading(true);
    try {
      const res = await volunteers.list();

      // Detect newly added volunteers
      const currentIds = new Set(res.map(v => v.id));
      const newlyAdded = new Set([...currentIds].filter(id => !prevIdsRef.current.has(id) && prevIdsRef.current.size > 0));
      if (newlyAdded.size > 0) setNewIds(prev => new Set([...prev, ...newlyAdded]));
      prevIdsRef.current = currentIds;

      setData(res);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load volunteers:', err);
    }
    if (!silent) setLoading(false);
  }

  const filtered = data.filter(v => {
    // 1. Status Filter
    if (filter && v.availability !== filter) return false;

    // 2. Search Filter
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (v.user_name || '').toLowerCase().includes(q) ||
      (v.user_email || '').toLowerCase().includes(q) ||
      (v.address || '').toLowerCase().includes(q) ||
      (v.skills || []).some(s => s.toLowerCase().includes(q))
    );
  });

  const counts = {
    all: data.length,
    available: data.filter(v => v.availability === 'available').length,
    busy: data.filter(v => v.availability === 'busy').length,
    offline: data.filter(v => v.availability === 'offline').length,
  };

  const statusChips = [
    { key: '',          label: 'All',       count: counts.all,       color: 'var(--accent)'     },
    { key: 'available', label: 'Available', count: counts.available, color: '#10b981'            },
    { key: 'busy',      label: 'Busy',      count: counts.busy,      color: '#f59e0b'            },
    { key: 'offline',   label: 'Offline',   count: counts.offline,   color: 'var(--text-muted)' },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={22} color="var(--accent)" /> Volunteers
          </h2>
          <div className="subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {data.length} registered volunteers
            {lastRefreshed && (
              <span style={{
                fontSize: '11px', color: 'var(--text-muted)',
                background: 'var(--bg-card)', padding: '2px 8px',
                borderRadius: '12px', border: '1px solid var(--border-color)',
                display: 'inline-flex', alignItems: 'center', gap: '4px',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 4px #22c55e80' }} />
                Live · {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-color)' }}>
            {['grid', 'table'].map(v => (
              <button key={v} onClick={() => setViewMode(v)} style={{
                padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
                background: viewMode === v ? 'var(--bg-secondary)' : 'transparent',
                color: viewMode === v ? 'var(--accent)' : 'var(--text-muted)',
                boxShadow: viewMode === v ? 'var(--shadow-xs)' : 'none',
              }}>
                {v === 'grid' ? '⊞ Grid' : '☰ Table'}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => loadVolunteers()}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      <div className="page-body">

        {/* Summary stat chips */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {statusChips.map(chip => (
            <button key={chip.key} onClick={() => setFilter(chip.key)} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
              border: `1.5px solid ${filter === chip.key ? chip.color : 'var(--border-color)'}`,
              background: filter === chip.key ? `${chip.color}15` : 'var(--bg-card)',
              color: filter === chip.key ? chip.color : 'var(--text-secondary)',
              fontSize: '13px', fontWeight: 600, transition: 'all 0.18s',
              boxShadow: 'var(--shadow-xs)',
            }}>
              <span style={{
                background: chip.color, color: '#fff',
                borderRadius: '10px', padding: '0 6px', fontSize: '11px', fontWeight: 800,
              }}>
                {chip.count}
              </span>
              {chip.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: '12px', padding: '0 14px', marginBottom: '20px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by name, email, location or skill…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, padding: '12px 4px', border: 'none', background: 'transparent',
              color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
            }}
          />
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading volunteers…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '16px' }}>
              <UserPlus size={48} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>No volunteers found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {search ? 'Try a different search term.' : 'Volunteers will appear here once they sign up and log in.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid view */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
            {filtered.map(vol => (
              <VolunteerCard key={vol.id} vol={vol} isNew={newIds.has(vol.id)} />
            ))}
          </div>
        ) : (
          /* Table view */
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Skills</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Tasks</th>
                  <th>Rating</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(vol => {
                  const cfg = STATUS_CONFIG[vol.availability] || STATUS_CONFIG.offline;
                  const StatusIcon = cfg.icon;
                  const initials = (vol.user_name || 'V').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
                  const avatarColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
                  const avatarColor = avatarColors[(vol.user_name?.charCodeAt(0) || 0) % avatarColors.length];

                  return (
                    <tr key={vol.id} style={{ position: 'relative' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                            background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}99)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: 800, color: '#fff',
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {vol.user_name || 'Unknown'}
                              {newIds.has(vol.id) && (
                                <span style={{ fontSize: '9px', background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: '8px', fontWeight: 800 }}>NEW</span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{vol.user_email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {(vol.skills || []).slice(0, 3).map((s, i) => (
                            <span key={s} style={{
                              fontSize: '10px', padding: '2px 8px', borderRadius: '12px', fontWeight: 600,
                              background: SKILL_COLORS[i % SKILL_COLORS.length], color: 'var(--text-secondary)',
                            }}>{s.replace('_', ' ')}</span>
                          ))}
                          {(vol.skills || []).length > 3 && (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+{vol.skills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td>{vol.has_vehicle ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)' }}><Car size={14} /> {vol.vehicle_type}</span> : '—'}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: cfg.bg, color: cfg.color,
                          padding: '4px 10px', borderRadius: '20px',
                          fontSize: '11px', fontWeight: 700,
                        }}>
                          <StatusIcon size={11} /> {cfg.label}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{vol.tasks_completed}</td>
                      <td>
                        <span style={{ color: vol.rating >= 4 ? '#10b981' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={13} fill={vol.rating >= 4 ? 'currentColor' : 'none'} />
                          {vol.rating?.toFixed(1) || '0.0'}
                        </span>
                      </td>
                      <td style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {vol.address ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={11} /> {vol.address}
                          </span>
                        ) : vol.latitude ? `${vol.latitude.toFixed(3)}, ${vol.longitude.toFixed(3)}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}