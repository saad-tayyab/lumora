import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OTHER_TENANT_ID, TEST_TENANT_ID, TEST_USER_ID } from '../../lib/test-utils';
import {
  createPoLineItemFixture,
  createPoLineItemInputFixture,
  createPurchaseOrderFixture,
  createPurchaseOrderInputFixture,
  createReceivingReportFixture,
  createReceivingReportInputFixture,
  createVendorCatalogItemFixture,
  createVendorCatalogItemInputFixture,
} from './fixtures/proc.fixture';

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
      returning: vi
        .fn()
        .mockResolvedValue([{ id: 'po-00000000-0000-0000-000000000001', status: 'draft' }]),
    }),
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  }),
  delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  query: {
    purchaseOrders: {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
    },
    poLineItems: {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
    },
    receivingReports: {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
    },
    vendorCatalogItems: {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
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
  purchaseOrders: createMockTable('purchase_orders'),
  poLineItems: createMockTable('po_line_items'),
  receivingReports: createMockTable('receiving_reports'),
  vendorCatalogItems: createMockTable('vendor_catalog_items'),
}));

vi.mock('@lumora/database/schema/proc', () => ({
  purchaseOrders: createMockTable('purchase_orders'),
  poLineItems: createMockTable('po_line_items'),
  receivingReports: createMockTable('receiving_reports'),
  vendorCatalogItems: createMockTable('vendor_catalog_items'),
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
  mockPurchaseOrderRepo,
  mockPoLineItemRepo,
  mockReceivingReportRepo,
  mockVendorCatalogItemRepo,
} = vi.hoisted(() => ({
  mockPurchaseOrderRepo: {
    findById: vi.fn(),
    findByPoNumber: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    findByVendor: vi.fn(),
    findPendingApproval: vi.fn(),
    findActiveByVendor: vi.fn(),
  },
  mockPoLineItemRepo: {
    findById: vi.fn(),
    findByPoId: vi.fn(),
    findByItemId: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteByPoId: vi.fn(),
  },
  mockReceivingReportRepo: {
    findById: vi.fn(),
    findByRrNumber: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    findByPoId: vi.fn(),
    findByVendor: vi.fn(),
  },
  mockVendorCatalogItemRepo: {
    findById: vi.fn(),
    findByVendorAndCode: vi.fn(),
    findMany: vi.fn(),
    findByVendor: vi.fn(),
    findByInternalItemId: vi.fn(),
    findEffective: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
}));

vi.mock('./repo', () => ({
  purchaseOrderRepo: mockPurchaseOrderRepo,
  poLineItemRepo: mockPoLineItemRepo,
  receivingReportRepo: mockReceivingReportRepo,
  vendorCatalogItemRepo: mockVendorCatalogItemRepo,
}));

// ─── Import Service After Mocking ─────────────────────────────────────────

import {
  PoLineItemNotFoundError,
  PurchaseOrderInvalidStatusTransitionError,
  PurchaseOrderMissingLineItemsError,
  PurchaseOrderNotFoundError,
  PurchaseOrderNumberConflictError,
  ReceivingReportInvalidStatusTransitionError,
  ReceivingReportNotFoundError,
  ReceivingReportNumberConflictError,
  VendorCatalogItemConflictError,
  VendorCatalogItemNotFoundError,
} from './errors';
import * as service from './service';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Procurement Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PURCHASE ORDER SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Purchase Order Service', () => {
    describe('createPurchaseOrder', () => {
      it('should create purchase order with unique PO number', async () => {
        const input = createPurchaseOrderInputFixture();
        const expected = createPurchaseOrderFixture();

        mockPurchaseOrderRepo.findByPoNumber.mockResolvedValue(undefined);
        mockPurchaseOrderRepo.create.mockResolvedValue(expected);

        const result = await service.createPurchaseOrder(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(result).toEqual({ ...expected, lineItems: [] });
        expect(mockPurchaseOrderRepo.findByPoNumber).toHaveBeenCalledWith(
          input.poNumber,
          TEST_TENANT_ID,
        );
        expect(mockPurchaseOrderRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            ...input,
            tenantId: TEST_TENANT_ID,
            createdBy: TEST_USER_ID,
            status: 'draft',
            subtotal: '0',
            taxAmount: '0',
            total: '0',
          }),
        );
      });

      it('should create purchase order with line items', async () => {
        const input = createPurchaseOrderInputFixture({
          lineItems: [createPoLineItemInputFixture()],
        });
        const expectedPo = createPurchaseOrderFixture();
        const expectedLineItem = createPoLineItemFixture();

        mockPurchaseOrderRepo.findByPoNumber.mockResolvedValue(undefined);
        mockPurchaseOrderRepo.create.mockResolvedValue(expectedPo);
        mockPoLineItemRepo.createMany.mockResolvedValue([expectedLineItem]);
        mockPurchaseOrderRepo.update.mockResolvedValue({
          ...expectedPo,
          subtotal: '250.0000',
          taxAmount: '25.0000',
          total: '275.0000',
        });

        const result = await service.createPurchaseOrder(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(result.lineItems).toHaveLength(1);
        expect(mockPoLineItemRepo.createMany).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              poId: expectedPo.id,
              lineNumber: 1,
              itemId: expectedLineItem.itemId,
            }),
          ]),
        );
      });

      it('should recalculate totals when line items provided', async () => {
        const input = createPurchaseOrderInputFixture({
          lineItems: [
            createPoLineItemInputFixture({ amount: '100.00', taxAmount: '10.00' }),
            createPoLineItemInputFixture({
              itemId: 'item-2',
              lineNumber: 2,
              amount: '200.00',
              taxAmount: '20.00',
            }),
          ],
        });
        const expectedPo = createPurchaseOrderFixture();
        const lineItems = [
          createPoLineItemFixture({ amount: '100.00', taxAmount: '10.00' }),
          createPoLineItemFixture({
            id: 'poli-2',
            itemId: 'item-2',
            lineNumber: 2,
            amount: '200.00',
            taxAmount: '20.00',
          }),
        ];

        mockPurchaseOrderRepo.findByPoNumber.mockResolvedValue(undefined);
        mockPurchaseOrderRepo.create.mockResolvedValue(expectedPo);
        mockPoLineItemRepo.createMany.mockResolvedValue(lineItems);
        mockPurchaseOrderRepo.update.mockResolvedValue(expectedPo);

        await service.createPurchaseOrder(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(mockPurchaseOrderRepo.update).toHaveBeenCalledWith(
          expectedPo.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            subtotal: '300.0000',
            taxAmount: '30.0000',
            total: '330.0000',
          }),
        );
      });

      it('should reject duplicate PO number', async () => {
        const input = createPurchaseOrderInputFixture();
        const existing = createPurchaseOrderFixture();

        mockPurchaseOrderRepo.findByPoNumber.mockResolvedValue(existing);

        await expect(
          service.createPurchaseOrder(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(PurchaseOrderNumberConflictError);
      });

      it('should scope PO number uniqueness to tenant', async () => {
        const input = createPurchaseOrderInputFixture({ poNumber: 'PO-001' });

        mockPurchaseOrderRepo.findByPoNumber.mockImplementation(
          async (_poNumber: string, tenantId: string) => {
            if (tenantId === OTHER_TENANT_ID) return createPurchaseOrderFixture();
            return undefined;
          },
        );
        mockPurchaseOrderRepo.create.mockResolvedValue(createPurchaseOrderFixture());

        const result = await service.createPurchaseOrder(input, TEST_TENANT_ID, TEST_USER_ID);
        expect(result).toBeDefined();
        expect(mockPurchaseOrderRepo.findByPoNumber).toHaveBeenCalledWith('PO-001', TEST_TENANT_ID);
      });
    });

    describe('getPurchaseOrder', () => {
      it('should return purchase order with line items', async () => {
        const po = createPurchaseOrderFixture();
        const lineItems = [createPoLineItemFixture()];

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findByPoId.mockResolvedValue(lineItems);

        const result = await service.getPurchaseOrder(po.id, TEST_TENANT_ID);

        expect(result).toEqual({ ...po, lineItems });
        expect(mockPurchaseOrderRepo.findById).toHaveBeenCalledWith(po.id, TEST_TENANT_ID);
      });

      it('should return purchase order with empty line items', async () => {
        const po = createPurchaseOrderFixture();

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findByPoId.mockResolvedValue([]);

        const result = await service.getPurchaseOrder(po.id, TEST_TENANT_ID);

        expect(result.lineItems).toEqual([]);
      });

      it('should throw NotFoundError for non-existent purchase order', async () => {
        mockPurchaseOrderRepo.findById.mockResolvedValue(undefined);

        await expect(service.getPurchaseOrder('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockPurchaseOrderRepo.findById.mockResolvedValue(undefined);

        await expect(service.getPurchaseOrder('po-1', OTHER_TENANT_ID)).rejects.toThrow(
          PurchaseOrderNotFoundError,
        );
        expect(mockPurchaseOrderRepo.findById).toHaveBeenCalledWith('po-1', OTHER_TENANT_ID);
      });
    });

    describe('listPurchaseOrders', () => {
      it('should return paginated purchase orders', async () => {
        const po = createPurchaseOrderFixture();
        mockPurchaseOrderRepo.findMany.mockResolvedValue({
          data: [po],
          total: 1,
          page: 1,
          limit: 20,
        });

        const result = await service.listPurchaseOrders(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no purchase orders exist', async () => {
        mockPurchaseOrderRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listPurchaseOrders(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should filter by status', async () => {
        mockPurchaseOrderRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listPurchaseOrders(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          status: 'approved',
        });

        expect(mockPurchaseOrderRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ status: 'approved' }),
        );
      });

      it('should filter by vendorId', async () => {
        mockPurchaseOrderRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listPurchaseOrders(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          vendorId: 'vendor-1',
        });

        expect(mockPurchaseOrderRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ vendorId: 'vendor-1' }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockPurchaseOrderRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listPurchaseOrders(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockPurchaseOrderRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.anything(),
        );
      });
    });

    describe('updatePurchaseOrder', () => {
      it('should update draft purchase order', async () => {
        const existing = createPurchaseOrderFixture({ status: 'draft' });
        const updated = { ...existing, notes: 'Updated notes' };

        mockPurchaseOrderRepo.findById.mockResolvedValue(existing);
        mockPurchaseOrderRepo.update.mockResolvedValue(updated);
        mockPoLineItemRepo.findByPoId.mockResolvedValue([]);

        const result = await service.updatePurchaseOrder(
          existing.id,
          { notes: 'Updated notes' },
          TEST_TENANT_ID,
        );

        expect(result.notes).toBe('Updated notes');
        expect(mockPurchaseOrderRepo.update).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID, {
          notes: 'Updated notes',
        });
      });

      it('should throw NotFoundError for non-existent purchase order', async () => {
        mockPurchaseOrderRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updatePurchaseOrder('non-existent', { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(PurchaseOrderNotFoundError);
      });

      it('should reject update of non-draft purchase order', async () => {
        const existing = createPurchaseOrderFixture({ status: 'approved' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updatePurchaseOrder(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(PurchaseOrderInvalidStatusTransitionError);
      });

      it('should reject update of pending_approval purchase order', async () => {
        const existing = createPurchaseOrderFixture({ status: 'pending_approval' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updatePurchaseOrder(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(PurchaseOrderInvalidStatusTransitionError);
      });

      it('should reject update of received purchase order', async () => {
        const existing = createPurchaseOrderFixture({ status: 'fully_received' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updatePurchaseOrder(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(PurchaseOrderInvalidStatusTransitionError);
      });

      it('should reject update of closed purchase order', async () => {
        const existing = createPurchaseOrderFixture({ status: 'closed' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updatePurchaseOrder(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(PurchaseOrderInvalidStatusTransitionError);
      });

      it('should reject update of cancelled purchase order', async () => {
        const existing = createPurchaseOrderFixture({ status: 'cancelled' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updatePurchaseOrder(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(PurchaseOrderInvalidStatusTransitionError);
      });
    });

    describe('deletePurchaseOrder', () => {
      it('should soft delete draft purchase order and its line items', async () => {
        const existing = createPurchaseOrderFixture({ status: 'draft' });

        mockPurchaseOrderRepo.findById.mockResolvedValue(existing);
        mockPoLineItemRepo.deleteByPoId.mockResolvedValue(undefined);
        mockPurchaseOrderRepo.softDelete.mockResolvedValue(undefined);

        await service.deletePurchaseOrder(existing.id, TEST_TENANT_ID);

        expect(mockPoLineItemRepo.deleteByPoId).toHaveBeenCalledWith(existing.id);
        expect(mockPurchaseOrderRepo.softDelete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent purchase order', async () => {
        mockPurchaseOrderRepo.findById.mockResolvedValue(undefined);

        await expect(service.deletePurchaseOrder('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderNotFoundError,
        );
      });

      it('should reject deletion of non-draft purchase order', async () => {
        const existing = createPurchaseOrderFixture({ status: 'approved' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(existing);

        await expect(service.deletePurchaseOrder(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });
    });

    // ─── Status Transitions ──────────────────────────────────────────────

    describe('submitPoForApproval', () => {
      it('should submit draft purchase order for approval', async () => {
        const po = createPurchaseOrderFixture({ status: 'draft' });
        const updated = { ...po, status: 'pending_approval' };
        const lineItems = [createPoLineItemFixture()];

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findByPoId.mockResolvedValue(lineItems);
        mockPurchaseOrderRepo.update.mockResolvedValue(updated);

        const result = await service.submitPoForApproval(po.id, TEST_TENANT_ID);

        expect(result.status).toBe('pending_approval');
        expect(mockPurchaseOrderRepo.update).toHaveBeenCalledWith(po.id, TEST_TENANT_ID, {
          status: 'pending_approval',
        });
      });

      it('should throw NotFoundError for non-existent purchase order', async () => {
        mockPurchaseOrderRepo.findById.mockResolvedValue(undefined);

        await expect(service.submitPoForApproval('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderNotFoundError,
        );
      });

      it('should reject submission of already approved purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'approved' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.submitPoForApproval(po.id, TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });

      it('should reject submission of cancelled purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'cancelled' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.submitPoForApproval(po.id, TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });

      it('should reject submission of closed purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'closed' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.submitPoForApproval(po.id, TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });

      it('should reject submission when no line items exist', async () => {
        const po = createPurchaseOrderFixture({ status: 'draft' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findByPoId.mockResolvedValue([]);

        await expect(service.submitPoForApproval(po.id, TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderMissingLineItemsError,
        );
      });

      it('should allow submission from pending_approval (idempotent-like)', async () => {
        // pending_approval can transition to approved/cancelled but NOT pending_approval
        const po = createPurchaseOrderFixture({ status: 'pending_approval' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.submitPoForApproval(po.id, TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });
    });

    describe('approvePo', () => {
      it('should approve pending purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'pending_approval' });
        const approved = { ...po, status: 'approved', approvedBy: TEST_USER_ID };
        const lineItems = [createPoLineItemFixture()];

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPurchaseOrderRepo.update.mockResolvedValue(approved);
        mockPoLineItemRepo.findByPoId.mockResolvedValue(lineItems);

        const result = await service.approvePo(po.id, TEST_TENANT_ID, TEST_USER_ID);

        expect(result.status).toBe('approved');
        expect(mockPurchaseOrderRepo.update).toHaveBeenCalledWith(
          po.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            status: 'approved',
            approvedBy: TEST_USER_ID,
            approvedAt: expect.any(Date),
          }),
        );
      });

      it('should throw NotFoundError for non-existent purchase order', async () => {
        mockPurchaseOrderRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.approvePo('non-existent', TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(PurchaseOrderNotFoundError);
      });

      it('should reject approval of draft purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'draft' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.approvePo(po.id, TEST_TENANT_ID, TEST_USER_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });

      it('should reject approval of already approved purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'approved' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.approvePo(po.id, TEST_TENANT_ID, TEST_USER_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });

      it('should reject approval of fully received purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'fully_received' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.approvePo(po.id, TEST_TENANT_ID, TEST_USER_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });

      it('should reject approval of cancelled purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'cancelled' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.approvePo(po.id, TEST_TENANT_ID, TEST_USER_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });
    });

    describe('cancelPo', () => {
      it('should cancel draft purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'draft' });
        const cancelled = { ...po, status: 'cancelled' };
        const lineItems = [createPoLineItemFixture()];

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPurchaseOrderRepo.update.mockResolvedValue(cancelled);
        mockPoLineItemRepo.findByPoId.mockResolvedValue(lineItems);

        const result = await service.cancelPo(po.id, TEST_TENANT_ID);

        expect(result.status).toBe('cancelled');
        expect(mockPurchaseOrderRepo.update).toHaveBeenCalledWith(po.id, TEST_TENANT_ID, {
          status: 'cancelled',
        });
      });

      it('should cancel pending_approval purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'pending_approval' });
        const cancelled = { ...po, status: 'cancelled' };
        const lineItems = [createPoLineItemFixture()];

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPurchaseOrderRepo.update.mockResolvedValue(cancelled);
        mockPoLineItemRepo.findByPoId.mockResolvedValue(lineItems);

        const result = await service.cancelPo(po.id, TEST_TENANT_ID);

        expect(result.status).toBe('cancelled');
      });

      it('should cancel approved purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'approved' });
        const cancelled = { ...po, status: 'cancelled' };
        const lineItems = [createPoLineItemFixture()];

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPurchaseOrderRepo.update.mockResolvedValue(cancelled);
        mockPoLineItemRepo.findByPoId.mockResolvedValue(lineItems);

        const result = await service.cancelPo(po.id, TEST_TENANT_ID);

        expect(result.status).toBe('cancelled');
      });

      it('should throw NotFoundError for non-existent purchase order', async () => {
        mockPurchaseOrderRepo.findById.mockResolvedValue(undefined);

        await expect(service.cancelPo('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderNotFoundError,
        );
      });

      it('should reject cancellation of fully_received purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'fully_received' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.cancelPo(po.id, TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });

      it('should reject cancellation of closed purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'closed' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.cancelPo(po.id, TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });

      it('should reject cancellation of already cancelled purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'cancelled' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.cancelPo(po.id, TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });
    });

    describe('closePo', () => {
      it('should close approved purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'approved' });
        const closed = { ...po, status: 'closed' };
        const lineItems = [createPoLineItemFixture()];

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPurchaseOrderRepo.update.mockResolvedValue(closed);
        mockPoLineItemRepo.findByPoId.mockResolvedValue(lineItems);

        const result = await service.closePo(po.id, TEST_TENANT_ID);

        expect(result.status).toBe('closed');
      });

      it('should close partially_received purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'partially_received' });
        const closed = { ...po, status: 'closed' };
        const lineItems = [createPoLineItemFixture()];

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPurchaseOrderRepo.update.mockResolvedValue(closed);
        mockPoLineItemRepo.findByPoId.mockResolvedValue(lineItems);

        const result = await service.closePo(po.id, TEST_TENANT_ID);

        expect(result.status).toBe('closed');
      });

      it('should close fully_received purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'fully_received' });
        const closed = { ...po, status: 'closed' };
        const lineItems = [createPoLineItemFixture()];

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPurchaseOrderRepo.update.mockResolvedValue(closed);
        mockPoLineItemRepo.findByPoId.mockResolvedValue(lineItems);

        const result = await service.closePo(po.id, TEST_TENANT_ID);

        expect(result.status).toBe('closed');
      });

      it('should throw NotFoundError for non-existent purchase order', async () => {
        mockPurchaseOrderRepo.findById.mockResolvedValue(undefined);

        await expect(service.closePo('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderNotFoundError,
        );
      });

      it('should reject closing draft purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'draft' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.closePo(po.id, TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });

      it('should reject closing pending_approval purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'pending_approval' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.closePo(po.id, TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });

      it('should reject closing cancelled purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'cancelled' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.closePo(po.id, TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });

      it('should reject closing already closed purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'closed' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.closePo(po.id, TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PO LINE ITEM SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('PO Line Item Service', () => {
    describe('addPoLineItem', () => {
      it('should add line item to draft purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'draft' });
        const data = createPoLineItemInputFixture();
        const created = createPoLineItemFixture();
        const lineItems = [created];

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findByPoId.mockResolvedValueOnce([]);
        mockPoLineItemRepo.create.mockResolvedValue(created);
        mockPoLineItemRepo.findByPoId.mockResolvedValueOnce(lineItems);
        mockPurchaseOrderRepo.update.mockResolvedValue(po);

        const result = await service.addPoLineItem(po.id, data, TEST_TENANT_ID);

        expect(result).toEqual(created);
        expect(mockPoLineItemRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            poId: po.id,
            lineNumber: 1,
            itemId: data.itemId,
          }),
        );
      });

      it('should auto-calculate line number for subsequent items', async () => {
        const po = createPurchaseOrderFixture({ status: 'draft' });
        const data = createPoLineItemInputFixture();
        const existingItem = createPoLineItemFixture({ lineNumber: 3 });
        const created = createPoLineItemFixture({ lineNumber: 4 });

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findByPoId.mockResolvedValueOnce([existingItem]);
        mockPoLineItemRepo.create.mockResolvedValue(created);
        mockPoLineItemRepo.findByPoId.mockResolvedValueOnce([existingItem, created]);
        mockPurchaseOrderRepo.update.mockResolvedValue(po);

        const _result = await service.addPoLineItem(po.id, data, TEST_TENANT_ID);

        expect(mockPoLineItemRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ lineNumber: 4 }),
        );
      });

      it('should recalculate PO totals after adding line item', async () => {
        const po = createPurchaseOrderFixture({ status: 'draft' });
        const data = createPoLineItemInputFixture({ amount: '500.00', taxAmount: '50.00' });
        const created = createPoLineItemFixture({ amount: '500.00', taxAmount: '50.00' });

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findByPoId.mockResolvedValue([]);
        mockPoLineItemRepo.create.mockResolvedValue(created);
        mockPoLineItemRepo.findByPoId.mockResolvedValue([created]);
        mockPurchaseOrderRepo.update.mockResolvedValue(po);

        await service.addPoLineItem(po.id, data, TEST_TENANT_ID);

        expect(mockPurchaseOrderRepo.update).toHaveBeenCalledWith(
          po.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            subtotal: '500.0000',
            taxAmount: '50.0000',
            total: '550.0000',
          }),
        );
      });

      it('should throw NotFoundError for non-existent purchase order', async () => {
        mockPurchaseOrderRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.addPoLineItem('non-existent', createPoLineItemInputFixture(), TEST_TENANT_ID),
        ).rejects.toThrow(PurchaseOrderNotFoundError);
      });

      it('should reject adding line item to non-draft purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'approved' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(
          service.addPoLineItem(po.id, createPoLineItemInputFixture(), TEST_TENANT_ID),
        ).rejects.toThrow(PurchaseOrderInvalidStatusTransitionError);
      });
    });

    describe('updatePoLineItem', () => {
      it('should update line item on draft purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'draft' });
        const existing = createPoLineItemFixture();
        const updated = { ...existing, quantity: '20' };

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findById.mockResolvedValue(existing);
        mockPoLineItemRepo.update.mockResolvedValue(updated);
        mockPoLineItemRepo.findByPoId.mockResolvedValue([updated]);
        mockPurchaseOrderRepo.update.mockResolvedValue(po);

        const result = await service.updatePoLineItem(
          existing.id,
          { quantity: '20' },
          po.id,
          TEST_TENANT_ID,
        );

        expect(result.quantity).toBe('20');
      });

      it('should recalculate PO totals after updating line item', async () => {
        const po = createPurchaseOrderFixture({ status: 'draft' });
        const existing = createPoLineItemFixture({ amount: '100.00', taxAmount: '10.00' });
        const updated = { ...existing, amount: '200.00', taxAmount: '20.00' };

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findById.mockResolvedValue(existing);
        mockPoLineItemRepo.update.mockResolvedValue(updated);
        mockPoLineItemRepo.findByPoId.mockResolvedValue([updated]);
        mockPurchaseOrderRepo.update.mockResolvedValue(po);

        await service.updatePoLineItem(
          existing.id,
          { amount: '200.00', taxAmount: '20.00' },
          po.id,
          TEST_TENANT_ID,
        );

        expect(mockPurchaseOrderRepo.update).toHaveBeenCalledWith(
          po.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            subtotal: '200.0000',
            taxAmount: '20.0000',
            total: '220.0000',
          }),
        );
      });

      it('should throw NotFoundError for non-existent purchase order', async () => {
        mockPurchaseOrderRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updatePoLineItem('line-1', { quantity: '5' }, 'non-existent', TEST_TENANT_ID),
        ).rejects.toThrow(PurchaseOrderNotFoundError);
      });

      it('should reject update on non-draft purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'approved' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(
          service.updatePoLineItem('line-1', { quantity: '5' }, po.id, TEST_TENANT_ID),
        ).rejects.toThrow(PurchaseOrderInvalidStatusTransitionError);
      });

      it('should throw PoLineItemNotFoundError for non-existent line item', async () => {
        const po = createPurchaseOrderFixture({ status: 'draft' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updatePoLineItem('non-existent', { quantity: '5' }, po.id, TEST_TENANT_ID),
        ).rejects.toThrow(PoLineItemNotFoundError);
      });

      it('should throw PoLineItemNotFoundError when line item belongs to different PO', async () => {
        const po = createPurchaseOrderFixture({ status: 'draft' });
        const lineItem = createPoLineItemFixture({ poId: 'different-po-id' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findById.mockResolvedValue(lineItem);

        await expect(
          service.updatePoLineItem(lineItem.id, { quantity: '5' }, po.id, TEST_TENANT_ID),
        ).rejects.toThrow(PoLineItemNotFoundError);
      });
    });

    describe('deletePoLineItem', () => {
      it('should delete line item from draft purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'draft' });
        const existing = createPoLineItemFixture();

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findById.mockResolvedValue(existing);
        mockPoLineItemRepo.delete.mockResolvedValue(true);
        mockPoLineItemRepo.findByPoId.mockResolvedValue([]);
        mockPurchaseOrderRepo.update.mockResolvedValue(po);

        await service.deletePoLineItem(existing.id, po.id, TEST_TENANT_ID);

        expect(mockPoLineItemRepo.delete).toHaveBeenCalledWith(existing.id);
      });

      it('should recalculate PO totals after deleting line item', async () => {
        const po = createPurchaseOrderFixture({ status: 'draft' });
        const existing = createPoLineItemFixture();

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findById.mockResolvedValue(existing);
        mockPoLineItemRepo.delete.mockResolvedValue(true);
        mockPoLineItemRepo.findByPoId.mockResolvedValue([]);
        mockPurchaseOrderRepo.update.mockResolvedValue(po);

        await service.deletePoLineItem(existing.id, po.id, TEST_TENANT_ID);

        expect(mockPurchaseOrderRepo.update).toHaveBeenCalledWith(
          po.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            subtotal: '0.0000',
            taxAmount: '0.0000',
            total: '0.0000',
          }),
        );
      });

      it('should throw NotFoundError for non-existent purchase order', async () => {
        mockPurchaseOrderRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.deletePoLineItem('line-1', 'non-existent', TEST_TENANT_ID),
        ).rejects.toThrow(PurchaseOrderNotFoundError);
      });

      it('should reject deletion on non-draft purchase order', async () => {
        const po = createPurchaseOrderFixture({ status: 'approved' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.deletePoLineItem('line-1', po.id, TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });

      it('should throw PoLineItemNotFoundError for non-existent line item', async () => {
        const po = createPurchaseOrderFixture({ status: 'draft' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.deletePoLineItem('non-existent', po.id, TEST_TENANT_ID),
        ).rejects.toThrow(PoLineItemNotFoundError);
      });

      it('should throw PoLineItemNotFoundError when line item belongs to different PO', async () => {
        const po = createPurchaseOrderFixture({ status: 'draft' });
        const lineItem = createPoLineItemFixture({ poId: 'different-po-id' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findById.mockResolvedValue(lineItem);

        await expect(service.deletePoLineItem(lineItem.id, po.id, TEST_TENANT_ID)).rejects.toThrow(
          PoLineItemNotFoundError,
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RECEIVING REPORT SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Receiving Report Service', () => {
    describe('createReceivingReport', () => {
      it('should create receiving report for approved PO', async () => {
        const input = createReceivingReportInputFixture();
        const po = createPurchaseOrderFixture({ status: 'approved' });
        const expected = createReceivingReportFixture();

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockReceivingReportRepo.findByRrNumber.mockResolvedValue(undefined);
        mockReceivingReportRepo.create.mockResolvedValue(expected);

        const result = await service.createReceivingReport(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(result).toEqual(expected);
        expect(mockReceivingReportRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            ...input,
            tenantId: TEST_TENANT_ID,
            status: 'draft',
          }),
        );
      });

      it('should create receiving report for partially_received PO', async () => {
        const input = createReceivingReportInputFixture();
        const po = createPurchaseOrderFixture({ status: 'partially_received' });
        const expected = createReceivingReportFixture();

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockReceivingReportRepo.findByRrNumber.mockResolvedValue(undefined);
        mockReceivingReportRepo.create.mockResolvedValue(expected);

        const result = await service.createReceivingReport(input, TEST_TENANT_ID, TEST_USER_ID);

        expect(result).toEqual(expected);
      });

      it('should throw NotFoundError for non-existent purchase order', async () => {
        const input = createReceivingReportInputFixture();
        mockPurchaseOrderRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createReceivingReport(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(PurchaseOrderNotFoundError);
      });

      it('should reject creating receiving report for draft PO', async () => {
        const input = createReceivingReportInputFixture();
        const po = createPurchaseOrderFixture({ status: 'draft' });
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(
          service.createReceivingReport(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(PurchaseOrderInvalidStatusTransitionError);
      });

      it('should reject duplicate RR number', async () => {
        const input = createReceivingReportInputFixture();
        const po = createPurchaseOrderFixture({ status: 'approved' });
        const existing = createReceivingReportFixture();

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockReceivingReportRepo.findByRrNumber.mockResolvedValue(existing);

        await expect(
          service.createReceivingReport(input, TEST_TENANT_ID, TEST_USER_ID),
        ).rejects.toThrow(ReceivingReportNumberConflictError);
      });

      it('should scope RR number uniqueness to tenant', async () => {
        const input = createReceivingReportInputFixture({ rrNumber: 'RR-001' });
        const po = createPurchaseOrderFixture({ status: 'approved' });

        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockReceivingReportRepo.findByRrNumber.mockImplementation(
          async (_rrNumber: string, tenantId: string) => {
            if (tenantId === OTHER_TENANT_ID) return createReceivingReportFixture();
            return undefined;
          },
        );
        mockReceivingReportRepo.create.mockResolvedValue(createReceivingReportFixture());

        const result = await service.createReceivingReport(input, TEST_TENANT_ID, TEST_USER_ID);
        expect(result).toBeDefined();
      });
    });

    describe('getReceivingReport', () => {
      it('should return receiving report with PO line item context', async () => {
        const rr = createReceivingReportFixture();
        const lineItems = [createPoLineItemFixture()];

        mockReceivingReportRepo.findById.mockResolvedValue(rr);
        mockPoLineItemRepo.findByPoId.mockResolvedValue(lineItems);

        const result = await service.getReceivingReport(rr.id, TEST_TENANT_ID);

        expect(result.lineItems).toHaveLength(1);
        expect(result.lineItems?.[0]).toEqual({
          poLineItemId: lineItems[0].id,
          description: lineItems[0].description,
          orderedQuantity: lineItems[0].quantity,
          receivedQuantity: lineItems[0].receivedQuantity,
        });
      });

      it('should throw NotFoundError for non-existent receiving report', async () => {
        mockReceivingReportRepo.findById.mockResolvedValue(undefined);

        await expect(service.getReceivingReport('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          ReceivingReportNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockReceivingReportRepo.findById.mockResolvedValue(undefined);

        await expect(service.getReceivingReport('rr-1', OTHER_TENANT_ID)).rejects.toThrow(
          ReceivingReportNotFoundError,
        );
        expect(mockReceivingReportRepo.findById).toHaveBeenCalledWith('rr-1', OTHER_TENANT_ID);
      });
    });

    describe('listReceivingReports', () => {
      it('should return paginated receiving reports', async () => {
        const rr = createReceivingReportFixture();
        mockReceivingReportRepo.findMany.mockResolvedValue({ data: [rr], total: 1 });

        const result = await service.listReceivingReports(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
      });

      it('should return empty list when no receiving reports exist', async () => {
        mockReceivingReportRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listReceivingReports(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should filter by status', async () => {
        mockReceivingReportRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listReceivingReports(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          status: 'confirmed',
        });

        expect(mockReceivingReportRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ status: 'confirmed' }),
        );
      });

      it('should filter by poId', async () => {
        mockReceivingReportRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listReceivingReports(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          poId: 'po-1',
        });

        expect(mockReceivingReportRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ poId: 'po-1' }),
        );
      });

      it('should filter by vendorId', async () => {
        mockReceivingReportRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listReceivingReports(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          vendorId: 'vendor-1',
        });

        expect(mockReceivingReportRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ vendorId: 'vendor-1' }),
        );
      });
    });

    describe('confirmReceivingReport', () => {
      it('should confirm draft receiving report', async () => {
        const rr = createReceivingReportFixture({ status: 'draft' });
        const confirmed = { ...rr, status: 'confirmed' };
        const po = createPurchaseOrderFixture({ status: 'approved' });
        const lineItems = [createPoLineItemFixture({ receivedQuantity: '10', quantity: '10' })];

        mockReceivingReportRepo.findById.mockResolvedValue(rr);
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findByPoId.mockResolvedValue(lineItems);
        mockPurchaseOrderRepo.update.mockResolvedValue(po);
        mockReceivingReportRepo.update.mockResolvedValue(confirmed);

        const result = await service.confirmReceivingReport(rr.id, TEST_TENANT_ID);

        expect(result.status).toBe('confirmed');
        expect(mockReceivingReportRepo.update).toHaveBeenCalledWith(rr.id, TEST_TENANT_ID, {
          status: 'confirmed',
        });
      });

      it('should transition PO to fully_received when all items fully received', async () => {
        const rr = createReceivingReportFixture({ status: 'draft' });
        const po = createPurchaseOrderFixture({ status: 'approved' });
        const lineItems = [
          createPoLineItemFixture({ receivedQuantity: '10', quantity: '10' }),
          createPoLineItemFixture({
            id: 'poli-2',
            receivedQuantity: '5',
            quantity: '5',
          }),
        ];

        mockReceivingReportRepo.findById.mockResolvedValue(rr);
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findByPoId.mockResolvedValue(lineItems);
        mockPurchaseOrderRepo.update.mockResolvedValue(po);
        mockReceivingReportRepo.update.mockResolvedValue({ ...rr, status: 'confirmed' });

        await service.confirmReceivingReport(rr.id, TEST_TENANT_ID);

        expect(mockPurchaseOrderRepo.update).toHaveBeenCalledWith(rr.poId, TEST_TENANT_ID, {
          status: 'fully_received',
        });
      });

      it('should transition PO to partially_received when some items received', async () => {
        const rr = createReceivingReportFixture({ status: 'draft' });
        const po = createPurchaseOrderFixture({ status: 'approved' });
        const lineItems = [createPoLineItemFixture({ receivedQuantity: '5', quantity: '10' })];

        mockReceivingReportRepo.findById.mockResolvedValue(rr);
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findByPoId.mockResolvedValue(lineItems);
        mockPurchaseOrderRepo.update.mockResolvedValue(po);
        mockReceivingReportRepo.update.mockResolvedValue({ ...rr, status: 'confirmed' });

        await service.confirmReceivingReport(rr.id, TEST_TENANT_ID);

        expect(mockPurchaseOrderRepo.update).toHaveBeenCalledWith(rr.poId, TEST_TENANT_ID, {
          status: 'partially_received',
        });
      });

      it('should not update PO status when no items received', async () => {
        const rr = createReceivingReportFixture({ status: 'draft' });
        const po = createPurchaseOrderFixture({ status: 'approved' });
        const lineItems = [createPoLineItemFixture({ receivedQuantity: '0', quantity: '10' })];

        mockReceivingReportRepo.findById.mockResolvedValue(rr);
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);
        mockPoLineItemRepo.findByPoId.mockResolvedValue(lineItems);
        mockReceivingReportRepo.update.mockResolvedValue({ ...rr, status: 'confirmed' });

        await service.confirmReceivingReport(rr.id, TEST_TENANT_ID);

        expect(mockPurchaseOrderRepo.update).not.toHaveBeenCalledWith(
          rr.poId,
          TEST_TENANT_ID,
          expect.objectContaining({ status: expect.any(String) }),
        );
      });

      it('should throw NotFoundError for non-existent receiving report', async () => {
        mockReceivingReportRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.confirmReceivingReport('non-existent', TEST_TENANT_ID),
        ).rejects.toThrow(ReceivingReportNotFoundError);
      });

      it('should reject confirming already confirmed receiving report', async () => {
        const rr = createReceivingReportFixture({ status: 'confirmed' });
        mockReceivingReportRepo.findById.mockResolvedValue(rr);

        await expect(service.confirmReceivingReport(rr.id, TEST_TENANT_ID)).rejects.toThrow(
          ReceivingReportInvalidStatusTransitionError,
        );
      });

      it('should reject confirming rejected receiving report', async () => {
        const rr = createReceivingReportFixture({ status: 'rejected' });
        mockReceivingReportRepo.findById.mockResolvedValue(rr);

        await expect(service.confirmReceivingReport(rr.id, TEST_TENANT_ID)).rejects.toThrow(
          ReceivingReportInvalidStatusTransitionError,
        );
      });

      it('should throw NotFoundError when PO no longer exists', async () => {
        const rr = createReceivingReportFixture({ status: 'draft' });
        mockReceivingReportRepo.findById.mockResolvedValue(rr);
        mockPurchaseOrderRepo.findById.mockResolvedValue(undefined);

        await expect(service.confirmReceivingReport(rr.id, TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderNotFoundError,
        );
      });

      it('should reject confirmation when PO is no longer in receivable state', async () => {
        const rr = createReceivingReportFixture({ status: 'draft' });
        const po = createPurchaseOrderFixture({ status: 'closed' });
        mockReceivingReportRepo.findById.mockResolvedValue(rr);
        mockPurchaseOrderRepo.findById.mockResolvedValue(po);

        await expect(service.confirmReceivingReport(rr.id, TEST_TENANT_ID)).rejects.toThrow(
          PurchaseOrderInvalidStatusTransitionError,
        );
      });
    });

    describe('rejectReceivingReport', () => {
      it('should reject draft receiving report', async () => {
        const rr = createReceivingReportFixture({ status: 'draft' });
        const rejected = { ...rr, status: 'rejected' };

        mockReceivingReportRepo.findById.mockResolvedValue(rr);
        mockReceivingReportRepo.update.mockResolvedValue(rejected);

        const result = await service.rejectReceivingReport(rr.id, TEST_TENANT_ID);

        expect(result.status).toBe('rejected');
      });

      it('should throw NotFoundError for non-existent receiving report', async () => {
        mockReceivingReportRepo.findById.mockResolvedValue(undefined);

        await expect(service.rejectReceivingReport('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          ReceivingReportNotFoundError,
        );
      });

      it('should reject already confirmed receiving report', async () => {
        const rr = createReceivingReportFixture({ status: 'confirmed' });
        mockReceivingReportRepo.findById.mockResolvedValue(rr);

        await expect(service.rejectReceivingReport(rr.id, TEST_TENANT_ID)).rejects.toThrow(
          ReceivingReportInvalidStatusTransitionError,
        );
      });

      it('should reject already rejected receiving report', async () => {
        const rr = createReceivingReportFixture({ status: 'rejected' });
        mockReceivingReportRepo.findById.mockResolvedValue(rr);

        await expect(service.rejectReceivingReport(rr.id, TEST_TENANT_ID)).rejects.toThrow(
          ReceivingReportInvalidStatusTransitionError,
        );
      });
    });

    describe('updateReceivingReport', () => {
      it('should update draft receiving report', async () => {
        const existing = createReceivingReportFixture({ status: 'draft' });
        const updated = { ...existing, notes: 'Updated notes' };

        mockReceivingReportRepo.findById.mockResolvedValue(existing);
        mockReceivingReportRepo.update.mockResolvedValue(updated);

        const result = await service.updateReceivingReport(
          existing.id,
          { notes: 'Updated notes' },
          TEST_TENANT_ID,
        );

        expect(result.notes).toBe('Updated notes');
      });

      it('should throw NotFoundError for non-existent receiving report', async () => {
        mockReceivingReportRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateReceivingReport('non-existent', { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(ReceivingReportNotFoundError);
      });

      it('should reject update of non-draft receiving report', async () => {
        const existing = createReceivingReportFixture({ status: 'confirmed' });
        mockReceivingReportRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateReceivingReport(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(ReceivingReportInvalidStatusTransitionError);
      });
    });

    describe('deleteReceivingReport', () => {
      it('should soft delete draft receiving report', async () => {
        const existing = createReceivingReportFixture({ status: 'draft' });

        mockReceivingReportRepo.findById.mockResolvedValue(existing);
        mockReceivingReportRepo.softDelete.mockResolvedValue(undefined);

        await service.deleteReceivingReport(existing.id, TEST_TENANT_ID);

        expect(mockReceivingReportRepo.softDelete).toHaveBeenCalledWith(
          existing.id,
          TEST_TENANT_ID,
        );
      });

      it('should throw NotFoundError for non-existent receiving report', async () => {
        mockReceivingReportRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteReceivingReport('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          ReceivingReportNotFoundError,
        );
      });

      it('should reject deletion of non-draft receiving report', async () => {
        const existing = createReceivingReportFixture({ status: 'confirmed' });
        mockReceivingReportRepo.findById.mockResolvedValue(existing);

        await expect(service.deleteReceivingReport(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          ReceivingReportInvalidStatusTransitionError,
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // VENDOR CATALOG ITEM SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Vendor Catalog Item Service', () => {
    describe('createVendorCatalogItem', () => {
      it('should create vendor catalog item with unique vendor + code', async () => {
        const input = createVendorCatalogItemInputFixture();
        const expected = createVendorCatalogItemFixture();

        mockVendorCatalogItemRepo.findByVendorAndCode.mockResolvedValue(undefined);
        mockVendorCatalogItemRepo.create.mockResolvedValue(expected);

        const result = await service.createVendorCatalogItem(input);

        expect(result).toEqual(expected);
        expect(mockVendorCatalogItemRepo.findByVendorAndCode).toHaveBeenCalledWith(
          input.vendorId,
          input.vendorItemCode,
        );
        expect(mockVendorCatalogItemRepo.create).toHaveBeenCalledWith(input);
      });

      it('should reject duplicate vendor + item code combination', async () => {
        const input = createVendorCatalogItemInputFixture();
        const existing = createVendorCatalogItemFixture();

        mockVendorCatalogItemRepo.findByVendorAndCode.mockResolvedValue(existing);

        await expect(service.createVendorCatalogItem(input)).rejects.toThrow(
          VendorCatalogItemConflictError,
        );
      });

      it('should allow same item code for different vendors', async () => {
        const input = createVendorCatalogItemInputFixture({ vendorId: 'vendor-2' });

        mockVendorCatalogItemRepo.findByVendorAndCode.mockImplementation(
          async (vendorId: string, _code: string) => {
            if (vendorId === 'vendor-1') return createVendorCatalogItemFixture();
            return undefined;
          },
        );
        mockVendorCatalogItemRepo.create.mockResolvedValue(createVendorCatalogItemFixture());

        const result = await service.createVendorCatalogItem(input);
        expect(result).toBeDefined();
      });
    });

    describe('getVendorCatalogItem', () => {
      it('should return vendor catalog item by id', async () => {
        const item = createVendorCatalogItemFixture();
        mockVendorCatalogItemRepo.findById.mockResolvedValue(item);

        const result = await service.getVendorCatalogItem(item.id);

        expect(result).toEqual(item);
        expect(mockVendorCatalogItemRepo.findById).toHaveBeenCalledWith(item.id);
      });

      it('should throw NotFoundError for non-existent vendor catalog item', async () => {
        mockVendorCatalogItemRepo.findById.mockResolvedValue(undefined);

        await expect(service.getVendorCatalogItem('non-existent')).rejects.toThrow(
          VendorCatalogItemNotFoundError,
        );
      });
    });

    describe('listVendorCatalogItems', () => {
      it('should return paginated vendor catalog items', async () => {
        const item = createVendorCatalogItemFixture();
        mockVendorCatalogItemRepo.findMany.mockResolvedValue({ data: [item], total: 1 });

        const result = await service.listVendorCatalogItems({ page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
      });

      it('should return empty list when no vendor catalog items exist', async () => {
        mockVendorCatalogItemRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listVendorCatalogItems({ page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should filter by vendorId', async () => {
        mockVendorCatalogItemRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listVendorCatalogItems({ page: 1, limit: 20, vendorId: 'vendor-1' });

        expect(mockVendorCatalogItemRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ vendorId: 'vendor-1' }),
        );
      });

      it('should return all items when no vendor filter provided', async () => {
        mockVendorCatalogItemRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listVendorCatalogItems({ page: 1, limit: 20 });

        expect(mockVendorCatalogItemRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1, limit: 20 }),
        );
      });
    });

    describe('updateVendorCatalogItem', () => {
      it('should update vendor catalog item', async () => {
        const existing = createVendorCatalogItemFixture();
        const updated = { ...existing, unitPrice: '30.00' };

        mockVendorCatalogItemRepo.findById.mockResolvedValue(existing);
        mockVendorCatalogItemRepo.update.mockResolvedValue(updated);

        const result = await service.updateVendorCatalogItem(existing.id, {
          unitPrice: '30.00',
        });

        expect(result.unitPrice).toBe('30.00');
        expect(mockVendorCatalogItemRepo.update).toHaveBeenCalledWith(existing.id, {
          unitPrice: '30.00',
        });
      });

      it('should throw NotFoundError for non-existent vendor catalog item', async () => {
        mockVendorCatalogItemRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateVendorCatalogItem('non-existent', { unitPrice: '30.00' }),
        ).rejects.toThrow(VendorCatalogItemNotFoundError);
      });

      it('should update description', async () => {
        const existing = createVendorCatalogItemFixture();
        const updated = { ...existing, description: 'Updated description' };

        mockVendorCatalogItemRepo.findById.mockResolvedValue(existing);
        mockVendorCatalogItemRepo.update.mockResolvedValue(updated);

        const result = await service.updateVendorCatalogItem(existing.id, {
          description: 'Updated description',
        });

        expect(result.description).toBe('Updated description');
      });

      it('should update lead time', async () => {
        const existing = createVendorCatalogItemFixture();
        const updated = { ...existing, leadTimeDays: 30 };

        mockVendorCatalogItemRepo.findById.mockResolvedValue(existing);
        mockVendorCatalogItemRepo.update.mockResolvedValue(updated);

        const result = await service.updateVendorCatalogItem(existing.id, {
          leadTimeDays: 30,
        });

        expect(result.leadTimeDays).toBe(30);
      });
    });

    describe('deleteVendorCatalogItem', () => {
      it('should soft delete vendor catalog item', async () => {
        const existing = createVendorCatalogItemFixture();

        mockVendorCatalogItemRepo.findById.mockResolvedValue(existing);
        mockVendorCatalogItemRepo.softDelete.mockResolvedValue(undefined);

        await service.deleteVendorCatalogItem(existing.id);

        expect(mockVendorCatalogItemRepo.softDelete).toHaveBeenCalledWith(existing.id);
      });

      it('should throw NotFoundError for non-existent vendor catalog item', async () => {
        mockVendorCatalogItemRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteVendorCatalogItem('non-existent')).rejects.toThrow(
          VendorCatalogItemNotFoundError,
        );
      });
    });
  });
});
