'use client';

import React, { useState } from 'react';
import { Clock, Check } from 'lucide-react';
import type { AppContextType } from '../../hooks/useAppContext';

export const AdminTimeOffForm: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { docs } = ctx;
  const [selectedDocId, setSelectedDocId] = useState(docs.doctorsList[0]?.id || '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Doctor Time-Off schedule created successfully!');
    setReason(''); setStartTime(''); setEndTime('');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', maxWidth: '650px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <div className="brand-icon" style={{ width: '36px', height: '36px' }}><Clock size={18} /></div>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Schedule Practitioner Time-Off</h3>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Block out doctor working hours for leave, training, or emergencies.</p>
        </div>
      </div>
      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Check size={16} /> {successMsg}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.85rem' }}>
          <label className="form-label">Practitioner</label>
          <select className="form-select" value={selectedDocId} onChange={e => setSelectedDocId(e.target.value)}>
            {docs.doctorsList.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div>
            <label className="form-label">Start Date & Time</label>
            <input type="datetime-local" className="form-input" value={startTime} onChange={e => setStartTime(e.target.value)} required />
          </div>
          <div>
            <label className="form-label">End Date & Time</label>
            <input type="datetime-local" className="form-input" value={endTime} onChange={e => setEndTime(e.target.value)} required />
          </div>
        </div>
        <div style={{ marginBottom: '1.1rem' }}>
          <label className="form-label">Reason for Time-Off</label>
          <input type="text" className="form-input" placeholder="e.g. Annual Medical Leave / Conference" value={reason} onChange={e => setReason(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary" style={{ width: '100%', borderRadius: '10px', padding: '0.65rem' }}>
          Save Time-Off Blockout
        </button>
      </form>
    </div>
  );
};
