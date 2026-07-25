/**
 * Accounts Payable — Service Tests
 *
 * @module features/ap/service.test
 * @description Comprehensive tests for the AP service layer covering vendors,
 *              bills, bill line items, and vendor payments.
 *
 * @see features/ap/service.ts — Service implementation
 * @see features/ap/fixtures/ap.fixture.ts — Test fixtures
 * @see knowledge/constitution/DOMAIN.md — BC-AP business rules
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OTHER_TENANT_ID, TEST_TENANT_ID, TEST_USER_ID } from '../../lib/test-utils';
import {
  createApprovedBillFixture,
  createBillFixture,
  createBillInputFixture,
  createBillLineItemFixture,
  createBillWithPOFixture,
  createDraftBillFixture,
  createInactiveVendorFixture,
  createPaidBillFixture,
  createPartiallyPaidBillFixture,
  createPendingApprovalBillFixture,
  createSecondBillLineItemFixture,
  createVendorFixture,
  createVendorInputFixture,
  createVendorPaymentFixture,
  createVendorPaymentInputFixture,
  createVoidedBillFixture,
} from './fixtures/ap.fixture';

// ─── Mock encore.dev/api (required to avoid runtime env error) ────────────

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string;
    status: number;
    details?: Record<string, string[]>;
    constructor(
      code: string,
      message: string,
      opts?: { status?: number; details?: Record<string, string[]> },
    ) {
      super(message);
      this.name = 'APIError';
      this.code = code;
      this.status = opts?.status ?? 500;
      this.details = opts?.details;
    }
  },
  api: vi.fn(),
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
  vendors: createMockTable('vendors'),
  bills: createMockTable('bills'),
  billLineItems: createMockTable('bill_line_items'),
  vendorPayments: createMockTable('vendor_payments'),
  paymentSchedules: createMockTable('payment_schedules'),
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

const { mockVendorRepo, mockBillRepo, mockBillLineItemRepo, mockVendorPaymentRepo } = vi.hoisted(
  () => ({
    mockVendorRepo: {
      findById: vi.fn(),
      findByCode: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    },
    mockBillRepo: {
      findById: vi.fn(),
      findByBillNumber: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      findByVendorId: vi.fn(),
      findPendingApproval: vi.fn(),
      findByPurchaseOrderId: vi.fn(),
    },
    mockBillLineItemRepo: {
      findById: vi.fn(),
      findByBillId: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteByBillId: vi.fn(),
    },
    mockVendorPaymentRepo: {
      findById: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      findByVendorId: vi.fn(),
      findByBillId: vi.fn(),
      sumPaymentsByBillId: vi.fn(),
    },
  }),
);

vi.mock('./repo', () => ({
  vendorRepo: mockVendorRepo,
  billRepo: mockBillRepo,
  billLineItemRepo: mockBillLineItemRepo,
  vendorPaymentRepo: mockVendorPaymentRepo,
}));

// ─── Mock Database Module ─────────────────────────────────────────────────

vi.mock('@lumora/database', () => ({
  db: {
    query: {},
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
  },
}));

// ─── Import Service After Mocking ─────────────────────────────────────────

import {
  BillAlreadyVoidedError,
  BillInvalidStatusTransitionError,
  BillNotApprovableError,
  BillNotFoundError,
  BillNumberConflictError,
  PurchaseOrderNotFoundError,
  ThreeWayMatchingError,
  VendorCodeConflictError,
  VendorInactiveError,
  VendorNameConflictError,
  VendorNotFoundError,
  VendorPaymentExceedsBillError,
  VendorPaymentNotFoundError,
} from './errors';
import * as service from './service';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('AP Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // VENDOR SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Vendor Service', () => {
    describe('createVendor', () => {
      it('should create vendor with unique code and name', async () => {
        const input = createVendorInputFixture();
        const expected = createVendorFixture();

        mockVendorRepo.findByCode.mockResolvedValue(undefined);
        mockVendorRepo.findMany.mockResolvedValue({ data: [], total: 0 });
        mockVendorRepo.create.mockResolvedValue(expected);

        const result = await service.createVendor(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(result).toEqual(expected);
        expect(mockVendorRepo.findByCode).toHaveBeenCalledWith(input.code, TEST_TENANT_ID);
        expect(mockVendorRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            ...input,
            tenantId: TEST_TENANT_ID,
            createdBy: TEST_USER_ID,
          }),
        );
      });

      it('should create vendor with all fields', async () => {
        const input = createVendorInputFixture({
          code: 'VEND-NEW',
          name: 'New Vendor',
          taxId: 'TAX-999',
          email: 'new@vendor.com',
          phone: '+1-555-9999',
          paymentTerms: 'net_60',
          currency: 'EUR',
        });
        const expected = createVendorFixture(input);

        mockVendorRepo.findByCode.mockResolvedValue(undefined);
        mockVendorRepo.findMany.mockResolvedValue({ data: [], total: 0 });
        mockVendorRepo.create.mockResolvedValue(expected);

        const result = await service.createVendor(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(result.code).toBe('VEND-NEW');
        expect(result.name).toBe('New Vendor');
        expect(mockVendorRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'VEND-NEW',
            name: 'New Vendor',
            taxId: 'TAX-999',
            email: 'new@vendor.com',
            phone: '+1-555-9999',
            paymentTerms: 'net_60',
            currency: 'EUR',
            tenantId: TEST_TENANT_ID,
            createdBy: TEST_USER_ID,
          }),
        );
      });

      it('should reject duplicate vendor code', async () => {
        const input = createVendorInputFixture();
        const existing = createVendorFixture();

        mockVendorRepo.findByCode.mockResolvedValue(existing);

        await expect(service.createVendor(input, TEST_TENANT_ID, TEST_USER_ID)).rejects.toThrow(
          VendorCodeConflictError,
        );
      });

      it('should reject duplicate vendor name (case-insensitive)', async () => {
        const input = createVendorInputFixture({ name: 'ACME SUPPLIES' });
        const existingVendor = createVendorFixture({ name: 'Acme Supplies' });

        mockVendorRepo.findByCode.mockResolvedValue(undefined);
        mockVendorRepo.findMany.mockResolvedValue({
          data: [existingVendor],
          total: 1,
        });

        await expect(service.createVendor(input, TEST_TENANT_ID, TEST_USER_ID)).rejects.toThrow(
          VendorNameConflictError,
        );
      });

      it('should scope code uniqueness to tenant', async () => {
        const input = createVendorInputFixture({ code: 'VEND-001' });

        // Same code exists in OTHER tenant, not this one
        mockVendorRepo.findByCode.mockImplementation(async (_code: string, tenantId: string) => {
          if (tenantId === OTHER_TENANT_ID) return createVendorFixture();
          return undefined;
        });
        mockVendorRepo.findMany.mockResolvedValue({ data: [], total: 0 });
        mockVendorRepo.create.mockResolvedValue(createVendorFixture());

        const result = await service.createVendor(input, TEST_TENANT_ID, TEST_USER_ID);
        expect(result).toBeDefined();
        expect(mockVendorRepo.findByCode).toHaveBeenCalledWith('VEND-001', TEST_TENANT_ID);
      });

      it('should pass tenantId and userId correctly', async () => {
        const input = createVendorInputFixture();

        mockVendorRepo.findByCode.mockResolvedValue(undefined);
        mockVendorRepo.findMany.mockResolvedValue({ data: [], total: 0 });
        mockVendorRepo.create.mockResolvedValue(createVendorFixture());

        await service.createVendor(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockVendorRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            tenantId: TEST_TENANT_ID,
            createdBy: TEST_USER_ID,
          }),
        );
      });
    });

    describe('getVendor', () => {
      it('should return vendor by id', async () => {
        const vendor = createVendorFixture();
        mockVendorRepo.findById.mockResolvedValue(vendor);

        const result = await service.getVendor(vendor.id, TEST_TENANT_ID);

        expect(result).toEqual(vendor);
        expect(mockVendorRepo.findById).toHaveBeenCalledWith(vendor.id, TEST_TENANT_ID);
      });

      it('should throw VendorNotFoundError for non-existent vendor', async () => {
        mockVendorRepo.findById.mockResolvedValue(undefined);

        await expect(service.getVendor('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          VendorNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockVendorRepo.findById.mockResolvedValue(undefined);

        await expect(service.getVendor('v-1', OTHER_TENANT_ID)).rejects.toThrow(
          VendorNotFoundError,
        );
        expect(mockVendorRepo.findById).toHaveBeenCalledWith('v-1', OTHER_TENANT_ID);
      });
    });

    describe('listVendors', () => {
      it('should return paginated vendors', async () => {
        const vendors = [createVendorFixture()];
        mockVendorRepo.findMany.mockResolvedValue({
          data: vendors,
          total: 1,
          page: 1,
          limit: 20,
        });

        const result = await service.listVendors(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no vendors exist', async () => {
        mockVendorRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listVendors(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should pass tenantId to repo', async () => {
        mockVendorRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listVendors(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockVendorRepo.findMany).toHaveBeenCalledWith(TEST_TENANT_ID, expect.anything());
      });

      it('should pass search params to repo', async () => {
        mockVendorRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listVendors(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          search: 'acme',
        });

        expect(mockVendorRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ search: 'acme' }),
        );
      });
    });

    describe('updateVendor', () => {
      it('should update vendor fields', async () => {
        const existing = createVendorFixture();
        const updated = { ...existing, name: 'Updated Vendor' };

        mockVendorRepo.findById.mockResolvedValue(existing);
        mockVendorRepo.update.mockResolvedValue(updated);

        const result = await service.updateVendor(
          existing.id,
          { name: 'Updated Vendor' },
          TEST_TENANT_ID,
        );

        expect(result.name).toBe('Updated Vendor');
        expect(mockVendorRepo.update).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID, {
          name: 'Updated Vendor',
        });
      });

      it('should update vendor code without conflict when unchanged', async () => {
        const existing = createVendorFixture({ code: 'VEND-001' });
        const updated = { ...existing, code: 'VEND-001' };

        mockVendorRepo.findById.mockResolvedValue(existing);
        mockVendorRepo.update.mockResolvedValue(updated);

        const result = await service.updateVendor(
          existing.id,
          { code: 'VEND-001' },
          TEST_TENANT_ID,
        );

        expect(result.code).toBe('VEND-001');
        expect(mockVendorRepo.findByCode).not.toHaveBeenCalled();
      });

      it('should check code uniqueness when changing code', async () => {
        const existing = createVendorFixture({ code: 'VEND-001' });
        const duplicate = createVendorFixture({ id: 'other-id', code: 'VEND-002' });

        mockVendorRepo.findById.mockResolvedValue(existing);
        mockVendorRepo.findByCode.mockResolvedValue(duplicate);

        await expect(
          service.updateVendor(existing.id, { code: 'VEND-002' }, TEST_TENANT_ID),
        ).rejects.toThrow(VendorCodeConflictError);
      });

      it('should allow new code that does not conflict', async () => {
        const existing = createVendorFixture({ code: 'VEND-001' });
        const updated = { ...existing, code: 'VEND-NEW' };

        mockVendorRepo.findById.mockResolvedValue(existing);
        mockVendorRepo.findByCode.mockResolvedValue(undefined);
        mockVendorRepo.update.mockResolvedValue(updated);

        const result = await service.updateVendor(
          existing.id,
          { code: 'VEND-NEW' },
          TEST_TENANT_ID,
        );

        expect(result.code).toBe('VEND-NEW');
      });

      it('should throw VendorNotFoundError for non-existent vendor', async () => {
        mockVendorRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateVendor('non-existent', { name: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(VendorNotFoundError);
      });

      it('should throw VendorNotFoundError if update returns undefined', async () => {
        const existing = createVendorFixture();

        mockVendorRepo.findById.mockResolvedValue(existing);
        mockVendorRepo.update.mockResolvedValue(undefined);

        await expect(
          service.updateVendor(existing.id, { name: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(VendorNotFoundError);
      });

      it('should scope update to tenant', async () => {
        mockVendorRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateVendor('v-1', { name: 'Test' }, OTHER_TENANT_ID),
        ).rejects.toThrow(VendorNotFoundError);
        expect(mockVendorRepo.findById).toHaveBeenCalledWith('v-1', OTHER_TENANT_ID);
      });
    });

    describe('deleteVendor', () => {
      it('should soft delete vendor', async () => {
        const existing = createVendorFixture();

        mockVendorRepo.findById.mockResolvedValue(existing);
        mockVendorRepo.softDelete.mockResolvedValue(undefined);

        await service.deleteVendor(existing.id, TEST_TENANT_ID);

        expect(mockVendorRepo.softDelete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should throw VendorNotFoundError for non-existent vendor', async () => {
        mockVendorRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteVendor('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          VendorNotFoundError,
        );
      });

      it('should scope deletion to tenant', async () => {
        mockVendorRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteVendor('v-1', OTHER_TENANT_ID)).rejects.toThrow(
          VendorNotFoundError,
        );
        expect(mockVendorRepo.findById).toHaveBeenCalledWith('v-1', OTHER_TENANT_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BILL SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Bill Service', () => {
    describe('createBill', () => {
      it('should create bill with active vendor', async () => {
        const vendor = createVendorFixture();
        const bill = createBillFixture();

        mockVendorRepo.findById.mockResolvedValue(vendor);
        mockBillRepo.findByBillNumber.mockResolvedValue(undefined);
        mockBillRepo.create.mockResolvedValue(bill);

        const result = await service.createBill(
          createBillInputFixture(),
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.id).toBe(bill.id);
        expect(result.vendorId).toBe(bill.vendorId);
        expect(result.billNumber).toBe(bill.billNumber);
        expect(result.lineItems).toEqual([]);
        expect(mockVendorRepo.findById).toHaveBeenCalledWith(vendor.id, TEST_TENANT_ID);
        expect(mockBillRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            tenantId: TEST_TENANT_ID,
            createdBy: TEST_USER_ID,
          }),
        );
      });

      it('should create bill with line items and recalculate totals', async () => {
        const vendor = createVendorFixture();
        const bill = createDraftBillFixture({
          subtotal: '200.0000',
          taxAmount: '20.0000',
          totalAmount: '220.0000',
        });
        const lineItems = [createBillLineItemFixture(), createSecondBillLineItemFixture()];

        mockVendorRepo.findById.mockResolvedValue(vendor);
        mockBillRepo.findByBillNumber.mockResolvedValue(undefined);
        mockBillRepo.create.mockResolvedValue(bill);
        mockBillLineItemRepo.createMany.mockResolvedValue(lineItems);
        mockBillRepo.update.mockResolvedValue(bill);

        const result = await service.createBill(
          createBillInputFixture({
            lineItems: [
              { description: 'Widget A', amount: '100.0000', taxAmount: '10.0000' },
              { description: 'Widget B', amount: '100.0000', taxAmount: '10.0000' },
            ],
          }),
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.lineItems).toEqual(lineItems);
        expect(mockBillLineItemRepo.createMany).toHaveBeenCalled();
      });

      it('should throw VendorNotFoundError for non-existent vendor', async () => {
        mockVendorRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createBill(createBillInputFixture(), TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(VendorNotFoundError);
      });

      it('should throw VendorInactiveError for inactive vendor', async () => {
        const inactiveVendor = createInactiveVendorFixture();

        mockVendorRepo.findById.mockResolvedValue(inactiveVendor);

        await expect(
          service.createBill(createBillInputFixture(), TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(VendorInactiveError);
      });

      it('should throw BillNumberConflictError for duplicate bill number', async () => {
        const vendor = createVendorFixture();
        const existingBill = createBillFixture();

        mockVendorRepo.findById.mockResolvedValue(vendor);
        mockBillRepo.findByBillNumber.mockResolvedValue(existingBill);

        await expect(
          service.createBill(createBillInputFixture(), TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(BillNumberConflictError);
      });

      it('should create bill without line items', async () => {
        const vendor = createVendorFixture();
        const bill = createDraftBillFixture();

        mockVendorRepo.findById.mockResolvedValue(vendor);
        mockBillRepo.findByBillNumber.mockResolvedValue(undefined);
        mockBillRepo.create.mockResolvedValue(bill);

        const result = await service.createBill(
          createBillInputFixture({ lineItems: undefined }),
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result.id).toBe(bill.id);
        expect(result.lineItems).toEqual([]);
        expect(mockBillLineItemRepo.createMany).not.toHaveBeenCalled();
      });

      it('should pass tenantId and userId correctly', async () => {
        const vendor = createVendorFixture();
        const bill = createBillFixture();

        mockVendorRepo.findById.mockResolvedValue(vendor);
        mockBillRepo.findByBillNumber.mockResolvedValue(undefined);
        mockBillRepo.create.mockResolvedValue(bill);

        await service.createBill(createBillInputFixture(), TEST_TENANT_ID, TEST_USER_ID);

        expect(mockBillRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            tenantId: TEST_TENANT_ID,
            createdBy: TEST_USER_ID,
          }),
        );
      });
    });

    describe('getBill', () => {
      it('should return bill with line items and payments', async () => {
        const bill = createBillFixture();
        const lineItems = [createBillLineItemFixture()];
        const payments = [createVendorPaymentFixture({ amount: '50.0000' })];

        mockBillRepo.findById.mockResolvedValue(bill);
        mockBillLineItemRepo.findByBillId.mockResolvedValue(lineItems);
        mockVendorPaymentRepo.findByBillId.mockResolvedValue(payments);

        const result = await service.getBill(bill.id, TEST_TENANT_ID);

        expect(result.id).toBe(bill.id);
        expect(result.lineItems).toEqual(lineItems);
        expect(result.payments).toEqual(payments);
        expect(result.totalPaid).toBe('50');
        expect(result.outstandingAmount).toBe('60');
      });

      it('should return bill with no payments', async () => {
        const bill = createBillFixture({ totalAmount: '110.0000' });

        mockBillRepo.findById.mockResolvedValue(bill);
        mockBillLineItemRepo.findByBillId.mockResolvedValue([]);
        mockVendorPaymentRepo.findByBillId.mockResolvedValue([]);

        const result = await service.getBill(bill.id, TEST_TENANT_ID);

        expect(result.totalPaid).toBe('0');
        expect(result.outstandingAmount).toBe('110');
      });

      it('should calculate outstanding amount with multiple payments', async () => {
        const bill = createBillFixture({ totalAmount: '100.0000' });
        const payments = [
          createVendorPaymentFixture({ amount: '30.0000' }),
          createVendorPaymentFixture({
            id: 'vp-002',
            amount: '20.0000',
          }),
        ];

        mockBillRepo.findById.mockResolvedValue(bill);
        mockBillLineItemRepo.findByBillId.mockResolvedValue([]);
        mockVendorPaymentRepo.findByBillId.mockResolvedValue(payments);

        const result = await service.getBill(bill.id, TEST_TENANT_ID);

        expect(result.totalPaid).toBe('50');
        expect(result.outstandingAmount).toBe('50');
      });

      it('should throw BillNotFoundError for non-existent bill', async () => {
        mockBillRepo.findById.mockResolvedValue(undefined);

        await expect(service.getBill('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          BillNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockBillRepo.findById.mockResolvedValue(undefined);

        await expect(service.getBill('b-1', OTHER_TENANT_ID)).rejects.toThrow(BillNotFoundError);
        expect(mockBillRepo.findById).toHaveBeenCalledWith('b-1', OTHER_TENANT_ID);
      });
    });

    describe('listBills', () => {
      it('should return paginated bills', async () => {
        const bills = [createBillFixture()];
        mockBillRepo.findMany.mockResolvedValue({
          data: bills,
          total: 1,
          page: 1,
          limit: 20,
        });

        const result = await service.listBills(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no bills exist', async () => {
        mockBillRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listBills(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should filter by status', async () => {
        mockBillRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listBills(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          status: 'approved',
        });

        expect(mockBillRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ status: 'approved' }),
        );
      });

      it('should filter by vendorId', async () => {
        mockBillRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listBills(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          vendorId: 'v-001',
        });

        expect(mockBillRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ vendorId: 'v-001' }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockBillRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listBills(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockBillRepo.findMany).toHaveBeenCalledWith(TEST_TENANT_ID, expect.anything());
      });
    });

    describe('updateBill', () => {
      it('should update draft bill', async () => {
        const existing = createDraftBillFixture();
        const updated = { ...existing, notes: 'Updated notes' };
        const lineItems = [createBillLineItemFixture()];

        mockBillRepo.findById.mockResolvedValue(existing);
        mockBillRepo.update.mockResolvedValue(updated);
        mockBillLineItemRepo.findByBillId.mockResolvedValue(lineItems);

        const result = await service.updateBill(
          existing.id,
          { notes: 'Updated notes' },
          TEST_TENANT_ID,
        );

        expect(result.notes).toBe('Updated notes');
        expect(mockBillRepo.update).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID, {
          notes: 'Updated notes',
        });
      });

      it('should throw BillNotFoundError for non-existent bill', async () => {
        mockBillRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateBill('non-existent', { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(BillNotFoundError);
      });

      it('should reject update of non-draft bill (pending_approval)', async () => {
        const existing = createPendingApprovalBillFixture();
        mockBillRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateBill(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(BillInvalidStatusTransitionError);
      });

      it('should reject update of approved bill', async () => {
        const existing = createApprovedBillFixture();
        mockBillRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateBill(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(BillInvalidStatusTransitionError);
      });

      it('should reject update of paid bill', async () => {
        const existing = createPaidBillFixture();
        mockBillRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateBill(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(BillInvalidStatusTransitionError);
      });

      it('should reject update of voided bill', async () => {
        const existing = createVoidedBillFixture();
        mockBillRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateBill(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(BillInvalidStatusTransitionError);
      });

      it('should throw BillNotFoundError if update returns undefined', async () => {
        const existing = createDraftBillFixture();

        mockBillRepo.findById.mockResolvedValue(existing);
        mockBillRepo.update.mockResolvedValue(undefined);

        await expect(
          service.updateBill(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(BillNotFoundError);
      });
    });

    describe('deleteBill', () => {
      it('should soft delete draft bill and its line items', async () => {
        const existing = createDraftBillFixture();

        mockBillRepo.findById.mockResolvedValue(existing);
        mockBillLineItemRepo.deleteByBillId.mockResolvedValue(undefined);
        mockBillRepo.softDelete.mockResolvedValue(undefined);

        await service.deleteBill(existing.id, TEST_TENANT_ID);

        expect(mockBillLineItemRepo.deleteByBillId).toHaveBeenCalledWith(existing.id);
        expect(mockBillRepo.softDelete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should throw BillNotFoundError for non-existent bill', async () => {
        mockBillRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteBill('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          BillNotFoundError,
        );
      });

      it('should reject deletion of non-draft bill', async () => {
        const existing = createApprovedBillFixture();
        mockBillRepo.findById.mockResolvedValue(existing);

        await expect(service.deleteBill(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          BillInvalidStatusTransitionError,
        );
      });

      it('should reject deletion of pending_approval bill', async () => {
        const existing = createPendingApprovalBillFixture();
        mockBillRepo.findById.mockResolvedValue(existing);

        await expect(service.deleteBill(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          BillInvalidStatusTransitionError,
        );
      });

      it('should reject deletion of voided bill', async () => {
        const existing = createVoidedBillFixture();
        mockBillRepo.findById.mockResolvedValue(existing);

        await expect(service.deleteBill(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          BillInvalidStatusTransitionError,
        );
      });

      it('should delete line items before soft deleting bill', async () => {
        const existing = createDraftBillFixture();

        mockBillRepo.findById.mockResolvedValue(existing);
        mockBillLineItemRepo.deleteByBillId.mockResolvedValue(undefined);
        mockBillRepo.softDelete.mockResolvedValue(undefined);

        await service.deleteBill(existing.id, TEST_TENANT_ID);

        // Verify ordering: deleteByBillId called before softDelete
        const deleteCalls = mockBillLineItemRepo.deleteByBillId.mock.invocationCallOrder[0];
        const softDeleteCalls = mockBillRepo.softDelete.mock.invocationCallOrder[0];
        expect(deleteCalls).toBeLessThan(softDeleteCalls);
      });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // BILL STATUS TRANSITIONS
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Bill Status Transitions', () => {
      describe('submitBillForApproval', () => {
        it('should submit draft bill for approval', async () => {
          const bill = createDraftBillFixture();
          const updated = createPendingApprovalBillFixture();

          mockBillRepo.findById.mockResolvedValue(bill);
          mockBillRepo.update.mockResolvedValue(updated);
          mockBillLineItemRepo.findByBillId.mockResolvedValue([createBillLineItemFixture()]);

          const result = await service.submitBillForApproval(bill.id, TEST_TENANT_ID);

          expect(result.status).toBe('pending_approval');
          expect(mockBillRepo.update).toHaveBeenCalledWith(bill.id, TEST_TENANT_ID, {
            status: 'pending_approval',
          });
        });

        it('should throw BillNotFoundError for non-existent bill', async () => {
          mockBillRepo.findById.mockResolvedValue(undefined);

          await expect(
            service.submitBillForApproval('non-existent', TEST_TENANT_ID),
          ).rejects.toThrow(BillNotFoundError);
        });

        it('should reject submitting pending_approval bill', async () => {
          const bill = createPendingApprovalBillFixture();
          mockBillRepo.findById.mockResolvedValue(bill);

          await expect(service.submitBillForApproval(bill.id, TEST_TENANT_ID)).rejects.toThrow(
            BillInvalidStatusTransitionError,
          );
        });

        it('should reject submitting approved bill', async () => {
          const bill = createApprovedBillFixture();
          mockBillRepo.findById.mockResolvedValue(bill);

          await expect(service.submitBillForApproval(bill.id, TEST_TENANT_ID)).rejects.toThrow(
            BillInvalidStatusTransitionError,
          );
        });

        it('should reject submitting paid bill', async () => {
          const bill = createPaidBillFixture();
          mockBillRepo.findById.mockResolvedValue(bill);

          await expect(service.submitBillForApproval(bill.id, TEST_TENANT_ID)).rejects.toThrow(
            BillInvalidStatusTransitionError,
          );
        });

        it('should perform three-way matching for PO-based bills', async () => {
          const bill = createBillWithPOFixture({
            subtotal: '100.0000',
            taxAmount: '10.0000',
            totalAmount: '110.0000',
          });
          const lineItems = [createBillLineItemFixture()];
          const updated = { ...bill, status: 'pending_approval' as const };

          // Mock three-way matching dependencies
          mockBillRepo.findById.mockResolvedValue(bill);
          mockBillRepo.findByPurchaseOrderId.mockResolvedValue([bill]);
          mockBillLineItemRepo.findByBillId.mockResolvedValue(lineItems);
          mockBillRepo.update.mockResolvedValue(updated);

          const result = await service.submitBillForApproval(bill.id, TEST_TENANT_ID);

          expect(result.status).toBe('pending_approval');
          expect(mockBillRepo.findByPurchaseOrderId).toHaveBeenCalledWith(
            bill.purchaseOrderId,
            TEST_TENANT_ID,
          );
        });

        it('should fail three-way matching when PO has no bills', async () => {
          const bill = createBillWithPOFixture();

          mockBillRepo.findById.mockResolvedValue(bill);
          mockBillRepo.findByPurchaseOrderId.mockResolvedValue([]);

          await expect(service.submitBillForApproval(bill.id, TEST_TENANT_ID)).rejects.toThrow(
            PurchaseOrderNotFoundError,
          );
        });

        it('should fail three-way matching when bill has no line items', async () => {
          const bill = createBillWithPOFixture();

          mockBillRepo.findById.mockResolvedValue(bill);
          mockBillRepo.findByPurchaseOrderId.mockResolvedValue([bill]);
          mockBillLineItemRepo.findByBillId.mockResolvedValue([]);

          await expect(service.submitBillForApproval(bill.id, TEST_TENANT_ID)).rejects.toThrow(
            ThreeWayMatchingError,
          );
        });

        it('should fail three-way matching on subtotal mismatch', async () => {
          const bill = createBillWithPOFixture({
            subtotal: '999.0000',
            taxAmount: '10.0000',
            totalAmount: '1009.0000',
          });
          const lineItems = [
            createBillLineItemFixture({ amount: '100.0000', taxAmount: '10.0000' }),
          ];

          mockBillRepo.findById.mockResolvedValue(bill);
          mockBillRepo.findByPurchaseOrderId.mockResolvedValue([bill]);
          mockBillLineItemRepo.findByBillId.mockResolvedValue(lineItems);

          await expect(service.submitBillForApproval(bill.id, TEST_TENANT_ID)).rejects.toThrow(
            ThreeWayMatchingError,
          );
        });

        it('should pass tenantId to three-way matching', async () => {
          const bill = createBillWithPOFixture({
            subtotal: '100.0000',
            taxAmount: '10.0000',
            totalAmount: '110.0000',
          });
          const lineItems = [createBillLineItemFixture()];
          const updated = { ...bill, status: 'pending_approval' as const };

          mockBillRepo.findById.mockResolvedValue(bill);
          mockBillRepo.findByPurchaseOrderId.mockResolvedValue([bill]);
          mockBillLineItemRepo.findByBillId.mockResolvedValue(lineItems);
          mockBillRepo.update.mockResolvedValue(updated);

          await service.submitBillForApproval(bill.id, TEST_TENANT_ID);

          expect(mockBillRepo.findByPurchaseOrderId).toHaveBeenCalledWith(
            bill.purchaseOrderId,
            TEST_TENANT_ID,
          );
        });
      });

      describe('approveBill', () => {
        it('should approve pending_approval bill', async () => {
          const bill = createPendingApprovalBillFixture();
          const updated = createApprovedBillFixture();

          mockBillRepo.findById.mockResolvedValue(bill);
          mockBillRepo.update.mockResolvedValue(updated);
          mockBillLineItemRepo.findByBillId.mockResolvedValue([createBillLineItemFixture()]);

          const result = await service.approveBill(bill.id, TEST_TENANT_ID);

          expect(result.status).toBe('approved');
          expect(mockBillRepo.update).toHaveBeenCalledWith(bill.id, TEST_TENANT_ID, {
            status: 'approved',
          });
        });

        it('should throw BillNotFoundError for non-existent bill', async () => {
          mockBillRepo.findById.mockResolvedValue(undefined);

          await expect(service.approveBill('non-existent', TEST_TENANT_ID)).rejects.toThrow(
            BillNotFoundError,
          );
        });

        it('should reject approving draft bill', async () => {
          const bill = createDraftBillFixture();
          mockBillRepo.findById.mockResolvedValue(bill);

          await expect(service.approveBill(bill.id, TEST_TENANT_ID)).rejects.toThrow(
            BillNotApprovableError,
          );
        });

        it('should reject approving already approved bill', async () => {
          const bill = createApprovedBillFixture();
          mockBillRepo.findById.mockResolvedValue(bill);

          await expect(service.approveBill(bill.id, TEST_TENANT_ID)).rejects.toThrow(
            BillNotApprovableError,
          );
        });

        it('should reject approving paid bill', async () => {
          const bill = createPaidBillFixture();
          mockBillRepo.findById.mockResolvedValue(bill);

          await expect(service.approveBill(bill.id, TEST_TENANT_ID)).rejects.toThrow(
            BillNotApprovableError,
          );
        });

        it('should reject approving voided bill', async () => {
          const bill = createVoidedBillFixture();
          mockBillRepo.findById.mockResolvedValue(bill);

          await expect(service.approveBill(bill.id, TEST_TENANT_ID)).rejects.toThrow(
            BillNotApprovableError,
          );
        });

        it('should reject approving partially_paid bill', async () => {
          const bill = createPartiallyPaidBillFixture();
          mockBillRepo.findById.mockResolvedValue(bill);

          await expect(service.approveBill(bill.id, TEST_TENANT_ID)).rejects.toThrow(
            BillNotApprovableError,
          );
        });
      });

      describe('voidBill', () => {
        it('should void draft bill', async () => {
          const bill = createDraftBillFixture();
          const updated = createVoidedBillFixture();

          mockBillRepo.findById.mockResolvedValue(bill);
          mockBillRepo.update.mockResolvedValue(updated);
          mockBillLineItemRepo.findByBillId.mockResolvedValue([createBillLineItemFixture()]);

          const result = await service.voidBill(bill.id, TEST_TENANT_ID);

          expect(result.status).toBe('voided');
          expect(mockBillRepo.update).toHaveBeenCalledWith(bill.id, TEST_TENANT_ID, {
            status: 'voided',
          });
        });

        it('should void pending_approval bill', async () => {
          const bill = createPendingApprovalBillFixture();
          const updated = createVoidedBillFixture();

          mockBillRepo.findById.mockResolvedValue(bill);
          mockBillRepo.update.mockResolvedValue(updated);
          mockBillLineItemRepo.findByBillId.mockResolvedValue([]);

          const result = await service.voidBill(bill.id, TEST_TENANT_ID);

          expect(result.status).toBe('voided');
        });

        it('should void approved bill', async () => {
          const bill = createApprovedBillFixture();
          const updated = createVoidedBillFixture();

          mockBillRepo.findById.mockResolvedValue(bill);
          mockBillRepo.update.mockResolvedValue(updated);
          mockBillLineItemRepo.findByBillId.mockResolvedValue([]);

          const result = await service.voidBill(bill.id, TEST_TENANT_ID);

          expect(result.status).toBe('voided');
        });

        it('should void partially_paid bill', async () => {
          const bill = createPartiallyPaidBillFixture();
          const updated = createVoidedBillFixture();

          mockBillRepo.findById.mockResolvedValue(bill);
          mockBillRepo.update.mockResolvedValue(updated);
          mockBillLineItemRepo.findByBillId.mockResolvedValue([]);

          const result = await service.voidBill(bill.id, TEST_TENANT_ID);

          expect(result.status).toBe('voided');
        });

        it('should throw BillNotFoundError for non-existent bill', async () => {
          mockBillRepo.findById.mockResolvedValue(undefined);

          await expect(service.voidBill('non-existent', TEST_TENANT_ID)).rejects.toThrow(
            BillNotFoundError,
          );
        });

        it('should throw BillAlreadyVoidedError for already voided bill', async () => {
          const bill = createVoidedBillFixture();
          mockBillRepo.findById.mockResolvedValue(bill);

          await expect(service.voidBill(bill.id, TEST_TENANT_ID)).rejects.toThrow(
            BillAlreadyVoidedError,
          );
        });

        it('should reject voiding paid bill (no valid transition)', async () => {
          const bill = createPaidBillFixture();
          mockBillRepo.findById.mockResolvedValue(bill);

          await expect(service.voidBill(bill.id, TEST_TENANT_ID)).rejects.toThrow(
            BillInvalidStatusTransitionError,
          );
        });
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BILL LINE ITEMS SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Bill Line Items Service', () => {
    describe('addBillLineItem', () => {
      it('should add line item to draft bill', async () => {
        const bill = createDraftBillFixture();
        const lineItem = createBillLineItemFixture();

        mockBillRepo.findById.mockResolvedValue(bill);
        mockBillLineItemRepo.findByBillId.mockResolvedValue([]);
        mockBillLineItemRepo.create.mockResolvedValue(lineItem);
        mockBillRepo.update.mockResolvedValue(bill);

        const result = await service.addBillLineItem(
          bill.id,
          { description: 'Widget A', amount: '100.0000' },
          TEST_TENANT_ID,
        );

        expect(result).toEqual(lineItem);
        expect(mockBillLineItemRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            billId: bill.id,
            description: 'Widget A',
            amount: '100.0000',
          }),
        );
      });

      it('should auto-calculate sortOrder from existing items', async () => {
        const bill = createDraftBillFixture();
        const existingItems = [
          createBillLineItemFixture({ sortOrder: 0 }),
          createSecondBillLineItemFixture({ sortOrder: 1 }),
        ];
        const newLineItem = createBillLineItemFixture({
          id: 'bli-003',
          sortOrder: 2,
        });

        mockBillRepo.findById.mockResolvedValue(bill);
        mockBillLineItemRepo.findByBillId.mockResolvedValue(existingItems);
        mockBillLineItemRepo.create.mockResolvedValue(newLineItem);
        mockBillRepo.update.mockResolvedValue(bill);

        await service.addBillLineItem(
          bill.id,
          { description: 'Widget C', sortOrder: undefined },
          TEST_TENANT_ID,
        );

        expect(mockBillLineItemRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ sortOrder: 2 }),
        );
      });

      it('should use provided sortOrder when specified', async () => {
        const bill = createDraftBillFixture();
        const lineItem = createBillLineItemFixture({ sortOrder: 5 });

        mockBillRepo.findById.mockResolvedValue(bill);
        mockBillLineItemRepo.findByBillId.mockResolvedValue([]);
        mockBillLineItemRepo.create.mockResolvedValue(lineItem);
        mockBillRepo.update.mockResolvedValue(bill);

        await service.addBillLineItem(
          bill.id,
          { description: 'Widget A', sortOrder: 5 },
          TEST_TENANT_ID,
        );

        expect(mockBillLineItemRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ sortOrder: 5 }),
        );
      });

      it('should recalculate bill totals after adding line item', async () => {
        const bill = createDraftBillFixture();
        const lineItem = createBillLineItemFixture({
          amount: '200.0000',
          taxAmount: '20.0000',
        });
        const allItems = [lineItem];

        mockBillRepo.findById.mockResolvedValue(bill);
        mockBillLineItemRepo.findByBillId.mockResolvedValue(allItems);
        mockBillLineItemRepo.create.mockResolvedValue(lineItem);
        mockBillRepo.update.mockResolvedValue(bill);

        await service.addBillLineItem(
          bill.id,
          { description: 'Widget A', amount: '200.0000', taxAmount: '20.0000' },
          TEST_TENANT_ID,
        );

        expect(mockBillRepo.update).toHaveBeenCalledWith(
          bill.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            subtotal: '200.0000',
            taxAmount: '20.0000',
            totalAmount: '220.0000',
          }),
        );
      });

      it('should throw BillNotFoundError for non-existent bill', async () => {
        mockBillRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.addBillLineItem('non-existent', { description: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(BillNotFoundError);
      });

      it('should reject adding line item to non-draft bill', async () => {
        const bill = createApprovedBillFixture();
        mockBillRepo.findById.mockResolvedValue(bill);

        await expect(
          service.addBillLineItem(bill.id, { description: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(BillInvalidStatusTransitionError);
      });

      it('should reject adding line item to voided bill', async () => {
        const bill = createVoidedBillFixture();
        mockBillRepo.findById.mockResolvedValue(bill);

        await expect(
          service.addBillLineItem(bill.id, { description: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(BillInvalidStatusTransitionError);
      });
    });

    describe('updateBillLineItem', () => {
      it('should update line item on draft bill', async () => {
        const bill = createDraftBillFixture();
        const existingItem = createBillLineItemFixture();
        const updatedItem = { ...existingItem, description: 'Updated Widget' };

        mockBillRepo.findById.mockResolvedValue(bill);
        mockBillLineItemRepo.findById.mockResolvedValue(existingItem);
        mockBillLineItemRepo.update.mockResolvedValue(updatedItem);
        mockBillRepo.update.mockResolvedValue(bill);

        const result = await service.updateBillLineItem(
          existingItem.id,
          { description: 'Updated Widget' },
          bill.id,
          TEST_TENANT_ID,
        );

        expect(result.description).toBe('Updated Widget');
      });

      it('should recalculate bill totals after updating line item', async () => {
        const bill = createDraftBillFixture();
        const existingItem = createBillLineItemFixture({
          amount: '100.0000',
          taxAmount: '10.0000',
        });

        mockBillRepo.findById.mockResolvedValue(bill);
        mockBillLineItemRepo.findById.mockResolvedValue(existingItem);
        mockBillLineItemRepo.update.mockResolvedValue(existingItem);
        // After update, findByBillId returns updated totals
        mockBillLineItemRepo.findByBillId.mockResolvedValue([
          { ...existingItem, amount: '150.0000', taxAmount: '15.0000' },
        ]);
        mockBillRepo.update.mockResolvedValue(bill);

        await service.updateBillLineItem(
          existingItem.id,
          { amount: '150.0000', taxAmount: '15.0000' },
          bill.id,
          TEST_TENANT_ID,
        );

        expect(mockBillRepo.update).toHaveBeenCalledWith(
          bill.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            subtotal: '150.0000',
            taxAmount: '15.0000',
            totalAmount: '165.0000',
          }),
        );
      });

      it('should throw BillNotFoundError for non-existent bill', async () => {
        mockBillRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateBillLineItem(
            'item-1',
            { description: 'Test' },
            'non-existent',
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(BillNotFoundError);
      });

      it('should reject updating line item on non-draft bill', async () => {
        const bill = createApprovedBillFixture();
        mockBillRepo.findById.mockResolvedValue(bill);

        await expect(
          service.updateBillLineItem('item-1', { description: 'Test' }, bill.id, TEST_TENANT_ID),
        ).rejects.toThrow(BillInvalidStatusTransitionError);
      });

      it('should reject updating line item on voided bill', async () => {
        const bill = createVoidedBillFixture();
        mockBillRepo.findById.mockResolvedValue(bill);

        await expect(
          service.updateBillLineItem('item-1', { description: 'Test' }, bill.id, TEST_TENANT_ID),
        ).rejects.toThrow(BillInvalidStatusTransitionError);
      });
    });

    describe('deleteBillLineItem', () => {
      it('should delete line item from draft bill', async () => {
        const bill = createDraftBillFixture();
        const existingItem = createBillLineItemFixture();

        mockBillRepo.findById.mockResolvedValue(bill);
        mockBillLineItemRepo.findById.mockResolvedValue(existingItem);
        mockBillLineItemRepo.delete.mockResolvedValue(true);
        mockBillLineItemRepo.findByBillId.mockResolvedValue([]);
        mockBillRepo.update.mockResolvedValue(bill);

        await service.deleteBillLineItem(existingItem.id, bill.id, TEST_TENANT_ID);

        expect(mockBillLineItemRepo.delete).toHaveBeenCalledWith(existingItem.id);
      });

      it('should recalculate bill totals after deleting line item', async () => {
        const bill = createDraftBillFixture();
        const existingItem = createBillLineItemFixture();

        mockBillRepo.findById.mockResolvedValue(bill);
        mockBillLineItemRepo.findById.mockResolvedValue(existingItem);
        mockBillLineItemRepo.delete.mockResolvedValue(true);
        // After deletion, no remaining items
        mockBillLineItemRepo.findByBillId.mockResolvedValue([]);
        mockBillRepo.update.mockResolvedValue(bill);

        await service.deleteBillLineItem(existingItem.id, bill.id, TEST_TENANT_ID);

        expect(mockBillRepo.update).toHaveBeenCalledWith(
          bill.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            subtotal: '0.0000',
            taxAmount: '0.0000',
            totalAmount: '0.0000',
          }),
        );
      });

      it('should throw BillNotFoundError for non-existent bill', async () => {
        mockBillRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.deleteBillLineItem('item-1', 'non-existent', TEST_TENANT_ID),
        ).rejects.toThrow(BillNotFoundError);
      });

      it('should reject deleting line item from non-draft bill', async () => {
        const bill = createApprovedBillFixture();
        mockBillRepo.findById.mockResolvedValue(bill);

        await expect(service.deleteBillLineItem('item-1', bill.id, TEST_TENANT_ID)).rejects.toThrow(
          BillInvalidStatusTransitionError,
        );
      });

      it('should reject deleting line item from voided bill', async () => {
        const bill = createVoidedBillFixture();
        mockBillRepo.findById.mockResolvedValue(bill);

        await expect(service.deleteBillLineItem('item-1', bill.id, TEST_TENANT_ID)).rejects.toThrow(
          BillInvalidStatusTransitionError,
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // VENDOR PAYMENTS SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Vendor Payments Service', () => {
    describe('createVendorPayment', () => {
      it('should create payment for active vendor with linked bill', async () => {
        const vendor = createVendorFixture();
        const bill = createApprovedBillFixture({ totalAmount: '110.0000' });
        const payment = createVendorPaymentFixture({ amount: '50.0000' });

        mockVendorRepo.findById.mockResolvedValue(vendor);
        mockBillRepo.findById.mockResolvedValue(bill);
        mockVendorPaymentRepo.findByBillId.mockResolvedValue([]);
        mockVendorPaymentRepo.create.mockResolvedValue(payment);
        // Mock for updateBillStatusAfterPayment
        mockBillRepo.findById.mockResolvedValue(bill);
        mockVendorPaymentRepo.findByBillId.mockResolvedValue([payment]);
        mockBillRepo.update.mockResolvedValue({ ...bill, status: 'partially_paid' });

        const result = await service.createVendorPayment(
          createVendorPaymentInputFixture({ amount: '50.0000' }),
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result).toEqual(payment);
        expect(mockVendorPaymentRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            tenantId: TEST_TENANT_ID,
            createdBy: TEST_USER_ID,
          }),
        );
      });

      it('should create payment without linked bill', async () => {
        const vendor = createVendorFixture();
        const payment = createVendorPaymentFixture({ billId: null });

        mockVendorRepo.findById.mockResolvedValue(vendor);
        mockVendorPaymentRepo.create.mockResolvedValue(payment);

        const result = await service.createVendorPayment(
          createVendorPaymentInputFixture({ billId: undefined }),
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result).toEqual(payment);
        expect(mockBillRepo.findById).not.toHaveBeenCalled();
      });

      it('should throw VendorNotFoundError for non-existent vendor', async () => {
        mockVendorRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createVendorPayment(
            createVendorPaymentInputFixture(),
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(VendorNotFoundError);
      });

      it('should throw VendorInactiveError for inactive vendor', async () => {
        const inactiveVendor = createInactiveVendorFixture();
        mockVendorRepo.findById.mockResolvedValue(inactiveVendor);

        await expect(
          service.createVendorPayment(
            createVendorPaymentInputFixture(),
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(VendorInactiveError);
      });

      it('should throw BillNotFoundError for non-existent linked bill', async () => {
        const vendor = createVendorFixture();
        mockVendorRepo.findById.mockResolvedValue(vendor);
        mockBillRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createVendorPayment(
            createVendorPaymentInputFixture({ billId: 'non-existent' }),
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(BillNotFoundError);
      });

      it('should throw VendorPaymentExceedsBillError when payment exceeds outstanding', async () => {
        const vendor = createVendorFixture();
        const bill = createApprovedBillFixture({ totalAmount: '50.0000' });
        const existingPayments = [createVendorPaymentFixture({ amount: '40.0000' })];

        mockVendorRepo.findById.mockResolvedValue(vendor);
        mockBillRepo.findById.mockResolvedValue(bill);
        mockVendorPaymentRepo.findByBillId.mockResolvedValue(existingPayments);

        await expect(
          service.createVendorPayment(
            createVendorPaymentInputFixture({ amount: '20.0000' }),
            TEST_TENANT_ID,
            TEST_USER_ID,
          ),
        ).rejects.toThrow(VendorPaymentExceedsBillError);
      });

      it('should allow payment equal to outstanding amount', async () => {
        const vendor = createVendorFixture();
        const bill = createApprovedBillFixture({ totalAmount: '100.0000' });
        const existingPayments = [createVendorPaymentFixture({ amount: '30.0000' })];
        const payment = createVendorPaymentFixture({ amount: '70.0000' });

        mockVendorRepo.findById.mockResolvedValue(vendor);
        mockBillRepo.findById
          .mockResolvedValueOnce(bill)
          .mockResolvedValueOnce({ ...bill, status: 'paid' });
        mockVendorPaymentRepo.findByBillId
          .mockResolvedValueOnce(existingPayments)
          .mockResolvedValueOnce([...existingPayments, payment]);
        mockVendorPaymentRepo.create.mockResolvedValue(payment);
        mockBillRepo.update.mockResolvedValue({ ...bill, status: 'paid' });

        const result = await service.createVendorPayment(
          createVendorPaymentInputFixture({ amount: '70.0000' }),
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(result).toEqual(payment);
      });

      it('should update bill status to paid when fully paid', async () => {
        const vendor = createVendorFixture();
        const bill = createApprovedBillFixture({ totalAmount: '100.0000' });
        const payment = createVendorPaymentFixture({ amount: '100.0000' });

        mockVendorRepo.findById.mockResolvedValue(vendor);
        mockBillRepo.findById
          .mockResolvedValueOnce(bill)
          .mockResolvedValueOnce({ ...bill, status: 'paid' });
        mockVendorPaymentRepo.findByBillId
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([payment]);
        mockVendorPaymentRepo.create.mockResolvedValue(payment);
        mockBillRepo.update.mockResolvedValue({ ...bill, status: 'paid' });

        await service.createVendorPayment(
          createVendorPaymentInputFixture({ amount: '100.0000' }),
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(mockBillRepo.update).toHaveBeenCalledWith(
          bill.id,
          TEST_TENANT_ID,
          expect.objectContaining({ status: 'paid' }),
        );
      });

      it('should update bill status to partially_paid when partially paid', async () => {
        const vendor = createVendorFixture();
        const bill = createApprovedBillFixture({ totalAmount: '100.0000' });
        const payment = createVendorPaymentFixture({ amount: '30.0000' });

        mockVendorRepo.findById.mockResolvedValue(vendor);
        mockBillRepo.findById
          .mockResolvedValueOnce(bill)
          .mockResolvedValueOnce({ ...bill, status: 'partially_paid' });
        mockVendorPaymentRepo.findByBillId
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([payment]);
        mockVendorPaymentRepo.create.mockResolvedValue(payment);
        mockBillRepo.update.mockResolvedValue({ ...bill, status: 'partially_paid' });

        await service.createVendorPayment(
          createVendorPaymentInputFixture({ amount: '30.0000' }),
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(mockBillRepo.update).toHaveBeenCalledWith(
          bill.id,
          TEST_TENANT_ID,
          expect.objectContaining({ status: 'partially_paid' }),
        );
      });

      it('should pass tenantId and userId correctly', async () => {
        const vendor = createVendorFixture();
        const payment = createVendorPaymentFixture();

        mockVendorRepo.findById.mockResolvedValue(vendor);
        mockVendorPaymentRepo.create.mockResolvedValue(payment);

        await service.createVendorPayment(
          createVendorPaymentInputFixture({ billId: undefined }),
          TEST_TENANT_ID,
          TEST_USER_ID,
        );

        expect(mockVendorPaymentRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            tenantId: TEST_TENANT_ID,
            createdBy: TEST_USER_ID,
          }),
        );
      });
    });

    describe('getVendorPayment', () => {
      it('should return payment by id', async () => {
        const payment = createVendorPaymentFixture();
        mockVendorPaymentRepo.findById.mockResolvedValue(payment);

        const result = await service.getVendorPayment(payment.id, TEST_TENANT_ID);

        expect(result).toEqual(payment);
        expect(mockVendorPaymentRepo.findById).toHaveBeenCalledWith(payment.id, TEST_TENANT_ID);
      });

      it('should throw VendorPaymentNotFoundError for non-existent payment', async () => {
        mockVendorPaymentRepo.findById.mockResolvedValue(undefined);

        await expect(service.getVendorPayment('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          VendorPaymentNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockVendorPaymentRepo.findById.mockResolvedValue(undefined);

        await expect(service.getVendorPayment('vp-1', OTHER_TENANT_ID)).rejects.toThrow(
          VendorPaymentNotFoundError,
        );
        expect(mockVendorPaymentRepo.findById).toHaveBeenCalledWith('vp-1', OTHER_TENANT_ID);
      });
    });

    describe('listVendorPayments', () => {
      it('should return paginated vendor payments', async () => {
        const payments = [createVendorPaymentFixture()];
        mockVendorPaymentRepo.findMany.mockResolvedValue({
          data: payments,
          total: 1,
          page: 1,
          limit: 20,
        });

        const result = await service.listVendorPayments(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
        });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no payments exist', async () => {
        mockVendorPaymentRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listVendorPayments(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
        });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should filter by vendorId', async () => {
        mockVendorPaymentRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listVendorPayments(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          vendorId: 'v-001',
        });

        expect(mockVendorPaymentRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ vendorId: 'v-001' }),
        );
      });

      it('should filter by billId', async () => {
        mockVendorPaymentRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listVendorPayments(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          billId: 'b-001',
        });

        expect(mockVendorPaymentRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ billId: 'b-001' }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockVendorPaymentRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listVendorPayments(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockVendorPaymentRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.anything(),
        );
      });
    });

    describe('deleteVendorPayment', () => {
      it('should soft delete payment and recalculate bill status', async () => {
        const payment = createVendorPaymentFixture({ billId: 'b-001' });
        const bill = createApprovedBillFixture({ totalAmount: '100.0000' });

        mockVendorPaymentRepo.findById.mockResolvedValue(payment);
        mockVendorPaymentRepo.softDelete.mockResolvedValue(undefined);
        // For updateBillStatusAfterPayment
        mockBillRepo.findById.mockResolvedValue(bill);
        mockVendorPaymentRepo.findByBillId.mockResolvedValue([]);
        mockBillRepo.update.mockResolvedValue(bill);

        await service.deleteVendorPayment(payment.id, TEST_TENANT_ID);

        expect(mockVendorPaymentRepo.softDelete).toHaveBeenCalledWith(payment.id, TEST_TENANT_ID);
      });

      it('should soft delete payment without linked bill', async () => {
        const payment = createVendorPaymentFixture({ billId: null });

        mockVendorPaymentRepo.findById.mockResolvedValue(payment);
        mockVendorPaymentRepo.softDelete.mockResolvedValue(undefined);

        await service.deleteVendorPayment(payment.id, TEST_TENANT_ID);

        expect(mockVendorPaymentRepo.softDelete).toHaveBeenCalledWith(payment.id, TEST_TENANT_ID);
        expect(mockBillRepo.findById).not.toHaveBeenCalled();
      });

      it('should revert bill status when all payments deleted', async () => {
        const payment = createVendorPaymentFixture({
          billId: 'bill-00000000-0000-0000-000000000001',
        });
        const bill = createPartiallyPaidBillFixture({ totalAmount: '100.0000' });

        mockVendorPaymentRepo.findById.mockResolvedValue(payment);
        mockVendorPaymentRepo.softDelete.mockResolvedValue(undefined);
        // After deletion, no remaining payments
        mockBillRepo.findById.mockResolvedValue(bill);
        mockVendorPaymentRepo.findByBillId.mockResolvedValue([]);
        mockBillRepo.update.mockResolvedValue({ ...bill, status: 'approved' });

        await service.deleteVendorPayment(payment.id, TEST_TENANT_ID);

        expect(mockBillRepo.update).toHaveBeenCalledWith(
          'bill-00000000-0000-0000-000000000001',
          TEST_TENANT_ID,
          expect.objectContaining({ status: 'approved' }),
        );
      });

      it('should throw VendorPaymentNotFoundError for non-existent payment', async () => {
        mockVendorPaymentRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteVendorPayment('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          VendorPaymentNotFoundError,
        );
      });

      it('should scope deletion to tenant', async () => {
        mockVendorPaymentRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteVendorPayment('vp-1', OTHER_TENANT_ID)).rejects.toThrow(
          VendorPaymentNotFoundError,
        );
        expect(mockVendorPaymentRepo.findById).toHaveBeenCalledWith('vp-1', OTHER_TENANT_ID);
      });

      it('should not update bill status if bill is voided', async () => {
        const payment = createVendorPaymentFixture({ billId: 'b-001' });
        const bill = createVoidedBillFixture({ totalAmount: '100.0000' });

        mockVendorPaymentRepo.findById.mockResolvedValue(payment);
        mockVendorPaymentRepo.softDelete.mockResolvedValue(undefined);
        mockBillRepo.findById.mockResolvedValue(bill);

        await service.deleteVendorPayment(payment.id, TEST_TENANT_ID);

        // Bill is voided, so updateBillStatusAfterPayment should return early
        expect(mockBillRepo.update).not.toHaveBeenCalled();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TENANT ISOLATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Tenant Isolation', () => {
    it('vendor operations should be scoped to tenant', async () => {
      mockVendorRepo.findById.mockResolvedValue(undefined);

      await expect(service.getVendor('v-1', OTHER_TENANT_ID)).rejects.toThrow(VendorNotFoundError);
      expect(mockVendorRepo.findById).toHaveBeenCalledWith('v-1', OTHER_TENANT_ID);
    });

    it('bill operations should be scoped to tenant', async () => {
      mockBillRepo.findById.mockResolvedValue(undefined);

      await expect(service.getBill('b-1', OTHER_TENANT_ID)).rejects.toThrow(BillNotFoundError);
      expect(mockBillRepo.findById).toHaveBeenCalledWith('b-1', OTHER_TENANT_ID);
    });

    it('vendor payment operations should be scoped to tenant', async () => {
      mockVendorPaymentRepo.findById.mockResolvedValue(undefined);

      await expect(service.getVendorPayment('vp-1', OTHER_TENANT_ID)).rejects.toThrow(
        VendorPaymentNotFoundError,
      );
      expect(mockVendorPaymentRepo.findById).toHaveBeenCalledWith('vp-1', OTHER_TENANT_ID);
    });

    it('list vendors should pass tenantId', async () => {
      mockVendorRepo.findMany.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

      await service.listVendors(OTHER_TENANT_ID);

      expect(mockVendorRepo.findMany).toHaveBeenCalledWith(OTHER_TENANT_ID, undefined);
    });

    it('list bills should pass tenantId', async () => {
      mockBillRepo.findMany.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

      await service.listBills(OTHER_TENANT_ID);

      expect(mockBillRepo.findMany).toHaveBeenCalledWith(OTHER_TENANT_ID, undefined);
    });

    it('list vendor payments should pass tenantId', async () => {
      mockVendorPaymentRepo.findMany.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await service.listVendorPayments(OTHER_TENANT_ID);

      expect(mockVendorPaymentRepo.findMany).toHaveBeenCalledWith(OTHER_TENANT_ID, undefined);
    });
  });
});
