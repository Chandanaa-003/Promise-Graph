import {
  Commitment,
  Person,
  Evidence,
  HealthResponse,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const TOKEN_KEY = 'pg_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore local storage restrictions
  }
}

function getAuthHeaders(extraHeaders: HeadersInit = {}): HeadersInit {
  const headers: Record<string, string> = {
    ...extraHeaders as Record<string, string>,
  };
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch backend system health status
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const url = `${API_BASE}/api/health`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      status: 'error',
      app_name: 'PromiseGraph Backend',
      environment: 'development',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      database_connected: false,
      database_message: err?.message || 'Failed to reach API server',
    };
  }
}

// ----------------------------------------------------
// Authentication API
// ----------------------------------------------------

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const url = `${API_BASE}/api/auth/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || 'Invalid email or password.');
  }
  const data: AuthResponse = await res.json();
  if (data.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
}

export async function registerUser(credentials: RegisterCredentials): Promise<AuthResponse> {
  const url = `${API_BASE}/api/auth/register`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || 'Registration failed.');
  }
  const data: AuthResponse = await res.json();
  if (data.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
}

export async function logoutUser(): Promise<void> {
  const url = `${API_BASE}/api/auth/logout`;
  try {
    await fetch(url, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Best-effort logout
  } finally {
    setStoredToken(null);
  }
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const url = `${API_BASE}/api/auth/me`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Not authenticated');
  }
  return await res.json();
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  const url = `${API_BASE}/api/auth/profile`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || 'Failed to update profile.');
  }
  return await res.json();
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const url = `${API_BASE}/api/auth/change-password`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || 'Failed to change password.');
  }
  return await res.json();
}

// ----------------------------------------------------
// Commitments API
// ----------------------------------------------------

export async function fetchCommitments(statusFilter?: string): Promise<Commitment[]> {
  const params = statusFilter && statusFilter !== 'all' ? `?status_filter=${statusFilter}` : '';
  const url = `${API_BASE}/api/v1/commitments${params}`;
  try {
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error(`Error fetching commitments: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('API fetchCommitments fallback/error:', err);
    return [];
  }
}

export async function fetchCommitmentById(id: string): Promise<Commitment | null> {
  const url = `${API_BASE}/api/v1/commitments/${id}`;
  try {
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchCommitmentById error:', err);
    return null;
  }
}

export async function createCommitment(data: {
  title: string;
  description?: string;
  person_id?: string;
  status: string;
  commitment_type: string;
  due_date?: string;
  confidence_score?: number;
}): Promise<Commitment> {
  const url = `${API_BASE}/api/v1/commitments`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to create commitment (${res.status})`);
  }
  return await res.json();
}

export async function updateCommitment(
  id: string,
  data: Partial<Commitment>
): Promise<Commitment> {
  const url = `${API_BASE}/api/v1/commitments/${id}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to update commitment (${res.status})`);
  }
  return await res.json();
}

export async function deleteCommitment(id: string): Promise<boolean> {
  const url = `${API_BASE}/api/v1/commitments/${id}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  return res.ok || res.status === 204;
}

// ----------------------------------------------------
// People API
// ----------------------------------------------------

export async function fetchPeople(): Promise<Person[]> {
  const url = `${API_BASE}/api/v1/people`;
  try {
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error(`Error fetching people: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('API fetchPeople fallback:', err);
    return [];
  }
}

export async function fetchPersonById(id: string): Promise<Person | null> {
  const url = `${API_BASE}/api/v1/people/${id}`;
  try {
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchPersonById error:', err);
    return null;
  }
}

export async function fetchPersonCommitments(personId: string): Promise<Commitment[]> {
  const url = `${API_BASE}/api/v1/people/${personId}/commitments`;
  try {
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn('API fetchPersonCommitments error:', err);
    return [];
  }
}

// ----------------------------------------------------
// Evidence API
// ----------------------------------------------------

export async function fetchEvidence(commitmentId?: string): Promise<Evidence[]> {
  const params = commitmentId ? `?commitment_id=${commitmentId}` : '';
  const url = `${API_BASE}/api/v1/evidence${params}`;
  try {
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn('API fetchEvidence fallback:', err);
    return [];
  }
}

/**
 * Seed or reset initial demo database data
 */
export async function triggerSeedData(): Promise<{ status: string; message: string }> {
  const url = `${API_BASE}/api/v1/seed`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to seed database');
  }
  return await res.json();
}
