'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import type { Doctor, TimeSlot } from '../types';
import { DoctorCardHeader } from './DoctorCardHeader';
import { DoctorCardSlots } from './DoctorCardSlots';

interface Props {
  doctor: Doctor;
  isExpanded: boolean;
  onToggleExpand: (docId: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  timeSlots: TimeSlot[];
  selectedTimeSlot: string | null;
  setSelectedTimeSlot: (slot: string) => void;
  onBookClick: (docId: string) => void;
}

export const DoctorCard: React.FC<Props> = ({
  doctor, isExpanded, onToggleExpand, selectedDate, setSelectedDate, timeSlots, selectedTimeSlot, setSelectedTimeSlot, onBookClick
}) => (
  <div className="doctor-card">
    <DoctorCardHeader doctor={doctor} isExpanded={isExpanded} onToggle={onToggleExpand} />
    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={13} color="#0284c7" /> {doctor.hours}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={13} color="#0284c7" /> {doctor.slotDurationMinutes} mins / slot</span>
    </div>
    {isExpanded && (
      <DoctorCardSlots 
        doctorName={doctor.name} selectedDate={selectedDate} setSelectedDate={setSelectedDate}
        timeSlots={timeSlots} selectedSlot={selectedTimeSlot} setSelectedSlot={setSelectedTimeSlot}
        onBookClick={() => onBookClick(doctor.id)}
      />
    )}
  </div>
);
