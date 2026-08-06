'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import type { AppContextType } from '../../hooks/useAppContext';

export const LandingHero: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { modals } = ctx;

  return (
    <section className="section section-tint">
      <div className="hero-container">
        <div>
          <h1 className="hero-title">Quality Healthcare, Book Your Appointment Online</h1>
          <p className="hero-subtitle">
            Skip the queue. Choose your doctor, view real-time availability and confirm a 30-minute visit at our clinic in just a few clicks.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn-primary" onClick={() => modals.setIsLoginOpen(true)}>
              Book Appointment
            </button>
            <a href="#doctors-section" className="btn-outline">View Doctors</a>
          </div>
        </div>

        <div className="hero-card-img">
          <div style={{ textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ 
              background: '#e0f2fe', 
              borderRadius: '50%', 
              width: '130px', 
              height: '130px', 
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={64} color="#0284c7" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Real-Time Availability</h3>
            <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.25rem' }}>Instant confirmation & online booking</p>
          </div>
        </div>
      </div>
    </section>
  );
};
