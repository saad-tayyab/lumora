import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate as test user', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('admin@lumora.test');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await expect(page.locator('h1')).toContainText('Dashboard');

  await page.context().storageState({ path: authFile });
});
