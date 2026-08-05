const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export async function fetchDoctorsFromAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/doctors/`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.warn('Backend API offline or unreachable, using local doctors state:', error);
    return null;
  }
}

export async function fetchDoctorSlotsFromAPI(doctorId: string, dateStr: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/doctors/${doctorId}/availability/?date=${dateStr}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.available_slots || [];
  } catch (error) {
    console.warn('Backend API offline or unreachable, using local slots state:', error);
    return null;
  }
}

export async function bookAppointmentAPI(doctorId: string, startTimeIso: string, patientId?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctor_id: doctorId,
        start_time: startTimeIso,
        patient_id: patientId
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.detail || 'Failed to book appointment');
    }
    return await res.json();
  } catch (error) {
    console.warn('Backend API book appointment request:', error);
    return null;
  }
}

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

export async function fetchPatientAppointmentsAPI(patientId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/patients/${patientId}/appointments/`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.appointments || [];
  } catch (error) {
    console.warn('Backend API fetch patient appointments:', error);
    return null;
  }
}

export async function loginAPI(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.detail || 'Invalid email address or password.');
  }
  return await res.json();
}

export async function registerAPI(data: { email: string; password: string; name: string; role?: string; specialization?: string }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.detail || `Error (${res.status}): Unable to process account registration.`);
    }
    return await res.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('NetworkError: Backend server connection timed out.');
    }
    throw error;
  }
}

export async function fetchPatientsListAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/patients/list/`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.warn('Backend API fetch patients list:', error);
    return null;
  }
}
