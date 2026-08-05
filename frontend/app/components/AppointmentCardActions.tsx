'use client';

import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import type { Appointment } from '../types';

interface Props {
  appointment: Appointment;
  onRescheduleClick: (a: Appointment) => void;
  onCancelClick: (a: Appointment) => void;
}

export const AppointmentCardActions: React.FC<Props> = ({ appointment, onRescheduleClick, onCancelClick }) => (
  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
    <button type="button" className="btn-sm-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }} onClick={() => onRescheduleClick(appointment)}>
      <RefreshCw size={13} /> Reschedule
    </button>
    <button type="button" className="btn-sm-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }} onClick={() => onCancelClick(appointment)}>
      <AlertCircle size={13} /> Cancel
    </button>
  </div>
);
