'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NavbarBrand } from './NavbarBrand';
import { DesktopNav } from './DesktopNav';
import { MobileDrawer } from './MobileDrawer';
import type { AppContextType } from '../../hooks/useAppContext';

export const Navbar: React.FC<{ ctx: AppContextType }> = ({ ctx }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <NavbarBrand ctx={ctx} onMobileClose={() => setIsMobileMenuOpen(false)} />
        <DesktopNav ctx={ctx} />
        <button type="button" className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      <MobileDrawer ctx={ctx} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
};
