'use client';

import React from 'react';
import { User as UserIcon } from 'lucide-react';
import type { PatientUser } from '../types';

export const PatientCard: React.FC<{ patient: PatientUser }> = ({ patient }) => (
  <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <UserIcon size={18} />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{patient.first_name ? `${patient.first_name} ${patient.last_name || ''}` : (patient as any).name || patient.username}</div>
        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{patient.email}</div>
      </div>
    </div>
    <div style={{ fontSize: '0.75rem', color: '#475569', background: '#f8fafc', padding: '0.4rem', borderRadius: '6px' }}>
      <div><strong>Username:</strong> {patient.username}</div>
      <div><strong>Role:</strong> {patient.role || 'PATIENT'}</div>
    </div>
  </div>
);
