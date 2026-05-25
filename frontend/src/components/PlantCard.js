// src/components/PlantCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { plantsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const PLANT_EMOJIS = {
  indoor: '🌿', outdoor: '🌳', vegetable: '🥦',
  fruit: '🍎', flower: '🌸', herb: '🌿',
  succulent: '🌵', tree: '🌲',
};

const STATUS_LABELS = {
  needs_water: { label: 'Needs Water', icon: '💧', cls: 'badge-needs-water' },
  recently_watered: { label: 'Watered', icon: '✅', cls: 'badge-recently-watered' },
  ok: { label: 'Good', icon: '👍', cls: 'badge-ok' },
};

export default function PlantCard({ plant, onDelete, onWater }) {
  const navigate = useNavigate();
  const status = STATUS_LABELS[plant.water_status] || STATUS_LABELS.ok;
  const emoji = PLANT_EMOJIS[plant.plant_type] || '🌱';

  const handleWater = async (e) => {
    e.stopPropagation();
    try {
      await plantsAPI.water(plant.id);
      toast.success(`${plant.name} watered! 💧`);
      onWater && onWater(plant.id);
    } catch {
      toast.error('Failed to log watering');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${plant.name}"?`)) return;
    try {
      await plantsAPI.delete(plant.id);
      toast.success('Plant deleted');
      onDelete && onDelete(plant.id);
    } catch {
      toast.error('Failed to delete plant');
    }
  };

  const lastWateredText = plant.last_watered
    ? formatDistanceToNow(new Date(plant.last_watered), { addSuffix: true })
    : 'Never watered';

  return (
    <div className="plant-card" onClick={() => navigate(`/plants/${plant.id}`)}>
      {/* Image / Emoji */}
      <div className="plant-card-img">
        {plant.image_url
          ? <img src={`${process.env.REACT_APP_API_URL}${plant.image_url}`} alt={plant.name} />
          : <span>{emoji}</span>
        }
        <span
          className={`badge ${status.cls}`}
          style={{ position: 'absolute', top: 12, right: 12 }}
        >
          {status.icon} {status.label}
        </span>
      </div>

      {/* Body */}
      <div className="plant-card-body">
        <div className="plant-card-name">{plant.name}</div>
        <div className="plant-card-type">{plant.plant_type} · {plant.soil_type}</div>

        <div className="plant-card-stats">
          <span className="plant-stat">💧 Every {plant.watering_frequency_days}d</span>
          <span className="plant-stat">☀️ {plant.sunlight_requirement.replace('_', ' ')}</span>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          🕒 {lastWateredText}
        </div>
      </div>

      {/* Footer actions */}
      <div className="plant-card-footer">
        <button
          className="btn btn-primary btn-sm"
          onClick={handleWater}
          disabled={plant.water_status === 'recently_watered'}
        >
          💧 Water Now
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-secondary btn-sm btn-icon-only"
            onClick={(e) => { e.stopPropagation(); navigate(`/plants/${plant.id}/edit`); }}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="btn btn-danger btn-sm btn-icon-only"
            onClick={handleDelete}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
