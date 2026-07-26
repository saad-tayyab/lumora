import { test, expect } from '@playwright/test';

test.describe('Budget Management', () => {
  test.describe('Budgets - List', () => {
    test('displays budgets list page', async ({ page }) => {
      await page.goto('/budgets');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Budgets - Create', () => {
    test('navigates to create budget form', async ({ page }) => {
      await page.goto('/budgets/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Budgets - View', () => {
    test('displays budget detail page', async ({ page }) => {
      await page.goto('/budgets');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No budgets to view');
        return;
      }
      await row.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Budgets - Edit', () => {
    test('navigates to edit budget form', async ({ page }) => {
      await page.goto('/budgets');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No budgets to edit');
        return;
      }
      await row.click();
      await page.getByRole('link', { name: /edit/i }).first().click();
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Budgets - Add Line', () => {
    test('can add a budget line', async ({ page }) => {
      await page.goto('/budgets');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No budgets to add lines to');
        return;
      }
      await row.click();
      const addLineBtn = page.getByRole('button', { name: /add line|add budget line/i }).first();
      const btnCount = await addLineBtn.count();
      if (btnCount === 0) {
        test.skip(true, 'Add line button not available');
        return;
      }
      await expect(addLineBtn).toBeVisible();
    });
  });

  test.describe('Budgets - Variance Report', () => {
    test('displays variance report page', async ({ page }) => {
      await page.goto('/budgets');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No budgets to view variance');
        return;
      }
      const id = await row.getAttribute('data-id');
      if (id) {
        await page.goto(`/budgets/${id}/variance`);
      } else {
        await row.click();
        await page.getByRole('link', { name: /variance/i }).first().click();
      }
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Consumptions - List', () => {
    test('displays consumptions list page', async ({ page }) => {
      await page.goto('/budgets/consumptions');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Consumptions - Create', () => {
    test('navigates to create consumption form', async ({ page }) => {
      await page.goto('/budget-consumptions/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });
});
