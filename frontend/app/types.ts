export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  specialization?: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  hours: string;
  avatarInitials: string;
  slotDurationMinutes: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
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
  status: 'CONFIRMED' | 'CANCELLED' | 'NEEDS_RESCHEDULE';
  cancellationReason?: string;
  notificationSent?: boolean;
}

export interface DoctorTimeOff {
  id: string;
  doctorId: string;
  doctorName: string;
  startTime: string;
  endTime: string;
  reason: string;
}
