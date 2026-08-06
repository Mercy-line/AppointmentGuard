'use client';

import { useState, useEffect } from 'react';
import type { User } from '../types';
import { DEFAULT_PATIENTS } from '../data/seededData';
import { fetchPatientsListAPI } from '../lib/api';

export function usePatients() {
  const [patientsList, setPatientsList] = useState<User[]>(DEFAULT_PATIENTS);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');

  useEffect(() => {
    fetchPatientsListAPI().then(list => {
      if (list && list.length > 0) setPatientsList(list);
    });
  }, []);

  const filteredPatients = patientsList.filter(p =>
    p.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(patientSearchQuery.toLowerCase())
  );

  return {
    patientsList, setPatientsList, patientSearchQuery, setPatientSearchQuery,
    filteredPatients, totalPatientsCount: patientsList.length
  };
}
