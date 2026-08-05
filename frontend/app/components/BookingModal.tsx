'use client';

import React, { useState } from 'react';
import { X, Clock, Check } from 'lucide-react';
import type { AppContextType } from '../hooks/useAppContext';
import { DEFAULT_TIME_SLOTS } from '../data/constants';

export const BookingModal: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { modals, docs, appts, auth, setCurrentView, setPatientTab } = ctx;
  const [patientBookingName, setPatientBookingName] = useState('John Doe');
  if (!modals.isBookOpen) return null;

  const doc = docs.doctorsList.find(d => d.id === docs.selectedDoctorId) || docs.doctorsList[0];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appts.selectedTimeSlot) return;
    await appts.handleBook(doc.id, patientBookingName);
    modals.setIsBookOpen(false);
    if (auth.currentUser) { setCurrentView('DASHBOARD'); setPatientTab('SCHEDULED'); }
    else { modals.setIsLoginOpen(true); }
  };

  return (
    <div className="modal-backdrop" onClick={() => modals.setIsBookOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Book Appointment Slot</h2>
          <button type="button" onClick={() => modals.setIsBookOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Select Specialist</label>
            <select className="form-input" value={docs.selectedDoctorId} onChange={e => docs.setSelectedDoctorId(e.target.value)}>
              {docs.doctorsList.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Select Date</label><input type="date" className="form-input" value={appts.selectedDate} onChange={e => appts.setSelectedDate(e.target.value)} required /></div>
          <div className="form-group">
            <label className="form-label">30-Minute Grid Slots</label>
            <div className="slots-grid">
              {DEFAULT_TIME_SLOTS.map((s, i) => (
                <button type="button" key={i} className={`slot-chip ${appts.selectedTimeSlot === s.time ? 'selected' : ''}`} disabled={!s.available} onClick={() => appts.setSelectedTimeSlot(s.time)}>
                  <Clock size={12} /> {s.time}
                </button>
              ))}
            </div>
          </div>
          {!auth.currentUser && <div className="form-group"><label className="form-label">Patient Name</label><input type="text" className="form-input" value={patientBookingName} onChange={e => setPatientBookingName(e.target.value)} required /></div>}
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={!appts.selectedTimeSlot}><Check size={16} /> Confirm Booking</button>
        </form>
      </div>
    </div>
  );
};
