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
