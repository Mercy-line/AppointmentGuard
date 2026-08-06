'use client';

import React from 'react';
import { Users, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Doctor, Appointment } from '../../types';

interface Props {
  appointments: Appointment[];
  doctorsList: Doctor[];
  totalPatientsCount: number;
}

export const AdminMetricsOverview: React.FC<Props> = ({ appointments, doctorsList, totalPatientsCount }) => {
  const activeBookedCount = appointments.filter(a => a.status === 'CONFIRMED').length;
  const cancelledCount = appointments.filter(a => a.status === 'CANCELLED').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontSize: '0.8rem', fontWeight: 700 }}>
          <Users size={16} /> Total Registered Patients
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '0.35rem' }}>{totalPatientsCount}</div>
      </div>
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontSize: '0.8rem', fontWeight: 700 }}>
          <Calendar size={16} /> Active Practitioners
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '0.35rem' }}>{doctorsList.length}</div>
      </div>
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontSize: '0.8rem', fontWeight: 700 }}>
          <CheckCircle2 size={16} /> Active Booked Visits
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '0.35rem' }}>{activeBookedCount}</div>
      </div>
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>
          <AlertCircle size={16} /> Cancelled / Rescheduled
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '0.35rem' }}>{cancelledCount}</div>
      </div>
    </div>
  );
};
