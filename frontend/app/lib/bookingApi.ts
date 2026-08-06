import type { Appointment, User } from '../types';
import { API_BASE_URL } from './authApi';

export async function bookAppointmentAPI(doctorId: string, startIso: string, patientId?: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctor: doctorId, start_time: startIso, patient: patientId }),
    });
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchPatientAppointmentsAPI(patientId: string): Promise<Appointment[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments/?patient=${patientId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    return data.results || data;
  } catch {
    return [];
  }
}

export async function fetchPatientsListAPI(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/patients/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    return data.results || data;
  } catch {
    return [];
  }
}
