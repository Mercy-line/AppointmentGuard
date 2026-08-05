'use client';

import React from 'react';
import type { User } from '../types';

interface Props {
  currentUser: User | null;
  currentView: string;
  onHomeClick: () => void;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
  onLoginClick: () => void;
}

export const DesktopNav: React.FC<Props> = ({
  currentUser, currentView, onHomeClick, onSettingsClick, onLogoutClick, onLoginClick
}) => (
  <div className="nav-links desktop-nav">
    {currentUser ? (
      <>
        <div className="user-pill">
          <span>{currentUser.name}</span>
          <span className={`role-badge role-${currentUser.role.toLowerCase()}`}>{currentUser.role}</span>
        </div>
        <button type="button" className="btn-sm-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '30px' }} onClick={onSettingsClick}>Settings</button>
        <button type="button" className="btn-logout" onClick={onLogoutClick}>Logout</button>
      </>
    ) : (
      <>
        <a className={`nav-link ${currentView === 'HOME' ? 'active' : ''}`} onClick={onHomeClick}>Home</a>
        <a className="nav-link" href="#services-section">Services</a>
        <a className="nav-link" href="#how-it-works-section">How It Works</a>
        <a className="nav-link" href="#why-choose-us-section">Why Choose Us</a>
        <a className="nav-link" href="#doctors-section">Our Doctors</a>
        <button type="button" className="btn-login" onClick={onLoginClick}>Login</button>
      </>
    )}
  </div>
);
