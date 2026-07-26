import { test as base, expect } from '@playwright/test';
import { TestDataManager } from './api-helpers';

type TestFixtures = {
  apiHelpers: TestDataManager;
};

export const test = base.extend<TestFixtures>({
  apiHelpers: async ({ request }, use) => {
    const helpers = new TestDataManager(request);
    await use(helpers);
  },
});

export { expect };
