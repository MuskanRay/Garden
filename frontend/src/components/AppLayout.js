// src/components/AppLayout.js
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Chatbot from './Chatbot';

export default function AppLayout({ children, title }) {
  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
      />

      <div className={`main-content${collapsed ? ' sidebar-collapsed' : ''}`}>
        <Navbar
          collapsed={collapsed}
          title={title}
          onMobileToggle={() => setMobileOpen(o => !o)}
        />

        <main className="page-container">
          {children}
        </main>
      </div>

      <Chatbot />
    </div>
  );
}
