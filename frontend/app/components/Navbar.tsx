'use client';

import React from 'react';
import { Menu, X } from 'lucide-react';
import { NavbarBrand } from './NavbarBrand';
import { DesktopNav } from './DesktopNav';
import { MobileDrawer } from './MobileDrawer';
import type { AppContextType } from '../hooks/useAppContext';

export const Navbar: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { auth, currentView, setCurrentView, isMobileMenuOpen, setIsMobileMenuOpen, modals } = ctx;

  return (
    <>
      <nav className="navbar">
        <NavbarBrand currentUser={auth.currentUser} onBrandClick={() => { setCurrentView('HOME'); setIsMobileMenuOpen(false); }} />
        <DesktopNav 
          currentUser={auth.currentUser} currentView={currentView} setCurrentView={setCurrentView}
          onOpenLogin={() => modals.setIsLoginOpen(true)} onOpenSettings={() => modals.setIsSettingsOpen(true)}
          onLogout={auth.handleLogout}
        />
        <button type="button" className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(p => !p)} aria-label="Toggle menu">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      <MobileDrawer 
        currentUser={auth.currentUser} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}
        setCurrentView={setCurrentView} onOpenLogin={() => modals.setIsLoginOpen(true)}
        onOpenSettings={() => modals.setIsSettingsOpen(true)} onOpenTimeOff={() => modals.setIsTimeOffOpen(true)}
        onLogout={auth.handleLogout}
      />
    </>
  );
};
