'use client';

import React from 'react';
import { LoginModal } from './LoginModal';
import type { AppContextType } from '../hooks/useAppContext';

export const ModalsContainer: React.FC<{ ctx: AppContextType }> = ({ ctx }) => (
  <>
    <LoginModal ctx={ctx} />
  </>
);
