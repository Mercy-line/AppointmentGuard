'use client';

import React from 'react';
import { AppointmentCard } from './AppointmentCard';
import { DoctorDashboardTabs } from './DoctorDashboardTabs';
import type { AppContextType } from '../hooks/useAppContext';

export const DoctorDashboard: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { doctorTab, setDoctorTab, appts, modals, auth } = ctx;

  const visibleAppts = appts.appointments.filter(a => {
    if (doctorTab === 'DOCTOR_QUEUE') return a.status === 'CONFIRMED' || a.status === 'BOOKED';
    if (doctorTab === 'DOCTOR_CANCELLED') return a.status === 'CANCELLED';
    return true;
  });

  return (
    <div>
      <DoctorDashboardTabs tab={doctorTab} setTab={setDoctorTab} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Doctor Schedule</h2>
        <button type="button" className="btn-sm-outline" onClick={() => modals.setIsTimeOffOpen(true)}>+ Schedule Time-Off</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {visibleAppts.map(a => <AppointmentCard key={a.id} appointment={a} currentUser={auth.currentUser} onRescheduleClick={modals.openReschedule} onCancelClick={modals.openCancel} />)}
      </div>
    </div>
  );
};
