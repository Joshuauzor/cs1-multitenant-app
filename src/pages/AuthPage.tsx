import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { login as apiLogin, register as apiRegister, getTenantBySlug } from "../api/api";
import { useAuth } from "../context/useAuth";
import { DEFAULT_TENANT_SLUG } from "../types";
import type { LoginRequest, RegisterRequest } from "../types";
import "./AuthPage.css";

type AuthMode = "login" | "register";

type LoginFormState = LoginRequest;
type RegisterFormState = RegisterRequest;

const INITIAL_LOGIN: LoginFormState = {
  email: "",
  password: "",
};

const INITIAL_REGISTER: RegisterFormState = {
  email: "",
  password: "",
  confirm_password: "",
  tenant_slug: DEFAULT_TENANT_SLUG,
};

export default function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginForm, setLoginForm] = useState<LoginFormState>(INITIAL_LOGIN);
  const [registerForm, setRegisterForm] =
    useState<RegisterFormState>(INITIAL_REGISTER);
  const [tenantName, setTenantName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (mode !== "register") return;
    let cancelled = false;
    getTenantBySlug(registerForm.tenant_slug)
      .then((tenant) => {
        if (!cancelled) setTenantName(tenant.name);
      })
      .catch(() => {
        if (!cancelled) setTenantName("");
      });
    return () => {
      cancelled = true;
    };
  }, [mode, registerForm.tenant_slug]);

  const setLogin =
    (key: keyof LoginFormState) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setLoginForm((prev) => ({ ...prev, [key]: e.target.value }));

  const setRegister =
    (key: keyof RegisterFormState) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setRegisterForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const data = await apiLogin(loginForm);
        login(data);
      } else {
        await apiRegister(registerForm);
        const data = await apiLogin(
          {
            email: registerForm.email,
            password: registerForm.password,
          },
          tenantName || undefined,
        );
        login(data);
      }
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
          {mode === "register" && (
            <div className="field">
              <label htmlFor="tenant_slug">Workspace slug</label>
              <input
                id="tenant_slug"
                type="text"
                required
                placeholder="default"
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                value={registerForm.tenant_slug}
                onChange={setRegister("tenant_slug")}
              />
              {tenantName && (
                <p className="auth-hint">Workspace: {tenantName}</p>
              )}
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={mode === "login" ? loginForm.email : registerForm.email}
              onChange={
                mode === "login" ? setLogin("email") : setRegister("email")
              }
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              maxLength={20}
              placeholder="••••••••"
              value={
                mode === "login" ? loginForm.password : registerForm.password
              }
              onChange={
                mode === "login" ? setLogin("password") : setRegister("password")
              }
            />
          </div>

          {mode === "register" && (
            <div className="field">
              <label htmlFor="confirm_password">Confirm password</label>
              <input
                id="confirm_password"
                type="password"
                required
                minLength={6}
                maxLength={20}
                placeholder="••••••••"
                value={registerForm.confirm_password}
                onChange={setRegister("confirm_password")}
              />
            </div>
          )}

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

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
