/**
 * URL base da API.
 *
 * - Desenvolvimento: `VITE_API_URL` (`.env.development`, padrão http://localhost:3000).
 * - Build de produção: o mesmo domínio da página + `/api`. O CloudFront encaminha `/api/*` para a
 *   API, então um único build serve staging e produção, sem CORS e com o cookie de sessão no próprio
 *   domínio. `VITE_API_URL` no build ainda tem precedência, para apontar para outra API se preciso.
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? `${window.location.origin}/api` : "http://localhost:3000")
).replace(/\/+$/, "");
