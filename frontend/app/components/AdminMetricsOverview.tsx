'use client';

import React from 'react';

interface Props {
  patientsCount: number;
  doctorsCount: number;
  activeBookingsCount: number;
  cancelledBookingsCount: number;
}

export const AdminMetricsOverview: React.FC<Props> = ({
  patientsCount, doctorsCount, activeBookingsCount, cancelledBookingsCount
}) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
    <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>REGISTERED PATIENTS</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7' }}>{patientsCount}</div>
    </div>
    <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>ACTIVE CLINIC DOCTORS</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7' }}>{doctorsCount}</div>
    </div>
    <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>CONFIRMED BOOKINGS</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>{activeBookingsCount}</div>
    </div>
    <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>CANCELLED BOOKINGS</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626' }}>{cancelledBookingsCount}</div>
    </div>
  </div>
);
