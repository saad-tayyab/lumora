import { test, expect } from '@playwright/test';

test.describe('Audit & Compliance', () => {
  test.describe('Audit Log - List', () => {
    test('displays audit log entries list page', async ({ page }) => {
      await page.goto('/audit');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Audit Log - View Detail', () => {
    test('displays audit log entry detail page', async ({ page }) => {
      await page.goto('/audit');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No audit log entries to view');
        return;
      }
      await row.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });
});
