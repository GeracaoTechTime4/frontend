import { expect, test } from "@playwright/test";
import {
  agirNaTroca,
  cardDaTroca,
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

test("Maria recusa com motivo e João vê a recusa em Meus pedidos", async ({ page }, testInfo) => {
  const { inicio, fim, texto } = horarioUnico(3, testInfo.retry);
  await criarTurnoPelaApi(JOAO, dataDaqui(22), inicio, fim);

  await login(page, JOAO);
  await pedirTrocaParaMaria(page, texto);
  await sair(page);

  await login(page, MARIA);
  await page.goto("/trocas");
  await agirNaTroca(page, texto, "Recusar", "Recusar esta troca?", "Tenho consulta nesse dia");
  await expect(page.getByRole("status").filter({ hasText: "Troca recusada" })).toBeVisible();
  await sair(page);

  await login(page, JOAO);
  await page.goto("/trocas");
  await page.getByRole("tab", { name: "Meus pedidos" }).click();
  const card = cardDaTroca(page, texto);
  await expect(card).toContainText("Recusada");
  await expect(card).toContainText("Tenho consulta nesse dia");
});

test("supervisor só rejeita com motivo; o turno continua com João", async ({ page }, testInfo) => {
  const { inicio, fim, texto } = horarioUnico(4, testInfo.retry);
  await criarTurnoPelaApi(JOAO, dataDaqui(23), inicio, fim);

  await login(page, JOAO);
  await pedirTrocaParaMaria(page, texto);
  await sair(page);

  await login(page, MARIA);
  await page.goto("/trocas");
  await agirNaTroca(page, texto, "Aceitar", "Aceitar esta troca?");
  await sair(page);

  await login(page, SUPERVISOR);
  await cardDaTroca(page, texto).getByRole("button", { name: "Rejeitar" }).click();
  const dialogo = page.getByRole("dialog", { name: "Rejeitar esta troca?" });
  // Sem motivo, o diálogo não fecha.
  await dialogo.getByRole("button", { name: "Rejeitar" }).click();
  await expect(dialogo).toBeVisible();
  await dialogo.getByLabel(/^Motivo/).fill("Equipe desfalcada nesse dia");
  await dialogo.getByRole("button", { name: "Rejeitar" }).click();
  await expect(dialogo).toBeHidden();
  await expect(page.getByRole("status").filter({ hasText: "Troca rejeitada" })).toBeVisible();
  await sair(page);

  await login(page, JOAO);
  await page.goto("/turnos");
  await expect(page.getByRole("listitem").filter({ hasText: texto })).toHaveCount(1);
});
