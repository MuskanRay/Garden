// src/pages/Alerts.js
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import { alertsAPI } from '../utils/api';
import { formatDistanceToNow } from 'date-fns';

const ICONS = { watering:'💧', weather:'🌦️', health:'🩺', general:'📢' };

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    alertsAPI.list()
      .then(r => setAlerts(r.data))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await alertsAPI.markRead(id);
    setAlerts(a => a.map(x => x.id === id ? { ...x, is_read: true } : x));
  };

  const markAllRead = async () => {
    await alertsAPI.markAllRead();
    setAlerts(a => a.map(x => ({ ...x, is_read: true })));
    toast.success('All marked as read');
  };

  const unread = alerts.filter(a => !a.is_read).length;

  return (
    <AppLayout title="Alerts">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1>🔔 Notifications</h1>
            <p>{unread} unread alert{unread !== 1 ? 's' : ''}</p>
          </div>
          {unread > 0 && (
            <button className="btn btn-secondary" onClick={markAllRead}>✅ Mark all read</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : alerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <h3>No notifications yet</h3>
          <p>You're all caught up! Alerts will appear here as your plants need attention.</p>
        </div>
      ) : (
        <div>
          {alerts.map(a => (
            <div
              key={a.id}
              className={`alert-item ${a.type} ${!a.is_read ? 'unread' : ''}`}
              onClick={() => !a.is_read && markRead(a.id)}
              style={{ cursor: !a.is_read ? 'pointer' : 'default', marginBottom: 10 }}
            >
              <div className="alert-icon">{ICONS[a.type]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="alert-title">{a.title}</div>
                  {!a.is_read && <span style={{ fontSize: 10, background: 'var(--green-500)', color: 'white', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>NEW</span>}
                </div>
                <div className="alert-msg">{a.message}</div>
                <div className="alert-time">🕒 {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
