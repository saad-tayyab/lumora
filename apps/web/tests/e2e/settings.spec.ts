import { test, expect } from '@playwright/test';

test.describe('Settings & Administration', () => {
  test.describe('Users - List', () => {
    test('displays users list page', async ({ page }) => {
      await page.goto('/settings/users');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Users - Create', () => {
    test('navigates to create user form', async ({ page }) => {
      await page.goto('/settings/users/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Users - View', () => {
    test('displays user detail page', async ({ page }) => {
      await page.goto('/settings/users');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No users to view');
        return;
      }
      await row.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Users - Edit', () => {
    test('navigates to edit user form', async ({ page }) => {
      await page.goto('/settings/users');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No users to edit');
        return;
      }
      await row.click();
      await page.getByRole('link', { name: /edit/i }).first().click();
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Roles - List', () => {
    test('displays roles list page', async ({ page }) => {
      await page.goto('/settings/roles');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Roles - Create', () => {
    test('navigates to create role form', async ({ page }) => {
      await page.goto('/settings/roles/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Sessions - List', () => {
    test('displays sessions list page', async ({ page }) => {
      await page.goto('/settings/sessions');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });
});
