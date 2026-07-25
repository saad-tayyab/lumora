import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { TEST_TENANT_ID, TEST_USER_ID } from '../../lib/test-utils';

vi.mock('encore.dev/api', () => {
  class MockAPIError extends Error {
    code: string;
    status: number;
    details?: Record<string, string[]>;
    constructor(code: string, message: string, opts?: { status?: number; details?: Record<string, string[]> }) {
      super(message);
      this.code = code;
      this.status = opts?.status ?? 500;
      this.details = opts?.details;
    }
    static unauthenticated(message: string) {
      return new MockAPIError('UNAUTHENTICATED', message, { status: 401 });
    }
    static notFound(message: string) {
      return new MockAPIError('NOT_FOUND', message, { status: 404 });
    }
    static invalidArgument(message: string) {
      return new MockAPIError('INVALID_ARGUMENT', message, { status: 400 });
    }
  }
  return {
    APIError: MockAPIError,
    api: vi.fn((_config: unknown, handler: unknown) => handler),
  };
});

vi.mock('~encore/auth', () => ({
  getAuthData: vi.fn(),
}));

vi.mock('./service', () => ({
  createBankAccount: vi.fn(),
  getBankAccount: vi.fn(),
  listBankAccounts: vi.fn(),
  updateBankAccount: vi.fn(),
  deleteBankAccount: vi.fn(),
  createBankTransfer: vi.fn(),
  getBankTransfer: vi.fn(),
  listBankTransfers: vi.fn(),
  completeBankTransfer: vi.fn(),
  cancelBankTransfer: vi.fn(),
  createBankStatement: vi.fn(),
  getBankStatement: vi.fn(),
  listBankStatements: vi.fn(),
  updateBankStatement: vi.fn(),
  createReconciliationEntry: vi.fn(),
  getReconciliationEntry: vi.fn(),
  listReconciliationEntries: vi.fn(),
  matchReconciliationEntry: vi.fn(),
  excludeReconciliationEntry: vi.fn(),
  disputeReconciliationEntry: vi.fn(),
  autoMatchReconciliationEntries: vi.fn(),
  getCurrency: vi.fn(),
  listCurrencies: vi.fn(),
  createBankConnection: vi.fn(),
  getBankConnection: vi.fn(),
  listBankConnections: vi.fn(),
  updateBankConnection: vi.fn(),
  disableBankConnection: vi.fn(),
}));

import { getAuthData } from '~encore/auth';
import * as service from './service';
import {
  createBankAccount,
  getBankAccount,
  listBankAccounts,
  updateBankAccount,
  deleteBankAccount,
  createBankTransfer,
  getBankTransfer,
  listBankTransfers,
  completeBankTransfer,
  cancelBankTransfer,
  createBankStatement,
  getBankStatement,
  listBankStatements,
  updateBankStatement,
  createReconciliationEntry,
  getReconciliationEntry,
  listReconciliationEntries,
  matchReconciliationEntry,
  excludeReconciliationEntry,
  disputeReconciliationEntry,
  autoMatchReconciliationEntries,
  getCurrency,
  listCurrencies,
  createBankConnection,
  getBankConnection,
  listBankConnections,
  updateBankConnection,
  disableBankConnection,
} from './api';

const mockGetAuthData = vi.mocked(getAuthData);
const mockAuth = { tenantId: TEST_TENANT_ID, userId: TEST_USER_ID };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthData.mockReturnValue(mockAuth);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Bank Account Tests ───────────────────────────────────────────────────────

describe('createBankAccount', () => {
  const validReq = {
    bankName: 'Chase',
    accountName: 'Operating',
    accountNumber: '1234567890',
    accountType: 'checking' as const,
    currencyCode: 'USD',
    currentBalance: '5000.00',
    availableBalance: '4800.00',
    isDefault: false,
  };

  it('creates a bank account with valid data', async () => {
    const account = { id: 'ba-1', bankName: 'Chase', accountName: 'Operating' };
    vi.mocked(service.createBankAccount).mockResolvedValue(account as never);

    const res = await (createBankAccount as Function)(validReq);

    expect(service.createBankAccount).toHaveBeenCalledWith(validReq, TEST_TENANT_ID);
    expect(res).toEqual(account);
  });

  it('applies default currency code when omitted', async () => {
    const req = { ...validReq, currencyCode: undefined };
    const account = { id: 'ba-1' };
    vi.mocked(service.createBankAccount).mockResolvedValue(account as never);

    await (createBankAccount as Function)(req);

    expect(service.createBankAccount).toHaveBeenCalled();
  });

  it('applies default isDefault when omitted', async () => {
    const req = { ...validReq, isDefault: undefined };
    const account = { id: 'ba-1' };
    vi.mocked(service.createBankAccount).mockResolvedValue(account as never);

    await (createBankAccount as Function)(req);

    expect(service.createBankAccount).toHaveBeenCalled();
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((createBankAccount as Function)(validReq)).rejects.toThrow('not authenticated');
  });

  it('rejects missing bankName', async () => {
    await expect(
      (createBankAccount as Function)({ ...validReq, bankName: '' }),
    ).rejects.toThrow();
  });

  it('rejects missing accountName', async () => {
    await expect(
      (createBankAccount as Function)({ ...validReq, accountName: '' }),
    ).rejects.toThrow();
  });

  it('rejects missing accountNumber', async () => {
    await expect(
      (createBankAccount as Function)({ ...validReq, accountNumber: '' }),
    ).rejects.toThrow();
  });

  it('rejects invalid accountType', async () => {
    await expect(
      (createBankAccount as Function)({ ...validReq, accountType: 'invalid' }),
    ).rejects.toThrow();
  });

  it('rejects currencyCode with wrong length', async () => {
    await expect(
      (createBankAccount as Function)({ ...validReq, currencyCode: 'US' }),
    ).rejects.toThrow();
  });

  it('propagates service errors', async () => {
    vi.mocked(service.createBankAccount).mockRejectedValue(new Error('name conflict'));

    await expect((createBankAccount as Function)(validReq)).rejects.toThrow('name conflict');
  });

  it('accepts all valid account types', async () => {
    for (const accountType of ['checking', 'savings', 'money_market', 'credit_line']) {
      vi.mocked(service.createBankAccount).mockResolvedValue({ id: 'ba-1' } as never);
      await (createBankAccount as Function)({ ...validReq, accountType });
      expect(service.createBankAccount).toHaveBeenCalled();
    }
  });
});

describe('getBankAccount', () => {
  it('returns a bank account by id', async () => {
    const account = { id: 'ba-1', bankName: 'Chase' };
    vi.mocked(service.getBankAccount).mockResolvedValue(account as never);

    const res = await (getBankAccount as Function)({ id: 'ba-1' });

    expect(service.getBankAccount).toHaveBeenCalledWith('ba-1', TEST_TENANT_ID);
    expect(res).toEqual(account);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((getBankAccount as Function)({ id: 'ba-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.getBankAccount).mockRejectedValue(new Error('not found'));

    await expect((getBankAccount as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });
});

describe('listBankAccounts', () => {
  it('returns paginated bank accounts', async () => {
    const result = { data: [], total: 0, page: 1, limit: 20 };
    vi.mocked(service.listBankAccounts).mockResolvedValue(result as never);

    const res = await (listBankAccounts as Function)({ page: 1, limit: 10 });

    expect(service.listBankAccounts).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 10,
      status: undefined,
      search: undefined,
    });
    expect(res).toEqual(result);
  });

  it('applies default pagination', async () => {
    vi.mocked(service.listBankAccounts).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never);

    await (listBankAccounts as Function)({});

    expect(service.listBankAccounts).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      status: undefined,
      search: undefined,
    });
  });

  it('passes status and search filters', async () => {
    vi.mocked(service.listBankAccounts).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never);

    await (listBankAccounts as Function)({ status: 'active', search: 'Chase' });

    expect(service.listBankAccounts).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      status: 'active',
      search: 'Chase',
    });
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((listBankAccounts as Function)({})).rejects.toThrow('not authenticated');
  });

  it('rejects limit exceeding 100', async () => {
    await expect((listBankAccounts as Function)({ limit: 200 })).rejects.toThrow();
  });

  it('rejects page less than 1', async () => {
    await expect((listBankAccounts as Function)({ page: 0 })).rejects.toThrow();
  });
});

describe('updateBankAccount', () => {
  it('updates a bank account', async () => {
    const account = { id: 'ba-1', bankName: 'Chase Updated' };
    vi.mocked(service.updateBankAccount).mockResolvedValue(account as never);

    const res = await (updateBankAccount as Function)({ id: 'ba-1', bankName: 'Chase Updated' });

    expect(service.updateBankAccount).toHaveBeenCalledWith('ba-1', { bankName: 'Chase Updated' }, TEST_TENANT_ID);
    expect(res).toEqual(account);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((updateBankAccount as Function)({ id: 'ba-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.updateBankAccount).mockRejectedValue(new Error('not found'));

    await expect((updateBankAccount as Function)({ id: 'bad', bankName: 'X' })).rejects.toThrow('not found');
  });

  it('rejects invalid status enum', async () => {
    await expect(
      (updateBankAccount as Function)({ id: 'ba-1', status: 'bogus' }),
    ).rejects.toThrow();
  });

  it('rejects invalid accountType enum', async () => {
    await expect(
      (updateBankAccount as Function)({ id: 'ba-1', accountType: 'bogus' }),
    ).rejects.toThrow();
  });

  it('accepts valid status values', async () => {
    for (const status of ['active', 'inactive', 'frozen', 'closed']) {
      vi.mocked(service.updateBankAccount).mockResolvedValue({ id: 'ba-1', status } as never);
      await (updateBankAccount as Function)({ id: 'ba-1', status });
      expect(service.updateBankAccount).toHaveBeenCalled();
    }
  });
});

describe('deleteBankAccount', () => {
  it('soft-deletes a bank account', async () => {
    vi.mocked(service.deleteBankAccount).mockResolvedValue(undefined);

    await (deleteBankAccount as Function)({ id: 'ba-1' });

    expect(service.deleteBankAccount).toHaveBeenCalledWith('ba-1', TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((deleteBankAccount as Function)({ id: 'ba-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.deleteBankAccount).mockRejectedValue(new Error('not found'));

    await expect((deleteBankAccount as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });
});

// ─── Bank Transfer Tests ──────────────────────────────────────────────────────

describe('createBankTransfer', () => {
  const UUID_A = '550e8400-e29b-41d4-a716-446655440000';
  const UUID_B = '660e8400-e29b-41d4-a716-446655440001';
  const validReq = {
    sourceAccountId: UUID_A,
    destinationAccountId: UUID_B,
    amount: '1000.00',
    currencyCode: 'USD',
    transferType: 'internal' as const,
    description: 'Rent payment',
  };

  it('creates a transfer with valid data', async () => {
    const transfer = { id: 'bt-1', status: 'pending' };
    vi.mocked(service.createBankTransfer).mockResolvedValue(transfer as never);

    const res = await (createBankTransfer as Function)(validReq);

    expect(service.createBankTransfer).toHaveBeenCalledWith(validReq, TEST_TENANT_ID, TEST_USER_ID);
    expect(res).toEqual(transfer);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((createBankTransfer as Function)(validReq)).rejects.toThrow('not authenticated');
  });

  it('rejects invalid sourceAccountId uuid', async () => {
    await expect(
      (createBankTransfer as Function)({ ...validReq, sourceAccountId: 'not-a-uuid' }),
    ).rejects.toThrow();
  });

  it('rejects invalid destinationAccountId uuid', async () => {
    await expect(
      (createBankTransfer as Function)({ ...validReq, destinationAccountId: 'not-a-uuid' }),
    ).rejects.toThrow();
  });

  it('rejects invalid transferType', async () => {
    await expect(
      (createBankTransfer as Function)({ ...validReq, transferType: 'bogus' }),
    ).rejects.toThrow();
  });

  it('accepts all valid transfer types', async () => {
    for (const transferType of ['internal', 'external', 'wire', 'ach', 'check']) {
      vi.mocked(service.createBankTransfer).mockResolvedValue({ id: 'bt-1' } as never);
      await (createBankTransfer as Function)({ ...validReq, transferType });
      expect(service.createBankTransfer).toHaveBeenCalled();
    }
  });

  it('propagates service errors', async () => {
    vi.mocked(service.createBankTransfer).mockRejectedValue(new Error('insufficient funds'));

    await expect((createBankTransfer as Function)(validReq)).rejects.toThrow('insufficient funds');
  });

  it('applies default currencyCode when omitted', async () => {
    vi.mocked(service.createBankTransfer).mockResolvedValue({ id: 'bt-1' } as never);

    await (createBankTransfer as Function)({ ...validReq, currencyCode: undefined });

    expect(service.createBankTransfer).toHaveBeenCalled();
  });
});

describe('getBankTransfer', () => {
  it('returns a transfer by id', async () => {
    const transfer = { id: 'bt-1', status: 'completed' };
    vi.mocked(service.getBankTransfer).mockResolvedValue(transfer as never);

    const res = await (getBankTransfer as Function)({ id: 'bt-1' });

    expect(service.getBankTransfer).toHaveBeenCalledWith('bt-1', TEST_TENANT_ID);
    expect(res).toEqual(transfer);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((getBankTransfer as Function)({ id: 'bt-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.getBankTransfer).mockRejectedValue(new Error('not found'));

    await expect((getBankTransfer as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });
});

describe('listBankTransfers', () => {
  it('returns paginated transfers', async () => {
    const result = { data: [], total: 0, page: 1, limit: 20 };
    vi.mocked(service.listBankTransfers).mockResolvedValue(result as never);

    const res = await (listBankTransfers as Function)({ page: 1, limit: 10 });

    expect(service.listBankTransfers).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 10,
      status: undefined,
      sourceAccountId: undefined,
      destinationAccountId: undefined,
    });
    expect(res).toEqual(result);
  });

  it('applies default pagination', async () => {
    vi.mocked(service.listBankTransfers).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never);

    await (listBankTransfers as Function)({});

    expect(service.listBankTransfers).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      status: undefined,
      sourceAccountId: undefined,
      destinationAccountId: undefined,
    });
  });

  it('passes status and account filters', async () => {
    const UUID_A = '550e8400-e29b-41d4-a716-446655440000';
    const UUID_B = '660e8400-e29b-41d4-a716-446655440001';
    vi.mocked(service.listBankTransfers).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never);

    await (listBankTransfers as Function)({
      status: 'pending',
      sourceAccountId: UUID_A,
      destinationAccountId: UUID_B,
    });

    expect(service.listBankTransfers).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      status: 'pending',
      sourceAccountId: UUID_A,
      destinationAccountId: UUID_B,
    });
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((listBankTransfers as Function)({})).rejects.toThrow('not authenticated');
  });

  it('rejects invalid sourceAccountId uuid', async () => {
    await expect(
      (listBankTransfers as Function)({ sourceAccountId: 'not-a-uuid' }),
    ).rejects.toThrow();
  });

  it('rejects invalid destinationAccountId uuid', async () => {
    await expect(
      (listBankTransfers as Function)({ destinationAccountId: 'not-a-uuid' }),
    ).rejects.toThrow();
  });
});

describe('completeBankTransfer', () => {
  it('completes a pending transfer', async () => {
    const transfer = { id: 'bt-1', status: 'completed' };
    vi.mocked(service.completeBankTransfer).mockResolvedValue(transfer as never);

    const res = await (completeBankTransfer as Function)({ id: 'bt-1' });

    expect(service.completeBankTransfer).toHaveBeenCalledWith('bt-1', TEST_TENANT_ID);
    expect(res).toEqual(transfer);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((completeBankTransfer as Function)({ id: 'bt-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.completeBankTransfer).mockRejectedValue(new Error('invalid status'));

    await expect((completeBankTransfer as Function)({ id: 'bad' })).rejects.toThrow('invalid status');
  });
});

describe('cancelBankTransfer', () => {
  it('cancels a pending transfer', async () => {
    const transfer = { id: 'bt-1', status: 'cancelled' };
    vi.mocked(service.cancelBankTransfer).mockResolvedValue(transfer as never);

    const res = await (cancelBankTransfer as Function)({ id: 'bt-1' });

    expect(service.cancelBankTransfer).toHaveBeenCalledWith('bt-1', TEST_TENANT_ID);
    expect(res).toEqual(transfer);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((cancelBankTransfer as Function)({ id: 'bt-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.cancelBankTransfer).mockRejectedValue(new Error('already completed'));

    await expect((cancelBankTransfer as Function)({ id: 'bad' })).rejects.toThrow('already completed');
  });
});

// ─── Bank Statement Tests ─────────────────────────────────────────────────────

describe('createBankStatement', () => {
  const UUID_A = '550e8400-e29b-41d4-a716-446655440000';
  const validReq = {
    bankAccountId: UUID_A,
    statementDate: '2026-01-31',
    periodStart: '2026-01-01',
    periodEnd: '2026-01-31',
    openingBalance: '10000.00',
    closingBalance: '12000.00',
    importSource: 'csv' as const,
    transactionCount: 50,
  };

  it('creates a statement with valid data', async () => {
    const statement = { id: 'bs-1', bankAccountId: UUID_A };
    vi.mocked(service.createBankStatement).mockResolvedValue(statement as never);

    const res = await (createBankStatement as Function)(validReq);

    expect(service.createBankStatement).toHaveBeenCalledWith(validReq, TEST_TENANT_ID, TEST_USER_ID);
    expect(res).toEqual(statement);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((createBankStatement as Function)(validReq)).rejects.toThrow('not authenticated');
  });

  it('rejects invalid bankAccountId uuid', async () => {
    await expect(
      (createBankStatement as Function)({ ...validReq, bankAccountId: 'not-a-uuid' }),
    ).rejects.toThrow();
  });

  it('rejects invalid importSource', async () => {
    await expect(
      (createBankStatement as Function)({ ...validReq, importSource: 'bogus' }),
    ).rejects.toThrow();
  });

  it('accepts all valid import sources', async () => {
    for (const importSource of ['api', 'csv', 'ofx', 'manual']) {
      vi.mocked(service.createBankStatement).mockResolvedValue({ id: 'bs-1' } as never);
      await (createBankStatement as Function)({ ...validReq, importSource });
      expect(service.createBankStatement).toHaveBeenCalled();
    }
  });

  it('propagates service errors', async () => {
    vi.mocked(service.createBankStatement).mockRejectedValue(new Error('account not found'));

    await expect((createBankStatement as Function)(validReq)).rejects.toThrow('account not found');
  });
});

describe('getBankStatement', () => {
  it('returns a statement by id', async () => {
    const statement = { id: 'bs-1', importStatus: 'completed' };
    vi.mocked(service.getBankStatement).mockResolvedValue(statement as never);

    const res = await (getBankStatement as Function)({ id: 'bs-1' });

    expect(service.getBankStatement).toHaveBeenCalledWith('bs-1', TEST_TENANT_ID);
    expect(res).toEqual(statement);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((getBankStatement as Function)({ id: 'bs-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.getBankStatement).mockRejectedValue(new Error('not found'));

    await expect((getBankStatement as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });
});

describe('listBankStatements', () => {
  it('returns paginated statements', async () => {
    const result = { data: [], total: 0, page: 1, limit: 20 };
    vi.mocked(service.listBankStatements).mockResolvedValue(result as never);

    const res = await (listBankStatements as Function)({ page: 1, limit: 10 });

    expect(service.listBankStatements).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 10,
      bankAccountId: undefined,
      importStatus: undefined,
    });
    expect(res).toEqual(result);
  });

  it('applies default pagination', async () => {
    vi.mocked(service.listBankStatements).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never);

    await (listBankStatements as Function)({});

    expect(service.listBankStatements).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      bankAccountId: undefined,
      importStatus: undefined,
    });
  });

  it('passes bankAccountId and importStatus filters', async () => {
    const UUID_A = '550e8400-e29b-41d4-a716-446655440000';
    vi.mocked(service.listBankStatements).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never);

    await (listBankStatements as Function)({ bankAccountId: UUID_A, importStatus: 'completed' });

    expect(service.listBankStatements).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      bankAccountId: UUID_A,
      importStatus: 'completed',
    });
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((listBankStatements as Function)({})).rejects.toThrow('not authenticated');
  });

  it('rejects invalid bankAccountId uuid', async () => {
    await expect(
      (listBankStatements as Function)({ bankAccountId: 'not-a-uuid' }),
    ).rejects.toThrow();
  });
});

describe('updateBankStatement', () => {
  it('updates a bank statement', async () => {
    const statement = { id: 'bs-1', importStatus: 'pending' };
    vi.mocked(service.updateBankStatement).mockResolvedValue(statement as never);

    const res = await (updateBankStatement as Function)({ id: 'bs-1', importStatus: 'pending' });

    expect(service.updateBankStatement).toHaveBeenCalledWith('bs-1', { importStatus: 'pending' }, TEST_TENANT_ID);
    expect(res).toEqual(statement);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((updateBankStatement as Function)({ id: 'bs-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.updateBankStatement).mockRejectedValue(new Error('not found'));

    await expect((updateBankStatement as Function)({ id: 'bad', importStatus: 'pending' })).rejects.toThrow('not found');
  });
});

// ─── Reconciliation Entry Tests ───────────────────────────────────────────────

describe('createReconciliationEntry', () => {
  const UUID_A = '550e8400-e29b-41d4-a716-446655440000';
  const UUID_B = '660e8400-e29b-41d4-a716-446655440001';
  const validReq = {
    statementId: UUID_A,
    bankAccountId: UUID_B,
    transactionDate: '2026-01-15',
    description: 'Wire transfer from client',
    amount: '2500.00',
    transactionType: 'credit' as const,
    referenceNumber: 'REF-001',
  };

  it('creates a reconciliation entry with valid data', async () => {
    const entry = { id: 're-1', reconciliationStatus: 'unmatched' };
    vi.mocked(service.createReconciliationEntry).mockResolvedValue(entry as never);

    const res = await (createReconciliationEntry as Function)(validReq);

    expect(service.createReconciliationEntry).toHaveBeenCalledWith(validReq, TEST_TENANT_ID);
    expect(res).toEqual(entry);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((createReconciliationEntry as Function)(validReq)).rejects.toThrow('not authenticated');
  });

  it('rejects invalid statementId uuid', async () => {
    await expect(
      (createReconciliationEntry as Function)({ ...validReq, statementId: 'not-a-uuid' }),
    ).rejects.toThrow();
  });

  it('rejects invalid bankAccountId uuid', async () => {
    await expect(
      (createReconciliationEntry as Function)({ ...validReq, bankAccountId: 'not-a-uuid' }),
    ).rejects.toThrow();
  });

  it('rejects invalid transactionType', async () => {
    await expect(
      (createReconciliationEntry as Function)({ ...validReq, transactionType: 'bogus' }),
    ).rejects.toThrow();
  });

  it('rejects empty description', async () => {
    await expect(
      (createReconciliationEntry as Function)({ ...validReq, description: '' }),
    ).rejects.toThrow();
  });

  it('accepts all valid transaction types', async () => {
    for (const transactionType of ['credit', 'debit', 'transfer', 'fee', 'interest']) {
      vi.mocked(service.createReconciliationEntry).mockResolvedValue({ id: 're-1' } as never);
      await (createReconciliationEntry as Function)({ ...validReq, transactionType });
      expect(service.createReconciliationEntry).toHaveBeenCalled();
    }
  });

  it('propagates service errors', async () => {
    vi.mocked(service.createReconciliationEntry).mockRejectedValue(new Error('statement not found'));

    await expect((createReconciliationEntry as Function)(validReq)).rejects.toThrow('statement not found');
  });
});

describe('getReconciliationEntry', () => {
  it('returns a reconciliation entry by id', async () => {
    const entry = { id: 're-1', reconciliationStatus: 'unmatched' };
    vi.mocked(service.getReconciliationEntry).mockResolvedValue(entry as never);

    const res = await (getReconciliationEntry as Function)({ id: 're-1' });

    expect(service.getReconciliationEntry).toHaveBeenCalledWith('re-1', TEST_TENANT_ID);
    expect(res).toEqual(entry);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((getReconciliationEntry as Function)({ id: 're-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.getReconciliationEntry).mockRejectedValue(new Error('not found'));

    await expect((getReconciliationEntry as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });
});

describe('listReconciliationEntries', () => {
  it('returns paginated reconciliation entries', async () => {
    const result = { data: [], total: 0, page: 1, limit: 20 };
    vi.mocked(service.listReconciliationEntries).mockResolvedValue(result as never);

    const res = await (listReconciliationEntries as Function)({ page: 1, limit: 10 });

    expect(service.listReconciliationEntries).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 10,
      statementId: undefined,
      bankAccountId: undefined,
      reconciliationStatus: undefined,
    });
    expect(res).toEqual(result);
  });

  it('applies default pagination', async () => {
    vi.mocked(service.listReconciliationEntries).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never);

    await (listReconciliationEntries as Function)({});

    expect(service.listReconciliationEntries).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      statementId: undefined,
      bankAccountId: undefined,
      reconciliationStatus: undefined,
    });
  });

  it('passes all filters', async () => {
    const UUID_A = '550e8400-e29b-41d4-a716-446655440000';
    const UUID_B = '660e8400-e29b-41d4-a716-446655440001';
    vi.mocked(service.listReconciliationEntries).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never);

    await (listReconciliationEntries as Function)({
      statementId: UUID_A,
      bankAccountId: UUID_B,
      reconciliationStatus: 'matched',
    });

    expect(service.listReconciliationEntries).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      statementId: UUID_A,
      bankAccountId: UUID_B,
      reconciliationStatus: 'matched',
    });
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((listReconciliationEntries as Function)({})).rejects.toThrow('not authenticated');
  });

  it('rejects invalid statementId uuid', async () => {
    await expect(
      (listReconciliationEntries as Function)({ statementId: 'not-a-uuid' }),
    ).rejects.toThrow();
  });

  it('rejects invalid bankAccountId uuid', async () => {
    await expect(
      (listReconciliationEntries as Function)({ bankAccountId: 'not-a-uuid' }),
    ).rejects.toThrow();
  });
});

describe('matchReconciliationEntry', () => {
  const UUID_A = '550e8400-e29b-41d4-a716-446655440000';
  const validReq = {
    matchedEntityId: UUID_A,
    matchedEntityType: 'journal_entry',
    matchConfidence: '0.95',
  };

  it('matches a reconciliation entry', async () => {
    const entry = { id: 're-1', reconciliationStatus: 'manually_matched' };
    vi.mocked(service.matchReconciliationEntry).mockResolvedValue(entry as never);

    const res = await (matchReconciliationEntry as Function)({ id: 're-1', ...validReq });

    expect(service.matchReconciliationEntry).toHaveBeenCalledWith('re-1', validReq, TEST_TENANT_ID, TEST_USER_ID);
    expect(res).toEqual(entry);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (matchReconciliationEntry as Function)({ id: 're-1', ...validReq }),
    ).rejects.toThrow('not authenticated');
  });

  it('rejects invalid matchedEntityId uuid', async () => {
    await expect(
      (matchReconciliationEntry as Function)({ id: 're-1', ...validReq, matchedEntityId: 'not-a-uuid' }),
    ).rejects.toThrow();
  });

  it('rejects empty matchedEntityType', async () => {
    await expect(
      (matchReconciliationEntry as Function)({ id: 're-1', ...validReq, matchedEntityType: '' }),
    ).rejects.toThrow();
  });

  it('propagates service errors', async () => {
    vi.mocked(service.matchReconciliationEntry).mockRejectedValue(new Error('entry already matched'));

    await expect(
      (matchReconciliationEntry as Function)({ id: 're-1', ...validReq }),
    ).rejects.toThrow('entry already matched');
  });
});

describe('excludeReconciliationEntry', () => {
  it('excludes a reconciliation entry', async () => {
    const entry = { id: 're-1', reconciliationStatus: 'excluded' };
    vi.mocked(service.excludeReconciliationEntry).mockResolvedValue(entry as never);

    const res = await (excludeReconciliationEntry as Function)({ id: 're-1' });

    expect(service.excludeReconciliationEntry).toHaveBeenCalledWith('re-1', TEST_TENANT_ID, TEST_USER_ID);
    expect(res).toEqual(entry);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((excludeReconciliationEntry as Function)({ id: 're-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.excludeReconciliationEntry).mockRejectedValue(new Error('not found'));

    await expect((excludeReconciliationEntry as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });
});

describe('disputeReconciliationEntry', () => {
  it('disputes a reconciliation entry', async () => {
    const entry = { id: 're-1', reconciliationStatus: 'disputed' };
    vi.mocked(service.disputeReconciliationEntry).mockResolvedValue(entry as never);

    const res = await (disputeReconciliationEntry as Function)({ id: 're-1' });

    expect(service.disputeReconciliationEntry).toHaveBeenCalledWith('re-1', TEST_TENANT_ID, TEST_USER_ID);
    expect(res).toEqual(entry);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((disputeReconciliationEntry as Function)({ id: 're-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.disputeReconciliationEntry).mockRejectedValue(new Error('not found'));

    await expect((disputeReconciliationEntry as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });
});

describe('autoMatchReconciliationEntries', () => {
  it('auto-matches entries for a statement', async () => {
    const result = { matched: 5, unmatched: 2 };
    vi.mocked(service.autoMatchReconciliationEntries).mockResolvedValue(result);

    const res = await (autoMatchReconciliationEntries as Function)({ statementId: 'stmt-1' });

    expect(service.autoMatchReconciliationEntries).toHaveBeenCalledWith('stmt-1', TEST_TENANT_ID, TEST_USER_ID);
    expect(res).toEqual(result);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (autoMatchReconciliationEntries as Function)({ statementId: 'stmt-1' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.autoMatchReconciliationEntries).mockRejectedValue(new Error('statement not found'));

    await expect(
      (autoMatchReconciliationEntries as Function)({ statementId: 'bad' }),
    ).rejects.toThrow('statement not found');
  });
});

// ─── Currency Tests ───────────────────────────────────────────────────────────

describe('getCurrency', () => {
  it('returns a currency by code', async () => {
    const currency = { code: 'USD', name: 'US Dollar' };
    vi.mocked(service.getCurrency).mockResolvedValue(currency as never);

    const res = await (getCurrency as Function)({ code: 'USD' });

    expect(service.getCurrency).toHaveBeenCalledWith('USD');
    expect(res).toEqual(currency);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((getCurrency as Function)({ code: 'USD' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.getCurrency).mockRejectedValue(new Error('not found'));

    await expect((getCurrency as Function)({ code: 'XYZ' })).rejects.toThrow('not found');
  });
});

describe('listCurrencies', () => {
  it('returns paginated currencies', async () => {
    const result = { data: [], total: 0, page: 1, limit: 20 };
    vi.mocked(service.listCurrencies).mockResolvedValue(result as never);

    const res = await (listCurrencies as Function)({ page: 1, limit: 10 });

    expect(service.listCurrencies).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(res).toEqual(result);
  });

  it('applies default pagination', async () => {
    vi.mocked(service.listCurrencies).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never);

    await (listCurrencies as Function)({});

    expect(service.listCurrencies).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((listCurrencies as Function)({})).rejects.toThrow('not authenticated');
  });
});

// ─── Bank Connection Tests ────────────────────────────────────────────────────

describe('createBankConnection', () => {
  const UUID_A = '550e8400-e29b-41d4-a716-446655440000';
  const validReq = {
    bankAccountId: UUID_A,
    connectionType: 'plaid' as const,
    institutionName: 'Chase Bank',
    accessToken: 'access-token-123',
    syncFrequency: 'daily' as const,
  };

  it('creates a bank connection with valid data', async () => {
    const connection = { id: 'bc-1', status: 'active' };
    vi.mocked(service.createBankConnection).mockResolvedValue(connection as never);

    const res = await (createBankConnection as Function)(validReq);

    expect(service.createBankConnection).toHaveBeenCalledWith(validReq, TEST_TENANT_ID, TEST_USER_ID);
    expect(res).toEqual(connection);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((createBankConnection as Function)(validReq)).rejects.toThrow('not authenticated');
  });

  it('rejects invalid bankAccountId uuid', async () => {
    await expect(
      (createBankConnection as Function)({ ...validReq, bankAccountId: 'not-a-uuid' }),
    ).rejects.toThrow();
  });

  it('rejects invalid connectionType', async () => {
    await expect(
      (createBankConnection as Function)({ ...validReq, connectionType: 'bogus' }),
    ).rejects.toThrow();
  });

  it('rejects empty accessToken', async () => {
    await expect(
      (createBankConnection as Function)({ ...validReq, accessToken: '' }),
    ).rejects.toThrow();
  });

  it('rejects empty institutionName', async () => {
    await expect(
      (createBankConnection as Function)({ ...validReq, institutionName: '' }),
    ).rejects.toThrow();
  });

  it('accepts all valid connection types', async () => {
    for (const connectionType of ['plaid', 'yodlee', 'ofx', 'manual']) {
      vi.mocked(service.createBankConnection).mockResolvedValue({ id: 'bc-1' } as never);
      await (createBankConnection as Function)({ ...validReq, connectionType });
      expect(service.createBankConnection).toHaveBeenCalled();
    }
  });

  it('applies default syncFrequency when omitted', async () => {
    vi.mocked(service.createBankConnection).mockResolvedValue({ id: 'bc-1' } as never);

    await (createBankConnection as Function)({ ...validReq, syncFrequency: undefined });

    expect(service.createBankConnection).toHaveBeenCalled();
  });

  it('propagates service errors', async () => {
    vi.mocked(service.createBankConnection).mockRejectedValue(new Error('duplicate connection'));

    await expect((createBankConnection as Function)(validReq)).rejects.toThrow('duplicate connection');
  });
});

describe('getBankConnection', () => {
  it('returns a bank connection by id', async () => {
    const connection = { id: 'bc-1', status: 'active' };
    vi.mocked(service.getBankConnection).mockResolvedValue(connection as never);

    const res = await (getBankConnection as Function)({ id: 'bc-1' });

    expect(service.getBankConnection).toHaveBeenCalledWith('bc-1', TEST_TENANT_ID);
    expect(res).toEqual(connection);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((getBankConnection as Function)({ id: 'bc-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.getBankConnection).mockRejectedValue(new Error('not found'));

    await expect((getBankConnection as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });
});

describe('listBankConnections', () => {
  it('returns paginated bank connections', async () => {
    const result = { data: [], total: 0, page: 1, limit: 20 };
    vi.mocked(service.listBankConnections).mockResolvedValue(result as never);

    const res = await (listBankConnections as Function)({ page: 1, limit: 10 });

    expect(service.listBankConnections).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 10,
      bankAccountId: undefined,
      status: undefined,
    });
    expect(res).toEqual(result);
  });

  it('applies default pagination', async () => {
    vi.mocked(service.listBankConnections).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never);

    await (listBankConnections as Function)({});

    expect(service.listBankConnections).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      bankAccountId: undefined,
      status: undefined,
    });
  });

  it('passes bankAccountId and status filters', async () => {
    const UUID_A = '550e8400-e29b-41d4-a716-446655440000';
    vi.mocked(service.listBankConnections).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never);

    await (listBankConnections as Function)({ bankAccountId: UUID_A, status: 'active' });

    expect(service.listBankConnections).toHaveBeenCalledWith(TEST_TENANT_ID, {
      page: 1,
      limit: 20,
      bankAccountId: UUID_A,
      status: 'active',
    });
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((listBankConnections as Function)({})).rejects.toThrow('not authenticated');
  });

  it('rejects invalid bankAccountId uuid', async () => {
    await expect(
      (listBankConnections as Function)({ bankAccountId: 'not-a-uuid' }),
    ).rejects.toThrow();
  });
});

describe('updateBankConnection', () => {
  it('updates a bank connection', async () => {
    const connection = { id: 'bc-1', syncFrequency: 'hourly' };
    vi.mocked(service.updateBankConnection).mockResolvedValue(connection as never);

    const res = await (updateBankConnection as Function)({ id: 'bc-1', syncFrequency: 'hourly' });

    expect(service.updateBankConnection).toHaveBeenCalledWith('bc-1', { syncFrequency: 'hourly' }, TEST_TENANT_ID);
    expect(res).toEqual(connection);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((updateBankConnection as Function)({ id: 'bc-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.updateBankConnection).mockRejectedValue(new Error('not found'));

    await expect((updateBankConnection as Function)({ id: 'bad', syncFrequency: 'daily' })).rejects.toThrow('not found');
  });
});

describe('disableBankConnection', () => {
  it('disables a bank connection', async () => {
    const connection = { id: 'bc-1', status: 'disabled' };
    vi.mocked(service.disableBankConnection).mockResolvedValue(connection as never);

    const res = await (disableBankConnection as Function)({ id: 'bc-1' });

    expect(service.disableBankConnection).toHaveBeenCalledWith('bc-1', TEST_TENANT_ID);
    expect(res).toEqual(connection);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((disableBankConnection as Function)({ id: 'bc-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.disableBankConnection).mockRejectedValue(new Error('not found'));

    await expect((disableBankConnection as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });
});
