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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeApptForAction, setActiveApptForAction] = useState<Appointment | null>(null);

  return {
    isLoginOpen, setIsLoginOpen, isRegisterOpen, setIsRegisterOpen,
    isSettingsOpen, setIsSettingsOpen, isBookOpen, setIsBookOpen,
    isCancelOpen, setIsCancelOpen, isRescheduleOpen, setIsRescheduleOpen,
    isTimeOffOpen, setIsTimeOffOpen, isMobileMenuOpen, setIsMobileMenuOpen,
    activeApptForAction, setActiveApptForAction
  };
}
