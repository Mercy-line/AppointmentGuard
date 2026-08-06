'use client';

import React, { useState } from 'react';
import { Users, Search, Stethoscope, Mail, Clock, CheckCircle } from 'lucide-react';
import type { AppContextType } from '../../hooks/useAppContext';

export const AdminDoctorsDirectory: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { docs } = ctx;
  const [search, setSearch] = useState('');

  const filteredDoctors = docs.doctorsList.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase()) ||
    (d.email && d.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="#0284c7" /> Clinic Doctors Directory ({docs.doctorsList.length})
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>All active medical staff and specializations.</p>
        </div>
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', fontSize: '0.8rem' }}
            placeholder="Search doctor or specialty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map(doc => (
            <div key={doc.id} style={{ padding: '1.1rem', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="brand-icon" style={{ width: '42px', height: '42px', fontSize: '0.9rem', flexShrink: 0 }}>
                  {doc.avatarInitials || doc.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>{doc.name}</div>
                  <span className="role-badge role-doctor" style={{ fontSize: '0.7rem' }}>
                    <Stethoscope size={10} style={{ display: 'inline', marginRight: '3px' }} />
                    {doc.specialization}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={13} color="#64748b" /> {doc.email || `${doc.name.toLowerCase().replace(/[^a-z]/g, '')}@clinic.com`}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={13} color="#64748b" /> {doc.hours || 'Mon–Fri, 9:00 AM – 5:00 PM'} ({doc.slotDurationMinutes || 30}m slots)
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem', marginTop: '0.2rem', fontSize: '0.75rem' }}>
                <span style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle size={12} /> Active Practice
                </span>
                <span style={{ color: '#64748b', fontWeight: 500 }}>ID: #{doc.id}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', padding: '2rem' }}>
            No doctors found matching search query.
          </div>
        )}
      </div>
    </div>
  );
};
