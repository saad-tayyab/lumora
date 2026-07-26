import { test, expect } from '@playwright/test';

test.describe('Inventory Management', () => {
  test.describe('Items - List', () => {
    test('displays items list page', async ({ page }) => {
      await page.goto('/inv/items');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Items - Create', () => {
    test('navigates to create item form', async ({ page }) => {
      await page.goto('/inv/items/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Items - View', () => {
    test('displays item detail page', async ({ page }) => {
      await page.goto('/inv/items');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No items to view');
        return;
      }
      await row.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Items - Edit', () => {
    test('navigates to edit item form', async ({ page }) => {
      await page.goto('/inv/items');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No items to edit');
        return;
      }
      await row.click();
      await page.getByRole('link', { name: /edit/i }).first().click();
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Warehouses - List', () => {
    test('displays warehouses list page', async ({ page }) => {
      await page.goto('/inv/warehouses');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Warehouses - Create', () => {
    test('navigates to create warehouse form', async ({ page }) => {
      await page.goto('/inv/warehouses/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Categories - List', () => {
    test('displays categories list page', async ({ page }) => {
      await page.goto('/inv/categories');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Categories - Create', () => {
    test('navigates to create category form', async ({ page }) => {
      await page.goto('/inv/categories/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Stock Movements - List', () => {
    test('displays stock movements list page', async ({ page }) => {
      await page.goto('/inv/stock-movements');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Stock Movements - Record', () => {
    test('navigates to record stock movement form', async ({ page }) => {
      await page.goto('/inv/stock-movements/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });
});
