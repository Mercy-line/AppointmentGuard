'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import type { Doctor } from '../types';

export const DoctorCardHeader: React.FC<{ doc: Doctor }> = ({ doc }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {doc.avatarInitials}
    </div>
    <div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{doc.name}</h3>
      <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>{doc.specialization}</div>
      <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
        <Clock size={12} /> {doc.hours}
      </div>
    </div>
  </div>
);
