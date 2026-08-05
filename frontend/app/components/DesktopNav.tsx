'use client';

import React from 'react';
import type { User } from '../types';

interface Props {
  currentUser: User | null;
  currentView: 'HOME' | 'DASHBOARD';
  setCurrentView: (v: 'HOME' | 'DASHBOARD') => void;
  onOpenLogin: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const DesktopNav: React.FC<Props> = ({
  currentUser, currentView, setCurrentView, onOpenLogin, onOpenSettings, onLogout
}) => (
  <div className="nav-links desktop-nav">
    {currentUser ? (
      <>
        <div className="user-pill">
          <span>{currentUser.name}</span>
          <span className={`role-badge role-${currentUser.role.toLowerCase()}`}>{currentUser.role}</span>
        </div>
        <button type="button" className="btn-sm-outline" style={{ borderRadius: '30px' }} onClick={onOpenSettings}>Settings</button>
        <button type="button" className="btn-logout" onClick={onLogout}>Logout</button>
      </>
    ) : (
      <>
        <a className={`nav-link ${currentView === 'HOME' ? 'active' : ''}`} onClick={() => setCurrentView('HOME')}>Home</a>
        <a className="nav-link" href="#services-section">Services</a>
        <a className="nav-link" href="#how-it-works-section">How It Works</a>
        <a className="nav-link" href="#doctors-section">Our Doctors</a>
        <button type="button" className="btn-login" onClick={onOpenLogin}>Login</button>
      </>
    )}
  </div>
);
