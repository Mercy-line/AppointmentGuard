'use client';

import React, { useState } from 'react';
import { UserPlus, Check } from 'lucide-react';
import type { AppContextType } from '../../hooks/useAppContext';

export const RegisterModal: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { modals, patients } = ctx;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [msg, setMsg] = useState<string | null>(null);

  if (!modals.isRegisterOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient = { id: `P${Date.now()}`, email, username: email.split('@')[0], name, role };
    patients.setPatientsList(prev => [newPatient, ...prev]);
    setMsg(`Patient ${name} registered successfully!`);
    setTimeout(() => {
      setMsg(null);
      setName(''); setEmail('');
      modals.setIsRegisterOpen(false);
    }, 1000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <div className="brand-icon" style={{ margin: '0 auto 0.5rem' }}><UserPlus size={18} /></div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Register New Patient</h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Create a new patient record in system directory.</p>
        </div>
        {msg && <div style={{ background: '#ecfdf5', color: '#065f46', padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '0.8rem', textAlign: 'center' }}>{msg}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" placeholder="e.g. Jane Wanjiku" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="e.g. jane@patient.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Role</label>
            <select className="form-select" value={role} onChange={e => setRole(e.target.value as any)}>
              <option value="PATIENT">PATIENT</option>
              <option value="DOCTOR">DOCTOR</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => modals.setIsRegisterOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}><UserPlus size={14} /> Add Patient</button>
          </div>
        </form>
      </div>
    </div>
  );
};
