'use client';

import React from 'react';
import { Stethoscope } from 'lucide-react';
import type { AppContextType } from '../../hooks/useAppContext';

export const NavbarBrand: React.FC<{ ctx: AppContextType; onMobileClose?: () => void }> = ({ ctx, onMobileClose }) => {
  const { setCurrentView, auth } = ctx;
  const user = auth.currentUser;

  return (
    <div className="brand" onClick={() => { setCurrentView('HOME'); if (onMobileClose) onMobileClose(); }}>
      <div className="brand-icon">
        <Stethoscope size={20} />
      </div>
      <span className="brand-title-desktop">AppointmentGuard</span>
      <span className="brand-title-mobile">{user ? user.name : 'AppointmentGuard'}</span>
    </div>
  );
};
