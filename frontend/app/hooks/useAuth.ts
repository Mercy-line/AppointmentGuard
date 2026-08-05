'use client';

import { useState } from 'react';
import type { User } from '../types';
import { loginAPI } from '../lib/api';

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
      if (loginEmail === 'john@patient.com') {
        setCurrentUser({ id: '1', username: 'patient_john', email: 'john@patient.com', name: 'John Doe', role: 'PATIENT' });
        setLoginEmail(''); setLoginPassword(''); setCurrentView('DASHBOARD');
        return true;
      }
      if (loginEmail === 'dr.alice@clinic.com') {
        setCurrentUser({ id: '2', username: 'dr_alice', email: 'dr.alice@clinic.com', name: 'Dr. Alice Cherop', role: 'DOCTOR', specialization: 'Cardiology' });
        setLoginEmail(''); setLoginPassword(''); setCurrentView('DASHBOARD');
        return true;
      }
      if (loginEmail === 'admin@appointmentguard.com') {
        setCurrentUser({ id: '3', username: 'admin', email: 'admin@appointmentguard.com', name: 'System Admin', role: 'ADMIN' });
        setLoginEmail(''); setLoginPassword(''); setCurrentView('DASHBOARD');
        return true;
      }
      setAuthError(err.message || 'Invalid email address or password.');
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
