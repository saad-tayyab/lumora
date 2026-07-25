import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OTHER_TENANT_ID, TEST_TENANT_ID, TEST_USER_ID } from '../../lib/test-utils';
import {
  createBankAccountFixture,
  createBankAccountInputFixture,
  createBankConnectionFixture,
  createBankConnectionInputFixture,
  createBankStatementFixture,
  createBankStatementInputFixture,
  createBankTransferFixture,
  createBankTransferInputFixture,
  createCurrencyFixture,
  createReconciliationEntryFixture,
  createReconciliationEntryInputFixture,
} from './fixtures/cash.fixture';

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

// ─── Mock Database Module ─────────────────────────────────────────────────

const mockTx = {
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: 'mock-id', status: 'active' }]),
    }),
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  }),
  delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  query: {},
};

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
  bankAccounts: createMockTable('bank_accounts'),
  bankTransfers: createMockTable('bank_transfers'),
  bankStatements: createMockTable('bank_statements'),
  reconciliationEntries: createMockTable('reconciliation_entries'),
  currencies: createMockTable('currencies'),
  bankConnections: createMockTable('bank_connections'),
}));

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: vi.fn(() => true),
    and: vi.fn(() => true),
    isNull: vi.fn(() => true),
    asc: vi.fn(() => ({})),
    desc: vi.fn(() => ({})),
    count: vi.fn(() => 0),
    sum: vi.fn(() => '0'),
  };
});

// ─── Mock Repo Module ─────────────────────────────────────────────────────

const {
  mockBankAccountRepo,
  mockBankTransferRepo,
  mockBankStatementRepo,
  mockReconciliationEntryRepo,
  mockCurrencyRepo,
  mockBankConnectionRepo,
} = vi.hoisted(() => ({
  mockBankAccountRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
    findByAccountNumber: vi.fn(),
    findDefault: vi.fn(),
    findByStatus: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    countActive: vi.fn(),
  },
  mockBankTransferRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
    findBySourceAccount: vi.fn(),
    findByDestinationAccount: vi.fn(),
    findPending: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
  mockBankStatementRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
    findByBankAccount: vi.fn(),
    findByDateRange: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  mockReconciliationEntryRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
    findByStatement: vi.fn(),
    findByBankAccount: vi.fn(),
    findUnmatched: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  mockCurrencyRepo: {
    findByCode: vi.fn(),
    findMany: vi.fn(),
    findActive: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  mockBankConnectionRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
    findByBankAccount: vi.fn(),
    findActiveByAccount: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
}));

vi.mock('./repo', () => ({
  bankAccountRepo: mockBankAccountRepo,
  bankTransferRepo: mockBankTransferRepo,
  bankStatementRepo: mockBankStatementRepo,
  reconciliationEntryRepo: mockReconciliationEntryRepo,
  currencyRepo: mockCurrencyRepo,
  bankConnectionRepo: mockBankConnectionRepo,
}));

// ─── Import Service After Mocking ─────────────────────────────────────────

import {
  BankAccountInactiveError,
  BankAccountNameConflictError,
  BankAccountNotFoundError,
  BankConnectionDuplicateError,
  BankConnectionNotFoundError,
  BankStatementInvalidPeriodError,
  BankStatementNotFoundError,
  BankStatementPeriodOverlapError,
  BankTransferInvalidStatusTransitionError,
  BankTransferNotFoundError,
  BusinessRuleViolationError,
  CurrencyNotFoundError,
  InsufficientFundsError,
  ReconciliationAlreadyMatchedError,
  ReconciliationEntryNotFoundError,
  ReconciliationMatchConfidenceError,
  TransferAmountZeroError,
  TransferSameAccountError,
} from './errors';
import * as service from './service';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Cash & Treasury Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BANK ACCOUNT SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Bank Account Service', () => {
    describe('createBankAccount', () => {
      it('should create bank account with default values', async () => {
        const input = createBankAccountInputFixture();
        const expected = createBankAccountFixture();

        mockBankAccountRepo.findMany.mockResolvedValue({ data: [], total: 0 });
        mockBankAccountRepo.findDefault.mockResolvedValue(undefined);
        mockBankAccountRepo.create.mockResolvedValue(expected);

        const result = await service.createBankAccount(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        // BR-610: account number is encrypted before storage
        expect(mockBankAccountRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            ...input,
            accountNumber: '**********4567',
            tenantId: TEST_TENANT_ID,
            currentBalance: '0',
            availableBalance: '0',
          }),
        );
      });

      it('should encrypt account number before storage (BR-610)', async () => {
        const input = createBankAccountInputFixture({ accountNumber: '12345678904567' });
        const expected = createBankAccountFixture({ accountNumber: '**********4567' });

        mockBankAccountRepo.findMany.mockResolvedValue({ data: [], total: 0 });
        mockBankAccountRepo.findDefault.mockResolvedValue(undefined);
        mockBankAccountRepo.create.mockResolvedValue(expected);

        const _result = await service.createBankAccount(input, TEST_TENANT_ID);

        expect(mockBankAccountRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ accountNumber: '**********4567' }),
        );
      });

      it('should encrypt short account numbers (4 or fewer digits)', async () => {
        const input = createBankAccountInputFixture({ accountNumber: '4567' });
        const expected = createBankAccountFixture({ accountNumber: '4567' });

        mockBankAccountRepo.findMany.mockResolvedValue({ data: [], total: 0 });
        mockBankAccountRepo.findDefault.mockResolvedValue(undefined);
        mockBankAccountRepo.create.mockResolvedValue(expected);

        await service.createBankAccount(input, TEST_TENANT_ID);

        expect(mockBankAccountRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ accountNumber: '4567' }),
        );
      });

      it('should reject duplicate account name within tenant', async () => {
        const input = createBankAccountInputFixture({ accountName: 'My Checking' });
        const existing = createBankAccountFixture({ accountName: 'My Checking' });

        mockBankAccountRepo.findMany.mockResolvedValue({ data: [existing], total: 1 });

        await expect(service.createBankAccount(input, TEST_TENANT_ID)).rejects.toThrow(
          BankAccountNameConflictError,
        );
      });

      it('should match account names case-insensitively', async () => {
        const input = createBankAccountInputFixture({ accountName: 'MY CHECKING' });
        const existing = createBankAccountFixture({ accountName: 'my checking' });

        mockBankAccountRepo.findMany.mockResolvedValue({ data: [existing], total: 1 });

        await expect(service.createBankAccount(input, TEST_TENANT_ID)).rejects.toThrow(
          BankAccountNameConflictError,
        );
      });

      it('should validate decimal precision for currentBalance (BR-609)', async () => {
        const input = createBankAccountInputFixture({ currentBalance: 'not-a-number' });

        mockBankAccountRepo.findMany.mockResolvedValue({ data: [], total: 0 });
        mockBankAccountRepo.findDefault.mockResolvedValue(undefined);

        await expect(service.createBankAccount(input, TEST_TENANT_ID)).rejects.toThrow(
          BusinessRuleViolationError,
        );
      });

      it('should reject negative currentBalance (BR-609)', async () => {
        const input = createBankAccountInputFixture({ currentBalance: '-100' });

        mockBankAccountRepo.findMany.mockResolvedValue({ data: [], total: 0 });
        mockBankAccountRepo.findDefault.mockResolvedValue(undefined);

        await expect(service.createBankAccount(input, TEST_TENANT_ID)).rejects.toThrow(
          BusinessRuleViolationError,
        );
      });

      it('should validate decimal precision for availableBalance (BR-609)', async () => {
        const input = createBankAccountInputFixture({ availableBalance: 'abc' });

        mockBankAccountRepo.findMany.mockResolvedValue({ data: [], total: 0 });
        mockBankAccountRepo.findDefault.mockResolvedValue(undefined);

        await expect(service.createBankAccount(input, TEST_TENANT_ID)).rejects.toThrow(
          BusinessRuleViolationError,
        );
      });

      it('should set as default and clear existing default', async () => {
        const input = createBankAccountInputFixture({ isDefault: true });
        const existingDefault = createBankAccountFixture({ id: 'old-default', isDefault: true });
        const expected = createBankAccountFixture({ isDefault: true });

        mockBankAccountRepo.findMany.mockResolvedValue({ data: [], total: 0 });
        mockBankAccountRepo.findDefault.mockResolvedValue(existingDefault);
        mockBankAccountRepo.update.mockResolvedValue({ ...existingDefault, isDefault: false });
        mockBankAccountRepo.create.mockResolvedValue(expected);

        const result = await service.createBankAccount(input, TEST_TENANT_ID);

        expect(result.isDefault).toBe(true);
        expect(mockBankAccountRepo.update).toHaveBeenCalledWith('old-default', TEST_TENANT_ID, {
          isDefault: false,
        });
      });

      it('should scope name uniqueness to tenant', async () => {
        const input = createBankAccountInputFixture({ accountName: 'My Checking' });
        const otherTenantAccount = createBankAccountFixture({ accountName: 'My Checking' });

        // Same name exists in OTHER tenant, not this one
        mockBankAccountRepo.findMany.mockImplementation(async (_tenantId: string) => {
          if (_tenantId === OTHER_TENANT_ID) return { data: [otherTenantAccount], total: 1 };
          return { data: [], total: 0 };
        });
        mockBankAccountRepo.findDefault.mockResolvedValue(undefined);
        mockBankAccountRepo.create.mockResolvedValue(createBankAccountFixture());

        const result = await service.createBankAccount(input, TEST_TENANT_ID);
        expect(result).toBeDefined();
        expect(mockBankAccountRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.anything(),
        );
      });

      it('should pass currencyCode from input', async () => {
        const input = createBankAccountInputFixture({ currencyCode: 'EUR' });
        const expected = createBankAccountFixture({ currencyCode: 'EUR' });

        mockBankAccountRepo.findMany.mockResolvedValue({ data: [], total: 0 });
        mockBankAccountRepo.findDefault.mockResolvedValue(undefined);
        mockBankAccountRepo.create.mockResolvedValue(expected);

        const result = await service.createBankAccount(input, TEST_TENANT_ID);
        expect(result.currencyCode).toBe('EUR');
      });
    });

    describe('getBankAccount', () => {
      it('should return bank account by id', async () => {
        const account = createBankAccountFixture();
        mockBankAccountRepo.findById.mockResolvedValue(account);

        const result = await service.getBankAccount(account.id, TEST_TENANT_ID);

        expect(result).toEqual(account);
        expect(mockBankAccountRepo.findById).toHaveBeenCalledWith(account.id, TEST_TENANT_ID);
      });

      it('should throw BankAccountNotFoundError for non-existent account', async () => {
        mockBankAccountRepo.findById.mockResolvedValue(undefined);

        await expect(service.getBankAccount('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          BankAccountNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockBankAccountRepo.findById.mockResolvedValue(undefined);

        await expect(service.getBankAccount('acct-1', OTHER_TENANT_ID)).rejects.toThrow(
          BankAccountNotFoundError,
        );
        expect(mockBankAccountRepo.findById).toHaveBeenCalledWith('acct-1', OTHER_TENANT_ID);
      });
    });

    describe('listBankAccounts', () => {
      it('should return paginated bank accounts', async () => {
        const accounts = [createBankAccountFixture()];
        mockBankAccountRepo.findMany.mockResolvedValue({
          data: accounts,
          total: 1,
          page: 1,
          limit: 20,
        });

        const result = await service.listBankAccounts(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no accounts exist', async () => {
        mockBankAccountRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listBankAccounts(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should pass tenantId to repo', async () => {
        mockBankAccountRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listBankAccounts(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockBankAccountRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.anything(),
        );
      });

      it('should pass filter params to repo', async () => {
        mockBankAccountRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listBankAccounts(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          status: 'active',
          search: 'Chase',
        });

        expect(mockBankAccountRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ status: 'active', search: 'Chase' }),
        );
      });
    });

    describe('updateBankAccount', () => {
      it('should update bank account', async () => {
        const existing = createBankAccountFixture();
        const updated = { ...existing, bankName: 'Wells Fargo' };

        mockBankAccountRepo.findById.mockResolvedValue(existing);
        mockBankAccountRepo.update.mockResolvedValue(updated);

        const result = await service.updateBankAccount(
          existing.id,
          { bankName: 'Wells Fargo' },
          TEST_TENANT_ID,
        );

        expect(result.bankName).toBe('Wells Fargo');
        expect(mockBankAccountRepo.update).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID, {
          bankName: 'Wells Fargo',
        });
      });

      it('should re-encrypt account number if changed (BR-610)', async () => {
        const existing = createBankAccountFixture();
        const updated = { ...existing, accountNumber: '**********9999' };

        mockBankAccountRepo.findById.mockResolvedValue(existing);
        mockBankAccountRepo.update.mockResolvedValue(updated);

        const _result = await service.updateBankAccount(
          existing.id,
          { accountNumber: '98765432109999' },
          TEST_TENANT_ID,
        );

        expect(mockBankAccountRepo.update).toHaveBeenCalledWith(
          existing.id,
          TEST_TENANT_ID,
          expect.objectContaining({ accountNumber: '**********9999' }),
        );
      });

      it('should throw BankAccountNotFoundError for non-existent account', async () => {
        mockBankAccountRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateBankAccount('non-existent', { bankName: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(BankAccountNotFoundError);
      });

      it('should throw BankAccountNotFoundError if update returns undefined', async () => {
        const existing = createBankAccountFixture();
        mockBankAccountRepo.findById.mockResolvedValue(existing);
        mockBankAccountRepo.update.mockResolvedValue(undefined);

        await expect(
          service.updateBankAccount(existing.id, { bankName: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(BankAccountNotFoundError);
      });

      it('should set as default and clear existing default', async () => {
        const existing = createBankAccountFixture({ isDefault: false });
        const existingDefault = createBankAccountFixture({ id: 'old-default', isDefault: true });
        const updated = { ...existing, isDefault: true };

        mockBankAccountRepo.findById.mockResolvedValue(existing);
        mockBankAccountRepo.findDefault.mockResolvedValue(existingDefault);
        mockBankAccountRepo.update
          .mockResolvedValueOnce({ ...existingDefault, isDefault: false })
          .mockResolvedValueOnce(updated);

        const result = await service.updateBankAccount(
          existing.id,
          { isDefault: true },
          TEST_TENANT_ID,
        );

        expect(result.isDefault).toBe(true);
      });

      it('should not clear default if updating the same default account', async () => {
        const existing = createBankAccountFixture({ isDefault: true });
        const updated = { ...existing, bankName: 'Updated Name' };

        mockBankAccountRepo.findById.mockResolvedValue(existing);
        mockBankAccountRepo.findDefault.mockResolvedValue(existing);
        mockBankAccountRepo.update.mockResolvedValue(updated);

        const _result = await service.updateBankAccount(
          existing.id,
          { isDefault: true, bankName: 'Updated Name' },
          TEST_TENANT_ID,
        );

        // Should not try to clear the default since it's the same account
        expect(mockBankAccountRepo.update).toHaveBeenCalledTimes(1);
      });

      it('should validate decimal precision for currentBalance (BR-609)', async () => {
        const existing = createBankAccountFixture();
        mockBankAccountRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateBankAccount(
            existing.id,
            { currentBalance: 'not-a-number' },
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(BusinessRuleViolationError);
      });

      it('should validate decimal precision for availableBalance (BR-609)', async () => {
        const existing = createBankAccountFixture();
        mockBankAccountRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateBankAccount(existing.id, { availableBalance: 'invalid' }, TEST_TENANT_ID),
        ).rejects.toThrow(BusinessRuleViolationError);
      });
    });

    describe('deleteBankAccount', () => {
      it('should soft delete bank account', async () => {
        const existing = createBankAccountFixture();
        mockBankAccountRepo.findById.mockResolvedValue(existing);
        mockBankAccountRepo.softDelete.mockResolvedValue(existing);

        await service.deleteBankAccount(existing.id, TEST_TENANT_ID);

        expect(mockBankAccountRepo.softDelete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should throw BankAccountNotFoundError for non-existent account', async () => {
        mockBankAccountRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteBankAccount('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          BankAccountNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockBankAccountRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteBankAccount('acct-1', OTHER_TENANT_ID)).rejects.toThrow(
          BankAccountNotFoundError,
        );
        expect(mockBankAccountRepo.findById).toHaveBeenCalledWith('acct-1', OTHER_TENANT_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BANK TRANSFER SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Bank Transfer Service', () => {
    describe('createBankTransfer', () => {
      it('should create transfer with pending status', async () => {
        const input = createBankTransferInputFixture();
        const sourceAccount = createBankAccountFixture({ currentBalance: '10000.0000' });
        const destAccount = createBankAccountFixture({
          id: input.destinationAccountId,
          currentBalance: '5000.0000',
        });
        const expected = createBankTransferFixture();

        mockBankAccountRepo.findById
          .mockResolvedValueOnce(sourceAccount)
          .mockResolvedValueOnce(destAccount);
        mockBankTransferRepo.create.mockResolvedValue(expected);

        const result = await service.createBankTransfer(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(result).toEqual(expected);
        expect(mockBankTransferRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            tenantId: TEST_TENANT_ID,
            createdBy: TEST_USER_ID,
            status: 'pending',
          }),
        );
      });

      it('should reject zero amount (CTR-CASH-003)', async () => {
        const input = createBankTransferInputFixture({ amount: '0' });
        const sourceAccount = createBankAccountFixture();

        mockBankAccountRepo.findById.mockResolvedValue(sourceAccount);

        await expect(
          service.createBankTransfer(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(TransferAmountZeroError);
      });

      it('should reject negative amount (CTR-CASH-003)', async () => {
        const input = createBankTransferInputFixture({ amount: '-100' });
        const sourceAccount = createBankAccountFixture();

        mockBankAccountRepo.findById.mockResolvedValue(sourceAccount);

        await expect(
          service.createBankTransfer(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(TransferAmountZeroError);
      });

      it('should reject NaN amount (CTR-CASH-003)', async () => {
        const input = createBankTransferInputFixture({ amount: 'abc' });
        const sourceAccount = createBankAccountFixture();

        mockBankAccountRepo.findById.mockResolvedValue(sourceAccount);

        await expect(
          service.createBankTransfer(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(TransferAmountZeroError);
      });

      it('should reject same source and destination account (CTR-CASH-004)', async () => {
        const accountId = 'bank-acct-00000000-0000-0000-000000000001';
        const input = createBankTransferInputFixture({
          sourceAccountId: accountId,
          destinationAccountId: accountId,
        });

        await expect(
          service.createBankTransfer(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(TransferSameAccountError);
      });

      it('should throw BankAccountNotFoundError for non-existent source', async () => {
        const input = createBankTransferInputFixture();
        mockBankAccountRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createBankTransfer(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(BankAccountNotFoundError);
      });

      it('should throw BankAccountNotFoundError for non-existent destination', async () => {
        const input = createBankTransferInputFixture();
        const sourceAccount = createBankAccountFixture();

        mockBankAccountRepo.findById
          .mockResolvedValueOnce(sourceAccount)
          .mockResolvedValueOnce(undefined);

        await expect(
          service.createBankTransfer(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(BankAccountNotFoundError);
      });

      it('should throw BankAccountInactiveError for inactive source', async () => {
        const input = createBankTransferInputFixture();
        const sourceAccount = createBankAccountFixture({ status: 'inactive' });

        mockBankAccountRepo.findById.mockResolvedValue(sourceAccount);

        await expect(
          service.createBankTransfer(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(BankAccountInactiveError);
      });

      it('should throw BankAccountInactiveError for inactive destination', async () => {
        const input = createBankTransferInputFixture();
        const sourceAccount = createBankAccountFixture({ status: 'active' });
        const destAccount = createBankAccountFixture({
          id: input.destinationAccountId,
          status: 'inactive',
        });

        mockBankAccountRepo.findById
          .mockResolvedValueOnce(sourceAccount)
          .mockResolvedValueOnce(destAccount);

        await expect(
          service.createBankTransfer(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(BankAccountInactiveError);
      });

      it('should check sufficient funds for internal transfers (InsufficientFundsError)', async () => {
        const input = createBankTransferInputFixture({
          amount: '50000.0000',
          transferType: 'internal',
        });
        const sourceAccount = createBankAccountFixture({ currentBalance: '1000.0000' });
        const destAccount = createBankAccountFixture({
          id: input.destinationAccountId,
          currentBalance: '5000.0000',
        });

        mockBankAccountRepo.findById
          .mockResolvedValueOnce(sourceAccount)
          .mockResolvedValueOnce(destAccount);

        await expect(
          service.createBankTransfer(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(InsufficientFundsError);
      });

      it('should not check sufficient funds for external transfers', async () => {
        const input = createBankTransferInputFixture({
          amount: '50000.0000',
          transferType: 'external',
        });
        const sourceAccount = createBankAccountFixture({ currentBalance: '100.0000' });
        const destAccount = createBankAccountFixture({
          id: input.destinationAccountId,
          currentBalance: '5000.0000',
        });
        const expected = createBankTransferFixture({ transferType: 'external' });

        mockBankAccountRepo.findById
          .mockResolvedValueOnce(sourceAccount)
          .mockResolvedValueOnce(destAccount);
        mockBankTransferRepo.create.mockResolvedValue(expected);

        const result = await service.createBankTransfer(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(result).toEqual(expected);
      });

      it('should use source account currency when not provided', async () => {
        const input = createBankTransferInputFixture({ currencyCode: undefined });
        const sourceAccount = createBankAccountFixture({ currencyCode: 'EUR' });
        const destAccount = createBankAccountFixture({
          id: input.destinationAccountId,
          currencyCode: 'USD',
        });
        const expected = createBankTransferFixture({ currencyCode: 'EUR' });

        mockBankAccountRepo.findById
          .mockResolvedValueOnce(sourceAccount)
          .mockResolvedValueOnce(destAccount);
        mockBankTransferRepo.create.mockResolvedValue(expected);

        await service.createBankTransfer(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockBankTransferRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ currencyCode: 'EUR' }),
        );
      });

      it('should validate amount decimal precision (BR-609)', async () => {
        // '100.00.00' parses to 100 but is not a clean decimal — however
        // Number.parseFloat('100.00.00') = 100, so we use a truly invalid string
        // that passes the NaN/<=0 check but fails validateDecimalPrecision.
        // Actually 'not-a-number' is caught by the NaN check first (TransferAmountZeroError).
        // To test BR-609 we need a negative value — but that's also caught by <=0.
        // The validateDecimalPrecision only catches NaN or negative, both already handled above.
        // So we verify that a non-parseable string gets caught by the amount check:
        const input = createBankTransferInputFixture({ amount: 'not-a-number' });
        const sourceAccount = createBankAccountFixture();

        mockBankAccountRepo.findById.mockResolvedValue(sourceAccount);

        await expect(
          service.createBankTransfer(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(TransferAmountZeroError);
      });
    });

    describe('getBankTransfer', () => {
      it('should return bank transfer by id', async () => {
        const transfer = createBankTransferFixture();
        mockBankTransferRepo.findById.mockResolvedValue(transfer);

        const result = await service.getBankTransfer(transfer.id, TEST_TENANT_ID);

        expect(result).toEqual(transfer);
        expect(mockBankTransferRepo.findById).toHaveBeenCalledWith(transfer.id, TEST_TENANT_ID);
      });

      it('should throw BankTransferNotFoundError for non-existent transfer', async () => {
        mockBankTransferRepo.findById.mockResolvedValue(undefined);

        await expect(service.getBankTransfer('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          BankTransferNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockBankTransferRepo.findById.mockResolvedValue(undefined);

        await expect(service.getBankTransfer('xfer-1', OTHER_TENANT_ID)).rejects.toThrow(
          BankTransferNotFoundError,
        );
        expect(mockBankTransferRepo.findById).toHaveBeenCalledWith('xfer-1', OTHER_TENANT_ID);
      });
    });

    describe('listBankTransfers', () => {
      it('should return paginated bank transfers', async () => {
        const transfers = [createBankTransferFixture()];
        mockBankTransferRepo.findMany.mockResolvedValue({
          data: transfers,
          total: 1,
          page: 1,
          limit: 20,
        });

        const result = await service.listBankTransfers(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no transfers exist', async () => {
        mockBankTransferRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listBankTransfers(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should pass filter params to repo', async () => {
        mockBankTransferRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listBankTransfers(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          status: 'pending',
          sourceAccountId: 'acct-1',
          destinationAccountId: 'acct-2',
        });

        expect(mockBankTransferRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({
            status: 'pending',
            sourceAccountId: 'acct-1',
            destinationAccountId: 'acct-2',
          }),
        );
      });
    });

    describe('completeBankTransfer', () => {
      it('should complete a pending transfer', async () => {
        const transfer = createBankTransferFixture({ status: 'pending', transferType: 'external' });
        const completed = { ...transfer, status: 'completed' };

        mockBankTransferRepo.findById.mockResolvedValue(transfer);
        mockBankTransferRepo.update.mockResolvedValue(completed);

        const result = await service.completeBankTransfer(transfer.id, TEST_TENANT_ID);

        expect(result.status).toBe('completed');
        expect(mockBankTransferRepo.update).toHaveBeenCalledWith(
          transfer.id,
          TEST_TENANT_ID,
          expect.objectContaining({ status: 'completed' }),
        );
      });

      it('should complete a processing transfer', async () => {
        const transfer = createBankTransferFixture({
          status: 'processing',
          transferType: 'external',
        });
        const completed = { ...transfer, status: 'completed' };

        mockBankTransferRepo.findById.mockResolvedValue(transfer);
        mockBankTransferRepo.update.mockResolvedValue(completed);

        const result = await service.completeBankTransfer(transfer.id, TEST_TENANT_ID);

        expect(result.status).toBe('completed');
      });

      it('should move funds for internal transfers', async () => {
        const sourceAccount = createBankAccountFixture({
          id: 'source-acct',
          currentBalance: '10000.0000',
          availableBalance: '9500.0000',
        });
        const destAccount = createBankAccountFixture({
          id: 'dest-acct',
          currentBalance: '5000.0000',
          availableBalance: '5000.0000',
        });
        const transfer = createBankTransferFixture({
          status: 'pending',
          transferType: 'internal',
          sourceAccountId: 'source-acct',
          destinationAccountId: 'dest-acct',
          amount: '2000.0000',
        });
        const completed = { ...transfer, status: 'completed' };

        mockBankTransferRepo.findById.mockResolvedValue(transfer);
        mockBankAccountRepo.findById
          .mockResolvedValueOnce(sourceAccount)
          .mockResolvedValueOnce(destAccount);
        mockBankAccountRepo.update
          .mockResolvedValueOnce({ ...sourceAccount, currentBalance: '8000.0000' })
          .mockResolvedValueOnce({ ...destAccount, currentBalance: '7000.0000' });
        mockBankTransferRepo.update.mockResolvedValue(completed);

        const result = await service.completeBankTransfer(transfer.id, TEST_TENANT_ID);

        expect(result.status).toBe('completed');
        expect(mockBankAccountRepo.update).toHaveBeenCalledWith(
          'source-acct',
          TEST_TENANT_ID,
          expect.objectContaining({
            currentBalance: '8000.0000',
            availableBalance: '8000.0000',
          }),
        );
        expect(mockBankAccountRepo.update).toHaveBeenCalledWith(
          'dest-acct',
          TEST_TENANT_ID,
          expect.objectContaining({
            currentBalance: '7000.0000',
            availableBalance: '7000.0000',
          }),
        );
      });

      it('should throw BankTransferNotFoundError for non-existent transfer', async () => {
        mockBankTransferRepo.findById.mockResolvedValue(undefined);

        await expect(service.completeBankTransfer('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          BankTransferNotFoundError,
        );
      });

      it('should reject completing a completed transfer (invalid transition)', async () => {
        const transfer = createBankTransferFixture({ status: 'completed' });
        mockBankTransferRepo.findById.mockResolvedValue(transfer);

        await expect(service.completeBankTransfer(transfer.id, TEST_TENANT_ID)).rejects.toThrow(
          BankTransferInvalidStatusTransitionError,
        );
      });

      it('should reject completing a failed transfer (invalid transition)', async () => {
        const transfer = createBankTransferFixture({ status: 'failed' });
        mockBankTransferRepo.findById.mockResolvedValue(transfer);

        await expect(service.completeBankTransfer(transfer.id, TEST_TENANT_ID)).rejects.toThrow(
          BankTransferInvalidStatusTransitionError,
        );
      });

      it('should reject completing a cancelled transfer (invalid transition)', async () => {
        const transfer = createBankTransferFixture({ status: 'cancelled' });
        mockBankTransferRepo.findById.mockResolvedValue(transfer);

        await expect(service.completeBankTransfer(transfer.id, TEST_TENANT_ID)).rejects.toThrow(
          BankTransferInvalidStatusTransitionError,
        );
      });

      it('should throw BankTransferNotFoundError if update returns undefined', async () => {
        const transfer = createBankTransferFixture({ status: 'pending', transferType: 'external' });
        mockBankTransferRepo.findById.mockResolvedValue(transfer);
        mockBankTransferRepo.update.mockResolvedValue(undefined);

        await expect(service.completeBankTransfer(transfer.id, TEST_TENANT_ID)).rejects.toThrow(
          BankTransferNotFoundError,
        );
      });
    });

    describe('cancelBankTransfer', () => {
      it('should cancel a pending transfer', async () => {
        const transfer = createBankTransferFixture({ status: 'pending' });
        const cancelled = { ...transfer, status: 'cancelled' };

        mockBankTransferRepo.findById.mockResolvedValue(transfer);
        mockBankTransferRepo.update.mockResolvedValue(cancelled);

        const result = await service.cancelBankTransfer(transfer.id, TEST_TENANT_ID);

        expect(result.status).toBe('cancelled');
        expect(mockBankTransferRepo.update).toHaveBeenCalledWith(transfer.id, TEST_TENANT_ID, {
          status: 'cancelled',
        });
      });

      it('should throw BankTransferNotFoundError for non-existent transfer', async () => {
        mockBankTransferRepo.findById.mockResolvedValue(undefined);

        await expect(service.cancelBankTransfer('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          BankTransferNotFoundError,
        );
      });

      it('should reject cancelling a failed transfer (invalid transition)', async () => {
        const transfer = createBankTransferFixture({ status: 'failed' });
        mockBankTransferRepo.findById.mockResolvedValue(transfer);

        await expect(service.cancelBankTransfer(transfer.id, TEST_TENANT_ID)).rejects.toThrow(
          BankTransferInvalidStatusTransitionError,
        );
      });

      it('should throw BankTransferNotFoundError if update returns undefined', async () => {
        const transfer = createBankTransferFixture({ status: 'pending' });
        mockBankTransferRepo.findById.mockResolvedValue(transfer);
        mockBankTransferRepo.update.mockResolvedValue(undefined);

        await expect(service.cancelBankTransfer(transfer.id, TEST_TENANT_ID)).rejects.toThrow(
          BankTransferNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockBankTransferRepo.findById.mockResolvedValue(undefined);

        await expect(service.cancelBankTransfer('xfer-1', OTHER_TENANT_ID)).rejects.toThrow(
          BankTransferNotFoundError,
        );
        expect(mockBankTransferRepo.findById).toHaveBeenCalledWith('xfer-1', OTHER_TENANT_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BANK STATEMENT SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Bank Statement Service', () => {
    describe('createBankStatement', () => {
      it('should create bank statement', async () => {
        const input = createBankStatementInputFixture();
        const bankAccount = createBankAccountFixture();
        const expected = createBankStatementFixture();

        mockBankAccountRepo.findById.mockResolvedValue(bankAccount);
        mockBankStatementRepo.findByBankAccount.mockResolvedValue([]);
        mockBankStatementRepo.create.mockResolvedValue(expected);

        const result = await service.createBankStatement(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(result).toEqual(expected);
        expect(mockBankStatementRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            tenantId: TEST_TENANT_ID,
            importedBy: TEST_USER_ID,
            transactionCount: 45,
            reconciledCount: 0,
          }),
        );
      });

      it('should throw BankAccountNotFoundError for non-existent bank account', async () => {
        const input = createBankStatementInputFixture();
        mockBankAccountRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createBankStatement(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(BankAccountNotFoundError);
      });

      it('should reject period end before or equal to period start (CTR-CASH-005)', async () => {
        const input = createBankStatementInputFixture({
          periodStart: '2026-06-30',
          periodEnd: '2026-06-01',
        });
        const bankAccount = createBankAccountFixture();

        mockBankAccountRepo.findById.mockResolvedValue(bankAccount);

        await expect(
          service.createBankStatement(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(BankStatementInvalidPeriodError);
      });

      it('should reject period end equal to period start (CTR-CASH-005)', async () => {
        const input = createBankStatementInputFixture({
          periodStart: '2026-06-01',
          periodEnd: '2026-06-01',
        });
        const bankAccount = createBankAccountFixture();

        mockBankAccountRepo.findById.mockResolvedValue(bankAccount);

        await expect(
          service.createBankStatement(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(BankStatementInvalidPeriodError);
      });

      it('should validate decimal precision for openingBalance (BR-609)', async () => {
        const input = createBankStatementInputFixture({ openingBalance: 'not-a-number' });
        const bankAccount = createBankAccountFixture();

        mockBankAccountRepo.findById.mockResolvedValue(bankAccount);

        await expect(
          service.createBankStatement(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(BusinessRuleViolationError);
      });

      it('should validate decimal precision for closingBalance (BR-609)', async () => {
        const input = createBankStatementInputFixture({ closingBalance: 'invalid' });
        const bankAccount = createBankAccountFixture();

        mockBankAccountRepo.findById.mockResolvedValue(bankAccount);

        await expect(
          service.createBankStatement(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(BusinessRuleViolationError);
      });

      it('should reject overlapping statement periods', async () => {
        const input = createBankStatementInputFixture({
          periodStart: '2026-06-15',
          periodEnd: '2026-07-15',
        });
        const bankAccount = createBankAccountFixture();
        const existingStatement = createBankStatementFixture({
          periodStart: '2026-06-01',
          periodEnd: '2026-06-30',
        });

        mockBankAccountRepo.findById.mockResolvedValue(bankAccount);
        mockBankStatementRepo.findByBankAccount.mockResolvedValue([existingStatement]);

        await expect(
          service.createBankStatement(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(BankStatementPeriodOverlapError);
      });

      it('should allow non-overlapping statement periods', async () => {
        const input = createBankStatementInputFixture({
          periodStart: '2026-07-01',
          periodEnd: '2026-07-31',
        });
        const bankAccount = createBankAccountFixture();
        const existingStatement = createBankStatementFixture({
          periodStart: '2026-06-01',
          periodEnd: '2026-06-30',
        });
        const expected = createBankStatementFixture({
          periodStart: '2026-07-01',
          periodEnd: '2026-07-31',
        });

        mockBankAccountRepo.findById.mockResolvedValue(bankAccount);
        mockBankStatementRepo.findByBankAccount.mockResolvedValue([existingStatement]);
        mockBankStatementRepo.create.mockResolvedValue(expected);

        const result = await service.createBankStatement(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(result).toEqual(expected);
      });

      it('should default transactionCount to 0 if not provided', async () => {
        const input = createBankStatementInputFixture({ transactionCount: undefined });
        const bankAccount = createBankAccountFixture();
        const expected = createBankStatementFixture({ transactionCount: 0 });

        mockBankAccountRepo.findById.mockResolvedValue(bankAccount);
        mockBankStatementRepo.findByBankAccount.mockResolvedValue([]);
        mockBankStatementRepo.create.mockResolvedValue(expected);

        await service.createBankStatement(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockBankStatementRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ transactionCount: 0 }),
        );
      });
    });

    describe('getBankStatement', () => {
      it('should return bank statement by id', async () => {
        const statement = createBankStatementFixture();
        mockBankStatementRepo.findById.mockResolvedValue(statement);

        const result = await service.getBankStatement(statement.id, TEST_TENANT_ID);

        expect(result).toEqual(statement);
        expect(mockBankStatementRepo.findById).toHaveBeenCalledWith(statement.id, TEST_TENANT_ID);
      });

      it('should throw BankStatementNotFoundError for non-existent statement', async () => {
        mockBankStatementRepo.findById.mockResolvedValue(undefined);

        await expect(service.getBankStatement('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          BankStatementNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockBankStatementRepo.findById.mockResolvedValue(undefined);

        await expect(service.getBankStatement('stmt-1', OTHER_TENANT_ID)).rejects.toThrow(
          BankStatementNotFoundError,
        );
        expect(mockBankStatementRepo.findById).toHaveBeenCalledWith('stmt-1', OTHER_TENANT_ID);
      });
    });

    describe('listBankStatements', () => {
      it('should return paginated bank statements', async () => {
        const statements = [createBankStatementFixture()];
        mockBankStatementRepo.findMany.mockResolvedValue({
          data: statements,
          total: 1,
          page: 1,
          limit: 20,
        });

        const result = await service.listBankStatements(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no statements exist', async () => {
        mockBankStatementRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listBankStatements(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should pass filter params to repo', async () => {
        mockBankStatementRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listBankStatements(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          bankAccountId: 'acct-1',
          importStatus: 'completed',
        });

        expect(mockBankStatementRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ bankAccountId: 'acct-1', importStatus: 'completed' }),
        );
      });
    });

    describe('updateBankStatement', () => {
      it('should update bank statement', async () => {
        const existing = createBankStatementFixture({ importStatus: 'pending' });
        const updated = { ...existing, openingBalance: '9500.0000' };

        mockBankStatementRepo.findById.mockResolvedValue(existing);
        mockBankStatementRepo.update.mockResolvedValue(updated);

        const result = await service.updateBankStatement(
          existing.id,
          { openingBalance: '9500.0000' },
          TEST_TENANT_ID,
        );

        expect(result.openingBalance).toBe('9500.0000');
      });

      it('should throw BankStatementNotFoundError for non-existent statement', async () => {
        mockBankStatementRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateBankStatement('non-existent', { openingBalance: '0' }, TEST_TENANT_ID),
        ).rejects.toThrow(BankStatementNotFoundError);
      });

      it('should reject updating a completed statement (BR-008)', async () => {
        const existing = createBankStatementFixture({ importStatus: 'completed' });
        mockBankStatementRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateBankStatement(existing.id, { openingBalance: '9500.0000' }, TEST_TENANT_ID),
        ).rejects.toThrow(BusinessRuleViolationError);
      });

      it('should validate period end after period start when changing period', async () => {
        const existing = createBankStatementFixture({ importStatus: 'pending' });
        mockBankStatementRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateBankStatement(
            existing.id,
            { periodStart: '2026-07-31', periodEnd: '2026-07-01' },
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(BankStatementInvalidPeriodError);
      });

      it('should use existing period dates when not changing them', async () => {
        const existing = createBankStatementFixture({
          importStatus: 'pending',
          periodStart: '2026-06-01',
          periodEnd: '2026-06-30',
        });
        const updated = { ...existing, openingBalance: '9500.0000' };

        mockBankStatementRepo.findById.mockResolvedValue(existing);
        mockBankStatementRepo.update.mockResolvedValue(updated);

        // Should not throw even though we're not providing period dates
        const result = await service.updateBankStatement(
          existing.id,
          { openingBalance: '9500.0000' },
          TEST_TENANT_ID,
        );

        expect(result.openingBalance).toBe('9500.0000');
      });

      it('should throw BankStatementNotFoundError if update returns undefined', async () => {
        const existing = createBankStatementFixture({ importStatus: 'pending' });
        mockBankStatementRepo.findById.mockResolvedValue(existing);
        mockBankStatementRepo.update.mockResolvedValue(undefined);

        await expect(
          service.updateBankStatement(existing.id, { openingBalance: '9500.0000' }, TEST_TENANT_ID),
        ).rejects.toThrow(BankStatementNotFoundError);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RECONCILIATION ENTRY SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Reconciliation Entry Service', () => {
    describe('createReconciliationEntry', () => {
      it('should create reconciliation entry with unmatched status', async () => {
        const input = createReconciliationEntryInputFixture();
        const statement = createBankStatementFixture();
        const bankAccount = createBankAccountFixture();
        const expected = createReconciliationEntryFixture();

        mockBankStatementRepo.findById.mockResolvedValue(statement);
        mockBankAccountRepo.findById.mockResolvedValue(bankAccount);
        mockReconciliationEntryRepo.create.mockResolvedValue(expected);

        const result = await service.createReconciliationEntry(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(mockReconciliationEntryRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID, reconciliationStatus: 'unmatched' }),
        );
      });

      it('should throw BankStatementNotFoundError for non-existent statement', async () => {
        const input = createReconciliationEntryInputFixture();
        mockBankStatementRepo.findById.mockResolvedValue(undefined);

        await expect(service.createReconciliationEntry(input, TEST_TENANT_ID)).rejects.toThrow(
          BankStatementNotFoundError,
        );
      });

      it('should throw BankAccountNotFoundError for non-existent bank account', async () => {
        const input = createReconciliationEntryInputFixture();
        const statement = createBankStatementFixture();

        mockBankStatementRepo.findById.mockResolvedValue(statement);
        mockBankAccountRepo.findById.mockResolvedValue(undefined);

        await expect(service.createReconciliationEntry(input, TEST_TENANT_ID)).rejects.toThrow(
          BankAccountNotFoundError,
        );
      });

      it('should validate amount decimal precision (BR-609)', async () => {
        const input = createReconciliationEntryInputFixture({ amount: 'not-a-number' });
        const statement = createBankStatementFixture();
        const bankAccount = createBankAccountFixture();

        mockBankStatementRepo.findById.mockResolvedValue(statement);
        mockBankAccountRepo.findById.mockResolvedValue(bankAccount);

        await expect(service.createReconciliationEntry(input, TEST_TENANT_ID)).rejects.toThrow(
          BusinessRuleViolationError,
        );
      });

      it('should reject negative amount (BR-609)', async () => {
        const input = createReconciliationEntryInputFixture({ amount: '-100' });
        const statement = createBankStatementFixture();
        const bankAccount = createBankAccountFixture();

        mockBankStatementRepo.findById.mockResolvedValue(statement);
        mockBankAccountRepo.findById.mockResolvedValue(bankAccount);

        await expect(service.createReconciliationEntry(input, TEST_TENANT_ID)).rejects.toThrow(
          BusinessRuleViolationError,
        );
      });
    });

    describe('getReconciliationEntry', () => {
      it('should return reconciliation entry by id', async () => {
        const entry = createReconciliationEntryFixture();
        mockReconciliationEntryRepo.findById.mockResolvedValue(entry);

        const result = await service.getReconciliationEntry(entry.id, TEST_TENANT_ID);

        expect(result).toEqual(entry);
        expect(mockReconciliationEntryRepo.findById).toHaveBeenCalledWith(entry.id, TEST_TENANT_ID);
      });

      it('should throw ReconciliationEntryNotFoundError for non-existent entry', async () => {
        mockReconciliationEntryRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.getReconciliationEntry('non-existent', TEST_TENANT_ID),
        ).rejects.toThrow(ReconciliationEntryNotFoundError);
      });

      it('should scope lookup to tenant', async () => {
        mockReconciliationEntryRepo.findById.mockResolvedValue(undefined);

        await expect(service.getReconciliationEntry('recon-1', OTHER_TENANT_ID)).rejects.toThrow(
          ReconciliationEntryNotFoundError,
        );
        expect(mockReconciliationEntryRepo.findById).toHaveBeenCalledWith(
          'recon-1',
          OTHER_TENANT_ID,
        );
      });
    });

    describe('listReconciliationEntries', () => {
      it('should return paginated reconciliation entries', async () => {
        const entries = [createReconciliationEntryFixture()];
        mockReconciliationEntryRepo.findMany.mockResolvedValue({
          data: entries,
          total: 1,
          page: 1,
          limit: 20,
        });

        const result = await service.listReconciliationEntries(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
        });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no entries exist', async () => {
        mockReconciliationEntryRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listReconciliationEntries(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
        });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should pass filter params to repo', async () => {
        mockReconciliationEntryRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listReconciliationEntries(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          statementId: 'stmt-1',
          bankAccountId: 'acct-1',
          reconciliationStatus: 'unmatched',
        });

        expect(mockReconciliationEntryRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({
            statementId: 'stmt-1',
            bankAccountId: 'acct-1',
            reconciliationStatus: 'unmatched',
          }),
        );
      });
    });

    describe('matchReconciliationEntry', () => {
      it('should match an unmatched entry', async () => {
        const entry = createReconciliationEntryFixture({ reconciliationStatus: 'unmatched' });
        const matched = {
          ...entry,
          reconciliationStatus: 'manually_matched',
          matchedEntityId: 'journal-entry-1',
          matchedEntityType: 'journal_entry',
          matchConfidence: '0.95',
          reconciledBy: TEST_USER_ID,
        };

        mockReconciliationEntryRepo.findById.mockResolvedValue(entry);
        mockReconciliationEntryRepo.update.mockResolvedValue(matched);

        const result = await service.matchReconciliationEntry(
          entry.id,
          {
            matchedEntityId: 'journal-entry-1',
            matchedEntityType: 'journal_entry',
            matchConfidence: '0.95',
          },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.reconciliationStatus).toBe('manually_matched');
        expect(result.matchedEntityId).toBe('journal-entry-1');
        expect(mockReconciliationEntryRepo.update).toHaveBeenCalledWith(
          entry.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            reconciliationStatus: 'manually_matched',
            reconciledBy: TEST_USER_ID,
          }),
        );
      });

      it('should default matchConfidence to 1.0 when not provided', async () => {
        const entry = createReconciliationEntryFixture({ reconciliationStatus: 'unmatched' });
        const matched = { ...entry, reconciliationStatus: 'manually_matched' };

        mockReconciliationEntryRepo.findById.mockResolvedValue(entry);
        mockReconciliationEntryRepo.update.mockResolvedValue(matched);

        await service.matchReconciliationEntry(
          entry.id,
          {
            matchedEntityId: 'journal-entry-1',
            matchedEntityType: 'journal_entry',
          },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(mockReconciliationEntryRepo.update).toHaveBeenCalledWith(
          entry.id,
          TEST_TENANT_ID,
          expect.objectContaining({ matchConfidence: '1.0' }),
        );
      });

      it('should throw ReconciliationEntryNotFoundError for non-existent entry', async () => {
        mockReconciliationEntryRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.matchReconciliationEntry(
            'non-existent',
            { matchedEntityId: 'je-1', matchedEntityType: 'journal_entry' },
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(ReconciliationEntryNotFoundError);
      });

      it('should throw ReconciliationAlreadyMatchedError if already matched', async () => {
        const entry = createReconciliationEntryFixture({
          reconciliationStatus: 'manually_matched',
        });
        mockReconciliationEntryRepo.findById.mockResolvedValue(entry);

        await expect(
          service.matchReconciliationEntry(
            entry.id,
            { matchedEntityId: 'je-1', matchedEntityType: 'journal_entry' },
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(ReconciliationAlreadyMatchedError);
      });

      it('should throw ReconciliationAlreadyMatchedError if auto_matched', async () => {
        const entry = createReconciliationEntryFixture({
          reconciliationStatus: 'auto_matched',
        });
        mockReconciliationEntryRepo.findById.mockResolvedValue(entry);

        await expect(
          service.matchReconciliationEntry(
            entry.id,
            { matchedEntityId: 'je-1', matchedEntityType: 'journal_entry' },
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(ReconciliationAlreadyMatchedError);
      });

      it('should reject invalid matchConfidence (negative)', async () => {
        const entry = createReconciliationEntryFixture({ reconciliationStatus: 'unmatched' });
        mockReconciliationEntryRepo.findById.mockResolvedValue(entry);

        await expect(
          service.matchReconciliationEntry(
            entry.id,
            {
              matchedEntityId: 'je-1',
              matchedEntityType: 'journal_entry',
              matchConfidence: '-0.1',
            },
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(ReconciliationMatchConfidenceError);
      });

      it('should reject invalid matchConfidence (greater than 1)', async () => {
        const entry = createReconciliationEntryFixture({ reconciliationStatus: 'unmatched' });
        mockReconciliationEntryRepo.findById.mockResolvedValue(entry);

        await expect(
          service.matchReconciliationEntry(
            entry.id,
            {
              matchedEntityId: 'je-1',
              matchedEntityType: 'journal_entry',
              matchConfidence: '1.5',
            },
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(ReconciliationMatchConfidenceError);
      });

      it('should reject non-numeric matchConfidence', async () => {
        const entry = createReconciliationEntryFixture({ reconciliationStatus: 'unmatched' });
        mockReconciliationEntryRepo.findById.mockResolvedValue(entry);

        await expect(
          service.matchReconciliationEntry(
            entry.id,
            {
              matchedEntityId: 'je-1',
              matchedEntityType: 'journal_entry',
              matchConfidence: 'abc',
            },
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(ReconciliationMatchConfidenceError);
      });

      it('should accept boundary matchConfidence values (0 and 1)', async () => {
        const entry = createReconciliationEntryFixture({ reconciliationStatus: 'unmatched' });
        const matched = { ...entry, reconciliationStatus: 'manually_matched' };

        mockReconciliationEntryRepo.findById.mockResolvedValue(entry);
        mockReconciliationEntryRepo.update.mockResolvedValue(matched);

        // Test confidence = 0
        await service.matchReconciliationEntry(
          entry.id,
          {
            matchedEntityId: 'je-1',
            matchedEntityType: 'journal_entry',
            matchConfidence: '0',
          },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(mockReconciliationEntryRepo.update).toHaveBeenCalled();
        vi.clearAllMocks();

        // Test confidence = 1
        mockReconciliationEntryRepo.findById.mockResolvedValue(entry);
        mockReconciliationEntryRepo.update.mockResolvedValue(matched);

        await service.matchReconciliationEntry(
          entry.id,
          {
            matchedEntityId: 'je-1',
            matchedEntityType: 'journal_entry',
            matchConfidence: '1',
          },
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(mockReconciliationEntryRepo.update).toHaveBeenCalled();
      });

      it('should throw ReconciliationEntryNotFoundError if update returns undefined', async () => {
        const entry = createReconciliationEntryFixture({ reconciliationStatus: 'unmatched' });
        mockReconciliationEntryRepo.findById.mockResolvedValue(entry);
        mockReconciliationEntryRepo.update.mockResolvedValue(undefined);

        await expect(
          service.matchReconciliationEntry(
            entry.id,
            { matchedEntityId: 'je-1', matchedEntityType: 'journal_entry' },
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(ReconciliationEntryNotFoundError);
      });
    });

    describe('excludeReconciliationEntry', () => {
      it('should exclude a reconciliation entry', async () => {
        const entry = createReconciliationEntryFixture({ reconciliationStatus: 'unmatched' });
        const excluded = {
          ...entry,
          reconciliationStatus: 'excluded',
          reconciledBy: TEST_USER_ID,
        };

        mockReconciliationEntryRepo.findById.mockResolvedValue(entry);
        mockReconciliationEntryRepo.update.mockResolvedValue(excluded);

        const result = await service.excludeReconciliationEntry(
          entry.id,
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.reconciliationStatus).toBe('excluded');
        expect(mockReconciliationEntryRepo.update).toHaveBeenCalledWith(
          entry.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            reconciliationStatus: 'excluded',
            reconciledBy: TEST_USER_ID,
          }),
        );
      });

      it('should throw ReconciliationEntryNotFoundError for non-existent entry', async () => {
        mockReconciliationEntryRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.excludeReconciliationEntry('non-existent', TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(ReconciliationEntryNotFoundError);
      });

      it('should throw ReconciliationEntryNotFoundError if update returns undefined', async () => {
        const entry = createReconciliationEntryFixture();
        mockReconciliationEntryRepo.findById.mockResolvedValue(entry);
        mockReconciliationEntryRepo.update.mockResolvedValue(undefined);

        await expect(
          service.excludeReconciliationEntry(entry.id, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(ReconciliationEntryNotFoundError);
      });
    });

    describe('disputeReconciliationEntry', () => {
      it('should dispute a reconciliation entry', async () => {
        const entry = createReconciliationEntryFixture({ reconciliationStatus: 'unmatched' });
        const disputed = {
          ...entry,
          reconciliationStatus: 'disputed',
          reconciledBy: TEST_USER_ID,
        };

        mockReconciliationEntryRepo.findById.mockResolvedValue(entry);
        mockReconciliationEntryRepo.update.mockResolvedValue(disputed);

        const result = await service.disputeReconciliationEntry(
          entry.id,
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.reconciliationStatus).toBe('disputed');
        expect(mockReconciliationEntryRepo.update).toHaveBeenCalledWith(
          entry.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            reconciliationStatus: 'disputed',
            reconciledBy: TEST_USER_ID,
          }),
        );
      });

      it('should throw ReconciliationEntryNotFoundError for non-existent entry', async () => {
        mockReconciliationEntryRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.disputeReconciliationEntry('non-existent', TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(ReconciliationEntryNotFoundError);
      });

      it('should throw ReconciliationEntryNotFoundError if update returns undefined', async () => {
        const entry = createReconciliationEntryFixture();
        mockReconciliationEntryRepo.findById.mockResolvedValue(entry);
        mockReconciliationEntryRepo.update.mockResolvedValue(undefined);

        await expect(
          service.disputeReconciliationEntry(entry.id, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(ReconciliationEntryNotFoundError);
      });
    });

    describe('autoMatchReconciliationEntries', () => {
      it('should auto-match unmatched entries', async () => {
        const statement = createBankStatementFixture();
        const entries = [
          createReconciliationEntryFixture({ reconciliationStatus: 'unmatched' }),
          createReconciliationEntryFixture({
            id: 'recon-00000000-0000-0000-000000000002',
            reconciliationStatus: 'unmatched',
          }),
        ];
        const updatedEntry = {
          ...entries[0],
          reconciliationStatus: 'auto_matched',
        };

        mockBankStatementRepo.findById.mockResolvedValue(statement);
        mockReconciliationEntryRepo.findByStatement.mockResolvedValue(entries);
        mockReconciliationEntryRepo.update.mockResolvedValue(updatedEntry);

        const result = await service.autoMatchReconciliationEntries(
          statement.id,
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.matched).toBe(2);
        expect(result.unmatched).toBe(0);
        expect(mockReconciliationEntryRepo.update).toHaveBeenCalledTimes(2);
      });

      it('should skip already matched entries', async () => {
        const statement = createBankStatementFixture();
        const entries = [
          createReconciliationEntryFixture({ reconciliationStatus: 'unmatched' }),
          createReconciliationEntryFixture({
            id: 'recon-00000000-0000-0000-000000000002',
            reconciliationStatus: 'manually_matched',
          }),
        ];
        const updatedEntry = {
          ...entries[0],
          reconciliationStatus: 'auto_matched',
        };

        mockBankStatementRepo.findById.mockResolvedValue(statement);
        mockReconciliationEntryRepo.findByStatement.mockResolvedValue(entries);
        mockReconciliationEntryRepo.update.mockResolvedValue(updatedEntry);

        const result = await service.autoMatchReconciliationEntries(
          statement.id,
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.matched).toBe(1);
        expect(result.unmatched).toBe(0);
        expect(mockReconciliationEntryRepo.update).toHaveBeenCalledTimes(1);
      });

      it('should count as unmatched if update returns undefined', async () => {
        const statement = createBankStatementFixture();
        const entries = [createReconciliationEntryFixture({ reconciliationStatus: 'unmatched' })];

        mockBankStatementRepo.findById.mockResolvedValue(statement);
        mockReconciliationEntryRepo.findByStatement.mockResolvedValue(entries);
        mockReconciliationEntryRepo.update.mockResolvedValue(undefined);

        const result = await service.autoMatchReconciliationEntries(
          statement.id,
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.matched).toBe(0);
        expect(result.unmatched).toBe(1);
      });

      it('should throw BankStatementNotFoundError for non-existent statement', async () => {
        mockBankStatementRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.autoMatchReconciliationEntries('non-existent', TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(BankStatementNotFoundError);
      });

      it('should return zero counts when no entries exist', async () => {
        const statement = createBankStatementFixture();

        mockBankStatementRepo.findById.mockResolvedValue(statement);
        mockReconciliationEntryRepo.findByStatement.mockResolvedValue([]);

        const result = await service.autoMatchReconciliationEntries(
          statement.id,
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.matched).toBe(0);
        expect(result.unmatched).toBe(0);
        expect(mockReconciliationEntryRepo.update).not.toHaveBeenCalled();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CURRENCY SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Currency Service', () => {
    describe('getCurrency', () => {
      it('should return currency by code', async () => {
        const currency = createCurrencyFixture();
        mockCurrencyRepo.findByCode.mockResolvedValue(currency);

        const result = await service.getCurrency('USD');

        expect(result).toEqual(currency);
        expect(mockCurrencyRepo.findByCode).toHaveBeenCalledWith('USD');
      });

      it('should throw CurrencyNotFoundError for non-existent currency', async () => {
        mockCurrencyRepo.findByCode.mockResolvedValue(undefined);

        await expect(service.getCurrency('XYZ')).rejects.toThrow(CurrencyNotFoundError);
      });
    });

    describe('listCurrencies', () => {
      it('should return paginated currencies', async () => {
        const currencies = [createCurrencyFixture()];
        mockCurrencyRepo.findMany.mockResolvedValue({
          data: currencies,
          total: 1,
          page: 1,
          limit: 50,
        });

        const result = await service.listCurrencies({ page: 1, limit: 50 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(50);
      });

      it('should return empty list when no currencies exist', async () => {
        mockCurrencyRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listCurrencies({ page: 1, limit: 50 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should pass params to repo', async () => {
        mockCurrencyRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listCurrencies({ page: 2, limit: 10 });

        expect(mockCurrencyRepo.findMany).toHaveBeenCalledWith({ page: 2, limit: 10 });
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BANK CONNECTION SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Bank Connection Service', () => {
    describe('createBankConnection', () => {
      it('should create bank connection', async () => {
        const input = createBankConnectionInputFixture();
        const bankAccount = createBankAccountFixture();
        const expected = createBankConnectionFixture();

        mockBankAccountRepo.findById.mockResolvedValue(bankAccount);
        mockBankConnectionRepo.findActiveByAccount.mockResolvedValue(undefined);
        mockBankConnectionRepo.create.mockResolvedValue(expected);

        const result = await service.createBankConnection(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(result).toEqual(expected);
        expect(mockBankConnectionRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            tenantId: TEST_TENANT_ID,
            createdBy: TEST_USER_ID,
            status: 'active',
            syncFrequency: 'daily',
          }),
        );
      });

      it('should throw BankAccountNotFoundError for non-existent bank account', async () => {
        const input = createBankConnectionInputFixture();
        mockBankAccountRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createBankConnection(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(BankAccountNotFoundError);
      });

      it('should throw BankConnectionDuplicateError for duplicate active connection', async () => {
        const input = createBankConnectionInputFixture();
        const bankAccount = createBankAccountFixture();
        const existingConnection = createBankConnectionFixture();

        mockBankAccountRepo.findById.mockResolvedValue(bankAccount);
        mockBankConnectionRepo.findActiveByAccount.mockResolvedValue(existingConnection);

        await expect(
          service.createBankConnection(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(BankConnectionDuplicateError);
      });

      it('should default syncFrequency to daily if not provided', async () => {
        const input = createBankConnectionInputFixture({ syncFrequency: undefined });
        const bankAccount = createBankAccountFixture();
        const expected = createBankConnectionFixture({ syncFrequency: 'daily' });

        mockBankAccountRepo.findById.mockResolvedValue(bankAccount);
        mockBankConnectionRepo.findActiveByAccount.mockResolvedValue(undefined);
        mockBankConnectionRepo.create.mockResolvedValue(expected);

        await service.createBankConnection(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockBankConnectionRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ syncFrequency: 'daily' }),
        );
      });

      it('should use provided syncFrequency', async () => {
        const input = createBankConnectionInputFixture({ syncFrequency: 'realtime' });
        const bankAccount = createBankAccountFixture();
        const expected = createBankConnectionFixture({ syncFrequency: 'realtime' });

        mockBankAccountRepo.findById.mockResolvedValue(bankAccount);
        mockBankConnectionRepo.findActiveByAccount.mockResolvedValue(undefined);
        mockBankConnectionRepo.create.mockResolvedValue(expected);

        await service.createBankConnection(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockBankConnectionRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ syncFrequency: 'realtime' }),
        );
      });
    });

    describe('getBankConnection', () => {
      it('should return bank connection by id', async () => {
        const connection = createBankConnectionFixture();
        mockBankConnectionRepo.findById.mockResolvedValue(connection);

        const result = await service.getBankConnection(connection.id, TEST_TENANT_ID);

        expect(result).toEqual(connection);
        expect(mockBankConnectionRepo.findById).toHaveBeenCalledWith(connection.id, TEST_TENANT_ID);
      });

      it('should throw BankConnectionNotFoundError for non-existent connection', async () => {
        mockBankConnectionRepo.findById.mockResolvedValue(undefined);

        await expect(service.getBankConnection('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          BankConnectionNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockBankConnectionRepo.findById.mockResolvedValue(undefined);

        await expect(service.getBankConnection('conn-1', OTHER_TENANT_ID)).rejects.toThrow(
          BankConnectionNotFoundError,
        );
        expect(mockBankConnectionRepo.findById).toHaveBeenCalledWith('conn-1', OTHER_TENANT_ID);
      });
    });

    describe('listBankConnections', () => {
      it('should return paginated bank connections', async () => {
        const connections = [createBankConnectionFixture()];
        mockBankConnectionRepo.findMany.mockResolvedValue({
          data: connections,
          total: 1,
          page: 1,
          limit: 20,
        });

        const result = await service.listBankConnections(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
        });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no connections exist', async () => {
        mockBankConnectionRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listBankConnections(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
        });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should pass filter params to repo', async () => {
        mockBankConnectionRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listBankConnections(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          bankAccountId: 'acct-1',
          status: 'active',
        });

        expect(mockBankConnectionRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ bankAccountId: 'acct-1', status: 'active' }),
        );
      });
    });

    describe('updateBankConnection', () => {
      it('should update bank connection', async () => {
        const existing = createBankConnectionFixture();
        const updated = { ...existing, syncFrequency: 'hourly' };

        mockBankConnectionRepo.findById.mockResolvedValue(existing);
        mockBankConnectionRepo.update.mockResolvedValue(updated);

        const result = await service.updateBankConnection(
          existing.id,
          { syncFrequency: 'hourly' },
          TEST_TENANT_ID,
        );

        expect(result.syncFrequency).toBe('hourly');
      });

      it('should throw BankConnectionNotFoundError for non-existent connection', async () => {
        mockBankConnectionRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateBankConnection('non-existent', { syncFrequency: 'hourly' }, TEST_TENANT_ID),
        ).rejects.toThrow(BankConnectionNotFoundError);
      });

      it('should throw BankConnectionNotFoundError if update returns undefined', async () => {
        const existing = createBankConnectionFixture();
        mockBankConnectionRepo.findById.mockResolvedValue(existing);
        mockBankConnectionRepo.update.mockResolvedValue(undefined);

        await expect(
          service.updateBankConnection(existing.id, { syncFrequency: 'hourly' }, TEST_TENANT_ID),
        ).rejects.toThrow(BankConnectionNotFoundError);
      });
    });

    describe('disableBankConnection', () => {
      it('should disable a bank connection', async () => {
        const existing = createBankConnectionFixture({ status: 'active' });
        const disabled = { ...existing, status: 'disabled' };

        mockBankConnectionRepo.findById.mockResolvedValue(existing);
        mockBankConnectionRepo.update.mockResolvedValue(disabled);

        const result = await service.disableBankConnection(existing.id, TEST_TENANT_ID);

        expect(result.status).toBe('disabled');
        expect(mockBankConnectionRepo.update).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID, {
          status: 'disabled',
        });
      });

      it('should throw BankConnectionNotFoundError for non-existent connection', async () => {
        mockBankConnectionRepo.findById.mockResolvedValue(undefined);

        await expect(service.disableBankConnection('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          BankConnectionNotFoundError,
        );
      });

      it('should throw BankConnectionNotFoundError if update returns undefined', async () => {
        const existing = createBankConnectionFixture();
        mockBankConnectionRepo.findById.mockResolvedValue(existing);
        mockBankConnectionRepo.update.mockResolvedValue(undefined);

        await expect(service.disableBankConnection(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          BankConnectionNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockBankConnectionRepo.findById.mockResolvedValue(undefined);

        await expect(service.disableBankConnection('conn-1', OTHER_TENANT_ID)).rejects.toThrow(
          BankConnectionNotFoundError,
        );
        expect(mockBankConnectionRepo.findById).toHaveBeenCalledWith('conn-1', OTHER_TENANT_ID);
      });
    });
  });
});
