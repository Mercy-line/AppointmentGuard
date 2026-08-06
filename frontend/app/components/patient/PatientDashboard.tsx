'use client';

import React, { useState } from 'react';
import { PlusCircle, Calendar, AlertCircle, Heart } from 'lucide-react';
import { LandingDoctors } from '../landing/LandingDoctors';
import type { AppContextType } from '../../hooks/useAppContext';

export const PatientDashboard: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const [tab, setTab] = useState<'BOOK_NEW' | 'SCHEDULED' | 'CANCELLED'>('SCHEDULED');
  const user = ctx.auth.currentUser;

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Welcome back, {user?.name || 'Patient'}!</h2>
        <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.35rem', marginBottom: 0 }}>
          Manage your upcoming 30-minute healthcare consultations and family dependent visits.
        </p>
      </div>

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
        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
          <Heart size={32} color="#0284c7" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>No {tab.toLowerCase()} appointments on file</h3>
          <p style={{ fontSize: '0.82rem', margin: 0 }}>Click "Book Appointment" to reserve a 30-minute consultation slot.</p>
        </div>
      )}
    </div>
  );
};
