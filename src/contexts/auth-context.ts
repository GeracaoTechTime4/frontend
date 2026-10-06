import { createContext } from "react";
import type { LoginCredentials, UserSession } from "@/services/auth";

export interface AuthContextValue {
  /** `null` enquanto não há sessão (ou ainda está sendo verificada). */
  user: UserSession | null;
  /** `true` só até a primeira verificação da sessão terminar. */
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<UserSession>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
