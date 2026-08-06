'use client';

import React from 'react';

export const LandingHowItWorks: React.FC = () => (
  <section id="how-it-works-section" style={{ padding: '3.5rem 1.5rem', background: 'white' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>How AppointmentGuard Works</h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Three simple steps to secure your 30-minute doctor consultation slot.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {[
          { step: '01', title: 'Select Doctor & Specialty', desc: 'Browse official clinic doctors, specializations, and daily shift availability.' },
          { step: '02', title: 'Choose 30-Min Time Slot', desc: 'Pick an open 30-minute interval starting at least 1 hour in advance.' },
          { step: '03', title: 'Instant Guarantee', desc: 'Receive immediate confirmation with zero risk of double booking.' },
        ].map((item, idx) => (
          <div key={idx} style={{ padding: '1.5rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0284c7', marginBottom: '0.5rem' }}>{item.step}</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>{item.title}</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
