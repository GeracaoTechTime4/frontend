const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

const MENSAGEM_SEM_CONEXAO =
  "Não foi possível conectar ao servidor. Verifique se o backend está em execução.";

/**
 * Chamada à API com o cookie de sessão. Erros viram `ApiError`, com a mensagem que o
 * backend devolveu (`error` ou `message`) para a tela poder mostrá-la como está.
 */
export async function api<T>(path: string, { method = "GET", body }: RequestOptions = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(MENSAGEM_SEM_CONEXAO, 0);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const mensagem = data?.error ?? data?.message ?? "Não foi possível concluir a operação.";
    throw new ApiError(mensagem, response.status);
  }

  return data as T;
}

export function mensagemDeErro(error: unknown): string {
  return error instanceof Error ? error.message : "Ocorreu um erro inesperado. Tente novamente.";
}
