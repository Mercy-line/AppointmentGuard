'use client';

import React from 'react';
import { AppointmentCard } from './AppointmentCard';
import { PatientDirectory } from './PatientDirectory';
import { AdminMetricsOverview } from './AdminMetricsOverview';
import { AdminDoctorsPanel } from './AdminDoctorsPanel';
import { AdminDashboardTabs } from './AdminDashboardTabs';
import type { AppContextType } from '../hooks/useAppContext';

export const AdminDashboard: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { adminTab, setAdminTab, docs, patients, appts, modals, auth } = ctx;
  const activeCount = appts.appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'BOOKED').length;
  const cancelCount = appts.appointments.filter(a => a.status === 'CANCELLED').length;

  return (
    <div>
      <AdminDashboardTabs tab={adminTab} setTab={setAdminTab} patientsCount={patients.totalPatientsCount} />
      {adminTab === 'ADMIN_OVERVIEW' && (
        <AdminMetricsOverview patientsCount={patients.totalPatientsCount} doctorsCount={docs.doctorsList.length} activeBookingsCount={activeCount} cancelledBookingsCount={cancelCount} />
      )}
      {adminTab === 'ADMIN_DOCTORS' && (
        <AdminDoctorsPanel doctorsList={docs.doctorsList} selectedId={docs.selectedAdminDoctorId} setSelectedId={docs.setSelectedAdminDoctorId} appointments={appts.appointments} currentUser={auth.currentUser} onRescheduleClick={modals.openReschedule} onCancelClick={modals.openCancel} />
      )}
      {adminTab === 'ADMIN_PATIENTS' && <PatientDirectory ctx={ctx} />}
      {adminTab === 'ADMIN_APPOINTMENTS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {appts.appointments.map(a => <AppointmentCard key={a.id} appointment={a} currentUser={auth.currentUser} onRescheduleClick={modals.openReschedule} onCancelClick={modals.openCancel} />)}
        </div>
      )}
    </div>
  );
};
