// src/pages/PlantDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import { plantsAPI, recsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';

export default function PlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plant, setPlant] = useState(null);
  const [rec,   setRec]   = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      plantsAPI.get(id),
      recsAPI.single(id, user?.location || 'New Delhi'),
      recsAPI.healthSingle(id, user?.location || 'New Delhi'),
    ]).then(([p, r, h]) => {
      setPlant(p.data); setRec(r.data); setHealth(h.data);
    }).catch(() => navigate('/plants'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handleWater = async () => {
    await plantsAPI.water(id);
    toast.success('Watering logged! 💧');
    setPlant(p => ({ ...p, water_status: 'recently_watered', last_watered: new Date().toISOString() }));
  };

  if (loading) return <AppLayout><div className="loading-spinner"><div className="spinner" /></div></AppLayout>;
  if (!plant) return null;

  const ACTION_ICONS = { water_now: '💧', skip: '⏭️', monitor: '👀' };
  const ACTION_COLORS = { water_now: '#eff6ff', skip: 'var(--green-50)', monitor: '#fff7ed' };

  return (
    <AppLayout title={plant.name}>
      {/* Back btn */}
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/plants')} style={{ marginBottom: 20 }}>
        ← Back to Plants
      </button>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Plant info card */}
        <div className="card">
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{
              width: 100, height: 100, borderRadius: 16, background: 'var(--green-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, flexShrink: 0,
            }}>
              {plant.image_url
                ? <img src={`${process.env.REACT_APP_API_URL}${plant.image_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }} />
                : '🌿'
              }
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{plant.name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, textTransform: 'capitalize' }}>{plant.plant_type}</p>
              <span className={`badge badge-${plant.water_status.replace(/_/g,'-')}`} style={{ marginTop: 8 }}>
                {plant.water_status === 'needs_water' ? '💧 Needs Water' : plant.water_status === 'recently_watered' ? '✅ Recently Watered' : '👍 Good'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
            {[
              { label: 'Watering',  value: `Every ${plant.watering_frequency_days} days` },
              { label: 'Sunlight',  value: plant.sunlight_requirement.replace(/_/g,' ') },
              { label: 'Soil Type', value: plant.soil_type },
              { label: 'Last Watered', value: plant.last_watered ? formatDistanceToNow(new Date(plant.last_watered), { addSuffix: true }) : 'Never' },
              { label: 'Added', value: format(new Date(plant.created_at), 'MMM d, yyyy') },
            ].map(row => (
              <div key={row.label} style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 1 }}>{row.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2, textTransform: 'capitalize' }}>{row.value}</div>
              </div>
            ))}
          </div>

          {plant.notes && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--earth-100)', borderRadius: 8, fontSize: 14, color: 'var(--text-secondary)', borderLeft: '3px solid var(--earth-400)' }}>
              📝 {plant.notes}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn btn-primary" onClick={handleWater} disabled={plant.water_status === 'recently_watered'}>
              💧 Log Watering
            </button>
            <button className="btn btn-secondary" onClick={() => navigate(`/plants/${id}/edit`)}>✏️ Edit</button>
          </div>
        </div>

        {/* Recommendation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {rec && (
            <div className="card" style={{ background: ACTION_COLORS[rec.action] }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ fontSize: 40 }}>{ACTION_ICONS[rec.action]}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600 }}>{rec.action.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{rec.message}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                    {rec.reasons.map((r, i) => <span key={i} className="rec-reason">{r}</span>)}
                  </div>
                </div>
              </div>
              {rec.next_watering && (
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                  📅 Next watering: {format(new Date(rec.next_watering), 'MMM d, yyyy')}
                </div>
              )}
            </div>
          )}

          {/* Health card */}
          {health && (
            <div className="card">
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 14 }}>🩺 Health Analysis</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                <div className={`health-score-ring ${health.status}`}>{health.health_score}</div>
                <div>
                  <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{health.status}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Health Score</div>
                </div>
              </div>
              <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', borderRadius: 3, width: `${health.health_score}%`, background: health.health_score >= 80 ? 'var(--green-500)' : health.health_score >= 50 ? 'var(--earth-400)' : 'var(--red-500)' }} />
              </div>
              {health.suggestions.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <span>💡</span><span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
