'use client';

import React from 'react';
import { Heart, Syringe, Baby, TestTube, Stethoscope } from 'lucide-react';

export const LandingServices: React.FC = () => (
  <section id="services-section" style={{ padding: '3.5rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Specialized Care Services</h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Comprehensive outpatient specialties served by official clinic practitioners.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        {[
          { title: 'Cardiology', icon: Heart, desc: 'ECG, heart screening & vascular health' },
          { title: 'General Practice', icon: Stethoscope, desc: 'Routine checkups & preventative health' },
          { title: 'Pediatrics', icon: Baby, desc: 'Child wellness & vaccination schedules' },
          { title: 'Dermatology', icon: Syringe, desc: 'Skin care, mole checks & acne therapy' },
          { title: 'Orthopedics', icon: TestTube, desc: 'Joint, bone & musculoskeletal care' },
        ].map((s, idx) => (
          <div key={idx} className="card-gradient" style={{ textAlign: 'left' }}>
            <div className="brand-icon" style={{ marginBottom: '0.75rem' }}><s.icon size={20} /></div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>{s.title}</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
