import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('dashboard has proper heading hierarchy', async ({ page }) => {
    await page.goto('/dashboard');
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('login form has proper labels', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('tables have proper th elements', async ({ page }) => {
    await page.goto('/financial/accounts');
    const th = page.locator('table th');
    const count = await th.count();
    expect(count).toBeGreaterThan(0);
  });

  test('forms have proper labels', async ({ page }) => {
    await page.goto('/financial/accounts/new');
    const labels = page.locator('label');
    const count = await labels.count();
    expect(count).toBeGreaterThan(0);
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/dashboard');
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const name = await button.getAttribute('aria-label');
      const text = await button.textContent();
      expect(name || text?.trim()).toBeTruthy();
    }
  });
});
