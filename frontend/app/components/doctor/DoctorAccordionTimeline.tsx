'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import type { Doctor } from '../../types';
import { DEFAULT_TIME_SLOTS } from '../../data/constants';
import { isSlotValidWithAdvanceNotice } from '../../lib/slotUtils';

interface Props {
  doc: Doctor;
  isExpanded: boolean;
  onToggle: () => void;
  selectedDate: string;
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
}

export const DoctorAccordionTimeline: React.FC<Props> = ({
  doc, isExpanded, onToggle, selectedDate, selectedSlot, onSelectSlot
}) => (
  <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
    <button type="button" onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <Calendar size={13} /> {isExpanded ? 'Hide Doctor Schedule Timeline' : 'View Working Timeline & Slots'}
      </span>
      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{isExpanded ? '▲' : '▼'}</span>
    </button>
    {isExpanded && (
      <div style={{ marginTop: '0.75rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Clock size={12} /> Standard Shift: 9:00 AM – 5:00 PM (30-Min Intervals)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.35rem' }}>
          {DEFAULT_TIME_SLOTS.map(slot => {
            const isValid = isSlotValidWithAdvanceNotice(slot.time, selectedDate);
            const isSel = selectedSlot === slot.time;
            return (
              <button
                type="button"
                key={slot.time}
                disabled={!isValid}
                onClick={() => isValid && onSelectSlot(slot.time)}
                style={{
                  padding: '0.35rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600,
                  border: `1px solid ${isSel ? '#0284c7' : '#e2e8f0'}`,
                  background: isSel ? '#e0f2fe' : isValid ? 'white' : '#f1f5f9',
                  color: isSel ? '#0369a1' : isValid ? '#334155' : '#94a3b8',
                  cursor: isValid ? 'pointer' : 'not-allowed', opacity: isValid ? 1 : 0.5
                }}
              >
                {slot.time}
              </button>
            );
          })}
        </div>
      </div>
    )}
  </div>
);
