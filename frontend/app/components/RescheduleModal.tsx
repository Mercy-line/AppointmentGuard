'use client';

import React, { useState } from 'react';
import { X, Clock, RefreshCw } from 'lucide-react';
import type { AppContextType } from '../hooks/useAppContext';
import { DEFAULT_TIME_SLOTS } from '../data/constants';

export const RescheduleModal: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { modals, appts } = ctx;
  const [resDate, setResDate] = useState('2026-08-07');
  const [resSlot, setResSlot] = useState<string | null>(null);

  if (!modals.isRescheduleOpen || !modals.activeAppt) return null;

  const onConfirm = async () => {
    if (!resSlot) return;
    await appts.handleReschedule(modals.activeAppt!.id, resDate, resSlot);
    modals.setIsRescheduleOpen(false); setResSlot(null);
  };

  return (
    <div className="modal-backdrop" onClick={() => modals.setIsRescheduleOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0284c7', margin: 0, display: 'flex', gap: '0.4rem' }}><RefreshCw size={20} /> Reschedule Appointment</h2>
          <button type="button" onClick={() => modals.setIsRescheduleOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div className="form-group"><label className="form-label">New Date</label><input type="date" className="form-input" value={resDate} onChange={e => setResDate(e.target.value)} required /></div>
        <div className="form-group">
          <label className="form-label">New 30-Min Slot</label>
          <div className="slots-grid">
            {DEFAULT_TIME_SLOTS.map((s, i) => (
              <button type="button" key={i} className={`slot-chip ${resSlot === s.time ? 'selected' : ''}`} disabled={!s.available} onClick={() => setResSlot(s.time)}>
                <Clock size={12} /> {s.time}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => modals.setIsRescheduleOpen(false)}>Keep Slot</button>
          <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={onConfirm} disabled={!resSlot}>Confirm Reschedule</button>
        </div>
      </div>
    </div>
  );
};
