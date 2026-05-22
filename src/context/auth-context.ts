import { createContext } from "react";
import type { AuthPayload } from "../types";

export interface AuthContextValue {
  auth: AuthPayload | null;
  login: (data: AuthPayload) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
