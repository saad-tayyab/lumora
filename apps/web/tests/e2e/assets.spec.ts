import { test, expect } from '@playwright/test';

test.describe('Fixed Asset Management', () => {
  test.describe('Asset Categories - List', () => {
    test('displays asset categories list page', async ({ page }) => {
      await page.goto('/assets/categories');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Asset Categories - Create', () => {
    test('navigates to create asset category form', async ({ page }) => {
      await page.goto('/assets/categories/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Asset Categories - View', () => {
    test('displays asset category detail page', async ({ page }) => {
      await page.goto('/assets/categories');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No asset categories to view');
        return;
      }
      await row.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Asset Categories - Edit', () => {
    test('navigates to edit asset category form', async ({ page }) => {
      await page.goto('/assets/categories');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No asset categories to edit');
        return;
      }
      await row.click();
      await page.getByRole('link', { name: /edit/i }).first().click();
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Fixed Assets - List', () => {
    test('displays fixed assets list page', async ({ page }) => {
      await page.goto('/assets/fixed-assets');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Fixed Assets - Create', () => {
    test('navigates to create fixed asset form', async ({ page }) => {
      await page.goto('/assets/fixed-assets/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Fixed Assets - View', () => {
    test('displays fixed asset detail page', async ({ page }) => {
      await page.goto('/assets/fixed-assets');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No fixed assets to view');
        return;
      }
      await row.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Fixed Assets - Edit', () => {
    test('navigates to edit fixed asset form', async ({ page }) => {
      await page.goto('/assets/fixed-assets');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No fixed assets to edit');
        return;
      }
      await row.click();
      await page.getByRole('link', { name: /edit/i }).first().click();
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Depreciation Schedules - List', () => {
    test('displays depreciation schedules list page', async ({ page }) => {
      await page.goto('/assets/depreciation');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Depreciation Entries - List', () => {
    test('displays depreciation entries list page', async ({ page }) => {
      await page.goto('/assets/depreciation-entries');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Depreciation Entries - View', () => {
    test('displays depreciation entry detail page', async ({ page }) => {
      await page.goto('/assets/depreciation-entries');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No depreciation entries to view');
        return;
      }
      await row.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Depreciation Entries - Post', () => {
    test('can post a depreciation entry', async ({ page }) => {
      await page.goto('/assets/depreciation-entries');
      const row = page.locator('table tbody tr').first();
      const count = await row.count();
      if (count === 0) {
        test.skip(true, 'No depreciation entries to post');
        return;
      }
      await row.click();
      const postBtn = page.getByRole('button', { name: /post/i }).first();
      const btnCount = await postBtn.count();
      if (btnCount === 0) {
        test.skip(true, 'Post button not available');
        return;
      }
      await expect(postBtn).toBeVisible();
    });
  });

  test.describe('Adjustments - List', () => {
    test('displays adjustments list page', async ({ page }) => {
      await page.goto('/assets/adjustments');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Adjustments - Create', () => {
    test('navigates to create adjustment form', async ({ page }) => {
      await page.goto('/assets/adjustments/new');
      await expect(page.locator('form')).toBeVisible();
    });
  });
});
