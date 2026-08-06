'use client';

import React from 'react';
import { Search, User as UserIcon } from 'lucide-react';
import type { AppContextType } from '../../hooks/useAppContext';

export const PatientDirectory: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { patients } = ctx;

  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserIcon size={18} color="#0284c7" /> Registered Patients Directory ({patients.totalPatientsCount})
        </h3>
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', fontSize: '0.8rem' }}
            placeholder="Search patient name or email..."
            value={patients.patientSearchQuery}
            onChange={e => patients.setPatientSearchQuery(e.target.value)}
          />
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.85rem' }}>
        {patients.filteredPatients.length > 0 ? (
          patients.filteredPatients.map(p => (
            <div key={p.id} style={{ padding: '0.85rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{p.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.email}</div>
              <span className="role-badge role-patient" style={{ marginTop: '0.4rem', display: 'inline-block' }}>PATIENT</span>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', padding: '1rem' }}>No patients found matching search.</div>
        )}
      </div>
    </div>
  );
};
