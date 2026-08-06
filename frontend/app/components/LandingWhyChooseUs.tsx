'use client';

import React from 'react';
import { Shield, Clock, Heart, RefreshCw } from 'lucide-react';

export const LandingWhyChooseUs: React.FC = () => (
  <section id="why-choose-us-section" style={{ padding: '3.5rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Why Choose AppointmentGuard</h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Engineered to strict medical scheduling constraints.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[
          { title: 'Double-Booking Prevention', icon: Shield, desc: 'Pessimistic row locking ensures zero overlapping slots.' },
          { title: '1-Hour Advance Notice', icon: Clock, desc: 'Rule #4 guarantees adequate preparation time for doctors.' },
          { title: 'Family Guardian Care', icon: Heart, desc: 'Parents book and manage dependent child appointments.' },
          { title: 'Atomic Rescheduling', icon: RefreshCw, desc: 'Full rollback protection ensures zero slot loss.' },
        ].map((f, idx) => (
          <div key={idx} className="feature-card" style={{ textAlign: 'left' }}>
            <div className="brand-icon" style={{ marginBottom: '0.75rem' }}><f.icon size={20} /></div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>{f.title}</h3>
            <p className="feature-desc" style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
