'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import type { AppContextType } from '../hooks/useAppContext';

export const LandingHero: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { auth, setCurrentView, modals } = ctx;

  return (
    <section className="hero-section">
      <div className="hero-badge"><Shield size={14} color="#0284c7" /> AppointmentGuard — Reliable Clinic Scheduling</div>
      <h1 className="hero-title">Streamlined Clinic Appointments with <span style={{ color: '#0284c7' }}>Zero Double-Bookings</span></h1>
      <p className="hero-subtitle">AppointmentGuard enforces strict 30-minute grid alignment, doctor working hours, and time-off overrides with complete scheduling integrity.</p>
      <div className="hero-buttons">
        <button type="button" className="btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }} onClick={() => auth.currentUser ? setCurrentView('DASHBOARD') : modals.setIsLoginOpen(true)}>
          {auth.currentUser ? 'Go to Patient Dashboard' : 'Sign In to Book Appointment'}
        </button>
        <a href="#doctors-section" className="btn-outline" style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Explore Doctors</a>
      </div>
    </section>
  );
};
