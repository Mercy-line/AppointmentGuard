'use client';

import React from 'react';
import { LandingHero } from './LandingHero';
import { LandingHoursBanner } from './LandingHoursBanner';
import { LandingServices } from './LandingServices';
import { LandingDoctors } from './LandingDoctors';
import type { AppContextType } from '../hooks/useAppContext';

export const LandingView: React.FC<{ ctx: AppContextType }> = ({ ctx }) => (
  <div>
    <LandingHero ctx={ctx} />
    <LandingHoursBanner ctx={ctx} />
    <LandingServices />
    <LandingDoctors ctx={ctx} />
  </div>
);
