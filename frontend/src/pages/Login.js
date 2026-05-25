// src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🌿');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">🌱</div>
          <div className="auth-brand-title">GardenAI</div>
          <div className="auth-brand-sub">Your smart home gardening assistant. Grow smarter, not harder.</div>
        </div>
        <div className="auth-features">
          {[
            { icon: '🌤️', text: 'Real-time weather-based watering advice' },
            { icon: '🩺', text: 'AI plant health analysis & diagnosis' },
            { icon: '🔔', text: 'Smart reminders and care notifications' },
            { icon: '💬', text: 'AI gardening chatbot available 24/7' },
          ].map((f, i) => (
            <div key={i} className="auth-feature">
              <div className="auth-feature-icon">{f.icon}</div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="auth-right">
        <div className="auth-form-title">Welcome back 👋</div>
        <div className="auth-form-sub">Sign in to your garden dashboard</div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email" className="form-control" placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password" className="form-control" placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? '⏳ Signing in…' : '🌿 Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Create one free</Link>
        </div>

        <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--text-secondary)' }}>
          <strong>Demo credentials:</strong><br />
          🌿 User: <code>john@garden.com</code> / <code>User@123</code><br />
          ⚙️ Admin: <code>admin@garden.com</code> / <code>Admin@123</code>
        </div>
      </div>
    </div>
  );
}
