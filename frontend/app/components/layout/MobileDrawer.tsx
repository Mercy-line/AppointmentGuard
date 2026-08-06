'use client';

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import type { AppContextType } from '../../hooks/useAppContext';
import { TIMEZONE_OPTIONS } from '../../data/constants';
import { getTimezoneBadgeDisplay } from '../../lib/slotUtils';

export const MobileDrawer: React.FC<{ ctx: AppContextType; isOpen: boolean; onClose: () => void }> = ({ ctx, isOpen, onClose }) => {
  const { auth, modals } = ctx;
  const [selectedTz, setSelectedTz] = useState('AUTO');
  if (!isOpen) return null;

  return (
    <div className="mobile-menu-drawer">
      {auth.currentUser ? (
        <>
          <div className="mobile-nav-link" style={{ background: '#e0f2fe', borderColor: '#bae6fd', color: '#0369a1', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>{auth.currentUser.name}</span>
              <span className={`role-badge role-${auth.currentUser.role.toLowerCase()}`}>{auth.currentUser.role}</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', background: 'white', border: '1px solid #bae6fd', padding: '0.15rem 0.45rem', borderRadius: '10px' }}>
              <Globe size={11} color="#0284c7" />
              <select value={selectedTz} onChange={e => setSelectedTz(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#0369a1', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
                {TIMEZONE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.value === 'AUTO' ? `Auto: ${getTimezoneBadgeDisplay('AUTO')}` : opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="button" className="mobile-nav-link" onClick={() => { modals.setIsSettingsOpen(true); onClose(); }}>Account Settings & Password</button>
          <button type="button" className="mobile-nav-link" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }} onClick={() => { auth.handleLogout(); onClose(); }}>Sign Out</button>
        </>
      ) : (
        <>
          <button type="button" className="mobile-nav-link" onClick={() => { const el = document.getElementById('doctors-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); onClose(); }}>Our Doctors</button>
          <button type="button" className="btn-primary" style={{ width: '100%', marginTop: '0.4rem', borderRadius: '8px', fontSize: '0.82rem', padding: '0.6rem' }} onClick={() => { modals.setIsLoginOpen(true); onClose(); }}>Sign In to Portal</button>
        </>
      )}
    </div>
  );
};
