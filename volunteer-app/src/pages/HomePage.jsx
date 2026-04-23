import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { volunteer } from '../services/api';
import { Hand, Star, ClipboardList, CheckCircle2, Zap, AlertTriangle, Settings, Stethoscope, Utensils, Home, Droplets, Siren, BookOpen, Shirt, Trash2 } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const prof = await volunteer.getMyProfile();
      setProfile(prof);
      const t = await volunteer.getMyTasks(prof.id, { status: 'assigned' });
      setTasks(t);
    } catch (err) {
      console.log('Profile not set up yet:', err.message);
    }
    setLoading(false);
  }

  const catIcons = { medical: Stethoscope, food: Utensils, shelter: Home, water: Droplets, rescue: Siren, education: BookOpen, clothing: Shirt, sanitation: Trash2, other: ClipboardList };

  if (loading) return <div className="vol-loading"><div className="vol-spinner"></div>Loading...</div>;

  return (
    <>
      <div className="vol-page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Hi, {user?.name?.split(' ')[0] || 'Volunteer'} <Hand size={24} color="#f59e0b" /></h1>
        <div className="subtitle">
          {profile ? (
            <span className={`vol-badge ${profile.availability}`}>{profile.availability}</span>
          ) : 'Set up your profile to get started'}
        </div>
      </div>

      <div className="vol-page">
        {/* Stats */}
        {profile && (
          <div className="vol-stat-row">
            <div className="vol-stat">
              <div className="num" style={{ color: 'var(--accent)' }}>{profile.tasks_completed}</div>
              <div className="label">Tasks Done</div>
            </div>
            <div className="vol-stat">
              <div className="num" style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Star size={20} fill="currentColor" /> {profile.rating?.toFixed(1) || '0.0'}</div>
              <div className="label">Rating</div>
            </div>
          </div>
        )}

        {/* Active Tasks */}
        <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ClipboardList size={18} /> Active Tasks {tasks.length > 0 && `(${tasks.length})`}
        </h3>

        {tasks.length === 0 ? (
          <div className="vol-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: 'var(--accent-green)' }}><CheckCircle2 size={48} /></div>
            <p>No active tasks. You're all caught up!</p>
          </div>
        ) : (
          tasks.map(task => {
            const CatIcon = catIcons[task.need_category] || ClipboardList;
            return (
            <div className="task-card" key={task.id}>
              <div className="task-icon" style={{ background: 'rgba(26,115,232,0.1)', color: 'var(--accent)' }}>
                <CatIcon size={20} />
              </div>
              <div className="task-info" style={{ flex: 1 }}>
                <h3>{task.need_title || 'Task'}</h3>
                <div className="task-meta">
                  {task.need_category} · {task.distance_km?.toFixed(1)} km away
                </div>
                <span className={`vol-badge ${task.status}`} style={{ marginTop: '4px', display: 'inline-block' }}>{task.status}</span>
              </div>
            </div>
          )})
        )}

        {/* Quick Actions */}
        <h3 style={{ fontSize: '16px', margin: '20px 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={18} /> Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button className="vol-btn outline" onClick={() => window.location.href = '/report'}><AlertTriangle size={16} /> Report Need</button>
          <button className="vol-btn outline" onClick={() => window.location.href = '/profile'}><Settings size={16} /> My Profile</button>
        </div>
      </div>
    </>
  );
}
