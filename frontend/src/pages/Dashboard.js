// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import AppLayout from '../components/AppLayout';
import WeatherWidget from '../components/WeatherWidget';
import { useAuth } from '../context/AuthContext';
import { usersAPI, plantsAPI, recsAPI, alertsAPI } from '../utils/api';
import { formatDistanceToNow } from 'date-fns';

const PIE_COLORS = ['#22c55e','#fb923c','#38bdf8','#f87171','#a78bfa','#fbbf24','#34d399'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [plants, setPlants]     = useState([]);
  const [recs, setRecs]         = useState([]);
  const [alerts, setAlerts]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      usersAPI.dashboardStats(),
      plantsAPI.list(),
      recsAPI.all(user?.location || 'New Delhi'),
      alertsAPI.list(),
    ]).then(([s, p, r, a]) => {
      setStats(s.data);
      setPlants(p.data.slice(0, 4));
      setRecs(r.data.filter(r => r.action === 'water_now').slice(0, 3));
      setAlerts(a.data.filter(a => !a.is_read).slice(0, 4));
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <AppLayout title="Dashboard">
      <div className="loading-spinner"><div className="spinner" /><span>Loading your garden…</span></div>
    </AppLayout>
  );

  const pieData = stats?.plant_types
    ? Object.entries(stats.plant_types).map(([name, value]) => ({ name, value }))
    : [];

  const ACTION_ICONS = { water_now: '💧', skip: '⏭️', monitor: '👀' };
  const URGENCY_ICONS = { high: '🔴', medium: '🟡', low: '🟢' };

  return (
    <AppLayout title="Dashboard">
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text-primary)' }}>
          Good {getGreeting()}, {user?.name?.split(' ')[0]}! 🌱
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          Here's what's happening in your garden today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon="🌿" color="green"  value={stats?.total_plants ?? 0}   label="Total Plants"     />
        <StatCard icon="💧" color="blue"   value={stats?.needs_water ?? 0}    label="Need Water"       />
        <StatCard icon="🔔" color="orange" value={stats?.unread_alerts ?? 0}  label="Unread Alerts"    />
        <StatCard icon="✅" color="green"  value={(stats?.total_plants ?? 0) - (stats?.needs_water ?? 0)} label="Healthy Plants" />
      </div>

      {/* Main grid */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* Weather */}
        <div>
          <SectionHeader title="🌤️ Current Weather" link="/weather" linkLabel="Full forecast" />
          <WeatherWidget />
        </div>

        {/* Plant type distribution */}
        <div className="card">
          <SectionHeader title="🌿 Plant Types" />
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <div>🌱</div>
              <p style={{ fontSize: 13 }}>Add plants to see the chart</p>
            </div>
          )}
        </div>
      </div>

      {/* Watering alerts + Recent plants */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* Plants needing water */}
        <div className="card">
          <SectionHeader title="💧 Need Watering" link="/plants" linkLabel="View all" />
          {recs.length === 0
            ? <div className="empty-state" style={{ padding: 30 }}><div>✅</div><p style={{ fontSize: 13 }}>All plants are watered!</p></div>
            : recs.map(r => (
              <div key={r.plant_id} className="rec-card" style={{ marginBottom: 10 }}>
                <div className="rec-action-icon">{ACTION_ICONS[r.action]}</div>
                <div className="rec-content" style={{ flex: 1 }}>
                  <h4>{r.plant_name}</h4>
                  <p>{r.message}</p>
                </div>
                <span className={`badge badge-${r.urgency}`}>{URGENCY_ICONS[r.urgency]} {r.urgency}</span>
              </div>
            ))
          }
        </div>

        {/* Recent alerts */}
        <div className="card">
          <SectionHeader title="🔔 Recent Alerts" link="/alerts" linkLabel="View all" />
          {alerts.length === 0
            ? <div className="empty-state" style={{ padding: 30 }}><div>🔔</div><p style={{ fontSize: 13 }}>No unread alerts</p></div>
            : alerts.map(a => (
              <div key={a.id} className={`alert-item ${a.type} unread`}>
                <div className="alert-icon">{alertIcon(a.type)}</div>
                <div>
                  <div className="alert-title">{a.title}</div>
                  <div className="alert-msg">{a.message}</div>
                  <div className="alert-time">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Recent Plants */}
      <div>
        <SectionHeader title="🌿 Recent Plants" link="/plants" linkLabel="View all plants" />
        {plants.length === 0
          ? (
            <div className="empty-state card">
              <div className="empty-state-icon">🌱</div>
              <h3>No plants yet</h3>
              <p>Start adding your plants to get care recommendations</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/add-plant')}>
                ➕ Add First Plant
              </button>
            </div>
          )
          : (
            <div className="grid-plants">
              {plants.map(p => (
                <div key={p.id} className="plant-card" onClick={() => navigate(`/plants/${p.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="plant-card-img">
                    <span style={{ fontSize: 64 }}>🌿</span>
                    <span className={`badge badge-${p.water_status.replace('_','-')}`} style={{ position: 'absolute', top: 12, right: 12 }}>
                      {p.water_status === 'needs_water' ? '💧 Needs Water' : p.water_status === 'recently_watered' ? '✅ Watered' : '👍 OK'}
                    </span>
                  </div>
                  <div className="plant-card-body">
                    <div className="plant-card-name">{p.name}</div>
                    <div className="plant-card-type">{p.plant_type} · Every {p.watering_frequency_days}d</div>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </AppLayout>
  );
}

function StatCard({ icon, color, value, label }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function SectionHeader({ title, link, linkLabel }) {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)' }}>{title}</h3>
      {link && (
        <button onClick={() => navigate(link)} className="btn btn-secondary btn-sm">{linkLabel} →</button>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function alertIcon(type) {
  return { watering: '💧', weather: '🌦️', health: '🩺', general: '📢' }[type] || '📢';
}
