import type { User } from '../types';

export const API_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000')
  : 'http://127.0.0.1:8000';

export async function loginAPI(email: string, pass: string): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || 'Invalid email or password');
  }
  return res.json();
}

export async function registerAPI(payload: { email: string; name: string; role: string; pass: string; spec?: string }): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: payload.email,
      password: payload.pass,
      name: payload.name,
      role: payload.role,
      specialization: payload.spec
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || 'Registration failed');
  }
  return res.json();
}
