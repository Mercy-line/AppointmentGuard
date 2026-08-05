'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { AppContextType } from '../hooks/useAppContext';

export const LandingDoctors: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { docs, modals } = ctx;

  return (
    <section className="section section-tint" id="doctors-section">
      <div className="section-header">
        <h2 className="section-title">Our Doctors</h2>
        <p className="section-subtitle">Click on any doctor's name below to expand their timeline and available hours.</p>
      </div>

      {docs.isLoadingDoctors ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
          Loading doctors list from backend...
        </div>
      ) : docs.doctorsList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
          No active doctors registered in clinic database.
        </div>
      ) : (
        <div className="doctors-accordion-list">
          {docs.doctorsList.map(doc => {
            const isExpanded = !!docs.expandedDoctorIds[doc.id];
            return (
              <div key={doc.id} className="doctor-accordion-item">
                <div className="doctor-accordion-header" onClick={() => docs.toggleDoctorAccordion(doc.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #0284c7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#cff4fc',
                      color: '#087990', fontSize: '0.85rem', fontWeight: 800, flexShrink: 0
                    }}>
                      {doc.avatarInitials}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{doc.name}</span>
                      <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 500, marginLeft: '0.4rem' }}>({doc.specialization})</span>
                    </div>
                  </div>
                  <button type="button" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {isExpanded ? <ChevronUp size={18} color="#0284c7" /> : <ChevronDown size={18} />}
                  </button>
                </div>
                {isExpanded && (
                  <div className="doctor-accordion-content">
                    <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.35rem' }}><strong>Specialization:</strong> {doc.specialization}</p>
                    <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem' }}><strong>Timeline & Available Hours:</strong> {doc.hours} (30-minute consultation slots)</p>
                    <button type="button" className="btn-primary" style={{ fontSize: '0.78rem', padding: '0.4rem 1rem', borderRadius: '20px' }} onClick={() => modals.setIsLoginOpen(true)}>
                      Book Appointment with {doc.name}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
