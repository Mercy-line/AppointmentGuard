'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { PatientCard } from './PatientCard';
import type { AppContextType } from '../hooks/useAppContext';

export const PatientDirectory: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { patients } = ctx;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Registered Patients Directory ({patients.totalPatientsCount})</h2>
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input type="text" className="form-input" placeholder="Search patient by name or email..." value={patients.searchQuery} onChange={e => patients.setSearchQuery(e.target.value)} style={{ paddingLeft: '2.25rem', fontSize: '0.82rem' }} />
        </div>
      </div>
      {patients.filteredPatients.length === 0 ? (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>No patients found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {patients.filteredPatients.map((p, i) => <PatientCard key={p.id || i} patient={p} />)}
        </div>
      )}
    </div>
  );
};
