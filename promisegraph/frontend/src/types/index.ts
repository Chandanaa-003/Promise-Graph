export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  app_name: string;
  environment: string;
  version: string;
  timestamp: string;
  database_connected: boolean;
  database_message?: string;
}

export type CommitmentStatus = 'pending' | 'in_progress' | 'fulfilled' | 'cancelled' | 'overdue';
export type CommitmentType = 'promise_made' | 'promise_received';
export type ChannelType = 'email' | 'whatsapp' | 'github' | 'slack';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  user_id: string;
  display_name: string;
  email?: string;
  phone?: string;
  handle?: string;
  organization?: string;
  relationship_score: number;
  notes?: string;
  created_at: string;
  active_count?: number;
  completed_count?: number;
}

export interface Evidence {
  id: string;
  commitment_id: string;
  conversation_id?: string;
  commitment_title?: string;
  channel?: ChannelType;
  snippet_text: string;
  context_before?: string;
  context_after?: string;
  timestamp?: string;
  source_message_id?: string;
  created_at: string;
  verification_status?: 'verified' | 'pending' | 'unverified';
}

export interface Commitment {
  id: string;
  user_id: string;
  conversation_id?: string;
  person_id?: string;
  person_name?: string;
  title: string;
  description?: string;
  status: CommitmentStatus;
  commitment_type: CommitmentType;
  channel?: ChannelType;
  due_date?: string;
  confidence_score: number;
  evidence_snippets?: string[];
  created_at: string;
  updated_at: string;
}

export interface ConnectedAccount {
  id: string;
  provider: ChannelType;
  account_identifier: string;
  is_active: boolean;
  status: 'connected' | 'not_connected' | 'coming_soon';
  phase: string;
  auth_type: string;
  last_sync?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface UpdateProfilePayload {
  full_name: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}
