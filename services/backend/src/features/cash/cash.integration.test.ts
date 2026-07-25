import {
  bankAccounts,
  bankStatements,
  bankTransfers,
  reconciliationEntries,
} from '@lumora/database/schema';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { TEST_TENANT_ID, TEST_USER_ID, testDb } from '../../lib/integration-test-utils';

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message);
      this.code = code;
      this.status = opts?.status ?? 500;
    }
  },
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));
vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class {
    connectionString = '';
  },
}));
vi.mock('../../database', () => ({ db: testDb }));

import { bankAccountRepo, currencyRepo } from './repo';
import * as service from './service';

function randomSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

async function cleanupCashData(): Promise<void> {
  const tables = [reconciliationEntries, bankStatements, bankTransfers, bankAccounts] as const;
  for (const table of tables) {
    try {
      await testDb.delete(table).where(eq(table.tenantId, TEST_TENANT_ID));
    } catch {
      // skip
    }
  }
}

let accountId1: string;
let accountId2: string;

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Cash & Treasury Service - Integration Tests', () => {
  beforeAll(async () => {
    await cleanupCashData();

    await currencyRepo
      .create({
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        decimalPlaces: 2,
        isActive: true,
      })
      .catch(() => {});
  });

  afterAll(async () => {
    await cleanupCashData();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. Bank account lifecycle: create → get → update → list
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Bank account lifecycle', () => {
    it('should create a bank account with encrypted number', async () => {
      const account = await service.createBankAccount(
        {
          bankName: 'Chase',
          accountName: 'Operating Account',
          accountNumber: '1234567890',
          routingNumber: '021000021',
          accountType: 'checking',
          currencyCode: 'USD',
          currentBalance: '10000.00',
          availableBalance: '9500.00',
        },
        TEST_TENANT_ID,
      );

      expect(account.id).toBeDefined();
      expect(account.bankName).toBe('Chase');
      expect(account.accountName).toBe('Operating Account');
      expect(account.accountNumber).toBe('********90');
      expect(account.currentBalance).toBe('10000.00');
      expect(account.status).toBe('active');
      expect(account.tenantId).toBe(TEST_TENANT_ID);

      accountId1 = account.id;
    });

    it('should retrieve the created bank account by id', async () => {
      const account = await service.getBankAccount(accountId1, TEST_TENANT_ID);

      expect(account.id).toBe(accountId1);
      expect(account.bankName).toBe('Chase');
      expect(account.accountNumber).toBe('********90');
    });

    it('should update bank account fields', async () => {
      const updated = await service.updateBankAccount(
        accountId1,
        { bankName: 'JPMorgan Chase', routingNumber: '021000025' },
        TEST_TENANT_ID,
      );

      expect(updated.bankName).toBe('JPMorgan Chase');
      expect(updated.routingNumber).toBe('021000025');
      expect(updated.id).toBe(accountId1);
    });

    it('should list bank accounts with pagination', async () => {
      const account2 = await service.createBankAccount(
        {
          bankName: 'Wells Fargo',
          accountName: 'Savings Account',
          accountNumber: '9876543210',
          accountType: 'savings',
          currencyCode: 'USD',
          currentBalance: '5000.00',
          availableBalance: '5000.00',
        },
        TEST_TENANT_ID,
      );
      accountId2 = account2.id;

      const result = await service.listBankAccounts(TEST_TENANT_ID, { page: 1, limit: 10 });

      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThanOrEqual(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);

      const names = result.data.map((a) => a.bankName);
      expect(names).toContain('JPMorgan Chase');
      expect(names).toContain('Wells Fargo');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. Default bank account: set default → verify only one default
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Default bank account', () => {
    it('should set an account as default', async () => {
      const account = await service.createBankAccount(
        {
          bankName: 'Default Bank',
          accountName: 'Primary Checking',
          accountNumber: `DB-${randomSuffix()}`,
          accountType: 'checking',
          currencyCode: 'USD',
          isDefault: true,
        },
        TEST_TENANT_ID,
      );

      expect(account.isDefault).toBe(true);

      const found = await bankAccountRepo.findDefault(TEST_TENANT_ID);
      expect(found).toBeDefined();
      expect(found?.id).toBe(account.id);
    });

    it('should ensure only one default exists when setting a new default', async () => {
      const newDefault = await service.createBankAccount(
        {
          bankName: 'New Default Bank',
          accountName: 'New Primary',
          accountNumber: `NDB-${randomSuffix()}`,
          accountType: 'checking',
          currencyCode: 'USD',
          isDefault: true,
        },
        TEST_TENANT_ID,
      );

      expect(newDefault.isDefault).toBe(true);

      const defaultAccount = await bankAccountRepo.findDefault(TEST_TENANT_ID);
      expect(defaultAccount).toBeDefined();
      expect(defaultAccount?.id).toBe(newDefault.id);

      const allAccounts = await service.listBankAccounts(TEST_TENANT_ID);
      const defaults = allAccounts.data.filter((a) => a.isDefault);
      expect(defaults.length).toBe(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. Transfer flow: create transfer between accounts → verify
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Transfer flow', () => {
    it('should create a pending transfer between two accounts', async () => {
      const transfer = await service.createBankTransfer(
        {
          sourceAccountId: accountId1,
          destinationAccountId: accountId2,
          amount: '250.00',
          transferType: 'internal',
          description: 'Monthly savings transfer',
        },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );

      expect(transfer.id).toBeDefined();
      expect(transfer.sourceAccountId).toBe(accountId1);
      expect(transfer.destinationAccountId).toBe(accountId2);
      expect(transfer.amount).toBe('250.00');
      expect(transfer.status).toBe('pending');
      expect(transfer.createdBy).toBe(TEST_USER_ID);
    });

    it('should complete a transfer and move funds between accounts', async () => {
      const sourceBefore = await service.getBankAccount(accountId1, TEST_TENANT_ID);
      const destBefore = await service.getBankAccount(accountId2, TEST_TENANT_ID);

      const transfer = await service.createBankTransfer(
        {
          sourceAccountId: accountId1,
          destinationAccountId: accountId2,
          amount: '100.00',
          transferType: 'internal',
          description: 'Test fund movement',
        },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );

      const completed = await service.completeBankTransfer(transfer.id, TEST_TENANT_ID);
      expect(completed.status).toBe('completed');
      expect(completed.completedAt).toBeDefined();

      const sourceAfter = await service.getBankAccount(accountId1, TEST_TENANT_ID);
      const destAfter = await service.getBankAccount(accountId2, TEST_TENANT_ID);

      const expectedSource = (Number.parseFloat(sourceBefore.currentBalance) - 100).toFixed(4);
      const expectedDest = (Number.parseFloat(destBefore.currentBalance) + 100).toFixed(4);

      expect(sourceAfter.currentBalance).toBe(expectedSource);
      expect(destAfter.currentBalance).toBe(expectedDest);
    });

    it('should reject transfer when source and destination are the same account', async () => {
      await expect(
        service.createBankTransfer(
          {
            sourceAccountId: accountId1,
            destinationAccountId: accountId1,
            amount: '50.00',
            transferType: 'internal',
          },
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('Source and destination accounts must be different');
    });

    it('should reject transfer with zero or negative amount', async () => {
      await expect(
        service.createBankTransfer(
          {
            sourceAccountId: accountId1,
            destinationAccountId: accountId2,
            amount: '0',
            transferType: 'internal',
          },
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('Transfer amount must be greater than zero');
    });

    it('should reject internal transfer with insufficient funds', async () => {
      await expect(
        service.createBankTransfer(
          {
            sourceAccountId: accountId2,
            destinationAccountId: accountId1,
            amount: '999999999.00',
            transferType: 'internal',
          },
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('Insufficient funds');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. Reconciliation flow: create bank statement → reconcile
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Reconciliation flow', () => {
    let statementId: string;

    it('should create a bank statement for an account', async () => {
      const statement = await service.createBankStatement(
        {
          bankAccountId: accountId1,
          statementDate: '2026-07-01',
          periodStart: '2026-06-01',
          periodEnd: '2026-06-30',
          openingBalance: '10000.00',
          closingBalance: '10500.00',
          importSource: 'csv',
          transactionCount: 15,
        },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );

      expect(statement.id).toBeDefined();
      expect(statement.bankAccountId).toBe(accountId1);
      expect(statement.importStatus).toBe('pending');
      expect(statement.openingBalance).toBe('10000.00');
      expect(statement.closingBalance).toBe('10500.00');

      statementId = statement.id;
    });

    it('should create and match a reconciliation entry', async () => {
      const entry = await service.createReconciliationEntry(
        {
          statementId,
          bankAccountId: accountId1,
          transactionDate: '2026-06-15',
          description: 'Wire from Acme Corp',
          amount: '2500.00',
          balanceAfter: '12500.00',
          transactionType: 'credit',
          referenceNumber: 'WIR-001',
        },
        TEST_TENANT_ID,
      );

      expect(entry.id).toBeDefined();
      expect(entry.reconciliationStatus).toBe('unmatched');
      expect(entry.statementId).toBe(statementId);

      const matched = await service.matchReconciliationEntry(
        entry.id,
        {
          matchedEntityId: '11111111-1111-1111-1111-111111111111',
          matchedEntityType: 'journal_entry',
          matchConfidence: '0.95',
        },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );

      expect(matched.reconciliationStatus).toBe('manually_matched');
      expect(matched.matchedEntityId).toBe('11111111-1111-1111-1111-111111111111');
      expect(matched.matchConfidence).toBe('0.95');
      expect(matched.reconciledBy).toBe(TEST_USER_ID);
      expect(matched.reconciledAt).toBeDefined();
    });

    it('should reject matching an already-matched entry', async () => {
      const entry = await service.createReconciliationEntry(
        {
          statementId,
          bankAccountId: accountId1,
          transactionDate: '2026-06-20',
          description: 'Duplicate match attempt',
          amount: '100.00',
          transactionType: 'debit',
        },
        TEST_TENANT_ID,
      );

      await service.matchReconciliationEntry(
        entry.id,
        {
          matchedEntityId: '22222222-2222-2222-2222-222222222222',
          matchedEntityType: 'journal_entry',
        },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );

      await expect(
        service.matchReconciliationEntry(
          entry.id,
          {
            matchedEntityId: '33333333-3333-3333-3333-333333333333',
            matchedEntityType: 'journal_entry',
          },
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('already matched');
    });

    it('should reject statement with overlapping period', async () => {
      await expect(
        service.createBankStatement(
          {
            bankAccountId: accountId1,
            statementDate: '2026-06-15',
            periodStart: '2026-06-10',
            periodEnd: '2026-06-25',
            openingBalance: '10000.00',
            closingBalance: '10500.00',
            importSource: 'manual',
          },
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('overlaps');
    });

    it('should auto-match reconciliation entries via bulk operation', async () => {
      const entry1 = await service.createReconciliationEntry(
        {
          statementId,
          bankAccountId: accountId1,
          transactionDate: '2026-06-22',
          description: 'Auto match 1',
          amount: '500.00',
          transactionType: 'credit',
        },
        TEST_TENANT_ID,
      );

      const entry2 = await service.createReconciliationEntry(
        {
          statementId,
          bankAccountId: accountId1,
          transactionDate: '2026-06-25',
          description: 'Auto match 2',
          amount: '750.00',
          transactionType: 'debit',
        },
        TEST_TENANT_ID,
      );

      const result = await service.autoMatchReconciliationEntries(
        statementId,
        TEST_TENANT_ID,
        TEST_USER_ID,
      );

      expect(result.matched).toBeGreaterThanOrEqual(2);

      const refreshed1 = await service.getReconciliationEntry(entry1.id, TEST_TENANT_ID);
      const refreshed2 = await service.getReconciliationEntry(entry2.id, TEST_TENANT_ID);
      expect(refreshed1.reconciliationStatus).toBe('auto_matched');
      expect(refreshed2.reconciliationStatus).toBe('auto_matched');
    });
  });
});
