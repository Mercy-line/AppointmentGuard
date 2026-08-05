'use client';

import React from 'react';
import { Stethoscope } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="footer">
    <div className="footer-inner">
      <div className="brand">
        <div className="brand-icon">
          <Stethoscope size={18} />
        </div>
        <span>AppointmentGuard</span>
      </div>

      <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
        © 2026 AppointmentGuard. All rights reserved.
      </div>
    </div>
  </footer>
);
