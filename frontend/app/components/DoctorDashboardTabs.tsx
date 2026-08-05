'use client';

import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

interface Props {
  tab: 'DOCTOR_QUEUE' | 'DOCTOR_CANCELLED';
  setTab: (t: 'DOCTOR_QUEUE' | 'DOCTOR_CANCELLED') => void;
}

export const DoctorDashboardTabs: React.FC<Props> = ({ tab, setTab }) => (
  <div className="dashboard-tabs dashboard-tabs-2">
    <button type="button" className={`dashboard-tab-btn ${tab === 'DOCTOR_QUEUE' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('DOCTOR_QUEUE')}><Calendar size={14} /> Active Queue</button>
    <button type="button" className={`dashboard-tab-btn ${tab === 'DOCTOR_CANCELLED' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('DOCTOR_CANCELLED')}><AlertCircle size={14} /> Cancelled</button>
  </div>
);
