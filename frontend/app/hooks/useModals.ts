'use client';

import { useState } from 'react';
import type { Appointment } from '../types';

export function useModals() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isTimeOffOpen, setIsTimeOffOpen] = useState(false);
  const [activeAppt, setActiveAppt] = useState<Appointment | null>(null);

  const openCancel = (appt: Appointment) => { setActiveAppt(appt); setIsCancelOpen(true); };
  const openReschedule = (appt: Appointment) => { setActiveAppt(appt); setIsRescheduleOpen(true); };

  return {
    isLoginOpen, setIsLoginOpen, isRegisterOpen, setIsRegisterOpen,
    isSettingsOpen, setIsSettingsOpen, isBookOpen, setIsBookOpen,
    isCancelOpen, setIsCancelOpen, isRescheduleOpen, setIsRescheduleOpen,
    isTimeOffOpen, setIsTimeOffOpen, activeAppt, setActiveAppt,
    openCancel, openReschedule
  };
}
