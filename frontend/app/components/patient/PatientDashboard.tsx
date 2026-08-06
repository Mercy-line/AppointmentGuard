'use client';

import React, { useState } from 'react';
import { PlusCircle, Calendar, AlertCircle } from 'lucide-react';
import { LandingDoctors } from '../landing/LandingDoctors';
import type { AppContextType } from '../../hooks/useAppContext';

export const PatientDashboard: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const [tab, setTab] = useState<'BOOK_NEW' | 'SCHEDULED' | 'CANCELLED'>('SCHEDULED');

  return (
    <div>
      <div className="dashboard-tabs">
        <button type="button" className={`dashboard-tab-btn ${tab === 'BOOK_NEW' ? 'btn-primary' : 'btn-outline'}`} style={{ background: tab === 'BOOK_NEW' ? '#0284c7' : 'white', color: tab === 'BOOK_NEW' ? 'white' : '#1e293b' }} onClick={() => setTab('BOOK_NEW')}>
          <PlusCircle size={14} /><span className="tab-label-desktop">Book Appointment</span><span className="tab-label-mobile">Book</span>
        </button>
        <button type="button" className={`dashboard-tab-btn ${tab === 'SCHEDULED' ? 'btn-primary' : 'btn-outline'}`} style={{ background: tab === 'SCHEDULED' ? '#0284c7' : 'white', color: tab === 'SCHEDULED' ? 'white' : '#1e293b' }} onClick={() => setTab('SCHEDULED')}>
          <Calendar size={14} /><span className="tab-label-desktop">My Scheduled Appointments</span><span className="tab-label-mobile">Scheduled</span>
        </button>
        <button type="button" className={`dashboard-tab-btn ${tab === 'CANCELLED' ? 'btn-primary' : 'btn-outline'}`} style={{ background: tab === 'CANCELLED' ? '#ef4444' : 'white', color: tab === 'CANCELLED' ? 'white' : '#1e293b', borderColor: tab === 'CANCELLED' ? '#ef4444' : '#e2e8f0' }} onClick={() => setTab('CANCELLED')}>
          <AlertCircle size={14} /><span className="tab-label-desktop">Cancelled</span><span className="tab-label-mobile">Cancelled</span>
        </button>
      </div>
      {tab === 'BOOK_NEW' ? (
        <LandingDoctors ctx={ctx} />
      ) : (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
          No {tab.toLowerCase()} appointments on file.
        </div>
      )}
    </div>
  );
};
