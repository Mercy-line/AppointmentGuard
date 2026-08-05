'use client';

import { useState } from 'react';
import { useAuth } from './useAuth';
import { useDoctors } from './useDoctors';
import { useModals } from './useModals';
import { usePatients } from './usePatients';

export function useAppContext() {
  const [currentView, setCurrentView] = useState<'HOME' | 'DASHBOARD'>('HOME');
  const auth = useAuth(setCurrentView);
  const docs = useDoctors();
  const modals = useModals();
  const patients = usePatients();

  return {
    currentView, setCurrentView, auth, docs, modals, patients
  };
}

export type AppContextType = ReturnType<typeof useAppContext>;
