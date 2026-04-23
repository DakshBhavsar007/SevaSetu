import { useState, useEffect } from 'react';
import { volunteers } from '../services/api';
import { Users, CheckCircle2, Clock, XCircle, Car, Star } from 'lucide-react';

export default function VolunteersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { loadVolunteers(); }, [filter]);

  async function loadVolunteers() {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.availability = filter;
      const res = await volunteers.list(params);
      setData(res);
    } catch (err) {
      console.error('Failed to load volunteers:', err);
    }
    setLoading(false);
  }

  return (
    <>
      <div className="page-header">
        <div><h2><Users size={22} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Volunteers</h2><div className="subtitle">{data.length} registered volunteers</div></div>
      </div>

      <div className="page-body">
        <div className="filter-bar">
          <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div> Loading...</div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}><Users size={48} /></div>
            <p>No volunteers found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Skills</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Tasks Done</th>
                  <th>Rating</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {data.map(vol => (
                  <tr key={vol.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{vol.user_name || 'Unknown'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{vol.user_email}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(vol.skills || []).slice(0, 3).map(s => (
                          <span key={s} style={{
                            fontSize: '10px', padding: '2px 8px', borderRadius: '12px',
                            background: 'rgba(59,130,246,0.15)', color: 'var(--accent)',
                          }}>{s}</span>
                        ))}
                        {(vol.skills || []).length > 3 && (
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+{vol.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>{vol.has_vehicle ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Car size={14} /> {vol.vehicle_type || ''}</span> : '—'}</td>
                    <td>
                      <span className={`badge badge-${vol.availability}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {vol.availability === 'available' ? <CheckCircle2 size={12} /> : vol.availability === 'busy' ? <Clock size={12} /> : <XCircle size={12} />}
                        {vol.availability}
                      </span>
                    </td>
                    <td>{vol.tasks_completed}</td>
                    <td>
                      <span style={{ color: vol.rating >= 4 ? 'var(--accent-green)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={14} fill={vol.rating >= 4 ? 'currentColor' : 'none'} /> {vol.rating?.toFixed(1) || '0.0'}
                      </span>
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {vol.address || (vol.latitude ? `${vol.latitude?.toFixed(3)}, ${vol.longitude?.toFixed(3)}` : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
