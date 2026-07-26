import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('dashboard page screenshot', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveScreenshot('dashboard.png');
  });

  test('financial accounts page screenshot', async ({ page }) => {
    await page.goto('/financial/accounts');
    await expect(page).toHaveScreenshot('financial-accounts.png');
  });

  test('AR invoices page screenshot', async ({ page }) => {
    await page.goto('/ar/invoices');
    await expect(page).toHaveScreenshot('ar-invoices.png');
  });

  test('login page screenshot', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/login');
    await expect(page).toHaveScreenshot('login.png');
    await context.close();
  });

  test('settings users page screenshot', async ({ page }) => {
    await page.goto('/settings/users');
    await expect(page).toHaveScreenshot('settings-users.png');
  });
});
