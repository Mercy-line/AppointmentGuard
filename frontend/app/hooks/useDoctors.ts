'use client';

import { useState, useEffect } from 'react';
import type { Doctor } from '../types';
import { fetchDoctorsFromAPI } from '../lib/api';
import { DEFAULT_DOCTORS } from '../data/seededData';

export function useDoctors() {
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [expandedDoctorIds, setExpandedDoctorIds] = useState<Record<string, boolean>>({});
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedAdminDoctorId, setSelectedAdminDoctorId] = useState<string>('');

  const loadDoctors = async () => {
    setIsLoadingDoctors(true);
    const data = await fetchDoctorsFromAPI();
    if (data && Array.isArray(data) && data.length > 0) {
      setDoctorsList(data);
      setSelectedDoctorId(data[0].id);
      setSelectedAdminDoctorId(data[0].id);
    } else {
      setDoctorsList(DEFAULT_DOCTORS);
      setSelectedDoctorId(DEFAULT_DOCTORS[0].id);
      setSelectedAdminDoctorId(DEFAULT_DOCTORS[0].id);
    }
    setIsLoadingDoctors(false);
  };

  useEffect(() => { loadDoctors(); }, []);

  const toggleDoctorAccordion = (docId: string) => {
    setExpandedDoctorIds(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  return {
    doctorsList, setDoctorsList, isLoadingDoctors, expandedDoctorIds,
    toggleDoctorAccordion, selectedDoctorId, setSelectedDoctorId,
    selectedAdminDoctorId, setSelectedAdminDoctorId, reloadDoctors: loadDoctors
  };
}
