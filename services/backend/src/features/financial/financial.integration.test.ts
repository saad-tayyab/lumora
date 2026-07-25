import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { accounts, journalEntries, journalEntryLines } from '@lumora/database/schema';

vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class MockSQLDatabase {
    connectionString: string;
    constructor(_name: string, _opts?: unknown) {
      this.connectionString = process.env.DATABASE_URL ?? '';
    }
  },
}));

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    constructor(_code: string, message: string, _opts?: unknown) {
      super(message);
      this.name = 'APIError';
    }
  },
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));

vi.mock('encore.dev/pubsub', () => ({
  Topic: class MockTopic {
    constructor(_name: string, _opts?: unknown) {}
    async publish(_msg: unknown) {
      return 'msg';
    }
  },
}));

vi.mock('./events', () => ({
  journalEntryPosted: { publish: vi.fn().mockResolvedValue('msg') },
}));

import { db } from '../../database';
import { TEST_TENANT_ID, TEST_USER_ID, cleanupTestData, randomCode } from '../../lib/integration-test-utils';
import * as service from './service';

const testDb = db;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeAccount(overrides?: Partial<Parameters<typeof service.createAccount>[0]>) {
  return {
    code: randomCode('ACCT'),
    name: 'Test Account',
    type: 'asset' as const,
    isActive: true,
    ...overrides,
  };
}

function makeFiscalYearRequest(overrides?: Partial<Parameters<typeof service.createFiscalYear>[0]>) {
  return {
    name: `FY ${Date.now()}`,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    ...overrides,
  };
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Financial Service - Integration Tests', () => {
  beforeAll(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Account Lifecycle
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Account Lifecycle', () => {
    it('should create an account and return it with generated id', async () => {
      const data = makeAccount({ name: 'Cash Account', code: 'CA-1000' });
      const account = await service.createAccount(data, TEST_TENANT_ID);

      expect(account).toBeDefined();
      expect(account.id).toBeDefined();
      expect(account.code).toBe('CA-1000');
      expect(account.name).toBe('Cash Account');
      expect(account.type).toBe('asset');
      expect(account.balance).toBe('0');
      expect(account.tenantId).toBe(TEST_TENANT_ID);

      const row = await testDb
        .select()
        .from(accounts)
        .where(eq(accounts.id, account.id));
      expect(row.length).toBe(1);
      expect(row[0]!.code).toBe('CA-1000');
    });

    it('should retrieve an account by id', async () => {
      const created = await service.createAccount(
        makeAccount({ name: 'Retrievable', code: randomCode('RET') }),
        TEST_TENANT_ID,
      );
      const found = await service.getAccount(created.id, TEST_TENANT_ID);
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('Retrievable');
    });

    it('should throw AccountNotFoundError for non-existent account', async () => {
      await expect(
        service.getAccount('00000000-0000-0000-0000-000000000000', TEST_TENANT_ID),
      ).rejects.toThrow('not found');
    });

    it('should update an account name', async () => {
      const created = await service.createAccount(
        makeAccount({ name: 'Original', code: randomCode('UPD') }),
        TEST_TENANT_ID,
      );
      const updated = await service.updateAccount(
        created.id,
        { name: 'Updated Name' },
        TEST_TENANT_ID,
      );
      expect(updated.name).toBe('Updated Name');
      expect(updated.id).toBe(created.id);

      const row = await testDb
        .select()
        .from(accounts)
        .where(eq(accounts.id, created.id));
      expect(row[0]!.name).toBe('Updated Name');
    });

    it('should soft-delete an account and make it unfindable', async () => {
      const created = await service.createAccount(
        makeAccount({ name: 'To Delete', code: randomCode('DEL') }),
        TEST_TENANT_ID,
      );
      await service.deleteAccount(created.id, TEST_TENANT_ID);

      await expect(
        service.getAccount(created.id, TEST_TENANT_ID),
      ).rejects.toThrow('not found');

      const row = await testDb
        .select()
        .from(accounts)
        .where(eq(accounts.id, created.id));
      expect(row.length).toBe(1);
      expect(row[0]!.deletedAt).not.toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Account Code Uniqueness
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Account Code Uniqueness', () => {
    it('should throw when creating an account with a duplicate code', async () => {
      const code = randomCode('DUP');
      await service.createAccount(makeAccount({ name: 'First', code }), TEST_TENANT_ID);

      await expect(
        service.createAccount(makeAccount({ name: 'Second', code }), TEST_TENANT_ID),
      ).rejects.toThrow('already exists');
    });

    it('should allow updating account name without code conflict', async () => {
      const code1 = randomCode('UPDDUP1');
      const code2 = randomCode('UPDDUP2');
      await service.createAccount(makeAccount({ name: 'Existing', code: code1 }), TEST_TENANT_ID);
      const acct2 = await service.createAccount(makeAccount({ name: 'Target', code: code2 }), TEST_TENANT_ID);

      const updated = await service.updateAccount(acct2.id, { name: 'New Name' }, TEST_TENANT_ID);
      expect(updated.name).toBe('New Name');
      expect(updated.code).toBe(code2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Account with Children
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Account with Children', () => {
    it('should prevent deleting an account that has child accounts', async () => {
      const parent = await service.createAccount(
        makeAccount({ name: 'Parent', code: randomCode('PAR') }),
        TEST_TENANT_ID,
      );
      await service.createAccount(
        makeAccount({ name: 'Child', code: randomCode('CHI'), parentId: parent.id }),
        TEST_TENANT_ID,
      );

      await expect(
        service.deleteAccount(parent.id, TEST_TENANT_ID),
      ).rejects.toThrow('child accounts');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Journal Entry Creation
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Journal Entry Creation', () => {
    it('should create a balanced journal entry with lines', async () => {
      const debitAccount = await service.createAccount(
        makeAccount({ name: 'Debit Acct', code: randomCode('DEB') }),
        TEST_TENANT_ID,
      );
      const creditAccount = await service.createAccount(
        makeAccount({ name: 'Credit Acct', code: randomCode('CRE') }),
        TEST_TENANT_ID,
      );

      const entry = await service.createJournalEntry(
        {
          date: '2026-03-15',
          description: 'Integration test entry',
          referenceNumber: 'REF-001',
          lines: [
            { accountId: debitAccount.id, debit: '500.00', credit: '0' },
            { accountId: creditAccount.id, debit: '0', credit: '500.00' },
          ],
        },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.status).toBe('draft');
      expect(entry.description).toBe('Integration test entry');
      expect(entry.lines).toHaveLength(2);

      const dbEntry = await testDb
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, entry.id));
      expect(dbEntry.length).toBe(1);
      expect(dbEntry[0]!.status).toBe('draft');

      const dbLines = await testDb
        .select()
        .from(journalEntryLines)
        .where(eq(journalEntryLines.journalEntryId, entry.id));
      expect(dbLines.length).toBe(2);
    });

    it('should throw JournalEntryNotBalancedError for unbalanced entry', async () => {
      const acct1 = await service.createAccount(
        makeAccount({ name: 'A1', code: randomCode('A1') }),
        TEST_TENANT_ID,
      );
      const acct2 = await service.createAccount(
        makeAccount({ name: 'A2', code: randomCode('A2') }),
        TEST_TENANT_ID,
      );

      await expect(
        service.createJournalEntry(
          {
            date: '2026-03-15',
            description: 'Unbalanced',
            lines: [
              { accountId: acct1.id, debit: '500.00', credit: '0' },
              { accountId: acct2.id, debit: '0', credit: '300.00' },
            ],
          },
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('not balanced');
    });

    it('should verify account defaults to zero balance on creation', async () => {
      const acct = await service.createAccount(
        makeAccount({ name: 'Zero Bal', code: randomCode('ZB') }),
        TEST_TENANT_ID,
      );
      const fetched = await service.getAccount(acct.id, TEST_TENANT_ID);
      expect(fetched.balance).toBe('0');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Journal Entry Posting
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Journal Entry Posting', () => {
    it('should post a draft journal entry and update status + account balances', async () => {
      const debitAcct = await service.createAccount(
        makeAccount({ name: 'Post Debit', code: randomCode('PDEB') }),
        TEST_TENANT_ID,
      );
      const creditAcct = await service.createAccount(
        makeAccount({ name: 'Post Credit', code: randomCode('PCRE') }),
        TEST_TENANT_ID,
      );

      const entry = await service.createJournalEntry(
        {
          date: '2026-04-01',
          description: 'Post test',
          lines: [
            { accountId: debitAcct.id, debit: '1000.00', credit: '0' },
            { accountId: creditAcct.id, debit: '0', credit: '1000.00' },
          ],
        },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );
      expect(entry.status).toBe('draft');

      const posted = await service.postJournalEntry(entry.id, TEST_TENANT_ID, TEST_USER_ID);
      expect(posted.status).toBe('posted');

      const dbEntry = await testDb
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, entry.id));
      expect(dbEntry[0]!.status).toBe('posted');

      const dbDebit = await service.getAccount(debitAcct.id, TEST_TENANT_ID);
      expect(Number(dbDebit.balance)).toBe(1000);

      const dbCredit = await service.getAccount(creditAcct.id, TEST_TENANT_ID);
      expect(Number(dbCredit.balance)).toBe(-1000);
    });

    it('should throw when posting an already-posted entry', async () => {
      const acct1 = await service.createAccount(
        makeAccount({ name: 'AlreadyPosted1', code: randomCode('AP1') }),
        TEST_TENANT_ID,
      );
      const acct2 = await service.createAccount(
        makeAccount({ name: 'AlreadyPosted2', code: randomCode('AP2') }),
        TEST_TENANT_ID,
      );

      const entry = await service.createJournalEntry(
        {
          date: '2026-04-02',
          description: 'Already posted test',
          lines: [
            { accountId: acct1.id, debit: '200', credit: '0' },
            { accountId: acct2.id, debit: '0', credit: '200' },
          ],
        },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );
      await service.postJournalEntry(entry.id, TEST_TENANT_ID, TEST_USER_ID);

      await expect(
        service.postJournalEntry(entry.id, TEST_TENANT_ID, TEST_USER_ID),
      ).rejects.toThrow('already posted');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Journal Entry Voiding
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Journal Entry Voiding', () => {
    it('should void a posted entry and reverse account balances', async () => {
      const debitAcct = await service.createAccount(
        makeAccount({ name: 'Void Debit', code: randomCode('VDEB') }),
        TEST_TENANT_ID,
      );
      const creditAcct = await service.createAccount(
        makeAccount({ name: 'Void Credit', code: randomCode('VCRE') }),
        TEST_TENANT_ID,
      );

      const entry = await service.createJournalEntry(
        {
          date: '2026-05-01',
          description: 'Void test',
          lines: [
            { accountId: debitAcct.id, debit: '750.00', credit: '0' },
            { accountId: creditAcct.id, debit: '0', credit: '750.00' },
          ],
        },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );

      await service.postJournalEntry(entry.id, TEST_TENANT_ID, TEST_USER_ID);

      const voided = await service.voidJournalEntry(entry.id, TEST_TENANT_ID);
      expect(voided.status).toBe('voided');

      const dbEntry = await testDb
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, entry.id));
      expect(dbEntry[0]!.status).toBe('voided');

      const dbDebit = await service.getAccount(debitAcct.id, TEST_TENANT_ID);
      expect(Number(dbDebit.balance)).toBe(0);

      const dbCredit = await service.getAccount(creditAcct.id, TEST_TENANT_ID);
      expect(Number(dbCredit.balance)).toBe(0);
    });

    it('should throw when voiding a draft entry', async () => {
      const acct1 = await service.createAccount(
        makeAccount({ name: 'DraftVoid1', code: randomCode('DV1') }),
        TEST_TENANT_ID,
      );
      const acct2 = await service.createAccount(
        makeAccount({ name: 'DraftVoid2', code: randomCode('DV2') }),
        TEST_TENANT_ID,
      );

      const entry = await service.createJournalEntry(
        {
          date: '2026-05-02',
          description: 'Draft void test',
          lines: [
            { accountId: acct1.id, debit: '100', credit: '0' },
            { accountId: acct2.id, debit: '0', credit: '100' },
          ],
        },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );

      await expect(
        service.voidJournalEntry(entry.id, TEST_TENANT_ID),
      ).rejects.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Closed Period Protection
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Closed Period Protection', () => {
    it('should prevent creating a journal entry in a closed period', async () => {
      const fy = await service.createFiscalYear(
        makeFiscalYearRequest({
          name: 'Closed Period Test',
          startDate: '2026-06-01T00:00:00Z',
          endDate: '2026-06-30T23:59:59Z',
        }),
        TEST_TENANT_ID,
      );
      await service.closeFiscalYear(fy.id, TEST_TENANT_ID);

      const acct1 = await service.createAccount(
        makeAccount({ name: 'ClosedPer1', code: randomCode('CP1') }),
        TEST_TENANT_ID,
      );
      const acct2 = await service.createAccount(
        makeAccount({ name: 'ClosedPer2', code: randomCode('CP2') }),
        TEST_TENANT_ID,
      );

      await expect(
        service.createJournalEntry(
          {
            date: '2026-06-15',
            description: 'Should fail',
            lines: [
              { accountId: acct1.id, debit: '100', credit: '0' },
              { accountId: acct2.id, debit: '0', credit: '100' },
            ],
          },
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('closed period');
    });

    it('should allow creating a journal entry in an open period', async () => {
      const acct1 = await service.createAccount(
        makeAccount({ name: 'OpenPer1', code: randomCode('OP1') }),
        TEST_TENANT_ID,
      );
      const acct2 = await service.createAccount(
        makeAccount({ name: 'OpenPer2', code: randomCode('OP2') }),
        TEST_TENANT_ID,
      );

      const entry = await service.createJournalEntry(
        {
          date: '2027-01-15',
          description: 'Open period entry',
          lines: [
            { accountId: acct1.id, debit: '250', credit: '0' },
            { accountId: acct2.id, debit: '0', credit: '250' },
          ],
        },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );
      expect(entry.status).toBe('draft');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Fiscal Year Overlap
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Fiscal Year Overlap', () => {
    it('should prevent creating overlapping fiscal years', async () => {
      await service.createFiscalYear(
        makeFiscalYearRequest({
          name: 'Overlap FY A',
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-12-31T23:59:59Z',
        }),
        TEST_TENANT_ID,
      );

      await expect(
        service.createFiscalYear(
          makeFiscalYearRequest({
            name: 'Overlap FY B',
            startDate: '2025-06-01T00:00:00Z',
            endDate: '2025-12-31T23:59:59Z',
          }),
          TEST_TENANT_ID,
        ),
      ).rejects.toThrow('overlaps');
    });

    it('should allow creating non-overlapping fiscal years', async () => {
      const fy = await service.createFiscalYear(
        makeFiscalYearRequest({
          name: 'Non-Overlap FY',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-12-31T23:59:59Z',
        }),
        TEST_TENANT_ID,
      );
      expect(fy.id).toBeDefined();
      expect(fy.name).toBe('Non-Overlap FY');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Fiscal Year Close with Drafts
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Fiscal Year Close with Drafts', () => {
    it('should prevent closing a fiscal year with draft entries in the period', async () => {
      const acct1 = await service.createAccount(
        makeAccount({ name: 'DraftClose1', code: randomCode('DC1') }),
        TEST_TENANT_ID,
      );
      const acct2 = await service.createAccount(
        makeAccount({ name: 'DraftClose2', code: randomCode('DC2') }),
        TEST_TENANT_ID,
      );

      const fy = await service.createFiscalYear(
        makeFiscalYearRequest({
          name: 'Close With Drafts',
          startDate: '2026-07-01T00:00:00Z',
          endDate: '2026-07-31T23:59:59Z',
        }),
        TEST_TENANT_ID,
      );

      await service.createJournalEntry(
        {
          date: '2026-07-15',
          description: 'Draft in period',
          lines: [
            { accountId: acct1.id, debit: '100', credit: '0' },
            { accountId: acct2.id, debit: '0', credit: '100' },
          ],
        },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );

      await expect(
        service.closeFiscalYear(fy.id, TEST_TENANT_ID),
      ).rejects.toThrow();
    });

    it('should allow closing a fiscal year with no draft entries', async () => {
      const fy = await service.createFiscalYear(
        makeFiscalYearRequest({
          name: 'Close Empty Period',
          startDate: '2026-08-01T00:00:00Z',
          endDate: '2026-08-31T23:59:59Z',
        }),
        TEST_TENANT_ID,
      );

      const closed = await service.closeFiscalYear(fy.id, TEST_TENANT_ID);
      expect(closed.status).toBe('closed');
    });
  });
});
