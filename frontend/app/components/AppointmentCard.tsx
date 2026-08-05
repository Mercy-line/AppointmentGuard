'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import type { Appointment, User } from '../types';
import { AppointmentCardHeader } from './AppointmentCardHeader';
import { AppointmentCardActions } from './AppointmentCardActions';

interface Props {
  appointment: Appointment;
  currentUser: User | null;
  onRescheduleClick: (appt: Appointment) => void;
  onCancelClick: (appt: Appointment) => void;
}

export const AppointmentCard: React.FC<Props> = ({ appointment, currentUser, onRescheduleClick, onCancelClick }) => {
  const isCancelled = appointment.status === 'CANCELLED';

  return (
    <div className={`appointment-card ${isCancelled ? 'cancelled-card' : ''}`}>
      <AppointmentCardHeader appointment={appointment} currentUser={currentUser} />
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.82rem', color: '#475569' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={13} color="#0284c7" /> {appointment.date}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={13} color="#0284c7" /> {appointment.time} (UTC)</span>
      </div>
      {appointment.cancellationReason && (
        <div style={{ marginTop: '0.65rem', background: '#fff1f2', color: '#9f1239', padding: '0.5rem', borderRadius: '8px', fontSize: '0.78rem' }}>
          <strong>Reason:</strong> {appointment.cancellationReason}
        </div>
      )}
      {!isCancelled && <AppointmentCardActions appointment={appointment} onRescheduleClick={onRescheduleClick} onCancelClick={onCancelClick} />}
    </div>
  );
};
