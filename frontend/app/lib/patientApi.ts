const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

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
