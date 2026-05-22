import type {
  AuthPayload,
  LoginRequest,
  RegisterRequest,
  FormEntry,
  CreateFormEntryRequest,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

function getToken(): string | null {
  const stored = localStorage.getItem("auth");
  if (!stored) return null;
  return (JSON.parse(stored) as AuthPayload).token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  const data = (await res.json()) as T & { message?: string };
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data;
}

// ─── Auth ───────────────────────────────────────────────────────────────────
export const register = (body: RegisterRequest): Promise<AuthPayload> =>
  request<AuthPayload>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const login = (body: LoginRequest): Promise<AuthPayload> =>
  request<AuthPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

// ─── Forms ──────────────────────────────────────────────────────────────────
export const submitForm = (body: CreateFormEntryRequest): Promise<FormEntry> =>
  request<FormEntry>("/api/forms", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const getForms = (): Promise<FormEntry[]> =>
  request<FormEntry[]>("/api/forms");
