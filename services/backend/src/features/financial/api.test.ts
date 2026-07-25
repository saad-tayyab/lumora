import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TEST_TENANT_ID, TEST_USER_ID, createMockSession } from '../../lib/test-utils';

vi.mock('encore.dev/api', () => {
  class MockAPIError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message);
      this.code = code;
      this.status = opts?.status ?? 500;
    }
    static unauthenticated(message: string) {
      return new MockAPIError('unauthenticated', message, { status: 401 });
    }
    static notFound(message: string) {
      return new MockAPIError('not_found', message, { status: 404 });
    }
    static invalidArgument(message: string) {
      return new MockAPIError('invalid_argument', message, { status: 400 });
    }
    static internal(message: string) {
      return new MockAPIError('internal', message, { status: 500 });
    }
    static forbidden(message: string) {
      return new MockAPIError('permission_denied', message, { status: 403 });
    }
  }
  return {
    APIError: MockAPIError,
    api: vi.fn((_config: unknown, handler: unknown) => handler),
  };
});

const mockGetAuthData = vi.fn();
vi.mock('~encore/auth', () => ({
  getAuthData: () => mockGetAuthData(),
}));

vi.mock('./service', () => ({
  createAccount: vi.fn(),
  getAccount: vi.fn(),
  listAccounts: vi.fn(),
  updateAccount: vi.fn(),
  deleteAccount: vi.fn(),
  createJournalEntry: vi.fn(),
  getJournalEntry: vi.fn(),
  listJournalEntries: vi.fn(),
  updateJournalEntry: vi.fn(),
  postJournalEntry: vi.fn(),
  voidJournalEntry: vi.fn(),
  createFiscalYear: vi.fn(),
  getFiscalYear: vi.fn(),
  listFiscalYears: vi.fn(),
  updateFiscalYear: vi.fn(),
  closeFiscalYear: vi.fn(),
}));

import * as api from './api';
import * as service from './service';

// ─── Test Data ───────────────────────────────────────────────────────────────

const UUID = '550e8400-e29b-41d4-a716-446655440000';
const UUID2 = '550e8400-e29b-41d4-a716-446655440001';
const UUID3 = '550e8400-e29b-41d4-a716-446655440002';

const mockAccount = {
  id: UUID,
  code: '1000',
  name: 'Cash',
  type: 'asset' as const,
  parentId: null,
  isActive: true,
  balance: '0',
  tenantId: TEST_TENANT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockJournalEntry = {
  id: UUID,
  date: '2026-01-15',
  description: 'Test entry',
  referenceNumber: 'REF-001',
  status: 'draft' as const,
  periodId: null,
  tenantId: TEST_TENANT_ID,
  createdBy: TEST_USER_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  lines: [
    {
      id: UUID2,
      journalEntryId: UUID,
      accountId: UUID3,
      debit: '100.0000',
      credit: '0',
      description: null,
      tenantId: TEST_TENANT_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  ],
};

const mockFiscalYear = {
  id: UUID,
  name: 'FY 2026',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-12-31'),
  status: 'open' as const,
  tenantId: TEST_TENANT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const validCreateAccountReq = {
  code: '1000',
  name: 'Cash',
  type: 'asset',
};

const validCreateJournalEntryReq = {
  date: '2026-01-15',
  description: 'Test entry',
  referenceNumber: 'REF-001',
  lines: [
    { accountId: UUID2, debit: '100.0000', credit: '0' },
    { accountId: UUID3, debit: '0', credit: '100.0000' },
  ],
};

const validCreateFiscalYearReq = {
  name: 'FY 2026',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T23:59:59.999Z',
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Financial API Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthData.mockReturnValue(createMockSession());
  });

  // ─── createAccount ───────────────────────────────────────────────────────

  describe('createAccount', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.createAccount as ReturnType<typeof vi.fn>).mockResolvedValue(mockAccount);

      const result = await (api.createAccount as Function)(validCreateAccountReq);

      expect(service.createAccount).toHaveBeenCalledWith(
        { code: '1000', name: 'Cash', type: 'asset', isActive: true },
        TEST_TENANT_ID,
      );
      expect(result).toEqual(mockAccount);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.createAccount as Function)(validCreateAccountReq),
      ).rejects.toThrow('not authenticated');
    });

    it('throws ValidationError when code is missing', async () => {
      await expect(
        (api.createAccount as Function)({ name: 'Cash', type: 'asset' }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when name is missing', async () => {
      await expect(
        (api.createAccount as Function)({ code: '1000', type: 'asset' }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when type is invalid', async () => {
      await expect(
        (api.createAccount as Function)({ code: '1000', name: 'Cash', type: 'invalid' }),
      ).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.createAccount as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Account code already exists'),
      );

      await expect(
        (api.createAccount as Function)(validCreateAccountReq),
      ).rejects.toThrow('Account code already exists');
    });
  });

  // ─── getAccount ──────────────────────────────────────────────────────────

  describe('getAccount', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.getAccount as ReturnType<typeof vi.fn>).mockResolvedValue(mockAccount);

      const result = await (api.getAccount as Function)({ id: UUID });

      expect(service.getAccount).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
      expect(result).toEqual(mockAccount);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.getAccount as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.getAccount as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Account with id xyz not found'),
      );

      await expect((api.getAccount as Function)({ id: 'xyz' })).rejects.toThrow(
        'Account with id xyz not found',
      );
    });
  });

  // ─── listAccounts ────────────────────────────────────────────────────────

  describe('listAccounts', () => {
    const listResult = { data: [mockAccount], total: 1, page: 1, limit: 20 };

    it('calls service with correct args when authenticated', async () => {
      (service.listAccounts as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      const result = await (api.listAccounts as Function)({});

      expect(service.listAccounts).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
        type: undefined,
      });
      expect(result).toEqual(listResult);
    });

    it('passes type filter to service', async () => {
      (service.listAccounts as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listAccounts as Function)({ type: 'asset' });

      expect(service.listAccounts).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
        type: 'asset',
      });
    });

    it('handles pagination params', async () => {
      (service.listAccounts as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listAccounts as Function)({ page: 2, limit: 10 });

      expect(service.listAccounts).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 2,
        limit: 10,
        type: undefined,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.listAccounts as Function)({})).rejects.toThrow('not authenticated');
    });

    it('rejects invalid page value', async () => {
      await expect((api.listAccounts as Function)({ page: -1 })).rejects.toThrow();
    });

    it('rejects limit exceeding max', async () => {
      await expect((api.listAccounts as Function)({ limit: 200 })).rejects.toThrow();
    });

    it('rejects non-integer page', async () => {
      await expect((api.listAccounts as Function)({ page: 1.5 })).rejects.toThrow();
    });

    it('passes through type value without server-side validation', async () => {
      (service.listAccounts as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listAccounts as Function)({ type: 'invalid' });

      expect(service.listAccounts).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
        type: 'invalid',
      });
    });

    it('propagates service errors', async () => {
      (service.listAccounts as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error'),
      );

      await expect((api.listAccounts as Function)({})).rejects.toThrow('Database error');
    });
  });

  // ─── updateAccount ───────────────────────────────────────────────────────

  describe('updateAccount', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.updateAccount as ReturnType<typeof vi.fn>).mockResolvedValue(mockAccount);

      const result = await (api.updateAccount as Function)({
        id: UUID,
        name: 'Updated Cash',
      });

      expect(service.updateAccount).toHaveBeenCalledWith(UUID, { name: 'Updated Cash' }, TEST_TENANT_ID);
      expect(result).toEqual(mockAccount);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.updateAccount as Function)({ id: UUID, name: 'x' }),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects name that is too long', async () => {
      await expect(
        (api.updateAccount as Function)({ id: UUID, name: 'x'.repeat(101) }),
      ).rejects.toThrow();
    });

    it('propagates NotFoundError from service', async () => {
      (service.updateAccount as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Account with id xyz not found'),
      );

      await expect(
        (api.updateAccount as Function)({ id: 'xyz', name: 'Updated' }),
      ).rejects.toThrow('Account with id xyz not found');
    });

    it('allows setting parentId to null', async () => {
      (service.updateAccount as ReturnType<typeof vi.fn>).mockResolvedValue(mockAccount);

      await (api.updateAccount as Function)({ id: UUID, parentId: null });

      expect(service.updateAccount).toHaveBeenCalledWith(UUID, { parentId: null }, TEST_TENANT_ID);
    });

    it('allows setting isActive to false', async () => {
      (service.updateAccount as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockAccount,
        isActive: false,
      });

      const result = await (api.updateAccount as Function)({ id: UUID, isActive: false });

      expect(service.updateAccount).toHaveBeenCalledWith(UUID, { isActive: false }, TEST_TENANT_ID);
      expect(result.isActive).toBe(false);
    });
  });

  // ─── deleteAccount ───────────────────────────────────────────────────────

  describe('deleteAccount', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.deleteAccount as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await (api.deleteAccount as Function)({ id: UUID });

      expect(service.deleteAccount).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.deleteAccount as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.deleteAccount as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Account with id xyz not found'),
      );

      await expect((api.deleteAccount as Function)({ id: 'xyz' })).rejects.toThrow(
        'Account with id xyz not found',
      );
    });

    it('propagates error when account has child accounts', async () => {
      (service.deleteAccount as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Cannot delete account with child accounts'),
      );

      await expect((api.deleteAccount as Function)({ id: UUID })).rejects.toThrow(
        'Cannot delete account with child accounts',
      );
    });

    it('propagates error when account has transactions', async () => {
      (service.deleteAccount as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Cannot delete account with existing transactions'),
      );

      await expect((api.deleteAccount as Function)({ id: UUID })).rejects.toThrow(
        'Cannot delete account with existing transactions',
      );
    });
  });

  // ─── createJournalEntry ──────────────────────────────────────────────────

  describe('createJournalEntry', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.createJournalEntry as ReturnType<typeof vi.fn>).mockResolvedValue(mockJournalEntry);

      const result = await (api.createJournalEntry as Function)(validCreateJournalEntryReq);

      expect(service.createJournalEntry).toHaveBeenCalledWith(
        validCreateJournalEntryReq,
        TEST_TENANT_ID,
        TEST_USER_ID,
      );
      expect(result).toEqual(mockJournalEntry);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.createJournalEntry as Function)(validCreateJournalEntryReq),
      ).rejects.toThrow('not authenticated');
    });

    it('throws ValidationError when date is missing', async () => {
      await expect(
        (api.createJournalEntry as Function)({
          description: 'Test',
          lines: validCreateJournalEntryReq.lines,
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when date format is invalid', async () => {
      await expect(
        (api.createJournalEntry as Function)({
          date: '15-01-2026',
          description: 'Test',
          lines: validCreateJournalEntryReq.lines,
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when description is missing', async () => {
      await expect(
        (api.createJournalEntry as Function)({
          date: '2026-01-15',
          lines: validCreateJournalEntryReq.lines,
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when lines is empty', async () => {
      await expect(
        (api.createJournalEntry as Function)({
          date: '2026-01-15',
          description: 'Test',
          lines: [],
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when only one line provided', async () => {
      await expect(
        (api.createJournalEntry as Function)({
          date: '2026-01-15',
          description: 'Test',
          lines: [{ accountId: UUID2, debit: '100.0000', credit: '0' }],
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when debits do not equal credits', async () => {
      await expect(
        (api.createJournalEntry as Function)({
          date: '2026-01-15',
          description: 'Test',
          lines: [
            { accountId: UUID2, debit: '100.0000', credit: '0' },
            { accountId: UUID3, debit: '0', credit: '50.0000' },
          ],
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when line has both debit and credit', async () => {
      await expect(
        (api.createJournalEntry as Function)({
          date: '2026-01-15',
          description: 'Test',
          lines: [
            { accountId: UUID2, debit: '100.0000', credit: '50.0000' },
            { accountId: UUID3, debit: '0', credit: '150.0000' },
          ],
        }),
      ).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.createJournalEntry as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Closed period'),
      );

      await expect(
        (api.createJournalEntry as Function)(validCreateJournalEntryReq),
      ).rejects.toThrow('Closed period');
    });
  });

  // ─── getJournalEntry ─────────────────────────────────────────────────────

  describe('getJournalEntry', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.getJournalEntry as ReturnType<typeof vi.fn>).mockResolvedValue(mockJournalEntry);

      const result = await (api.getJournalEntry as Function)({ id: UUID });

      expect(service.getJournalEntry).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
      expect(result).toEqual(mockJournalEntry);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.getJournalEntry as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.getJournalEntry as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Journal entry with id xyz not found'),
      );

      await expect((api.getJournalEntry as Function)({ id: 'xyz' })).rejects.toThrow(
        'Journal entry with id xyz not found',
      );
    });
  });

  // ─── listJournalEntries ──────────────────────────────────────────────────

  describe('listJournalEntries', () => {
    const listResult = { data: [mockJournalEntry], total: 1, page: 1, limit: 20 };

    it('calls service with correct args when authenticated', async () => {
      (service.listJournalEntries as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      const result = await (api.listJournalEntries as Function)({});

      expect(service.listJournalEntries).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
        status: undefined,
      });
      expect(result).toEqual(listResult);
    });

    it('passes status filter to service', async () => {
      (service.listJournalEntries as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listJournalEntries as Function)({ status: 'posted' });

      expect(service.listJournalEntries).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
        status: 'posted',
      });
    });

    it('handles pagination params', async () => {
      (service.listJournalEntries as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listJournalEntries as Function)({ page: 3, limit: 5 });

      expect(service.listJournalEntries).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 3,
        limit: 5,
        status: undefined,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.listJournalEntries as Function)({})).rejects.toThrow('not authenticated');
    });

    it('passes through status value without server-side validation', async () => {
      (service.listJournalEntries as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listJournalEntries as Function)({ status: 'invalid' });

      expect(service.listJournalEntries).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
        status: 'invalid',
      });
    });

    it('rejects negative page', async () => {
      await expect((api.listJournalEntries as Function)({ page: -1 })).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.listJournalEntries as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error'),
      );

      await expect((api.listJournalEntries as Function)({})).rejects.toThrow('Database error');
    });
  });

  // ─── updateJournalEntry ──────────────────────────────────────────────────

  describe('updateJournalEntry', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.updateJournalEntry as ReturnType<typeof vi.fn>).mockResolvedValue(mockJournalEntry);

      const result = await (api.updateJournalEntry as Function)({
        id: UUID,
        description: 'Updated description',
      });

      expect(service.updateJournalEntry).toHaveBeenCalledWith(
        UUID,
        { description: 'Updated description' },
        TEST_TENANT_ID,
      );
      expect(result).toEqual(mockJournalEntry);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.updateJournalEntry as Function)({ id: UUID, description: 'x' }),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects invalid date format', async () => {
      await expect(
        (api.updateJournalEntry as Function)({ id: UUID, date: '15/01/2026' }),
      ).rejects.toThrow();
    });

    it('rejects empty description', async () => {
      await expect(
        (api.updateJournalEntry as Function)({ id: UUID, description: '' }),
      ).rejects.toThrow();
    });

    it('allows setting referenceNumber to null', async () => {
      (service.updateJournalEntry as ReturnType<typeof vi.fn>).mockResolvedValue(mockJournalEntry);

      await (api.updateJournalEntry as Function)({ id: UUID, referenceNumber: null });

      expect(service.updateJournalEntry).toHaveBeenCalledWith(
        UUID,
        { referenceNumber: null },
        TEST_TENANT_ID,
      );
    });

    it('allows updating lines', async () => {
      (service.updateJournalEntry as ReturnType<typeof vi.fn>).mockResolvedValue(mockJournalEntry);

      const newLines = [
        { accountId: UUID2, debit: '200.0000', credit: '0' },
        { accountId: UUID3, debit: '0', credit: '200.0000' },
      ];

      await (api.updateJournalEntry as Function)({ id: UUID, lines: newLines });

      expect(service.updateJournalEntry).toHaveBeenCalledWith(
        UUID,
        { lines: newLines },
        TEST_TENANT_ID,
      );
    });

    it('throws ValidationError when updated lines are unbalanced', async () => {
      await expect(
        (api.updateJournalEntry as Function)({
          id: UUID,
          lines: [
            { accountId: UUID2, debit: '100.0000', credit: '0' },
            { accountId: UUID3, debit: '0', credit: '50.0000' },
          ],
        }),
      ).rejects.toThrow();
    });

    it('propagates NotFoundError from service', async () => {
      (service.updateJournalEntry as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Journal entry with id xyz not found'),
      );

      await expect(
        (api.updateJournalEntry as Function)({ id: 'xyz', description: 'Updated' }),
      ).rejects.toThrow('Journal entry with id xyz not found');
    });
  });

  // ─── postJournalEntry ────────────────────────────────────────────────────

  describe('postJournalEntry', () => {
    it('calls service with correct args when authenticated', async () => {
      const postedEntry = { ...mockJournalEntry, status: 'posted' };
      (service.postJournalEntry as ReturnType<typeof vi.fn>).mockResolvedValue(postedEntry);

      const result = await (api.postJournalEntry as Function)({ id: UUID });

      expect(service.postJournalEntry).toHaveBeenCalledWith(UUID, TEST_TENANT_ID, TEST_USER_ID);
      expect(result).toEqual(postedEntry);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.postJournalEntry as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.postJournalEntry as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Journal entry with id xyz not found'),
      );

      await expect((api.postJournalEntry as Function)({ id: 'xyz' })).rejects.toThrow(
        'Journal entry with id xyz not found',
      );
    });

    it('propagates error when entry already posted', async () => {
      (service.postJournalEntry as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Journal entry already posted'),
      );

      await expect((api.postJournalEntry as Function)({ id: UUID })).rejects.toThrow(
        'Journal entry already posted',
      );
    });

    it('propagates error when entry is voided', async () => {
      (service.postJournalEntry as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Only draft entries can be posted'),
      );

      await expect((api.postJournalEntry as Function)({ id: UUID })).rejects.toThrow(
        'Only draft entries can be posted',
      );
    });
  });

  // ─── voidJournalEntry ────────────────────────────────────────────────────

  describe('voidJournalEntry', () => {
    it('calls service with correct args when authenticated', async () => {
      const voidedEntry = { ...mockJournalEntry, status: 'voided' };
      (service.voidJournalEntry as ReturnType<typeof vi.fn>).mockResolvedValue(voidedEntry);

      const result = await (api.voidJournalEntry as Function)({ id: UUID });

      expect(service.voidJournalEntry).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
      expect(result).toEqual(voidedEntry);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.voidJournalEntry as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.voidJournalEntry as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Journal entry with id xyz not found'),
      );

      await expect((api.voidJournalEntry as Function)({ id: 'xyz' })).rejects.toThrow(
        'Journal entry with id xyz not found',
      );
    });

    it('propagates error when entry is not posted', async () => {
      (service.voidJournalEntry as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Only posted entries can be voided'),
      );

      await expect((api.voidJournalEntry as Function)({ id: UUID })).rejects.toThrow(
        'Only posted entries can be voided',
      );
    });
  });

  // ─── createFiscalYear ────────────────────────────────────────────────────

  describe('createFiscalYear', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.createFiscalYear as ReturnType<typeof vi.fn>).mockResolvedValue(mockFiscalYear);

      const result = await (api.createFiscalYear as Function)(validCreateFiscalYearReq);

      expect(service.createFiscalYear).toHaveBeenCalledWith(
        validCreateFiscalYearReq,
        TEST_TENANT_ID,
      );
      expect(result).toEqual(mockFiscalYear);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.createFiscalYear as Function)(validCreateFiscalYearReq),
      ).rejects.toThrow('not authenticated');
    });

    it('throws ValidationError when name is missing', async () => {
      await expect(
        (api.createFiscalYear as Function)({
          startDate: '2026-01-01T00:00:00.000Z',
          endDate: '2026-12-31T23:59:59.999Z',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when startDate is missing', async () => {
      await expect(
        (api.createFiscalYear as Function)({
          name: 'FY 2026',
          endDate: '2026-12-31T23:59:59.999Z',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when endDate is missing', async () => {
      await expect(
        (api.createFiscalYear as Function)({
          name: 'FY 2026',
          startDate: '2026-01-01T00:00:00.000Z',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when endDate is before startDate', async () => {
      await expect(
        (api.createFiscalYear as Function)({
          name: 'FY 2026',
          startDate: '2026-12-31T00:00:00.000Z',
          endDate: '2026-01-01T00:00:00.000Z',
        }),
      ).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.createFiscalYear as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Fiscal year overlap'),
      );

      await expect(
        (api.createFiscalYear as Function)(validCreateFiscalYearReq),
      ).rejects.toThrow('Fiscal year overlap');
    });
  });

  // ─── getFiscalYear ───────────────────────────────────────────────────────

  describe('getFiscalYear', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.getFiscalYear as ReturnType<typeof vi.fn>).mockResolvedValue(mockFiscalYear);

      const result = await (api.getFiscalYear as Function)({ id: UUID });

      expect(service.getFiscalYear).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
      expect(result).toEqual(mockFiscalYear);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.getFiscalYear as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.getFiscalYear as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Fiscal year with id xyz not found'),
      );

      await expect((api.getFiscalYear as Function)({ id: 'xyz' })).rejects.toThrow(
        'Fiscal year with id xyz not found',
      );
    });
  });

  // ─── listFiscalYears ─────────────────────────────────────────────────────

  describe('listFiscalYears', () => {
    const listResult = { data: [mockFiscalYear], total: 1, page: 1, limit: 20 };

    it('calls service with correct args when authenticated', async () => {
      (service.listFiscalYears as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      const result = await (api.listFiscalYears as Function)({});

      expect(service.listFiscalYears).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(listResult);
    });

    it('handles pagination params', async () => {
      (service.listFiscalYears as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listFiscalYears as Function)({ page: 2, limit: 5 });

      expect(service.listFiscalYears).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 2,
        limit: 5,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.listFiscalYears as Function)({})).rejects.toThrow('not authenticated');
    });

    it('rejects invalid page value', async () => {
      await expect((api.listFiscalYears as Function)({ page: 0 })).rejects.toThrow();
    });

    it('rejects limit exceeding max', async () => {
      await expect((api.listFiscalYears as Function)({ limit: 101 })).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.listFiscalYears as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error'),
      );

      await expect((api.listFiscalYears as Function)({})).rejects.toThrow('Database error');
    });
  });

  // ─── updateFiscalYear ────────────────────────────────────────────────────

  describe('updateFiscalYear', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.updateFiscalYear as ReturnType<typeof vi.fn>).mockResolvedValue(mockFiscalYear);

      const result = await (api.updateFiscalYear as Function)({
        id: UUID,
        name: 'FY 2026 Updated',
      });

      expect(service.updateFiscalYear).toHaveBeenCalledWith(
        UUID,
        { name: 'FY 2026 Updated' },
        TEST_TENANT_ID,
      );
      expect(result).toEqual(mockFiscalYear);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.updateFiscalYear as Function)({ id: UUID, name: 'x' }),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects invalid status value', async () => {
      await expect(
        (api.updateFiscalYear as Function)({ id: UUID, status: 'invalid' }),
      ).rejects.toThrow();
    });

    it('allows setting status to open', async () => {
      (service.updateFiscalYear as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockFiscalYear,
        status: 'open',
      });

      await (api.updateFiscalYear as Function)({ id: UUID, status: 'open' });

      expect(service.updateFiscalYear).toHaveBeenCalledWith(
        UUID,
        { status: 'open' },
        TEST_TENANT_ID,
      );
    });

    it('allows setting status to closed', async () => {
      (service.updateFiscalYear as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockFiscalYear,
        status: 'closed',
      });

      await (api.updateFiscalYear as Function)({ id: UUID, status: 'closed' });

      expect(service.updateFiscalYear).toHaveBeenCalledWith(
        UUID,
        { status: 'closed' },
        TEST_TENANT_ID,
      );
    });

    it('rejects name that is too long', async () => {
      await expect(
        (api.updateFiscalYear as Function)({ id: UUID, name: 'x'.repeat(101) }),
      ).rejects.toThrow();
    });

    it('propagates NotFoundError from service', async () => {
      (service.updateFiscalYear as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Fiscal year with id xyz not found'),
      );

      await expect(
        (api.updateFiscalYear as Function)({ id: 'xyz', name: 'Updated' }),
      ).rejects.toThrow('Fiscal year with id xyz not found');
    });
  });

  // ─── closeFiscalYear ─────────────────────────────────────────────────────

  describe('closeFiscalYear', () => {
    it('calls service with correct args when authenticated', async () => {
      const closedFy = { ...mockFiscalYear, status: 'closed' };
      (service.closeFiscalYear as ReturnType<typeof vi.fn>).mockResolvedValue(closedFy);

      const result = await (api.closeFiscalYear as Function)({ id: UUID });

      expect(service.closeFiscalYear).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
      expect(result).toEqual(closedFy);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.closeFiscalYear as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.closeFiscalYear as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Fiscal year with id xyz not found'),
      );

      await expect((api.closeFiscalYear as Function)({ id: 'xyz' })).rejects.toThrow(
        'Fiscal year with id xyz not found',
      );
    });

    it('propagates error when fiscal year is already closed', async () => {
      (service.closeFiscalYear as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Fiscal year is not open'),
      );

      await expect((api.closeFiscalYear as Function)({ id: UUID })).rejects.toThrow(
        'Fiscal year is not open',
      );
    });

    it('propagates error when draft entries remain', async () => {
      (service.closeFiscalYear as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Cannot close period: 3 draft journal entries remain'),
      );

      await expect((api.closeFiscalYear as Function)({ id: UUID })).rejects.toThrow(
        'Cannot close period: 3 draft journal entries remain',
      );
    });
  });
});
