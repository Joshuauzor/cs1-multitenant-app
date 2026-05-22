// ─── Tenant ────────────────────────────────────────────────────────────────
export interface Tenant {
  id: string;
  name: string;
}

export const TENANTS: Tenant[] = [
  { id: "t_acme", name: "Acme Corp" },
  { id: "t_globex", name: "Globex Ltd" },
  { id: "t_initech", name: "Initech" },
];

// ─── Auth ───────────────────────────────────────────────────────────────────
export interface AuthPayload {
  token: string;
  email: string;
  tenantId: string;
  tenantName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantId: string;
}

export type RegisterRequest = LoginRequest;

// ─── Form entries ───────────────────────────────────────────────────────────
export interface FormEntry {
  id: number;
  tenant_id: string;
  user_id: number;
  first_name: string;
  last_name: string;
  location: string;
  selection_value: string;
  created_at: string;
}

export interface CreateFormEntryRequest {
  first_name: string;
  last_name: string;
  location: string;
  selection_value: string;
}

// ─── Multi-step form state ──────────────────────────────────────────────────
export interface FormState {
  firstName: string;
  lastName: string;
  location: string;
  selectionValue: string;
}

export const INTERVENTION_TYPES: string[] = [
  "Traffic collision",
  "Workplace accident",
  "Medical emergency",
  "Natural disaster",
  "Fire incident",
  "Hazardous material spill",
  "Infrastructure failure",
];
