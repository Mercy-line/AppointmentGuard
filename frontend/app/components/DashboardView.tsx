'use client';

import React from 'react';
import { Calendar, PlusCircle } from 'lucide-react';
import { PatientDashboard } from './PatientDashboard';
import { DoctorDashboard } from './DoctorDashboard';
import { AdminDashboard } from './AdminDashboard';
import type { AppContextType } from '../hooks/useAppContext';

export const DashboardView: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { auth, modals } = ctx;
  const user = auth.currentUser!;

  return (
    <div className="dashboard-container">
      <div className="dash-banner">
        <div>
          <h1>Welcome back, {user.name}!</h1>
          <p>
            {user.role === 'PATIENT' && 'Patient Portal — Manage your visits or book a new appointment.'}
            {user.role === 'DOCTOR' && `Doctor Portal — ${user.specialization || 'General Practice'} Schedule & Logs.`}
            {user.role === 'ADMIN' && 'System Administration — Manage system metrics, doctors, or master log.'}
          </p>
        </div>
        {user.role === 'DOCTOR' && (
          <button type="button" className="btn-primary" onClick={() => modals.setIsTimeOffOpen(true)}>
            <Calendar size={16} /> Set Time-Off
          </button>
        )}
        {user.role === 'ADMIN' && (
          <button type="button" className="btn-primary" onClick={() => modals.setIsRegisterOpen(true)}>
            <PlusCircle size={16} /> Add User to DB
          </button>
        )}
      </div>
      {auth.adminSuccessMsg && (
        <div style={{ background: '#ecfdf5', color: '#065f46', padding: '0.75rem', borderRadius: '12px', marginBottom: '1rem', fontWeight: 600 }}>
          {auth.adminSuccessMsg}
        </div>
      )}
      {user.role === 'PATIENT' && <PatientDashboard ctx={ctx} />}
      {user.role === 'DOCTOR' && <DoctorDashboard ctx={ctx} />}
      {user.role === 'ADMIN' && <AdminDashboard ctx={ctx} />}
    </div>
  );
};
