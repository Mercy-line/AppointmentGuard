'use client';

import React from 'react';
import type { Doctor } from '../types';
import { DoctorCardHeader } from './DoctorCardHeader';
import { DoctorAccordionTimeline } from './DoctorAccordionTimeline';

interface Props {
  doc: Doctor;
  isExpanded: boolean;
  onToggle: () => void;
  selectedDate: string;
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
  onBookClick: (docId: string) => void;
}

export const DoctorCard: React.FC<Props> = ({
  doc, isExpanded, onToggle, selectedDate, selectedSlot, onSelectSlot, onBookClick
}) => (
  <div className="card-gradient" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
    <div>
      <DoctorCardHeader doc={doc} />
      <DoctorAccordionTimeline
        doc={doc}
        isExpanded={isExpanded}
        onToggle={onToggle}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        onSelectSlot={onSelectSlot}
      />
    </div>
    <button
      type="button"
      className="btn-primary"
      style={{ width: '100%', borderRadius: '10px', marginTop: '1rem', fontSize: '0.82rem', padding: '0.55rem' }}
      onClick={() => onBookClick(doc.id)}
    >
      Book Consultation
    </button>
  </div>
);
