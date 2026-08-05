'use client';

import React from 'react';
import { LandingHero } from './LandingHero';
import { LandingServices } from './LandingServices';
import { LandingHowItWorks } from './LandingHowItWorks';
import { LandingWhyChooseUs } from './LandingWhyChooseUs';
import { LandingDoctors } from './LandingDoctors';
import type { AppContextType } from '../hooks/useAppContext';

export const LandingView: React.FC<{ ctx: AppContextType }> = ({ ctx }) => (
  <>
    <LandingHero ctx={ctx} />
    <LandingServices />
    <LandingHowItWorks />
    <LandingWhyChooseUs />
    <LandingDoctors ctx={ctx} />
  </>
);
