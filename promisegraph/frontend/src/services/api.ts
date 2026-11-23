import { Commitment, Person, Evidence, HealthResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

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

/**
 * Fetch all commitments with optional status filter
 */
export async function fetchCommitments(statusFilter?: string): Promise<Commitment[]> {
  const params = statusFilter && statusFilter !== 'all' ? `?status_filter=${statusFilter}` : '';
  const url = `${API_BASE}/api/v1/commitments${params}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Error fetching commitments: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('API fetchCommitments fallback:', err);
    return [];
  }
}

/**
 * Fetch a single commitment by ID
 */
export async function fetchCommitmentById(id: string): Promise<Commitment | null> {
  const url = `${API_BASE}/api/v1/commitments/${id}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchCommitmentById error:', err);
    return null;
  }
}

/**
 * Create a new commitment
 */
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to create commitment (${res.status})`);
  }
  return await res.json();
}

/**
 * Update an existing commitment
 */
export async function updateCommitment(
  id: string,
  data: Partial<Commitment>
): Promise<Commitment> {
  const url = `${API_BASE}/api/v1/commitments/${id}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to update commitment (${res.status})`);
  }
  return await res.json();
}

/**
 * Delete a commitment by ID
 */
export async function deleteCommitment(id: string): Promise<boolean> {
  const url = `${API_BASE}/api/v1/commitments/${id}`;
  const res = await fetch(url, {
    method: 'DELETE',
  });
  return res.ok || res.status === 204;
}

/**
 * Fetch all people in the relationship graph
 */
export async function fetchPeople(): Promise<Person[]> {
  const url = `${API_BASE}/api/v1/people`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Error fetching people: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('API fetchPeople fallback:', err);
    return [];
  }
}

/**
 * Fetch a person by ID
 */
export async function fetchPersonById(id: string): Promise<Person | null> {
  const url = `${API_BASE}/api/v1/people/${id}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchPersonById error:', err);
    return null;
  }
}

/**
 * Fetch all commitments for a specific person
 */
export async function fetchPersonCommitments(personId: string): Promise<Commitment[]> {
  const url = `${API_BASE}/api/v1/people/${personId}/commitments`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn('API fetchPersonCommitments error:', err);
    return [];
  }
}

/**
 * Fetch all evidence records
 */
export async function fetchEvidence(commitmentId?: string): Promise<Evidence[]> {
  const params = commitmentId ? `?commitment_id=${commitmentId}` : '';
  const url = `${API_BASE}/api/v1/evidence${params}`;
  try {
    const res = await fetch(url);
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
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    throw new Error('Failed to seed database');
  }
  return await res.json();
}
