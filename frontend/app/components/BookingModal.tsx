'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { AppContextType } from '../hooks/useAppContext';
import { DEFAULT_TIME_SLOTS } from '../data/constants';
import { isSlotAtLeast1HourInAdvance, getTodayMinDateStr } from '../lib/slotUtils';

export const BookingModal: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { modals, docs, auth } = ctx;
  const [selectedDate, setSelectedDate] = useState(getTodayMinDateStr());
  const [selectedSlot, setSelectedSlot] = useState(DEFAULT_TIME_SLOTS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!modals.isBookOpen) return null;
  const doc = docs.doctorsList.find(d => d.id === docs.selectedDoctorId) || docs.doctorsList[0];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Booking request logic
    setTimeout(() => {
      setIsSubmitting(false);
      modals.setIsBookOpen(false);
    }, 600);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <div className="brand-icon" style={{ margin: '0 auto 0.5rem' }}><Calendar size={18} /></div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Book Visit with {doc?.name}</h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Select a date and 30-minute slot (At least 1 hour in advance).</p>
        </div>
        <form onSubmit={handleBooking}>
          <div style={{ marginBottom: '0.85rem' }}>
            <label className="form-label">Appointment Date</label>
            <input type="date" className="form-input" min={getTodayMinDateStr()} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Select 30-Min Time Slot</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.4rem' }}>
              {DEFAULT_TIME_SLOTS.map(slot => {
                const isValid = isSlotAtLeast1HourInAdvance(slot, selectedDate);
                const isSelected = selectedSlot === slot;
                return (
                  <button type="button" key={slot} disabled={!isValid} onClick={() => setSelectedSlot(slot)} style={{ padding: '0.4rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`, background: isSelected ? '#e0f2fe' : isValid ? 'white' : '#f1f5f9', color: isSelected ? '#0369a1' : isValid ? '#334155' : '#94a3b8', cursor: isValid ? 'pointer' : 'not-allowed', opacity: isValid ? 1 : 0.5 }}>
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => modals.setIsBookOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>{isSubmitting ? 'Booking...' : 'Confirm Visit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
