'use client';

import { useState, useEffect } from 'react';
import type { Doctor } from '../types';
import { DEFAULT_DOCTORS } from '../data/seededData';
import { fetchDoctorsFromAPI } from '../lib/api';

export function useDoctors() {
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(DEFAULT_DOCTORS);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [expandedDoctorIds, setExpandedDoctorIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchDoctorsFromAPI().then(apiDocs => {
      if (apiDocs && apiDocs.length > 0) {
        setDoctorsList(apiDocs);
      }
      setIsLoadingDoctors(false);
    });
  }, []);

  const toggleDoctorAccordion = (id: string) => {
    setExpandedDoctorIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return {
    doctorsList, setDoctorsList, isLoadingDoctors, selectedDoctorId,
    setSelectedDoctorId, expandedDoctorIds, toggleDoctorAccordion
  };
}
