import { expect, test } from "@playwright/test";

test("rechaza el inicio de sesión con contraseña incorrecta", async ({
  page,
}) => {
  await page.goto("/login");

  await page
    .getByLabel(/correo/i)
    .fill("usuario@novatech.com");

  await page
    .getByLabel(/contraseña/i)
    .fill("Incorrecta123!");

  await page.getByRole("button", {
    name: /iniciar sesión/i,
  }).click();

  await expect(
    page.getByText(/correo o contraseña incorrectos/i)
  ).toBeVisible();

  await expect(page).toHaveURL(/\/login$/);
});

test("permite iniciar sesión como solicitante y dirige al panel correcto", async ({
  page,
}) => {
  await page.goto("/login");

  await page
    .getByLabel(/correo/i)
    .fill("usuario@novatech.com");

  await page
    .getByLabel(/contraseña/i)
    .fill("Usuario123!");

  await page.getByRole("button", {
    name: /iniciar sesión/i,
  }).click();

  await expect(page).toHaveURL(/\/solicitante$/);

  await expect(
    page.getByRole("heading", {
      name: /nueva solicitud/i,
    })
  ).toBeVisible();
});