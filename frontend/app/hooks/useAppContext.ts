'use client';

import { useState } from 'react';
import { useAuth } from './useAuth';
import { useDoctors } from './useDoctors';
import { useAppointments } from './useAppointments';
import { usePatients } from './usePatients';
import { useModals } from './useModals';
import { useTimeOff } from './useTimeOff';

export function useAppContext() {
  const [currentView, setCurrentView] = useState<'HOME' | 'DASHBOARD'>('HOME');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [patientTab, setPatientTab] = useState<'SCHEDULED' | 'BOOK_NEW' | 'CANCELLED'>('SCHEDULED');
  const [doctorTab, setDoctorTab] = useState<'DOCTOR_QUEUE' | 'DOCTOR_CANCELLED'>('DOCTOR_QUEUE');
  const [adminTab, setAdminTab] = useState<'ADMIN_OVERVIEW' | 'ADMIN_DOCTORS' | 'ADMIN_PATIENTS' | 'ADMIN_APPOINTMENTS'>('ADMIN_OVERVIEW');

  const auth = useAuth();
  const docs = useDoctors();
  const appts = useAppointments(auth.currentUser, docs.doctorsList);
  const patients = usePatients();
  const modals = useModals();
  const timeOff = useTimeOff();

  return {
    currentView, setCurrentView, isMobileMenuOpen, setIsMobileMenuOpen,
    patientTab, setPatientTab, doctorTab, setDoctorTab, adminTab, setAdminTab,
    auth, docs, appts, patients, modals, timeOff
  };
}

export type AppContextType = ReturnType<typeof useAppContext>;
