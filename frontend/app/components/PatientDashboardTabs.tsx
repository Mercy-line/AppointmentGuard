'use client';

import React from 'react';
import { Calendar, PlusCircle, AlertCircle } from 'lucide-react';

interface Props {
  tab: 'SCHEDULED' | 'BOOK_NEW' | 'CANCELLED';
  setTab: (t: 'SCHEDULED' | 'BOOK_NEW' | 'CANCELLED') => void;
}

export const PatientDashboardTabs: React.FC<Props> = ({ tab, setTab }) => (
  <div className="dashboard-tabs">
    <button type="button" className={`dashboard-tab-btn ${tab === 'BOOK_NEW' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('BOOK_NEW')}><PlusCircle size={14} /> Book</button>
    <button type="button" className={`dashboard-tab-btn ${tab === 'SCHEDULED' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('SCHEDULED')}><Calendar size={14} /> Scheduled</button>
    <button type="button" className={`dashboard-tab-btn ${tab === 'CANCELLED' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('CANCELLED')}><AlertCircle size={14} /> Cancelled</button>
  </div>
);
