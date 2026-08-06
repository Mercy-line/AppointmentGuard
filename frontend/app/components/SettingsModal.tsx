'use client';

import React, { useState } from 'react';
import { Settings, Key } from 'lucide-react';
import type { AppContextType } from '../hooks/useAppContext';

export const SettingsModal: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { modals, auth } = ctx;
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  if (!modals.isSettingsOpen || !auth.currentUser) return null;

  const handlePassChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setMsg('New passwords do not match');
      return;
    }
    setMsg('Password updated successfully!');
    setTimeout(() => {
      setMsg(null);
      modals.setIsSettingsOpen(false);
    }, 1000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <div className="brand-icon" style={{ margin: '0 auto 0.5rem' }}><Settings size={18} /></div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Account Settings</h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Update password for {auth.currentUser.email}</p>
        </div>
        {msg && <div style={{ background: '#ecfdf5', color: '#065f46', padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '0.8rem', textAlign: 'center' }}>{msg}</div>}
        <form onSubmit={handlePassChange}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" value={currPass} onChange={e => setCurrPass(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" value={newPass} onChange={e => setNewPass(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Confirm New Password</label>
            <input type="password" className="form-input" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => modals.setIsSettingsOpen(false)}>Close</button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}><Key size={14} /> Update Password</button>
          </div>
        </form>
      </div>
    </div>
  );
};
