'use client';

import React from 'react';
import { Search, User as UserIcon } from 'lucide-react';
import type { AppContextType } from '../hooks/useAppContext';
import type { User } from '../types';

export const PatientDirectory: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { patients } = ctx;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Registered Patients Directory ({patients.totalPatientsCount})</h3>
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input type="text" className="form-input" placeholder="Search patient by name or email..." value={patients.searchQuery} onChange={e => patients.setSearchQuery(e.target.value)} style={{ paddingLeft: '2.25rem', fontSize: '0.82rem' }} />
        </div>
      </div>
      {patients.filteredPatients.length === 0 ? (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>No matching registered patients found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {patients.filteredPatients.map((p: User, i: number) => (
            <div key={p.id || i} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                <UserIcon size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{p.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.email}</div>
                <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600, marginTop: '0.15rem' }}>ID: #{p.id}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
