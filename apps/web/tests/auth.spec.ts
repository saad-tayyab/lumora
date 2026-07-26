import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('logged-in user sees dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('can navigate to all main sections', async ({ page }) => {
    const sections = ['Financial', 'AR', 'AP', 'Cash', 'Inventory', 'Procurement', 'Sales', 'HR', 'Assets', 'Tax', 'Budgets', 'Audit', 'Settings'];
    for (const section of sections) {
      const link = page.getByRole('link', { name: new RegExp(section, 'i') }).first();
      if (await link.count() > 0) {
        await link.click();
        await page.waitForLoadState('networkidle');
        await expect(page.locator('h1, h2').first()).toBeVisible();
      }
    }
  });

  test('logout redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    const logout = page.getByRole('button', { name: /sign out/i }).first();
    if (await logout.count() > 0) {
      await logout.click();
      await expect(page).toHaveURL(/login/);
    }
  });
});
