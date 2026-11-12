import { expect, test } from "@playwright/test";
import { dataDaqui, horarioUnico, login, SUPERVISOR } from "./helpers.ts";

test("supervisor cria, edita e exclui um turno de João", async ({ page }, testInfo) => {
  const { inicio, fim, texto } = horarioUnico(1, testInfo.retry);
  const data = dataDaqui(20);

  await login(page, SUPERVISOR);
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Turnos" }).click();
  await expect(page).toHaveURL(/\/gestao-turnos$/);

  const joao = page.getByRole("region", { name: "João Funcionário" });
  await joao.getByRole("button", { name: "Novo turno" }).click();

  const novo = page.getByRole("dialog", { name: "Novo turno" });
  await novo.getByLabel("Data").fill(data);
  await novo.getByLabel("Início").fill(inicio);
  await novo.getByLabel("Fim").fill(fim);
  await novo.getByRole("button", { name: "Cadastrar" }).click();
  await expect(novo).toBeHidden();

  const turno = joao.getByRole("listitem").filter({ hasText: texto });
  await expect(turno).toHaveCount(1);

  // Edita: só o fim muda.
  await turno.getByRole("button", { name: /^Editar turno de/ }).click();
  const edicao = page.getByRole("dialog", { name: "Editar turno" });
  const novoFim = fim.replace("15:", "16:");
  await edicao.getByLabel("Fim").fill(novoFim);
  await edicao.getByRole("button", { name: "Salvar" }).click();
  await expect(edicao).toBeHidden();

  const editado = joao.getByRole("listitem").filter({ hasText: `${inicio} – ${novoFim}` });
  await expect(editado).toHaveCount(1);

  await editado.getByRole("button", { name: /^Excluir turno de/ }).click();
  const exclusao = page.getByRole("dialog", { name: "Excluir turno" });
  await exclusao.getByRole("button", { name: "Excluir" }).click();
  await expect(exclusao).toBeHidden();
  await expect(joao.getByRole("listitem").filter({ hasText: `${inicio} – ${novoFim}` })).toHaveCount(0);
});
