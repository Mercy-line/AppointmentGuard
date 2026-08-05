'use client';

import React from 'react';

interface Props {
  onFill: (role: 'PATIENT' | 'DOCTOR' | 'ADMIN') => void;
}

export const LoginDemoButtons: React.FC<Props> = ({ onFill }) => (
  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>Quick Fill Demo Accounts:</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
      <button type="button" className="btn-sm-outline" style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem' }} onClick={() => onFill('PATIENT')}>Patient Demo</button>
      <button type="button" className="btn-sm-outline" style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem' }} onClick={() => onFill('DOCTOR')}>Doctor Demo</button>
      <button type="button" className="btn-sm-outline" style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem' }} onClick={() => onFill('ADMIN')}>Admin Demo</button>
    </div>
  </div>
);
