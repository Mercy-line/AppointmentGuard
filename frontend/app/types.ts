export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  specialization?: string;
  date_of_birth?: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  hours: string;
  avatarInitials: string;
  avatarUrl?: string;
  slotDurationMinutes: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  rawStartIso?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: 'BOOKED' | 'CANCELLED' | 'NEEDS_RESCHEDULE' | 'CONFIRMED';
  cancellationReason?: string;
  notificationSent?: boolean;
  bookedByGuardianName?: string;
}

export interface DoctorTimeOff {
  id: string;
  doctorId: string;
  doctorName: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface PatientUser {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  date_of_birth?: string | null;
  timezone?: string;
}
