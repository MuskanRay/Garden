// src/pages/AdminPanel.js
import React, { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { adminAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [plants, setPlants] = useState([]);
  const [tab, setTab]       = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return; }
    Promise.all([adminAPI.stats(), adminAPI.users(), adminAPI.plants()])
      .then(([s, u, p]) => {
        setStats(s.data); setUsers(u.data); setPlants(p.data);
      }).finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) return <AppLayout title="Admin"><div className="loading-spinner"><div className="spinner" /></div></AppLayout>;

  return (
    <AppLayout title="Admin Panel">
      <div className="page-header">
        <h1>⚙️ Admin Panel</h1>
        <p>System overview and user management</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: 28 }}>
          <div className="stat-card"><div className="stat-icon green">👥</div><div><div className="stat-value">{stats.total_users}</div><div className="stat-label">Total Users</div></div></div>
          <div className="stat-card"><div className="stat-icon green">🌿</div><div><div className="stat-value">{stats.total_plants}</div><div className="stat-label">Total Plants</div></div></div>
          <div className="stat-card"><div className="stat-icon orange">🔔</div><div><div className="stat-value">{stats.total_notifications}</div><div className="stat-label">Notifications</div></div></div>
          <div className="stat-card"><div className="stat-icon blue">✅</div><div><div className="stat-value">{stats.active_users_today}</div><div className="stat-label">Active Today</div></div></div>
        </div>
      )}

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['overview','users','plants'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(t)}>
            {t === 'overview' ? '📊' : t === 'users' ? '👥' : '🌿'} {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Users table */}
      {tab === 'users' && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 16 }}>All Users</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Location</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-ok' : 'badge-recently-watered'}`}>{u.role}</span></td>
                    <td>{u.location || '—'}</td>
                    <td>{format(new Date(u.created_at), 'MMM d, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plants table */}
      {tab === 'plants' && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 16 }}>All Plants</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Type</th><th>User ID</th><th>Added</th></tr>
              </thead>
              <tbody>
                {plants.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td><span className="badge badge-recently-watered">{p.plant_type}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.user_id.slice(-8)}…</td>
                    <td>{format(new Date(p.created_at), 'MMM d, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overview */}
      {tab === 'overview' && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 16 }}>System Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Platform', value: 'Smart Home Gardening Assistant' },
              { label: 'API Version', value: '1.0.0' },
              { label: 'Database', value: 'MongoDB' },
              { label: 'Total Users', value: stats?.total_users },
              { label: 'Total Plants', value: stats?.total_plants },
              { label: 'Active Users Today', value: stats?.active_users_today },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                <span style={{ fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
