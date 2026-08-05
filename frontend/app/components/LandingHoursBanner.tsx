'use client';

import React from 'react';
import type { AppContextType } from '../hooks/useAppContext';
import { CLINIC_HOURS } from '../data/constants';

export const LandingHoursBanner: React.FC<{ ctx: AppContextType }> = ({ ctx }) => (
  <section style={{ maxWidth: '1200px', margin: '0 auto 2.5rem', padding: '0 1.5rem' }}>
    <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: 'white', padding: '1.25rem 1.75rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Clinic Operating Hours</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.2rem' }}>{CLINIC_HOURS}</div>
        <div style={{ fontSize: '0.82rem', opacity: 0.9, marginTop: '0.2rem' }}>Emergency Time-Off & Shift Overrides Handled Automatically.</div>
      </div>
      <button type="button" className="btn-primary" style={{ background: 'white', color: '#0369a1', fontWeight: 700, padding: '0.65rem 1.25rem' }} onClick={() => ctx.modals.setIsBookOpen(true)}>
        Schedule Visit
      </button>
    </div>
  </section>
);
