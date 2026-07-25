import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TEST_TENANT_ID, createMockSession } from '../../lib/test-utils';

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
  createBudgetHeader: vi.fn(),
  getBudgetHeader: vi.fn(),
  listBudgetHeaders: vi.fn(),
  updateBudgetHeader: vi.fn(),
  deleteBudgetHeader: vi.fn(),
  createBudgetLine: vi.fn(),
  updateBudgetLine: vi.fn(),
  deleteBudgetLine: vi.fn(),
  createBudgetConsumption: vi.fn(),
  getBudgetConsumption: vi.fn(),
  listBudgetConsumptions: vi.fn(),
  reverseConsumptionsForJournalEntry: vi.fn(),
  getBudgetVariance: vi.fn(),
}));

import * as api from './api';
import * as service from './service';

// ─── Test Data ───────────────────────────────────────────────────────────────

const UUID = '550e8400-e29b-41d4-a716-446655440000';
const UUID2 = '550e8400-e29b-41d4-a716-446655440001';
const UUID3 = '550e8400-e29b-41d4-a716-446655440002';

const mockBudgetHeader = {
  id: UUID,
  name: 'Q1 2026 Budget',
  description: 'First quarter budget',
  periodStart: '2026-01-01',
  periodEnd: '2026-03-31',
  totalAmount: '50000.0000',
  status: 'draft' as const,
  isActive: true,
  tenantId: TEST_TENANT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockBudgetLine = {
  id: UUID2,
  budgetHeaderId: UUID,
  glAccountId: UUID3,
  description: 'Marketing expenses',
  budgetAmount: '10000.0000',
  consumedAmount: '2500.0000',
  varianceAmount: '-7500.0000',
  isActive: true,
  tenantId: TEST_TENANT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockBudgetConsumption = {
  id: UUID2,
  budgetLineId: UUID,
  journalEntryId: UUID3,
  amount: '500.0000',
  description: 'Ad spend',
  consumptionDate: '2026-01-15',
  tenantId: TEST_TENANT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockBudgetHeaderWithLines = {
  ...mockBudgetHeader,
  lines: [mockBudgetLine],
};

const mockVariance = {
  budgetLineId: UUID2,
  glAccountId: UUID3,
  budgetAmount: '10000.0000',
  consumedAmount: '2500.0000',
  varianceAmount: '-7500.0000',
};

const validCreateBudgetHeaderReq = {
  name: 'Q1 2026 Budget',
  description: 'First quarter budget',
  periodStart: '2026-01-01',
  periodEnd: '2026-03-31',
  totalAmount: '50000.0000',
};

const validCreateBudgetLineReq = {
  glAccountId: UUID3,
  description: 'Marketing expenses',
  budgetAmount: '10000.0000',
};

const validCreateBudgetConsumptionReq = {
  budgetLineId: UUID,
  journalEntryId: UUID3,
  amount: '500.0000',
  description: 'Ad spend',
  consumptionDate: '2026-01-15',
};

const validReversalReq = {
  journalEntryId: UUID3,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Budget API Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthData.mockReturnValue(createMockSession());
  });

  // ─── createBudgetHeader ─────────────────────────────────────────────────

  describe('createBudgetHeader', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.createBudgetHeader as ReturnType<typeof vi.fn>).mockResolvedValue(mockBudgetHeader);

      const result = await (api.createBudgetHeader as Function)(validCreateBudgetHeaderReq);

      expect(service.createBudgetHeader).toHaveBeenCalledWith(
        validCreateBudgetHeaderReq,
        TEST_TENANT_ID,
      );
      expect(result).toEqual(mockBudgetHeader);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.createBudgetHeader as Function)(validCreateBudgetHeaderReq),
      ).rejects.toThrow('not authenticated');
    });

    it('throws ValidationError when name is missing', async () => {
      await expect(
        (api.createBudgetHeader as Function)({
          periodStart: '2026-01-01',
          periodEnd: '2026-03-31',
          totalAmount: '50000.0000',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when periodStart is missing', async () => {
      await expect(
        (api.createBudgetHeader as Function)({
          name: 'Q1 Budget',
          periodEnd: '2026-03-31',
          totalAmount: '50000.0000',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when periodEnd is missing', async () => {
      await expect(
        (api.createBudgetHeader as Function)({
          name: 'Q1 Budget',
          periodStart: '2026-01-01',
          totalAmount: '50000.0000',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when periodEnd is before periodStart', async () => {
      await expect(
        (api.createBudgetHeader as Function)({
          name: 'Q1 Budget',
          periodStart: '2026-03-31',
          periodEnd: '2026-01-01',
          totalAmount: '50000.0000',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when date format is invalid', async () => {
      await expect(
        (api.createBudgetHeader as Function)({
          name: 'Q1 Budget',
          periodStart: '01-01-2026',
          periodEnd: '31-03-2026',
          totalAmount: '50000.0000',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when totalAmount is not a valid decimal', async () => {
      await expect(
        (api.createBudgetHeader as Function)({
          name: 'Q1 Budget',
          periodStart: '2026-01-01',
          periodEnd: '2026-03-31',
          totalAmount: 'abc',
        }),
      ).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.createBudgetHeader as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Active budget already exists for this period'),
      );

      await expect(
        (api.createBudgetHeader as Function)(validCreateBudgetHeaderReq),
      ).rejects.toThrow('Active budget already exists for this period');
    });
  });

  // ─── getBudgetHeader ────────────────────────────────────────────────────

  describe('getBudgetHeader', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.getBudgetHeader as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBudgetHeaderWithLines,
      );

      const result = await (api.getBudgetHeader as Function)({ id: UUID });

      expect(service.getBudgetHeader).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
      expect(result).toEqual(mockBudgetHeaderWithLines);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.getBudgetHeader as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.getBudgetHeader as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Budget header with id xyz not found'),
      );

      await expect((api.getBudgetHeader as Function)({ id: 'xyz' })).rejects.toThrow(
        'Budget header with id xyz not found',
      );
    });
  });

  // ─── listBudgetHeaders ──────────────────────────────────────────────────

  describe('listBudgetHeaders', () => {
    const listResult = { data: [mockBudgetHeader], total: 1, page: 1, limit: 20 };

    it('calls service with correct args when authenticated', async () => {
      (service.listBudgetHeaders as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      const result = await (api.listBudgetHeaders as Function)({});

      expect(service.listBudgetHeaders).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
        status: undefined,
        isActive: undefined,
      });
      expect(result).toEqual(listResult);
    });

    it('passes status filter to service', async () => {
      (service.listBudgetHeaders as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listBudgetHeaders as Function)({ status: 'active' });

      expect(service.listBudgetHeaders).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
        status: 'active',
        isActive: undefined,
      });
    });

    it('passes isActive filter to service', async () => {
      (service.listBudgetHeaders as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listBudgetHeaders as Function)({ isActive: true });

      expect(service.listBudgetHeaders).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
        status: undefined,
        isActive: true,
      });
    });

    it('handles pagination params', async () => {
      (service.listBudgetHeaders as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listBudgetHeaders as Function)({ page: 2, limit: 10 });

      expect(service.listBudgetHeaders).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 2,
        limit: 10,
        status: undefined,
        isActive: undefined,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.listBudgetHeaders as Function)({})).rejects.toThrow('not authenticated');
    });

    it('rejects negative page value', async () => {
      await expect((api.listBudgetHeaders as Function)({ page: -1 })).rejects.toThrow();
    });

    it('rejects limit exceeding max', async () => {
      await expect((api.listBudgetHeaders as Function)({ limit: 200 })).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.listBudgetHeaders as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error'),
      );

      await expect((api.listBudgetHeaders as Function)({})).rejects.toThrow('Database error');
    });
  });

  // ─── updateBudgetHeader ─────────────────────────────────────────────────

  describe('updateBudgetHeader', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.updateBudgetHeader as ReturnType<typeof vi.fn>).mockResolvedValue(mockBudgetHeader);

      const result = await (api.updateBudgetHeader as Function)({
        id: UUID,
        name: 'Updated Budget',
      });

      expect(service.updateBudgetHeader).toHaveBeenCalledWith(
        UUID,
        { name: 'Updated Budget' },
        TEST_TENANT_ID,
      );
      expect(result).toEqual(mockBudgetHeader);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.updateBudgetHeader as Function)({ id: UUID, name: 'x' }),
      ).rejects.toThrow('not authenticated');
    });

    it('allows updating status to active', async () => {
      (service.updateBudgetHeader as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockBudgetHeader,
        status: 'active',
      });

      await (api.updateBudgetHeader as Function)({ id: UUID, status: 'active' });

      expect(service.updateBudgetHeader).toHaveBeenCalledWith(
        UUID,
        { status: 'active' },
        TEST_TENANT_ID,
      );
    });

    it('allows updating status to closed', async () => {
      (service.updateBudgetHeader as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockBudgetHeader,
        status: 'closed',
      });

      await (api.updateBudgetHeader as Function)({ id: UUID, status: 'closed' });

      expect(service.updateBudgetHeader).toHaveBeenCalledWith(
        UUID,
        { status: 'closed' },
        TEST_TENANT_ID,
      );
    });

    it('rejects invalid status value', async () => {
      await expect(
        (api.updateBudgetHeader as Function)({ id: UUID, status: 'invalid' }),
      ).rejects.toThrow();
    });

    it('rejects name that is too long', async () => {
      await expect(
        (api.updateBudgetHeader as Function)({ id: UUID, name: 'x'.repeat(101) }),
      ).rejects.toThrow();
    });

    it('propagates NotFoundError from service', async () => {
      (service.updateBudgetHeader as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Budget header with id xyz not found'),
      );

      await expect(
        (api.updateBudgetHeader as Function)({ id: 'xyz', name: 'Updated' }),
      ).rejects.toThrow('Budget header with id xyz not found');
    });

    it('propagates error when budget is not in draft status', async () => {
      (service.updateBudgetHeader as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Budget header is not in draft status'),
      );

      await expect(
        (api.updateBudgetHeader as Function)({ id: UUID, name: 'Updated' }),
      ).rejects.toThrow('Budget header is not in draft status');
    });
  });

  // ─── deleteBudgetHeader ─────────────────────────────────────────────────

  describe('deleteBudgetHeader', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.deleteBudgetHeader as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await (api.deleteBudgetHeader as Function)({ id: UUID });

      expect(service.deleteBudgetHeader).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.deleteBudgetHeader as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.deleteBudgetHeader as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Budget header with id xyz not found'),
      );

      await expect((api.deleteBudgetHeader as Function)({ id: 'xyz' })).rejects.toThrow(
        'Budget header with id xyz not found',
      );
    });

    it('propagates error when budget is not in draft status', async () => {
      (service.deleteBudgetHeader as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Budget header is not in draft status'),
      );

      await expect((api.deleteBudgetHeader as Function)({ id: UUID })).rejects.toThrow(
        'Budget header is not in draft status',
      );
    });
  });

  // ─── createBudgetLine ───────────────────────────────────────────────────

  describe('createBudgetLine', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.createBudgetLine as ReturnType<typeof vi.fn>).mockResolvedValue(mockBudgetLine);

      const result = await (api.createBudgetLine as Function)({
        headerId: UUID,
        ...validCreateBudgetLineReq,
      });

      expect(service.createBudgetLine).toHaveBeenCalledWith(
        UUID,
        validCreateBudgetLineReq,
        TEST_TENANT_ID,
      );
      expect(result).toEqual(mockBudgetLine);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.createBudgetLine as Function)({
          headerId: UUID,
          glAccountId: UUID3,
          budgetAmount: '10000.0000',
        }),
      ).rejects.toThrow('not authenticated');
    });

    it('throws ValidationError when glAccountId is missing', async () => {
      await expect(
        (api.createBudgetLine as Function)({
          headerId: UUID,
          description: 'Marketing',
          budgetAmount: '10000.0000',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when glAccountId is not a valid UUID', async () => {
      await expect(
        (api.createBudgetLine as Function)({
          headerId: UUID,
          glAccountId: 'not-a-uuid',
          budgetAmount: '10000.0000',
        }),
      ).rejects.toThrow();
    });

    it('propagates NotFoundError when header not found', async () => {
      (service.createBudgetLine as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Budget header with id xyz not found'),
      );

      await expect(
        (api.createBudgetLine as Function)({
          headerId: 'xyz',
          glAccountId: UUID3,
          budgetAmount: '10000.0000',
        }),
      ).rejects.toThrow('Budget header with id xyz not found');
    });

    it('propagates error when duplicate GL account in budget', async () => {
      (service.createBudgetLine as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Duplicate GL account in budget'),
      );

      await expect(
        (api.createBudgetLine as Function)({
          headerId: UUID,
          glAccountId: UUID3,
          budgetAmount: '10000.0000',
        }),
      ).rejects.toThrow('Duplicate GL account in budget');
    });

    it('propagates error when budget is not in draft status', async () => {
      (service.createBudgetLine as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Budget header is not in draft status'),
      );

      await expect(
        (api.createBudgetLine as Function)({
          headerId: UUID,
          glAccountId: UUID3,
          budgetAmount: '10000.0000',
        }),
      ).rejects.toThrow('Budget header is not in draft status');
    });
  });

  // ─── updateBudgetLine ───────────────────────────────────────────────────

  describe('updateBudgetLine', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.updateBudgetLine as ReturnType<typeof vi.fn>).mockResolvedValue(mockBudgetLine);

      const result = await (api.updateBudgetLine as Function)({
        headerId: UUID,
        lineId: UUID2,
        budgetAmount: '15000.0000',
      });

      expect(service.updateBudgetLine).toHaveBeenCalledWith(
        UUID,
        UUID2,
        { budgetAmount: '15000.0000' },
        TEST_TENANT_ID,
      );
      expect(result).toEqual(mockBudgetLine);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.updateBudgetLine as Function)({
          headerId: UUID,
          lineId: UUID2,
          budgetAmount: '15000.0000',
        }),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects budgetAmount that is not a valid decimal', async () => {
      await expect(
        (api.updateBudgetLine as Function)({
          headerId: UUID,
          lineId: UUID2,
          budgetAmount: 'abc',
        }),
      ).rejects.toThrow();
    });

    it('allows updating description only', async () => {
      (service.updateBudgetLine as ReturnType<typeof vi.fn>).mockResolvedValue(mockBudgetLine);

      await (api.updateBudgetLine as Function)({
        headerId: UUID,
        lineId: UUID2,
        description: 'Updated description',
      });

      expect(service.updateBudgetLine).toHaveBeenCalledWith(
        UUID,
        UUID2,
        { description: 'Updated description' },
        TEST_TENANT_ID,
      );
    });

    it('propagates NotFoundError when header not found', async () => {
      (service.updateBudgetLine as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Budget header with id xyz not found'),
      );

      await expect(
        (api.updateBudgetLine as Function)({
          headerId: 'xyz',
          lineId: UUID2,
          budgetAmount: '15000.0000',
        }),
      ).rejects.toThrow('Budget header with id xyz not found');
    });

    it('propagates NotFoundError when line not found', async () => {
      (service.updateBudgetLine as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Budget line with id xyz not found'),
      );

      await expect(
        (api.updateBudgetLine as Function)({
          headerId: UUID,
          lineId: 'xyz',
          budgetAmount: '15000.0000',
        }),
      ).rejects.toThrow('Budget line with id xyz not found');
    });

    it('propagates error when budget is not in draft status', async () => {
      (service.updateBudgetLine as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Budget header is not in draft status'),
      );

      await expect(
        (api.updateBudgetLine as Function)({
          headerId: UUID,
          lineId: UUID2,
          budgetAmount: '15000.0000',
        }),
      ).rejects.toThrow('Budget header is not in draft status');
    });
  });

  // ─── deleteBudgetLine ───────────────────────────────────────────────────

  describe('deleteBudgetLine', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.deleteBudgetLine as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await (api.deleteBudgetLine as Function)({ headerId: UUID, lineId: UUID2 });

      expect(service.deleteBudgetLine).toHaveBeenCalledWith(UUID, UUID2, TEST_TENANT_ID);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.deleteBudgetLine as Function)({ headerId: UUID, lineId: UUID2 }),
      ).rejects.toThrow('not authenticated');
    });

    it('propagates NotFoundError when header not found', async () => {
      (service.deleteBudgetLine as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Budget header with id xyz not found'),
      );

      await expect(
        (api.deleteBudgetLine as Function)({ headerId: 'xyz', lineId: UUID2 }),
      ).rejects.toThrow('Budget header with id xyz not found');
    });

    it('propagates NotFoundError when line not found', async () => {
      (service.deleteBudgetLine as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Budget line with id xyz not found'),
      );

      await expect(
        (api.deleteBudgetLine as Function)({ headerId: UUID, lineId: 'xyz' }),
      ).rejects.toThrow('Budget line with id xyz not found');
    });

    it('propagates error when budget is not in draft status', async () => {
      (service.deleteBudgetLine as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Budget header is not in draft status'),
      );

      await expect(
        (api.deleteBudgetLine as Function)({ headerId: UUID, lineId: UUID2 }),
      ).rejects.toThrow('Budget header is not in draft status');
    });
  });

  // ─── createBudgetConsumption ────────────────────────────────────────────

  describe('createBudgetConsumption', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.createBudgetConsumption as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBudgetConsumption,
      );

      const result = await (api.createBudgetConsumption as Function)(
        validCreateBudgetConsumptionReq,
      );

      expect(service.createBudgetConsumption).toHaveBeenCalledWith(
        validCreateBudgetConsumptionReq,
        TEST_TENANT_ID,
      );
      expect(result).toEqual(mockBudgetConsumption);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.createBudgetConsumption as Function)(validCreateBudgetConsumptionReq),
      ).rejects.toThrow('not authenticated');
    });

    it('throws ValidationError when budgetLineId is missing', async () => {
      await expect(
        (api.createBudgetConsumption as Function)({
          amount: '500.0000',
          consumptionDate: '2026-01-15',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when amount is missing', async () => {
      await expect(
        (api.createBudgetConsumption as Function)({
          budgetLineId: UUID,
          consumptionDate: '2026-01-15',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when consumptionDate is missing', async () => {
      await expect(
        (api.createBudgetConsumption as Function)({
          budgetLineId: UUID,
          amount: '500.0000',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when consumptionDate format is invalid', async () => {
      await expect(
        (api.createBudgetConsumption as Function)({
          budgetLineId: UUID,
          amount: '500.0000',
          consumptionDate: '15-01-2026',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when amount is negative', async () => {
      await expect(
        (api.createBudgetConsumption as Function)({
          budgetLineId: UUID,
          amount: '-100.0000',
          consumptionDate: '2026-01-15',
        }),
      ).rejects.toThrow();
    });

    it('throws ValidationError when budgetLineId is not a valid UUID', async () => {
      await expect(
        (api.createBudgetConsumption as Function)({
          budgetLineId: 'not-a-uuid',
          amount: '500.0000',
          consumptionDate: '2026-01-15',
        }),
      ).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.createBudgetConsumption as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Budget line not found'),
      );

      await expect(
        (api.createBudgetConsumption as Function)(validCreateBudgetConsumptionReq),
      ).rejects.toThrow('Budget line not found');
    });
  });

  // ─── getBudgetConsumption ───────────────────────────────────────────────

  describe('getBudgetConsumption', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.getBudgetConsumption as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBudgetConsumption,
      );

      const result = await (api.getBudgetConsumption as Function)({ id: UUID2 });

      expect(service.getBudgetConsumption).toHaveBeenCalledWith(UUID2, TEST_TENANT_ID);
      expect(result).toEqual(mockBudgetConsumption);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.getBudgetConsumption as Function)({ id: UUID2 })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.getBudgetConsumption as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Budget consumption with id xyz not found'),
      );

      await expect((api.getBudgetConsumption as Function)({ id: 'xyz' })).rejects.toThrow(
        'Budget consumption with id xyz not found',
      );
    });
  });

  // ─── listBudgetConsumptions ─────────────────────────────────────────────

  describe('listBudgetConsumptions', () => {
    const listResult = { data: [mockBudgetConsumption], total: 1, page: 1, limit: 20 };

    it('calls service with correct args when authenticated', async () => {
      (service.listBudgetConsumptions as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      const result = await (api.listBudgetConsumptions as Function)({});

      expect(service.listBudgetConsumptions).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
        budgetLineId: undefined,
      });
      expect(result).toEqual(listResult);
    });

    it('passes budgetLineId filter to service', async () => {
      (service.listBudgetConsumptions as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listBudgetConsumptions as Function)({ budgetLineId: UUID });

      expect(service.listBudgetConsumptions).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
        budgetLineId: UUID,
      });
    });

    it('handles pagination params', async () => {
      (service.listBudgetConsumptions as ReturnType<typeof vi.fn>).mockResolvedValue(listResult);

      await (api.listBudgetConsumptions as Function)({ page: 2, limit: 10 });

      expect(service.listBudgetConsumptions).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 2,
        limit: 10,
        budgetLineId: undefined,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.listBudgetConsumptions as Function)({})).rejects.toThrow(
        'not authenticated',
      );
    });

    it('rejects negative page value', async () => {
      await expect((api.listBudgetConsumptions as Function)({ page: -1 })).rejects.toThrow();
    });

    it('rejects limit exceeding max', async () => {
      await expect((api.listBudgetConsumptions as Function)({ limit: 200 })).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.listBudgetConsumptions as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error'),
      );

      await expect((api.listBudgetConsumptions as Function)({})).rejects.toThrow('Database error');
    });
  });

  // ─── reverseConsumptionsForJournalEntry ─────────────────────────────────

  describe('reverseConsumptionsForJournalEntry', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.reverseConsumptionsForJournalEntry as ReturnType<typeof vi.fn>).mockResolvedValue(
        undefined,
      );

      await (api.reverseConsumptionsForJournalEntry as Function)(validReversalReq);

      expect(service.reverseConsumptionsForJournalEntry).toHaveBeenCalledWith(
        UUID3,
        TEST_TENANT_ID,
      );
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(
        (api.reverseConsumptionsForJournalEntry as Function)(validReversalReq),
      ).rejects.toThrow('not authenticated');
    });

    it('throws ValidationError when journalEntryId is missing', async () => {
      await expect(
        (api.reverseConsumptionsForJournalEntry as Function)({}),
      ).rejects.toThrow();
    });

    it('throws ValidationError when journalEntryId is not a valid UUID', async () => {
      await expect(
        (api.reverseConsumptionsForJournalEntry as Function)({ journalEntryId: 'not-a-uuid' }),
      ).rejects.toThrow();
    });

    it('propagates service errors', async () => {
      (service.reverseConsumptionsForJournalEntry as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Journal entry not found'),
      );

      await expect(
        (api.reverseConsumptionsForJournalEntry as Function)(validReversalReq),
      ).rejects.toThrow('Journal entry not found');
    });
  });

  // ─── getBudgetVariance ──────────────────────────────────────────────────

  describe('getBudgetVariance', () => {
    it('calls service with correct args when authenticated', async () => {
      (service.getBudgetVariance as ReturnType<typeof vi.fn>).mockResolvedValue([mockVariance]);

      const result = await (api.getBudgetVariance as Function)({ headerId: UUID });

      expect(service.getBudgetVariance).toHaveBeenCalledWith(UUID, TEST_TENANT_ID);
      expect(result).toEqual([mockVariance]);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect((api.getBudgetVariance as Function)({ headerId: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates NotFoundError from service', async () => {
      (service.getBudgetVariance as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Budget header with id xyz not found'),
      );

      await expect((api.getBudgetVariance as Function)({ headerId: 'xyz' })).rejects.toThrow(
        'Budget header with id xyz not found',
      );
    });

    it('returns empty array when budget has no lines', async () => {
      (service.getBudgetVariance as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const result = await (api.getBudgetVariance as Function)({ headerId: UUID });

      expect(result).toEqual([]);
    });

    it('propagates service errors', async () => {
      (service.getBudgetVariance as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect((api.getBudgetVariance as Function)({ headerId: UUID })).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
