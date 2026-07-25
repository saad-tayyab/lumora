import { vi, describe, expect, it, beforeAll, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { testDb, TEST_TENANT_ID, cleanupTestData, randomCode } from '../../lib/integration-test-utils';
import { accounts, journalEntries, journalEntryLines, fiscalYears } from '@lumora/database/schema';

// ─── Mocks ───────────────────────────────────────────────────────────────────
// Mock encore.dev modules before database.ts is loaded
vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class MockSQLDatabase {
    connectionString = process.env.DATABASE_URL;
  },
}));

vi.mock('encore.dev/api', () => ({}));

// Override the database module to use testDb
vi.mock('../../database', () => ({
  db: testDb,
}));

// ─── Imports that depend on the mocks ────────────────────────────────────────
import { accountsRepo, journalEntriesRepo, journalEntryLinesRepo, fiscalYearsRepo } from './repo';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const OTHER_TENANT = '33333333-3333-4333-8333-333333333333';

function makeAccount(overrides?: Partial<typeof accounts.$inferInsert>) {
  return {
    tenantId: TEST_TENANT_ID,
    code: randomCode('ACCT'),
    name: 'Test Account',
    type: 'asset' as const,
    balance: '0',
    isActive: true,
    ...overrides,
  };
}

function makeJournalEntry(overrides?: Partial<typeof journalEntries.$inferInsert>) {
  return {
    tenantId: TEST_TENANT_ID,
    date: '2026-01-15',
    description: 'Test Journal Entry',
    status: 'draft' as const,
    createdBy: '00000000-0000-0000-0000-000000000001',
    ...overrides,
  };
}

function makeJournalEntryLine(overrides?: Partial<typeof journalEntryLines.$inferInsert>) {
  return {
    tenantId: TEST_TENANT_ID,
    journalEntryId: '00000000-0000-0000-0000-000000000000',
    accountId: '00000000-0000-0000-0000-000000000000',
    debit: '0',
    credit: '0',
    ...overrides,
  };
}

function makeFiscalYear(overrides?: Partial<typeof fiscalYears.$inferInsert>) {
  return {
    tenantId: TEST_TENANT_ID,
    name: 'FY 2026',
    startDate: new Date('2026-01-01T00:00:00Z'),
    endDate: new Date('2026-12-31T23:59:59Z'),
    status: 'open',
    ...overrides,
  };
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Financial Repositories - Integration Tests', () => {
  beforeAll(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // accountsRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('accountsRepo', () => {
    describe('create', () => {
      it('should create an account and return it with generated id', async () => {
        const data = makeAccount();
        const account = await accountsRepo.create(data);

        expect(account).toBeDefined();
        expect(account.id).toBeDefined();
        expect(account.code).toBe(data.code);
        expect(account.name).toBe(data.name);
        expect(account.type).toBe(data.type);
        expect(account.tenantId).toBe(TEST_TENANT_ID);
        expect(Number(account.balance)).toBe(0);
        expect(account.isActive).toBe(true);
        expect(account.createdAt).toBeInstanceOf(Date);
        expect(account.updatedAt).toBeInstanceOf(Date);
      });

      it('should create an account with a parent reference', async () => {
        const parent = await accountsRepo.create(
          makeAccount({ name: 'Parent Account', code: randomCode('PARENT') }),
        );
        const child = await accountsRepo.create(
          makeAccount({ name: 'Child Account', code: randomCode('CHILD'), parentId: parent.id }),
        );

        expect(child.parentId).toBe(parent.id);
      });

      it('should create an account with non-default balance', async () => {
        const account = await accountsRepo.create(
          makeAccount({ name: 'Funded Account', balance: '15000.75' }),
        );
        expect(Number(account.balance)).toBe(15000.75);
      });
    });

    describe('findById', () => {
      it('should return an account by id', async () => {
        const created = await accountsRepo.create(
          makeAccount({ name: 'FindById Target', code: randomCode('FBYID') }),
        );
        const found = await accountsRepo.findById(created.id, TEST_TENANT_ID);

        expect(found).toBeDefined();
        expect(found!.id).toBe(created.id);
        expect(found!.name).toBe('FindById Target');
        expect(found!.code).toBe(created.code);
      });

      it('should return undefined for non-existent id', async () => {
        const found = await accountsRepo.findById(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(found).toBeUndefined();
      });

      it('should return undefined when tenant does not match', async () => {
        const created = await accountsRepo.create(
          makeAccount({ name: 'Tenant Isolation', code: randomCode('TISO') }),
        );
        const found = await accountsRepo.findById(created.id, OTHER_TENANT);
        expect(found).toBeUndefined();
      });

      it('should return undefined for soft-deleted account', async () => {
        const created = await accountsRepo.create(
          makeAccount({ name: 'Deleted Account', code: randomCode('DELACC') }),
        );
        await accountsRepo.delete(created.id, TEST_TENANT_ID);
        const found = await accountsRepo.findById(created.id, TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });
    });

    describe('findByCode', () => {
      it('should return an account by code', async () => {
        const data = makeAccount({ name: 'FindByCode Target', code: randomCode('FBCODE') });
        const created = await accountsRepo.create(data);
        const found = await accountsRepo.findByCode(data.code, TEST_TENANT_ID);

        expect(found).toBeDefined();
        expect(found!.id).toBe(created.id);
        expect(found!.code).toBe(data.code);
      });

      it('should return undefined for non-existent code', async () => {
        const found = await accountsRepo.findByCode('NO-SUCH-CODE', TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });

      it('should return undefined when tenant does not match', async () => {
        const data = makeAccount({ name: 'Code Tenant Check', code: randomCode('CISO') });
        await accountsRepo.create(data);
        const found = await accountsRepo.findByCode(data.code, OTHER_TENANT);
        expect(found).toBeUndefined();
      });

      it('should return undefined for soft-deleted account by code', async () => {
        const data = makeAccount({ name: 'Del By Code', code: randomCode('DELBC') });
        const created = await accountsRepo.create(data);
        await accountsRepo.delete(created.id, TEST_TENANT_ID);
        const found = await accountsRepo.findByCode(data.code, TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });
    });

    describe('findMany', () => {
      beforeAll(async () => {
        await accountsRepo.create(
          makeAccount({ name: 'Asset One', type: 'asset', code: randomCode('ASSET1') }),
        );
        await accountsRepo.create(
          makeAccount({ name: 'Asset Two', type: 'asset', code: randomCode('ASSET2') }),
        );
        await accountsRepo.create(
          makeAccount({ name: 'Liability One', type: 'liability', code: randomCode('LIAB1') }),
        );
        await accountsRepo.create(
          makeAccount({ name: 'Revenue One', type: 'revenue', code: randomCode('REV1') }),
        );
      });

      it('should return accounts with total count', async () => {
        const result = await accountsRepo.findMany(TEST_TENANT_ID);

        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.total).toBeGreaterThanOrEqual(4);
        expect(result.data.length).toBeLessThanOrEqual(50);
      });

      it('should filter by asset type', async () => {
        const result = await accountsRepo.findMany(TEST_TENANT_ID, { type: 'asset' });

        expect(result.data.length).toBeGreaterThanOrEqual(2);
        for (const a of result.data) {
          expect(a.type).toBe('asset');
        }
      });

      it('should filter by liability type', async () => {
        const result = await accountsRepo.findMany(TEST_TENANT_ID, { type: 'liability' });

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        for (const a of result.data) {
          expect(a.type).toBe('liability');
        }
      });

      it('should filter by revenue type', async () => {
        const result = await accountsRepo.findMany(TEST_TENANT_ID, { type: 'revenue' });

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        for (const a of result.data) {
          expect(a.type).toBe('revenue');
        }
      });

      it('should return empty for a type with no accounts', async () => {
        const result = await accountsRepo.findMany(TEST_TENANT_ID, { type: 'equity' });

        const allEquity = result.data.filter((a) => a.type === 'equity');
        expect(allEquity.length).toBe(0);
      });

      it('should paginate with limit', async () => {
        const result = await accountsRepo.findMany(TEST_TENANT_ID, { limit: 2 });

        expect(result.data.length).toBeLessThanOrEqual(2);
        expect(result.total).toBeGreaterThanOrEqual(4);
      });

      it('should paginate with offset', async () => {
        const page1 = await accountsRepo.findMany(TEST_TENANT_ID, { limit: 1, offset: 0 });
        const page2 = await accountsRepo.findMany(TEST_TENANT_ID, { limit: 1, offset: 1 });

        expect(page1.data.length).toBe(1);
        expect(page2.data.length).toBe(1);
        expect(page1.data[0]!.id).not.toBe(page2.data[0]!.id);
        expect(page1.total).toBe(page2.total);
      });

      it('should exclude soft-deleted accounts', async () => {
        const toDelete = await accountsRepo.create(
          makeAccount({ name: 'To Delete', code: randomCode('TODEL') }),
        );
        await accountsRepo.delete(toDelete.id, TEST_TENANT_ID);

        const result = await accountsRepo.findMany(TEST_TENANT_ID);
        const found = result.data.find((a) => a.id === toDelete.id);
        expect(found).toBeUndefined();
      });
    });

    describe('update', () => {
      it('should update account fields', async () => {
        const created = await accountsRepo.create(
          makeAccount({ name: 'Original Name', code: randomCode('UPD') }),
        );
        const updated = await accountsRepo.update(created.id, TEST_TENANT_ID, {
          name: 'Updated Name',
        });

        expect(updated.name).toBe('Updated Name');
        expect(updated.id).toBe(created.id);
        expect(updated.code).toBe(created.code);
      });

      it('should update the updatedAt timestamp', async () => {
        const created = await accountsRepo.create(
          makeAccount({ name: 'Timestamp Test', code: randomCode('TSTAMP') }),
        );
        await new Promise((r) => setTimeout(r, 10));
        const updated = await accountsRepo.update(created.id, TEST_TENANT_ID, {
          name: 'Timestamp Updated',
        });

        expect(updated.updatedAt).toBeInstanceOf(Date);
        expect(updated.name).toBe('Timestamp Updated');
      });

      it('should update the isActive flag', async () => {
        const created = await accountsRepo.create(
          makeAccount({ name: 'Active Test', code: randomCode('ACTIVE'), isActive: true }),
        );
        const updated = await accountsRepo.update(created.id, TEST_TENANT_ID, {
          isActive: false,
        });

        expect(updated.isActive).toBe(false);
      });
    });

    describe('delete', () => {
      it('should soft-delete an account (set deletedAt)', async () => {
        const created = await accountsRepo.create(
          makeAccount({ name: 'Soft Delete', code: randomCode('SD') }),
        );
        await accountsRepo.delete(created.id, TEST_TENANT_ID);

        const found = await accountsRepo.findById(created.id, TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });

      it('should not hard-delete the record from the database', async () => {
        const created = await accountsRepo.create(
          makeAccount({ name: 'Still In DB', code: randomCode('SIDB') }),
        );
        await accountsRepo.delete(created.id, TEST_TENANT_ID);

        const rows = await testDb
          .select()
          .from(accounts)
          .where(eq(accounts.id, created.id));
        expect(rows.length).toBe(1);
        expect(rows[0].deletedAt).not.toBeNull();
      });
    });

    describe('countByParentId', () => {
      it('should count child accounts for a parent', async () => {
        const parent = await accountsRepo.create(
          makeAccount({ name: 'Parent For Count', code: randomCode('PC') }),
        );
        await accountsRepo.create(
          makeAccount({ name: 'Child A', code: randomCode('CA'), parentId: parent.id }),
        );
        await accountsRepo.create(
          makeAccount({ name: 'Child B', code: randomCode('CB'), parentId: parent.id }),
        );

        const count = await accountsRepo.countByParentId(parent.id, TEST_TENANT_ID);
        expect(count).toBeGreaterThanOrEqual(2);
      });

      it('should return 0 when no children exist', async () => {
        const parent = await accountsRepo.create(
          makeAccount({ name: 'No Children', code: randomCode('NC') }),
        );
        const count = await accountsRepo.countByParentId(parent.id, TEST_TENANT_ID);
        expect(count).toBe(0);
      });

      it('should exclude soft-deleted children', async () => {
        const parent = await accountsRepo.create(
          makeAccount({ name: 'Parent Del Children', code: randomCode('PDC') }),
        );
        const child = await accountsRepo.create(
          makeAccount({ name: 'Deleted Child', code: randomCode('DC'), parentId: parent.id }),
        );
        await accountsRepo.delete(child.id, TEST_TENANT_ID);

        const count = await accountsRepo.countByParentId(parent.id, TEST_TENANT_ID);
        expect(count).toBe(0);
      });
    });

    describe('countLinesByAccountId', () => {
      it('should count journal entry lines for an account', async () => {
        const account = await accountsRepo.create(
          makeAccount({ name: 'Line Count Acct', code: randomCode('LCA') }),
        );
        const entry = await journalEntriesRepo.create(makeJournalEntry());

        await journalEntryLinesRepo.create(
          makeJournalEntryLine({
            journalEntryId: entry.id,
            accountId: account.id,
            debit: '100',
          }),
        );
        await journalEntryLinesRepo.create(
          makeJournalEntryLine({
            journalEntryId: entry.id,
            accountId: account.id,
            credit: '50',
          }),
        );

        const count = await accountsRepo.countLinesByAccountId(account.id, TEST_TENANT_ID);
        expect(count).toBeGreaterThanOrEqual(2);
      });

      it('should return 0 when no lines exist', async () => {
        const account = await accountsRepo.create(
          makeAccount({ name: 'Zero Lines Acct', code: randomCode('ZLA') }),
        );
        const count = await accountsRepo.countLinesByAccountId(account.id, TEST_TENANT_ID);
        expect(count).toBe(0);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // journalEntriesRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('journalEntriesRepo', () => {
    describe('create', () => {
      it('should create a journal entry and return it', async () => {
        const data = makeJournalEntry();
        const entry = await journalEntriesRepo.create(data);

        expect(entry).toBeDefined();
        expect(entry.id).toBeDefined();
        expect(entry.date).toBe('2026-01-15');
        expect(entry.description).toBe(data.description);
        expect(entry.status).toBe('draft');
        expect(entry.tenantId).toBe(TEST_TENANT_ID);
        expect(entry.createdBy).toBe(data.createdBy);
        expect(entry.createdAt).toBeInstanceOf(Date);
      });

      it('should create a journal entry with a reference number', async () => {
        const entry = await journalEntriesRepo.create(
          makeJournalEntry({ referenceNumber: 'JE-2026-0001' }),
        );
        expect(entry.referenceNumber).toBe('JE-2026-0001');
      });
    });

    describe('findById', () => {
      it('should return a journal entry by id', async () => {
        const created = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'FindById JE' }),
        );
        const found = await journalEntriesRepo.findById(created.id, TEST_TENANT_ID);

        expect(found).toBeDefined();
        expect(found!.id).toBe(created.id);
        expect(found!.description).toBe('FindById JE');
      });

      it('should return undefined for non-existent id', async () => {
        const found = await journalEntriesRepo.findById(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(found).toBeUndefined();
      });

      it('should return undefined when tenant does not match', async () => {
        const created = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Tenant Isolation JE' }),
        );
        const found = await journalEntriesRepo.findById(created.id, OTHER_TENANT);
        expect(found).toBeUndefined();
      });

      it('should return undefined for soft-deleted entry', async () => {
        const created = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Deleted JE' }),
        );
        await journalEntriesRepo.delete(created.id, TEST_TENANT_ID);
        const found = await journalEntriesRepo.findById(created.id, TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });
    });

    describe('findMany', () => {
      beforeAll(async () => {
        await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Draft JE 1', status: 'draft' }),
        );
        await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Draft JE 2', status: 'draft' }),
        );
        await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Posted JE 1', status: 'posted' }),
        );
      });

      it('should return journal entries with total', async () => {
        const result = await journalEntriesRepo.findMany(TEST_TENANT_ID);

        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.total).toBeGreaterThanOrEqual(3);
      });

      it('should filter by draft status', async () => {
        const result = await journalEntriesRepo.findMany(TEST_TENANT_ID, { status: 'draft' });

        expect(result.data.length).toBeGreaterThanOrEqual(2);
        for (const e of result.data) {
          expect(e.status).toBe('draft');
        }
      });

      it('should filter by posted status', async () => {
        const result = await journalEntriesRepo.findMany(TEST_TENANT_ID, { status: 'posted' });

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        for (const e of result.data) {
          expect(e.status).toBe('posted');
        }
      });

      it('should filter by voided status returning empty', async () => {
        const result = await journalEntriesRepo.findMany(TEST_TENANT_ID, { status: 'voided' });

        const voided = result.data.filter((e) => e.status === 'voided');
        expect(voided.length).toBe(0);
      });

      it('should paginate with limit', async () => {
        const result = await journalEntriesRepo.findMany(TEST_TENANT_ID, { limit: 2 });

        expect(result.data.length).toBeLessThanOrEqual(2);
        expect(result.total).toBeGreaterThanOrEqual(3);
      });

      it('should paginate with offset', async () => {
        await journalEntriesRepo.create(makeJournalEntry({ description: 'Page1 JE' }));
        await journalEntriesRepo.create(makeJournalEntry({ description: 'Page2 JE' }));
        const page1 = await journalEntriesRepo.findMany(TEST_TENANT_ID, { limit: 1, offset: 0 });
        const page2 = await journalEntriesRepo.findMany(TEST_TENANT_ID, { limit: 1, offset: 1 });

        expect(page1.data.length).toBe(1);
        expect(page2.data.length).toBe(1);
        expect(page1.data[0]!.id).not.toBe(page2.data[0]!.id);
      });

      it('should exclude soft-deleted entries', async () => {
        const toDelete = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'To Delete JE' }),
        );
        await journalEntriesRepo.delete(toDelete.id, TEST_TENANT_ID);

        const result = await journalEntriesRepo.findMany(TEST_TENANT_ID);
        const found = result.data.find((e) => e.id === toDelete.id);
        expect(found).toBeUndefined();
      });
    });

    describe('update', () => {
      it('should update journal entry fields', async () => {
        const created = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Original JE' }),
        );
        const updated = await journalEntriesRepo.update(created.id, TEST_TENANT_ID, {
          description: 'Updated JE',
        });

        expect(updated.description).toBe('Updated JE');
        expect(updated.id).toBe(created.id);
      });

      it('should update the updatedAt timestamp', async () => {
        const created = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'TS JE' }),
        );
        await new Promise((r) => setTimeout(r, 10));
        const updated = await journalEntriesRepo.update(created.id, TEST_TENANT_ID, {
          description: 'TS Updated',
        });

        expect(updated.updatedAt).toBeInstanceOf(Date);
        expect(updated.description).toBe('TS Updated');
      });

      it('should update status from draft to posted', async () => {
        const created = await journalEntriesRepo.create(
          makeJournalEntry({ status: 'draft' }),
        );
        const updated = await journalEntriesRepo.update(created.id, TEST_TENANT_ID, {
          status: 'posted',
        });

        expect(updated.status).toBe('posted');
      });
    });

    describe('delete', () => {
      it('should soft-delete a journal entry', async () => {
        const created = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Delete JE' }),
        );
        await journalEntriesRepo.delete(created.id, TEST_TENANT_ID);

        const found = await journalEntriesRepo.findById(created.id, TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });

      it('should keep the record in DB with deletedAt set', async () => {
        const created = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Del Verify JE' }),
        );
        await journalEntriesRepo.delete(created.id, TEST_TENANT_ID);

        const rows = await testDb
          .select()
          .from(journalEntries)
          .where(eq(journalEntries.id, created.id));
        expect(rows.length).toBe(1);
        expect(rows[0].deletedAt).not.toBeNull();
      });
    });

    describe('getTotalDebits', () => {
      it('should sum debit amounts for a journal entry', async () => {
        const entry = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Debit Sum JE' }),
        );
        const account = await accountsRepo.create(
          makeAccount({ name: 'Debit Acct', code: randomCode('DBACCT') }),
        );

        await journalEntryLinesRepo.create(
          makeJournalEntryLine({
            journalEntryId: entry.id,
            accountId: account.id,
            debit: '100.50',
            credit: '0',
          }),
        );
        await journalEntryLinesRepo.create(
          makeJournalEntryLine({
            journalEntryId: entry.id,
            accountId: account.id,
            debit: '250.25',
            credit: '0',
          }),
        );

        const total = await journalEntriesRepo.getTotalDebits(entry.id, TEST_TENANT_ID);
        expect(Number(total)).toBeCloseTo(350.75, 2);
      });

      it('should return "0" when no lines exist', async () => {
        const entry = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'No Lines JE' }),
        );
        const total = await journalEntriesRepo.getTotalDebits(entry.id, TEST_TENANT_ID);
        expect(Number(total)).toBe(0);
      });

      it('should only sum debits for the specified entry', async () => {
        const account = await accountsRepo.create(
          makeAccount({ name: 'Isolation Acct', code: randomCode('ISOACCT') }),
        );
        const entry1 = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Entry 1 for isolation' }),
        );
        const entry2 = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Entry 2 for isolation' }),
        );

        await journalEntryLinesRepo.create(
          makeJournalEntryLine({
            journalEntryId: entry1.id,
            accountId: account.id,
            debit: '100',
            credit: '0',
          }),
        );
        await journalEntryLinesRepo.create(
          makeJournalEntryLine({
            journalEntryId: entry2.id,
            accountId: account.id,
            debit: '200',
            credit: '0',
          }),
        );

        const total1 = await journalEntriesRepo.getTotalDebits(entry1.id, TEST_TENANT_ID);
        expect(Number(total1)).toBe(100);
      });
    });

    describe('getTotalCredits', () => {
      it('should sum credit amounts for a journal entry', async () => {
        const entry = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Credit Sum JE' }),
        );
        const account = await accountsRepo.create(
          makeAccount({ name: 'Credit Acct', code: randomCode('CRACCT') }),
        );

        await journalEntryLinesRepo.create(
          makeJournalEntryLine({
            journalEntryId: entry.id,
            accountId: account.id,
            debit: '0',
            credit: '500.00',
          }),
        );
        await journalEntryLinesRepo.create(
          makeJournalEntryLine({
            journalEntryId: entry.id,
            accountId: account.id,
            debit: '0',
            credit: '125.75',
          }),
        );

        const total = await journalEntriesRepo.getTotalCredits(entry.id, TEST_TENANT_ID);
        expect(Number(total)).toBeCloseTo(625.75, 2);
      });

      it('should return "0" when no lines exist', async () => {
        const entry = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'No Credits JE' }),
        );
        const total = await journalEntriesRepo.getTotalCredits(entry.id, TEST_TENANT_ID);
        expect(Number(total)).toBe(0);
      });

      it('should only sum credits for the specified entry', async () => {
        const account = await accountsRepo.create(
          makeAccount({ name: 'Credit Iso Acct', code: randomCode('CRISO') }),
        );
        const entry1 = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Credit Entry 1' }),
        );
        const entry2 = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Credit Entry 2' }),
        );

        await journalEntryLinesRepo.create(
          makeJournalEntryLine({
            journalEntryId: entry1.id,
            accountId: account.id,
            debit: '0',
            credit: '300',
          }),
        );
        await journalEntryLinesRepo.create(
          makeJournalEntryLine({
            journalEntryId: entry2.id,
            accountId: account.id,
            debit: '0',
            credit: '700',
          }),
        );

        const total1 = await journalEntriesRepo.getTotalCredits(entry1.id, TEST_TENANT_ID);
        expect(Number(total1)).toBe(300);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // journalEntryLinesRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('journalEntryLinesRepo', () => {
    describe('create', () => {
      it('should create a journal entry line', async () => {
        const entry = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Line Create JE' }),
        );
        const account = await accountsRepo.create(
          makeAccount({ name: 'Line Acct', code: randomCode('LINEACCT') }),
        );

        const line = await journalEntryLinesRepo.create({
          tenantId: TEST_TENANT_ID,
          journalEntryId: entry.id,
          accountId: account.id,
          debit: '100.00',
          credit: '0',
          description: 'Debit line',
        });

        expect(line).toBeDefined();
        expect(line.id).toBeDefined();
        expect(line.journalEntryId).toBe(entry.id);
        expect(line.accountId).toBe(account.id);
        expect(Number(line.debit)).toBe(100);
        expect(Number(line.credit)).toBe(0);
        expect(line.description).toBe('Debit line');
        expect(line.tenantId).toBe(TEST_TENANT_ID);
      });

      it('should create a credit line', async () => {
        const entry = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Credit Line JE' }),
        );
        const account = await accountsRepo.create(
          makeAccount({ name: 'Credit Line Acct', code: randomCode('CLACCT') }),
        );

        const line = await journalEntryLinesRepo.create({
          tenantId: TEST_TENANT_ID,
          journalEntryId: entry.id,
          accountId: account.id,
          debit: '0',
          credit: '250.00',
        });

        expect(Number(line.debit)).toBe(0);
        expect(Number(line.credit)).toBe(250);
      });
    });

    describe('createMany', () => {
      it('should create multiple lines at once', async () => {
        const entry = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Bulk Lines JE' }),
        );
        const account = await accountsRepo.create(
          makeAccount({ name: 'Bulk Acct', code: randomCode('BLKACCT') }),
        );

        const lines = await journalEntryLinesRepo.createMany([
          {
            tenantId: TEST_TENANT_ID,
            journalEntryId: entry.id,
            accountId: account.id,
            debit: '50',
            credit: '0',
          },
          {
            tenantId: TEST_TENANT_ID,
            journalEntryId: entry.id,
            accountId: account.id,
            debit: '0',
            credit: '50',
          },
        ]);

        expect(lines).toHaveLength(2);
        expect(lines[0]!.id).toBeDefined();
        expect(lines[1]!.id).toBeDefined();
        expect(lines[0]!.id).not.toBe(lines[1]!.id);
      });
    });

    describe('findByJournalEntryId', () => {
      it('should return all lines for a journal entry', async () => {
        const entry = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Find Lines JE' }),
        );
        const account = await accountsRepo.create(
          makeAccount({ name: 'Find Lines Acct', code: randomCode('FLACCT') }),
        );

        await journalEntryLinesRepo.createMany([
          {
            tenantId: TEST_TENANT_ID,
            journalEntryId: entry.id,
            accountId: account.id,
            debit: '100',
            credit: '0',
          },
          {
            tenantId: TEST_TENANT_ID,
            journalEntryId: entry.id,
            accountId: account.id,
            debit: '0',
            credit: '100',
          },
        ]);

        const lines = await journalEntryLinesRepo.findByJournalEntryId(
          entry.id,
          TEST_TENANT_ID,
        );
        expect(lines.length).toBe(2);
        expect(lines[0]!.journalEntryId).toBe(entry.id);
        expect(lines[1]!.journalEntryId).toBe(entry.id);
      });

      it('should return empty for non-existent journal entry', async () => {
        const lines = await journalEntryLinesRepo.findByJournalEntryId(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(lines).toHaveLength(0);
      });

      it('should return empty when tenant does not match', async () => {
        const entry = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Line Tenant JE' }),
        );
        const account = await accountsRepo.create(
          makeAccount({ name: 'Line Tenant Acct', code: randomCode('LTACCT') }),
        );
        await journalEntryLinesRepo.create({
          tenantId: TEST_TENANT_ID,
          journalEntryId: entry.id,
          accountId: account.id,
          debit: '100',
          credit: '0',
        });

        const lines = await journalEntryLinesRepo.findByJournalEntryId(
          entry.id,
          OTHER_TENANT,
        );
        expect(lines).toHaveLength(0);
      });

      it('should exclude soft-deleted lines', async () => {
        const entry = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Del Lines JE' }),
        );
        const account = await accountsRepo.create(
          makeAccount({ name: 'Del Lines Acct', code: randomCode('DLACCT') }),
        );
        await journalEntryLinesRepo.create({
          tenantId: TEST_TENANT_ID,
          journalEntryId: entry.id,
          accountId: account.id,
          debit: '100',
          credit: '0',
        });

        await journalEntryLinesRepo.deleteByJournalEntryId(entry.id, TEST_TENANT_ID);

        const lines = await journalEntryLinesRepo.findByJournalEntryId(
          entry.id,
          TEST_TENANT_ID,
        );
        expect(lines).toHaveLength(0);
      });
    });

    describe('deleteByJournalEntryId', () => {
      it('should soft-delete all lines for a journal entry', async () => {
        const entry = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Delete Lines JE' }),
        );
        const account = await accountsRepo.create(
          makeAccount({ name: 'Del All Lines Acct', code: randomCode('DLLACCT') }),
        );
        await journalEntryLinesRepo.createMany([
          {
            tenantId: TEST_TENANT_ID,
            journalEntryId: entry.id,
            accountId: account.id,
            debit: '100',
            credit: '0',
          },
          {
            tenantId: TEST_TENANT_ID,
            journalEntryId: entry.id,
            accountId: account.id,
            debit: '0',
            credit: '100',
          },
        ]);

        await journalEntryLinesRepo.deleteByJournalEntryId(entry.id, TEST_TENANT_ID);

        const lines = await journalEntryLinesRepo.findByJournalEntryId(
          entry.id,
          TEST_TENANT_ID,
        );
        expect(lines).toHaveLength(0);
      });

      it('should only delete lines for the specified entry', async () => {
        const entry1 = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Selective Del JE 1' }),
        );
        const entry2 = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Selective Del JE 2' }),
        );
        const account = await accountsRepo.create(
          makeAccount({ name: 'Selective Acct', code: randomCode('SELACCT') }),
        );

        await journalEntryLinesRepo.create({
          tenantId: TEST_TENANT_ID,
          journalEntryId: entry1.id,
          accountId: account.id,
          debit: '100',
          credit: '0',
        });
        await journalEntryLinesRepo.create({
          tenantId: TEST_TENANT_ID,
          journalEntryId: entry2.id,
          accountId: account.id,
          debit: '50',
          credit: '0',
        });

        await journalEntryLinesRepo.deleteByJournalEntryId(entry1.id, TEST_TENANT_ID);

        const entry1Lines = await journalEntryLinesRepo.findByJournalEntryId(
          entry1.id,
          TEST_TENANT_ID,
        );
        const entry2Lines = await journalEntryLinesRepo.findByJournalEntryId(
          entry2.id,
          TEST_TENANT_ID,
        );

        expect(entry1Lines).toHaveLength(0);
        expect(entry2Lines).toHaveLength(1);
      });

      it('should keep records in DB with deletedAt set', async () => {
        const entry = await journalEntriesRepo.create(
          makeJournalEntry({ description: 'Del Verify Lines JE' }),
        );
        const account = await accountsRepo.create(
          makeAccount({ name: 'Del Verify Acct', code: randomCode('DVACCT') }),
        );
        const line = await journalEntryLinesRepo.create({
          tenantId: TEST_TENANT_ID,
          journalEntryId: entry.id,
          accountId: account.id,
          debit: '100',
          credit: '0',
        });

        await journalEntryLinesRepo.deleteByJournalEntryId(entry.id, TEST_TENANT_ID);

        const rows = await testDb
          .select()
          .from(journalEntryLines)
          .where(eq(journalEntryLines.id, line.id));
        expect(rows.length).toBe(1);
        expect(rows[0].deletedAt).not.toBeNull();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // fiscalYearsRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('fiscalYearsRepo', () => {
    describe('create', () => {
      it('should create a fiscal year and return it', async () => {
        const data = makeFiscalYear({ name: 'FY 2025' });
        const fy = await fiscalYearsRepo.create(data);

        expect(fy).toBeDefined();
        expect(fy.id).toBeDefined();
        expect(fy.name).toBe('FY 2025');
        expect(fy.status).toBe('open');
        expect(fy.tenantId).toBe(TEST_TENANT_ID);
        expect(fy.startDate).toBeInstanceOf(Date);
        expect(fy.endDate).toBeInstanceOf(Date);
      });

      it('should create a closed fiscal year', async () => {
        const fy = await fiscalYearsRepo.create(
          makeFiscalYear({
            name: 'Closed FY',
            status: 'closed',
            startDate: new Date('2024-01-01T00:00:00Z'),
            endDate: new Date('2024-12-31T23:59:59Z'),
          }),
        );
        expect(fy.status).toBe('closed');
      });
    });

    describe('findById', () => {
      it('should return a fiscal year by id', async () => {
        const created = await fiscalYearsRepo.create(
          makeFiscalYear({ name: 'FindById FY' }),
        );
        const found = await fiscalYearsRepo.findById(created.id, TEST_TENANT_ID);

        expect(found).toBeDefined();
        expect(found!.id).toBe(created.id);
        expect(found!.name).toBe('FindById FY');
      });

      it('should return undefined for non-existent id', async () => {
        const found = await fiscalYearsRepo.findById(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(found).toBeUndefined();
      });

      it('should return undefined when tenant does not match', async () => {
        const created = await fiscalYearsRepo.create(
          makeFiscalYear({ name: 'Tenant Iso FY' }),
        );
        const found = await fiscalYearsRepo.findById(created.id, OTHER_TENANT);
        expect(found).toBeUndefined();
      });

      it('should return undefined for soft-deleted fiscal year', async () => {
        const created = await fiscalYearsRepo.create(
          makeFiscalYear({ name: 'Deleted FY' }),
        );
        await fiscalYearsRepo.delete(created.id, TEST_TENANT_ID);
        const found = await fiscalYearsRepo.findById(created.id, TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });
    });

    describe('findMany', () => {
      beforeAll(async () => {
        await fiscalYearsRepo.create(
          makeFiscalYear({
            name: 'FindMany Open FY',
            status: 'open',
            startDate: new Date('2023-01-01T00:00:00Z'),
            endDate: new Date('2023-12-31T23:59:59Z'),
          }),
        );
        await fiscalYearsRepo.create(
          makeFiscalYear({
            name: 'FindMany Closed FY',
            status: 'closed',
            startDate: new Date('2022-01-01T00:00:00Z'),
            endDate: new Date('2022-12-31T23:59:59Z'),
          }),
        );
      });

      it('should return fiscal years with total', async () => {
        const result = await fiscalYearsRepo.findMany(TEST_TENANT_ID);

        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.total).toBeGreaterThanOrEqual(2);
      });

      it('should filter by status', async () => {
        const result = await fiscalYearsRepo.findMany(TEST_TENANT_ID, { status: 'closed' });

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        for (const fy of result.data) {
          expect(fy.status).toBe('closed');
        }
      });

      it('should paginate with limit', async () => {
        const result = await fiscalYearsRepo.findMany(TEST_TENANT_ID, { limit: 1 });

        expect(result.data.length).toBeLessThanOrEqual(1);
        expect(result.total).toBeGreaterThanOrEqual(2);
      });

      it('should paginate with offset', async () => {
        const page1 = await fiscalYearsRepo.findMany(TEST_TENANT_ID, { limit: 1, offset: 0 });
        const page2 = await fiscalYearsRepo.findMany(TEST_TENANT_ID, { limit: 1, offset: 1 });

        expect(page1.data.length).toBe(1);
        expect(page1.data[0]!.id).not.toBe(page2.data[0]!.id);
        expect(page1.total).toBe(page2.total);
      });
    });

    describe('update', () => {
      it('should update fiscal year fields', async () => {
        const created = await fiscalYearsRepo.create(
          makeFiscalYear({ name: 'Original FY' }),
        );
        const updated = await fiscalYearsRepo.update(created.id, TEST_TENANT_ID, {
          name: 'Updated FY',
        });

        expect(updated.name).toBe('Updated FY');
        expect(updated.id).toBe(created.id);
      });

      it('should update status from open to closed', async () => {
        const created = await fiscalYearsRepo.create(
          makeFiscalYear({
            name: 'Close Me FY',
            status: 'open',
            startDate: new Date('2021-01-01T00:00:00Z'),
            endDate: new Date('2021-12-31T23:59:59Z'),
          }),
        );
        const updated = await fiscalYearsRepo.update(created.id, TEST_TENANT_ID, {
          status: 'closed',
        });

        expect(updated.status).toBe('closed');
      });

      it('should update the updatedAt timestamp', async () => {
        const created = await fiscalYearsRepo.create(
          makeFiscalYear({ name: 'TS FY' }),
        );
        await new Promise((r) => setTimeout(r, 10));
        const updated = await fiscalYearsRepo.update(created.id, TEST_TENANT_ID, {
          name: 'TS Updated FY',
        });

        expect(updated.updatedAt).toBeInstanceOf(Date);
        expect(updated.name).toBe('TS Updated FY');
      });
    });

    describe('delete', () => {
      it('should soft-delete a fiscal year', async () => {
        const created = await fiscalYearsRepo.create(
          makeFiscalYear({ name: 'Delete FY' }),
        );
        await fiscalYearsRepo.delete(created.id, TEST_TENANT_ID);

        const found = await fiscalYearsRepo.findById(created.id, TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });

      it('should keep record in DB with deletedAt set', async () => {
        const created = await fiscalYearsRepo.create(
          makeFiscalYear({ name: 'Del Verify FY' }),
        );
        await fiscalYearsRepo.delete(created.id, TEST_TENANT_ID);

        const rows = await testDb
          .select()
          .from(fiscalYears)
          .where(eq(fiscalYears.id, created.id));
        expect(rows.length).toBe(1);
        expect(rows[0].deletedAt).not.toBeNull();
      });
    });

    describe('hasOverlap', () => {
      it('should detect overlapping date ranges', async () => {
        // Create FY covering 2020
        await fiscalYearsRepo.create(
          makeFiscalYear({
            name: 'FY 2020',
            startDate: new Date('2020-01-01T00:00:00Z'),
            endDate: new Date('2020-12-31T23:59:59Z'),
          }),
        );

        // Query overlapping range (mid-2020)
        const overlap = await fiscalYearsRepo.hasOverlap(
          new Date('2020-06-01T00:00:00Z'),
          new Date('2020-12-31T23:59:59Z'),
          TEST_TENANT_ID,
        );
        expect(overlap).toBe(true);
      });

      it('should return false for non-overlapping ranges', async () => {
        // All existing FYs don't cover 2030
        const noOverlap = await fiscalYearsRepo.hasOverlap(
          new Date('2030-01-01T00:00:00Z'),
          new Date('2030-12-31T23:59:59Z'),
          TEST_TENANT_ID,
        );
        expect(noOverlap).toBe(false);
      });

      it('should detect adjacent but not overlapping ranges', async () => {
        // Create FY ending 2091-12-31 (using far-future year to avoid test pollution)
        await fiscalYearsRepo.create(
          makeFiscalYear({
            name: 'FY 2091',
            startDate: new Date('2091-01-01T00:00:00Z'),
            endDate: new Date('2091-12-31T23:59:59Z'),
          }),
        );

        // Query range starting 2092-01-01 - should NOT overlap with 2091
        const adjacent = await fiscalYearsRepo.hasOverlap(
          new Date('2092-01-01T00:00:00Z'),
          new Date('2092-06-30T23:59:59Z'),
          TEST_TENANT_ID,
        );
        expect(adjacent).toBe(false);
      });

      it('should exclude a specific id when checking overlap', async () => {
        // Create FY covering 2018
        const fy2018 = await fiscalYearsRepo.create(
          makeFiscalYear({
            name: 'FY 2018',
            startDate: new Date('2018-01-01T00:00:00Z'),
            endDate: new Date('2018-12-31T23:59:59Z'),
          }),
        );

        // Query overlapping range but exclude this FY
        const overlap = await fiscalYearsRepo.hasOverlap(
          new Date('2018-06-01T00:00:00Z'),
          new Date('2018-12-31T23:59:59Z'),
          TEST_TENANT_ID,
          fy2018.id,
        );
        expect(overlap).toBe(false);
      });

      it('should detect overlap with fully contained ranges', async () => {
        // Create FY 2017 to ensure overlap exists
        await fiscalYearsRepo.create(
          makeFiscalYear({
            name: 'FY 2017',
            startDate: new Date('2017-01-01T00:00:00Z'),
            endDate: new Date('2017-12-31T23:59:59Z'),
          }),
        );

        // New range: 2017-03-01 to 2017-09-30 (fully inside existing FY 2017)
        const overlap = await fiscalYearsRepo.hasOverlap(
          new Date('2017-03-01T00:00:00Z'),
          new Date('2017-09-30T23:59:59Z'),
          TEST_TENANT_ID,
        );
        expect(overlap).toBe(true);
      });

      it('should detect overlap when new range fully contains existing', async () => {
        // Existing FY: 2016-01-01 to 2016-12-31
        // New range: 2015-01-01 to 2017-12-31 (fully contains existing)
        await fiscalYearsRepo.create(
          makeFiscalYear({
            name: 'FY 2016',
            startDate: new Date('2016-01-01T00:00:00Z'),
            endDate: new Date('2016-12-31T23:59:59Z'),
          }),
        );

        const overlap = await fiscalYearsRepo.hasOverlap(
          new Date('2015-01-01T00:00:00Z'),
          new Date('2017-12-31T23:59:59Z'),
          TEST_TENANT_ID,
        );
        expect(overlap).toBe(true);
      });

      it('should not consider soft-deleted fiscal years for overlap', async () => {
        const fy = await fiscalYearsRepo.create(
          makeFiscalYear({
            name: 'Overlap Delete FY',
            startDate: new Date('2015-01-01T00:00:00Z'),
            endDate: new Date('2015-12-31T23:59:59Z'),
          }),
        );
        await fiscalYearsRepo.delete(fy.id, TEST_TENANT_ID);

        const overlap = await fiscalYearsRepo.hasOverlap(
          new Date('2015-06-01T00:00:00Z'),
          new Date('2015-12-31T23:59:59Z'),
          TEST_TENANT_ID,
        );
        expect(overlap).toBe(false);
      });
    });

    describe('isDateInClosedPeriod', () => {
      beforeAll(async () => {
        // Create a closed fiscal year for 2019
        await fiscalYearsRepo.create(
          makeFiscalYear({
            name: 'Closed 2019',
            status: 'closed',
            startDate: new Date('2019-01-01T00:00:00Z'),
            endDate: new Date('2019-12-31T23:59:59Z'),
          }),
        );

        // Create an open fiscal year for 2023
        await fiscalYearsRepo.create(
          makeFiscalYear({
            name: 'Open 2023',
            status: 'open',
            startDate: new Date('2023-01-01T00:00:00Z'),
            endDate: new Date('2023-12-31T23:59:59Z'),
          }),
        );
      });

      it('should return true for a date in a closed period', async () => {
        const result = await fiscalYearsRepo.isDateInClosedPeriod(
          '2019-06-15T00:00:00Z',
          TEST_TENANT_ID,
        );
        expect(result).toBe(true);
      });

      it('should return true for first day of closed period', async () => {
        const result = await fiscalYearsRepo.isDateInClosedPeriod(
          '2019-01-01T00:00:00Z',
          TEST_TENANT_ID,
        );
        expect(result).toBe(true);
      });

      it('should return true for last day of closed period', async () => {
        const result = await fiscalYearsRepo.isDateInClosedPeriod(
          '2019-12-31T23:59:59Z',
          TEST_TENANT_ID,
        );
        expect(result).toBe(true);
      });

      it('should return false for a date in an open period', async () => {
        const result = await fiscalYearsRepo.isDateInClosedPeriod(
          '2023-06-15T00:00:00Z',
          TEST_TENANT_ID,
        );
        expect(result).toBe(false);
      });

      it('should return false for a date outside any fiscal year', async () => {
        const result = await fiscalYearsRepo.isDateInClosedPeriod(
          '2050-06-15T00:00:00Z',
          TEST_TENANT_ID,
        );
        expect(result).toBe(false);
      });

      it('should not consider soft-deleted fiscal years', async () => {
        const fy = await fiscalYearsRepo.create(
          makeFiscalYear({
            name: 'Closed 2018',
            status: 'closed',
            startDate: new Date('2018-01-01T00:00:00Z'),
            endDate: new Date('2018-12-31T23:59:59Z'),
          }),
        );
        await fiscalYearsRepo.delete(fy.id, TEST_TENANT_ID);

        const result = await fiscalYearsRepo.isDateInClosedPeriod(
          '2018-06-15T00:00:00Z',
          TEST_TENANT_ID,
        );
        expect(result).toBe(false);
      });

      it('should not consider other tenants closed periods', async () => {
        const result = await fiscalYearsRepo.isDateInClosedPeriod(
          '2019-06-15T00:00:00Z',
          OTHER_TENANT,
        );
        expect(result).toBe(false);
      });
    });
  });
});
