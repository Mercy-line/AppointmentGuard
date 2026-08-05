'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import type { TimeSlot } from '../types';

interface Props {
  doctorName: string;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  timeSlots: TimeSlot[];
  selectedSlot: string | null;
  setSelectedSlot: (s: string) => void;
  onBookClick: () => void;
}

export const DoctorCardSlots: React.FC<Props> = ({
  doctorName, selectedDate, setSelectedDate, timeSlots, selectedSlot, setSelectedSlot, onBookClick
}) => (
  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
      <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155' }}>Available 30-Min Grid Slots for {selectedDate}:</span>
      <input type="date" className="form-input" style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem', width: 'auto' }} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
    </div>
    <div className="slots-grid" style={{ marginBottom: '1rem' }}>
      {timeSlots.map((s, i) => (
        <button type="button" key={i} className={`slot-chip ${selectedSlot === s.time ? 'selected' : ''}`} disabled={!s.available} onClick={() => setSelectedSlot(s.time)}>
          <Clock size={12} /> {s.time}
        </button>
      ))}
    </div>
    <button type="button" className="btn-primary" style={{ width: '100%', fontSize: '0.82rem', padding: '0.55rem' }} onClick={onBookClick}>
      Book Appointment with {doctorName}
    </button>
  </div>
);
