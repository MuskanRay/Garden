// src/utils/api.js — Axios instance with JWT interceptor
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
  getMe:    ()     => API.get('/auth/me'),
};

// ── Users ─────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile:     ()     => API.get('/users/me'),
  updateProfile:  (data) => API.put('/users/me', data),
  dashboardStats: ()     => API.get('/users/dashboard-stats'),
};

// ── Plants ────────────────────────────────────────────────────────────────
export const plantsAPI = {
  list:    (params) => API.get('/plants', { params }),
  create:  (data)   => API.post('/plants', data),
  get:     (id)     => API.get(`/plants/${id}`),
  update:  (id, data) => API.put(`/plants/${id}`, data),
  delete:  (id)     => API.delete(`/plants/${id}`),
  water:   (id)     => API.post(`/plants/${id}/water`),
  uploadImage: (id, file) => {
    const form = new FormData();
    form.append('file', file);
    return API.post(`/plants/${id}/upload-image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ── Weather ───────────────────────────────────────────────────────────────
export const weatherAPI = {
  current:  (city) => API.get('/weather',          { params: { city } }),
  forecast: (city) => API.get('/weather/forecast', { params: { city } }),
};

// ── Recommendations ───────────────────────────────────────────────────────
export const recsAPI = {
  all:         (city) => API.get('/recommendations/all',        { params: { city } }),
  single:      (id, city) => API.get(`/recommendations/${id}`,  { params: { city } }),
  healthAll:   (city) => API.get('/recommendations/health/all', { params: { city } }),
  healthSingle:(id, city) => API.get(`/recommendations/health/${id}`, { params: { city } }),
};

// ── Alerts ────────────────────────────────────────────────────────────────
export const alertsAPI = {
  list:       ()   => API.get('/alerts'),
  markRead:   (id) => API.put(`/alerts/${id}/read`),
  markAllRead:()   => API.put('/alerts/read-all'),
};

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  stats:  () => API.get('/admin/stats'),
  users:  () => API.get('/admin/users'),
  plants: () => API.get('/admin/plants'),
};

export default API;
