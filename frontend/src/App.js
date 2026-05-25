// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/global.css';

// Pages
import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import MyPlants   from './pages/MyPlants';
import AddPlant   from './pages/AddPlant';
import PlantDetail from './pages/PlantDetail';
import Weather    from './pages/Weather';
import PlantHealth from './pages/PlantHealth';
import Alerts     from './pages/Alerts';
import Profile    from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

// Protected route wrapper
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-spinner" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

// Public route (redirect to dashboard if logged in)
function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Navigate to="/dashboard" />} />
      <Route path="/login"    element={<Public><Login /></Public>} />
      <Route path="/register" element={<Public><Register /></Public>} />

      {/* Protected */}
      <Route path="/dashboard"      element={<Protected><Dashboard /></Protected>} />
      <Route path="/plants"         element={<Protected><MyPlants /></Protected>} />
      <Route path="/add-plant"      element={<Protected><AddPlant /></Protected>} />
      <Route path="/plants/:id"     element={<Protected><PlantDetail /></Protected>} />
      <Route path="/plants/:id/edit" element={<Protected><AddPlant /></Protected>} />
      <Route path="/weather"        element={<Protected><Weather /></Protected>} />
      <Route path="/health"         element={<Protected><PlantHealth /></Protected>} />
      <Route path="/alerts"         element={<Protected><Alerts /></Protected>} />
      <Route path="/profile"        element={<Protected><Profile /></Protected>} />
      <Route path="/admin"          element={<Protected><AdminPanel /></Protected>} />

      {/* Fallback */}
      <Route path="*" element={
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div style={{ fontSize: 80 }}>🌿</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginTop: 16 }}>Page Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>This path doesn't exist in your garden.</p>
          <a href="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 20 }}>Go to Dashboard</a>
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
