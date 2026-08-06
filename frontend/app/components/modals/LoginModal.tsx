'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import type { AppContextType } from '../../hooks/useAppContext';

export const LoginModal: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { auth, modals } = ctx;
  const [showPassword, setShowPassword] = useState(false);
  if (!modals.isLoginOpen) return null;

  const onSubmit = async (e: React.FormEvent) => {
    const success = await auth.handleLoginSubmit(e);
    if (success) modals.setIsLoginOpen(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ marginBottom: '1.1rem', textAlign: 'center' }}>
          <div className="brand-icon" style={{ margin: '0 auto 0.65rem' }}><Lock size={18} /></div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Sign In to AppointmentGuard</h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>Enter credentials to access portal.</p>
        </div>
        {auth.authError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.6rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '0.85rem' }}>{auth.authError}</div>
        )}
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '0.85rem' }}>
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="e.g. john@patient.com" value={auth.loginEmail} onChange={e => auth.setLoginEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '1.1rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input type={showPassword ? 'text' : 'password'} className="form-input" style={{ paddingRight: '2.5rem' }} placeholder="Enter password" value={auth.loginPassword} onChange={e => auth.setLoginPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', borderRadius: '10px', fontSize: '0.85rem' }}>Sign In</button>
        </form>
        <button type="button" style={{ width: '100%', marginTop: '0.85rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }} onClick={() => modals.setIsLoginOpen(false)}>Close</button>
      </div>
    </div>
  );
};
