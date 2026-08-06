'use client';

import React from 'react';
import { useAppContext } from './hooks/useAppContext';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { Footer } from './components/Footer';
import { ModalsContainer } from './components/ModalsContainer';

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
