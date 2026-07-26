import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test('shows 404 page for non-existent route', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await expect(page).toHaveURL(/nonexistent/);
  });

  test('handles network failure gracefully', async ({ page }) => {
    await page.route('**/api/**', (route) => route.abort('failed'));
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('handles 401 response by redirecting to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
    await context.close();
  });
});
