// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { alertsAPI } from '../utils/api';

export default function Navbar({ collapsed, onMobileToggle, title }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    alertsAPI.list()
      .then(r => setUnread(r.data.filter(a => !a.is_read).length))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/plants?search=${encodeURIComponent(search)}`);
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <header className={`navbar${collapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="navbar-left">
        {/* Mobile hamburger */}
        <button
          className="icon-btn"
          onClick={onMobileToggle}
          style={{ display: 'none' }}
          id="mobile-menu-btn"
        >☰</button>

        <h1 className="navbar-title">{title || 'Dashboard'}</h1>
      </div>

      <div className="navbar-right">
        {/* Search */}
        <div className="navbar-search">
          <span>🔍</span>
          <input
            placeholder="Search plants…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        {/* Theme toggle */}
        <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Alerts */}
        <button className="icon-btn" onClick={() => navigate('/alerts')} title="Alerts">
          🔔
          {unread > 0 && <span className="notification-badge">{unread > 9 ? '9+' : unread}</span>}
        </button>

        {/* Avatar */}
        <button className="avatar-btn" onClick={() => navigate('/profile')} title={user?.name}>
          {initials}
        </button>
      </div>
    </header>
  );
}
