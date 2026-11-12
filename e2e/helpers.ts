import { expect, type APIRequestContext, type Page, request } from "@playwright/test";

export const API_URL = "http://localhost:3000";
export const FRONT_URL = "http://localhost:4173";

// Usuários do seed do backend (scripts/seed.ts).
export const SENHA_SEED = "turno-local-seed-2026";
export const SUPERVISOR = "supervisor@example.com";
export const JOAO = "joao@example.com";
export const MARIA = "maria@example.com";

export async function login(page: Page, email: string, senha = SENHA_SEED) {
  await page.goto("/login");
  await page.getByLabel("E-mail profissional").fill(email);
  await page.getByLabel("Senha corporativa").fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

export async function sair(page: Page) {
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login/);
}

/** Data (YYYY-MM-DD) daqui a `dias` dias. */
export function dataDaqui(dias: number): string {
  return new Date(Date.now() + dias * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Horário único por teste e tentativa, para achar "o meu turno" na tela sem depender de ordem:
 * `base` é um número por spec e `retry` vem do testInfo.
 */
export function horarioUnico(base: number, retry: number) {
  const minuto = String((base * 7 + retry * 3) % 60).padStart(2, "0");
  return { inicio: `07:${minuto}`, fim: `15:${minuto}`, texto: `07:${minuto} – 15:${minuto}` };
}

/** Cliente da API já logado (para preparar dados sem passar pela tela). */
export async function apiComo(email: string, senha = SENHA_SEED): Promise<APIRequestContext> {
  const ctx = await request.newContext({ baseURL: API_URL, extraHTTPHeaders: { Origin: FRONT_URL } });
  const r = await ctx.post("/api/auth/sign-in/email", { data: { email, password: senha } });
  expect(r.ok(), `login de ${email} pela API`).toBeTruthy();
  return ctx;
}

export async function idDoFuncionario(supervisor: APIRequestContext, email: string): Promise<string> {
  const r = await supervisor.get("/funcionarios");
  const { funcionarios } = (await r.json()) as { funcionarios: { id: string; email: string }[] };
  const f = funcionarios.find((x) => x.email === email);
  if (!f) throw new Error(`funcionário ${email} não encontrado`);
  return f.id;
}

/** Cria um turno pela API (como supervisor) e devolve o id. */
export async function criarTurnoPelaApi(email: string, data: string, inicio: string, fim: string) {
  const supervisor = await apiComo(SUPERVISOR);
  const funcionarioId = await idDoFuncionario(supervisor, email);
  const r = await supervisor.post("/turnos", { data: { data, horaInicio: inicio, horaFim: fim, funcionarioId } });
  expect(r.status(), await r.text()).toBe(201);
  const { turno } = (await r.json()) as { turno: { id: string } };
  await supervisor.dispose();
  return turno.id;
}

/** Card de uma solicitação (`<article>`), achado pelo horário único do turno. */
export function cardDaTroca(page: Page, horario: string) {
  return page.getByRole("article").filter({ hasText: horario });
}

/** Clica na ação do card e confirma no diálogo (o botão de confirmar tem o mesmo nome da ação). */
export async function agirNaTroca(
  page: Page,
  horario: string,
  acao: string,
  tituloDoDialogo: string,
  motivo?: string,
) {
  await cardDaTroca(page, horario).getByRole("button", { name: acao }).click();
  const dialogo = page.getByRole("dialog", { name: tituloDoDialogo });
  if (motivo !== undefined) await dialogo.getByLabel(/^Motivo/).fill(motivo);
  await dialogo.getByRole("button", { name: acao }).click();
  await expect(dialogo).toBeHidden();
}

/** João pede a troca do turno com `horario` para Maria, pela tela Meus turnos. */
export async function pedirTrocaParaMaria(page: Page, horario: string) {
  await page.goto("/turnos");
  const turno = page.getByRole("listitem").filter({ hasText: horario });
  await turno.getByRole("button", { name: "Pedir troca" }).click();
  const pedido = page.getByRole("dialog", { name: "Pedir troca de turno" });
  // O botão da linha já deixa o turno escolhido no diálogo.
  await expect(pedido.getByLabel("Qual turno você quer passar?").locator("option:checked")).toContainText(horario);
  await pedido.locator("#colega").selectOption({ label: "Maria Funcionária" });
  await pedido.getByRole("button", { name: "Enviar pedido" }).click();
  await expect(pedido).toBeHidden();
  await expect(turno).toContainText("Pedido para Maria");
}
