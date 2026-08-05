'use client';

import React from 'react';
import type { Appointment, Doctor, User } from '../types';
import { AppointmentCard } from './AppointmentCard';

interface Props {
  doctorsList: Doctor[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  appointments: Appointment[];
  currentUser: User | null;
  onRescheduleClick: (a: Appointment) => void;
  onCancelClick: (a: Appointment) => void;
}

export const AdminDoctorsPanel: React.FC<Props> = ({
  doctorsList, selectedId, setSelectedId, appointments, currentUser, onRescheduleClick, onCancelClick
}) => {
  const selectedDoc = doctorsList.find(d => d.id === selectedId) || doctorsList[0];
  const docAppts = selectedDoc ? appointments.filter(a => a.doctorId === selectedDoc.id || a.doctorName.includes(selectedDoc.name)) : [];

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <label className="form-label">Select Doctor to View Schedule</label>
        <select className="form-input" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          {doctorsList.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {docAppts.map(a => <AppointmentCard key={a.id} appointment={a} currentUser={currentUser} onRescheduleClick={onRescheduleClick} onCancelClick={onCancelClick} />)}
      </div>
    </div>
  );
};
