import { api } from "@/services/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "SUPERVISOR" | "EMPLOYEE" | "ADMINISTRATOR";
}

export async function loginUser(credentials: LoginCredentials): Promise<UserSession> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "E-mail ou senha incorretos.");
    }

    const data = await response.json();
    return data.user;
  } catch (error: unknown) {
    if (error instanceof Error && error.message !== "Failed to fetch") {
      throw error;
    }
    // Caso o backend local não esteja rodando no momento, emite aviso claro
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se o backend está em execução.",
      { cause: error }
    );
  }
}

/** Usuário da sessão atual (cookie), ou `null` se não houver sessão. */
export async function fetchSession(): Promise<UserSession | null> {
  const data = await api<{ user: UserSession } | null>("/api/auth/get-session");
  return data?.user ?? null;
}

export async function logoutUser(): Promise<void> {
  await api("/api/auth/sign-out", { method: "POST", body: {} });
}
