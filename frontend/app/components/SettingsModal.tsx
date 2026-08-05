'use client';

import React, { useState } from 'react';
import { X, Lock, Check } from 'lucide-react';
import type { AppContextType } from '../hooks/useAppContext';

export const SettingsModal: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { modals } = ctx;
  const [curr, setCurr] = useState('');
  const [next, setNext] = useState('');
  const [conf, setConf] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!modals.isSettingsOpen) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setMsg(null);
    if (next.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    if (next !== conf) { setErr('Passwords do not match.'); return; }
    setMsg('Password updated successfully!'); setCurr(''); setNext(''); setConf('');
  };

  return (
    <div className="modal-backdrop" onClick={() => modals.setIsSettingsOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Account Settings</h2>
          <button type="button" onClick={() => modals.setIsSettingsOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        {msg && <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.8rem' }}><Check size={16} /> {msg}</div>}
        {err && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.8rem' }}>{err}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input" value={curr} onChange={e => setCurr(e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" value={next} onChange={e => setNext(e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Confirm New Password</label><input type="password" className="form-input" value={conf} onChange={e => setConf(e.target.value)} required /></div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}><Lock size={16} /> Update Password</button>
        </form>
      </div>
    </div>
  );
};
