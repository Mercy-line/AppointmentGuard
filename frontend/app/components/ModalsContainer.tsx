'use client';

import React from 'react';
import { LoginModal } from './LoginModal';
import { RegisterModal } from './RegisterModal';
import { SettingsModal } from './SettingsModal';
import { BookingModal } from './BookingModal';
import { CancelModal } from './CancelModal';
import { RescheduleModal } from './RescheduleModal';
import { TimeOffModal } from './TimeOffModal';
import type { AppContextType } from '../hooks/useAppContext';

export const ModalsContainer: React.FC<{ ctx: AppContextType }> = ({ ctx }) => (
  <>
    <LoginModal ctx={ctx} />
    <RegisterModal ctx={ctx} />
    <SettingsModal ctx={ctx} />
    <BookingModal ctx={ctx} />
    <CancelModal ctx={ctx} />
    <RescheduleModal ctx={ctx} />
    <TimeOffModal ctx={ctx} />
  </>
);
