'use client';

import { useState } from 'react';

export function useModals() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTimeOffOpen, setIsTimeOffOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return {
    isLoginOpen, setIsLoginOpen,
    isBookOpen, setIsBookOpen,
    isCancelOpen, setIsCancelOpen,
    isRescheduleOpen, setIsRescheduleOpen,
    isSettingsOpen, setIsSettingsOpen,
    isTimeOffOpen, setIsTimeOffOpen,
    isRegisterOpen, setIsRegisterOpen
  };
}
