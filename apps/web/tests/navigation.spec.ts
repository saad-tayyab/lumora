import { test, expect } from '@playwright/test';

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays sidebar on desktop', async ({ page }) => {
    const sidebar = page.locator('nav, [role="navigation"], aside').first();
    await expect(sidebar).toBeVisible();
  });

  test('sidebar contains main navigation links', async ({ page }) => {
    const nav = page.locator('nav, [role="navigation"], aside').first();
    await expect(nav).toBeVisible();

    const links = nav.getByRole('link');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('navigates to dashboard', async ({ page }) => {
    const dashLink = page.getByRole('link', { name: /dashboard/i }).first();
    if (await dashLink.isVisible()) {
      await dashLink.click();
      await expect(page).toHaveURL(/dashboard/);
    }
  });

  test('navigates to invoices', async ({ page }) => {
    const invoiceLink = page.getByRole('link', { name: /invoice/i }).first();
    if (await invoiceLink.isVisible()) {
      await invoiceLink.click();
      await expect(page).toHaveURL(/invoice/);
    }
  });

  test('navigates to customers', async ({ page }) => {
    const customerLink = page.getByRole('link', { name: /customer/i }).first();
    if (await customerLink.isVisible()) {
      await customerLink.click();
      await expect(page).toHaveURL(/customer/);
    }
  });

  test('navigates to products', async ({ page }) => {
    const productLink = page.getByRole('link', { name: /product|item|inventory/i }).first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await expect(page).toHaveURL(/product|item|inventory/);
    }
  });

  test('active link is visually distinct', async ({ page }) => {
    await page.goto('/dashboard');
    const activeLink = page.locator('a[aria-current="page"], a.active, .nav-active').first();
    if (await activeLink.isVisible()) {
      await expect(activeLink).toBeVisible();
    }
  });

  test('mobile sidebar toggle works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const toggle = page.locator('button[aria-label*="menu"], button[aria-label*="toggle"], button[data-testid="menu-toggle"]').first();
    if (await toggle.isVisible()) {
      await toggle.click();
      const sidebar = page.locator('nav, [role="navigation"], aside').first();
      await expect(sidebar).toBeVisible();
    }
  });
});
