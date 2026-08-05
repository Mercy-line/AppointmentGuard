'use client';

import React from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { LoginDemoButtons } from './LoginDemoButtons';
import type { AppContextType } from '../hooks/useAppContext';

export const LoginModal: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { auth, modals, setCurrentView, setPatientTab, setDoctorTab, setAdminTab } = ctx;
  if (!modals.isLoginOpen) return null;

  const onLogin = async (e: React.FormEvent) => {
    const ok = await auth.handleLoginSubmit(e);
    if (ok) {
      modals.setIsLoginOpen(false); setCurrentView('DASHBOARD');
      setPatientTab('SCHEDULED'); setDoctorTab('DOCTOR_QUEUE'); setAdminTab('ADMIN_OVERVIEW');
    }
  };

  const fillDemo = (role: 'PATIENT' | 'DOCTOR' | 'ADMIN') => {
    if (role === 'PATIENT') { auth.setLoginEmail('john@patient.com'); auth.setLoginPassword('PatientPass123!'); }
    else if (role === 'DOCTOR') { auth.setLoginEmail('dr.alice@clinic.com'); auth.setLoginPassword('DoctorPass123!'); }
    else { auth.setLoginEmail('admin@appointmentguard.com'); auth.setLoginPassword('AdminPass123!'); }
  };

  return (
    <div className="modal-backdrop" onClick={() => modals.setIsLoginOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Sign In to AppointmentGuard</h2>
          <button type="button" onClick={() => modals.setIsLoginOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        {auth.authError && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.8rem' }}>{auth.authError}</div>}
        <form onSubmit={onLogin}>
          <div className="form-group">
            <label className="form-label">Email Address / Username</label>
            <input type="text" className="form-input" placeholder="e.g. john@patient.com" value={auth.loginEmail} onChange={e => auth.setLoginEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input type={auth.showPassword ? "text" : "password"} className="form-input" placeholder="Enter password" value={auth.loginPassword} onChange={e => auth.setLoginPassword(e.target.value)} required />
              <button type="button" onClick={() => auth.setShowPassword(p => !p)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer' }}>
                {auth.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={auth.isLoggingIn}><Lock size={16} /> {auth.isLoggingIn ? 'Authenticating...' : 'Sign In'}</button>
          <LoginDemoButtons onFill={fillDemo} />
        </form>
      </div>
    </div>
  );
};
