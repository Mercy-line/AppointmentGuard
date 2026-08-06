'use client';

import React, { useState } from 'react';
import { Calendar, AlertCircle, Stethoscope } from 'lucide-react';
import type { AppContextType } from '../../hooks/useAppContext';

export const DoctorDashboard: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const [tab, setTab] = useState<'DOCTOR_QUEUE' | 'DOCTOR_CANCELLED'>('DOCTOR_QUEUE');
  const user = ctx.auth.currentUser;

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Practitioner Portal — {user?.name}</h2>
        <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.35rem', marginBottom: 0 }}>
          View daily patient queues, consultation schedules, and manage cancellations.
        </p>
      </div>

      <div className="dashboard-tabs dashboard-tabs-2">
        <button type="button" className={`dashboard-tab-btn ${tab === 'DOCTOR_QUEUE' ? 'btn-primary' : 'btn-outline'}`} style={{ background: tab === 'DOCTOR_QUEUE' ? '#0284c7' : 'white', color: tab === 'DOCTOR_QUEUE' ? 'white' : '#1e293b' }} onClick={() => setTab('DOCTOR_QUEUE')}>
          <Calendar size={14} /><span className="tab-label-desktop">Active Patient Queue</span><span className="tab-label-mobile">Active Queue</span>
        </button>
        <button type="button" className={`dashboard-tab-btn ${tab === 'DOCTOR_CANCELLED' ? 'btn-primary' : 'btn-outline'}`} style={{ background: tab === 'DOCTOR_CANCELLED' ? '#ef4444' : 'white', color: tab === 'DOCTOR_CANCELLED' ? 'white' : '#1e293b', borderColor: tab === 'DOCTOR_CANCELLED' ? '#ef4444' : '#e2e8f0' }} onClick={() => setTab('DOCTOR_CANCELLED')}>
          <AlertCircle size={14} /><span className="tab-label-desktop">Cancelled Appointments</span><span className="tab-label-mobile">Cancelled</span>
        </button>
      </div>

      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
        <Stethoscope size={32} color="#0284c7" style={{ margin: '0 auto 0.75rem' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>No appointments in queue</h3>
        <p style={{ fontSize: '0.82rem', margin: 0 }}>Scheduled patient visits for your shift will appear here.</p>
      </div>
    </div>
  );
};
