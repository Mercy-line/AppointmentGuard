'use client';

import { useState } from 'react';
import { useAuth } from './useAuth';
import { useDoctors } from './useDoctors';
import { useModals } from './useModals';

export function useAppContext() {
  const [currentView, setCurrentView] = useState<'HOME' | 'DASHBOARD'>('HOME');
  const auth = useAuth(setCurrentView);
  const docs = useDoctors();
  const modals = useModals();

  return {
    currentView, setCurrentView, auth, docs, modals
  };
}

export type AppContextType = ReturnType<typeof useAppContext>;
