'use client';

import React from 'react';
import { X, Calendar } from 'lucide-react';
import type { AppContextType } from '../hooks/useAppContext';

export const TimeOffModal: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { modals, timeOff, docs, auth, appts } = ctx;
  if (!modals.isTimeOffOpen) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const docId = auth.currentUser?.role === 'DOCTOR' ? (docs.doctorsList[0]?.id || '1') : docs.selectedDoctorId;
    const docName = docs.doctorsList.find(d => d.id === docId)?.name || 'Doctor';
    timeOff.addTimeOff(docId, docName);

    appts.setAppointments(prev => prev.map(a => {
      if (a.doctorId === docId && (a.status === 'CONFIRMED' || a.status === 'BOOKED')) {
        return { ...a, status: 'CANCELLED', cancellationReason: `Doctor Time-Off (${timeOff.reason}).`, notificationSent: true };
      }
      return a;
    }));
    modals.setIsTimeOffOpen(false);
  };

  return (
    <div className="modal-backdrop" onClick={() => modals.setIsTimeOffOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', gap: '0.4rem' }}><Calendar size={20} /> Doctor Time-Off</h2>
          <button type="button" onClick={() => modals.setIsTimeOffOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={onSubmit}>
          {auth.currentUser?.role === 'ADMIN' && (
            <div className="form-group">
              <label className="form-label">Target Doctor</label>
              <select className="form-input" value={docs.selectedDoctorId} onChange={e => docs.setSelectedDoctorId(e.target.value)}>
                {docs.doctorsList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          )}
          <div className="form-group"><label className="form-label">Start</label><input type="datetime-local" className="form-input" value={timeOff.startTime} onChange={e => timeOff.setStartTime(e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">End</label><input type="datetime-local" className="form-input" value={timeOff.endTime} onChange={e => timeOff.setEndTime(e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Reason</label><input type="text" className="form-input" value={timeOff.reason} onChange={e => timeOff.setReason(e.target.value)} required /></div>
          <button type="submit" className="btn-danger" style={{ width: '100%' }}>Confirm Emergency Time-Off</button>
        </form>
      </div>
    </div>
  );
};
