import { useState, useEffect } from 'react';
import { analytics } from '../services/api';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [sum, cats] = await Promise.all([
        analytics.getSummary(),
        analytics.getCategories(),
      ]);
      setSummary(sum);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <>
        <div className="page-header">
          <div><h2>Dashboard</h2><div className="subtitle">Command center overview</div></div>
        </div>
        <div className="page-body"><div className="loading"><div className="spinner"></div> Loading dashboard...</div></div>
      </>
    );
  }

  const s = summary || {};

  const statCards = [
    { icon: '📋', label: 'Total Needs', value: s.total_needs || 0, color: 'blue' },
    { icon: '🔴', label: 'Open Needs', value: s.open_needs || 0, color: 'red' },
    { icon: '✅', label: 'Resolved', value: s.resolved_needs || 0, color: 'green' },
    { icon: '🙋', label: 'Total Volunteers', value: s.total_volunteers || 0, color: 'purple' },
    { icon: '🟢', label: 'Active Volunteers', value: s.active_volunteers || 0, color: 'green' },
    { icon: '👥', label: 'People Helped', value: s.people_helped || 0, color: 'cyan' },
  ];

  const catIcons = { medical: '🏥', food: '🍚', shelter: '🏠', water: '💧', rescue: '🚨', education: '📚', clothing: '👕', sanitation: '🧹', other: '📋' };
  const catColors = { medical: '#EF4444', food: '#F97316', shelter: '#3B82F6', water: '#06B6D4', rescue: '#A855F7', education: '#10B981', clothing: '#EAB308', sanitation: '#14B8A6', other: '#6B7280' };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <div className="subtitle">Real-time command center for volunteer coordination</div>
        </div>
        <button className="btn btn-primary" onClick={loadData}>↻ Refresh</button>
      </div>

      <div className="page-body">
        {/* Stats Grid */}
        <div className="stats-grid">
          {statCards.map((card, i) => (
            <div className="stat-card" key={i}>
              <div className={`stat-icon ${card.color}`}>{card.icon}</div>
              <div className="stat-info">
                <h3>{card.value}</h3>
                <div className="stat-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Response Time & AI Summary - side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Category Breakdown */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Needs by Category</span>
            </div>
            {categories.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px' }}>No data yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {categories.map(cat => {
                  const maxCount = Math.max(...categories.map(c => c.count), 1);
                  const pct = (cat.count / maxCount) * 100;
                  return (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span>{catIcons[cat.category] || '📋'} {cat.category}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{cat.count} ({cat.open_count} open)</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: catColors[cat.category] || '#6B7280', borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Performance Metrics</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Avg Response Time</span>
                <span style={{ fontWeight: 700, fontSize: '18px' }}>
                  {s.avg_response_time_hours ? `${s.avg_response_time_hours}h` : '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Assignments Active</span>
                <span style={{ fontWeight: 700, fontSize: '18px' }}>{s.in_progress_needs || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Completed Tasks</span>
                <span style={{ fontWeight: 700, fontSize: '18px' }}>{s.completed_assignments || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Busy Volunteers</span>
                <span style={{ fontWeight: 700, fontSize: '18px' }}>{s.busy_volunteers || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Resolution Rate</span>
                <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--accent-green)' }}>
                  {s.total_needs > 0 ? `${Math.round((s.resolved_needs / s.total_needs) * 100)}%` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
