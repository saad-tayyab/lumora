import { test, expect } from '@playwright/test';

test.describe('AR - Customers', () => {
  test('list customers page loads', async ({ page }) => {
    await page.goto('/ar/customers');
    await expect(page.locator('h1')).toContainText('Customers');
    await expect(page.getByRole('link', { name: /new customer/i })).toBeVisible();
  });

  test('customers table displays columns', async ({ page }) => {
    await page.goto('/ar/customers');
    await expect(page.getByRole('columnheader', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /payment terms/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
  });

  test('create new customer', async ({ page }) => {
    await page.goto('/ar/customers/new');
    await expect(page.locator('h1')).toContainText('New Customer');

    await page.getByLabel(/^name/i).fill('E2E Test Customer');
    await page.getByLabel(/email/i).fill('e2e-customer@test.com');
    await page.getByLabel(/phone/i).fill('+1 555 123 4567');
    await page.getByLabel(/payment terms/i).selectOption('Net 30');
    await page.getByLabel(/credit limit/i).fill('10000');
    await page.getByLabel(/address line 1/i).fill('123 Test Street');
    await page.getByLabel(/city/i).fill('Testville');
    await page.getByLabel(/state/i).fill('TS');
    await page.getByLabel(/postal code/i).fill('12345');
    await page.getByLabel(/country/i).fill('USA');

    await page.getByRole('button', { name: /create customer/i }).click();
    await page.waitForLoadState('networkidle');
  });

  test('view customer detail page', async ({ page }) => {
    await page.goto('/ar/customers');
    const viewLink = page.getByRole('link', { name: /view/i }).first();
    if (await viewLink.count() > 0) {
      await viewLink.click();
      await expect(page.locator('h1')).toBeVisible();
    }
  });
});

test.describe('AR - Invoices', () => {
  test('list invoices page loads', async ({ page }) => {
    await page.goto('/ar/invoices');
    await expect(page.locator('h1')).toContainText('Invoices');
    await expect(page.getByRole('link', { name: /create invoice/i })).toBeVisible();
  });

  test('invoices table displays columns', async ({ page }) => {
    await page.goto('/ar/invoices');
    await expect(page.getByRole('columnheader', { name: /invoice/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /issue date/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /due date/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /total/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
  });

  test('filter invoices by status', async ({ page }) => {
    await page.goto('/ar/invoices');
    const statusFilter = page.getByLabel(/status/i);
    await statusFilter.selectOption('draft');
    await expect(page.locator('table tbody')).toBeVisible();
  });

  test('create new invoice with line items', async ({ page }) => {
    await page.goto('/ar/invoices/new');
    await expect(page.locator('h1')).toContainText('Create Invoice');

    const customerSelect = page.getByLabel(/customer/i);
    if ((await customerSelect.locator('option').count()) > 1) {
      await customerSelect.selectOption({ index: 1 });
    }

    await page.getByLabel(/invoice number/i).fill('INV-E2E-001');
    await page.getByLabel(/issue date/i).fill('2026-07-25');
    await page.getByLabel(/due date/i).fill('2026-08-25');

    const descInput = page.locator('input[name="lineDescription_0"]');
    const qtyInput = page.locator('input[name="lineQuantity_0"]');
    const priceInput = page.locator('input[name="lineUnitPrice_0"]');

    if ((await descInput.count()) > 0) {
      await descInput.fill('E2E Test Service');
      await qtyInput.fill('2');
      await priceInput.fill('150.00');
    }

    await page.getByLabel(/notes/i).fill('E2E test invoice notes');

    await page.getByRole('button', { name: /create invoice/i }).click();
    await page.waitForLoadState('networkidle');
  });

  test('view invoice detail page', async ({ page }) => {
    await page.goto('/ar/invoices');
    const viewLink = page.getByRole('link', { name: /view/i }).first();
    if (await viewLink.count() > 0) {
      await viewLink.click();
      await expect(page.locator('h1')).toContainText('Invoice');
      await expect(page.getByText('Invoice Details')).toBeVisible();
      await expect(page.getByText('Line Items')).toBeVisible();
      await expect(page.getByText('Summary')).toBeVisible();
    }
  });
});

test.describe('AR - Payments', () => {
  test('list payments page loads', async ({ page }) => {
    await page.goto('/ar/payments');
    await expect(page.locator('h1')).toContainText('Payments');
    await expect(page.getByRole('link', { name: /record payment/i })).toBeVisible();
  });

  test('payments table displays columns', async ({ page }) => {
    await page.goto('/ar/payments');
    await expect(page.getByRole('columnheader', { name: /payment/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /date/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /amount/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /method/i })).toBeVisible();
  });

  test('record a payment', async ({ page }) => {
    await page.goto('/ar/payments/new');
    await expect(page.locator('h1')).toContainText('Record Payment');

    const customerSelect = page.getByLabel(/customer/i);
    if ((await customerSelect.locator('option').count()) > 1) {
      await customerSelect.selectOption({ index: 1 });
    }

    await page.getByLabel(/payment number/i).fill('PAY-E2E-001');
    await page.getByLabel(/payment date/i).fill('2026-07-25');
    await page.getByLabel(/amount/i).fill('500.00');
    await page.getByLabel(/payment method/i).selectOption('bank_transfer');
    await page.getByLabel(/reference/i).fill('TXN-E2E-001');
    await page.getByLabel(/notes/i).fill('E2E test payment');

    await page.getByRole('button', { name: /record payment/i }).click();
    await page.waitForLoadState('networkidle');
  });
});

test.describe('AR - Credit Notes', () => {
  test('list credit notes page loads', async ({ page }) => {
    await page.goto('/ar/credit-notes');
    await expect(page.locator('h1')).toContainText('Credit Notes');
    await expect(page.getByRole('link', { name: /create credit note/i })).toBeVisible();
  });

  test('credit notes table displays columns', async ({ page }) => {
    await page.goto('/ar/credit-notes');
    await expect(page.getByRole('columnheader', { name: /credit note/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /issue date/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /reason/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /amount/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
  });

  test('create new credit note', async ({ page }) => {
    await page.goto('/ar/credit-notes/new');
    await expect(page.locator('h1')).toContainText('Create Credit Note');

    const customerSelect = page.getByLabel(/customer/i);
    if ((await customerSelect.locator('option').count()) > 1) {
      await customerSelect.selectOption({ index: 1 });
    }

    await page.getByLabel(/credit note number/i).fill('CN-E2E-001');
    await page.getByLabel(/issue date/i).fill('2026-07-25');
    await page.getByLabel(/amount/i).fill('250.00');
    await page.getByLabel(/reason/i).fill('E2E test credit note reason');
    await page.getByLabel(/notes/i).fill('E2E test credit note');

    await page.getByRole('button', { name: /create credit note/i }).click();
    await page.waitForLoadState('networkidle');
  });

  test('view credit note detail page', async ({ page }) => {
    await page.goto('/ar/credit-notes');
    const viewLink = page.getByRole('link', { name: /view/i }).first();
    if (await viewLink.count() > 0) {
      await viewLink.click();
      await expect(page.locator('h1')).toContainText('Credit Note');
      await expect(page.getByText('Credit Note Details')).toBeVisible();
      await expect(page.getByText('Summary')).toBeVisible();
    }
  });
});
