'use client';

import React from 'react';
import { Calendar, Shield, Clock, Heart } from 'lucide-react';
import type { AppContextType } from '../../hooks/useAppContext';

export const LandingHero: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { modals } = ctx;

  return (
    <section className="hero-section">
      <div className="badge">
        <Shield size={14} color="#0284c7" />
        Concurrent & Reliable Healthcare Scheduling
      </div>

      <h1>Book Doctor Appointments <br /><span className="gradient-text">Without Conflicts</span></h1>

      <p className="hero-description">
        AppointmentGuard guarantees zero double-bookings, respects dynamic working hours and doctor time-offs, enforces 1-hour advance notice rules, and supports family dependent bookings.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        <button type="button" className="btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem', borderRadius: '30px' }} onClick={() => modals.setIsBookOpen(true)}>
          <Calendar size={18} /> Book Appointment
        </button>
        <button type="button" className="btn-outline" style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem', borderRadius: '30px' }} onClick={() => modals.setIsLoginOpen(true)}>
          Patient & Staff Portal
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
          <Clock size={16} color="#0284c7" /> 30-Min Grid Alignment
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
          <Shield size={16} color="#0284c7" /> Atomic Rollback Protection
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
          <Heart size={16} color="#0284c7" /> Under-18 Minor Guardian Rule
        </div>
      </div>
    </section>
  );
};
