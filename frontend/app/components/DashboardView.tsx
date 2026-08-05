'use client';

import React from 'react';
import { Calendar, PlusCircle } from 'lucide-react';
import { PatientDashboard } from './PatientDashboard';
import { DoctorDashboard } from './DoctorDashboard';
import { AdminDashboard } from './AdminDashboard';
import type { AppContextType } from '../hooks/useAppContext';

export const DashboardView: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { auth, modals } = ctx;
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  return (
    <div className="dashboard-container">
      <div className="dash-banner">
        <div>
          <h1>Welcome back, {currentUser.name}!</h1>
          <p>
            {currentUser.role === 'PATIENT' && 'Patient Portal — Select an action below to manage your visits or book a new appointment.'}
            {currentUser.role === 'DOCTOR' && `Doctor Portal — ${currentUser.specialization || 'General Practice'} Schedule & Cancellation Logs.`}
            {currentUser.role === 'ADMIN' && 'System Administration — Select an action tab below to manage system metrics, doctors, or master log.'}
          </p>
        </div>
        {currentUser.role === 'DOCTOR' && (
          <button type="button" className="btn-primary" onClick={() => modals.setIsTimeOffOpen(true)}>
            <Calendar size={16} /> Set Time-Off
          </button>
        )}
        {currentUser.role === 'ADMIN' && (
          <button type="button" className="btn-primary" onClick={() => modals.setIsRegisterOpen(true)}>
            <PlusCircle size={16} /> Add User to DB
          </button>
        )}
      </div>

      {currentUser.role === 'PATIENT' && <PatientDashboard ctx={ctx} />}
      {currentUser.role === 'DOCTOR' && <DoctorDashboard ctx={ctx} />}
      {currentUser.role === 'ADMIN' && <AdminDashboard ctx={ctx} />}
    </div>
  );
};
