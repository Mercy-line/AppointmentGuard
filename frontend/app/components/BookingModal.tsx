'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { AppContextType } from '../hooks/useAppContext';
import { DEFAULT_TIME_SLOTS } from '../data/constants';
import { getTodayDateStr, isSlotValidWithAdvanceNotice } from '../lib/slotUtils';

export const BookingModal: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { modals, docs } = ctx;
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  if (!modals.isBookOpen) return null;
  const activeDoc = docs.doctorsList.find(d => d.id === docs.selectedDoctorId) || docs.doctorsList[0];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    if (selectedDate < getTodayDateStr()) { alert("Appointments cannot be booked in the past."); return; }
    if (!isSlotValidWithAdvanceNotice(selectedSlot, selectedDate)) { alert("Appointments must be booked at least 1 hour in advance."); return; }
    modals.setIsBookOpen(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <div className="brand-icon" style={{ margin: '0 auto 0.5rem' }}><Calendar size={18} /></div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Book Visit with {activeDoc?.name}</h3>
        </div>
        <form onSubmit={handleBooking}>
          <div style={{ marginBottom: '0.85rem' }}>
            <label className="form-label">Doctor</label>
            <select className="form-select" value={docs.selectedDoctorId || activeDoc?.id} onChange={e => docs.setSelectedDoctorId(e.target.value)}>
              {docs.doctorsList.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '0.85rem' }}>
            <label className="form-label">Visit Date</label>
            <input type="date" className="form-input" min={getTodayDateStr()} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Select 30-Min Time Slot</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.4rem' }}>
              {DEFAULT_TIME_SLOTS.map(slot => {
                const isValid = isSlotValidWithAdvanceNotice(slot.time, selectedDate);
                const isSel = selectedSlot === slot.time;
                return (
                  <button type="button" key={slot.time} disabled={!isValid} onClick={() => isValid && setSelectedSlot(slot.time)} style={{ padding: '0.4rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${isSel ? '#0284c7' : '#e2e8f0'}`, background: isSel ? '#e0f2fe' : isValid ? 'white' : '#f1f5f9', color: isSel ? '#0369a1' : isValid ? '#334155' : '#94a3b8', cursor: isValid ? 'pointer' : 'not-allowed', opacity: isValid ? 1 : 0.5 }}>{slot.time}</button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => modals.setIsBookOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={!selectedSlot}>Confirm Visit</button>
          </div>
        </form>
      </div>
    </div>
  );
};
