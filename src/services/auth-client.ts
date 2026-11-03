import { createAuthClient } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

export const authClient = createAuthClient({
  // URL completa das rotas de auth, como o resto do front já usa (`${API_BASE_URL}/api/auth/...`).
  // Não passe só a URL da API: quando ela já tem um caminho (em produção, `.../api`), o Better Auth
  // a usa como está e não acrescenta `/api/auth`, e o cadastro vai para `/api/sign-up/email` (404).
  baseURL: `${API_BASE_URL}/api/auth`,
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: true,
        },
      },
    }),
  ],
});
