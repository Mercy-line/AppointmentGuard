'use client';

import { useState, useEffect } from 'react';
import type { Doctor } from '../types';
import { INITIAL_DEMO_DOCTORS } from '../data/seededData';
import { fetchDoctorsFromAPI } from '../lib/api';

export function useDoctors() {
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(INITIAL_DEMO_DOCTORS);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [expandedDoctorIds, setExpandedDoctorIds] = useState<Record<string, boolean>>({ '1': true });
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('1');

  useEffect(() => {
    let isMounted = true;
    fetchDoctorsFromAPI().then(data => {
      if (isMounted && data && Array.isArray(data) && data.length > 0) {
        setDoctorsList(data.map((d: any) => ({
          id: String(d.id),
          name: d.name.startsWith('Dr.') ? d.name : `Dr. ${d.name}`,
          email: d.email || `dr.${d.name.toLowerCase().replace(/[^a-z]/g, '')}@clinic.com`,
          specialization: d.specialization || 'General Practice',
          avatarInitials: d.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
          hours: 'Mon - Fri, 9:00 AM - 5:00 PM',
          slotDurationMinutes: d.slot_duration_minutes || 30
        })));
      }
    });
    return () => { isMounted = false; };
  }, []);

  const toggleDoctorAccordion = (id: string) => {
    setExpandedDoctorIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return {
    doctorsList, setDoctorsList, isLoadingDoctors, expandedDoctorIds, selectedDoctorId, setSelectedDoctorId, toggleDoctorAccordion
  };
}
