'use client';

import React from 'react';
import { DoctorCard } from './DoctorCard';
import type { AppContextType } from '../hooks/useAppContext';
import { DEFAULT_TIME_SLOTS } from '../data/constants';

export const LandingDoctors: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { docs, appts, modals } = ctx;

  return (
    <section id="doctors-section" style={{ maxWidth: '1200px', margin: '0 auto 3rem', padding: '0 1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem', color: '#0f172a' }}>Our Clinical Team</h2>
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Board-certified medical specialists offering 30-minute grid appointments.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {docs.doctorsList.map(d => (
          <DoctorCard key={d.id} doctor={d} isExpanded={!!docs.expandedDoctorIds[d.id]} onToggleExpand={docs.toggleDoctorAccordion} selectedDate={appts.selectedDate} setSelectedDate={appts.setSelectedDate} timeSlots={DEFAULT_TIME_SLOTS} selectedTimeSlot={appts.selectedTimeSlot} setSelectedTimeSlot={appts.setSelectedTimeSlot} onBookClick={() => { docs.setSelectedDoctorId(d.id); modals.setIsBookOpen(true); }} />
        ))}
      </div>
    </section>
  );
};
