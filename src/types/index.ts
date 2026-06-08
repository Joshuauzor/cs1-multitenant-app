// ─── API envelope ───────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  status_code: number;
  status: string;
  message: string;
  time: string;
  data: T;
  request: { method: string; path: string };
}

// ─── Tenant ───────────────────────────────────────────────────────────────────
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

/** Seed tenant slug from accident-scene-api */
export const DEFAULT_TENANT_SLUG = "default";

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  tenant_id: string;
  role: "admin" | "agent";
}

export interface AuthPayload {
  access_token: string;
  user: AuthUser;
  tenant_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  tenant_slug: string;
}

export interface LoginResponse {
  user: AuthUser & {
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  tokens: {
    access_token: string;
    refresh_token: string;
  };
  service_message?: string;
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export type InterventionType =
  | "medical"
  | "fire"
  | "traffic"
  | "structural"
  | "other";

export type ReportStatus = "step_1" | "completed";

export interface Report {
  id: string;
  tenant_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  location: string;
  intervention_type: InterventionType | null;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

export interface ReportStepOneRequest {
  first_name: string;
  last_name: string;
  location: string;
}

export interface ReportStepTwoRequest {
  intervention_type: InterventionType;
}

export const INTERVENTION_TYPES: {
  value: InterventionType;
  label: string;
}[] = [
  { value: "medical", label: "Medical emergency" },
  { value: "fire", label: "Fire incident" },
  { value: "traffic", label: "Traffic collision" },
  { value: "structural", label: "Structural / infrastructure" },
  { value: "other", label: "Other" },
];

// ─── Multi-step form UI state ─────────────────────────────────────────────────
export interface ReportFormState {
  firstName: string;
  lastName: string;
  location: string;
  interventionType: InterventionType | "";
}
