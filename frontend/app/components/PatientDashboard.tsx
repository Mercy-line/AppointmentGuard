'use client';

import React from 'react';
import { DoctorCard } from './DoctorCard';
import { AppointmentCard } from './AppointmentCard';
import { PatientDashboardTabs } from './PatientDashboardTabs';
import type { AppContextType } from '../hooks/useAppContext';
import { DEFAULT_TIME_SLOTS } from '../data/constants';

export const PatientDashboard: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { patientTab, setPatientTab, docs, appts, modals, auth } = ctx;

  const visibleAppts = appts.appointments.filter(a => {
    if (patientTab === 'SCHEDULED') return a.status === 'CONFIRMED' || a.status === 'BOOKED';
    if (patientTab === 'CANCELLED') return a.status === 'CANCELLED';
    return true;
  });

  return (
    <div>
      <PatientDashboardTabs tab={patientTab} setTab={setPatientTab} />
      {patientTab === 'BOOK_NEW' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {docs.doctorsList.map(d => (
            <DoctorCard key={d.id} doctor={d} isExpanded={!!docs.expandedDoctorIds[d.id]} onToggleExpand={docs.toggleDoctorAccordion} selectedDate={appts.selectedDate} setSelectedDate={appts.setSelectedDate} timeSlots={DEFAULT_TIME_SLOTS} selectedTimeSlot={appts.selectedTimeSlot} setSelectedTimeSlot={appts.setSelectedTimeSlot} onBookClick={() => { docs.setSelectedDoctorId(d.id); modals.setIsBookOpen(true); }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {visibleAppts.map(a => <AppointmentCard key={a.id} appointment={a} currentUser={auth.currentUser} onRescheduleClick={modals.openReschedule} onCancelClick={modals.openCancel} />)}
        </div>
      )}
    </div>
  );
};
