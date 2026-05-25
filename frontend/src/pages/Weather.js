// src/pages/Weather.js
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AppLayout from '../components/AppLayout';
import WeatherWidget from '../components/WeatherWidget';
import { useAuth } from '../context/AuthContext';
import { weatherAPI } from '../utils/api';

const WEATHER_ICONS = {
  '01d':'☀️','01n':'🌙','02d':'⛅','02n':'⛅','03d':'☁️','03n':'☁️',
  '04d':'☁️','04n':'☁️','09d':'🌧️','09n':'🌧️','10d':'🌦️','10n':'🌦️',
  '11d':'⛈️','11n':'⛈️','13d':'❄️','13n':'❄️','50d':'🌫️','50n':'🌫️',
};

export default function Weather() {
  const { user } = useAuth();
  const [city, setCity]       = useState(user?.location || 'New Delhi');
  const [inputCity, setInputCity] = useState(user?.location || 'New Delhi');
  const [forecast, setForecast]   = useState([]);
  const [loading, setLoading]     = useState(true);

  const fetchForecast = (c) => {
    setLoading(true);
    weatherAPI.forecast(c)
      .then(r => setForecast(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchForecast(city); }, [city]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') { setCity(inputCity); }
  };

  const chartData = forecast.map(d => ({
    day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    High: d.temp_max, Low: d.temp_min, Rain: d.rain_probability,
  }));

  return (
    <AppLayout title="Weather">
      <div className="page-header">
        <h1>🌤️ Weather & Forecast</h1>
        <p>Real-time weather data to help you care for your plants</p>
      </div>

      {/* City search */}
      <div style={{ marginBottom: 24, maxWidth: 360 }}>
        <div className="navbar-search">
          <span>📍</span>
          <input
            placeholder="Enter city name…"
            value={inputCity}
            onChange={e => setInputCity(e.target.value)}
            onKeyDown={handleSearch}
          />
          <button className="btn btn-primary btn-sm" onClick={() => setCity(inputCity)} style={{ padding: '4px 12px', borderRadius: 20 }}>
            Go
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <WeatherWidget />

        {/* Gardening tips based on weather */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 16 }}>🌱 Gardening Tips Today</h3>
          {forecast.length > 0 && <WeatherTips forecast={forecast[0]} />}
        </div>
      </div>

      {/* 5-day forecast */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 16 }}>📅 5-Day Forecast</h3>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <div className="forecast-grid">
            {forecast.map((d, i) => (
              <div key={i} className="forecast-day">
                <div className="forecast-date">
                  {i === 0 ? 'Today' : new Date(d.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="forecast-icon">{WEATHER_ICONS[d.icon] || '🌤️'}</div>
                <div className="forecast-high">{Math.round(d.temp_max)}°</div>
                <div className="forecast-low">{Math.round(d.temp_min)}°</div>
                <div className="forecast-rain">🌧 {d.rain_probability}%</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{d.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Temperature chart */}
      {chartData.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 16 }}>📈 Temperature Trend (°C)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="High" stroke="#f97316" fill="url(#colorHigh)" strokeWidth={2} />
              <Area type="monotone" dataKey="Low"  stroke="#38bdf8" fill="url(#colorLow)"  strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </AppLayout>
  );
}

function WeatherTips({ forecast }) {
  const tips = [];
  if (forecast.rain_probability > 70) tips.push({ icon: '⏭️', text: 'Skip watering today — rain expected' });
  if (forecast.temp_max > 35) tips.push({ icon: '🔥', text: 'High heat — water in early morning or evening' });
  if (forecast.humidity < 40) tips.push({ icon: '💧', text: 'Low humidity — check soil moisture frequently' });
  if (forecast.temp_min < 10) tips.push({ icon: '🧥', text: 'Cool night — bring sensitive plants indoors' });
  if (tips.length === 0) tips.push({ icon: '✅', text: 'Great day for gardening!' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {tips.map((t, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
