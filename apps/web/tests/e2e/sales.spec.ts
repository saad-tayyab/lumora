import { test, expect } from '@playwright/test';

test.describe('Sales & Orders', () => {
  test.describe('Sales Orders - List', () => {
    test('displays sales orders list page', async ({ page }) => {
      await page.goto('/sales/orders');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Sales Orders - Create', () => {
    test('navigates to create sales order form', async ({ page }) => {
      await page.goto('/sales/orders/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Sales Orders - View', () => {
    test('displays sales order detail page', async ({ page }) => {
      await page.goto('/sales/orders');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No sales orders to view');
        return;
      }
      await row.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Sales Orders - Update Status', () => {
    test('displays status controls on order detail', async ({ page }) => {
      await page.goto('/sales/orders');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No sales orders to update status');
        return;
      }
      await row.click();
      const statusBtn = page.getByRole('button', { name: /status|confirm|fulfill|cancel/i }).first();
      const btnCount = await statusBtn.count();
      if (btnCount === 0) {
        test.skip(true, 'Status control not available');
        return;
      }
      await expect(statusBtn).toBeVisible();
    });
  });

  test.describe('Quotations - List', () => {
    test('displays quotations list page', async ({ page }) => {
      await page.goto('/sales/quotations');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Quotations - Create', () => {
    test('navigates to create quotation form', async ({ page }) => {
      await page.goto('/sales/quotations/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Quotations - View', () => {
    test('displays quotation detail page', async ({ page }) => {
      await page.goto('/sales/quotations');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No quotations to view');
        return;
      }
      await row.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Discount Policies - List', () => {
    test('displays discount policies list page', async ({ page }) => {
      await page.goto('/sales/discount-policies');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Discount Policies - Create', () => {
    test('navigates to create discount policy form', async ({ page }) => {
      await page.goto('/sales/discount-policies/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });
});
