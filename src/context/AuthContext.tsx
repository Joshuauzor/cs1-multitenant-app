import { useState, useCallback, type ReactNode } from "react";
import type { AuthPayload } from "../types";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthPayload | null>(() => {
    const stored = localStorage.getItem("auth");
    return stored ? (JSON.parse(stored) as AuthPayload) : null;
  });

  const login = useCallback((data: AuthPayload) => {
    localStorage.setItem("auth", JSON.stringify(data));
    setAuth(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth");
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
