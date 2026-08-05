'use client';

import React from 'react';
import { Stethoscope, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="footer">
    <div className="footer-content" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div className="brand-icon" style={{ width: '28px', height: '28px' }}><Stethoscope size={16} /></div>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>AppointmentGuard</span>
      </div>
      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
        © {new Date().getFullYear()} AppointmentGuard Clinic System. All rights reserved. Zero double-bookings.
      </div>
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Shield size={12} color="#0284c7" /> HIPAA Compliant</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Heart size={12} color="#ef4444" /> Patient First</span>
      </div>
    </div>
  </footer>
);
