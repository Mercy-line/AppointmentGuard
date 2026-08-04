'use client';

import React, { useState } from 'react';
import { 
  Stethoscope, Calendar, Clock, User as UserIcon, CheckCircle2, Shield,
  Activity, Heart, Baby, Syringe, TestTube, RefreshCw, LogOut, Lock, 
  AlertTriangle, AlertCircle, PlusCircle, Settings, Key, Check, Users, FileText
} from 'lucide-react';
import type { User, Doctor, TimeSlot, Appointment, DoctorTimeOff } from './types';

// Seed Users
const SEEDED_USERS: Record<string, User> = {
  'john@patient.com': { id: 'P101', email: 'john@patient.com', username: 'patient_john', name: 'John Doe', role: 'PATIENT' },
  'dr.alice@clinic.com': { id: 'D201', email: 'dr.alice@clinic.com', username: 'dr_alice', name: 'Dr. Alice Cherop', role: 'DOCTOR', specialization: 'Cardiology' },
  'admin@appointmentguard.com': { id: 'A301', email: 'admin@appointmentguard.com', username: 'admin', name: 'System Admin', role: 'ADMIN' },
};

const INITIAL_DOCTORS: Doctor[] = [
  { id: '1', name: 'Dr. Alice Cherop', email: 'dr.alice@clinic.com', specialization: 'Cardiology', hours: 'Mon–Fri, 8:00 AM – 4:00 PM', avatarInitials: 'AC', slotDurationMinutes: 30 },
  { id: '2', name: 'Dr. Peter Kamau', email: 'dr.peter@clinic.com', specialization: 'Pediatrician', hours: 'Mon–Sat, 9:00 AM – 3:00 PM', avatarInitials: 'PK', slotDurationMinutes: 30 },
  { id: '3', name: 'Dr. Grace Otieno', email: 'dr.grace@clinic.com', specialization: 'Obstetrics & Gynecology', hours: 'Tue–Sat, 10:00 AM – 5:00 PM', avatarInitials: 'GO', slotDurationMinutes: 30 },
  { id: '4', name: 'Dr. Samuel Mwangi', email: 'dr.samuel@clinic.com', specialization: 'Internal Medicine', hours: 'Mon–Fri, 11:00 AM – 6:00 PM', avatarInitials: 'SM', slotDurationMinutes: 30 },
  { id: '5', name: 'Dr. Lydia Wanjiru', email: 'dr.lydia@clinic.com', specialization: 'Family Medicine', hours: 'Wed–Sun, 8:30 AM – 2:30 PM', avatarInitials: 'LW', slotDurationMinutes: 30 },
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
  // Navigation View: 'HOME' | 'DASHBOARD'
  const [currentView, setCurrentView] = useState<'HOME' | 'DASHBOARD'>('HOME');
  
  // Patient Filter Tab: 'SCHEDULED' | 'BOOK_NEW' | 'CANCELLED'
  const [patientFilterTab, setPatientFilterTab] = useState<'SCHEDULED' | 'BOOK_NEW' | 'CANCELLED'>('SCHEDULED');

  // Doctor Filter Tab: 'DOCTOR_QUEUE' | 'DOCTOR_CANCELLED'
  const [doctorFilterTab, setDoctorFilterTab] = useState<'DOCTOR_QUEUE' | 'DOCTOR_CANCELLED'>('DOCTOR_QUEUE');

  // Admin Main Filter Tab: 'ADMIN_OVERVIEW' | 'ADMIN_DOCTORS' | 'ADMIN_APPOINTMENTS'
  const [adminFilterTab, setAdminFilterTab] = useState<'ADMIN_OVERVIEW' | 'ADMIN_DOCTORS' | 'ADMIN_APPOINTMENTS'>('ADMIN_DOCTORS');

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
  const [timeOffReason, setTimeOffReason] = useState<string>('Attending Medical Conference');

  // Login Handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const user = SEEDED_USERS[loginEmail.trim().toLowerCase()];
    if (user) {
      setCurrentUser(user);
      setIsLoginModalOpen(false);
      setCurrentView('DASHBOARD');
      setPatientFilterTab('SCHEDULED');
      setDoctorFilterTab('DOCTOR_QUEUE');
      setAdminFilterTab('ADMIN_DOCTORS');
    } else {
      setAuthError('Invalid credentials. Please use one of the quick demo accounts below.');
    }
  };

  const handleQuickDemoLogin = (email: string) => {
    const user = SEEDED_USERS[email];
    if (user) {
      setCurrentUser(user);
      setIsLoginModalOpen(false);
      setCurrentView('DASHBOARD');
      setPatientFilterTab('SCHEDULED');
      setDoctorFilterTab('DOCTOR_QUEUE');
      setAdminFilterTab('ADMIN_DOCTORS');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('HOME');
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

  // Booking Submit
  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTimeSlot) return;

    const doc = INITIAL_DOCTORS.find(d => d.id === selectedDoctorId);
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

  // Cancel Appointment Handler
  const handleConfirmCancel = () => {
    if (!activeApptForAction || !cancellationReasonInput.trim()) return;

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

  // Reschedule Appointment Handler
  const handleConfirmReschedule = () => {
    if (!activeApptForAction || !rescheduleTimeSlot) return;

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
      doctorName: INITIAL_DOCTORS.find(d => d.id === docId)?.name || 'Dr. Alice Cherop',
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
          cancellationReason: `Doctor Emergency Time-Off (${timeOffReason}).`,
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

  const selectedAdminDoctor = INITIAL_DOCTORS.find(d => d.id === selectedAdminDoctorId) || INITIAL_DOCTORS[0];
  const selectedDoctorAppointments = appointments.filter(a => a.doctorId === selectedAdminDoctor.id || a.doctorName.includes(selectedAdminDoctor.name));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="brand" onClick={() => setCurrentView('HOME')}>
          <div className="brand-icon">
            <Stethoscope size={24} />
          </div>
          <span>AppointmentGuard</span>
        </div>

        <div className="nav-links">
          {currentUser ? (
            /* LOGGED-IN NAVBAR */
            <>
              <div className="user-pill">
                <span>👤 {currentUser.name}</span>
                <span className={`role-badge role-${currentUser.role.toLowerCase()}`}>{currentUser.role}</span>
              </div>

              {/* SETTINGS GEAR ICON BUTTON */}
              <button 
                className="btn-sm-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '30px' }}
                onClick={() => setIsSettingsModalOpen(true)}
              >
                <Settings size={18} color="#0284c7" /> Settings
              </button>

              <button className="btn-logout" onClick={handleLogout}>
                <LogOut size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Logout
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
              <button className="btn-login" onClick={() => setIsLoginModalOpen(true)}>Login</button>
            </>
          )}
        </div>
      </nav>

      {/* VIEW CONDITIONAL RENDERING */}
      {currentView === 'DASHBOARD' && currentUser ? (
        
        /* ROLE-BASED DASHBOARD VIEW */
        <div className="dashboard-container">
          
          {/* WELCOME BANNER */}
          <div className="dash-banner">
            <div>
              <h1>Welcome back, {currentUser.name}!</h1>
              <p>
                {currentUser.role === 'PATIENT' && 'Patient Portal — Select an action below to manage your visits or book a new appointment.'}
                {currentUser.role === 'DOCTOR' && `Doctor Portal — ${currentUser.specialization || 'General Practice'} Schedule & Cancellation Logs.`}
                {currentUser.role === 'ADMIN' && 'System Administration — Select a doctor tab below to view their assigned appointments.'}
              </p>
            </div>
            
            {currentUser.role === 'DOCTOR' && (
              <button className="btn-warning" onClick={() => setIsTimeOffModalOpen(true)}>
                <AlertTriangle size={18} /> + Log Emergency Time-Off
              </button>
            )}
          </div>

          {/* PATIENT ACTION BUTTON TABS BELOW WELCOME CARD */}
          {currentUser.role === 'PATIENT' && (
            <div className="dashboard-tabs">
              <button
                className={`dashboard-tab-btn ${patientFilterTab === 'BOOK_NEW' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  background: patientFilterTab === 'BOOK_NEW' ? '#0284c7' : 'white',
                  color: patientFilterTab === 'BOOK_NEW' ? 'white' : '#1e293b'
                }}
                onClick={() => setPatientFilterTab('BOOK_NEW')}
              >
                <PlusCircle size={18} /> Book Appointment
              </button>

              <button
                className={`dashboard-tab-btn ${patientFilterTab === 'SCHEDULED' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  background: patientFilterTab === 'SCHEDULED' ? '#0284c7' : 'white',
                  color: patientFilterTab === 'SCHEDULED' ? 'white' : '#1e293b'
                }}
                onClick={() => setPatientFilterTab('SCHEDULED')}
              >
                <Calendar size={18} /> My Scheduled Appointments
              </button>

              <button
                className={`dashboard-tab-btn ${patientFilterTab === 'CANCELLED' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  background: patientFilterTab === 'CANCELLED' ? '#ef4444' : 'white',
                  color: patientFilterTab === 'CANCELLED' ? 'white' : '#1e293b',
                  borderColor: patientFilterTab === 'CANCELLED' ? '#ef4444' : '#e2e8f0'
                }}
                onClick={() => setPatientFilterTab('CANCELLED')}
              >
                <AlertCircle size={18} /> Cancelled
              </button>
            </div>
          )}

          {/* DOCTOR ACTION BUTTON TABS BELOW WELCOME CARD */}
          {currentUser.role === 'DOCTOR' && (
            <div className="dashboard-tabs">
              <button
                className={`dashboard-tab-btn ${doctorFilterTab === 'DOCTOR_QUEUE' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  background: doctorFilterTab === 'DOCTOR_QUEUE' ? '#0284c7' : 'white',
                  color: doctorFilterTab === 'DOCTOR_QUEUE' ? 'white' : '#1e293b'
                }}
                onClick={() => setDoctorFilterTab('DOCTOR_QUEUE')}
              >
                <Calendar size={18} /> Active Patient Queue
              </button>

              <button
                className={`dashboard-tab-btn ${doctorFilterTab === 'DOCTOR_CANCELLED' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  background: doctorFilterTab === 'DOCTOR_CANCELLED' ? '#ef4444' : 'white',
                  color: doctorFilterTab === 'DOCTOR_CANCELLED' ? 'white' : '#1e293b',
                  borderColor: doctorFilterTab === 'DOCTOR_CANCELLED' ? '#ef4444' : '#e2e8f0'
                }}
                onClick={() => setDoctorFilterTab('DOCTOR_CANCELLED')}
              >
                <AlertCircle size={18} /> Cancelled Appointments
              </button>
            </div>
          )}

          {/* ADMIN ACTION BUTTON TABS BELOW WELCOME CARD */}
          {currentUser.role === 'ADMIN' && (
            <div className="dashboard-tabs">
              <button
                className={`dashboard-tab-btn ${adminFilterTab === 'ADMIN_DOCTORS' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  background: adminFilterTab === 'ADMIN_DOCTORS' ? '#0284c7' : 'white',
                  color: adminFilterTab === 'ADMIN_DOCTORS' ? 'white' : '#1e293b'
                }}
                onClick={() => setAdminFilterTab('ADMIN_DOCTORS')}
              >
                <Users size={18} /> Doctors & Assigned Appointments
              </button>

              <button
                className={`dashboard-tab-btn ${adminFilterTab === 'ADMIN_OVERVIEW' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  background: adminFilterTab === 'ADMIN_OVERVIEW' ? '#0284c7' : 'white',
                  color: adminFilterTab === 'ADMIN_OVERVIEW' ? 'white' : '#1e293b'
                }}
                onClick={() => setAdminFilterTab('ADMIN_OVERVIEW')}
              >
                <Activity size={18} /> System Metrics Overview
              </button>

              <button
                className={`dashboard-tab-btn ${adminFilterTab === 'ADMIN_APPOINTMENTS' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  background: adminFilterTab === 'ADMIN_APPOINTMENTS' ? '#0284c7' : 'white',
                  color: adminFilterTab === 'ADMIN_APPOINTMENTS' ? 'white' : '#1e293b'
                }}
                onClick={() => setAdminFilterTab('ADMIN_APPOINTMENTS')}
              >
                <FileText size={18} /> All Appointments Master Log
              </button>
            </div>
          )}

          {/* ADMIN OVERVIEW METRICS CARDS */}
          {currentUser.role === 'ADMIN' && adminFilterTab === 'ADMIN_OVERVIEW' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#0284c7', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Appointments</span>
                  <Calendar size={22} />
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{appointments.length}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.3rem' }}>All-time bookings log</p>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#059669', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Active Doctors</span>
                  <Users size={22} />
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{INITIAL_DOCTORS.length}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.3rem' }}>Across 5 specialties</p>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#166534', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Confirmed Visits</span>
                  <CheckCircle2 size={22} />
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{appointments.filter(a => a.status === 'CONFIRMED').length}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.3rem' }}>Active scheduled slots</p>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#dc2626', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Cancelled Visits</span>
                  <AlertCircle size={22} />
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{appointments.filter(a => a.status === 'CANCELLED').length}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.3rem' }}>Cancelled / emergency time-off</p>
              </div>
            </div>
          )}

          {/* ADMIN VIEW: INDIVIDUAL DOCTOR TABS WITH THEIR SPECIFIC APPOINTMENTS */}
          {currentUser.role === 'ADMIN' && adminFilterTab === 'ADMIN_DOCTORS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* DOCTOR SELECTOR TABS */}
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                  Select a Doctor to View Their Assigned Appointments:
                </h3>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {INITIAL_DOCTORS.map(doc => {
                    const docApptCount = appointments.filter(a => a.doctorId === doc.id || a.doctorName.includes(doc.name)).length;
                    const isSelected = doc.id === selectedAdminDoctor.id;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedAdminDoctorId(doc.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.65rem 1.25rem',
                          borderRadius: '30px',
                          border: `2px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
                          background: isSelected ? '#e0f2fe' : 'white',
                          color: isSelected ? '#0369a1' : '#334155',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          flexWrap: 'nowrap'
                        }}
                      >
                        <span>🩺 {doc.name}</span>
                        <span style={{ 
                          background: isSelected ? '#0284c7' : '#cbd5e1', 
                          color: 'white', 
                          padding: '0.15rem 0.55rem', 
                          borderRadius: '20px', 
                          fontSize: '0.78rem',
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
              <div style={{ background: 'white', borderRadius: '18px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                
                {/* Selected Doctor Profile Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="doctor-avatar" style={{ margin: 0, width: '56px', height: '56px', fontSize: '1.3rem' }}>
                      {selectedAdminDoctor.avatarInitials}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{selectedAdminDoctor.name}</h2>
                      <p style={{ fontSize: '0.9rem', color: '#0284c7', fontWeight: 600, marginTop: '0.2rem' }}>
                        {selectedAdminDoctor.specialization} • {selectedAdminDoctor.hours}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Appointments</span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{selectedDoctorAppointments.length}</h3>
                  </div>
                </div>

                {/* Appointments List for Selected Doctor */}
                {selectedDoctorAppointments.length === 0 ? (
                  <div style={{ padding: '3rem 1rem', color: '#64748b', textAlign: 'center' }}>
                    <Calendar size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontWeight: 600 }}>No appointments booked for {selectedAdminDoctor.name} yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {selectedDoctorAppointments.map(appt => (
                      <div 
                        key={appt.id} 
                        style={{ 
                          padding: '1.25rem', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '14px', 
                          background: '#ffffff'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>Ref: {appt.id}</span>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                              Patient: {appt.patientName}
                            </h3>
                            <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
                              Doctor: {appt.doctorName} ({appt.specialization})
                            </p>
                          </div>

                          <span className={`role-badge badge-${appt.status.toLowerCase()}`}>
                            {appt.status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.85rem', color: '#334155', fontSize: '0.9rem', fontWeight: 600, flexWrap: 'wrap' }}>
                          <span>📅 {appt.date}</span>
                          <span>🕒 {appt.time} (30 mins)</span>
                        </div>

                        {appt.cancellationReason && (
                          <div style={{ marginTop: '0.85rem', padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.85rem' }}>
                            <strong>Reason / Alert:</strong> {appt.cancellationReason}
                          </div>
                        )}

                        {appt.status !== 'CANCELLED' && (
                          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button 
                              className="btn-sm-outline"
                              onClick={() => {
                                setActiveApptForAction(appt);
                                setIsRescheduleModalOpen(true);
                              }}
                            >
                              Reschedule
                            </button>
                            
                            <button 
                              className="btn-danger"
                              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* PATIENT BOOKING SEARCH CARD */}
              {(currentUser.role === 'PATIENT' && patientFilterTab === 'BOOK_NEW') && (
                <div className="search-card">
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
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
                        {INITIAL_DOCTORS.map(doc => (
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

                    <button className="btn-primary" style={{ padding: '0.9rem 2.2rem' }}>
                      Check Availability
                    </button>
                  </div>

                  <div className="slots-container">
                    <div className="slots-title">Available 30-minute time slots</div>
                    <div className="slots-grid">
                      {DEFAULT_TIME_SLOTS.map(slot => (
                        <button
                          key={slot.time}
                          className={`slot-chip ${selectedTimeSlot === slot.time ? 'selected' : ''}`}
                          onClick={() => setSelectedTimeSlot(slot.time)}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>

                    <button 
                      className="btn-primary"
                      disabled={!selectedTimeSlot}
                      style={{ opacity: selectedTimeSlot ? 1 : 0.6, cursor: selectedTimeSlot ? 'pointer' : 'not-allowed' }}
                      onClick={() => setIsBookModalOpen(true)}
                    >
                      Book Selected Slot
                    </button>
                  </div>
                </div>
              )}

              {/* APPOINTMENTS LIST CARD */}
              {(currentUser.role !== 'PATIENT' || patientFilterTab !== 'BOOK_NEW') && (
                <div style={{ background: 'white', borderRadius: '18px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                      {currentUser.role === 'PATIENT' && (
                        patientFilterTab === 'SCHEDULED' ? 'My Scheduled Appointments' : 'Cancelled Appointments'
                      )}
                      {currentUser.role === 'DOCTOR' && (
                        doctorFilterTab === 'DOCTOR_QUEUE' ? 'Active Patient Queue' : 'Doctor Cancelled Appointments Log'
                      )}
                      {currentUser.role === 'ADMIN' && 'System Appointments Master Log'}
                    </h2>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{visibleAppointments.length} Records</span>
                  </div>

                  {visibleAppointments.length === 0 ? (
                    <div style={{ padding: '3rem 1rem', color: '#64748b', textAlign: 'center' }}>
                      <Calendar size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                      <p style={{ fontWeight: 600 }}>No appointments in this category.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {visibleAppointments.map(appt => (
                        <div 
                          key={appt.id} 
                          style={{ 
                            padding: '1.25rem', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '14px', 
                            background: '#ffffff',
                            borderColor: '#e2e8f0'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>Ref: {appt.id}</span>
                              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                                {currentUser.role === 'PATIENT' ? appt.doctorName : `Patient: ${appt.patientName}`}
                              </h3>
                              <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
                                {currentUser.role === 'PATIENT' ? appt.specialization : `Assigned Doctor: ${appt.doctorName}`}
                              </p>
                            </div>

                            <span className={`role-badge badge-${appt.status.toLowerCase()}`}>
                              {appt.status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.85rem', color: '#334155', fontSize: '0.9rem', fontWeight: 600, flexWrap: 'wrap' }}>
                            <span>📅 {appt.date}</span>
                            <span>🕒 {appt.time} (30 mins)</span>
                          </div>

                          {appt.cancellationReason && (
                            <div style={{ marginTop: '0.85rem', padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.85rem' }}>
                              <strong>Reason / Alert:</strong> {appt.cancellationReason}
                            </div>
                          )}

                          {appt.status !== 'CANCELLED' && (
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              <button 
                                className="btn-sm-outline"
                                onClick={() => {
                                  setActiveApptForAction(appt);
                                  setIsRescheduleModalOpen(true);
                                }}
                              >
                                Reschedule
                              </button>
                              
                              <button 
                                className="btn-danger"
                                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
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
                  <button className="btn-primary" onClick={() => setIsLoginModalOpen(true)}>
                    Book Appointment
                  </button>
                  <a href="#doctors-section" className="btn-outline">View Doctors</a>
                </div>
              </div>

              <div className="hero-card-img">
                <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <div style={{ 
                    background: '#e0f2fe', 
                    borderRadius: '50%', 
                    width: '180px', 
                    height: '180px', 
                    margin: '0 auto 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Calendar size={90} color="#0284c7" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Real-Time Availability</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem' }}>Instant confirmation & concurrency safe booking</p>
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
                <Stethoscope size={24} color="#087990" />
                <span>General Consultation</span>
              </div>
              <div className="service-card">
                <Baby size={24} color="#087990" />
                <span>Pediatrics</span>
              </div>
              <div className="service-card">
                <Heart size={24} color="#087990" />
                <span>Women's Health</span>
              </div>
              <div className="service-card">
                <Syringe size={24} color="#087990" />
                <span>Vaccinations</span>
              </div>
              <div className="service-card">
                <TestTube size={24} color="#087990" />
                <span>Laboratory Services</span>
              </div>
              <div className="service-card">
                <RefreshCw size={24} color="#087990" />
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
                  <UserIcon size={24} />
                </div>
                <h3 className="feature-title">Choose a Doctor</h3>
                <p className="feature-desc">Browse our clinicians and pick the right specialist for your needs.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-badge">
                  <Calendar size={24} />
                </div>
                <h3 className="feature-title">Pick a Time</h3>
                <p className="feature-desc">See real-time openings and select a 30-minute slot that fits your schedule.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-badge">
                  <CheckCircle2 size={24} />
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
                  <Activity size={24} />
                </div>
                <h3 className="feature-title">Easy Online Booking</h3>
                <p className="feature-desc">Book a visit in under a minute, any time of day.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-badge">
                  <UserIcon size={24} />
                </div>
                <h3 className="feature-title">Qualified Doctors</h3>
                <p className="feature-desc">Licensed clinicians across five core specialties.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-badge">
                  <Clock size={24} />
                </div>
                <h3 className="feature-title">Real-Time Availability</h3>
                <p className="feature-desc">Slots update instantly so you never double-book.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-badge">
                  <Shield size={24} />
                </div>
                <h3 className="feature-title">Secure Patient Records</h3>
                <p className="feature-desc">Your health data stays private and encrypted.</p>
              </div>
            </div>
          </section>

          {/* 5. OUR DOCTORS SECTION */}
          <section className="section section-tint" id="doctors-section">
            <div className="section-header">
              <h2 className="section-title">Our Doctors</h2>
            </div>

            <div className="doctors-grid">
              {INITIAL_DOCTORS.map(doc => (
                <div key={doc.id} className="doctor-card">
                  <div className="doctor-avatar">{doc.avatarInitials}</div>
                  <div className="doctor-name">{doc.name}</div>
                  <div className="doctor-spec">{doc.specialization}</div>
                  <div className="doctor-hours">{doc.hours}</div>
                  <button 
                    className="btn-sm-outline"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* CLEAN FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="brand">
            <div className="brand-icon">
              <Stethoscope size={24} />
            </div>
            <span>AppointmentGuard</span>
          </div>

          <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            © 2026 AppointmentGuard. All rights reserved. Concurrency Safe Booking Engine.
          </div>
        </div>
      </footer>

      {/* SETTINGS / CHANGE PASSWORD MODAL */}
      {isSettingsModalOpen && currentUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Settings size={24} color="#0284c7" />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Account Settings</h3>
              </div>
              <button className="btn-sm-outline" onClick={() => setIsSettingsModalOpen(false)}>Close</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '0.9rem', color: '#334155' }}><strong>User:</strong> {currentUser.name}</p>
              <p style={{ fontSize: '0.9rem', color: '#334155', marginTop: '0.3rem' }}><strong>Email:</strong> {currentUser.email}</p>
              <p style={{ fontSize: '0.9rem', color: '#334155', marginTop: '0.3rem' }}><strong>Role:</strong> {currentUser.role}</p>
            </div>

            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Key size={18} color="#0284c7" /> Change Password
            </h4>

            {passwordChangeSuccess && (
              <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={18} /> {passwordChangeSuccess}
              </div>
            )}

            {passwordChangeError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {passwordChangeError}
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Current Password</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">New Password</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Confirm New Password</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-outline" onClick={() => setIsSettingsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {isLoginModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <div className="brand-icon" style={{ margin: '0 auto 1rem' }}>
                <Lock size={22} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Sign In to AppointmentGuard</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>Enter your credentials to access your dashboard.</p>
            </div>

            {authError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input"
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', borderRadius: '12px' }}>
                Sign In
              </button>
            </form>

            <div style={{ marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'center' }}>
                Quick Demo Accounts (1-Click Login)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  className="btn-sm-outline"
                  style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => handleQuickDemoLogin('john@patient.com')}
                >
                  <span>👤 Patient: john@patient.com</span>
                  <span className="role-badge role-patient">Patient</span>
                </button>
                <button 
                  className="btn-sm-outline"
                  style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => handleQuickDemoLogin('dr.alice@clinic.com')}
                >
                  <span>🩺 Doctor: dr.alice@clinic.com</span>
                  <span className="role-badge role-doctor">Doctor</span>
                </button>
                <button 
                  className="btn-sm-outline"
                  style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => handleQuickDemoLogin('admin@appointmentguard.com')}
                >
                  <span>🛡️ Admin: admin@appointmentguard.com</span>
                  <span className="role-badge role-admin">Admin</span>
                </button>
              </div>
            </div>

            <button 
              style={{ width: '100%', marginTop: '1.25rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
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
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>Confirm Appointment</h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Booking 30-minute slot on <strong>{selectedDate}</strong> at <strong>{selectedTimeSlot}</strong>
            </p>
            <form onSubmit={handleBookSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Patient Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={currentUser ? currentUser.name : patientBookingName} 
                  onChange={(e) => setPatientBookingName(e.target.value)} 
                  required 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn-outline" onClick={() => setIsBookModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm & Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL APPOINTMENT MODAL */}
      {isCancelModalOpen && activeApptForAction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', marginBottom: '1rem' }}>
              <AlertCircle size={28} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Cancel Appointment</h3>
            </div>
            
            <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Are you sure you want to cancel appointment <strong>{activeApptForAction.id}</strong> with {activeApptForAction.doctorName}?
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Reason for Cancellation (Required)</label>
              <textarea 
                className="form-input"
                style={{ height: '80px', resize: 'none' }}
                value={cancellationReasonInput}
                onChange={(e) => setCancellationReasonInput(e.target.value)}
                placeholder="e.g. Schedule conflict, feeling better, doctor emergency"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-outline" onClick={() => setIsCancelModalOpen(false)}>Back</button>
              <button 
                type="button" 
                className="btn-danger"
                disabled={!cancellationReasonInput.trim()}
                style={{ opacity: cancellationReasonInput.trim() ? 1 : 0.6 }}
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
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>Reschedule Appointment</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Currently: <strong>{activeApptForAction.date} at {activeApptForAction.time}</strong>
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Select New Date</label>
              <input 
                type="date" 
                className="form-input"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
              />
            </div>

            <div className="slots-container" style={{ marginTop: '1.25rem' }}>
              <div className="slots-title">Select New Time Slot</div>
              <div className="slots-grid">
                {DEFAULT_TIME_SLOTS.map(slot => (
                  <button
                    key={slot.time}
                    className={`slot-chip ${rescheduleTimeSlot === slot.time ? 'selected' : ''}`}
                    onClick={() => setRescheduleTimeSlot(slot.time)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" className="btn-outline" onClick={() => setIsRescheduleModalOpen(false)}>Cancel</button>
              <button 
                type="button" 
                className="btn-primary"
                disabled={!rescheduleTimeSlot}
                style={{ opacity: rescheduleTimeSlot ? 1 : 0.6 }}
                onClick={handleConfirmReschedule}
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCTOR TIME-OFF MODAL */}
      {isTimeOffModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f59e0b', marginBottom: '1rem' }}>
              <AlertTriangle size={28} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Log Emergency Time-Off</h3>
            </div>

            <form onSubmit={handleConfirmTimeOff}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Start Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="form-input"
                  value={timeOffStart}
                  onChange={(e) => setTimeOffStart(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">End Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="form-input"
                  value={timeOffEnd}
                  onChange={(e) => setTimeOffEnd(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Emergency Reason</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={timeOffReason}
                  onChange={(e) => setTimeOffReason(e.target.value)}
                  placeholder="e.g. Medical emergency, Urgent leave"
                  required
                />
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '0.85rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                ⚠️ <strong>Concurrency Safeguard Notice:</strong> Submitting will automatically cancel impacted patient appointments and notify patients.
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-outline" onClick={() => setIsTimeOffModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-warning">Log & Notify Patients</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
