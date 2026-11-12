import { expect, test } from "@playwright/test";
import {
  agirNaTroca,
  criarTurnoPelaApi,
  dataDaqui,
  horarioUnico,
  JOAO,
  login,
  MARIA,
  pedirTrocaParaMaria,
  sair,
  SUPERVISOR,
} from "./helpers.ts";

test("João pede, Maria aceita, supervisor aprova: o turno passa para Maria", async ({ page }, testInfo) => {
  const { inicio, fim, texto } = horarioUnico(2, testInfo.retry);
  await criarTurnoPelaApi(JOAO, dataDaqui(21), inicio, fim);

  await login(page, JOAO);
  await pedirTrocaParaMaria(page, texto);
  await sair(page);

  // Maria responde na aba "Para eu responder" (a aba inicial de Trocas).
  await login(page, MARIA);
  await page.goto("/trocas");
  await expect(page.getByRole("tab", { name: /Para eu responder/ })).toHaveAttribute("aria-selected", "true");
  await agirNaTroca(page, texto, "Aceitar", "Aceitar esta troca?");
  await expect(page.getByRole("status").filter({ hasText: "Troca aceita" })).toBeVisible();
  await sair(page);

  await login(page, SUPERVISOR);
  await expect(page).toHaveURL(/\/aprovacoes$/);
  await expect(page.getByRole("tablist", { name: "Filtrar por estado" })).toBeVisible();
  await agirNaTroca(page, texto, "Aprovar", "Aprovar esta troca?");
  await expect(page.getByRole("status").filter({ hasText: "Troca aprovada" })).toBeVisible();
  await sair(page);

  // O turno saiu de João e foi para Maria.
  await login(page, MARIA);
  await page.goto("/turnos");
  await expect(page.getByRole("listitem").filter({ hasText: texto })).toHaveCount(1);
  await sair(page);

  await login(page, JOAO);
  await page.goto("/turnos");
  await expect(page.getByRole("heading", { name: "Meus turnos" })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: texto })).toHaveCount(0);
});
