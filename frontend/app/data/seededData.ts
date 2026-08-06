import type { User, Doctor } from '../types';

export const SEEDED_USERS: Record<string, User> = {
  'john@patient.com': { id: 'P101', email: 'john@patient.com', username: 'patient_john', name: 'John Doe', role: 'PATIENT' },
  'dr.alice@clinic.com': { id: 'D201', email: 'dr.alice@clinic.com', username: 'dr_alice', name: 'Dr. Alice Cherop', role: 'DOCTOR', specialization: 'Cardiology' },
  'admin@appointmentguard.com': { id: 'A301', email: 'admin@appointmentguard.com', username: 'admin', name: 'System Admin', role: 'ADMIN' },
};

export const DEFAULT_DOCTORS: Doctor[] = [
  { id: '1', name: 'Dr. Alice Cherop', email: 'dr.alice@clinic.com', specialization: 'Cardiology', hours: 'Mon–Fri, 9:00 AM – 5:00 PM', avatarInitials: 'AC', slotDurationMinutes: 30 },
  { id: '2', name: 'Dr. John Kimani', email: 'dr.john@clinic.com', specialization: 'General Practice', hours: 'Mon–Fri, 9:00 AM – 5:00 PM', avatarInitials: 'JK', slotDurationMinutes: 30 },
  { id: '3', name: 'Dr. Charlie Onyancha', email: 'dr.charlie@clinic.com', specialization: 'Pediatrics', hours: 'Mon–Fri, 9:00 AM – 5:00 PM', avatarInitials: 'CO', slotDurationMinutes: 30 },
  { id: '4', name: 'Dr. Diana Atieno', email: 'dr.diana@clinic.com', specialization: 'Dermatology', hours: 'Mon–Fri, 9:00 AM – 5:00 PM', avatarInitials: 'DA', slotDurationMinutes: 30 },
  { id: '5', name: 'Dr. Evans Muyoma', email: 'dr.evans@clinic.com', specialization: 'Orthopedics', hours: 'Mon–Fri, 9:00 AM – 5:00 PM', avatarInitials: 'EM', slotDurationMinutes: 30 },
];
