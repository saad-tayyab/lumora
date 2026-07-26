import { test, expect } from '@playwright/test';

test.describe('Tax Management', () => {
  test.describe('Tax Codes - List', () => {
    test('displays tax codes list page', async ({ page }) => {
      await page.goto('/tax/codes');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Tax Codes - Create', () => {
    test('navigates to create tax code form', async ({ page }) => {
      await page.goto('/tax/codes/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Tax Codes - View', () => {
    test('displays tax code detail page', async ({ page }) => {
      await page.goto('/tax/codes');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No tax codes to view');
        return;
      }
      await row.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Tax Codes - Edit', () => {
    test('navigates to edit tax code form', async ({ page }) => {
      await page.goto('/tax/codes');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No tax codes to edit');
        return;
      }
      await row.click();
      await page.getByRole('link', { name: /edit/i }).first().click();
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Tax Rates - List', () => {
    test('displays tax rates list page', async ({ page }) => {
      await page.goto('/tax/rates');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Tax Rates - Create', () => {
    test('navigates to create tax rate form', async ({ page }) => {
      await page.goto('/tax/rates/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Tax Rules - List', () => {
    test('displays tax rules list page', async ({ page }) => {
      await page.goto('/tax/rules');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Tax Rules - Create', () => {
    test('navigates to create tax rule form', async ({ page }) => {
      await page.goto('/tax/rules/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });
});
