'use client';

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import type { AppContextType } from '../../hooks/useAppContext';
import { registerAPI } from '../../lib/api';

export const RegisterModal: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { modals, patients, docs } = ctx;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [specialization, setSpecialization] = useState('General Practice');
  const [msg, setMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!modals.isRegisterOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await registerAPI({ email, name, role, pass: 'Pass123!', spec: specialization });
    } catch {
      // Offline fallback
    }

    if (role === 'DOCTOR') {
      const newDoc = {
        id: `D${Date.now()}`,
        name,
        email,
        specialization,
        hours: 'Mon–Fri, 9:00 AM – 5:00 PM',
        avatarInitials: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        slotDurationMinutes: 30
      };
      docs.setDoctorsList(prev => [newDoc, ...prev]);
    }

    const newPatient = { id: `P${Date.now()}`, email, username: email.split('@')[0], name, role };
    patients.setPatientsList(prev => [newPatient, ...prev.filter(p => p.email !== email)]);

    setMsg(`${role === 'DOCTOR' ? 'Doctor' : 'Patient'} ${name} registered successfully!`);
    setIsSubmitting(false);
    setTimeout(() => {
      setMsg(null);
      setName(''); setEmail('');
      modals.setIsRegisterOpen(false);
    }, 1200);
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
          <div style={{ marginBottom: '0.75rem' }}>
            <label className="form-label">Role</label>
            <select className="form-select" value={role} onChange={e => setRole(e.target.value as any)}>
              <option value="PATIENT">PATIENT</option>
              <option value="DOCTOR">DOCTOR</option>
            </select>
          </div>
          {role === 'DOCTOR' && (
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Specialization</label>
              <input type="text" className="form-input" placeholder="e.g. Cardiology" value={specialization} onChange={e => setSpecialization(e.target.value)} required />
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn-outline" style={{ flex: 1 }} disabled={isSubmitting} onClick={() => modals.setIsRegisterOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
              <UserPlus size={14} /> {isSubmitting ? 'Registering...' : `Add ${role === 'DOCTOR' ? 'Doctor' : 'Patient'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
