import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthContextValue } from "@/contexts/auth-context";
import { fetchSession, loginUser, logoutUser, registerUser, type UserSession } from "@/services/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura a sessão (cookie) ao abrir ou recarregar a página.
  useEffect(() => {
    let ativo = true;

    fetchSession()
      .then((sessao) => ativo && setUser(sessao))
      .catch(() => ativo && setUser(null))
      .finally(() => ativo && setLoading(false));

    return () => {
      ativo = false;
    };
  }, []);

  const login = useCallback<AuthContextValue["login"]>(async (credentials) => {
    const sessao = await loginUser(credentials);
    setUser(sessao);
    return sessao;
  }, []);

  const register = useCallback<AuthContextValue["register"]>(async (data) => {
    await registerUser(data);
    const sessao = await fetchSession();
    setUser(sessao);
    return sessao;
  }, []);

  const logout = useCallback<AuthContextValue["logout"]>(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
