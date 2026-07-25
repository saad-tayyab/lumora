import { testDb } from './test-db';
import {
  accounts,
  journalEntries,
  journalEntryLines,
  fiscalYears,
  customers,
  vendors,
  bankAccounts,
  items,
  itemCategories,
  employees,
  fixedAssets,
  taxCodes,
  budgetHeaders,
  auditLogEntries,
} from '@lumora/database/schema';
import { eq, like } from 'drizzle-orm';

export const TEST_TENANT_ID = '11111111-1111-4111-8111-111111111111';
export const TEST_USER_ID = '22222222-2222-4222-8222-222222222222';
export const OTHER_TENANT_ID = '33333333-3333-4333-8333-333333333333';

export { testDb };
export { testDb as db };

const TENANT_TABLES = [
  accounts,
  journalEntries,
  journalEntryLines,
  fiscalYears,
  customers,
  vendors,
  bankAccounts,
  items,
  itemCategories,
  employees,
  fixedAssets,
  taxCodes,
  budgetHeaders,
  auditLogEntries,
] as const;

export async function cleanupTestData(): Promise<void> {
  for (const table of TENANT_TABLES) {
    try {
      await testDb
        .delete(table)
        .where(eq(table.tenantId, TEST_TENANT_ID));
    } catch {
      // skip
    }
  }
}

export function randomCode(prefix: string, maxLen = 20): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  const ts = Date.now().toString(36).slice(-4);
  const code = `${prefix}${ts}${suffix}`;
  return code.slice(0, maxLen);
}
