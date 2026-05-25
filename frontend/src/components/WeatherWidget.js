// src/components/WeatherWidget.js
import React, { useEffect, useState } from 'react';
import { weatherAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const WEATHER_ICONS = {
  '01d':'☀️','01n':'🌙','02d':'⛅','02n':'⛅',
  '03d':'☁️','03n':'☁️','04d':'☁️','04n':'☁️',
  '09d':'🌧️','09n':'🌧️','10d':'🌦️','10n':'🌦️',
  '11d':'⛈️','11n':'⛈️','13d':'❄️','13n':'❄️',
  '50d':'🌫️','50n':'🌫️',
};

export default function WeatherWidget({ compact = false }) {
  const { user } = useAuth();
  const city = user?.location || 'New Delhi';
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    weatherAPI.current(city)
      .then(r => setWeather(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [city]);

  if (loading) return (
    <div className="weather-widget" style={{ minHeight: compact ? 80 : 160 }}>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Loading weather…</div>
    </div>
  );

  if (!weather) return null;

  const icon = WEATHER_ICONS[weather.icon] || '🌤️';

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{Math.round(weather.temperature)}°C</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{weather.city} · {weather.description}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-widget">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <div>
          <div className="weather-city">📍 {weather.city}</div>
          <div className="weather-temp">{Math.round(weather.temperature)}°C</div>
          <div className="weather-desc">{weather.description}</div>
        </div>
        <div style={{ fontSize: 64, opacity: 0.9 }}>{icon}</div>
      </div>

      <div className="weather-details">
        <div className="weather-detail">💧 {weather.humidity}% humidity</div>
        <div className="weather-detail">💨 {weather.wind_speed} m/s</div>
        <div className="weather-detail">🌡️ Feels {Math.round(weather.feels_like)}°C</div>
        {weather.rain_probability > 0 && (
          <div className="weather-detail">🌧️ {Math.round(weather.rain_probability)}% rain chance</div>
        )}
      </div>
    </div>
  );
}
