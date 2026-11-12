import { expect, test } from "@playwright/test";
import { login, sair } from "./helpers.ts";

test("cadastro pela tela entra como funcionário; sair e entrar de novo", async ({ page }, testInfo) => {
  const email = `e2e-${Date.now()}-${testInfo.retry}@example.com`;
  const senha = "senha-do-e2e-123";

  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill("Pessoa do E2E");
  await page.getByLabel("E-mail profissional").fill(email);
  await page.getByLabel("Senha corporativa").fill(senha);
  await page.getByRole("button", { name: "Cadastrar" }).click();

  // Funcionário cai em /trocas; o menu não tem as telas do supervisor.
  await expect(page).toHaveURL(/\/trocas$/);
  const menu = page.getByRole("navigation", { name: "Principal" });
  await expect(menu.getByRole("link", { name: "Meus turnos" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Aprovações" })).toHaveCount(0);

  await sair(page);
  await login(page, email, senha);
  await expect(page).toHaveURL(/\/trocas$/);
});

test("senha errada mostra o erro e continua no login", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail profissional").fill("joao@example.com");
  await page.getByLabel("Senha corporativa").fill("senha-errada-123");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});
