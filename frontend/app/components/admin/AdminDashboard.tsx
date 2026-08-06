'use client';

import React, { useState } from 'react';
import { Activity, Users, User as UserIcon, FileText, Clock, UserPlus } from 'lucide-react';
import { AdminMetricsOverview } from './AdminMetricsOverview';
import { PatientDirectory } from './PatientDirectory';
import { AdminDoctorsDirectory } from './AdminDoctorsDirectory';
import { AdminTimeOffForm } from './AdminTimeOffForm';
import type { AppContextType } from '../../hooks/useAppContext';

export const AdminDashboard: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const [tab, setTab] = useState<'ADMIN_OVERVIEW' | 'ADMIN_DOCTORS' | 'ADMIN_PATIENTS' | 'ADMIN_TIMEOFF' | 'ADMIN_APPOINTMENTS'>('ADMIN_OVERVIEW');
  const { docs, patients, modals } = ctx;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>System Administration</h2>
        <button type="button" className="btn-primary" style={{ borderRadius: '30px', padding: '0.55rem 1.15rem', fontSize: '0.82rem', width: 'auto' }} onClick={() => modals.setIsRegisterOpen(true)}>
          <UserPlus size={15} /> + Add Patient
        </button>
      </div>

      <div className="dashboard-tabs">
        <button type="button" className={`dashboard-tab-btn ${tab === 'ADMIN_OVERVIEW' ? 'btn-primary' : 'btn-outline'}`} style={{ background: tab === 'ADMIN_OVERVIEW' ? '#0284c7' : 'white', color: tab === 'ADMIN_OVERVIEW' ? 'white' : '#1e293b' }} onClick={() => setTab('ADMIN_OVERVIEW')}>
          <Activity size={14} /><span className="tab-label-desktop">Overview</span><span className="tab-label-mobile">Metrics</span>
        </button>
        <button type="button" className={`dashboard-tab-btn ${tab === 'ADMIN_DOCTORS' ? 'btn-primary' : 'btn-outline'}`} style={{ background: tab === 'ADMIN_DOCTORS' ? '#0284c7' : 'white', color: tab === 'ADMIN_DOCTORS' ? 'white' : '#1e293b' }} onClick={() => setTab('ADMIN_DOCTORS')}>
          <Users size={14} /><span className="tab-label-desktop">Doctors</span><span className="tab-label-mobile">Doctors</span>
        </button>
        <button type="button" className={`dashboard-tab-btn ${tab === 'ADMIN_PATIENTS' ? 'btn-primary' : 'btn-outline'}`} style={{ background: tab === 'ADMIN_PATIENTS' ? '#0284c7' : 'white', color: tab === 'ADMIN_PATIENTS' ? 'white' : '#1e293b' }} onClick={() => setTab('ADMIN_PATIENTS')}>
          <UserIcon size={14} /><span className="tab-label-desktop">Patients</span><span className="tab-label-mobile">Patients</span>
        </button>
        <button type="button" className={`dashboard-tab-btn ${tab === 'ADMIN_TIMEOFF' ? 'btn-primary' : 'btn-outline'}`} style={{ background: tab === 'ADMIN_TIMEOFF' ? '#0284c7' : 'white', color: tab === 'ADMIN_TIMEOFF' ? 'white' : '#1e293b' }} onClick={() => setTab('ADMIN_TIMEOFF')}>
          <Clock size={14} /><span className="tab-label-desktop">Set Time-Off</span><span className="tab-label-mobile">Time-Off</span>
        </button>
        <button type="button" className={`dashboard-tab-btn ${tab === 'ADMIN_APPOINTMENTS' ? 'btn-primary' : 'btn-outline'}`} style={{ background: tab === 'ADMIN_APPOINTMENTS' ? '#0284c7' : 'white', color: tab === 'ADMIN_APPOINTMENTS' ? 'white' : '#1e293b' }} onClick={() => setTab('ADMIN_APPOINTMENTS')}>
          <FileText size={14} /><span className="tab-label-desktop">All Logs</span><span className="tab-label-mobile">Logs</span>
        </button>
      </div>

      {tab === 'ADMIN_OVERVIEW' && <AdminMetricsOverview appointments={[]} doctorsList={docs.doctorsList} totalPatientsCount={patients.totalPatientsCount} />}
      {tab === 'ADMIN_DOCTORS' && <AdminDoctorsDirectory ctx={ctx} />}
      {tab === 'ADMIN_PATIENTS' && <PatientDirectory ctx={ctx} />}
      {tab === 'ADMIN_TIMEOFF' && <AdminTimeOffForm ctx={ctx} />}
      {tab === 'ADMIN_APPOINTMENTS' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
          No records found in admin appointment log.
        </div>
      )}
    </div>
  );
};
