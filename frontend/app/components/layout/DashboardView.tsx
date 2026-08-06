'use client';

import React from 'react';
import { PatientDashboard } from '../patient/PatientDashboard';
import { DoctorDashboard } from '../doctor/DoctorDashboard';
import { AdminDashboard } from '../admin/AdminDashboard';
import type { AppContextType } from '../../hooks/useAppContext';

export const DashboardView: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { auth } = ctx;
  const user = auth.currentUser;
  if (!user) return null;

  return (
    <div className="dashboard-container">
      {user.role === 'PATIENT' && <PatientDashboard ctx={ctx} />}
      {user.role === 'DOCTOR' && <DoctorDashboard ctx={ctx} />}
      {user.role === 'ADMIN' && <AdminDashboard ctx={ctx} />}
    </div>
  );
};
