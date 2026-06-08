import type {
  ApiResponse,
  AuthPayload,
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  Report,
  ReportStepOneRequest,
  ReportStepTwoRequest,
  Tenant,
} from "../types";

const API_PREFIX = "/api/v1";
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

function getToken(): string | null {
  const stored = localStorage.getItem("auth");
  if (!stored) return null;
  return (JSON.parse(stored) as AuthPayload).access_token;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${API_PREFIX}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  const body = (await res.json()) as ApiResponse<T> & { message?: string };

  if (!res.ok) {
    throw new Error(body.message ?? "Request failed");
  }

  return body.data;
}

function toAuthPayload(
  response: LoginResponse,
  tenant_name?: string,
): AuthPayload {
  const { user, tokens } = response;
  return {
    access_token: tokens.access_token,
    user: {
      id: user.id,
      email: user.email,
      tenant_id: user.tenant_id,
      role: user.role,
    },
    ...(tenant_name ? { tenant_name } : {}),
  };
}

// ─── Auth ───────────────────────────────────────────────────────────────────
export const register = (body: RegisterRequest): Promise<AuthUser> =>
  request<AuthUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const login = (
  body: LoginRequest,
  tenant_name?: string,
): Promise<AuthPayload> =>
  request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  }).then((data) => toAuthPayload(data, tenant_name));

// ─── Tenants ──────────────────────────────────────────────────────────────────
export const getTenantBySlug = (slug: string): Promise<Tenant> =>
  request<Tenant>(`/tenants/${slug}`);

// ─── Reports ──────────────────────────────────────────────────────────────────
export const createReportStepOne = (
  body: ReportStepOneRequest,
): Promise<Report> =>
  request<Report>("/reports", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const completeReportStepTwo = (
  id: string,
  body: ReportStepTwoRequest,
): Promise<Report> =>
  request<Report>(`/reports/${id}/step-2`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const getReports = (): Promise<Report[]> => request<Report[]>("/reports");

export const getReport = (id: string): Promise<Report> =>
  request<Report>(`/reports/${id}`);

// ─── Users ────────────────────────────────────────────────────────────────────
export const getCurrentUser = (): Promise<AuthUser> =>
  request<AuthUser>("/users/current-user");

export const deleteAccount = (): Promise<null> =>
  request<null>("/users/account", { method: "DELETE" });
