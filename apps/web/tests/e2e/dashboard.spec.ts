import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('displays KPI cards', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Outstanding Invoices')).toBeVisible();
    await expect(page.getByText('Pending Bills')).toBeVisible();
    await expect(page.getByText('Total Employees')).toBeVisible();
  });

  test('quick actions navigate to correct pages', async ({ page }) => {
    await page.goto('/dashboard');
    const createInvoice = page.getByRole('link', { name: /create invoice/i });
    await createInvoice.click();
    await expect(page).toHaveURL(/ar\/invoices\/new/);
  });
});
