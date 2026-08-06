'use client';

import React, { useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import type { AppContextType } from '../../hooks/useAppContext';

export const DoctorDashboard: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const [tab, setTab] = useState<'DOCTOR_QUEUE' | 'DOCTOR_CANCELLED'>('DOCTOR_QUEUE');

  return (
    <div>
      <div className="dashboard-tabs dashboard-tabs-2">
        <button type="button" className={`dashboard-tab-btn ${tab === 'DOCTOR_QUEUE' ? 'btn-primary' : 'btn-outline'}`} style={{ background: tab === 'DOCTOR_QUEUE' ? '#0284c7' : 'white', color: tab === 'DOCTOR_QUEUE' ? 'white' : '#1e293b' }} onClick={() => setTab('DOCTOR_QUEUE')}>
          <Calendar size={14} /><span className="tab-label-desktop">Active Patient Queue</span><span className="tab-label-mobile">Active Queue</span>
        </button>
        <button type="button" className={`dashboard-tab-btn ${tab === 'DOCTOR_CANCELLED' ? 'btn-primary' : 'btn-outline'}`} style={{ background: tab === 'DOCTOR_CANCELLED' ? '#ef4444' : 'white', color: tab === 'DOCTOR_CANCELLED' ? 'white' : '#1e293b', borderColor: tab === 'DOCTOR_CANCELLED' ? '#ef4444' : '#e2e8f0' }} onClick={() => setTab('DOCTOR_CANCELLED')}>
          <AlertCircle size={14} /><span className="tab-label-desktop">Cancelled Appointments</span><span className="tab-label-mobile">Cancelled</span>
        </button>
      </div>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
        No appointments in current doctor {tab.toLowerCase().replace('_', ' ')}.
      </div>
    </div>
  );
};
