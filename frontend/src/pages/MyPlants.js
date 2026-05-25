// src/pages/MyPlants.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import PlantCard from '../components/PlantCard';
import { plantsAPI } from '../utils/api';

const TYPES = ['', 'indoor', 'outdoor', 'vegetable', 'fruit', 'flower', 'herb', 'succulent', 'tree'];
const STATUSES = ['', 'needs_water', 'recently_watered', 'ok'];

export default function MyPlants() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [plants, setPlants]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPlants = () => {
    setLoading(true);
    plantsAPI.list({
      search: search || undefined,
      plant_type: typeFilter || undefined,
      water_status: statusFilter || undefined,
    }).then(r => setPlants(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlants(); }, [search, typeFilter, statusFilter]);

  const handleDelete = (id) => setPlants(p => p.filter(x => x.id !== id));
  const handleWater  = (id) => setPlants(p => p.map(x => x.id === id ? { ...x, water_status: 'recently_watered', last_watered: new Date().toISOString() } : x));

  return (
    <AppLayout title="My Plants">
      <div className="page-header">
        <h1>My Plants 🌿</h1>
        <p>Manage and track all your plants in one place</p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
        <div className="navbar-search" style={{ flex: '1 1 200px', maxWidth: 320 }}>
          <span>🔍</span>
          <input
            placeholder="Search plants…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select className="form-control" style={{ width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {TYPES.slice(1).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>

        <select className="form-control" style={{ width: 180 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="needs_water">Needs Water</option>
          <option value="recently_watered">Recently Watered</option>
          <option value="ok">OK</option>
        </select>

        <button className="btn btn-primary" onClick={() => navigate('/add-plant')}>
          ➕ Add Plant
        </button>
      </div>

      {/* Plants grid */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : plants.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌱</div>
          <h3>No plants found</h3>
          <p>{search || typeFilter || statusFilter ? 'Try adjusting your filters' : 'Add your first plant to get started!'}</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/add-plant')}>
            ➕ Add Plant
          </button>
        </div>
      ) : (
        <div className="grid-plants">
          {plants.map(p => (
            <PlantCard key={p.id} plant={p} onDelete={handleDelete} onWater={handleWater} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
