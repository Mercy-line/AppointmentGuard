'use client';

import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { Doctor } from '../types';

interface Props {
  doctor: Doctor;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export const DoctorCardHeader: React.FC<Props> = ({ doctor, isExpanded, onToggle }) => (
  <div className="doctor-card-header">
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
      <div className="doc-avatar">{doctor.avatarInitials}</div>
      <div>
        <div className="doc-name">{doctor.name}</div>
        <span className="doc-specialty">{doctor.specialization}</span>
      </div>
    </div>
    <button type="button" className="btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => onToggle(doctor.id)}>
      {isExpanded ? <>Hide Slots <ChevronUp size={14} /></> : <>View Slots <ChevronDown size={14} /></>}
    </button>
  </div>
);
