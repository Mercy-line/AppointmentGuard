import type { Doctor } from '../types';

export const INITIAL_DEMO_DOCTORS: Doctor[] = [
  { id: '1', name: 'Dr. Alice Smith', email: 'dr.alice@clinic.com', specialization: 'General Practice', avatarInitials: 'AS', hours: 'Mon - Fri, 9:00 AM - 5:00 PM', slotDurationMinutes: 30 },
  { id: '2', name: 'Dr. Bob Jones', email: 'dr.bob@clinic.com', specialization: 'Pediatrics', avatarInitials: 'BJ', hours: 'Mon - Fri, 9:00 AM - 5:00 PM', slotDurationMinutes: 30 },
  { id: '3', name: 'Dr. Carol White', email: 'dr.carol@clinic.com', specialization: 'Cardiology', avatarInitials: 'CW', hours: 'Mon - Fri, 9:00 AM - 5:00 PM', slotDurationMinutes: 30 },
  { id: '4', name: 'Dr. David Brown', email: 'dr.david@clinic.com', specialization: 'Dermatology', avatarInitials: 'DB', hours: 'Mon - Fri, 9:00 AM - 5:00 PM', slotDurationMinutes: 30 },
  { id: '5', name: 'Dr. Emily Davis', email: 'dr.emily@clinic.com', specialization: 'Neurology', avatarInitials: 'ED', hours: 'Mon - Fri, 9:00 AM - 5:00 PM', slotDurationMinutes: 30 }
];
