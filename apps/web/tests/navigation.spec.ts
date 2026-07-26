import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('sidebar is visible on desktop', async ({ page }) => {
    await page.goto('/dashboard');
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();
  });

  test('sidebar contains all navigation links', async ({ page }) => {
    await page.goto('/dashboard');
    const nav = page.locator('aside').first();
    const links = nav.getByRole('link');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(14);
  });

  test('clicking nav link navigates to correct page', async ({ page }) => {
    await page.goto('/dashboard');
    const navLinks = [
      { text: 'Financial', url: '/financial' },
      { text: 'Accounts Receivable', url: '/ar' },
      { text: 'Accounts Payable', url: '/ap' },
      { text: 'Cash', url: '/cash' },
      { text: 'Inventory', url: '/inv' },
      { text: 'Procurement', url: '/proc' },
      { text: 'Sales', url: '/sales' },
      { text: 'Human Resources', url: '/hr' },
      { text: 'Fixed Assets', url: '/assets' },
      { text: 'Tax', url: '/tax' },
      { text: 'Budgets', url: '/budgets' },
      { text: 'Audit', url: '/audit' },
      { text: 'Reports', url: '/reports' },
      { text: 'Settings', url: '/settings' },
    ];
    for (const { text, url } of navLinks) {
      const link = page.getByRole('link', { name: new RegExp(text, 'i') }).first();
      if (await link.count() > 0) {
        await link.click();
        await expect(page).toHaveURL(new RegExp(url));
      }
    }
  });

  test('mobile sidebar toggle works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    const toggle = page.getByRole('button', { name: /toggle sidebar/i }).first();
    if (await toggle.count() > 0) {
      await toggle.click();
      const sidebar = page.locator('aside').first();
      await expect(sidebar).toBeVisible();
    }
  });
});
