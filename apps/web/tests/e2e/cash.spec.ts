import { test, expect } from '@playwright/test';

test.describe('Cash & Treasury', () => {
  test.describe('Bank Accounts - List', () => {
    test('displays bank accounts list page', async ({ page }) => {
      await page.goto('/cash/bank-accounts');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Bank Accounts - Create', () => {
    test('navigates to create bank account form', async ({ page }) => {
      await page.goto('/cash/bank-accounts/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Bank Accounts - View', () => {
    test('displays bank account detail page', async ({ page }) => {
      await page.goto('/cash/bank-accounts');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No bank accounts to view');
        return;
      }
      await row.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Bank Accounts - Edit', () => {
    test('navigates to edit bank account form', async ({ page }) => {
      await page.goto('/cash/bank-accounts');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No bank accounts to edit');
        return;
      }
      await row.click();
      await page.getByRole('link', { name: /edit/i }).first().click();
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Transfers - List', () => {
    test('displays transfers list page', async ({ page }) => {
      await page.goto('/cash/transfers');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Transfers - Create', () => {
    test('navigates to create transfer form', async ({ page }) => {
      await page.goto('/cash/transfers/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Transfers - View', () => {
    test('displays transfer detail page', async ({ page }) => {
      await page.goto('/cash/transfers');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No transfers to view');
        return;
      }
      await row.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Statements - List', () => {
    test('displays statements list page', async ({ page }) => {
      await page.goto('/cash/statements');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Statements - View', () => {
    test('displays statement detail page', async ({ page }) => {
      await page.goto('/cash/statements');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No statements to view');
        return;
      }
      await row.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Reconciliation', () => {
    test('displays reconciliation page', async ({ page }) => {
      await page.goto('/cash/reconciliation');
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });
});
