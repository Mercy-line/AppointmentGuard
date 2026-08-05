const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export async function bookAppointmentAPI(doctorId: string, startTimeIso: string, patientId?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctor_id: doctorId, start_time: startTimeIso, patient_id: patientId }),
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
