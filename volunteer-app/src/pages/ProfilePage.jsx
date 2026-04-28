import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { volunteer } from '../services/api';
import {
  Sun, Moon, CheckCircle2, Clock, XCircle, Save, LogOut,
  MapPin, Phone, Car, Zap, Star, Award, User as UserIcon,
  Navigation, Loader
} from 'lucide-react';

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('sa-theme') || 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sa-theme', theme);
  }, [theme]);
  return [theme, setTheme];
}

const ALL_SKILLS = [
  { id: 'medical',      label: 'Medical',       emoji: '🩺' },
  { id: 'first_aid',   label: 'First Aid',     emoji: '🚑' },
  { id: 'nursing',     label: 'Nursing',        emoji: '💉' },
  { id: 'cooking',     label: 'Cooking',        emoji: '🍳' },
  { id: 'driving',     label: 'Driving',        emoji: '🚗' },
  { id: 'logistics',   label: 'Logistics',      emoji: '📦' },
  { id: 'construction',label: 'Construction',   emoji: '🏗️' },
  { id: 'teaching',    label: 'Teaching',       emoji: '📚' },
  { id: 'counseling',  label: 'Counseling',     emoji: '🧠' },
  { id: 'swimming',    label: 'Swimming',       emoji: '🏊' },
  { id: 'cleaning',    label: 'Cleaning',       emoji: '🧹' },
  { id: 'it_support',  label: 'IT Support',     emoji: '💻' },
  { id: 'translation', label: 'Translation',    emoji: '🌐' },
  { id: 'childcare',   label: 'Childcare',      emoji: '👶' },
  { id: 'elderly_care',label: 'Elderly Care',   emoji: '👴' },
  { id: 'mental_health',label: 'Mental Health', emoji: '🌿' },
];

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: 'rgba(16,185,129,0.95)', border: '#10b981' },
    error:   { bg: 'rgba(239,68,68,0.95)',  border: '#ef4444' },
  };
  const c = colors[type] || colors.success;

  return (
    <div style={{
      position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, background: c.bg, color: '#fff',
      padding: '12px 20px', borderRadius: '14px',
      boxShadow: `0 8px 24px rgba(0,0,0,0.25), 0 0 0 1px ${c.border}40`,
      fontSize: '13px', fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: '8px',
      backdropFilter: 'blur(10px)',
      animation: 'toastIn 0.3s cubic-bezier(0.21,1.02,0.73,1)',
      maxWidth: '90vw',
    }}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      {message}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translate(-50%,-12px); } to { opacity:1; transform:translate(-50%,0); } }`}</style>
    </div>
  );
}

function ProfileCompletion({ form, profile }) {
  const checks = [
    { label: 'Phone added',       done: !!form.phone },
    { label: 'Skills selected',   done: form.skills.length > 0 },
    { label: 'Address set',       done: !!form.address },
    { label: 'Location detected', done: !!(form.latitude && form.longitude) },
    { label: 'Availability set',  done: !!(profile?.availability && profile.availability !== 'offline') },
  ];
  const done = checks.filter(c => c.done).length;
  const pct = Math.round((done / checks.length) * 100);
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#3b82f6';

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      borderRadius: '20px', padding: '18px', marginBottom: '16px',
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={18} color={color} />
          <span style={{ fontWeight: 700, fontSize: '14px' }}>Profile Completion</span>
        </div>
        <span style={{ fontSize: '20px', fontWeight: 900, color }}>{pct}%</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: '6px', background: 'var(--bg-input)', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: '3px', transition: 'width 0.6s ease',
          boxShadow: `0 0 8px ${color}60`,
        }} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {checks.map(c => (
          <span key={c.label} style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '11px', fontWeight: 600, padding: '3px 10px',
            borderRadius: '20px',
            background: c.done ? 'rgba(16,185,129,0.1)' : 'var(--bg-input)',
            color: c.done ? '#10b981' : 'var(--text-muted)',
          }}>
            {c.done ? <CheckCircle2 size={11} /> : <Clock size={11} />}
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [theme, setTheme] = useTheme();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    phone: '', skills: [], has_vehicle: false,
    vehicle_type: 'none', address: '', latitude: null, longitude: null,
  });

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const prof = await volunteer.getMyProfile();
      setProfile(prof);
      setForm({
        phone: prof.phone || '',
        skills: prof.skills || [],
        has_vehicle: prof.has_vehicle || false,
        vehicle_type: prof.vehicle_type || 'none',
        address: prof.address || '',
        latitude: prof.latitude || null,
        longitude: prof.longitude || null,
      });
    } catch (err) {
      // Profile not set up yet — show empty form so user can fill in
      console.log('No profile yet:', err.message);
    }
    setLoading(false);
  }

  async function detectLocation() {
    if (!navigator.geolocation) return showToast('Geolocation not supported', 'error');
    setGeoLoading(true);
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 8000 })
      );
      const { latitude, longitude } = pos.coords;
      // Reverse geocode for address
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
          headers: { 'User-Agent': 'SevaSetu/1.0' }
        });
        const data = await r.json();
        const addr = data.display_name?.split(',').slice(0, 3).join(', ') || '';
        setForm(f => ({ ...f, latitude, longitude, address: addr || f.address }));
      } catch {
        setForm(f => ({ ...f, latitude, longitude }));
      }
      showToast('Location detected!', 'success');
    } catch {
      showToast('Could not detect location. Please enter manually.', 'error');
    }
    setGeoLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const data = { ...form };
      if (!data.has_vehicle) data.vehicle_type = 'none';
      else if (data.vehicle_type === 'none') data.vehicle_type = 'bike';
      await volunteer.setup(data);
      await loadProfile();
      showToast('Profile saved successfully! 🎉', 'success');
    } catch (err) {
      showToast('Save failed: ' + err.message, 'error');
    }
    setSaving(false);
  }

  async function toggleAvailability(status) {
    if (!profile) return;
    try {
      await volunteer.updateAvailability(profile.id, { availability: status });
      setProfile(p => ({ ...p, availability: status }));
      showToast(`Status set to ${status}`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function toggleSkill(skillId) {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skillId)
        ? f.skills.filter(s => s !== skillId)
        : [...f.skills, skillId],
    }));
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
  }

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <div className="vol-spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Loading profile…</span>
      </div>
    );
  }

  const availColors = {
    available: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: '#10b98130' },
    busy:      { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '#f59e0b30' },
    offline:   { bg: 'rgba(100,116,139,0.12)',color: '#64748b', border: '#64748b30' },
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{
        padding: '24px 20px 20px',
        background: 'linear-gradient(135deg, var(--bg-card), var(--bg-primary))',
        borderBottom: '1px solid var(--border-color)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '120px', height: '120px', background: 'var(--accent)', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.15 }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Avatar */}
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: 800, color: '#fff',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
          }}>
            {user?.name?.[0]?.toUpperCase() || <UserIcon size={24} />}
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
              {user?.name || 'My Profile'}
            </h1>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.email}</div>
            {profile && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                marginTop: '6px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                background: availColors[profile.availability]?.bg,
                color: availColors[profile.availability]?.color,
                border: `1px solid ${availColors[profile.availability]?.border}`,
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 6px currentColor' }} />
                {profile.availability?.toUpperCase()}
                {profile.tasks_completed > 0 && (
                  <span style={{ marginLeft: '6px', opacity: 0.8 }}>· {profile.tasks_completed} tasks</span>
                )}
                {profile.rating > 0 && (
                  <span style={{ marginLeft: '6px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Star size={10} fill="currentColor" /> {profile.rating?.toFixed(1)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Theme Toggle */}
        <div className="vol-theme-toggle">
          <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Sun size={13} /> Light
          </button>
          <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Moon size={13} /> Dark
          </button>
        </div>

        {/* Profile Completion */}
        <ProfileCompletion form={form} profile={profile} />

        {/* Availability Status */}
        {profile && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: '20px', padding: '18px', boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Availability Status
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'available', label: 'Available', icon: CheckCircle2, color: '#10b981' },
                { id: 'busy',      label: 'Busy',      icon: Clock,        color: '#f59e0b' },
                { id: 'offline',   label: 'Offline',   icon: XCircle,      color: '#64748b' },
              ].map(({ id, label, icon: Icon, color }) => {
                const isActive = profile.availability === id;
                return (
                  <button key={id} onClick={() => toggleAvailability(id)} style={{
                    flex: 1, padding: '10px 6px', border: `1.5px solid ${isActive ? color : 'var(--border-color)'}`,
                    borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s',
                    background: isActive ? `${color}15` : 'transparent',
                    color: isActive ? color : 'var(--text-muted)',
                    fontSize: '12px', fontWeight: 700,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                  }}>
                    <Icon size={18} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Phone */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: '20px', padding: '18px', boxShadow: 'var(--shadow-card)',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            <Phone size={13} /> Contact Number
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>+91</span>
            <input
              className="vol-form-input"
              type="tel"
              placeholder="9876543210"
              value={form.phone.replace(/^\+91/, '')}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              style={{ paddingLeft: '42px' }}
            />
          </div>
        </div>

        {/* Skills */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: '20px', padding: '18px', boxShadow: 'var(--shadow-card)',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            <Zap size={13} /> Skills
            <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#fff', fontSize: '10px', padding: '1px 8px', borderRadius: '10px' }}>
              {form.skills.length} selected
            </span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {ALL_SKILLS.map(skill => {
              const active = form.skills.includes(skill.id);
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill.id)}
                  style={{
                    padding: '6px 14px', borderRadius: '20px',
                    border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border-color)'}`,
                    background: active ? 'rgba(59,130,246,0.12)' : 'var(--bg-input)',
                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: '5px',
                    transform: active ? 'scale(1.04)' : 'scale(1)',
                    boxShadow: active ? '0 2px 8px rgba(59,130,246,0.2)' : 'none',
                  }}
                >
                  <span>{skill.emoji}</span> {skill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vehicle */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: '20px', padding: '18px', boxShadow: 'var(--shadow-card)',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            <Car size={13} /> Vehicle
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '10px' }}>
            <div style={{
              width: '44px', height: '24px', borderRadius: '12px', position: 'relative', cursor: 'pointer',
              background: form.has_vehicle ? 'var(--accent)' : 'var(--bg-input)',
              border: '1.5px solid var(--border-color)', transition: 'all 0.2s',
              flexShrink: 0,
            }} onClick={() => setForm({ ...form, has_vehicle: !form.has_vehicle })}>
              <div style={{
                position: 'absolute', width: '18px', height: '18px', borderRadius: '50%',
                background: '#fff', top: '2px', transition: 'left 0.2s',
                left: form.has_vehicle ? '22px' : '2px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>I have a vehicle</span>
          </label>
          {form.has_vehicle && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'bike', label: '🛵 Bike' },
                { id: 'car',  label: '🚗 Car'  },
                { id: 'van',  label: '🚐 Van'  },
                { id: 'truck',label: '🚛 Truck' },
              ].map(v => {
                const active = form.vehicle_type === v.id;
                return (
                  <button key={v.id} onClick={() => setForm({ ...form, vehicle_type: v.id })} style={{
                    flex: 1, minWidth: '70px', padding: '10px 6px', borderRadius: '14px',
                    border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border-color)'}`,
                    background: active ? 'rgba(59,130,246,0.12)' : 'var(--bg-input)',
                    color: active ? 'var(--accent)' : 'var(--text-primary)',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
                  }}>
                    {v.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Location */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: '20px', padding: '18px', boxShadow: 'var(--shadow-card)',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            <MapPin size={13} /> Location
          </label>
          <input
            className="vol-form-input"
            placeholder="Your locality / area"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            style={{ marginBottom: '10px' }}
          />
          <button
            onClick={detectLocation}
            disabled={geoLoading}
            style={{
              width: '100%', padding: '11px', borderRadius: '12px',
              border: '1.5px solid var(--accent)',
              background: form.latitude ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.08)',
              color: form.latitude ? '#10b981' : 'var(--accent)',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            {geoLoading
              ? <><Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Detecting…</>
              : form.latitude
                ? <><CheckCircle2 size={15} /> Location Detected</>
                : <><Navigation size={15} /> Auto-Detect My Location</>
            }
          </button>
          {form.latitude && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
              📍 {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
            </div>
          )}
        </div>

        {/* Save */}
        <button
          className="vol-btn primary"
          onClick={handleSave}
          disabled={saving}
          style={{ borderRadius: '16px', padding: '14px', fontSize: '15px' }}
        >
          {saving
            ? <><Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving…</>
            : <><Save size={16} /> Save Profile</>
          }
        </button>

        {/* Logout */}
        <button
          className="vol-btn outline"
          onClick={logout}
          style={{ borderRadius: '16px', padding: '12px', color: 'var(--accent-red)', borderColor: 'rgba(239,68,68,0.3)' }}
        >
          <LogOut size={16} /> Logout
        </button>

        <div style={{ height: '8px' }} />
      </div>
    </>
  );
}
