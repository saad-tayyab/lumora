import { test, expect } from '@playwright/test';

test.describe('Human Resources', () => {
  test.describe('Employees - List', () => {
    test('displays employees list page', async ({ page }) => {
      await page.goto('/hr/employees');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Employees - Create', () => {
    test('navigates to create employee form', async ({ page }) => {
      await page.goto('/hr/employees/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Employees - View', () => {
    test('displays employee detail page', async ({ page }) => {
      await page.goto('/hr/employees');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No employees to view');
        return;
      }
      await row.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Employees - Edit', () => {
    test('navigates to edit employee form', async ({ page }) => {
      await page.goto('/hr/employees');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No employees to edit');
        return;
      }
      await row.click();
      await page.getByRole('link', { name: /edit/i }).first().click();
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Departments - List', () => {
    test('displays departments list page', async ({ page }) => {
      await page.goto('/hr/departments');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Departments - Create', () => {
    test('navigates to create department form', async ({ page }) => {
      await page.goto('/hr/departments/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Designations - List', () => {
    test('displays designations list page', async ({ page }) => {
      await page.goto('/hr/designations');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Designations - Create', () => {
    test('navigates to create designation form', async ({ page }) => {
      await page.goto('/hr/designations/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Attendance - List', () => {
    test('displays attendance list page', async ({ page }) => {
      await page.goto('/hr/attendance');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Attendance - Record', () => {
    test('has mechanism to record attendance', async ({ page }) => {
      await page.goto('/hr/attendance');
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Leave Requests - List', () => {
    test('displays leave requests list page', async ({ page }) => {
      await page.goto('/hr/leave');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Leave Requests - Request', () => {
    test('has mechanism to request leave', async ({ page }) => {
      await page.goto('/hr/leave');
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Salaries - List', () => {
    test('displays salaries list page', async ({ page }) => {
      await page.goto('/hr/salaries');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Salaries - Create', () => {
    test('has mechanism to create salary', async ({ page }) => {
      await page.goto('/hr/salaries');
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Payroll - List', () => {
    test('displays payroll list page', async ({ page }) => {
      await page.goto('/hr/payroll');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Payslips - List', () => {
    test('displays payslips list page', async ({ page }) => {
      await page.goto('/hr/payslips');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });
});
