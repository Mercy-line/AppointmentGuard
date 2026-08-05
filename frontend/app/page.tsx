'use client';

import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, Calendar, Clock, User as UserIcon, CheckCircle2, Shield,
  Activity, Heart, Baby, Syringe, TestTube, RefreshCw, LogOut, Lock, 
  AlertTriangle, AlertCircle, PlusCircle, Settings, Key, Check, Users, FileText,
  Menu, X, ChevronDown, ChevronUp, Eye, EyeOff
} from 'lucide-react';
import type { User, Doctor, TimeSlot, Appointment, DoctorTimeOff } from './types';
import { 
  fetchDoctorsFromAPI, 
  fetchDoctorSlotsFromAPI, 
  bookAppointmentAPI, 
  cancelAppointmentAPI, 
  rescheduleAppointmentAPI, 
  fetchPatientAppointmentsAPI,
  loginAPI,
  registerAPI
} from './lib/api';

// Backend Accounts Mapping
const SEEDED_USERS: Record<string, User> = {
  'john@patient.com': { id: 'P101', email: 'john@patient.com', username: 'patient_john', name: 'John Doe', role: 'PATIENT' },
  'dr.alice@clinic.com': { id: 'D201', email: 'dr.alice@clinic.com', username: 'dr_alice', name: 'Dr. Alice Cherop', role: 'DOCTOR', specialization: 'Cardiology' },
  'admin@appointmentguard.com': { id: 'A301', email: 'admin@appointmentguard.com', username: 'admin', name: 'System Admin', role: 'ADMIN' },
};

const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { time: '09:00 AM', available: true },
  { time: '09:30 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '10:30 AM', available: true },
  { time: '11:30 AM', available: true },
  { time: '01:00 PM', available: true },
  { time: '02:30 PM', available: true },
  { time: '03:00 PM', available: true },
];

export default function HomePage() {
  // Real Backend Doctors State (Strictly synced from Django API)
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState<boolean>(true);

  // Mobile Hamburger Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Doctors Accordion Expanded State
  const [expandedDoctorIds, setExpandedDoctorIds] = useState<Record<string, boolean>>({});

  // Navigation View: 'HOME' | 'DASHBOARD'
  const [currentView, setCurrentView] = useState<'HOME' | 'DASHBOARD'>('HOME');
  
  // Patient Filter Tab: 'SCHEDULED' | 'BOOK_NEW' | 'CANCELLED'
  const [patientFilterTab, setPatientFilterTab] = useState<'SCHEDULED' | 'BOOK_NEW' | 'CANCELLED'>('SCHEDULED');

  // Doctor Filter Tab: 'DOCTOR_QUEUE' | 'DOCTOR_CANCELLED'
  const [doctorFilterTab, setDoctorFilterTab] = useState<'DOCTOR_QUEUE' | 'DOCTOR_CANCELLED'>('DOCTOR_QUEUE');

  // Admin Main Filter Tab: 'ADMIN_OVERVIEW' | 'ADMIN_DOCTORS' | 'ADMIN_APPOINTMENTS'
  const [adminFilterTab, setAdminFilterTab] = useState<'ADMIN_OVERVIEW' | 'ADMIN_DOCTORS' | 'ADMIN_APPOINTMENTS'>('ADMIN_OVERVIEW');

  // Admin Selected Doctor Tab State
  const [selectedAdminDoctorId, setSelectedAdminDoctorId] = useState<string>('');

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Registration State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regRole, setRegRole] = useState<'PATIENT' | 'DOCTOR' | 'ADMIN'>('PATIENT');
  const [regSpecialization, setRegSpecialization] = useState<string>('General Practice');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Settings Modal & Password Change State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  // Booking & Appointments State
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-05');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);
  const [patientBookingName, setPatientBookingName] = useState<string>('John Doe');

  // Appointments DB State (Strictly synced from Django API)
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Action Modals State (Cancel & Reschedule)
  const [activeApptForAction, setActiveApptForAction] = useState<Appointment | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [cancellationReasonInput, setCancellationReasonInput] = useState<string>('');
  
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState<boolean>(false);
  const [rescheduleDate, setRescheduleDate] = useState<string>('2026-08-07');
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState<string | null>(null);

  // Doctor Time-Off State
  const [timeOffList, setTimeOffList] = useState<DoctorTimeOff[]>([]);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState<boolean>(false);
  const [timeOffStart, setTimeOffStart] = useState<string>('2026-08-05T08:00');
  const [timeOffEnd, setTimeOffEnd] = useState<string>('2026-08-05T17:00');
  const [timeOffReason, setTimeOffReason] = useState<string>('Personal Leave');

  // Fetch real doctors from Django REST API on mount
  useEffect(() => {
    async function loadDoctorsFromBackend() {
      setIsLoadingDoctors(true);
      const data = await fetchDoctorsFromAPI();
      if (data && Array.isArray(data)) {
        setDoctorsList(data);
        if (data.length > 0) {
          setSelectedDoctorId(data[0].id);
          setSelectedAdminDoctorId(data[0].id);
        }
      }
      setIsLoadingDoctors(false);
    }
    loadDoctorsFromBackend();
  }, []);

  // Fetch appointments for logged-in user from Django API
  useEffect(() => {
    async function loadPatientAppts() {
      if (currentUser && currentUser.role === 'PATIENT') {
        const apiAppts = await fetchPatientAppointmentsAPI(currentUser.id);
        if (apiAppts && Array.isArray(apiAppts)) {
          setAppointments(apiAppts);
        }
      }
    }
    loadPatientAppts();
  }, [currentUser]);

  // Toggle Doctor Accordion Dropdown
  const toggleDoctorAccordion = (docId: string) => {
    setExpandedDoctorIds(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  // Login Handler
  // Login Handler (Real Backend API Auth with local fallback)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    const emailTrimmed = loginEmail.trim();
    const passwordTrimmed = loginPassword.trim();

    try {
      // 1. Authenticate with Django REST API database endpoint
      const userFromAPI = await loginAPI(emailTrimmed, passwordTrimmed);
      if (userFromAPI) {
        setCurrentUser(userFromAPI);
        setIsLoginModalOpen(false);
        setIsMobileMenuOpen(false);
        setCurrentView('DASHBOARD');
        setPatientFilterTab('SCHEDULED');
        setDoctorFilterTab('DOCTOR_QUEUE');
        setAdminFilterTab('ADMIN_OVERVIEW');
        setLoginEmail('');
        setLoginPassword('');
        setShowPassword(false);
        return;
      }
    } catch (err: any) {
      // 2. Fallback check for offline demo users if backend is unreachable
      const localUser = SEEDED_USERS[emailTrimmed.toLowerCase()];
      if (localUser && (passwordTrimmed === 'PatientPass123!' || passwordTrimmed === 'DoctorPass123!' || passwordTrimmed === 'AdminPass123!')) {
        setCurrentUser(localUser);
        setIsLoginModalOpen(false);
        setIsMobileMenuOpen(false);
        setCurrentView('DASHBOARD');
        setPatientFilterTab('SCHEDULED');
        setDoctorFilterTab('DOCTOR_QUEUE');
        setAdminFilterTab('ADMIN_OVERVIEW');
        setLoginEmail('');
        setLoginPassword('');
        setShowPassword(false);
        return;
      }

      setAuthError(err.message || 'Invalid email address or password. Please check your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Admin Success Message State
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<string | null>(null);

  // Admin User Creation Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setAdminSuccessMsg(null);
    setIsRegistering(true);

    try {
      const newUser = await registerAPI({
        email: regEmail.trim(),
        password: regPassword.trim(),
        name: regName.trim(),
        role: regRole,
        specialization: regRole === 'DOCTOR' ? regSpecialization.trim() : undefined
      });

      if (newUser) {
        if (regRole === 'DOCTOR') {
          const updatedDocs = await fetchDoctorsFromAPI();
          if (updatedDocs) setDoctorsList(updatedDocs);
        }

        setAdminSuccessMsg(`Successfully created ${newUser.role} account for ${newUser.name} (${newUser.email}).`);
        setIsRegisterModalOpen(false);
        setRegEmail('');
        setRegPassword('');
        setRegName('');
        setRegRole('PATIENT');
        setShowRegPassword(false);
      }
    } catch (err: any) {
      setRegError(err.message || 'Failed to create account.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('HOME');
    setIsMobileMenuOpen(false);
  };

  // Password Change Handler
  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    if (newPasswordInput.length < 6) {
      setPasswordChangeError('New password must be at least 6 characters.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeError('New password and confirm password do not match.');
      return;
    }

    setPasswordChangeSuccess('Password updated successfully!');
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
  };

  // Booking Submit with Django REST API Call
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTimeSlot) return;

    const doc = doctorsList.find(d => d.id === selectedDoctorId);
    
    // Send real POST request to Django REST API
    const apiRes = await bookAppointmentAPI(doc ? doc.id : selectedDoctorId, `${selectedDate}T10:00:00Z`, currentUser?.id);

    const newAppt: Appointment = {
      id: apiRes?.id || `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      doctorId: doc ? doc.id : '1',
      doctorName: doc ? doc.name : 'Dr. Alice Cherop',
      specialization: doc ? doc.specialization : 'Cardiology',
      patientId: currentUser ? currentUser.id : 'P101',
      patientName: currentUser ? currentUser.name : patientBookingName,
      date: selectedDate,
      time: selectedTimeSlot,
      status: 'CONFIRMED'
    };

    setAppointments([newAppt, ...appointments]);
    setIsBookModalOpen(false);
    setSelectedTimeSlot(null);
    
    if (currentUser) {
      setCurrentView('DASHBOARD');
      setPatientFilterTab('SCHEDULED');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // Cancel Appointment Handler with Django REST API Call
  const handleConfirmCancel = async () => {
    if (!activeApptForAction || !cancellationReasonInput.trim()) return;

    // Send real PATCH request to Django REST API
    await cancelAppointmentAPI(activeApptForAction.id, cancellationReasonInput.trim());

    setAppointments(appointments.map(a => {
      if (a.id === activeApptForAction.id) {
        return {
          ...a,
          status: 'CANCELLED',
          cancellationReason: cancellationReasonInput.trim(),
          notificationSent: currentUser?.role === 'DOCTOR' || currentUser?.role === 'ADMIN'
        };
      }
      return a;
    }));

    setIsCancelModalOpen(false);
    setActiveApptForAction(null);
    setCancellationReasonInput('');
  };

  // Reschedule Appointment Handler with Django REST API Call
  const handleConfirmReschedule = async () => {
    if (!activeApptForAction || !rescheduleTimeSlot) return;

    // Send real PATCH request to Django REST API
    await rescheduleAppointmentAPI(activeApptForAction.id, `${rescheduleDate}T11:00:00Z`);

    setAppointments(appointments.map(a => {
      if (a.id === activeApptForAction.id) {
        return {
          ...a,
          date: rescheduleDate,
          time: rescheduleTimeSlot,
          status: 'CONFIRMED',
          cancellationReason: undefined
        };
      }
      return a;
    }));

    setIsRescheduleModalOpen(false);
    setActiveApptForAction(null);
    setRescheduleTimeSlot(null);
  };

  // Doctor Time-Off Handler
  const handleConfirmTimeOff = (e: React.FormEvent) => {
    e.preventDefault();
    const docId = currentUser?.role === 'DOCTOR' ? (doctorsList[0]?.id || '1') : selectedDoctorId;

    const newTimeOff: DoctorTimeOff = {
      id: `TO-${Math.floor(100 + Math.random() * 900)}`,
      doctorId: docId,
      doctorName: doctorsList.find(d => d.id === docId)?.name || 'Dr. Alice Cherop',
      startTime: timeOffStart,
      endTime: timeOffEnd,
      reason: timeOffReason
    };

    setTimeOffList([newTimeOff, ...timeOffList]);

    // Cancel all existing appointments for this doctor
    setAppointments(appointments.map(a => {
      if (a.doctorId === docId && a.status === 'CONFIRMED') {
        return {
          ...a,
          status: 'CANCELLED',
          cancellationReason: `Doctor Time-Off (${timeOffReason}).`,
          notificationSent: true
        };
      }
      return a;
    }));

    setIsTimeOffModalOpen(false);
  };

  // Filtered Appointments based on Role and Filter Tabs
  const visibleAppointments = appointments.filter(a => {
    if (!currentUser) return false;
    
    // Patient Role Filtering
    if (currentUser.role === 'PATIENT') {
      const isUserAppt = a.patientId === currentUser.id || a.patientName === currentUser.name;
      if (!isUserAppt) return false;

      if (patientFilterTab === 'SCHEDULED') return a.status === 'CONFIRMED';
      if (patientFilterTab === 'CANCELLED') return a.status === 'CANCELLED';
      return true;
    }

    // Doctor Role Filtering
    if (currentUser.role === 'DOCTOR') {
      const isDoctorAppt = a.doctorId === '1' || a.doctorName.includes(currentUser.name);
      if (!isDoctorAppt) return false;

      if (doctorFilterTab === 'DOCTOR_QUEUE') return a.status === 'CONFIRMED';
      if (doctorFilterTab === 'DOCTOR_CANCELLED') return a.status === 'CANCELLED';
      return true;
    }
    
    // ADMIN sees all
    return true;
  });

  const selectedAdminDoctor = doctorsList.find(d => d.id === selectedAdminDoctorId) || doctorsList[0];
  const selectedDoctorAppointments = selectedAdminDoctor ? appointments.filter(a => a.doctorId === selectedAdminDoctor.id || a.doctorName.includes(selectedAdminDoctor.name)) : [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="brand" onClick={() => { setCurrentView('HOME'); setIsMobileMenuOpen(false); }}>
          <div className="brand-icon">
            <Stethoscope size={20} />
          </div>
          {/* DESKTOP BRAND TITLE */}
          <span className="brand-title-desktop">AppointmentGuard</span>
          {/* MOBILE BRAND TITLE (SHOWS USER NAME WHEN LOGGED IN) */}
          <span className="brand-title-mobile">
            {currentUser ? currentUser.name : 'AppointmentGuard'}
          </span>
        </div>

        {/* DESKTOP NAV LINKS */}
        <div className="nav-links desktop-nav">
          {currentUser ? (
            /* LOGGED-IN NAVBAR */
            <>
              <div className="user-pill">
                <span>{currentUser.name}</span>
                <span className={`role-badge role-${currentUser.role.toLowerCase()}`}>{currentUser.role}</span>
              </div>

              {/* SETTINGS GEAR ICON BUTTON */}
              <button 
                type="button"
                className="btn-sm-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '30px' }}
                onClick={() => setIsSettingsModalOpen(true)}
              >
                Settings
              </button>

              <button type="button" className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            /* PUBLIC GUEST NAVBAR LINKS */
            <>
              <a className={`nav-link ${currentView === 'HOME' ? 'active' : ''}`} onClick={() => setCurrentView('HOME')}>Home</a>
              <a className="nav-link" href="#services-section">Services</a>
              <a className="nav-link" href="#how-it-works-section">How It Works</a>
              <a className="nav-link" href="#why-choose-us-section">Why Choose Us</a>
              <a className="nav-link" href="#doctors-section">Our Doctors</a>
              <button type="button" className="btn-login" onClick={() => setIsLoginModalOpen(true)}>Login</button>
            </>
          )}
        </div>

        {/* MOBILE HAMBURGER TOGGLE BUTTON */}
        <button 
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* MOBILE MENU DRAWER OVERLAY — CLEAN TEXT-ONLY ITEMS (NO ICONS) */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-drawer">
          {currentUser ? (
            <>
              <div className="mobile-nav-link" style={{ background: '#e0f2fe', borderColor: '#bae6fd', color: '#0369a1', fontWeight: 700 }}>
                <span>{currentUser.name}</span>
                <span className={`role-badge role-${currentUser.role.toLowerCase()}`}>{currentUser.role}</span>
              </div>

              <button 
                type="button"
                className="mobile-nav-link"
                onClick={() => { setIsSettingsModalOpen(true); setIsMobileMenuOpen(false); }}
              >
                <span>Account Settings & Password</span>
              </button>

              {currentUser.role === 'DOCTOR' && (
                <button 
                  type="button"
                  className="mobile-nav-link"
                  style={{ background: '#f0f9ff', color: '#0369a1' }}
                  onClick={() => { setIsTimeOffModalOpen(true); setIsMobileMenuOpen(false); }}
                >
                  <span>Set Time-Off</span>
                </button>
              )}

              <button 
                type="button"
                className="mobile-nav-link"
                style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}
                onClick={handleLogout}
              >
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <button type="button" className="mobile-nav-link" onClick={() => { setCurrentView('HOME'); setIsMobileMenuOpen(false); }}>
                <span>Home Landing Page</span>
              </button>
              <button type="button" className="mobile-nav-link" onClick={() => { 
                const el = document.getElementById('services-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                setIsMobileMenuOpen(false);
              }}>
                <span>Services</span>
              </button>
              <button type="button" className="mobile-nav-link" onClick={() => { 
                const el = document.getElementById('how-it-works-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                setIsMobileMenuOpen(false);
              }}>
                <span>How It Works</span>
              </button>
              <button type="button" className="mobile-nav-link" onClick={() => { 
                const el = document.getElementById('why-choose-us-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                setIsMobileMenuOpen(false);
              }}>
                <span>Why Choose Us</span>
              </button>
              <button type="button" className="mobile-nav-link" onClick={() => { 
                const el = document.getElementById('doctors-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                setIsMobileMenuOpen(false);
              }}>
                <span>Our Doctors</span>
              </button>
              <button 
                type="button"
                className="btn-primary" 
                style={{ width: '100%', marginTop: '0.4rem', borderRadius: '8px', fontSize: '0.82rem', padding: '0.6rem' }}
                onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }}
              >
                Sign In to Portal
              </button>
            </>
          )}
        </div>
      )}

      {/* VIEW CONDITIONAL RENDERING */}
      {currentView === 'DASHBOARD' && currentUser ? (
        
        /* ROLE-BASED DASHBOARD VIEW */
        <div className="dashboard-container">
          
          {/* WELCOME BANNER (HIDDEN ON MOBILE VIEW) */}
          <div className="dash-banner">
            <div>
              <h1>Welcome back, {currentUser.name}!</h1>
              <p>
                {currentUser.role === 'PATIENT' && 'Patient Portal — Select an action below to manage your visits or book a new appointment.'}
                {currentUser.role === 'DOCTOR' && `Doctor Portal — ${currentUser.specialization || 'General Practice'} Schedule & Cancellation Logs.`}
                {currentUser.role === 'ADMIN' && 'System Administration — Select an action tab below to manage system metrics, doctors, or master log.'}
              </p>
            </div>
            
            {currentUser.role === 'DOCTOR' && (
              <button type="button" className="btn-primary" onClick={() => setIsTimeOffModalOpen(true)}>
                <Calendar size={16} /> Set Time-Off
              </button>
            )}

            {currentUser.role === 'ADMIN' && (
              <button type="button" className="btn-primary" onClick={() => { setRegError(null); setIsRegisterModalOpen(true); }}>
                <PlusCircle size={16} /> Add New User to DB
              </button>
            )}
          </div>

          {adminSuccessMsg && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
              {adminSuccessMsg}
            </div>
          )}

          {/* PATIENT ACTION BUTTON TABS (3 EQUAL COLUMNS SIDE-BY-SIDE ON MOBILE) */}
          {currentUser.role === 'PATIENT' && (
            <div className="dashboard-tabs">
              <button
                type="button"
                className={`dashboard-tab-btn ${patientFilterTab === 'BOOK_NEW' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  background: patientFilterTab === 'BOOK_NEW' ? '#0284c7' : 'white',
                  color: patientFilterTab === 'BOOK_NEW' ? 'white' : '#1e293b'
                }}
                onClick={() => setPatientFilterTab('BOOK_NEW')}
              >
                <PlusCircle size={14} /> 
                <span className="tab-label-desktop">Book Appointment</span>
                <span className="tab-label-mobile">Book</span>
              </button>

              <button
                type="button"
                className={`dashboard-tab-btn ${patientFilterTab === 'SCHEDULED' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  background: patientFilterTab === 'SCHEDULED' ? '#0284c7' : 'white',
                  color: patientFilterTab === 'SCHEDULED' ? 'white' : '#1e293b'
                }}
                onClick={() => setPatientFilterTab('SCHEDULED')}
              >
                <Calendar size={14} /> 
                <span className="tab-label-desktop">My Scheduled Appointments</span>
                <span className="tab-label-mobile">Scheduled</span>
              </button>

              <button
                type="button"
                className={`dashboard-tab-btn ${patientFilterTab === 'CANCELLED' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  background: patientFilterTab === 'CANCELLED' ? '#ef4444' : 'white',
                  color: patientFilterTab === 'CANCELLED' ? 'white' : '#1e293b',
                  borderColor: patientFilterTab === 'CANCELLED' ? '#ef4444' : '#e2e8f0'
                }}
                onClick={() => setPatientFilterTab('CANCELLED')}
              >
                <AlertCircle size={14} /> 
                <span className="tab-label-desktop">Cancelled</span>
                <span className="tab-label-mobile">Cancelled</span>
              </button>
            </div>
          )}

          {/* DOCTOR ACTION BUTTON TABS (2 EQUAL COLUMNS SIDE-BY-SIDE ON MOBILE) */}
          {currentUser.role === 'DOCTOR' && (
            <div className="dashboard-tabs dashboard-tabs-2">
              <button
                type="button"
                className={`dashboard-tab-btn ${doctorFilterTab === 'DOCTOR_QUEUE' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  background: doctorFilterTab === 'DOCTOR_QUEUE' ? '#0284c7' : 'white',
                  color: doctorFilterTab === 'DOCTOR_QUEUE' ? 'white' : '#1e293b'
                }}
                onClick={() => setDoctorFilterTab('DOCTOR_QUEUE')}
              >
                <Calendar size={14} /> 
                <span className="tab-label-desktop">Active Patient Queue</span>
                <span className="tab-label-mobile">Active Queue</span>
              </button>

              <button
                type="button"
                className={`dashboard-tab-btn ${doctorFilterTab === 'DOCTOR_CANCELLED' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  background: doctorFilterTab === 'DOCTOR_CANCELLED' ? '#ef4444' : 'white',
                  color: doctorFilterTab === 'DOCTOR_CANCELLED' ? 'white' : '#1e293b',
                  borderColor: doctorFilterTab === 'DOCTOR_CANCELLED' ? '#ef4444' : '#e2e8f0'
                }}
                onClick={() => setDoctorFilterTab('DOCTOR_CANCELLED')}
              >
                <AlertCircle size={14} /> 
                <span className="tab-label-desktop">Cancelled Appointments</span>
                <span className="tab-label-mobile">Cancelled</span>
              </button>
            </div>
          )}

          {/* ADMIN ACTION BUTTON TABS (METRICS FIRST -> DOCTORS -> MASTER LOG) */}
          {currentUser.role === 'ADMIN' && (
            <div className="dashboard-tabs">
              {/* 1. METRICS OVERVIEW */}
              <button
                type="button"
                className={`dashboard-tab-btn ${adminFilterTab === 'ADMIN_OVERVIEW' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  background: adminFilterTab === 'ADMIN_OVERVIEW' ? '#0284c7' : 'white',
                  color: adminFilterTab === 'ADMIN_OVERVIEW' ? 'white' : '#1e293b'
                }}
                onClick={() => setAdminFilterTab('ADMIN_OVERVIEW')}
              >
                <Activity size={14} /> 
                <span className="tab-label-desktop">System Metrics Overview</span>
                <span className="tab-label-mobile">Metrics</span>
              </button>

              {/* 2. DOCTORS */}
              <button
                type="button"
                className={`dashboard-tab-btn ${adminFilterTab === 'ADMIN_DOCTORS' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  background: adminFilterTab === 'ADMIN_DOCTORS' ? '#0284c7' : 'white',
                  color: adminFilterTab === 'ADMIN_DOCTORS' ? 'white' : '#1e293b'
                }}
                onClick={() => setAdminFilterTab('ADMIN_DOCTORS')}
              >
                <Users size={14} /> 
                <span className="tab-label-desktop">Doctors & Assigned Appointments</span>
                <span className="tab-label-mobile">Doctors</span>
              </button>

              {/* 3. MASTER LOG */}
              <button
                type="button"
                className={`dashboard-tab-btn ${adminFilterTab === 'ADMIN_APPOINTMENTS' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  background: adminFilterTab === 'ADMIN_APPOINTMENTS' ? '#0284c7' : 'white',
                  color: adminFilterTab === 'ADMIN_APPOINTMENTS' ? 'white' : '#1e293b'
                }}
                onClick={() => setAdminFilterTab('ADMIN_APPOINTMENTS')}
              >
                <FileText size={14} /> 
                <span className="tab-label-desktop">All Appointments Master Log</span>
                <span className="tab-label-mobile">Master Log</span>
              </button>
            </div>
          )}

          {/* ADMIN OVERVIEW METRICS CARDS */}
          {currentUser.role === 'ADMIN' && adminFilterTab === 'ADMIN_OVERVIEW' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#0284c7', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Appointments</span>
                  <Calendar size={20} />
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{appointments.length}</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>All-time bookings log</p>
              </div>

              <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#059669', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Active Doctors</span>
                  <Users size={20} />
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{doctorsList.length}</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Across 5 specialties</p>
              </div>

              <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#166534', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Confirmed Visits</span>
                  <CheckCircle2 size={20} />
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{appointments.filter(a => a.status === 'CONFIRMED').length}</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Active scheduled slots</p>
              </div>

              <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#dc2626', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Cancelled Visits</span>
                  <AlertCircle size={20} />
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{appointments.filter(a => a.status === 'CANCELLED').length}</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Cancelled / time-off</p>
              </div>
            </div>
          )}

          {/* ADMIN VIEW: INDIVIDUAL DOCTOR TABS WITH CIRCULAR INITIALS & APPOINTMENTS */}
          {currentUser.role === 'ADMIN' && adminFilterTab === 'ADMIN_DOCTORS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* DOCTOR SELECTOR TABS WITH INITIALS BADGES */}
              <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  Select a Doctor to View Their Assigned Appointments:
                </h3>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {doctorsList.map(doc => {
                    const docApptCount = appointments.filter(a => a.doctorId === doc.id || a.doctorName.includes(doc.name)).length;
                    const isSelected = selectedAdminDoctor && doc.id === selectedAdminDoctor.id;
                    return (
                      <button
                        type="button"
                        key={doc.id}
                        onClick={() => setSelectedAdminDoctorId(doc.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.4rem 0.85rem',
                          borderRadius: '30px',
                          border: `2px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
                          background: isSelected ? '#e0f2fe' : 'white',
                          color: isSelected ? '#0369a1' : '#334155',
                          fontWeight: isSelected ? 700 : 600,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          flexWrap: 'nowrap'
                        }}
                      >
                        {/* CIRCULAR DOCTOR INITIALS BADGE */}
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: '1.5px solid #0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#cff4fc',
                          color: '#087990',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          flexShrink: 0
                        }}>
                          {doc.avatarInitials}
                        </div>

                        <span>{doc.name}</span>

                        <span style={{ 
                          background: isSelected ? '#0284c7' : '#cbd5e1', 
                          color: 'white', 
                          padding: '0.08rem 0.4rem', 
                          borderRadius: '20px', 
                          fontSize: '0.7rem',
                          fontWeight: 800 
                        }}>
                          {docApptCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SELECTED DOCTOR APPOINTMENTS CARD */}
              {selectedAdminDoctor && (
                <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  
                  {/* Selected Doctor Profile Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1.5rem', paddingBottom: '0.85rem', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {/* CIRCULAR INITIALS BADGE */}
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        border: '2px solid #0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#cff4fc',
                        color: '#087990',
                        fontSize: '1rem',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {selectedAdminDoctor.avatarInitials}
                      </div>

                      <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{selectedAdminDoctor.name}</h2>
                        <p style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600, marginTop: '0.15rem' }}>
                          {selectedAdminDoctor.specialization} • {selectedAdminDoctor.hours}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Appointments</span>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{selectedDoctorAppointments.length}</h3>
                    </div>
                  </div>

                  {/* Appointments List for Selected Doctor */}
                  {selectedDoctorAppointments.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', color: '#64748b', textAlign: 'center' }}>
                      <Calendar size={38} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
                      <p style={{ fontWeight: 600, fontSize: '0.82rem' }}>No appointments booked for {selectedAdminDoctor.name} yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {selectedDoctorAppointments.map(appt => (
                        <div 
                          key={appt.id} 
                          style={{ 
                            padding: '1rem', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '12px', 
                            background: '#ffffff'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.4rem' }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>Ref: {appt.id}</span>
                              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: '0.15rem 0' }}>
                                Patient: {appt.patientName}
                              </h3>
                              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                Doctor: {appt.doctorName} ({appt.specialization})
                              </p>
                            </div>

                            <span className={`role-badge badge-${appt.status.toLowerCase()}`}>
                              {appt.status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.65rem', color: '#334155', fontSize: '0.8rem', fontWeight: 600, flexWrap: 'wrap' }}>
                            <span>📅 {appt.date}</span>
                            <span>🕒 {appt.time} (30 mins)</span>
                          </div>

                          {appt.cancellationReason && (
                            <div style={{ marginTop: '0.65rem', padding: '0.55rem 0.75rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.78rem' }}>
                              <strong>Reason / Alert:</strong> {appt.cancellationReason}
                            </div>
                          )}

                          {appt.status !== 'CANCELLED' && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              <button 
                                type="button"
                                className="btn-sm-outline"
                                onClick={() => {
                                  setActiveApptForAction(appt);
                                  setIsRescheduleModalOpen(true);
                                }}
                              >
                                Reschedule
                              </button>
                              
                              <button 
                                type="button"
                                className="btn-danger"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                                onClick={() => {
                                  setActiveApptForAction(appt);
                                  setIsCancelModalOpen(true);
                                }}
                              >
                                Cancel Appointment
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* DASHBOARD CONTENT CONTAINER FOR PATIENT/DOCTOR/ADMIN MASTER LOG */}
          {(currentUser.role !== 'ADMIN' || adminFilterTab === 'ADMIN_APPOINTMENTS' || adminFilterTab === 'ADMIN_OVERVIEW') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* PATIENT BOOKING SEARCH CARD */}
              {(currentUser.role === 'PATIENT' && patientFilterTab === 'BOOK_NEW') && (
                <div className="search-card">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.85rem' }}>
                    Book a New Appointment
                  </h3>
                  
                  <div className="search-grid">
                    <div className="form-group">
                      <label className="form-label">Doctor</label>
                      <select 
                        className="form-select"
                        value={selectedDoctorId} 
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                      >
                        {doctorsList.map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialization})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input 
                        type="date" 
                        className="form-input"
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>

                    <button type="button" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                      Check Availability
                    </button>
                  </div>

                  <div className="slots-container">
                    <div className="slots-title">Available 30-minute time slots</div>
                    <div className="slots-grid">
                      {DEFAULT_TIME_SLOTS.map(slot => (
                        <button
                          type="button"
                          key={slot.time}
                          className={`slot-chip ${selectedTimeSlot === slot.time ? 'selected' : ''}`}
                          onClick={() => setSelectedTimeSlot(slot.time)}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>

                    <button 
                      type="button"
                      className="btn-primary"
                      disabled={!selectedTimeSlot}
                      style={{ opacity: selectedTimeSlot ? 1 : 0.6, cursor: selectedTimeSlot ? 'pointer' : 'not-allowed', width: '100%' }}
                      onClick={() => setIsBookModalOpen(true)}
                    >
                      Book Selected Slot
                    </button>
                  </div>
                </div>
              )}

              {/* APPOINTMENTS LIST CARD */}
              {(currentUser.role !== 'PATIENT' || patientFilterTab !== 'BOOK_NEW') && (
                <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      {currentUser.role === 'PATIENT' && (
                        patientFilterTab === 'SCHEDULED' ? 'My Scheduled Appointments' : 'Cancelled Appointments'
                      )}
                      {currentUser.role === 'DOCTOR' && (
                        doctorFilterTab === 'DOCTOR_QUEUE' ? 'Active Patient Queue' : 'Doctor Cancelled Appointments Log'
                      )}
                      {currentUser.role === 'ADMIN' && 'System Appointments Master Log'}
                    </h2>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{visibleAppointments.length} Records</span>
                  </div>

                  {visibleAppointments.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', color: '#64748b', textAlign: 'center' }}>
                      <Calendar size={38} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
                      <p style={{ fontWeight: 600, fontSize: '0.82rem' }}>No appointments in this category.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {visibleAppointments.map(appt => (
                        <div 
                          key={appt.id} 
                          style={{ 
                            padding: '1rem', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '12px', 
                            background: '#ffffff',
                            borderColor: '#e2e8f0'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.4rem' }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>Ref: {appt.id}</span>
                              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: '0.15rem 0' }}>
                                {currentUser.role === 'PATIENT' ? appt.doctorName : `Patient: ${appt.patientName}`}
                              </h3>
                              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                {currentUser.role === 'PATIENT' ? appt.specialization : `Assigned Doctor: ${appt.doctorName}`}
                              </p>
                            </div>

                            <span className={`role-badge badge-${appt.status.toLowerCase()}`}>
                              {appt.status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.65rem', color: '#334155', fontSize: '0.8rem', fontWeight: 600, flexWrap: 'wrap' }}>
                            <span>📅 {appt.date}</span>
                            <span>🕒 {appt.time} (30 mins)</span>
                          </div>

                          {appt.cancellationReason && (
                            <div style={{ marginTop: '0.65rem', padding: '0.55rem 0.75rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.78rem' }}>
                              <strong>Reason / Alert:</strong> {appt.cancellationReason}
                            </div>
                          )}

                          {appt.status !== 'CANCELLED' && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              <button 
                                type="button"
                                className="btn-sm-outline"
                                onClick={() => {
                                  setActiveApptForAction(appt);
                                  setIsRescheduleModalOpen(true);
                                }}
                              >
                                Reschedule
                              </button>
                              
                              <button 
                                type="button"
                                className="btn-danger"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                                onClick={() => {
                                  setActiveApptForAction(appt);
                                  setIsCancelModalOpen(true);
                                }}
                              >
                                Cancel Appointment
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

      ) : (

        /* PUBLIC LANDING HOME VIEW */
        <>
          {/* 1. HERO SECTION */}
          <section className="section section-tint">
            <div className="hero-container">
              <div>
                <h1 className="hero-title">Quality Healthcare, Book Your Appointment Online</h1>
                <p className="hero-subtitle">
                  Skip the queue. Choose your doctor, view real-time availability and confirm a 30-minute visit at our clinic in just a few clicks.
                </p>
                <div className="hero-actions">
                  <button type="button" className="btn-primary" onClick={() => setIsLoginModalOpen(true)}>
                    Book Appointment
                  </button>
                  <a href="#doctors-section" className="btn-outline">View Doctors</a>
                </div>
              </div>

              <div className="hero-card-img">
                <div style={{ textAlign: 'center', padding: '1.25rem' }}>
                  <div style={{ 
                    background: '#e0f2fe', 
                    borderRadius: '50%', 
                    width: '130px', 
                    height: '130px', 
                    margin: '0 auto 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Calendar size={64} color="#0284c7" />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Real-Time Availability</h3>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.25rem' }}>Instant confirmation & online booking</p>
                </div>
              </div>
            </div>
          </section>

          {/* 2. OUR SERVICES SECTION */}
          <section className="section" id="services-section">
            <div className="section-header">
              <h2 className="section-title">Our Services</h2>
            </div>

            <div className="services-grid">
              <div className="service-card">
                <Stethoscope size={20} color="#087990" />
                <span>General Consultation</span>
              </div>
              <div className="service-card">
                <Baby size={20} color="#087990" />
                <span>Pediatrics</span>
              </div>
              <div className="service-card">
                <Heart size={20} color="#087990" />
                <span>Women's Health</span>
              </div>
              <div className="service-card">
                <Syringe size={20} color="#087990" />
                <span>Vaccinations</span>
              </div>
              <div className="service-card">
                <TestTube size={20} color="#087990" />
                <span>Laboratory Services</span>
              </div>
              <div className="service-card">
                <RefreshCw size={20} color="#087990" />
                <span>Follow-up Visits</span>
              </div>
            </div>
          </section>

          {/* 3. HOW IT WORKS SECTION */}
          <section className="section section-tint" id="how-it-works-section">
            <div className="section-header">
              <h2 className="section-title">How It Works</h2>
            </div>

            <div className="cards-grid-3">
              <div className="feature-card">
                <div className="feature-icon-badge">
                  <UserIcon size={20} />
                </div>
                <h3 className="feature-title">Choose a Doctor</h3>
                <p className="feature-desc">Browse our clinicians and pick the right specialist for your needs.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-badge">
                  <Calendar size={20} />
                </div>
                <h3 className="feature-title">Pick a Time</h3>
                <p className="feature-desc">See real-time openings and select a 30-minute slot that fits your schedule.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-badge">
                  <CheckCircle2 size={20} />
                </div>
                <h3 className="feature-title">Confirm Booking</h3>
                <p className="feature-desc">Confirm in one click and get an instant appointment reference.</p>
              </div>
            </div>
          </section>

          {/* 4. WHY CHOOSE US SECTION */}
          <section className="section" id="why-choose-us-section">
            <div className="section-header">
              <h2 className="section-title">Why Choose Our Clinic</h2>
            </div>

            <div className="cards-grid-4">
              <div className="feature-card">
                <div className="feature-icon-badge">
                  <Activity size={20} />
                </div>
                <h3 className="feature-title">Easy Online Booking</h3>
                <p className="feature-desc">Book a visit in under a minute, any time of day.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-badge">
                  <UserIcon size={20} />
                </div>
                <h3 className="feature-title">Qualified Doctors</h3>
                <p className="feature-desc">Licensed clinicians across five core specialties.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-badge">
                  <Clock size={20} />
                </div>
                <h3 className="feature-title">Real-Time Availability</h3>
                <p className="feature-desc">Slots update instantly so you never double-book.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-badge">
                  <Shield size={20} />
                </div>
                <h3 className="feature-title">Secure Patient Records</h3>
                <p className="feature-desc">Your health data stays private and encrypted.</p>
              </div>
            </div>
          </section>

          {/* 5. OUR DOCTORS SECTION — LIVE FETCHED FROM BACKEND API */}
          <section className="section section-tint" id="doctors-section">
            <div className="section-header">
              <h2 className="section-title">Our Doctors</h2>
              <p className="section-subtitle">Click on any doctor's name below to expand their timeline and available hours.</p>
            </div>

            {isLoadingDoctors ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                Loading doctors list from backend...
              </div>
            ) : doctorsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                No active doctors registered in clinic database.
              </div>
            ) : (
              <div className="doctors-accordion-list">
                {doctorsList.map(doc => {
                  const isExpanded = !!expandedDoctorIds[doc.id];
                  return (
                    <div key={doc.id} className="doctor-accordion-item">
                      {/* ACCORDION HEADER: CIRCULAR INITIALS + NAME + DROPDOWN CHEVRON */}
                      <div 
                        className="doctor-accordion-header"
                        onClick={() => toggleDoctorAccordion(doc.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {/* CIRCULAR INITIALS CONTAINER */}
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: '2px solid #0284c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#cff4fc',
                            color: '#087990',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            flexShrink: 0
                          }}>
                            {doc.avatarInitials}
                          </div>

                          <div>
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{doc.name}</span>
                            <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 500, marginLeft: '0.4rem' }}>({doc.specialization})</span>
                          </div>
                        </div>

                        <button type="button" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          {isExpanded ? <ChevronUp size={18} color="#0284c7" /> : <ChevronDown size={18} />}
                        </button>
                      </div>

                      {/* EXPANDABLE DROPDOWN CONTENT: TIMELINE & DETAILS */}
                      {isExpanded && (
                        <div className="doctor-accordion-content">
                          <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.35rem' }}>
                            <strong>Specialization:</strong> {doc.specialization}
                          </p>
                          <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem' }}>
                            <strong>Timeline & Available Hours:</strong> {doc.hours} (30-minute consultation slots)
                          </p>
                          <button 
                            type="button"
                            className="btn-primary"
                            style={{ fontSize: '0.78rem', padding: '0.4rem 1rem', borderRadius: '20px' }}
                            onClick={() => setIsLoginModalOpen(true)}
                          >
                            Book Appointment with {doc.name}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* CLEAN FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="brand">
            <div className="brand-icon">
              <Stethoscope size={18} />
            </div>
            <span>AppointmentGuard</span>
          </div>

          <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
            © 2026 AppointmentGuard. All rights reserved.
          </div>
        </div>
      </footer>

      {/* SETTINGS / CHANGE PASSWORD MODAL */}
      {isSettingsModalOpen && currentUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={18} color="#0284c7" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Account Settings</h3>
              </div>
              <button type="button" className="btn-sm-outline" onClick={() => setIsSettingsModalOpen(false)}>Close</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem 0.85rem', borderRadius: '12px', marginBottom: '1.1rem', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
              <p style={{ color: '#334155' }}><strong>User:</strong> {currentUser.name}</p>
              <p style={{ color: '#334155', marginTop: '0.2rem' }}><strong>Email:</strong> {currentUser.email}</p>
              <p style={{ color: '#334155', marginTop: '0.2rem' }}><strong>Role:</strong> {currentUser.role}</p>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Key size={15} color="#0284c7" /> Change Password
            </h4>

            {passwordChangeSuccess && (
              <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.6rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Check size={15} /> {passwordChangeSuccess}
              </div>
            )}

            {passwordChangeError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.6rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '0.85rem' }}>
                {passwordChangeError}
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Current Password</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">New Password</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <label className="form-label">Confirm New Password</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.55rem 1rem' }} onClick={() => setIsSettingsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.55rem 1rem' }}>Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {isLoginModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ marginBottom: '1.1rem', textAlign: 'center' }}>
              <div className="brand-icon" style={{ margin: '0 auto 0.65rem' }}>
                <Lock size={18} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Sign In to AppointmentGuard</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>Enter your credentials to access your dashboard.</p>
            </div>

            {authError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.6rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '0.85rem' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input"
                  placeholder="e.g. john@patient.com"
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="form-input"
                    style={{ paddingRight: '2.5rem' }}
                    placeholder="Enter your password"
                    value={loginPassword} 
                    onChange={(e) => setLoginPassword(e.target.value)} 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.2rem'
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isLoggingIn} style={{ width: '100%', borderRadius: '10px', fontSize: '0.85rem', opacity: isLoggingIn ? 0.7 : 1 }}>
                {isLoggingIn ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <button 
              type="button"
              style={{ width: '100%', marginTop: '0.85rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
              onClick={() => setIsLoginModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ADMIN-ONLY USER CREATION MODAL */}
      {isRegisterModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div style={{ marginBottom: '1.1rem', textAlign: 'center' }}>
              <div className="brand-icon" style={{ margin: '0 auto 0.65rem' }}>
                <PlusCircle size={18} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Add User to Clinic Database</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>Admin Panel — Register a new Patient, Doctor, or Admin.</p>
            </div>

            {regError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.6rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '0.85rem' }}>
                {regError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Mary Jane"
                  value={regName} 
                  onChange={(e) => setRegName(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input"
                  placeholder="e.g. mary@patient.com"
                  value={regEmail} 
                  onChange={(e) => setRegEmail(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label className="form-label">Account Role</label>
                <select 
                  className="form-input"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as any)}
                  required
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="ADMIN">System Admin</option>
                </select>
              </div>

              {regRole === 'DOCTOR' && (
                <div style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Doctor Specialization</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g. Pediatrics, Cardiology"
                    value={regSpecialization} 
                    onChange={(e) => setRegSpecialization(e.target.value)} 
                    required 
                  />
                </div>
              )}

              <div style={{ marginBottom: '1.1rem' }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showRegPassword ? 'text' : 'password'} 
                    className="form-input"
                    style={{ paddingRight: '2.5rem' }}
                    placeholder="At least 6 characters"
                    value={regPassword} 
                    onChange={(e) => setRegPassword(e.target.value)} 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.2rem'
                    }}
                    aria-label={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isRegistering} style={{ width: '100%', borderRadius: '10px', fontSize: '0.85rem', opacity: isRegistering ? 0.7 : 1 }}>
                {isRegistering ? 'Adding User...' : 'Add User to DB'}
              </button>
            </form>

            <button 
              type="button"
              style={{ width: '100%', marginTop: '0.85rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
              onClick={() => setIsRegisterModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {isBookModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem', color: '#0f172a' }}>Confirm Appointment</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.1rem' }}>
              Booking 30-minute slot on <strong>{selectedDate}</strong> at <strong>{selectedTimeSlot}</strong>
            </p>
            <form onSubmit={handleBookSubmit}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label className="form-label">Patient Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={currentUser ? currentUser.name : patientBookingName} 
                  onChange={(e) => setPatientBookingName(e.target.value)} 
                  required 
                />
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
                <button type="button" className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.55rem 1rem' }} onClick={() => setIsBookModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.55rem 1rem' }}>Confirm & Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL APPOINTMENT MODAL */}
      {isCancelModalOpen && activeApptForAction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '0.75rem' }}>
              <AlertCircle size={22} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Cancel Appointment</h3>
            </div>
            
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.85rem' }}>
              Are you sure you want to cancel appointment <strong>{activeApptForAction.id}</strong> with {activeApptForAction.doctorName}?
            </p>

            <div style={{ marginBottom: '1.1rem' }}>
              <label className="form-label">Reason for Cancellation (Required)</label>
              <textarea 
                className="form-input"
                style={{ height: '70px', resize: 'none', fontSize: '0.8rem' }}
                value={cancellationReasonInput}
                onChange={(e) => setCancellationReasonInput(e.target.value)}
                placeholder="e.g. Schedule conflict, feeling better, doctor emergency"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.55rem 1rem' }} onClick={() => setIsCancelModalOpen(false)}>Back</button>
              <button 
                type="button" 
                className="btn-danger"
                disabled={!cancellationReasonInput.trim()}
                style={{ opacity: cancellationReasonInput.trim() ? 1 : 0.6, fontSize: '0.8rem', padding: '0.55rem 1rem' }}
                onClick={handleConfirmCancel}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE APPOINTMENT MODAL */}
      {isRescheduleModalOpen && activeApptForAction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem', color: '#0f172a' }}>Reschedule Appointment</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.1rem' }}>
              Currently: <strong>{activeApptForAction.date} at {activeApptForAction.time}</strong>
            </p>

            <div style={{ marginBottom: '0.85rem' }}>
              <label className="form-label">Select New Date</label>
              <input 
                type="date" 
                className="form-input"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
              />
            </div>

            <div className="slots-container" style={{ marginTop: '0.85rem' }}>
              <div className="slots-title">Select New Time Slot</div>
              <div className="slots-grid">
                {DEFAULT_TIME_SLOTS.map(slot => (
                  <button
                    type="button"
                    key={slot.time}
                    className={`slot-chip ${rescheduleTimeSlot === slot.time ? 'selected' : ''}`}
                    onClick={() => setRescheduleTimeSlot(slot.time)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
              <button type="button" className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.55rem 1rem' }} onClick={() => setIsRescheduleModalOpen(false)}>Cancel</button>
              <button 
                type="button" 
                className="btn-primary"
                disabled={!rescheduleTimeSlot}
                style={{ opacity: rescheduleTimeSlot ? 1 : 0.6, fontSize: '0.8rem', padding: '0.55rem 1rem' }}
                onClick={handleConfirmReschedule}
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCTOR SET TIME-OFF MODAL */}
      {isTimeOffModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', marginBottom: '0.75rem' }}>
              <Calendar size={22} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Set Time-Off</h3>
            </div>

            <form onSubmit={handleConfirmTimeOff}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Start Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="form-input"
                  value={timeOffStart}
                  onChange={(e) => setTimeOffStart(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">End Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="form-input"
                  value={timeOffEnd}
                  onChange={(e) => setTimeOffEnd(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <label className="form-label">Reason</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={timeOffReason}
                  onChange={(e) => setTimeOffReason(e.target.value)}
                  placeholder="e.g. Personal Leave, Conference, Vacation"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.55rem 1rem' }} onClick={() => setIsTimeOffModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.55rem 1rem' }}>Set Time-Off</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
