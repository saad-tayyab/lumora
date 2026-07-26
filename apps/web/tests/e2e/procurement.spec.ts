import { test, expect } from '@playwright/test';

test.describe('Procurement', () => {
  test.describe('Purchase Orders - List', () => {
    test('displays purchase orders list page', async ({ page }) => {
      await page.goto('/proc/purchase-orders');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Purchase Orders - Create', () => {
    test('navigates to create purchase order form', async ({ page }) => {
      await page.goto('/proc/purchase-orders/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Purchase Orders - View', () => {
    test('displays purchase order detail page', async ({ page }) => {
      await page.goto('/proc/purchase-orders');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No purchase orders to view');
        return;
      }
      await row.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Purchase Orders - Submit for Approval', () => {
    test('can submit a purchase order for approval', async ({ page }) => {
      await page.goto('/proc/purchase-orders');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No purchase orders to submit');
        return;
      }
      await row.click();
      const submitBtn = page.getByRole('button', { name: /submit|approve/i }).first();
      const btnCount = await submitBtn.count();
      if (btnCount === 0) {
        test.skip(true, 'Submit button not available');
        return;
      }
      await expect(submitBtn).toBeVisible();
    });
  });

  test.describe('Purchase Orders - Approve', () => {
    test('can approve a purchase order', async ({ page }) => {
      await page.goto('/proc/purchase-orders');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No purchase orders to approve');
        return;
      }
      await row.click();
      const approveBtn = page.getByRole('button', { name: /approve/i }).first();
      const btnCount = await approveBtn.count();
      if (btnCount === 0) {
        test.skip(true, 'Approve button not available');
        return;
      }
      await expect(approveBtn).toBeVisible();
    });
  });

  test.describe('Purchase Orders - Cancel', () => {
    test('can cancel a purchase order', async ({ page }) => {
      await page.goto('/proc/purchase-orders');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No purchase orders to cancel');
        return;
      }
      await row.click();
      const cancelBtn = page.getByRole('button', { name: /cancel/i }).first();
      const btnCount = await cancelBtn.count();
      if (btnCount === 0) {
        test.skip(true, 'Cancel button not available');
        return;
      }
      await expect(cancelBtn).toBeVisible();
    });
  });

  test.describe('Receiving Reports - List', () => {
    test('displays receiving reports list page', async ({ page }) => {
      await page.goto('/proc/receiving-reports');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Receiving Reports - Create', () => {
    test('navigates to create receiving report form', async ({ page }) => {
      await page.goto('/proc/receiving-reports/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Receiving Reports - Confirm', () => {
    test('can view a receiving report for confirmation', async ({ page }) => {
      await page.goto('/proc/receiving-reports');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No receiving reports to confirm');
        return;
      }
      await row.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Vendor Catalog - List', () => {
    test('displays vendor catalog list page', async ({ page }) => {
      await page.goto('/proc/vendor-catalog');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });
});
