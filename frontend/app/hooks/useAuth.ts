'use client';

import { useState } from 'react';
import type { User } from '../types';
import { loginAPI, registerAPI } from '../lib/api';

export function useAuth(setCurrentView: (view: 'HOME' | 'DASHBOARD') => void) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const data = await loginAPI(loginEmail, loginPassword);
      setCurrentUser(data.user);
      setLoginEmail('');
      setLoginPassword('');
      setCurrentView('DASHBOARD');
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('HOME');
  };

  return {
    currentUser, setCurrentUser, loginEmail, setLoginEmail, loginPassword, setLoginPassword,
    authError, setAuthError, showPassword, setShowPassword, handleLoginSubmit, handleLogout
  };
}
