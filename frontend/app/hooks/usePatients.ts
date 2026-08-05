'use client';

import { useState, useEffect } from 'react';
import type { User } from '../types';
import { fetchPatientsListAPI } from '../lib/api';

export function usePatients() {
  const [patientsList, setPatientsList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPatientsListAPI().then(data => {
      if (data && Array.isArray(data)) setPatientsList(data);
    });
  }, []);

  const filteredPatients = patientsList.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    patientsList, totalPatientsCount: patientsList.length, searchQuery, setSearchQuery, filteredPatients
  };
}
