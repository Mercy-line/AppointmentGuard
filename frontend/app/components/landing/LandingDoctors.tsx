'use client';

import React, { useState } from 'react';
import type { AppContextType } from '../../hooks/useAppContext';
import { DoctorCard } from '../doctor/DoctorCard';
import { getTodayDateStr } from '../../lib/slotUtils';

export const LandingDoctors: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { docs, modals } = ctx;
  const [selectedDate] = useState(getTodayDateStr());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const handleBookClick = (docId: string) => {
    docs.setSelectedDoctorId(docId);
    modals.setIsBookOpen(true);
  };

  return (
    <section id="doctors-section" style={{ padding: '3.5rem 1.5rem', background: 'white' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Our Official Clinic Doctors</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Select a practitioner below to inspect their shift timeline and reserve a 30-minute slot.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {docs.doctorsList.map(doc => (
            <DoctorCard
              key={doc.id}
              doc={doc}
              isExpanded={!!docs.expandedDoctorIds[doc.id]}
              onToggle={() => docs.toggleDoctorAccordion(doc.id)}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              onBookClick={handleBookClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
