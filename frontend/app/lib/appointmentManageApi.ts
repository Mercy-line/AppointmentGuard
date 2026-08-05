const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export async function cancelAppointmentAPI(appointmentId: string, reason: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/cancel/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.detail || 'Failed to cancel appointment');
    }
    return await res.json();
  } catch (error) {
    console.warn('Backend API cancel appointment request:', error);
    return null;
  }
}

export async function rescheduleAppointmentAPI(appointmentId: string, newStartTimeIso: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/reschedule/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_start_time: newStartTimeIso }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.detail || 'Failed to reschedule appointment');
    }
    return await res.json();
  } catch (error) {
    console.warn('Backend API reschedule appointment request:', error);
    return null;
  }
}
