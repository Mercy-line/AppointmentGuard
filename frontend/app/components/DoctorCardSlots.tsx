'use client';

import React from 'react';
import { isSlotAtLeast1HourInAdvance } from '../lib/slotUtils';

interface Props {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  timeSlots: string[];
  selectedTimeSlot: string;
  setSelectedTimeSlot: (slot: string) => void;
  onBookClick: () => void;
}

export const DoctorCardSlots: React.FC<Props> = ({
  selectedDate, setSelectedDate, timeSlots, selectedTimeSlot, setSelectedTimeSlot, onBookClick
}) => (
  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
      <label className="form-label" style={{ margin: 0 }}>Select Visit Date & 30-Min Time Slot (Min. 1 hr in advance):</label>
      <input type="date" className="form-input" style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
      {timeSlots.map(slot => {
        const isValidAdvance = isSlotAtLeast1HourInAdvance(slot, selectedDate);
        const isSelected = selectedTimeSlot === slot;
        return (
          <button
            type="button"
            key={slot}
            disabled={!isValidAdvance}
            onClick={() => setSelectedTimeSlot(slot)}
            style={{
              padding: '0.45rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600,
              border: `1px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
              background: isSelected ? '#e0f2fe' : isValidAdvance ? 'white' : '#f1f5f9',
              color: isSelected ? '#0369a1' : isValidAdvance ? '#334155' : '#94a3b8',
              cursor: isValidAdvance ? 'pointer' : 'not-allowed',
              opacity: isValidAdvance ? 1 : 0.55
            }}
          >
            {slot}
          </button>
        );
      })}
    </div>
    <button type="button" className="btn-primary" style={{ width: '100%', borderRadius: '10px' }} onClick={onBookClick}>
      Book 30-Min Appointment Slot
    </button>
  </div>
);
