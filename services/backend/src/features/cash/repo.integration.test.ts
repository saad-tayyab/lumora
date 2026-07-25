import {
  bankAccounts,
  bankConnections,
  bankStatements,
  bankTransfers,
  currencies,
  reconciliationEntries,
} from '@lumora/database/schema';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { TEST_TENANT_ID, testDb } from '../../lib/integration-test-utils';

// ─── Mocks ───────────────────────────────────────────────────────────────────
vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class MockSQLDatabase {
    connectionString = process.env.DATABASE_URL;
  },
}));

vi.mock('encore.dev/api', () => ({}));

vi.mock('../../database', () => ({
  db: testDb,
}));

// ─── Imports that depend on the mocks ────────────────────────────────────────
import {
  bankAccountRepo,
  bankConnectionRepo,
  bankStatementRepo,
  bankTransferRepo,
  currencyRepo,
  reconciliationEntryRepo,
} from './repo';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const OTHER_TENANT = '33333333-3333-4333-8333-333333333333';
const USER_ID = '00000000-0000-0000-0000-000000000001';

let testCurrencyCode: string;
let accountId1: string;
let accountId2: string;

function randomSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function makeBankAccount(overrides?: Record<string, unknown>) {
  return {
    tenantId: TEST_TENANT_ID,
    bankName: 'Test Bank',
    accountName: 'Checking Account',
    accountNumber: `ACC-${randomSuffix()}`,
    routingNumber: '021000021',
    accountType: 'checking' as const,
    currencyCode: 'USD',
    currentBalance: '1000.0000',
    availableBalance: '1000.0000',
    status: 'active' as const,
    isDefault: false,
    ...overrides,
  };
}

function makeBankTransfer(
  sourceAccountId: string,
  destinationAccountId: string,
  overrides?: Record<string, unknown>,
) {
  return {
    tenantId: TEST_TENANT_ID,
    sourceAccountId,
    destinationAccountId,
    amount: '500.0000',
    currencyCode: 'USD',
    transferType: 'internal' as const,
    status: 'pending' as const,
    description: 'Test transfer',
    createdBy: USER_ID,
    ...overrides,
  };
}

function makeBankStatement(bankAccountId: string, overrides?: Record<string, unknown>) {
  return {
    tenantId: TEST_TENANT_ID,
    bankAccountId,
    statementDate: '2026-07-01',
    periodStart: '2026-06-01',
    periodEnd: '2026-06-30',
    openingBalance: '5000.0000',
    closingBalance: '5500.0000',
    importSource: 'csv' as const,
    importStatus: 'completed' as const,
    transactionCount: 25,
    reconciledCount: 0,
    importedBy: USER_ID,
    importedAt: new Date(),
    ...overrides,
  };
}

function makeReconciliationEntry(
  statementId: string,
  bankAccountId: string,
  overrides?: Record<string, unknown>,
) {
  return {
    tenantId: TEST_TENANT_ID,
    statementId,
    bankAccountId,
    transactionDate: '2026-06-15',
    description: 'Test transaction',
    amount: '100.0000',
    balanceAfter: '4900.0000',
    transactionType: 'debit' as const,
    reconciliationStatus: 'unmatched' as const,
    ...overrides,
  };
}

function makeCurrency(overrides?: Record<string, unknown>) {
  const code = `Z${randomSuffix().slice(0, 2)}`.toUpperCase().slice(0, 3);
  return {
    code,
    name: `Test Currency ${code}`,
    symbol: '$',
    decimalPlaces: 2,
    isActive: true,
    ...overrides,
  };
}

function makeBankConnection(bankAccountId: string, overrides?: Record<string, unknown>) {
  return {
    tenantId: TEST_TENANT_ID,
    bankAccountId,
    connectionType: 'plaid' as const,
    institutionName: 'Test Institution',
    institutionId: 'inst-001',
    accessToken: `tok-${randomSuffix()}`,
    status: 'active' as const,
    syncFrequency: 'daily' as const,
    createdBy: USER_ID,
    ...overrides,
  };
}

async function cleanupCashData(): Promise<void> {
  const tables = [
    reconciliationEntries,
    bankStatements,
    bankTransfers,
    bankConnections,
    bankAccounts,
    currencies,
  ] as const;
  for (const table of tables) {
    try {
      await testDb.delete(table);
    } catch {
      // skip
    }
  }
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Cash & Treasury Repositories - Integration Tests', () => {
  beforeAll(async () => {
    await cleanupCashData();

    // Seed a currency for FK references
    const cur = await currencyRepo.create({
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      decimalPlaces: 2,
      isActive: true,
    });
    testCurrencyCode = cur.code;

    // Create two bank accounts for transfer / statement tests
    const acc1 = await bankAccountRepo.create(
      makeBankAccount({ accountName: 'Source Account', isDefault: true }),
    );
    accountId1 = acc1.id;

    const acc2 = await bankAccountRepo.create(
      makeBankAccount({ accountName: 'Destination Account' }),
    );
    accountId2 = acc2.id;
  });

  afterAll(async () => {
    await cleanupCashData();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // bankAccountRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('bankAccountRepo', () => {
    describe('create', () => {
      it('should create a bank account and return it with generated id', async () => {
        const data = makeBankAccount({ bankName: 'Chase', accountNumber: `CH-${randomSuffix()}` });
        const account = await bankAccountRepo.create(data);

        expect(account).toBeDefined();
        expect(account.id).toBeDefined();
        expect(account.bankName).toBe('Chase');
        expect(account.accountNumber).toBe(data.accountNumber);
        expect(account.tenantId).toBe(TEST_TENANT_ID);
        expect(account.status).toBe('active');
        expect(account.createdAt).toBeInstanceOf(Date);
      });

      it('should create a bank account with non-default balance', async () => {
        const account = await bankAccountRepo.create(
          makeBankAccount({ currentBalance: '25000.50', availableBalance: '24000.50' }),
        );
        expect(account.currentBalance).toBe('25000.50');
        expect(account.availableBalance).toBe('24000.50');
      });
    });

    describe('findById', () => {
      it('should return a bank account by id', async () => {
        const found = await bankAccountRepo.findById(accountId1, TEST_TENANT_ID);
        expect(found).toBeDefined();
        expect(found!.id).toBe(accountId1);
        expect(found!.accountName).toBe('Source Account');
      });

      it('should return undefined for non-existent id', async () => {
        const found = await bankAccountRepo.findById(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(found).toBeUndefined();
      });

      it('should return undefined when tenant does not match', async () => {
        const found = await bankAccountRepo.findById(accountId1, OTHER_TENANT);
        expect(found).toBeUndefined();
      });
    });

    describe('findByAccountNumber', () => {
      it('should return a bank account by account number', async () => {
        const created = await bankAccountRepo.create(
          makeBankAccount({ accountNumber: `FIND-${randomSuffix()}`, accountName: 'FindByNumber' }),
        );
        const found = await bankAccountRepo.findByAccountNumber(
          created.accountNumber,
          TEST_TENANT_ID,
        );
        expect(found).toBeDefined();
        expect(found!.id).toBe(created.id);
      });

      it('should return undefined for non-existent account number', async () => {
        const found = await bankAccountRepo.findByAccountNumber('NO-SUCH-ACCT', TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });

      it('should return undefined when tenant does not match', async () => {
        const created = await bankAccountRepo.create(
          makeBankAccount({ accountNumber: `ISO-${randomSuffix()}`, accountName: 'IsoAcct' }),
        );
        const found = await bankAccountRepo.findByAccountNumber(
          created.accountNumber,
          OTHER_TENANT,
        );
        expect(found).toBeUndefined();
      });
    });

    describe('findDefault', () => {
      it('should return the default bank account', async () => {
        const found = await bankAccountRepo.findDefault(TEST_TENANT_ID);
        expect(found).toBeDefined();
        expect(found!.isDefault).toBe(true);
        expect(found!.id).toBe(accountId1);
      });
    });

    describe('findByStatus', () => {
      it('should return accounts filtered by active status', async () => {
        const results = await bankAccountRepo.findByStatus(TEST_TENANT_ID, 'active');
        expect(results.length).toBeGreaterThanOrEqual(2);
        for (const a of results) {
          expect(a.status).toBe('active');
        }
      });

      it('should return empty for closed status', async () => {
        const results = await bankAccountRepo.findByStatus(TEST_TENANT_ID, 'closed');
        expect(results.length).toBe(0);
      });
    });

    describe('findMany', () => {
      it('should return paginated results with total', async () => {
        const result = await bankAccountRepo.findMany(TEST_TENANT_ID);
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.total).toBeGreaterThanOrEqual(2);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should paginate with limit', async () => {
        const result = await bankAccountRepo.findMany(TEST_TENANT_ID, { limit: 1 });
        expect(result.data.length).toBeLessThanOrEqual(1);
        expect(result.total).toBeGreaterThanOrEqual(2);
      });

      it('should filter by status', async () => {
        const result = await bankAccountRepo.findMany(TEST_TENANT_ID, { status: 'active' });
        for (const a of result.data) {
          expect(a.status).toBe('active');
        }
      });

      it('should filter by search (bank name)', async () => {
        const name = `SearchBank-${randomSuffix()}`;
        await bankAccountRepo.create(
          makeBankAccount({ bankName: name, accountNumber: `SB-${randomSuffix()}` }),
        );
        const result = await bankAccountRepo.findMany(TEST_TENANT_ID, { search: name });
        expect(result.data.length).toBeGreaterThanOrEqual(1);
        for (const a of result.data) {
          expect(a.bankName).toBe(name);
        }
      });
    });

    describe('update', () => {
      it('should update bank account fields', async () => {
        const updated = await bankAccountRepo.update(accountId1, TEST_TENANT_ID, {
          bankName: 'Updated Bank',
        });
        expect(updated).toBeDefined();
        expect(updated!.bankName).toBe('Updated Bank');
        expect(updated!.id).toBe(accountId1);
      });

      it('should update the updatedAt timestamp', async () => {
        const original = await bankAccountRepo.findById(accountId1, TEST_TENANT_ID);
        await new Promise((r) => setTimeout(r, 10));
        const updated = await bankAccountRepo.update(accountId1, TEST_TENANT_ID, {
          bankName: 'Timestamp Bank',
        });
        expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(original!.updatedAt.getTime());
      });

      it('should return undefined when updating non-existent id', async () => {
        const result = await bankAccountRepo.update(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
          { bankName: 'Ghost' },
        );
        expect(result).toBeUndefined();
      });
    });

    describe('softDelete', () => {
      it('should soft-delete a bank account', async () => {
        const created = await bankAccountRepo.create(
          makeBankAccount({ accountName: 'Delete Me', accountNumber: `DEL-${randomSuffix()}` }),
        );
        const deleted = await bankAccountRepo.softDelete(created.id, TEST_TENANT_ID);
        expect(deleted).toBeDefined();
        expect(deleted!.deletedAt).not.toBeNull();

        const found = await bankAccountRepo.findById(created.id, TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });

      it('should not hard-delete the record from the database', async () => {
        const created = await bankAccountRepo.create(
          makeBankAccount({ accountName: 'Still In DB', accountNumber: `SIDB-${randomSuffix()}` }),
        );
        await bankAccountRepo.softDelete(created.id, TEST_TENANT_ID);

        const rows = await testDb
          .select()
          .from(bankAccounts)
          .where(eq(bankAccounts.id, created.id));
        expect(rows.length).toBe(1);
        expect(rows[0].deletedAt).not.toBeNull();
      });

      it('should return undefined when deleting non-existent id', async () => {
        const result = await bankAccountRepo.softDelete(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(result).toBeUndefined();
      });
    });

    describe('countActive', () => {
      it('should count default bank accounts', async () => {
        const count = await bankAccountRepo.countActive(TEST_TENANT_ID);
        expect(count).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // bankTransferRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('bankTransferRepo', () => {
    describe('create', () => {
      it('should create a transfer and return it', async () => {
        const transfer = await bankTransferRepo.create(makeBankTransfer(accountId1, accountId2));
        expect(transfer).toBeDefined();
        expect(transfer.id).toBeDefined();
        expect(transfer.sourceAccountId).toBe(accountId1);
        expect(transfer.destinationAccountId).toBe(accountId2);
        expect(transfer.amount).toBe('500.0000');
        expect(transfer.status).toBe('pending');
        expect(transfer.tenantId).toBe(TEST_TENANT_ID);
      });
    });

    describe('findById', () => {
      it('should return a transfer by id', async () => {
        const created = await bankTransferRepo.create(
          makeBankTransfer(accountId1, accountId2, { description: 'FindById Transfer' }),
        );
        const found = await bankTransferRepo.findById(created.id, TEST_TENANT_ID);
        expect(found).toBeDefined();
        expect(found!.id).toBe(created.id);
        expect(found!.description).toBe('FindById Transfer');
      });

      it('should return undefined for non-existent id', async () => {
        const found = await bankTransferRepo.findById(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(found).toBeUndefined();
      });

      it('should return undefined when tenant does not match', async () => {
        const created = await bankTransferRepo.create(makeBankTransfer(accountId1, accountId2));
        const found = await bankTransferRepo.findById(created.id, OTHER_TENANT);
        expect(found).toBeUndefined();
      });
    });

    describe('findMany', () => {
      beforeAll(async () => {
        await bankTransferRepo.create(
          makeBankTransfer(accountId1, accountId2, {
            status: 'completed',
            description: 'Completed Transfer',
          }),
        );
        await bankTransferRepo.create(
          makeBankTransfer(accountId1, accountId2, {
            status: 'pending',
            description: 'Pending Transfer',
          }),
        );
      });

      it('should return paginated results with total', async () => {
        const result = await bankTransferRepo.findMany(TEST_TENANT_ID);
        expect(result.data).toBeDefined();
        expect(result.total).toBeGreaterThanOrEqual(2);
      });

      it('should filter by status', async () => {
        const result = await bankTransferRepo.findMany(TEST_TENANT_ID, { status: 'completed' });
        for (const t of result.data) {
          expect(t.status).toBe('completed');
        }
      });

      it('should filter by source account', async () => {
        const result = await bankTransferRepo.findMany(TEST_TENANT_ID, {
          sourceAccountId: accountId1,
        });
        for (const t of result.data) {
          expect(t.sourceAccountId).toBe(accountId1);
        }
      });

      it('should filter by destination account', async () => {
        const result = await bankTransferRepo.findMany(TEST_TENANT_ID, {
          destinationAccountId: accountId2,
        });
        for (const t of result.data) {
          expect(t.destinationAccountId).toBe(accountId2);
        }
      });

      it('should paginate with limit', async () => {
        const result = await bankTransferRepo.findMany(TEST_TENANT_ID, { limit: 1 });
        expect(result.data.length).toBeLessThanOrEqual(1);
      });
    });

    describe('findBySourceAccount', () => {
      it('should return transfers for a given source account', async () => {
        const results = await bankTransferRepo.findBySourceAccount(accountId1, TEST_TENANT_ID);
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const t of results) {
          expect(t.sourceAccountId).toBe(accountId1);
        }
      });

      it('should return empty for non-existent account', async () => {
        const results = await bankTransferRepo.findBySourceAccount(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(results).toHaveLength(0);
      });
    });

    describe('findByDestinationAccount', () => {
      it('should return transfers for a given destination account', async () => {
        const results = await bankTransferRepo.findByDestinationAccount(accountId2, TEST_TENANT_ID);
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const t of results) {
          expect(t.destinationAccountId).toBe(accountId2);
        }
      });
    });

    describe('findPending', () => {
      it('should return only pending transfers', async () => {
        await bankTransferRepo.create(
          makeBankTransfer(accountId1, accountId2, {
            status: 'pending',
            description: 'Pending Xfer',
          }),
        );
        const results = await bankTransferRepo.findPending(TEST_TENANT_ID);
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const t of results) {
          expect(t.status).toBe('pending');
        }
      });
    });

    describe('update', () => {
      it('should update transfer status', async () => {
        const created = await bankTransferRepo.create(
          makeBankTransfer(accountId1, accountId2, { status: 'pending' }),
        );
        const updated = await bankTransferRepo.update(created.id, TEST_TENANT_ID, {
          status: 'completed',
        });
        expect(updated).toBeDefined();
        expect(updated!.status).toBe('completed');
      });

      it('should update description', async () => {
        const created = await bankTransferRepo.create(
          makeBankTransfer(accountId1, accountId2, { description: 'Original Desc' }),
        );
        const updated = await bankTransferRepo.update(created.id, TEST_TENANT_ID, {
          description: 'Updated Desc',
        });
        expect(updated!.description).toBe('Updated Desc');
      });
    });

    describe('softDelete', () => {
      it('should soft-delete a transfer', async () => {
        const created = await bankTransferRepo.create(
          makeBankTransfer(accountId1, accountId2, { description: 'Delete Transfer' }),
        );
        const deleted = await bankTransferRepo.softDelete(created.id, TEST_TENANT_ID);
        expect(deleted).toBeDefined();
        expect(deleted!.deletedAt).not.toBeNull();

        const found = await bankTransferRepo.findById(created.id, TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // bankStatementRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('bankStatementRepo', () => {
    describe('create', () => {
      it('should create a statement and return it', async () => {
        const stmt = await bankStatementRepo.create(makeBankStatement(accountId1));
        expect(stmt).toBeDefined();
        expect(stmt.id).toBeDefined();
        expect(stmt.bankAccountId).toBe(accountId1);
        expect(stmt.importStatus).toBe('completed');
        expect(stmt.tenantId).toBe(TEST_TENANT_ID);
      });
    });

    describe('findById', () => {
      it('should return a statement by id', async () => {
        const created = await bankStatementRepo.create(
          makeBankStatement(accountId1, { statementDate: '2026-08-01' }),
        );
        const found = await bankStatementRepo.findById(created.id, TEST_TENANT_ID);
        expect(found).toBeDefined();
        expect(found!.id).toBe(created.id);
      });

      it('should return undefined for non-existent id', async () => {
        const found = await bankStatementRepo.findById(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(found).toBeUndefined();
      });

      it('should return undefined when tenant does not match', async () => {
        const created = await bankStatementRepo.create(
          makeBankStatement(accountId1, { statementDate: '2026-09-01' }),
        );
        const found = await bankStatementRepo.findById(created.id, OTHER_TENANT);
        expect(found).toBeUndefined();
      });
    });

    describe('findMany', () => {
      it('should return paginated results', async () => {
        const result = await bankStatementRepo.findMany(TEST_TENANT_ID);
        expect(result.data).toBeDefined();
        expect(result.total).toBeGreaterThanOrEqual(1);
      });

      it('should filter by bank account id', async () => {
        const result = await bankStatementRepo.findMany(TEST_TENANT_ID, {
          bankAccountId: accountId1,
        });
        for (const s of result.data) {
          expect(s.bankAccountId).toBe(accountId1);
        }
      });

      it('should filter by import status', async () => {
        const result = await bankStatementRepo.findMany(TEST_TENANT_ID, {
          importStatus: 'completed',
        });
        for (const s of result.data) {
          expect(s.importStatus).toBe('completed');
        }
      });

      it('should paginate with limit', async () => {
        const result = await bankStatementRepo.findMany(TEST_TENANT_ID, { limit: 1 });
        expect(result.data.length).toBeLessThanOrEqual(1);
      });
    });

    describe('findByBankAccount', () => {
      it('should return statements for a bank account', async () => {
        const results = await bankStatementRepo.findByBankAccount(accountId1, TEST_TENANT_ID);
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const s of results) {
          expect(s.bankAccountId).toBe(accountId1);
        }
      });

      it('should return empty for non-existent bank account', async () => {
        const results = await bankStatementRepo.findByBankAccount(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(results).toHaveLength(0);
      });
    });

    describe('findByDateRange', () => {
      it('should return statements within the date range', async () => {
        const results = await bankStatementRepo.findByDateRange(
          TEST_TENANT_ID,
          accountId1,
          '2026-01-01',
          '2026-12-31',
        );
        expect(results.length).toBeGreaterThanOrEqual(1);
      });
    });

    describe('update', () => {
      it('should update statement fields', async () => {
        const created = await bankStatementRepo.create(
          makeBankStatement(accountId1, { statementDate: '2026-10-01' }),
        );
        const updated = await bankStatementRepo.update(created.id, TEST_TENANT_ID, {
          importStatus: 'processing',
        });
        expect(updated).toBeDefined();
        expect(updated!.importStatus).toBe('processing');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // reconciliationEntryRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('reconciliationEntryRepo', () => {
    let stmtId: string;

    beforeAll(async () => {
      const stmt = await bankStatementRepo.create(
        makeBankStatement(accountId1, { statementDate: '2026-07-01', importStatus: 'completed' }),
      );
      stmtId = stmt.id;
    });

    describe('create', () => {
      it('should create a reconciliation entry', async () => {
        const entry = await reconciliationEntryRepo.create(
          makeReconciliationEntry(stmtId, accountId1),
        );
        expect(entry).toBeDefined();
        expect(entry.id).toBeDefined();
        expect(entry.statementId).toBe(stmtId);
        expect(entry.reconciliationStatus).toBe('unmatched');
        expect(entry.tenantId).toBe(TEST_TENANT_ID);
      });
    });

    describe('findById', () => {
      it('should return an entry by id', async () => {
        const created = await reconciliationEntryRepo.create(
          makeReconciliationEntry(stmtId, accountId1, { description: 'FindById Entry' }),
        );
        const found = await reconciliationEntryRepo.findById(created.id, TEST_TENANT_ID);
        expect(found).toBeDefined();
        expect(found!.id).toBe(created.id);
        expect(found!.description).toBe('FindById Entry');
      });

      it('should return undefined for non-existent id', async () => {
        const found = await reconciliationEntryRepo.findById(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(found).toBeUndefined();
      });

      it('should return undefined when tenant does not match', async () => {
        const created = await reconciliationEntryRepo.create(
          makeReconciliationEntry(stmtId, accountId1),
        );
        const found = await reconciliationEntryRepo.findById(created.id, OTHER_TENANT);
        expect(found).toBeUndefined();
      });
    });

    describe('findMany', () => {
      it('should return paginated results', async () => {
        const result = await reconciliationEntryRepo.findMany(TEST_TENANT_ID);
        expect(result.data).toBeDefined();
        expect(result.total).toBeGreaterThanOrEqual(1);
      });

      it('should filter by statement id', async () => {
        const result = await reconciliationEntryRepo.findMany(TEST_TENANT_ID, {
          statementId: stmtId,
        });
        for (const e of result.data) {
          expect(e.statementId).toBe(stmtId);
        }
      });

      it('should filter by bank account id', async () => {
        const result = await reconciliationEntryRepo.findMany(TEST_TENANT_ID, {
          bankAccountId: accountId1,
        });
        for (const e of result.data) {
          expect(e.bankAccountId).toBe(accountId1);
        }
      });

      it('should filter by reconciliation status', async () => {
        await reconciliationEntryRepo.create(
          makeReconciliationEntry(stmtId, accountId1, {
            description: 'Matched Entry',
            reconciliationStatus: 'auto_matched',
          }),
        );
        const result = await reconciliationEntryRepo.findMany(TEST_TENANT_ID, {
          reconciliationStatus: 'auto_matched',
        });
        for (const e of result.data) {
          expect(e.reconciliationStatus).toBe('auto_matched');
        }
      });

      it('should paginate with limit', async () => {
        const result = await reconciliationEntryRepo.findMany(TEST_TENANT_ID, { limit: 1 });
        expect(result.data.length).toBeLessThanOrEqual(1);
      });
    });

    describe('findByStatement', () => {
      it('should return entries for a statement', async () => {
        const results = await reconciliationEntryRepo.findByStatement(stmtId, TEST_TENANT_ID);
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const e of results) {
          expect(e.statementId).toBe(stmtId);
        }
      });

      it('should return empty for non-existent statement', async () => {
        const results = await reconciliationEntryRepo.findByStatement(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(results).toHaveLength(0);
      });
    });

    describe('findByBankAccount', () => {
      it('should return entries for a bank account', async () => {
        const results = await reconciliationEntryRepo.findByBankAccount(accountId1, TEST_TENANT_ID);
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const e of results) {
          expect(e.bankAccountId).toBe(accountId1);
        }
      });
    });

    describe('findUnmatched', () => {
      it('should return only unmatched entries', async () => {
        const results = await reconciliationEntryRepo.findUnmatched(TEST_TENANT_ID);
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const e of results) {
          expect(e.reconciliationStatus).toBe('unmatched');
        }
      });
    });

    describe('update', () => {
      it('should update reconciliation status', async () => {
        const created = await reconciliationEntryRepo.create(
          makeReconciliationEntry(stmtId, accountId1, { description: 'Update Me' }),
        );
        const updated = await reconciliationEntryRepo.update(created.id, TEST_TENANT_ID, {
          reconciliationStatus: 'manually_matched',
        });
        expect(updated).toBeDefined();
        expect(updated!.reconciliationStatus).toBe('manually_matched');
      });

      it('should update matched entity info', async () => {
        const created = await reconciliationEntryRepo.create(
          makeReconciliationEntry(stmtId, accountId1, { description: 'Match Entity' }),
        );
        const updated = await reconciliationEntryRepo.update(created.id, TEST_TENANT_ID, {
          matchedEntityId: '11111111-1111-1111-1111-111111111111',
          matchedEntityType: 'journal_entry',
        });
        expect(updated!.matchedEntityId).toBe('11111111-1111-1111-1111-111111111111');
        expect(updated!.matchedEntityType).toBe('journal_entry');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // currencyRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('currencyRepo', () => {
    describe('create', () => {
      it('should create a currency and return it', async () => {
        const data = makeCurrency({ code: 'EUR', name: 'Euro', symbol: '\u20AC' });
        const cur = await currencyRepo.create(data);
        expect(cur).toBeDefined();
        expect(cur.code).toBe('EUR');
        expect(cur.name).toBe('Euro');
        expect(cur.isActive).toBe(true);
      });
    });

    describe('findByCode', () => {
      it('should return a currency by code', async () => {
        const found = await currencyRepo.findByCode('USD');
        expect(found).toBeDefined();
        expect(found!.code).toBe('USD');
      });

      it('should return undefined for non-existent code', async () => {
        const found = await currencyRepo.findByCode('XYZ');
        expect(found).toBeUndefined();
      });
    });

    describe('findMany', () => {
      it('should return paginated currencies', async () => {
        const result = await currencyRepo.findMany();
        expect(result.data).toBeDefined();
        expect(result.total).toBeGreaterThanOrEqual(2);
      });

      it('should paginate with limit', async () => {
        const result = await currencyRepo.findMany({ limit: 1 });
        expect(result.data.length).toBe(1);
        expect(result.total).toBeGreaterThanOrEqual(2);
      });
    });

    describe('findActive', () => {
      it('should return only active currencies', async () => {
        const results = await currencyRepo.findActive();
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const c of results) {
          expect(c.isActive).toBe(true);
        }
      });
    });

    describe('update', () => {
      it('should update a currency by code', async () => {
        const updated = await currencyRepo.update('USD', { name: 'United States Dollar' });
        expect(updated).toBeDefined();
        expect(updated!.name).toBe('United States Dollar');
      });

      it('should return undefined when updating non-existent code', async () => {
        const result = await currencyRepo.update('XYZ', { name: 'Fake' });
        expect(result).toBeUndefined();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // bankConnectionRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('bankConnectionRepo', () => {
    describe('create', () => {
      it('should create a connection and return it', async () => {
        const conn = await bankConnectionRepo.create(
          makeBankConnection(accountId1, { institutionName: 'Plaid Test' }),
        );
        expect(conn).toBeDefined();
        expect(conn.id).toBeDefined();
        expect(conn.bankAccountId).toBe(accountId1);
        expect(conn.institutionName).toBe('Plaid Test');
        expect(conn.status).toBe('active');
        expect(conn.tenantId).toBe(TEST_TENANT_ID);
      });
    });

    describe('findById', () => {
      it('should return a connection by id', async () => {
        const created = await bankConnectionRepo.create(
          makeBankConnection(accountId1, { institutionName: 'FindById Conn' }),
        );
        const found = await bankConnectionRepo.findById(created.id, TEST_TENANT_ID);
        expect(found).toBeDefined();
        expect(found!.id).toBe(created.id);
        expect(found!.institutionName).toBe('FindById Conn');
      });

      it('should return undefined for non-existent id', async () => {
        const found = await bankConnectionRepo.findById(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(found).toBeUndefined();
      });

      it('should return undefined when tenant does not match', async () => {
        const created = await bankConnectionRepo.create(makeBankConnection(accountId1));
        const found = await bankConnectionRepo.findById(created.id, OTHER_TENANT);
        expect(found).toBeUndefined();
      });
    });

    describe('findMany', () => {
      it('should return paginated results', async () => {
        const result = await bankConnectionRepo.findMany(TEST_TENANT_ID);
        expect(result.data).toBeDefined();
        expect(result.total).toBeGreaterThanOrEqual(1);
      });

      it('should filter by bank account id', async () => {
        const result = await bankConnectionRepo.findMany(TEST_TENANT_ID, {
          bankAccountId: accountId1,
        });
        for (const c of result.data) {
          expect(c.bankAccountId).toBe(accountId1);
        }
      });

      it('should filter by status', async () => {
        const result = await bankConnectionRepo.findMany(TEST_TENANT_ID, { status: 'active' });
        for (const c of result.data) {
          expect(c.status).toBe('active');
        }
      });

      it('should paginate with limit', async () => {
        const result = await bankConnectionRepo.findMany(TEST_TENANT_ID, { limit: 1 });
        expect(result.data.length).toBeLessThanOrEqual(1);
      });
    });

    describe('findByBankAccount', () => {
      it('should return connections for a bank account', async () => {
        const results = await bankConnectionRepo.findByBankAccount(accountId1, TEST_TENANT_ID);
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const c of results) {
          expect(c.bankAccountId).toBe(accountId1);
        }
      });
    });

    describe('findActiveByAccount', () => {
      it('should return active connection for given account and type', async () => {
        const found = await bankConnectionRepo.findActiveByAccount(
          accountId1,
          'plaid',
          TEST_TENANT_ID,
        );
        expect(found).toBeDefined();
        expect(found!.bankAccountId).toBe(accountId1);
        expect(found!.connectionType).toBe('plaid');
        expect(found!.status).toBe('active');
      });

      it('should return undefined when no active connection matches', async () => {
        const found = await bankConnectionRepo.findActiveByAccount(
          accountId1,
          'yodlee',
          TEST_TENANT_ID,
        );
        expect(found).toBeUndefined();
      });
    });

    describe('update', () => {
      it('should update connection status', async () => {
        const created = await bankConnectionRepo.create(
          makeBankConnection(accountId1, { status: 'active' }),
        );
        const updated = await bankConnectionRepo.update(created.id, TEST_TENANT_ID, {
          status: 'expired',
        });
        expect(updated).toBeDefined();
        expect(updated!.status).toBe('expired');
      });
    });

    describe('softDelete', () => {
      it('should soft-delete a connection', async () => {
        const created = await bankConnectionRepo.create(
          makeBankConnection(accountId1, { institutionName: 'Delete Conn' }),
        );
        const deleted = await bankConnectionRepo.softDelete(created.id, TEST_TENANT_ID);
        expect(deleted).toBeDefined();
        expect(deleted!.deletedAt).not.toBeNull();

        const found = await bankConnectionRepo.findById(created.id, TEST_TENANT_ID);
        expect(found).toBeUndefined();
      });

      it('should keep the record in DB with deletedAt set', async () => {
        const created = await bankConnectionRepo.create(
          makeBankConnection(accountId1, { institutionName: 'Del Verify' }),
        );
        await bankConnectionRepo.softDelete(created.id, TEST_TENANT_ID);

        const rows = await testDb
          .select()
          .from(bankConnections)
          .where(eq(bankConnections.id, created.id));
        expect(rows.length).toBe(1);
        expect(rows[0].deletedAt).not.toBeNull();
      });

      it('should return undefined when deleting non-existent id', async () => {
        const result = await bankConnectionRepo.softDelete(
          '00000000-0000-0000-0000-000000000000',
          TEST_TENANT_ID,
        );
        expect(result).toBeUndefined();
      });
    });
  });
});
