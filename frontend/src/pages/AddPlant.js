// src/pages/AddPlant.js  (also used for editing — pass plantId prop via route state)
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import { plantsAPI } from '../utils/api';

const PLANT_TYPES    = ['indoor','outdoor','vegetable','fruit','flower','herb','succulent','tree'];
const SOIL_TYPES     = ['loamy','sandy','clay','silty','peaty','chalky'];
const SUNLIGHT_TYPES = ['full_sun','partial_shade','full_shade'];

const DEFAULTS = {
  name: '', plant_type: 'indoor', watering_frequency_days: 7,
  sunlight_requirement: 'partial_shade', soil_type: 'loamy',
  last_watered: '', notes: '', image_url: '',
};

export default function AddPlant() {
  const navigate     = useNavigate();
  const { id }       = useParams();
  const isEdit       = Boolean(id);
  const [form, setForm]   = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState(null);

  useEffect(() => {
    if (isEdit) {
      plantsAPI.get(id).then(r => {
        const p = r.data;
        setForm({
          name: p.name, plant_type: p.plant_type,
          watering_frequency_days: p.watering_frequency_days,
          sunlight_requirement: p.sunlight_requirement,
          soil_type: p.soil_type,
          last_watered: p.last_watered ? p.last_watered.slice(0,10) : '',
          notes: p.notes || '', image_url: p.image_url || '',
        });
        if (p.image_url) setPreview(`${process.env.REACT_APP_API_URL}${p.image_url}`);
      });
    }
  }, [id, isEdit]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        watering_frequency_days: Number(form.watering_frequency_days),
        last_watered: form.last_watered || null,
      };
      delete payload.image_url;

      let plantId = id;
      if (isEdit) {
        await plantsAPI.update(id, payload);
        toast.success('Plant updated! 🌿');
      } else {
        const { data } = await plantsAPI.create(payload);
        plantId = data.id;
        toast.success('Plant added! 🌱');
      }

      // Upload image if selected
      if (imageFile && plantId) {
        await plantsAPI.uploadImage(plantId, imageFile);
      }

      navigate('/plants');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save plant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title={isEdit ? 'Edit Plant' : 'Add Plant'}>
      <div className="page-header">
        <h1>{isEdit ? '✏️ Edit Plant' : '🌱 Add New Plant'}</h1>
        <p>{isEdit ? 'Update your plant details' : 'Add a plant to your smart garden'}</p>
      </div>

      <div style={{ maxWidth: 680 }}>
        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Image upload */}
            <div className="form-group" style={{ textAlign: 'center' }}>
              <div style={{
                width: 120, height: 120, borderRadius: '50%', margin: '0 auto 12px',
                background: 'var(--bg-secondary)', border: '2px dashed var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', cursor: 'pointer', fontSize: 48,
              }} onClick={() => document.getElementById('img-input').click()}>
                {preview ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🌿'}
              </div>
              <input id="img-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => document.getElementById('img-input').click()}>
                📷 Upload Photo
              </button>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Plant Name *</label>
                <input className="form-control" placeholder="e.g. Monstera Deliciosa" value={form.name} onChange={set('name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Plant Type *</label>
                <select className="form-control" value={form.plant_type} onChange={set('plant_type')}>
                  {PLANT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Watering Frequency (days) *</label>
                <input type="number" className="form-control" min={1} max={30} value={form.watering_frequency_days} onChange={set('watering_frequency_days')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Watered</label>
                <input type="date" className="form-control" value={form.last_watered} onChange={set('last_watered')} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Sunlight Requirement *</label>
                <select className="form-control" value={form.sunlight_requirement} onChange={set('sunlight_requirement')}>
                  {SUNLIGHT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Soil Type *</label>
                <select className="form-control" value={form.soil_type} onChange={set('soil_type')}>
                  {SOIL_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-control" placeholder="Any special care instructions…" value={form.notes} onChange={set('notes')} />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/plants')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Saving…' : isEdit ? '✅ Save Changes' : '🌱 Add Plant'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
