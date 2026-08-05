'use client';

import { useState, useEffect } from 'react';
import type { PatientUser } from '../types';
import { fetchPatientsListAPI } from '../lib/api';

export function usePatients() {
  const [patientsList, setPatientsList] = useState<PatientUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadPatients() {
      const data = await fetchPatientsListAPI();
      if (data && Array.isArray(data) && data.length > 0) setPatientsList(data);
      else setPatientsList([{ id: 'P101', first_name: 'John', last_name: 'Doe', email: 'john@patient.com', username: 'patient_john', role: 'PATIENT' }]);
    }
    loadPatients();
  }, []);

  const filteredPatients = patientsList.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
    return fullName.includes(q) || (p.email && p.email.toLowerCase().includes(q)) || (p.username && p.username.toLowerCase().includes(q));
  });

  return { patientsList, setPatientsList, searchQuery, setSearchQuery, filteredPatients, totalPatientsCount: Math.max(patientsList.length, 1) };
}
