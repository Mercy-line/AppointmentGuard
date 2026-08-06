'use client';

import React from 'react';
import { LoginModal } from './LoginModal';
import { BookingModal } from './BookingModal';
import { SettingsModal } from './SettingsModal';
import type { AppContextType } from '../hooks/useAppContext';

export const ModalsContainer: React.FC<{ ctx: AppContextType }> = ({ ctx }) => (
  <>
    <LoginModal ctx={ctx} />
    <BookingModal ctx={ctx} />
    <SettingsModal ctx={ctx} />
  </>
);
