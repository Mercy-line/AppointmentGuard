'use client';

import React from 'react';
import { Calendar, Users, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Appointment, Doctor } from '../types';

interface Props {
  appointments: Appointment[];
  doctorsList: Doctor[];
  totalPatientsCount: number;
}

export const AdminMetricsOverview: React.FC<Props> = ({
  appointments, doctorsList, totalPatientsCount
}) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
    <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#0284c7', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Appointments</span>
        <Calendar size={20} />
      </div>
      <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{appointments.length}</h3>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>All-time bookings log</p>
    </div>

    <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#059669', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Active Doctors</span>
        <Users size={20} />
      </div>
      <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{doctorsList.length}</h3>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Across 5 specialties</p>
    </div>

    <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#7c3aed', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Registered Patients</span>
        <UserIcon size={20} />
      </div>
      <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{totalPatientsCount}</h3>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Patients in clinic DB</p>
    </div>

    <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#166534', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Confirmed Visits</span>
        <CheckCircle2 size={20} />
      </div>
      <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{appointments.filter(a => a.status === 'CONFIRMED').length}</h3>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Active scheduled slots</p>
    </div>

    <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#dc2626', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Cancelled Visits</span>
        <AlertCircle size={20} />
      </div>
      <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{appointments.filter(a => a.status === 'CANCELLED').length}</h3>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Cancelled / time-off</p>
    </div>
  </div>
);
