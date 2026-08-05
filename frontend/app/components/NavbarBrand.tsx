'use client';

import React from 'react';
import { Stethoscope } from 'lucide-react';
import type { User } from '../types';

interface Props {
  currentUser: User | null;
  onHomeClick: () => void;
}

export const NavbarBrand: React.FC<Props> = ({ currentUser, onHomeClick }) => (
  <div className="brand" onClick={onHomeClick}>
    <div className="brand-icon"><Stethoscope size={22} /></div>
    <span className="brand-title-desktop">AppointmentGuard</span>
    <span className="brand-title-mobile">{currentUser ? currentUser.name : 'AppointmentGuard'}</span>
  </div>
);
