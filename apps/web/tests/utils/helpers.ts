import { type Page, expect } from '@playwright/test';

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

export async function loginAsAdmin(page: Page) {
  await login(page, 'admin@lumora.test', 'password123');
}

export async function navigateTo(page: Page, section: string) {
  const link = page.getByRole('link', { name: new RegExp(section, 'i') }).first();
  await link.click();
  await page.waitForLoadState('networkidle');
}

export async function fillForm(page: Page, fields: Record<string, string>) {
  for (const [label, value] of Object.entries(fields)) {
    const field = page.getByLabel(new RegExp(label, 'i'));
    if (await field.isVisible()) {
      await field.clear();
      await field.fill(value);
    }
  }
}

export async function selectOption(page: Page, label: string, value: string) {
  const select = page.getByLabel(new RegExp(label, 'i'));
  if (await select.isVisible()) {
    await select.selectOption({ label: value });
  }
}

export async function submitForm(page: Page) {
  await page.getByRole('button', { name: /submit|save|create|update/i }).first().click();
}

export async function expectSuccessToast(page: Page) {
  await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 10000 });
}

export async function expectPageTitle(page: Page, title: string | RegExp) {
  await expect(page.locator('h1')).toContainText(title);
}

export async function expectTableHasRows(page: Page, minRows = 1) {
  const rows = page.locator('table tbody tr');
  await expect(rows).toHaveCount(minRows, { timeout: 10000 });
}

export async function clickFirstRowAction(page: Page, action: string) {
  const row = page.locator('table tbody tr').first();
  await row.getByRole('button', { name: new RegExp(action, 'i') }).click();
}
