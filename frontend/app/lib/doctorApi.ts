import type { Doctor, TimeSlot } from '../types';
import { API_BASE_URL } from './authApi';

export async function fetchDoctorsFromAPI(): Promise<Doctor[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/doctors/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    return data.results || data;
  } catch {
    return [];
  }
}

export async function fetchDoctorSlotsFromAPI(doctorId: string, dateStr: string): Promise<TimeSlot[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/doctors/${doctorId}/slots/?date=${dateStr}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    return data.available_slots || [];
  } catch {
    return [];
  }
}
