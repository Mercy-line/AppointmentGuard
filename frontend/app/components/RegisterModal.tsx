'use client';

import React from 'react';
import { X, PlusCircle, Eye, EyeOff } from 'lucide-react';
import type { AppContextType } from '../hooks/useAppContext';
import type { UserRole } from '../types';

export const RegisterModal: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { auth, modals, docs, patients } = ctx;
  if (!modals.isRegisterOpen) return null;

  const onRegister = async (e: React.FormEvent) => {
    const newUser = await auth.handleRegisterSubmit(e);
    if (newUser) {
      if (newUser.role === 'DOCTOR') docs.reloadDoctors();
      if (newUser.role === 'PATIENT') patients.setPatientsList(p => [{ id: newUser.id, first_name: newUser.name, last_name: '', email: newUser.email, username: newUser.username, role: 'PATIENT' }, ...p]);
      modals.setIsRegisterOpen(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => modals.setIsRegisterOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Add New User Account (Admin)</h2>
          <button type="button" onClick={() => modals.setIsRegisterOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        {auth.regError && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.8rem' }}>{auth.regError}</div>}
        <form onSubmit={onRegister}>
          <div className="form-group"><label className="form-label">Full Name</label><input type="text" className="form-input" placeholder="e.g. Dr. Jane Wanjiru" value={auth.regName} onChange={e => auth.setRegName(e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Email Address</label><input type="email" className="form-input" placeholder="mark@patient.com" value={auth.regEmail} onChange={e => auth.setRegEmail(e.target.value)} required /></div>
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <select className="form-input" value={auth.regRole} onChange={e => auth.setRegRole(e.target.value as UserRole)}>
              <option value="PATIENT">Patient Account</option><option value="DOCTOR">Doctor Account</option><option value="ADMIN">System Admin</option>
            </select>
          </div>
          {auth.regRole === 'DOCTOR' && (<div className="form-group"><label className="form-label">Medical Specialization</label><input type="text" className="form-input" value={auth.regSpecialization} onChange={e => auth.setRegSpecialization(e.target.value)} required /></div>)}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input type={auth.showRegPassword ? "text" : "password"} className="form-input" value={auth.regPassword} onChange={e => auth.setRegPassword(e.target.value)} required />
              <button type="button" onClick={() => auth.setShowRegPassword(p => !p)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none' }}>{auth.showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={auth.isRegistering}><PlusCircle size={16} /> {auth.isRegistering ? 'Creating...' : 'Create Account'}</button>
        </form>
      </div>
    </div>
  );
};
