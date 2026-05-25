// src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', location: 'New Delhi' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to GardenAI 🌱');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">🌱</div>
          <div className="auth-brand-title">GardenAI</div>
          <div className="auth-brand-sub">Join thousands of smart gardeners growing healthier plants with AI.</div>
        </div>
        <div className="auth-features">
          {[
            { icon: '🌿', text: 'Track unlimited plants' },
            { icon: '📊', text: 'Beautiful care dashboard' },
            { icon: '🤖', text: 'AI-powered recommendations' },
            { icon: '🌦️', text: 'Weather-smart watering' },
          ].map((f, i) => (
            <div key={i} className="auth-feature">
              <div className="auth-feature-icon">{f.icon}</div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-title">Create your garden 🌿</div>
        <div className="auth-form-sub">Start tracking your plants today — it's free</div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input type="text" className="form-control" placeholder="Jane Smith" value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input type="email" className="form-control" placeholder="jane@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required />
          </div>
          <div className="form-group">
            <label className="form-label">City (for weather)</label>
            <input type="text" className="form-control" placeholder="New Delhi" value={form.location} onChange={set('location')} />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? '⏳ Creating account…' : '🌱 Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
