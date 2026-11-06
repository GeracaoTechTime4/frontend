import { api } from "@/services/api";
import { authClient } from "@/services/auth-client";

import { API_BASE_URL } from "@/services/api-url";

/** Mínimo padrão do Better Auth para senhas (`emailAndPassword.minPasswordLength`). */
export const TAMANHO_MINIMO_SENHA = 8;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "SUPERVISOR" | "EMPLOYEE";
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

const MENSAGENS_CADASTRO: Record<string, string> = {
  USER_ALREADY_EXISTS: "Já existe uma conta com este e-mail.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Já existe uma conta com este e-mail.",
  PASSWORD_TOO_SHORT: `A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`,
  PASSWORD_TOO_LONG: "A senha é longa demais.",
  INVALID_EMAIL: "E-mail inválido.",
};

/**
 * Cria a conta no Better Auth. O backend já inicia a sessão (cookie) no cadastro,
 * então em seguida basta buscar a sessão para ter o usuário logado.
 */
export async function registerUser(data: RegisterData): Promise<void> {
  let resultado: Awaited<ReturnType<typeof authClient.signUp.email>>;

  try {
    resultado = await authClient.signUp.email(data);
  } catch (error: unknown) {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se o backend está em execução.",
      { cause: error }
    );
  }

  if (resultado.error) {
    const { code, message } = resultado.error;
    throw new Error(
      (code && MENSAGENS_CADASTRO[code]) || message || "Erro ao criar conta. Tente novamente."
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
