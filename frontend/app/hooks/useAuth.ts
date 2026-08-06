'use client';

import { useState } from 'react';
import type { User } from '../types';
import { SEEDED_USERS } from '../data/seededData';
import { loginAPI } from '../lib/api';

export function useAuth(setCurrentView: (view: 'HOME' | 'DASHBOARD') => void) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const data = await loginAPI(loginEmail, loginPassword);
      setCurrentUser(data.user);
      setLoginEmail(''); setLoginPassword('');
      setCurrentView('DASHBOARD');
      return true;
    } catch {
      if (SEEDED_USERS[loginEmail]) {
        setCurrentUser(SEEDED_USERS[loginEmail]);
        setLoginEmail(''); setLoginPassword('');
        setCurrentView('DASHBOARD');
        return true;
      }
      setAuthError('Invalid credentials. Try john@patient.com / PatientPass123!');
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('HOME');
  };

  return {
    currentUser, setCurrentUser, loginEmail, setLoginEmail, loginPassword, setLoginPassword,
    authError, setAuthError, handleLoginSubmit, handleLogout
  };
}
