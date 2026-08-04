'use client';

import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, Calendar, Clock, User as UserIcon, CheckCircle2, Shield,
  Activity, Heart, Baby, Syringe, TestTube, RefreshCw, LogOut, Lock, 
  AlertTriangle, AlertCircle, PlusCircle, Settings, Key, Check, Users, FileText,
  Menu, X, ChevronDown, ChevronUp
} from 'lucide-react';
import type { User, Doctor, TimeSlot, Appointment, DoctorTimeOff } from './types';
import { 
  fetchDoctorsFromAPI, 
  fetchDoctorSlotsFromAPI, 
  bookAppointmentAPI, 
  cancelAppointmentAPI, 
  rescheduleAppointmentAPI, 
  fetchPatientAppointmentsAPI 
} from './lib/api';

// Seed Users
const SEEDED_USERS: Record<string, User> = {
  'john@patient.com': { id: 'P101', email: 'john@patient.com', username: 'patient_john', name: 'John Doe', role: 'PATIENT' },
  'dr.alice@clinic.com': { id: 'D201', email: 'dr.alice@clinic.com', username: 'dr_alice', name: 'Dr. Alice Cherop', role: 'DOCTOR', specialization: 'Cardiology' },
  'admin@appointmentguard.com': { id: 'A301', email: 'admin@appointmentguard.com', username: 'admin', name: 'System Admin', role: 'ADMIN' },
};

const INITIAL_DOCTORS: Doctor[] = [
  { 
    id: '1', 
    name: 'Dr. Alice Cherop', 
    email: 'dr.alice@clinic.com', 
    specialization: 'Cardiology', 
    hours: 'Mon–Fri, 8:00 AM – 4:00 PM', 
    avatarInitials: 'AC', 
    slotDurationMinutes: 30 
  },
  { 
    id: '2', 
    name: 'Dr. Peter Kamau', 
    email: 'dr.peter@clinic.com', 
    specialization: 'Pediatrician', 
    hours: 'Mon–Sat, 9:00 AM – 3:00 PM', 
    avatarInitials: 'PK', 
    slotDurationMinutes: 30 
  },
  { 
    id: '3', 
    name: 'Dr. Grace Otieno', 
    email: 'dr.grace@clinic.com', 
    specialization: 'Obstetrics & Gynecology', 
    hours: 'Tue–Sat, 10:00 AM – 5:00 PM', 
    avatarInitials: 'GO', 
    slotDurationMinutes: 30 
  },
  { 
    id: '4', 
    name: 'Dr. Samuel Mwangi', 
    email: 'dr.samuel@clinic.com', 
    specialization: 'Internal Medicine', 
    hours: 'Mon–Fri, 11:00 AM – 6:00 PM', 
    avatarInitials: 'SM', 
    slotDurationMinutes: 30 
  },
  { 
    id: '5', 
    name: 'Dr. Lydia Wanjiru', 
    email: 'dr.lydia@clinic.com', 
    specialization: 'Family Medicine', 
    hours: 'Wed–Sun, 8:30 AM – 2:30 PM', 
    avatarInitials: 'LW', 
    slotDurationMinutes: 30 
  },
];

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
  // Doctors State (synced with Django API or initial)
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(INITIAL_DOCTORS);

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
  const [selectedAdminDoctorId, setSelectedAdminDoctorId] = useState<string>('1');

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('john@patient.com');
  const [loginPassword, setLoginPassword] = useState<string>('PatientPass123!');
  const [authError, setAuthError] = useState<string | null>(null);

  // Settings Modal & Password Change State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  // Booking & Appointments State
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('1');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-05');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);
  const [patientBookingName, setPatientBookingName] = useState<string>('John Doe');

  // Appointments DB State
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'APT-1001',
      doctorId: '1',
      doctorName: 'Dr. Alice Cherop',
      specialization: 'Cardiology',
      patientId: 'P101',
      patientName: 'John Doe',
      date: '2026-08-05',
      time: '10:00 AM',
      status: 'CONFIRMED'
    },
    {
      id: 'APT-1002',
      doctorId: '2',
      doctorName: 'Dr. Peter Kamau',
      specialization: 'Pediatrician',
      patientId: 'P101',
      patientName: 'John Doe',
      date: '2026-08-06',
      time: '11:30 AM',
      status: 'CONFIRMED'
    },
    {
      id: 'APT-1003',
      doctorId: '1',
      doctorName: 'Dr. Alice Cherop',
      specialization: 'Cardiology',
      patientId: 'P101',
      patientName: 'John Doe',
      date: '2026-08-01',
      time: '02:30 PM',
      status: 'CANCELLED',
      cancellationReason: 'Personal emergency schedule change'
    },
    {
      id: 'APT-1004',
      doctorId: '3',
      doctorName: 'Dr. Grace Otieno',
      specialization: 'Obstetrics & Gynecology',
      patientId: 'P105',
      patientName: 'Mary Wanjiku',
      date: '2026-08-07',
      time: '09:00 AM',
      status: 'CONFIRMED'
    }
  ]);

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

  // Fetch doctors from Django REST API on mount
  useEffect(() => {
    async function loadDoctorsFromBackend() {
      const data = await fetchDoctorsFromAPI();
      if (data && Array.isArray(data) && data.length > 0) {
        setDoctorsList(data);
      }
    }
    loadDoctorsFromBackend();
  }, []);

  // Fetch appointments for patient when logged in
  useEffect(() => {
    async function loadPatientAppts() {
      if (currentUser && currentUser.role === 'PATIENT') {
        const apiAppts = await fetchPatientAppointmentsAPI(currentUser.id);
        if (apiAppts && Array.isArray(apiAppts) && apiAppts.length > 0) {
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
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const user = SEEDED_USERS[loginEmail.trim().toLowerCase()];
    if (user) {
      setCurrentUser(user);
      setIsLoginModalOpen(false);
      setIsMobileMenuOpen(false);
      setCurrentView('DASHBOARD');
      setPatientFilterTab('SCHEDULED');
      setDoctorFilterTab('DOCTOR_QUEUE');
      setAdminFilterTab('ADMIN_OVERVIEW');
    } else {
      setAuthError('Invalid credentials. Please use one of the quick demo accounts below.');
    }
  };

  const handleQuickDemoLogin = (email: string) => {
    const user = SEEDED_USERS[email];
    if (user) {
      setCurrentUser(user);
      setIsLoginModalOpen(false);
      setIsMobileMenuOpen(false);
      setCurrentView('DASHBOARD');
      setPatientFilterTab('SCHEDULED');
      setDoctorFilterTab('DOCTOR_QUEUE');
      setAdminFilterTab('ADMIN_OVERVIEW');
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
    
    // Call Django REST API endpoint
    await bookAppointmentAPI(doc ? doc.id : '1', `${selectedDate}T10:00:00Z`, currentUser?.id);

    const newAppt: Appointment = {
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
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

    // Call Django REST API endpoint
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

    // Call Django REST API endpoint
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

  // Doctor Emergency Time-Off Handler
  const handleConfirmTimeOff = (e: React.FormEvent) => {
    e.preventDefault();
    const docId = currentUser?.role === 'DOCTOR' ? '1' : selectedDoctorId;

    const newTimeOff: DoctorTimeOff = {
      id: `TO-${Math.floor(100 + Math.random() * 900)}`,
      doctorId: docId,
      doctorName: doctorsList.find(d => d.id === docId)?.name || 'Dr. Alice Cherop',
      startTime: timeOffStart,
      endTime: timeOffEnd,
      reason: timeOffReason
    };

    setTimeOffList([newTimeOff, ...timeOffList]);

    // Cancel all existing appointments for this doctor & notify patients
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
  const selectedDoctorAppointments = appointments.filter(a => a.doctorId === selectedAdminDoctor.id || a.doctorName.includes(selectedAdminDoctor.name));

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
          </div>

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
                    const isSelected = doc.id === selectedAdminDoctor.id;
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

          {/* 5. OUR DOCTORS SECTION — DOWNWARD EXPANDABLE ACCORDION LIST WITH CIRCULAR INITIALS */}
          <section className="section section-tint" id="doctors-section">
            <div className="section-header">
              <h2 className="section-title">Our Doctors</h2>
              <p className="section-subtitle">Click on any doctor's name below to expand their timeline and available hours.</p>
            </div>

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
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', borderRadius: '10px', fontSize: '0.85rem' }}>
                Sign In
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', textAlign: 'center' }}>
                Quick Demo Accounts (1-Click Login)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <button 
                  type="button"
                  className="btn-sm-outline"
                  style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}
                  onClick={() => handleQuickDemoLogin('john@patient.com')}
                >
                  <span>Patient: john@patient.com</span>
                  <span className="role-badge role-patient">Patient</span>
                </button>
                <button 
                  type="button"
                  className="btn-sm-outline"
                  style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}
                  onClick={() => handleQuickDemoLogin('dr.alice@clinic.com')}
                >
                  <span>Doctor: dr.alice@clinic.com</span>
                  <span className="role-badge role-doctor">Doctor</span>
                </button>
                <button 
                  type="button"
                  className="btn-sm-outline"
                  style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}
                  onClick={() => handleQuickDemoLogin('admin@appointmentguard.com')}
                >
                  <span>Admin: admin@appointmentguard.com</span>
                  <span className="role-badge role-admin">Admin</span>
                </button>
              </div>
            </div>

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
