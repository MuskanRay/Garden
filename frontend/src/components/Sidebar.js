// src/components/Sidebar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { label: 'Main', items: [
    { to: '/dashboard',   icon: '🏠', label: 'Dashboard'    },
    { to: '/plants',      icon: '🌿', label: 'My Plants'    },
    { to: '/add-plant',   icon: '➕', label: 'Add Plant'    },
    { to: '/weather',     icon: '🌤️', label: 'Weather'      },
  ]},
  { label: 'Insights', items: [
    { to: '/health',      icon: '🩺', label: 'Plant Health' },
    { to: '/alerts',      icon: '🔔', label: 'Alerts'       },
  ]},
  { label: 'Account', items: [
    { to: '/profile',     icon: '👤', label: 'Profile'      },
    { to: '/admin',       icon: '⚙️', label: 'Admin Panel', adminOnly: true },
  ]},
];

export default function Sidebar({ collapsed, onToggle, mobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const cls = [
    'sidebar',
    collapsed   ? 'collapsed'    : '',
    mobileOpen  ? 'mobile-open'  : '',
  ].join(' ');

  return (
    <aside className={cls}>
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="logo-icon">🌱</span>
        {!collapsed && (
          <div>
            <div className="logo-text">GardenAI</div>
            <div className="logo-sub">Smart Garden Assistant</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV.map(section => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map(item => {
              if (item.adminOnly && user?.role !== 'admin') return null;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  title={collapsed ? item.label : ''}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!collapsed && <span className="nav-label">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}

        {/* Logout */}
        <div style={{ marginTop: 8 }}>
          <button className="nav-item" onClick={handleLogout} style={{ width: '100%', background: 'none', color: 'rgba(255,255,255,0.7)' }}>
            <span className="nav-icon">🚪</span>
            {!collapsed && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </nav>

      {/* Toggle button */}
      <div className="sidebar-footer">
        <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
          {collapsed ? '→' : '←'}
        </button>
      </div>
    </aside>
  );
}
