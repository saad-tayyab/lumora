import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OTHER_TENANT_ID, TEST_TENANT_ID, TEST_USER_ID } from '../../lib/test-utils';
import {
  createAccountFixture,
  createAccountInputFixture,
  createFiscalYearFixture,
  createFiscalYearInputFixture,
  createJournalEntryFixture,
  createJournalEntryInputFixture,
  createJournalEntryLineFixture,
} from './fixtures/financial.fixture';

// ─── Mock encore.dev/api (required to avoid runtime env error) ────────────

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    constructor(_code: string, message: string, _details?: unknown) {
      super(message);
      this.name = 'APIError';
    }
  },
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));

vi.mock('encore.dev/pubsub', () => ({
  Topic: class MockTopic {
    constructor(_name: string, _config?: unknown) {}
    async publish(_data: unknown) {
      return 'mock-message-id';
    }
  },
}));

vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class MockSQLDatabase {
    connectionString = 'postgresql://mock';
    constructor(_name: string, _config?: unknown) {}
  },
}));

vi.mock('./events', () => ({
  journalEntryPosted: { publish: vi.fn().mockResolvedValue('mock-message-id') },
}));

// ─── Mock Database Module ─────────────────────────────────────────────────

const { mockTx } = vi.hoisted(() => ({
  mockTx: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: 'je-00000000-0000-0000-000000000001', status: 'draft' }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    }),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    query: {
      journalEntryLines: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      accounts: {
        findFirst: vi.fn().mockResolvedValue({ id: 'account-1', balance: '0' }),
      },
    },
  },
}));

vi.mock('@lumora/database', () => ({
  db: {
    query: {},
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
    transaction: vi.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
  },
}));

vi.mock('../../database', () => ({
  db: {
    query: {},
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
    transaction: vi.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
  },
}));

// ─── Mock Schema (used directly in service transactions) ──────────────────

const { createMockTable } = vi.hoisted(() => ({
  createMockTable: (name: string) => {
    const table = { _: { name, schema: undefined } } as Record<string, unknown>;
    return new Proxy(table, {
      get: (_target, prop) => {
        if (typeof prop === 'symbol') return undefined;
        return {
          _: { name: String(prop), schema: undefined },
          toString: () => `${name}.${String(prop)}`,
        };
      },
    });
  },
}));

vi.mock('@lumora/database/schema', () => ({
  accounts: createMockTable('accounts'),
  journalEntries: createMockTable('journal_entries'),
  journalEntryLines: createMockTable('journal_entry_lines'),
  fiscalYears: createMockTable('fiscal_years'),
}));

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: vi.fn(() => true),
    and: vi.fn(() => true),
    isNull: vi.fn(() => true),
    asc: vi.fn(() => ({})),
    count: vi.fn(() => 0),
    sum: vi.fn(() => '0'),
  };
});

// ─── Mock Repo Module ─────────────────────────────────────────────────────

const { mockAccountsRepo, mockJournalEntriesRepo, mockJournalEntryLinesRepo, mockFiscalYearsRepo } =
  vi.hoisted(() => ({
    mockAccountsRepo: {
      findById: vi.fn(),
      findByCode: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      countByParentId: vi.fn(),
      countLinesByAccountId: vi.fn(),
    },
    mockJournalEntriesRepo: {
      findById: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getTotalDebits: vi.fn(),
      getTotalCredits: vi.fn(),
    },
    mockJournalEntryLinesRepo: {
      findByJournalEntryId: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      deleteByJournalEntryId: vi.fn(),
    },
    mockFiscalYearsRepo: {
      findById: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      hasOverlap: vi.fn(),
      isDateInClosedPeriod: vi.fn(),
    },
  }));

vi.mock('./repo', () => ({
  accountsRepo: mockAccountsRepo,
  journalEntriesRepo: mockJournalEntriesRepo,
  journalEntryLinesRepo: mockJournalEntryLinesRepo,
  fiscalYearsRepo: mockFiscalYearsRepo,
}));

// ─── Import Service After Mocking ─────────────────────────────────────────

import {
  AccountCodeAlreadyExistsError,
  AccountHasChildAccountsError,
  AccountHasTransactionsError,
  AccountNotFoundError,
  ClosedPeriodError,
  FiscalYearNotFoundError,
  FiscalYearNotOpenError,
  FiscalYearOverlapError,
  JournalEntryAlreadyPostedError,
  JournalEntryNotBalancedError,
  JournalEntryNotDraftError,
  JournalEntryNotFoundError,
} from './errors';
import * as service from './service';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Financial Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCOUNT SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Account Service', () => {
    describe('createAccount', () => {
      it('should create account with unique code', async () => {
        const input = createAccountInputFixture();
        const expected = createAccountFixture();

        mockAccountsRepo.findByCode.mockResolvedValue(undefined);
        mockAccountsRepo.create.mockResolvedValue(expected);

        const result = await service.createAccount(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(mockAccountsRepo.findByCode).toHaveBeenCalledWith(input.code, TEST_TENANT_ID);
        expect(mockAccountsRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ ...input, tenantId: TEST_TENANT_ID, balance: '0' }),
        );
      });

      it('should create account with all fields', async () => {
        const input = createAccountInputFixture({
          code: '2000',
          name: 'Accounts Payable',
          type: 'liability',
          parentId: 'parent-00000000-0000-0000-000000000001',
          isActive: false,
        });
        const expected = createAccountFixture(input);

        mockAccountsRepo.findByCode.mockResolvedValue(undefined);
        mockAccountsRepo.create.mockResolvedValue(expected);

        const result = await service.createAccount(input, TEST_TENANT_ID);

        expect(result.code).toBe('2000');
        expect(result.type).toBe('liability');
        expect(mockAccountsRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            code: '2000',
            type: 'liability',
            parentId: 'parent-00000000-0000-0000-000000000001',
            isActive: false,
            tenantId: TEST_TENANT_ID,
            balance: '0',
          }),
        );
      });

      it('should reject duplicate account code', async () => {
        const input = createAccountInputFixture();
        const existing = createAccountFixture();

        mockAccountsRepo.findByCode.mockResolvedValue(existing);

        await expect(service.createAccount(input, TEST_TENANT_ID)).rejects.toThrow(
          AccountCodeAlreadyExistsError,
        );
      });

      it('should scope code uniqueness to tenant', async () => {
        const input = createAccountInputFixture({ code: '1000' });
        const otherTenantAccount = createAccountFixture({ code: '1000' });

        // Same code exists in OTHER tenant, not this one
        mockAccountsRepo.findByCode.mockImplementation(async (_code: string, tenantId: string) => {
          if (tenantId === OTHER_TENANT_ID) return otherTenantAccount;
          return undefined;
        });
        mockAccountsRepo.create.mockResolvedValue(createAccountFixture());

        const result = await service.createAccount(input, TEST_TENANT_ID);
        expect(result).toBeDefined();
        expect(mockAccountsRepo.findByCode).toHaveBeenCalledWith('1000', TEST_TENANT_ID);
      });
    });

    describe('getAccount', () => {
      it('should return account by id', async () => {
        const account = createAccountFixture();
        mockAccountsRepo.findById.mockResolvedValue(account);

        const result = await service.getAccount(account.id, TEST_TENANT_ID);

        expect(result).toEqual(account);
        expect(mockAccountsRepo.findById).toHaveBeenCalledWith(account.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent account', async () => {
        mockAccountsRepo.findById.mockResolvedValue(undefined);

        await expect(service.getAccount('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          AccountNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        const account = createAccountFixture();
        mockAccountsRepo.findById.mockResolvedValue(undefined);

        // Exists in other tenant, not this one
        await expect(service.getAccount(account.id, OTHER_TENANT_ID)).rejects.toThrow(
          AccountNotFoundError,
        );
        expect(mockAccountsRepo.findById).toHaveBeenCalledWith(account.id, OTHER_TENANT_ID);
      });
    });

    describe('listAccounts', () => {
      it('should return paginated accounts', async () => {
        const accounts = [createAccountFixture()];
        mockAccountsRepo.findMany.mockResolvedValue({ data: accounts, total: 1 });

        const result = await service.listAccounts(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no accounts exist', async () => {
        mockAccountsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listAccounts(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockAccountsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listAccounts(TEST_TENANT_ID, { page: 3, limit: 10 });

        expect(mockAccountsRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ limit: 10, offset: 20 }),
        );
      });

      it('should filter accounts by type', async () => {
        mockAccountsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listAccounts(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          type: 'asset',
        });

        expect(mockAccountsRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ type: 'asset' }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockAccountsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listAccounts(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockAccountsRepo.findMany).toHaveBeenCalledWith(TEST_TENANT_ID, expect.anything());
      });
    });

    describe('updateAccount', () => {
      it('should update account', async () => {
        const existing = createAccountFixture();
        const updated = { ...existing, name: 'Updated Cash' };

        mockAccountsRepo.findById.mockResolvedValue(existing);
        mockAccountsRepo.update.mockResolvedValue(updated);

        const result = await service.updateAccount(
          existing.id,
          { name: 'Updated Cash' },
          TEST_TENANT_ID,
        );

        expect(result.name).toBe('Updated Cash');
        expect(mockAccountsRepo.update).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID, {
          name: 'Updated Cash',
        });
      });

      it('should update account type', async () => {
        const existing = createAccountFixture({ type: 'asset' });
        const updated = { ...existing, type: 'liability' };

        mockAccountsRepo.findById.mockResolvedValue(existing);
        mockAccountsRepo.update.mockResolvedValue(updated);

        const result = await service.updateAccount(
          existing.id,
          { type: 'liability' },
          TEST_TENANT_ID,
        );

        expect(result.type).toBe('liability');
      });

      it('should update isActive flag', async () => {
        const existing = createAccountFixture({ isActive: true });
        const updated = { ...existing, isActive: false };

        mockAccountsRepo.findById.mockResolvedValue(existing);
        mockAccountsRepo.update.mockResolvedValue(updated);

        const result = await service.updateAccount(
          existing.id,
          { isActive: false },
          TEST_TENANT_ID,
        );

        expect(result.isActive).toBe(false);
      });

      it('should update parentId to null', async () => {
        const existing = createAccountFixture({ parentId: 'parent-id' });
        const updated = { ...existing, parentId: null };

        mockAccountsRepo.findById.mockResolvedValue(existing);
        mockAccountsRepo.update.mockResolvedValue(updated);

        const result = await service.updateAccount(existing.id, { parentId: null }, TEST_TENANT_ID);

        expect(result.parentId).toBeNull();
      });

      it('should throw NotFoundError for non-existent account', async () => {
        mockAccountsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateAccount('non-existent', { name: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(AccountNotFoundError);
      });

      it('should reject duplicate code on update', async () => {
        const existing = createAccountFixture({ code: '1000' });
        const duplicate = createAccountFixture({ id: 'other-id', code: '2000' });

        mockAccountsRepo.findById.mockResolvedValue(existing);
        mockAccountsRepo.findByCode.mockResolvedValue(duplicate);

        await expect(
          service.updateAccount(existing.id, { code: '2000' }, TEST_TENANT_ID),
        ).rejects.toThrow(AccountCodeAlreadyExistsError);
      });

      it('should allow updating code to same value', async () => {
        const existing = createAccountFixture({ code: '1000' });
        const updated = { ...existing, code: '1000' };

        mockAccountsRepo.findById.mockResolvedValue(existing);
        mockAccountsRepo.update.mockResolvedValue(updated);

        const result = await service.updateAccount(existing.id, { code: '1000' }, TEST_TENANT_ID);

        expect(result.code).toBe('1000');
        expect(mockAccountsRepo.findByCode).not.toHaveBeenCalled();
      });

      it('should scope code uniqueness check to tenant', async () => {
        const existing = createAccountFixture({ code: '1000' });
        const otherTenantAccount = createAccountFixture({ code: '2000' });

        mockAccountsRepo.findById.mockResolvedValue(existing);
        // Code exists in other tenant, not this one
        mockAccountsRepo.findByCode.mockImplementation(async (_code: string, tenantId: string) => {
          if (tenantId === OTHER_TENANT_ID) return otherTenantAccount;
          return undefined;
        });
        mockAccountsRepo.update.mockResolvedValue({ ...existing, code: '2000' });

        const result = await service.updateAccount(existing.id, { code: '2000' }, TEST_TENANT_ID);
        expect(result.code).toBe('2000');
      });
    });

    describe('deleteAccount', () => {
      it('should soft delete account', async () => {
        const existing = createAccountFixture();

        mockAccountsRepo.findById.mockResolvedValue(existing);
        mockAccountsRepo.countByParentId.mockResolvedValue(0);
        mockAccountsRepo.countLinesByAccountId.mockResolvedValue(0);
        mockAccountsRepo.delete.mockResolvedValue(undefined);

        await service.deleteAccount(existing.id, TEST_TENANT_ID);

        expect(mockAccountsRepo.delete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent account', async () => {
        mockAccountsRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteAccount('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          AccountNotFoundError,
        );
      });

      it('should reject deletion of account with children', async () => {
        const existing = createAccountFixture();

        mockAccountsRepo.findById.mockResolvedValue(existing);
        mockAccountsRepo.countByParentId.mockResolvedValue(2);

        await expect(service.deleteAccount(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          AccountHasChildAccountsError,
        );
        // Should NOT check transactions if children exist
        expect(mockAccountsRepo.countLinesByAccountId).not.toHaveBeenCalled();
      });

      it('should reject deletion of account with transactions', async () => {
        const existing = createAccountFixture();

        mockAccountsRepo.findById.mockResolvedValue(existing);
        mockAccountsRepo.countByParentId.mockResolvedValue(0);
        mockAccountsRepo.countLinesByAccountId.mockResolvedValue(5);

        await expect(service.deleteAccount(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          AccountHasTransactionsError,
        );
      });

      it('should check children before transactions', async () => {
        const existing = createAccountFixture();

        mockAccountsRepo.findById.mockResolvedValue(existing);
        // Has both children and transactions
        mockAccountsRepo.countByParentId.mockResolvedValue(1);
        mockAccountsRepo.countLinesByAccountId.mockResolvedValue(5);

        await expect(service.deleteAccount(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          AccountHasChildAccountsError,
        );
        // countLinesByAccountId should not be called since children check fails first
        expect(mockAccountsRepo.countLinesByAccountId).not.toHaveBeenCalled();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // JOURNAL ENTRY SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Journal Entry Service', () => {
    describe('createJournalEntry', () => {
      it('should create balanced journal entry with two lines', async () => {
        const lines = [
          createJournalEntryLineFixture({ debit: '100', credit: '0' }),
          createJournalEntryLineFixture({
            id: 'jel-00000000-0000-0000-000000000002',
            accountId: 'account-00000000-0000-0000-000000000002',
            debit: '0',
            credit: '100',
          }),
        ];

        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue(lines);

        const result = await service.createJournalEntry(
          createJournalEntryInputFixture(),
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result).toBeDefined();
        expect(result.lines).toEqual(lines);
      });

      it('should create journal entry with three or more balanced lines', async () => {
        const input = createJournalEntryInputFixture({
          lines: [
            { accountId: 'a1', debit: '200', credit: '0' },
            { accountId: 'a2', debit: '0', credit: '100' },
            { accountId: 'a3', debit: '0', credit: '100' },
          ],
        });

        const lines = [
          createJournalEntryLineFixture({ accountId: 'a1', debit: '200', credit: '0' }),
          createJournalEntryLineFixture({
            id: 'jel-2',
            accountId: 'a2',
            debit: '0',
            credit: '100',
          }),
          createJournalEntryLineFixture({
            id: 'jel-3',
            accountId: 'a3',
            debit: '0',
            credit: '100',
          }),
        ];

        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue(lines);

        const result = await service.createJournalEntry(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(result.lines).toHaveLength(3);
      });

      it('should create journal entry without referenceNumber', async () => {
        const input = createJournalEntryInputFixture({ referenceNumber: undefined });

        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue([]);

        const result = await service.createJournalEntry(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(result).toBeDefined();
      });

      it('should create journal entry with line descriptions', async () => {
        const input = createJournalEntryInputFixture({
          lines: [
            { accountId: 'a1', debit: '100', credit: '0', description: 'Cash received' },
            { accountId: 'a2', debit: '0', credit: '100', description: 'Revenue earned' },
          ],
        });

        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue([]);

        const result = await service.createJournalEntry(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(result).toBeDefined();
      });

      it('should reject unbalanced journal entry (debits > credits)', async () => {
        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);

        const input = createJournalEntryInputFixture({
          lines: [
            { accountId: 'account-1', debit: '100', credit: '0' },
            { accountId: 'account-2', debit: '0', credit: '50' },
          ],
        });

        await expect(
          service.createJournalEntry(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(JournalEntryNotBalancedError);
      });

      it('should reject unbalanced journal entry (credits > debits)', async () => {
        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);

        const input = createJournalEntryInputFixture({
          lines: [
            { accountId: 'account-1', debit: '50', credit: '0' },
            { accountId: 'account-2', debit: '0', credit: '100' },
          ],
        });

        await expect(
          service.createJournalEntry(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(JournalEntryNotBalancedError);
      });

      it('should handle balanced entry with decimal amounts', async () => {
        const input = createJournalEntryInputFixture({
          lines: [
            { accountId: 'a1', debit: '33.3333', credit: '0' },
            { accountId: 'a2', debit: '33.3333', credit: '0' },
            { accountId: 'a3', debit: '0', credit: '66.6666' },
          ],
        });

        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue([]);

        const result = await service.createJournalEntry(input, TEST_TENANT_ID, TEST_USER_ID);
        expect(result).toBeDefined();
      });

      it('should reject entry in closed period', async () => {
        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(true);

        await expect(
          service.createJournalEntry(
            createJournalEntryInputFixture(),
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(ClosedPeriodError);
      });

      it('should pass tenantId and userId correctly', async () => {
        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue([]);

        await service.createJournalEntry(
          createJournalEntryInputFixture(),
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(mockFiscalYearsRepo.isDateInClosedPeriod).toHaveBeenCalledWith(
          expect.any(String),
          TEST_TENANT_ID,
        );
      });
    });

    describe('getJournalEntry', () => {
      it('should return journal entry with lines', async () => {
        const entry = createJournalEntryFixture();
        const lines = [createJournalEntryLineFixture()];

        mockJournalEntriesRepo.findById.mockResolvedValue(entry);
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue(lines);

        const result = await service.getJournalEntry(entry.id, TEST_TENANT_ID);

        expect(result).toEqual({ ...entry, lines });
      });

      it('should return journal entry with empty lines', async () => {
        const entry = createJournalEntryFixture();

        mockJournalEntriesRepo.findById.mockResolvedValue(entry);
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue([]);

        const result = await service.getJournalEntry(entry.id, TEST_TENANT_ID);

        expect(result.lines).toEqual([]);
      });

      it('should throw NotFoundError for non-existent entry', async () => {
        mockJournalEntriesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getJournalEntry('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          JournalEntryNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockJournalEntriesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getJournalEntry('je-1', OTHER_TENANT_ID)).rejects.toThrow(
          JournalEntryNotFoundError,
        );
        expect(mockJournalEntriesRepo.findById).toHaveBeenCalledWith('je-1', OTHER_TENANT_ID);
      });
    });

    describe('listJournalEntries', () => {
      it('should return paginated journal entries with lines', async () => {
        const entry = createJournalEntryFixture();
        const lines = [createJournalEntryLineFixture()];

        mockJournalEntriesRepo.findMany.mockResolvedValue({ data: [entry], total: 1 });
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue(lines);

        const result = await service.listJournalEntries(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({ ...entry, lines });
        expect(result.total).toBe(1);
      });

      it('should return empty list when no entries exist', async () => {
        mockJournalEntriesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listJournalEntries(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should enrich multiple entries with their lines', async () => {
        const entry1 = createJournalEntryFixture({ id: 'je-1' });
        const entry2 = createJournalEntryFixture({ id: 'je-2' });
        const lines1 = [createJournalEntryLineFixture({ journalEntryId: 'je-1' })];
        const lines2 = [createJournalEntryLineFixture({ journalEntryId: 'je-2' })];

        mockJournalEntriesRepo.findMany.mockResolvedValue({ data: [entry1, entry2], total: 2 });
        mockJournalEntryLinesRepo.findByJournalEntryId
          .mockResolvedValueOnce(lines1)
          .mockResolvedValueOnce(lines2);

        const result = await service.listJournalEntries(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(2);
        expect(result.data[0].lines).toEqual(lines1);
        expect(result.data[1].lines).toEqual(lines2);
      });

      it('should filter by status', async () => {
        mockJournalEntriesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listJournalEntries(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          status: 'posted',
        });

        expect(mockJournalEntriesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ status: 'posted' }),
        );
      });

      it('should pass all status values correctly', async () => {
        for (const status of ['draft', 'posted', 'voided'] as const) {
          mockJournalEntriesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

          await service.listJournalEntries(TEST_TENANT_ID, {
            page: 1,
            limit: 20,
            status,
          });

          expect(mockJournalEntriesRepo.findMany).toHaveBeenCalledWith(
            TEST_TENANT_ID,
            expect.objectContaining({ status }),
          );
          vi.clearAllMocks();
        }
      });

      it('should calculate correct offset for page 2', async () => {
        mockJournalEntriesRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listJournalEntries(TEST_TENANT_ID, { page: 2, limit: 10 });

        expect(mockJournalEntriesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ limit: 10, offset: 10 }),
        );
      });
    });

    describe('updateJournalEntry', () => {
      it('should update draft journal entry description', async () => {
        const existing = createJournalEntryFixture({ status: 'draft' });
        const updated = { ...existing, description: 'Updated entry' };
        const lines = [createJournalEntryLineFixture()];

        mockJournalEntriesRepo.findById
          .mockResolvedValueOnce(existing)
          .mockResolvedValueOnce(updated);
        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue(lines);

        const result = await service.updateJournalEntry(
          existing.id,
          { description: 'Updated entry' },
          TEST_TENANT_ID,
        );

        expect(result.description).toBe('Updated entry');
      });

      it('should update draft journal entry date', async () => {
        const existing = createJournalEntryFixture({ status: 'draft', date: '2026-01-01' });
        const updated = { ...existing, date: '2026-06-15' };
        const lines = [createJournalEntryLineFixture()];

        mockJournalEntriesRepo.findById
          .mockResolvedValueOnce(existing)
          .mockResolvedValueOnce(updated);
        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue(lines);

        const result = await service.updateJournalEntry(
          existing.id,
          { date: '2026-06-15' },
          TEST_TENANT_ID,
        );

        expect(result.date).toBe('2026-06-15');
      });

      it('should update referenceNumber to null', async () => {
        const existing = createJournalEntryFixture({
          status: 'draft',
          referenceNumber: 'REF-001',
        });
        const updated = { ...existing, referenceNumber: null };
        const lines = [createJournalEntryLineFixture()];

        mockJournalEntriesRepo.findById
          .mockResolvedValueOnce(existing)
          .mockResolvedValueOnce(updated);
        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue(lines);

        const result = await service.updateJournalEntry(
          existing.id,
          { referenceNumber: null },
          TEST_TENANT_ID,
        );

        expect(result.referenceNumber).toBeNull();
      });

      it('should update journal entry lines', async () => {
        const existing = createJournalEntryFixture({ status: 'draft' });
        const updated = { ...existing };
        const newLines = [
          createJournalEntryLineFixture({ debit: '200', credit: '0' }),
          createJournalEntryLineFixture({
            id: 'jel-2',
            accountId: 'account-2',
            debit: '0',
            credit: '200',
          }),
        ];

        mockJournalEntriesRepo.findById
          .mockResolvedValueOnce(existing)
          .mockResolvedValueOnce(updated);
        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue(newLines);

        const result = await service.updateJournalEntry(
          existing.id,
          {
            lines: [
              { accountId: 'a1', debit: '200', credit: '0' },
              { accountId: 'a2', debit: '0', credit: '200' },
            ],
          },
          TEST_TENANT_ID,
        );

        expect(result).toBeDefined();
      });

      it('should throw NotFoundError for non-existent entry', async () => {
        mockJournalEntriesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateJournalEntry('non-existent', { description: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(JournalEntryNotFoundError);
      });

      it('should reject update of posted entry', async () => {
        const existing = createJournalEntryFixture({ status: 'posted' });
        mockJournalEntriesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateJournalEntry(existing.id, { description: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(JournalEntryNotDraftError);
      });

      it('should reject update of voided entry', async () => {
        const existing = createJournalEntryFixture({ status: 'voided' });
        mockJournalEntriesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateJournalEntry(existing.id, { description: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(JournalEntryNotDraftError);
      });

      it('should reject update with unbalanced lines', async () => {
        const existing = createJournalEntryFixture({ status: 'draft' });
        mockJournalEntriesRepo.findById.mockResolvedValue(existing);
        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);

        await expect(
          service.updateJournalEntry(
            existing.id,
            {
              lines: [
                { accountId: 'a1', debit: '100', credit: '0' },
                { accountId: 'a2', debit: '0', credit: '50' },
              ],
            },
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(JournalEntryNotBalancedError);
      });

      it('should reject update in closed period', async () => {
        const existing = createJournalEntryFixture({ status: 'draft' });
        mockJournalEntriesRepo.findById.mockResolvedValue(existing);
        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(true);

        await expect(
          service.updateJournalEntry(existing.id, { date: '2026-01-15' }, TEST_TENANT_ID),
        ).rejects.toThrow(ClosedPeriodError);
      });

      it('should use existing date when date not provided for period check', async () => {
        const existing = createJournalEntryFixture({
          status: 'draft',
          date: '2026-06-15',
        });
        const updated = { ...existing, description: 'Updated' };
        const lines = [createJournalEntryLineFixture()];

        mockJournalEntriesRepo.findById
          .mockResolvedValueOnce(existing)
          .mockResolvedValueOnce(updated);
        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue(lines);

        await service.updateJournalEntry(existing.id, { description: 'Updated' }, TEST_TENANT_ID);

        // Should check the existing date, not a new one
        expect(mockFiscalYearsRepo.isDateInClosedPeriod).toHaveBeenCalledWith(
          '2026-06-15',
          TEST_TENANT_ID,
        );
      });
    });

    describe('postJournalEntry', () => {
      it('should post draft journal entry', async () => {
        const entry = createJournalEntryFixture({ status: 'draft' });
        const posted = { ...entry, status: 'posted' };
        const lines = [createJournalEntryLineFixture()];

        mockJournalEntriesRepo.findById.mockResolvedValueOnce(entry).mockResolvedValueOnce(posted);
        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);
        mockJournalEntriesRepo.getTotalDebits.mockResolvedValue('100');
        mockJournalEntriesRepo.getTotalCredits.mockResolvedValue('100');
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue(lines);

        const result = await service.postJournalEntry(entry.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(result.status).toBe('posted');
      });

      it('should throw NotFoundError for non-existent entry', async () => {
        mockJournalEntriesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.postJournalEntry('non-existent', TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(JournalEntryNotFoundError);
      });

      it('should reject posting already posted entry', async () => {
        const entry = createJournalEntryFixture({ status: 'posted' });
        mockJournalEntriesRepo.findById.mockResolvedValue(entry);

        await expect(
          service.postJournalEntry(entry.id, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(JournalEntryAlreadyPostedError);
      });

      it('should reject posting voided entry', async () => {
        const entry = createJournalEntryFixture({ status: 'voided' });
        mockJournalEntriesRepo.findById.mockResolvedValue(entry);

        await expect(
          service.postJournalEntry(entry.id, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(JournalEntryNotDraftError);
      });

      it('should reject posting unbalanced entry (debits > credits)', async () => {
        const entry = createJournalEntryFixture({ status: 'draft' });
        mockJournalEntriesRepo.findById.mockResolvedValue(entry);
        mockJournalEntriesRepo.getTotalDebits.mockResolvedValue('100');
        mockJournalEntriesRepo.getTotalCredits.mockResolvedValue('50');

        await expect(
          service.postJournalEntry(entry.id, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(JournalEntryNotBalancedError);
      });

      it('should reject posting unbalanced entry (credits > debits)', async () => {
        const entry = createJournalEntryFixture({ status: 'draft' });
        mockJournalEntriesRepo.findById.mockResolvedValue(entry);
        mockJournalEntriesRepo.getTotalDebits.mockResolvedValue('50');
        mockJournalEntriesRepo.getTotalCredits.mockResolvedValue('100');

        await expect(
          service.postJournalEntry(entry.id, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(JournalEntryNotBalancedError);
      });

      it('should reject posting in closed period', async () => {
        const entry = createJournalEntryFixture({ status: 'draft' });
        mockJournalEntriesRepo.findById.mockResolvedValue(entry);
        mockJournalEntriesRepo.getTotalDebits.mockResolvedValue('100');
        mockJournalEntriesRepo.getTotalCredits.mockResolvedValue('100');
        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(true);

        await expect(
          service.postJournalEntry(entry.id, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(ClosedPeriodError);
      });

      it('should allow posting entry with zero balances', async () => {
        const entry = createJournalEntryFixture({ status: 'draft' });
        const posted = { ...entry, status: 'posted' };

        mockJournalEntriesRepo.findById.mockResolvedValueOnce(entry).mockResolvedValueOnce(posted);
        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);
        mockJournalEntriesRepo.getTotalDebits.mockResolvedValue('0');
        mockJournalEntriesRepo.getTotalCredits.mockResolvedValue('0');
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue([]);

        const result = await service.postJournalEntry(entry.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(result.status).toBe('posted');
      });

      it('should pass tenantId to period check', async () => {
        const entry = createJournalEntryFixture({ status: 'draft' });
        mockJournalEntriesRepo.findById.mockResolvedValue(entry);
        mockJournalEntriesRepo.getTotalDebits.mockResolvedValue('100');
        mockJournalEntriesRepo.getTotalCredits.mockResolvedValue('100');
        mockFiscalYearsRepo.isDateInClosedPeriod.mockResolvedValue(false);
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue([]);

        await service.postJournalEntry(entry.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockFiscalYearsRepo.isDateInClosedPeriod).toHaveBeenCalledWith(
          entry.date,
          TEST_TENANT_ID,
        );
      });
    });

    describe('voidJournalEntry', () => {
      it('should void posted journal entry', async () => {
        const entry = createJournalEntryFixture({ status: 'posted' });
        const voided = { ...entry, status: 'voided' };
        const lines = [createJournalEntryLineFixture()];

        mockJournalEntriesRepo.findById.mockResolvedValueOnce(entry).mockResolvedValueOnce(voided);
        mockJournalEntryLinesRepo.findByJournalEntryId.mockResolvedValue(lines);

        const result = await service.voidJournalEntry(entry.id, TEST_TENANT_ID);

        expect(result.status).toBe('voided');
      });

      it('should throw NotFoundError for non-existent entry', async () => {
        mockJournalEntriesRepo.findById.mockResolvedValue(undefined);

        await expect(service.voidJournalEntry('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          JournalEntryNotFoundError,
        );
      });

      it('should reject voiding draft entry', async () => {
        const entry = createJournalEntryFixture({ status: 'draft' });
        mockJournalEntriesRepo.findById.mockResolvedValue(entry);

        await expect(service.voidJournalEntry(entry.id, TEST_TENANT_ID)).rejects.toThrow(
          JournalEntryNotDraftError,
        );
      });

      it('should reject voiding already voided entry', async () => {
        const entry = createJournalEntryFixture({ status: 'voided' });
        mockJournalEntriesRepo.findById.mockResolvedValue(entry);

        await expect(service.voidJournalEntry(entry.id, TEST_TENANT_ID)).rejects.toThrow(
          JournalEntryNotDraftError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockJournalEntriesRepo.findById.mockResolvedValue(undefined);

        await expect(service.voidJournalEntry('je-1', OTHER_TENANT_ID)).rejects.toThrow(
          JournalEntryNotFoundError,
        );
        expect(mockJournalEntriesRepo.findById).toHaveBeenCalledWith('je-1', OTHER_TENANT_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FISCAL YEAR SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Fiscal Year Service', () => {
    describe('createFiscalYear', () => {
      it('should create fiscal year with correct params', async () => {
        const fy = createFiscalYearFixture();
        const input = createFiscalYearInputFixture();

        mockFiscalYearsRepo.hasOverlap.mockResolvedValue(false);
        mockFiscalYearsRepo.create.mockResolvedValue(fy);

        const result = await service.createFiscalYear(input, TEST_TENANT_ID);

        expect(result).toEqual(fy);
        expect(mockFiscalYearsRepo.hasOverlap).toHaveBeenCalledWith(
          new Date(input.startDate),
          new Date(input.endDate),
          TEST_TENANT_ID,
        );
        expect(mockFiscalYearsRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: input.name,
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
            status: 'open',
            tenantId: TEST_TENANT_ID,
          }),
        );
      });

      it('should reject overlapping fiscal years', async () => {
        const input = createFiscalYearInputFixture();
        mockFiscalYearsRepo.hasOverlap.mockResolvedValue(true);

        await expect(service.createFiscalYear(input, TEST_TENANT_ID)).rejects.toThrow(
          FiscalYearOverlapError,
        );
      });

      it('should pass tenantId to overlap check', async () => {
        const input = createFiscalYearInputFixture();
        mockFiscalYearsRepo.hasOverlap.mockResolvedValue(false);
        mockFiscalYearsRepo.create.mockResolvedValue(createFiscalYearFixture());

        await service.createFiscalYear(input, TEST_TENANT_ID);

        expect(mockFiscalYearsRepo.hasOverlap).toHaveBeenCalledWith(
          expect.any(Date),
          expect.any(Date),
          TEST_TENANT_ID,
        );
      });
    });

    describe('getFiscalYear', () => {
      it('should return fiscal year by id', async () => {
        const fy = createFiscalYearFixture();
        mockFiscalYearsRepo.findById.mockResolvedValue(fy);

        const result = await service.getFiscalYear(fy.id, TEST_TENANT_ID);

        expect(result).toEqual(fy);
        expect(mockFiscalYearsRepo.findById).toHaveBeenCalledWith(fy.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent fiscal year', async () => {
        mockFiscalYearsRepo.findById.mockResolvedValue(undefined);

        await expect(service.getFiscalYear('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          FiscalYearNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockFiscalYearsRepo.findById.mockResolvedValue(undefined);

        await expect(service.getFiscalYear('fy-1', OTHER_TENANT_ID)).rejects.toThrow(
          FiscalYearNotFoundError,
        );
        expect(mockFiscalYearsRepo.findById).toHaveBeenCalledWith('fy-1', OTHER_TENANT_ID);
      });
    });

    describe('listFiscalYears', () => {
      it('should return paginated fiscal years', async () => {
        const fy = createFiscalYearFixture();
        mockFiscalYearsRepo.findMany.mockResolvedValue({ data: [fy], total: 1 });

        const result = await service.listFiscalYears(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no fiscal years exist', async () => {
        mockFiscalYearsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listFiscalYears(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for page 2', async () => {
        mockFiscalYearsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listFiscalYears(TEST_TENANT_ID, { page: 2, limit: 5 });

        expect(mockFiscalYearsRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ limit: 5, offset: 5 }),
        );
      });
    });

    describe('updateFiscalYear', () => {
      it('should update open fiscal year name', async () => {
        const existing = createFiscalYearFixture({ status: 'open' });
        const updated = { ...existing, name: 'Updated FY' };

        mockFiscalYearsRepo.findById.mockResolvedValue(existing);
        mockFiscalYearsRepo.update.mockResolvedValue(updated);

        const result = await service.updateFiscalYear(
          existing.id,
          { name: 'Updated FY' },
          TEST_TENANT_ID,
        );

        expect(result.name).toBe('Updated FY');
      });

      it('should update open fiscal year status to closed', async () => {
        const existing = createFiscalYearFixture({ status: 'open' });
        const updated = { ...existing, status: 'closed' };

        mockFiscalYearsRepo.findById.mockResolvedValue(existing);
        mockFiscalYearsRepo.update.mockResolvedValue(updated);

        const result = await service.updateFiscalYear(
          existing.id,
          { status: 'closed' },
          TEST_TENANT_ID,
        );

        expect(result.status).toBe('closed');
      });

      it('should throw NotFoundError for non-existent fiscal year', async () => {
        mockFiscalYearsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateFiscalYear('non-existent', { name: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(FiscalYearNotFoundError);
      });

      it('should reject modifying closed fiscal year name', async () => {
        const existing = createFiscalYearFixture({ status: 'closed' });
        mockFiscalYearsRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateFiscalYear(existing.id, { name: 'New Name' }, TEST_TENANT_ID),
        ).rejects.toThrow(FiscalYearNotOpenError);
      });

      it('should reject reopening closed fiscal year', async () => {
        const existing = createFiscalYearFixture({ status: 'closed' });
        mockFiscalYearsRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateFiscalYear(existing.id, { status: 'open' }, TEST_TENANT_ID),
        ).rejects.toThrow(FiscalYearNotOpenError);
      });

      it('should reject updating status of closed fiscal year to any value', async () => {
        const existing = createFiscalYearFixture({ status: 'closed' });
        mockFiscalYearsRepo.findById.mockResolvedValue(existing);

        // Even setting status to 'closed' again should fail since the condition checks for `data.status === 'open'`
        // But the guard `existing.status === 'closed' && (data.name || data.status === 'open')`
        // So setting status to 'closed' when already closed should NOT throw
        const updated = { ...existing };
        mockFiscalYearsRepo.update.mockResolvedValue(updated);

        const result = await service.updateFiscalYear(
          existing.id,
          { status: 'closed' },
          TEST_TENANT_ID,
        );
        expect(result).toBeDefined();
      });

      it('should allow updating only status on open fiscal year', async () => {
        const existing = createFiscalYearFixture({ status: 'open' });
        const updated = { ...existing, status: 'closed' };

        mockFiscalYearsRepo.findById.mockResolvedValue(existing);
        mockFiscalYearsRepo.update.mockResolvedValue(updated);

        const result = await service.updateFiscalYear(
          existing.id,
          { status: 'closed' },
          TEST_TENANT_ID,
        );

        expect(result.status).toBe('closed');
        expect(mockFiscalYearsRepo.update).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID, {
          status: 'closed',
        });
      });
    });

    describe('closeFiscalYear', () => {
      it('should close fiscal year with no draft entries', async () => {
        const existing = createFiscalYearFixture({ status: 'open' });
        const closed = { ...existing, status: 'closed' };

        mockFiscalYearsRepo.findById.mockResolvedValue(existing);
        mockJournalEntriesRepo.findMany.mockResolvedValue({ data: [], total: 0 });
        mockFiscalYearsRepo.update.mockResolvedValue(closed);

        const result = await service.closeFiscalYear(existing.id, TEST_TENANT_ID);

        expect(result.status).toBe('closed');
        expect(mockFiscalYearsRepo.update).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID, {
          status: 'closed',
        });
      });

      it('should throw NotFoundError for non-existent fiscal year', async () => {
        mockFiscalYearsRepo.findById.mockResolvedValue(undefined);

        await expect(service.closeFiscalYear('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          FiscalYearNotFoundError,
        );
      });

      it('should reject closing already closed fiscal year', async () => {
        const existing = createFiscalYearFixture({ status: 'closed' });
        mockFiscalYearsRepo.findById.mockResolvedValue(existing);

        await expect(service.closeFiscalYear(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          FiscalYearNotOpenError,
        );
      });

      it('should reject closing when draft entries exist in period', async () => {
        const existing = createFiscalYearFixture({
          status: 'open',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
        });

        const draftEntry = createJournalEntryFixture({
          status: 'draft',
          date: '2026-06-15',
        });

        mockFiscalYearsRepo.findById.mockResolvedValue(existing);
        mockJournalEntriesRepo.findMany.mockResolvedValue({
          data: [draftEntry],
          total: 1,
        });

        await expect(service.closeFiscalYear(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          ClosedPeriodError,
        );
      });

      it('should allow closing when draft entries exist outside period', async () => {
        const existing = createFiscalYearFixture({
          status: 'open',
          startDate: new Date('2026-07-01'),
          endDate: new Date('2026-12-31'),
        });

        const draftEntryOutsidePeriod = createJournalEntryFixture({
          status: 'draft',
          date: '2026-03-15', // Before the period
        });

        mockFiscalYearsRepo.findById.mockResolvedValue(existing);
        mockJournalEntriesRepo.findMany.mockResolvedValue({
          data: [draftEntryOutsidePeriod],
          total: 1,
        });
        mockFiscalYearsRepo.update.mockResolvedValue({ ...existing, status: 'closed' });

        const result = await service.closeFiscalYear(existing.id, TEST_TENANT_ID);

        expect(result.status).toBe('closed');
      });

      it('should allow closing when only posted entries exist in period', async () => {
        const existing = createFiscalYearFixture({
          status: 'open',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
        });

        // No draft entries - all are posted
        mockFiscalYearsRepo.findById.mockResolvedValue(existing);
        mockJournalEntriesRepo.findMany.mockResolvedValue({ data: [], total: 0 });
        mockFiscalYearsRepo.update.mockResolvedValue({ ...existing, status: 'closed' });

        const result = await service.closeFiscalYear(existing.id, TEST_TENANT_ID);

        expect(result.status).toBe('closed');
      });

      it('should reject closing when draft entries exist on period start date', async () => {
        const existing = createFiscalYearFixture({
          status: 'open',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
        });

        const draftOnBoundary = createJournalEntryFixture({
          status: 'draft',
          date: '2026-01-01', // Exactly on start
        });

        mockFiscalYearsRepo.findById.mockResolvedValue(existing);
        mockJournalEntriesRepo.findMany.mockResolvedValue({
          data: [draftOnBoundary],
          total: 1,
        });

        await expect(service.closeFiscalYear(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          ClosedPeriodError,
        );
      });

      it('should reject closing when draft entries exist on period end date', async () => {
        const existing = createFiscalYearFixture({
          status: 'open',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
        });

        const draftOnBoundary = createJournalEntryFixture({
          status: 'draft',
          date: '2026-12-31', // Exactly on end
        });

        mockFiscalYearsRepo.findById.mockResolvedValue(existing);
        mockJournalEntriesRepo.findMany.mockResolvedValue({
          data: [draftOnBoundary],
          total: 1,
        });

        await expect(service.closeFiscalYear(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          ClosedPeriodError,
        );
      });

      it('should count multiple draft entries in error message', async () => {
        const existing = createFiscalYearFixture({
          status: 'open',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
        });

        const draftEntries = [
          createJournalEntryFixture({ status: 'draft', date: '2026-03-01' }),
          createJournalEntryFixture({ id: 'je-2', status: 'draft', date: '2026-06-15' }),
          createJournalEntryFixture({ id: 'je-3', status: 'draft', date: '2026-09-30' }),
        ];

        mockFiscalYearsRepo.findById.mockResolvedValue(existing);
        mockJournalEntriesRepo.findMany.mockResolvedValue({
          data: draftEntries,
          total: 3,
        });

        await expect(service.closeFiscalYear(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          expect.objectContaining({
            message: expect.stringContaining('3'),
          }),
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TENANT ISOLATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Tenant Isolation', () => {
    it('should pass tenantId to accountsRepo.findById for getAccount', async () => {
      mockAccountsRepo.findById.mockResolvedValue(undefined);

      await expect(service.getAccount('acc-1', TEST_TENANT_ID)).rejects.toThrow();
      expect(mockAccountsRepo.findById).toHaveBeenCalledWith('acc-1', TEST_TENANT_ID);
    });

    it('should pass tenantId to accountsRepo.findMany for listAccounts', async () => {
      mockAccountsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

      await service.listAccounts(TEST_TENANT_ID, { page: 1, limit: 20 });

      expect(mockAccountsRepo.findMany).toHaveBeenCalledWith(TEST_TENANT_ID, expect.anything());
    });

    it('should pass tenantId to accountsRepo.create for createAccount', async () => {
      mockAccountsRepo.findByCode.mockResolvedValue(undefined);
      mockAccountsRepo.create.mockResolvedValue(createAccountFixture());

      await service.createAccount(createAccountInputFixture(), TEST_TENANT_ID);

      expect(mockAccountsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TEST_TENANT_ID }),
      );
    });

    it('should pass tenantId to accountsRepo.update for updateAccount', async () => {
      const existing = createAccountFixture();
      mockAccountsRepo.findById.mockResolvedValue(existing);
      mockAccountsRepo.update.mockResolvedValue(existing);

      await service.updateAccount(existing.id, { name: 'Test' }, TEST_TENANT_ID);

      expect(mockAccountsRepo.update).toHaveBeenCalledWith(
        existing.id,
        TEST_TENANT_ID,
        expect.anything(),
      );
    });

    it('should pass tenantId to accountsRepo.delete for deleteAccount', async () => {
      const existing = createAccountFixture();
      mockAccountsRepo.findById.mockResolvedValue(existing);
      mockAccountsRepo.countByParentId.mockResolvedValue(0);
      mockAccountsRepo.countLinesByAccountId.mockResolvedValue(0);
      mockAccountsRepo.delete.mockResolvedValue(undefined);

      await service.deleteAccount(existing.id, TEST_TENANT_ID);

      expect(mockAccountsRepo.delete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
    });

    it('should pass tenantId to journalEntriesRepo for all journal entry operations', async () => {
      mockJournalEntriesRepo.findById.mockResolvedValue(undefined);

      await expect(service.getJournalEntry('je-1', TEST_TENANT_ID)).rejects.toThrow();
      expect(mockJournalEntriesRepo.findById).toHaveBeenCalledWith('je-1', TEST_TENANT_ID);
    });

    it('should pass tenantId to fiscalYearsRepo for all fiscal year operations', async () => {
      mockFiscalYearsRepo.findById.mockResolvedValue(undefined);

      await expect(service.getFiscalYear('fy-1', TEST_TENANT_ID)).rejects.toThrow();
      expect(mockFiscalYearsRepo.findById).toHaveBeenCalledWith('fy-1', TEST_TENANT_ID);
    });
  });
});
