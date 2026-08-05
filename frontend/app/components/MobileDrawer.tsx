'use client';

import React from 'react';
import type { User } from '../types';

interface Props {
  currentUser: User | null;
  onHomeClick: () => void;
  onSettingsClick: () => void;
  onTimeOffClick: () => void;
  onLogoutClick: () => void;
  onLoginClick: () => void;
  closeMenu: () => void;
}

export const MobileDrawer: React.FC<Props> = ({
  currentUser, onHomeClick, onSettingsClick, onTimeOffClick, onLogoutClick, onLoginClick, closeMenu
}) => (
  <div className="mobile-menu-drawer">
    {currentUser ? (
      <>
        <div className="mobile-nav-link" style={{ background: '#e0f2fe', borderColor: '#bae6fd', color: '#0369a1', fontWeight: 700 }}>
          <span>{currentUser.name}</span>
          <span className={`role-badge role-${currentUser.role.toLowerCase()}`}>{currentUser.role}</span>
        </div>
        <button type="button" className="mobile-nav-link" onClick={() => { onSettingsClick(); closeMenu(); }}><span>Account Settings & Password</span></button>
        {currentUser.role === 'DOCTOR' && (
          <button type="button" className="mobile-nav-link" style={{ background: '#f0f9ff', color: '#0369a1' }} onClick={() => { onTimeOffClick(); closeMenu(); }}><span>Set Time-Off</span></button>
        )}
        <button type="button" className="mobile-nav-link" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }} onClick={onLogoutClick}><span>Sign Out</span></button>
      </>
    ) : (
      <>
        <button type="button" className="mobile-nav-link" onClick={() => { onHomeClick(); closeMenu(); }}><span>Home Landing Page</span></button>
        <button type="button" className="mobile-nav-link" onClick={() => { document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' }); closeMenu(); }}><span>Services</span></button>
        <button type="button" className="mobile-nav-link" onClick={() => { document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' }); closeMenu(); }}><span>How It Works</span></button>
        <button type="button" className="mobile-nav-link" onClick={() => { document.getElementById('why-choose-us-section')?.scrollIntoView({ behavior: 'smooth' }); closeMenu(); }}><span>Why Choose Us</span></button>
        <button type="button" className="mobile-nav-link" onClick={() => { document.getElementById('doctors-section')?.scrollIntoView({ behavior: 'smooth' }); closeMenu(); }}><span>Our Doctors</span></button>
        <button type="button" className="btn-primary" style={{ width: '100%', marginTop: '0.4rem', borderRadius: '8px', fontSize: '0.82rem', padding: '0.6rem' }} onClick={() => { onLoginClick(); closeMenu(); }}>Sign In to Portal</button>
      </>
    )}
  </div>
);
