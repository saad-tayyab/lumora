import { test, expect } from '@playwright/test';

test.describe('AP - Vendors', () => {
  test('list vendors page loads', async ({ page }) => {
    await page.goto('/ap/vendors');
    await expect(page.locator('h1')).toContainText('Vendors');
    await expect(page.getByRole('link', { name: /add vendor/i })).toBeVisible();
  });

  test('vendors table displays columns', async ({ page }) => {
    await page.goto('/ap/vendors');
    await expect(page.getByRole('columnheader', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /currency/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /created/i })).toBeVisible();
  });

  test('create new vendor', async ({ page }) => {
    await page.goto('/ap/vendors/new');
    await expect(page.locator('h1')).toContainText('Add Vendor');

    await page.getByLabel(/^name/i).fill('E2E Test Vendor');
    await page.getByLabel(/email/i).fill('e2e-vendor@test.com');
    await page.getByLabel(/phone/i).fill('+1 555 987 6543');
    await page.getByLabel(/tax id/i).fill('TAX-123456');
    await page.getByLabel(/currency/i).selectOption('USD');
    await page.getByLabel(/payment terms/i).fill('30');
    await page.getByLabel(/^address$/i).fill('456 Vendor Lane');
    await page.getByLabel(/city/i).fill('Vendorville');
    await page.getByLabel(/state/i).fill('VT');
    await page.getByLabel(/postal code/i).fill('67890');
    await page.getByLabel(/country/i).fill('US');
    await page.getByLabel(/notes/i).fill('E2E test vendor notes');

    await page.getByRole('button', { name: /create vendor/i }).click();
    await page.waitForLoadState('networkidle');
  });

  test('view vendor detail page', async ({ page }) => {
    await page.goto('/ap/vendors');
    const viewLink = page.getByRole('link', { name: /edit/i }).first();
    if (await viewLink.count() > 0) {
      await viewLink.click();
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('search vendors', async ({ page }) => {
    await page.goto('/ap/vendors');
    const searchInput = page.getByPlaceholder(/search vendors/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('test');
  });
});

test.describe('AP - Bills', () => {
  test('list bills page loads', async ({ page }) => {
    await page.goto('/ap/bills');
    await expect(page.locator('h1')).toContainText('Bills');
    await expect(page.getByRole('link', { name: /record bill/i })).toBeVisible();
  });

  test('bills table displays columns', async ({ page }) => {
    await page.goto('/ap/bills');
    await expect(page.getByRole('columnheader', { name: /bill/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /vendor/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /issue date/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /due date/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /total/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
  });

  test('filter bills by status', async ({ page }) => {
    await page.goto('/ap/bills');
    const statusFilter = page.locator('select').first();
    await statusFilter.selectOption('draft');
  });

  test('create new bill with line items', async ({ page }) => {
    await page.goto('/ap/bills/new');
    await expect(page.locator('h1')).toContainText('Record Bill');

    const vendorSelect = page.getByLabel(/vendor/i);
    if ((await vendorSelect.locator('option').count()) > 1) {
      await vendorSelect.selectOption({ index: 1 });
    }

    await page.getByLabel(/bill number/i).fill('BILL-E2E-001');
    await page.getByLabel(/issue date/i).fill('2026-07-25');
    await page.getByLabel(/due date/i).fill('2026-08-25');

    const descInput = page.locator('input[name="lineDescription_0"]');
    const qtyInput = page.locator('input[name="lineQuantity_0"]');
    const priceInput = page.locator('input[name="lineUnitPrice_0"]');

    if ((await descInput.count()) > 0) {
      await descInput.fill('E2E Test Service');
      await qtyInput.fill('1');
      await priceInput.fill('1000.00');
    }

    await page.getByLabel(/tax amount/i).fill('80.00');
    await page.getByLabel(/notes/i).fill('E2E test bill notes');

    await page.getByRole('button', { name: /create bill/i }).click();
    await page.waitForLoadState('networkidle');
  });

  test('view bill detail page', async ({ page }) => {
    await page.goto('/ap/bills');
    const viewLink = page.getByRole('link', { name: /view/i }).first();
    if (await viewLink.count() > 0) {
      await viewLink.click();
      await expect(page.locator('h1')).toContainText('Bill');
      await expect(page.getByText('Bill Details')).toBeVisible();
      await expect(page.getByText('Amounts')).toBeVisible();
    }
  });

  test('submit bill for approval', async ({ page }) => {
    await page.goto('/ap/bills');
    const viewLink = page.getByRole('link', { name: /view/i }).first();
    if (await viewLink.count() > 0) {
      await viewLink.click();
      const submitBtn = page.getByRole('button', { name: /submit for approval/i });
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('approve bill', async ({ page }) => {
    await page.goto('/ap/bills?status=pending_approval');
    const viewLink = page.getByRole('link', { name: /view/i }).first();
    if (await viewLink.count() > 0) {
      await viewLink.click();
      const approveBtn = page.getByRole('button', { name: /^approve$/i });
      if (await approveBtn.count() > 0) {
        await approveBtn.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('void bill', async ({ page }) => {
    await page.goto('/ap/bills');
    const viewLink = page.getByRole('link', { name: /view/i }).first();
    if (await viewLink.count() > 0) {
      await viewLink.click();
      const voidBtn = page.getByRole('button', { name: /^void$/i });
      if (await voidBtn.count() > 0) {
        await voidBtn.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });
});

test.describe('AP - Payments', () => {
  test('list payments page loads', async ({ page }) => {
    await page.goto('/ap/payments');
    await expect(page.locator('h1')).toContainText('Payments');
    await expect(page.getByRole('link', { name: /record payment/i })).toBeVisible();
  });

  test('payments table displays columns', async ({ page }) => {
    await page.goto('/ap/payments');
    await expect(page.getByRole('columnheader', { name: /vendor/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /bill/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /date/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /method/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /amount/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /reference/i })).toBeVisible();
  });

  test('record a payment', async ({ page }) => {
    await page.goto('/ap/payments/new');
    await expect(page.locator('h1')).toContainText('Record Payment');

    const vendorSelect = page.getByLabel(/vendor/i);
    if ((await vendorSelect.locator('option').count()) > 1) {
      await vendorSelect.selectOption({ index: 1 });
    }

    await page.getByLabel(/amount/i).fill('500.00');
    await page.getByLabel(/payment date/i).fill('2026-07-25');
    await page.getByLabel(/payment method/i).selectOption('bank_transfer');
    await page.getByLabel(/reference/i).fill('VND-PAY-E2E-001');
    await page.getByLabel(/notes/i).fill('E2E test vendor payment');

    await page.getByRole('button', { name: /record payment/i }).click();
    await page.waitForLoadState('networkidle');
  });
});
