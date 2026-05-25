// src/pages/PlantHealth.js
import React, { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { recsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function PlantHealth() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    recsAPI.healthAll(user?.location || 'New Delhi')
      .then(r => setAnalyses(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const summary = {
    healthy:  analyses.filter(a => a.status === 'healthy').length,
    warning:  analyses.filter(a => a.status === 'warning').length,
    critical: analyses.filter(a => a.status === 'critical').length,
  };

  return (
    <AppLayout title="Plant Health">
      <div className="page-header">
        <h1>🩺 Plant Health Analysis</h1>
        <p>AI-powered health assessment for all your plants</p>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : analyses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌱</div>
          <h3>No plants to analyse</h3>
          <p>Add plants to get health reports</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid-3" style={{ marginBottom: 28 }}>
            <SummaryCard icon="✅" label="Healthy" value={summary.healthy} color="green" />
            <SummaryCard icon="⚠️" label="Need Attention" value={summary.warning} color="orange" />
            <SummaryCard icon="🚨" label="Critical" value={summary.critical} color="red" />
          </div>

          {/* Health cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {analyses.map(a => <HealthCard key={a.plant_id} analysis={a} />)}
          </div>
        </>
      )}
    </AppLayout>
  );
}

function SummaryCard({ icon, label, value, color }) {
  const colors = { green: 'var(--green-100)', orange: '#fff7ed', red: '#fef2f2' };
  const texts  = { green: 'var(--green-700)', orange: 'var(--earth-600)', red: 'var(--red-500)' };
  return (
    <div className="stat-card" style={{ background: colors[color] }}>
      <div style={{ fontSize: 36 }}>{icon}</div>
      <div>
        <div className="stat-value" style={{ color: texts[color] }}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function HealthCard({ analysis }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
        {/* Score ring */}
        <div className={`health-score-ring ${analysis.status}`}>
          {analysis.health_score}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{analysis.plant_name}</h3>
            <span className={`badge badge-${analysis.status}`}>
              {analysis.status === 'healthy' ? '✅' : analysis.status === 'warning' ? '⚠️' : '🚨'}{' '}
              {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
            </span>
          </div>

          {/* Issues */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Issues Detected</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {analysis.issues.map((issue, i) => (
                <span key={i} style={{
                  fontSize: 12, padding: '4px 10px', borderRadius: 20,
                  background: analysis.status === 'healthy' ? 'var(--green-100)' : analysis.status === 'warning' ? '#fff7ed' : '#fef2f2',
                  color: analysis.status === 'healthy' ? 'var(--green-700)' : analysis.status === 'warning' ? 'var(--earth-600)' : 'var(--red-500)',
                }}>
                  {issue}
                </span>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Recommendations</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {analysis.suggestions.map((s, i) => (
                <li key={i} style={{ fontSize: 13, color: 'var(--text-primary)', display: 'flex', gap: 8 }}>
                  <span>💡</span><span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Health bar */}
          <div style={{ marginTop: 12 }}>
            <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3,
                width: `${analysis.health_score}%`,
                background: analysis.health_score >= 80 ? 'var(--green-500)' : analysis.health_score >= 50 ? 'var(--earth-400)' : 'var(--red-500)',
                transition: 'width 1s ease',
              }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Health score: {analysis.health_score}/100</div>
          </div>
        </div>
      </div>
    </div>
  );
}
