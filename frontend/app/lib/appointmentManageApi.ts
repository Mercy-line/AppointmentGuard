import { API_BASE_URL } from './authApi';

export async function cancelAppointmentAPI(apptId: string, reason: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments/${apptId}/cancel/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function rescheduleAppointmentAPI(apptId: string, newStartIso: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments/${apptId}/reschedule/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_start_time: newStartIso }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
