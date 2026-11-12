import { expect, test } from "@playwright/test";
import { JOAO, login, SUPERVISOR } from "./helpers.ts";

test("sem sessão, qualquer tela leva ao login", async ({ page }) => {
  for (const rota of ["/", "/trocas", "/turnos", "/aprovacoes", "/gestao-turnos"]) {
    await page.goto(rota);
    await expect(page).toHaveURL(/\/login/);
  }
});

test("funcionário não entra nas telas do supervisor", async ({ page }) => {
  await login(page, JOAO);
  for (const rota of ["/aprovacoes", "/gestao-turnos"]) {
    await page.goto(rota);
    await expect(page).toHaveURL(/\/trocas$/);
  }
});

test("supervisor cai em Aprovações e não entra nas telas do funcionário", async ({ page }) => {
  await login(page, SUPERVISOR);
  await expect(page).toHaveURL(/\/aprovacoes$/);
  await page.goto("/turnos");
  await expect(page).toHaveURL(/\/aprovacoes$/);
});
