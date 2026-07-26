import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.describe('Login Page', () => {
    test('navigates to login page', async ({ page }) => {
      await page.goto('/login');
      await expect(page).toHaveURL('/login');
    });

    test('displays login form elements', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: /sign in|log in|login/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in|log in|submit/i })).toBeVisible();
    });

    test('shows validation error on empty submit', async ({ page }) => {
      await page.goto('/login');
      await page.getByRole('button', { name: /sign in|log in|submit/i }).click();
      await expect(page.getByText(/required|cannot be empty/i)).toBeVisible();
    });

    test('shows error on invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('wrong@example.com');
      await page.getByLabel(/password/i).fill('wrongpassword');
      await page.getByRole('button', { name: /sign in|log in|submit/i }).click();
      await expect(page.getByText(/invalid|incorrect|failed/i)).toBeVisible();
    });

    test('has link to register page', async ({ page }) => {
      await page.goto('/login');
      const registerLink = page.getByRole('link', { name: /sign up|register|create account/i });
      await expect(registerLink).toBeVisible();
    });
  });

  test.describe('Register Page', () => {
    test('navigates to register page', async ({ page }) => {
      await page.goto('/register');
      await expect(page).toHaveURL('/register');
    });

    test('displays register form elements', async ({ page }) => {
      await page.goto('/register');
      await expect(page.getByRole('heading', { name: /sign up|register|create/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign up|register|create/i })).toBeVisible();
    });

    test('has link to login page', async ({ page }) => {
      await page.goto('/register');
      const loginLink = page.getByRole('link', { name: /sign in|log in|already have/i });
      await expect(loginLink).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);
    });

    test('redirects to login for protected API calls', async ({ page }) => {
      const response = await page.request.get('http://localhost:4000/api/protected');
      expect(response.status()).toBe(401);
    });
  });
});
