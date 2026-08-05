'use client';

import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { Appointment, User } from '../types';

interface Props {
  appointment: Appointment;
  currentUser: User | null;
}

export const AppointmentCardHeader: React.FC<Props> = ({ appointment, currentUser }) => {
  const isCancelled = appointment.status === 'CANCELLED';
  const isNeedsReschedule = appointment.status === 'NEEDS_RESCHEDULE';
  const isBooked = appointment.status === 'BOOKED' || appointment.status === 'CONFIRMED';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
          {currentUser?.role === 'DOCTOR' ? `Patient: ${appointment.patientName}` : `Doctor: ${appointment.doctorName}`}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600, marginTop: '0.1rem' }}>
          {appointment.specialization || 'General Consultation'}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {isBooked && <span className="badge badge-booked"><CheckCircle2 size={12} /> BOOKED</span>}
        {isNeedsReschedule && <span className="badge badge-needs-reschedule"><AlertCircle size={12} /> NEEDS RESCHEDULE</span>}
        {isCancelled && <span className="badge badge-cancelled"><AlertCircle size={12} /> CANCELLED</span>}
      </div>
    </div>
  );
};
