'use client';

import React from 'react';
import { useAppContext } from './hooks/useAppContext';
import { Navbar } from './components/layout/Navbar';
import { LandingView } from './components/landing/LandingView';
import { DashboardView } from './components/layout/DashboardView';
import { Footer } from './components/layout/Footer';
import { ModalsContainer } from './components/modals/ModalsContainer';

export default function HomePage() {
  const ctx = useAppContext();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar ctx={ctx} />
      {ctx.currentView === 'DASHBOARD' && ctx.auth.currentUser ? (
        <DashboardView ctx={ctx} />
      ) : (
        <LandingView ctx={ctx} />
      )}
      <Footer />
      <ModalsContainer ctx={ctx} />
    </div>
  );
}
