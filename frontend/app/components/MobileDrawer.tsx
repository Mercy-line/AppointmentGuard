'use client';

import React from 'react';
import type { User } from '../types';

interface Props {
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  setCurrentView: (v: 'HOME' | 'DASHBOARD') => void;
  onOpenLogin: () => void;
  onOpenSettings: () => void;
  onOpenTimeOff: () => void;
  onLogout: () => void;
}

export const MobileDrawer: React.FC<Props> = ({
  currentUser, isOpen, onClose, setCurrentView, onOpenLogin, onOpenSettings, onOpenTimeOff, onLogout
}) => {
  if (!isOpen) return null;
  return (
    <div className="mobile-menu-drawer">
      {currentUser ? (
        <>
          <div className="mobile-nav-link" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
            <span>{currentUser.name}</span>
            <span className={`role-badge role-${currentUser.role.toLowerCase()}`}>{currentUser.role}</span>
          </div>
          <button type="button" className="mobile-nav-link" onClick={() => { onOpenSettings(); onClose(); }}>Account Settings</button>
          {currentUser.role === 'DOCTOR' && (
            <button type="button" className="mobile-nav-link" style={{ background: '#f0f9ff', color: '#0369a1' }} onClick={() => { onOpenTimeOff(); onClose(); }}>Set Time-Off</button>
          )}
          <button type="button" className="mobile-nav-link" style={{ background: '#fef2f2', color: '#dc2626' }} onClick={onLogout}>Sign Out</button>
        </>
      ) : (
        <>
          <button type="button" className="mobile-nav-link" onClick={() => { setCurrentView('HOME'); onClose(); }}>Home Page</button>
          <button type="button" className="mobile-nav-link" onClick={() => { document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' }); onClose(); }}>Services</button>
          <button type="button" className="mobile-nav-link" onClick={() => { document.getElementById('doctors-section')?.scrollIntoView({ behavior: 'smooth' }); onClose(); }}>Doctors</button>
          <button type="button" className="btn-primary" style={{ width: '100%', marginTop: '0.4rem' }} onClick={() => { onOpenLogin(); onClose(); }}>Sign In</button>
        </>
      )}
    </div>
  );
};
