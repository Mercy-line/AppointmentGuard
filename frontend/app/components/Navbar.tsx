'use client';

import React from 'react';
import { Menu, X } from 'lucide-react';
import { NavbarBrand } from './NavbarBrand';
import { DesktopNav } from './DesktopNav';
import { MobileDrawer } from './MobileDrawer';
import type { AppContextType } from '../hooks/useAppContext';

export const Navbar: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const { auth, currentView, setCurrentView, modals } = ctx;
  const currentUser = auth.currentUser;

  return (
    <>
      <nav className="navbar">
        <NavbarBrand currentUser={currentUser} onHomeClick={() => setCurrentView('HOME')} />
        <DesktopNav currentUser={currentUser} currentView={currentView} onHomeClick={() => setCurrentView('HOME')} onSettingsClick={() => modals.setIsSettingsOpen(true)} onLogoutClick={auth.handleLogout} onLoginClick={() => modals.setIsLoginOpen(true)} />
        <button type="button" className="mobile-menu-toggle" onClick={() => modals.setIsMobileMenuOpen(prev => !prev)} aria-label="Toggle menu">
          {modals.isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      {modals.isMobileMenuOpen && (
        <MobileDrawer currentUser={currentUser} onHomeClick={() => setCurrentView('HOME')} onSettingsClick={() => modals.setIsSettingsOpen(true)} onTimeOffClick={() => modals.setIsTimeOffOpen(true)} onLogoutClick={auth.handleLogout} onLoginClick={() => modals.setIsLoginOpen(true)} closeMenu={() => modals.setIsMobileMenuOpen(false)} />
      )}
    </>
  );
};
