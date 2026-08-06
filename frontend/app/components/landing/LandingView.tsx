'use client';

import React from 'react';
import type { AppContextType } from '../../hooks/useAppContext';
import { LandingHero } from './LandingHero';
import { LandingServices } from './LandingServices';
import { LandingHowItWorks } from './LandingHowItWorks';
import { LandingWhyChooseUs } from './LandingWhyChooseUs';
import { LandingDoctors } from './LandingDoctors';

export const LandingView: React.FC<{ ctx: AppContextType }> = ({ ctx }) => (
  <main style={{ flex: 1 }}>
    <LandingHero ctx={ctx} />
    <LandingServices />
    <LandingHowItWorks />
    <LandingWhyChooseUs />
    <LandingDoctors ctx={ctx} />
  </main>
);
