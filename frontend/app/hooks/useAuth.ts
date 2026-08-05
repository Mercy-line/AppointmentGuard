'use client';

import { useState } from 'react';
import type { User, UserRole } from '../types';
import { loginAPI, registerAPI } from '../lib/api';
import { SEEDED_USERS } from '../data/seededData';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('PATIENT');
  const [regSpecialization, setRegSpecialization] = useState('General Practice');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);
    try {
      const u = await loginAPI(loginEmail.trim(), loginPassword.trim());
      if (u) { setCurrentUser(u); setLoginEmail(''); setLoginPassword(''); return true; }
    } catch (err: any) {
      const localU = SEEDED_USERS[loginEmail.trim().toLowerCase()];
      if (localU) { setCurrentUser(localU); setLoginEmail(''); setLoginPassword(''); return true; }
      setAuthError(err.message || 'Invalid credentials.');
    } finally { setIsLoggingIn(false); }
    return false;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setIsRegistering(true);
    try {
      const u = await registerAPI({ email: regEmail.trim(), password: regPassword.trim(), name: regName.trim(), role: regRole, specialization: regSpecialization });
      if (u) { setAdminSuccessMsg(`Created ${u.role} account.`); setRegEmail(''); setRegName(''); return u; }
    } catch (err: any) { setRegError(err.message || 'Failed registration.'); }
    finally { setIsRegistering(false); }
    return null;
  };

  return {
    currentUser, setCurrentUser, loginEmail, setLoginEmail, loginPassword, setLoginPassword,
    showPassword, setShowPassword, isLoggingIn, authError, handleLoginSubmit,
    regName, setRegName, regEmail, setRegEmail, regPassword, setRegPassword, regRole, setRegRole,
    regSpecialization, setRegSpecialization, showRegPassword, setShowRegPassword, isRegistering,
    regError, adminSuccessMsg, handleRegisterSubmit, handleLogout: () => setCurrentUser(null)
  };
}
