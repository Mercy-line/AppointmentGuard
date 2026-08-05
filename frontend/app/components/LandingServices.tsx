'use client';

import React from 'react';
import { Heart, Stethoscope, Baby, Activity } from 'lucide-react';

export const LandingServices: React.FC = () => (
  <section id="services-section" style={{ maxWidth: '1200px', margin: '0 auto 3rem', padding: '0 1.5rem' }}>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem', color: '#0f172a' }}>Our Medical Specialties</h2>
    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Comprehensive outpatient healthcare services delivered by experienced clinical specialists.</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <Heart size={28} color="#ef4444" style={{ marginBottom: '0.75rem' }} />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>Cardiology</h3>
        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>Cardiovascular screening, blood pressure management, and heart health diagnostics.</p>
      </div>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <Stethoscope size={28} color="#0284c7" style={{ marginBottom: '0.75rem' }} />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>General Practice</h3>
        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>Primary healthcare, annual wellness physicals, and preventive treatment plans.</p>
      </div>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <Baby size={28} color="#f59e0b" style={{ marginBottom: '0.75rem' }} />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>Pediatrics</h3>
        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>Child healthcare, infant growth monitoring, vaccinations, and adolescent wellness.</p>
      </div>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <Activity size={28} color="#10b981" style={{ marginBottom: '0.75rem' }} />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>Dermatology</h3>
        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>Skin condition diagnostics, acne treatment, mole evaluations, and dermatological care.</p>
      </div>
    </div>
  </section>
);
