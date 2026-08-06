'use client';

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import type { AppContextType } from '../hooks/useAppContext';
import { TIMEZONE_OPTIONS } from '../data/constants';
import { getTimezoneBadgeDisplay } from '../lib/slotUtils';

export const DesktopNav: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { auth, modals, currentView, setCurrentView } = ctx;
  const [selectedTz, setSelectedTz] = useState('AUTO');

  return (
    <div className="nav-links desktop-nav">
      {auth.currentUser ? (
        <>
          <div className="user-pill">
            <span>{auth.currentUser.name}</span>
            <span className={`role-badge role-${auth.currentUser.role.toLowerCase()}`}>{auth.currentUser.role}</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.15rem 0.45rem', borderRadius: '12px' }}>
              <Globe size={11} color="#0284c7" />
              <select value={selectedTz} onChange={e => setSelectedTz(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#0369a1', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
                {TIMEZONE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.value === 'AUTO' ? `Auto: ${getTimezoneBadgeDisplay('AUTO')}` : opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="button" className="btn-sm-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '30px' }} onClick={() => modals.setIsSettingsOpen(true)}>
            Settings
          </button>
          <button type="button" className="btn-logout" onClick={auth.handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <a className={`nav-link ${currentView === 'HOME' ? 'active' : ''}`} onClick={() => setCurrentView('HOME')}>Home</a>
          <a className="nav-link" href="#services-section">Services</a>
          <a className="nav-link" href="#how-it-works-section">How It Works</a>
          <a className="nav-link" href="#why-choose-us-section">Why Choose Us</a>
          <a className="nav-link" href="#doctors-section">Our Doctors</a>
          <button type="button" className="btn-login" onClick={() => modals.setIsLoginOpen(true)}>Login</button>
        </>
      )}
    </div>
  );
};
