import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

// E2E contra a stack local: a API do backend (diretório BACKEND_DIR, padrão ../backend) com um PGlite
// novo a cada execução, e o front buildado servido pelo `vite preview`. Nada de staging nem de rede externa.
const BACKEND_DIR = process.env.BACKEND_DIR ?? "../backend";
const API_URL = "http://localhost:3000";
const FRONT_URL = "http://localhost:4173";
// Mesmo banco para a config inteira (o arquivo é avaliado de novo nos workers).
process.env.E2E_DB_DIR ??= join(tmpdir(), `shift-swap-e2e-${Date.now()}`);

export default defineConfig({
  testDir: "e2e",
  // Os specs compartilham o banco: um de cada vez.
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: FRONT_URL,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // O seed roda antes de a API subir: o PGlite não aceita dois processos no mesmo diretório.
      // Cria supervisor@example.com, joao@example.com e maria@example.com (senha turno-local-seed-2026).
      // Trava: o backend tem .env.production.local com a DATABASE_URL de prod. A variável definida aqui
      // tem prioridade sobre os .env, mas se algum dia não for um PGlite, nada roda.
      command:
        'case "$DATABASE_URL" in pglite:*) ;; *) echo "E2E exige DATABASE_URL pglite:" >&2; exit 1;; esac' +
        " && bun install --frozen-lockfile && bun run migrate && bun run seed && bun run src/index.ts",
      cwd: BACKEND_DIR,
      url: `${API_URL}/health`,
      reuseExistingServer: false,
      timeout: 180_000,
      stdout: "ignore",
      stderr: "pipe",
      env: {
        PORT: "3000",
        DATABASE_URL: `pglite:${process.env.E2E_DB_DIR}`,
        BETTER_AUTH_URL: API_URL,
        BETTER_AUTH_SECRET: "segredo-dos-testes-e2e-0123456789abcdef",
        CORS_ORIGIN: FRONT_URL,
        AUTH_RATE_LIMIT: "false",
        // Sem rede externa: o cadastro não consulta o HaveIBeenPwned.
        AUTH_CHECK_PWNED: "false",
      },
    },
    {
      command: "bun run build && bun run preview --port 4173 --strictPort",
      url: FRONT_URL,
      reuseExistingServer: false,
      timeout: 180_000,
      env: { VITE_API_URL: API_URL },
    },
  ],
});
