import { createAuthClient } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";

import { API_BASE_URL } from "@/services/api-url";

export const authClient = createAuthClient({
  // URL completa das rotas de auth, como o resto do front já usa (`${API_BASE_URL}/api/auth/...`).
  // Não passe só a URL da API: quando ela já tem um caminho (em produção, `.../api`), o Better Auth
  // a usa como está e não acrescenta `/api/auth`, e o cadastro vai para `/api/sign-up/email` (404).
  baseURL: `${API_BASE_URL}/api/auth`,
  plugins: [
    inferAdditionalFields({
      user: {
        // O papel é definido pelo servidor (todo cadastro é EMPLOYEE): só é lido da sessão.
        role: {
          type: "string",
          required: true,
          input: false,
        },
      },
    }),
  ],
});
