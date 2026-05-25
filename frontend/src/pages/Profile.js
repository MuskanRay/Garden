// src/pages/Profile.js
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../utils/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', location: user?.location || '' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await usersAPI.updateProfile(form);
      updateUser(data);
      toast.success('Profile updated! 🌿');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <AppLayout title="Profile">
      <div className="page-header">
        <h1>👤 My Profile</h1>
        <p>Manage your account and preferences</p>
      </div>

      <div style={{ maxWidth: 560 }}>
        {/* Avatar section */}
        <div className="card" style={{ marginBottom: 20, textAlign: 'center', padding: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--green-500), var(--green-700))',
            color: 'white', fontSize: 28, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            {initials}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>{user?.name}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user?.email}</div>
          <span style={{ display: 'inline-block', marginTop: 8 }} className={`badge ${user?.role === 'admin' ? 'badge-ok' : 'badge-recently-watered'}`}>
            {user?.role === 'admin' ? '⚙️ Admin' : '🌿 Gardener'}
          </span>
        </div>

        {/* Edit form */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 20 }}>Edit Profile</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed</div>
            </div>
            <div className="form-group">
              <label className="form-label">City (for weather)</label>
              <input className="form-control" placeholder="New Delhi" value={form.location} onChange={set('location')} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Saving…' : '✅ Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
