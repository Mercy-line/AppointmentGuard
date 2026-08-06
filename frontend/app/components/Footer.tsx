'use client';

import React from 'react';
import { Stethoscope } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="footer">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
      <div className="brand-icon" style={{ width: '28px', height: '28px' }}><Stethoscope size={16} /></div>
      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>AppointmentGuard</span>
    </div>
    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
      Robust, Concurrent Clinic Scheduling System — Django REST Framework & Next.js
    </p>
  </footer>
);
