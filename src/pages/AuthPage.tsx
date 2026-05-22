import { useState, type ChangeEvent, type FormEvent } from "react";
import { login as apiLogin, register as apiRegister } from "../api/api";
import { useAuth } from "../context/useAuth";
import { TENANTS } from "../types";
import type { LoginRequest } from "../types";
import "./AuthPage.css";

type AuthMode = "login" | "register";

type FormState = LoginRequest;

const INITIAL_FORM: FormState = {
  email: "",
  password: "",
  tenantId: TENANTS[0].id,
};

export default function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const set =
    (key: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data =
        mode === "login" ? await apiLogin(form) : await apiRegister(form);
      login(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">◈</span>
          <span className="auth-brand-name">CaseForm</span>
        </div>

        <h1 className="auth-title">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Sign in to your workspace"
            : "Register and get started"}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="tenant">Workspace</label>
            <select
              id="tenant"
              value={form.tenantId}
              onChange={set("tenantId")}
            >
              {TENANTS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={set("password")}
            />
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading
              ? "Loading…"
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        <p className="auth-toggle">
          {mode === "login" ? "No account? " : "Already registered? "}
          <button type="button" onClick={toggleMode}>
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
