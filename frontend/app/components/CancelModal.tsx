'use client';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { AppContextType } from '../hooks/useAppContext';

export const CancelModal: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { modals, appts } = ctx;
  const [reason, setReason] = useState('');
  if (!modals.isCancelOpen || !modals.activeAppt) return null;

  const onConfirm = async () => {
    if (!reason.trim()) return;
    await appts.handleCancel(modals.activeAppt!.id, reason.trim());
    modals.setIsCancelOpen(false); setReason('');
  };

  return (
    <div className="modal-backdrop" onClick={() => modals.setIsCancelOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ef4444', margin: 0, display: 'flex', gap: '0.4rem' }}><AlertCircle size={20} /> Cancel Appointment</h2>
          <button type="button" onClick={() => modals.setIsCancelOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ fontSize: '0.88rem', marginBottom: '1rem' }}>Cancelling with <strong>{modals.activeAppt.doctorName}</strong> on <strong>{modals.activeAppt.date}</strong> at <strong>{modals.activeAppt.time}</strong>.</div>
        <div className="form-group"><label className="form-label">Cancellation Reason (Required)</label><textarea className="form-input" rows={3} value={reason} onChange={e => setReason(e.target.value)} required /></div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => modals.setIsCancelOpen(false)}>Keep Appointment</button>
          <button type="button" className="btn-danger" style={{ flex: 1 }} onClick={onConfirm} disabled={!reason.trim()}>Confirm Cancel</button>
        </div>
      </div>
    </div>
  );
};
