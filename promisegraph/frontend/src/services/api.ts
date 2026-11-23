import { HealthResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

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
      environment: 'unknown',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      database_connected: false,
      database_message: err?.message || 'Failed to reach API server',
    };
  }
}
