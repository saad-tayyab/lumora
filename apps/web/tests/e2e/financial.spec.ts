import { test, expect } from '@playwright/test';

test.describe('Financial - Chart of Accounts', () => {
  test('list accounts page loads', async ({ page }) => {
    await page.goto('/financial/accounts');
    await expect(page.locator('h1')).toContainText('Chart of Accounts');
    await expect(page.getByRole('link', { name: /new account/i })).toBeVisible();
  });

  test('accounts table displays columns', async ({ page }) => {
    await page.goto('/financial/accounts');
    await expect(page.getByRole('columnheader', { name: /code/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /type/i })).toBeVisible();
  });

  test('create new account', async ({ page }) => {
    await page.goto('/financial/accounts/new');
    await expect(page.locator('h1')).toContainText('New Account');

    await page.getByLabel(/account code/i).fill('1010');
    await page.getByLabel(/account name/i).fill('Test Cash Account');
    await page.getByLabel(/account type/i).selectOption('asset');
    await page.getByLabel(/description/i).fill('Test account for E2E');

    await page.getByRole('button', { name: /create account/i }).click();
    await page.waitForLoadState('networkidle');
  });

  test('view account detail page', async ({ page }) => {
    await page.goto('/financial/accounts');
    const viewLink = page.getByRole('link', { name: /view/i }).first();
    if (await viewLink.count() > 0) {
      await viewLink.click();
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.getByText('Account Details')).toBeVisible();
    }
  });

  test('search and filter accounts', async ({ page }) => {
    await page.goto('/financial/accounts');
    const searchInput = page.getByPlaceholder(/search by code or name/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('1000');

    const typeFilter = page.locator('select').first();
    await typeFilter.selectOption('asset');
  });
});

test.describe('Financial - Fiscal Years', () => {
  test('list fiscal years page loads', async ({ page }) => {
    await page.goto('/financial/fiscal-years');
    await expect(page.locator('h1')).toContainText('Fiscal Years');
    await expect(page.getByRole('link', { name: /new fiscal year/i })).toBeVisible();
  });

  test('fiscal years table displays columns', async ({ page }) => {
    await page.goto('/financial/fiscal-years');
    await expect(page.getByRole('columnheader', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /start date/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /end date/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
  });

  test('create new fiscal year', async ({ page }) => {
    await page.goto('/financial/fiscal-years/new');
    await expect(page.locator('h1')).toContainText('New Fiscal Year');

    await page.getByLabel(/year name/i).fill('FY 2026');
    await page.getByLabel(/start date/i).fill('2026-01-01');
    await page.getByLabel(/end date/i).fill('2026-12-31');

    await page.getByRole('button', { name: /create fiscal year/i }).click();
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Financial - Journal Entries', () => {
  test('list journal entries page loads', async ({ page }) => {
    await page.goto('/financial/journal-entries');
    await expect(page.locator('h1')).toContainText('Journal Entries');
    await expect(page.getByRole('link', { name: /new entry/i })).toBeVisible();
  });

  test('journal entries table displays columns', async ({ page }) => {
    await page.goto('/financial/journal-entries');
    await expect(page.getByRole('columnheader', { name: /entry/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /date/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /description/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
  });

  test('create new journal entry with balanced lines', async ({ page }) => {
    await page.goto('/financial/journal-entries/new');
    await expect(page.locator('h1')).toContainText('New Journal Entry');

    await page.getByLabel(/date/i).fill('2026-07-25');
    await page.getByLabel(/description/i).fill('E2E test journal entry');

    const line0Account = page.locator('select[name="line_0_accountId"]');
    const line1Account = page.locator('select[name="line_1_accountId"]');

    if ((await line0Account.count()) > 0 && (await line1Account.count()) > 0) {
      const options0 = await line0Account.locator('option').allTextContents();
      if (options0.length > 1) {
        await line0Account.selectOption({ index: 1 });
        await line1Account.selectOption({ index: 2 });
      }

      const debitInput = page.locator('input[name="line_0_debit"]');
      const creditInput = page.locator('input[name="line_1_credit"]');

      if ((await debitInput.count()) > 0) {
        await debitInput.fill('500.00');
        await creditInput.fill('500.00');

        await expect(page.getByText('Balanced')).toBeVisible();
      }
    }
  });

  test('search and filter journal entries', async ({ page }) => {
    await page.goto('/financial/journal-entries');
    const searchInput = page.getByPlaceholder(/search by number or description/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('test');

    const statusFilter = page.locator('select').first();
    await statusFilter.selectOption('draft');
  });

  test('view journal entry detail', async ({ page }) => {
    await page.goto('/financial/journal-entries');
    const viewLink = page.getByRole('link', { name: /view/i }).first();
    if (await viewLink.count() > 0) {
      await viewLink.click();
      await expect(page.locator('h1')).toContainText('Journal Entry');
      await expect(page.getByText('Lines')).toBeVisible();
    }
  });

  test('post journal entry from detail page', async ({ page }) => {
    await page.goto('/financial/journal-entries');
    const viewLink = page.getByRole('link', { name: /view/i }).first();
    if (await viewLink.count() > 0) {
      await viewLink.click();
      const postBtn = page.getByRole('button', { name: /post entry/i });
      if (await postBtn.count() > 0) {
        await postBtn.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('void journal entry from detail page', async ({ page }) => {
    await page.goto('/financial/journal-entries');
    const viewLink = page.getByRole('link', { name: /view/i }).first();
    if (await viewLink.count() > 0) {
      await viewLink.click();
      const voidBtn = page.getByRole('button', { name: /void entry/i });
      if (await voidBtn.count() > 0) {
        await voidBtn.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });
});
