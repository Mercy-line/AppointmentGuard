'use client';

import React from 'react';
import { Activity, Users, FileText } from 'lucide-react';

interface Props {
  tab: 'ADMIN_OVERVIEW' | 'ADMIN_DOCTORS' | 'ADMIN_PATIENTS' | 'ADMIN_APPOINTMENTS';
  setTab: (t: 'ADMIN_OVERVIEW' | 'ADMIN_DOCTORS' | 'ADMIN_PATIENTS' | 'ADMIN_APPOINTMENTS') => void;
  patientsCount: number;
}

export const AdminDashboardTabs: React.FC<Props> = ({ tab, setTab, patientsCount }) => (
  <div className="dashboard-tabs">
    <button type="button" className={`dashboard-tab-btn ${tab === 'ADMIN_OVERVIEW' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('ADMIN_OVERVIEW')}><Activity size={14} /> Metrics</button>
    <button type="button" className={`dashboard-tab-btn ${tab === 'ADMIN_DOCTORS' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('ADMIN_DOCTORS')}><Users size={14} /> Doctors</button>
    <button type="button" className={`dashboard-tab-btn ${tab === 'ADMIN_PATIENTS' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('ADMIN_PATIENTS')}><Users size={14} /> Patients ({patientsCount})</button>
    <button type="button" className={`dashboard-tab-btn ${tab === 'ADMIN_APPOINTMENTS' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('ADMIN_APPOINTMENTS')}><FileText size={14} /> Master Log</button>
  </div>
);
