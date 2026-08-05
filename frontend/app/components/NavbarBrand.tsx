'use client';

import React from 'react';
import { Stethoscope } from 'lucide-react';
import type { User } from '../types';

interface Props {
  currentUser: User | null;
  onBrandClick: () => void;
}

export const NavbarBrand: React.FC<Props> = ({ currentUser, onBrandClick }) => (
  <div className="brand" onClick={onBrandClick}>
    <div className="brand-icon"><Stethoscope size={20} /></div>
    <span className="brand-title-desktop">AppointmentGuard</span>
    <span className="brand-title-mobile">{currentUser ? currentUser.name : 'AppointmentGuard'}</span>
  </div>
);
