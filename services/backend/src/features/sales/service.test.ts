import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OTHER_TENANT_ID, TEST_TENANT_ID } from '../../lib/test-utils';
import {
  createAcceptedQuotationFixture,
  createConfirmedSalesOrderFixture,
  createDiscountPolicyFixture,
  createDiscountPolicyInputFixture,
  createExpiredQuotationFixture,
  createQuotationFixture,
  createQuotationInputFixture,
  createQuotationLineItemFixture,
  createQuotationLineItemInputFixture,
  createSalesOrderFixture,
  createSalesOrderInputFixture,
  createSalesOrderLineItemFixture,
  createSalesOrderLineItemInputFixture,
  createSentQuotationFixture,
  createShippedSalesOrderFixture,
} from './fixtures/sales.fixture';

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
        .mockResolvedValue([{ id: 'so-00000000-0000-0000-000000000001', status: 'draft' }]),
    }),
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  }),
  delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  query: {
    salesOrderLineItems: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    quotationLineItems: {
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
  salesOrders: createMockTable('sales_orders'),
  salesOrderLineItems: createMockTable('sales_order_line_items'),
  quotations: createMockTable('quotations'),
  quotationLineItems: createMockTable('quotation_line_items'),
  discountPolicies: createMockTable('discount_policies'),
}));

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: vi.fn(() => true),
    and: vi.fn(() => true),
    isNull: vi.fn(() => true),
    asc: vi.fn(() => ({})),
    lte: vi.fn(() => ({})),
    count: vi.fn(() => 0),
    sum: vi.fn(() => '0'),
  };
});

// ─── Mock Repo Module ─────────────────────────────────────────────────────

const {
  mockSalesOrdersRepo,
  mockSalesOrderLineItemsRepo,
  mockQuotationsRepo,
  mockQuotationLineItemsRepo,
  mockDiscountPoliciesRepo,
} = vi.hoisted(() => ({
  mockSalesOrdersRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
    findByOrderNumber: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  mockSalesOrderLineItemsRepo: {
    findById: vi.fn(),
    findBySalesOrderId: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteBySalesOrderId: vi.fn(),
  },
  mockQuotationsRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
    findByQuotationNumber: vi.fn(),
    findExpired: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  mockQuotationLineItemsRepo: {
    findById: vi.fn(),
    findByQuotationId: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteByQuotationId: vi.fn(),
  },
  mockDiscountPoliciesRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
    findActive: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('./repo', () => ({
  salesOrdersRepository: mockSalesOrdersRepo,
  salesOrderLineItemsRepository: mockSalesOrderLineItemsRepo,
  quotationsRepository: mockQuotationsRepo,
  quotationLineItemsRepository: mockQuotationLineItemsRepo,
  discountPoliciesRepository: mockDiscountPoliciesRepo,
}));

// ─── Import Service After Mocking ─────────────────────────────────────────

import {
  DiscountPolicyNameConflictError,
  DiscountPolicyNotFoundError,
  QuotationAlreadyExpiredError,
  QuotationCannotEditNonDraftError,
  QuotationDuplicateNumberError,
  QuotationLineItemNotFoundError,
  QuotationLineItemRequiredError,
  QuotationNotFoundError,
  QuotationStatusTransitionError,
  SalesOrderAlreadyCancelledError,
  SalesOrderAlreadyClosedError,
  SalesOrderCannotEditNonDraftError,
  SalesOrderDuplicateNumberError,
  SalesOrderLineItemNotFoundError,
  SalesOrderLineItemRequiredError,
  SalesOrderNotFoundError,
  SalesOrderStatusTransitionError,
} from './errors';
import * as service from './service';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Sales Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SALES ORDER SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Sales Order Service', () => {
    describe('listSalesOrders', () => {
      it('should return paginated sales orders', async () => {
        const order = createSalesOrderFixture();
        mockSalesOrdersRepo.findMany.mockResolvedValue({
          data: [order],
          total: 1,
          limit: 50,
          offset: 0,
        });

        const result = await service.listSalesOrders(TEST_TENANT_ID, { limit: 50, offset: 0 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
      });

      it('should return empty list when no orders exist', async () => {
        mockSalesOrdersRepo.findMany.mockResolvedValue({
          data: [],
          total: 0,
          limit: 50,
          offset: 0,
        });

        const result = await service.listSalesOrders(TEST_TENANT_ID, { limit: 50, offset: 0 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should pass customerId filter', async () => {
        mockSalesOrdersRepo.findMany.mockResolvedValue({
          data: [],
          total: 0,
          limit: 50,
          offset: 0,
        });

        await service.listSalesOrders(TEST_TENANT_ID, {
          limit: 50,
          offset: 0,
          customerId: 'customer-1',
        });

        expect(mockSalesOrdersRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ customerId: 'customer-1' }),
        );
      });

      it('should pass status filter', async () => {
        mockSalesOrdersRepo.findMany.mockResolvedValue({
          data: [],
          total: 0,
          limit: 50,
          offset: 0,
        });

        await service.listSalesOrders(TEST_TENANT_ID, {
          limit: 50,
          offset: 0,
          status: 'confirmed',
        });

        expect(mockSalesOrdersRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ status: 'confirmed' }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockSalesOrdersRepo.findMany.mockResolvedValue({
          data: [],
          total: 0,
          limit: 50,
          offset: 0,
        });

        await service.listSalesOrders(TEST_TENANT_ID, { limit: 50, offset: 0 });

        expect(mockSalesOrdersRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.anything(),
        );
      });
    });

    describe('getSalesOrder', () => {
      it('should return sales order by id', async () => {
        const order = createSalesOrderFixture();
        mockSalesOrdersRepo.findById.mockResolvedValue(order);

        const result = await service.getSalesOrder(order.id, TEST_TENANT_ID);

        expect(result).toEqual(order);
        expect(mockSalesOrdersRepo.findById).toHaveBeenCalledWith(order.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent order', async () => {
        mockSalesOrdersRepo.findById.mockResolvedValue(undefined);

        await expect(service.getSalesOrder('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          SalesOrderNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockSalesOrdersRepo.findById.mockResolvedValue(undefined);

        await expect(service.getSalesOrder('so-1', OTHER_TENANT_ID)).rejects.toThrow(
          SalesOrderNotFoundError,
        );
        expect(mockSalesOrdersRepo.findById).toHaveBeenCalledWith('so-1', OTHER_TENANT_ID);
      });
    });

    describe('getSalesOrderLineItems', () => {
      it('should return line items for an order', async () => {
        const order = createSalesOrderFixture();
        const lineItems = [createSalesOrderLineItemFixture()];

        mockSalesOrdersRepo.findById.mockResolvedValue(order);
        mockSalesOrderLineItemsRepo.findBySalesOrderId.mockResolvedValue(lineItems);

        const result = await service.getSalesOrderLineItems(order.id, TEST_TENANT_ID);

        expect(result).toEqual(lineItems);
      });

      it('should throw NotFoundError for non-existent order', async () => {
        mockSalesOrdersRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.getSalesOrderLineItems('non-existent', TEST_TENANT_ID),
        ).rejects.toThrow(SalesOrderNotFoundError);
      });

      it('should return empty array when order has no line items', async () => {
        const order = createSalesOrderFixture();
        mockSalesOrdersRepo.findById.mockResolvedValue(order);
        mockSalesOrderLineItemsRepo.findBySalesOrderId.mockResolvedValue([]);

        const result = await service.getSalesOrderLineItems(order.id, TEST_TENANT_ID);

        expect(result).toEqual([]);
      });
    });

    describe('createSalesOrder', () => {
      it('should create sales order with line items', async () => {
        const input = createSalesOrderInputFixture();
        const expected = createSalesOrderFixture();

        mockSalesOrdersRepo.findByOrderNumber.mockResolvedValue(undefined);
        mockSalesOrdersRepo.create.mockResolvedValue([expected]);
        mockSalesOrderLineItemsRepo.createMany.mockResolvedValue([
          createSalesOrderLineItemFixture(),
        ]);

        const result = await service.createSalesOrder(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(mockSalesOrdersRepo.findByOrderNumber).toHaveBeenCalledWith(
          input.orderNumber,
          TEST_TENANT_ID,
        );
        expect(mockSalesOrdersRepo.create).toHaveBeenCalled();
        expect(mockSalesOrderLineItemsRepo.createMany).toHaveBeenCalled();
      });

      it('should set initial status to draft', async () => {
        const input = createSalesOrderInputFixture();
        const expected = createSalesOrderFixture();

        mockSalesOrdersRepo.findByOrderNumber.mockResolvedValue(undefined);
        mockSalesOrdersRepo.create.mockResolvedValue([expected]);
        mockSalesOrderLineItemsRepo.createMany.mockResolvedValue([]);

        await service.createSalesOrder(input, TEST_TENANT_ID);

        expect(mockSalesOrdersRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'draft' }),
          TEST_TENANT_ID,
        );
      });

      it('should calculate line item totals', async () => {
        const input = createSalesOrderInputFixture({
          lineItems: [{ itemId: 'item-1', quantity: '10', unitPrice: '25.0000' }],
        });
        const expected = createSalesOrderFixture({ total: '250.0000', subtotal: '250.0000' });

        mockSalesOrdersRepo.findByOrderNumber.mockResolvedValue(undefined);
        mockSalesOrdersRepo.create.mockResolvedValue([expected]);
        mockSalesOrderLineItemsRepo.createMany.mockResolvedValue([]);

        await service.createSalesOrder(input, TEST_TENANT_ID);

        expect(mockSalesOrdersRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            subtotal: '250.0000',
            total: '250.0000',
          }),
          TEST_TENANT_ID,
        );
      });

      it('should calculate order totals with discounts and tax', async () => {
        const input = createSalesOrderInputFixture({
          lineItems: [
            {
              itemId: 'item-1',
              quantity: '10',
              unitPrice: '100.0000',
              discountPercent: '0.1000',
              taxRate: '0.0500',
            },
          ],
        });
        const expected = createSalesOrderFixture();

        mockSalesOrdersRepo.findByOrderNumber.mockResolvedValue(undefined);
        mockSalesOrdersRepo.create.mockResolvedValue([expected]);
        mockSalesOrderLineItemsRepo.createMany.mockResolvedValue([]);

        await service.createSalesOrder(input, TEST_TENANT_ID);

        // Line item:
        //   subtotal = 10 * 100 = 1000.0000
        //   discountAmount = 1000 * 0.10 = 100.0000
        //   lineNet = 1000 - 100 = 900.0000
        //   taxAmount = 900 * 0.05 = 45.0000
        //   total = 900 + 45 = 945.0000
        // Order level (recalculateOrderTotals sums line item totals):
        //   subtotal = 945.0000 (sum of line item totals)
        //   discountAmount = 100.0000
        //   taxAmount = 45.0000
        //   total = (945 - 100) + 45 = 890.0000
        expect(mockSalesOrdersRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            subtotal: '945.0000',
            discountAmount: '100.0000',
            taxAmount: '45.0000',
            total: '890.0000',
          }),
          TEST_TENANT_ID,
        );
      });

      it('should reject duplicate order number', async () => {
        const input = createSalesOrderInputFixture();
        const existing = createSalesOrderFixture();

        mockSalesOrdersRepo.findByOrderNumber.mockResolvedValue(existing);

        await expect(service.createSalesOrder(input, TEST_TENANT_ID)).rejects.toThrow(
          SalesOrderDuplicateNumberError,
        );
      });

      it('should reject empty line items', async () => {
        const input = createSalesOrderInputFixture({ lineItems: [] });

        mockSalesOrdersRepo.findByOrderNumber.mockResolvedValue(undefined);

        await expect(service.createSalesOrder(input, TEST_TENANT_ID)).rejects.toThrow(
          SalesOrderLineItemRequiredError,
        );
      });

      it('should scope order number uniqueness to tenant', async () => {
        const input = createSalesOrderInputFixture({ orderNumber: 'SO-001' });
        const expected = createSalesOrderFixture();

        mockSalesOrdersRepo.findByOrderNumber.mockImplementation(
          async (_num: string, tenantId: string) => {
            if (tenantId === OTHER_TENANT_ID) return createSalesOrderFixture();
            return undefined;
          },
        );
        mockSalesOrdersRepo.create.mockResolvedValue([expected]);
        mockSalesOrderLineItemsRepo.createMany.mockResolvedValue([]);

        const result = await service.createSalesOrder(input, TEST_TENANT_ID);
        expect(result).toBeDefined();
        expect(mockSalesOrdersRepo.findByOrderNumber).toHaveBeenCalledWith(
          'SO-001',
          TEST_TENANT_ID,
        );
      });
    });

    describe('updateSalesOrder', () => {
      it('should update draft sales order', async () => {
        const existing = createSalesOrderFixture();
        const updated = { ...existing, notes: 'Updated notes' };

        mockSalesOrdersRepo.findById.mockResolvedValue(existing);
        mockSalesOrdersRepo.update.mockResolvedValue([updated]);

        const result = await service.updateSalesOrder(
          existing.id,
          { notes: 'Updated notes' },
          TEST_TENANT_ID,
        );

        expect(result.notes).toBe('Updated notes');
      });

      it('should throw NotFoundError for non-existent order', async () => {
        mockSalesOrdersRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateSalesOrder('non-existent', { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(SalesOrderNotFoundError);
      });

      it('should reject update of confirmed order', async () => {
        const existing = createConfirmedSalesOrderFixture();
        mockSalesOrdersRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateSalesOrder(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(SalesOrderCannotEditNonDraftError);
      });

      it('should reject update of shipped order', async () => {
        const existing = createShippedSalesOrderFixture();
        mockSalesOrdersRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateSalesOrder(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(SalesOrderCannotEditNonDraftError);
      });

      it('should update with new line items and recalculate totals', async () => {
        const existing = createSalesOrderFixture();
        const updated = { ...existing, subtotal: '200.0000', total: '200.0000' };
        const newLineItem = createSalesOrderLineItemFixture({ total: '200.0000' });

        mockSalesOrdersRepo.findById.mockResolvedValue(existing);
        mockSalesOrderLineItemsRepo.deleteBySalesOrderId.mockResolvedValue(undefined);
        mockSalesOrderLineItemsRepo.createMany.mockResolvedValue([newLineItem]);
        mockSalesOrderLineItemsRepo.findBySalesOrderId.mockResolvedValue([newLineItem]);
        mockSalesOrdersRepo.update.mockResolvedValue([updated]);

        const result = await service.updateSalesOrder(
          existing.id,
          {
            lineItems: [{ itemId: 'item-1', quantity: '20', unitPrice: '10.0000' }],
          },
          TEST_TENANT_ID,
        );

        expect(result).toBeDefined();
        expect(mockSalesOrderLineItemsRepo.deleteBySalesOrderId).toHaveBeenCalledWith(
          existing.id,
          TEST_TENANT_ID,
        );
        expect(mockSalesOrderLineItemsRepo.createMany).toHaveBeenCalled();
      });

      it('should reject empty line items on update', async () => {
        const existing = createSalesOrderFixture();
        mockSalesOrdersRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateSalesOrder(existing.id, { lineItems: [] }, TEST_TENANT_ID),
        ).rejects.toThrow(SalesOrderLineItemRequiredError);
      });
    });

    describe('updateSalesOrderStatus', () => {
      it('should transition from draft to confirmed', async () => {
        const existing = createSalesOrderFixture({ status: 'draft' });
        const updated = { ...existing, status: 'confirmed' };

        mockSalesOrdersRepo.findById.mockResolvedValue(existing);
        mockSalesOrdersRepo.update.mockResolvedValue([updated]);

        const result = await service.updateSalesOrderStatus(
          existing.id,
          'confirmed',
          TEST_TENANT_ID,
        );

        expect(result.status).toBe('confirmed');
      });

      it('should transition from draft to cancelled', async () => {
        const existing = createSalesOrderFixture({ status: 'draft' });
        const updated = { ...existing, status: 'cancelled' };

        mockSalesOrdersRepo.findById.mockResolvedValue(existing);
        mockSalesOrdersRepo.update.mockResolvedValue([updated]);

        const result = await service.updateSalesOrderStatus(
          existing.id,
          'cancelled',
          TEST_TENANT_ID,
        );

        expect(result.status).toBe('cancelled');
      });

      it('should transition from confirmed to processing', async () => {
        const existing = createSalesOrderFixture({ status: 'confirmed' });
        const updated = { ...existing, status: 'processing' };

        mockSalesOrdersRepo.findById.mockResolvedValue(existing);
        mockSalesOrdersRepo.update.mockResolvedValue([updated]);

        const result = await service.updateSalesOrderStatus(
          existing.id,
          'processing',
          TEST_TENANT_ID,
        );

        expect(result.status).toBe('processing');
      });

      it('should transition from confirmed to cancelled', async () => {
        const existing = createSalesOrderFixture({ status: 'confirmed' });
        const updated = { ...existing, status: 'cancelled' };

        mockSalesOrdersRepo.findById.mockResolvedValue(existing);
        mockSalesOrdersRepo.update.mockResolvedValue([updated]);

        const result = await service.updateSalesOrderStatus(
          existing.id,
          'cancelled',
          TEST_TENANT_ID,
        );

        expect(result.status).toBe('cancelled');
      });

      it('should transition from processing to shipped', async () => {
        const existing = createSalesOrderFixture({ status: 'processing' });
        const updated = { ...existing, status: 'shipped' };

        mockSalesOrdersRepo.findById.mockResolvedValue(existing);
        mockSalesOrdersRepo.update.mockResolvedValue([updated]);

        const result = await service.updateSalesOrderStatus(existing.id, 'shipped', TEST_TENANT_ID);

        expect(result.status).toBe('shipped');
      });

      it('should transition from processing to cancelled', async () => {
        const existing = createSalesOrderFixture({ status: 'processing' });
        const updated = { ...existing, status: 'cancelled' };

        mockSalesOrdersRepo.findById.mockResolvedValue(existing);
        mockSalesOrdersRepo.update.mockResolvedValue([updated]);

        const result = await service.updateSalesOrderStatus(
          existing.id,
          'cancelled',
          TEST_TENANT_ID,
        );

        expect(result.status).toBe('cancelled');
      });

      it('should transition from shipped to delivered', async () => {
        const existing = createSalesOrderFixture({ status: 'shipped' });
        const updated = { ...existing, status: 'delivered' };

        mockSalesOrdersRepo.findById.mockResolvedValue(existing);
        mockSalesOrdersRepo.update.mockResolvedValue([updated]);

        const result = await service.updateSalesOrderStatus(
          existing.id,
          'delivered',
          TEST_TENANT_ID,
        );

        expect(result.status).toBe('delivered');
      });

      it('should transition from delivered to closed', async () => {
        const existing = createSalesOrderFixture({ status: 'delivered' });
        const updated = { ...existing, status: 'closed' };

        mockSalesOrdersRepo.findById.mockResolvedValue(existing);
        mockSalesOrdersRepo.update.mockResolvedValue([updated]);

        const result = await service.updateSalesOrderStatus(existing.id, 'closed', TEST_TENANT_ID);

        expect(result.status).toBe('closed');
      });

      it('should reject invalid transition from draft to shipped', async () => {
        const existing = createSalesOrderFixture({ status: 'draft' });
        mockSalesOrdersRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateSalesOrderStatus(existing.id, 'shipped', TEST_TENANT_ID),
        ).rejects.toThrow(SalesOrderStatusTransitionError);
      });

      it('should reject invalid transition from draft to delivered', async () => {
        const existing = createSalesOrderFixture({ status: 'draft' });
        mockSalesOrdersRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateSalesOrderStatus(existing.id, 'delivered', TEST_TENANT_ID),
        ).rejects.toThrow(SalesOrderStatusTransitionError);
      });

      it('should reject invalid transition from confirmed to delivered', async () => {
        const existing = createSalesOrderFixture({ status: 'confirmed' });
        mockSalesOrdersRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateSalesOrderStatus(existing.id, 'delivered', TEST_TENANT_ID),
        ).rejects.toThrow(SalesOrderStatusTransitionError);
      });

      it('should reject invalid transition from shipped to closed', async () => {
        const existing = createSalesOrderFixture({ status: 'shipped' });
        mockSalesOrdersRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateSalesOrderStatus(existing.id, 'closed', TEST_TENANT_ID),
        ).rejects.toThrow(SalesOrderStatusTransitionError);
      });

      it('should reject updating cancelled order', async () => {
        const existing = createSalesOrderFixture({ status: 'cancelled' });
        mockSalesOrdersRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateSalesOrderStatus(existing.id, 'confirmed', TEST_TENANT_ID),
        ).rejects.toThrow(SalesOrderAlreadyCancelledError);
      });

      it('should reject updating closed order', async () => {
        const existing = createSalesOrderFixture({ status: 'closed' });
        mockSalesOrdersRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateSalesOrderStatus(existing.id, 'confirmed', TEST_TENANT_ID),
        ).rejects.toThrow(SalesOrderAlreadyClosedError);
      });

      it('should throw NotFoundError for non-existent order', async () => {
        mockSalesOrdersRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateSalesOrderStatus('non-existent', 'confirmed', TEST_TENANT_ID),
        ).rejects.toThrow(SalesOrderNotFoundError);
      });

      it('should scope status update to tenant', async () => {
        mockSalesOrdersRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateSalesOrderStatus('so-1', 'confirmed', OTHER_TENANT_ID),
        ).rejects.toThrow(SalesOrderNotFoundError);
        expect(mockSalesOrdersRepo.findById).toHaveBeenCalledWith('so-1', OTHER_TENANT_ID);
      });
    });

    describe('deleteSalesOrder', () => {
      it('should delete draft sales order', async () => {
        const existing = createSalesOrderFixture({ status: 'draft' });

        mockSalesOrdersRepo.findById.mockResolvedValue(existing);
        mockSalesOrderLineItemsRepo.deleteBySalesOrderId.mockResolvedValue(undefined);
        mockSalesOrdersRepo.delete.mockResolvedValue(undefined);

        await service.deleteSalesOrder(existing.id, TEST_TENANT_ID);

        expect(mockSalesOrderLineItemsRepo.deleteBySalesOrderId).toHaveBeenCalledWith(
          existing.id,
          TEST_TENANT_ID,
        );
        expect(mockSalesOrdersRepo.delete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent order', async () => {
        mockSalesOrdersRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteSalesOrder('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          SalesOrderNotFoundError,
        );
      });

      it('should reject deletion of confirmed order', async () => {
        const existing = createConfirmedSalesOrderFixture();
        mockSalesOrdersRepo.findById.mockResolvedValue(existing);

        await expect(service.deleteSalesOrder(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          SalesOrderCannotEditNonDraftError,
        );
      });

      it('should reject deletion of shipped order', async () => {
        const existing = createShippedSalesOrderFixture();
        mockSalesOrdersRepo.findById.mockResolvedValue(existing);

        await expect(service.deleteSalesOrder(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          SalesOrderCannotEditNonDraftError,
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SALES ORDER LINE ITEM SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Sales Order Line Item Service', () => {
    describe('getSalesOrderLineItem', () => {
      it('should return line item by id', async () => {
        const lineItem = createSalesOrderLineItemFixture();
        mockSalesOrderLineItemsRepo.findById.mockResolvedValue(lineItem);

        const result = await service.getSalesOrderLineItem(lineItem.id, TEST_TENANT_ID);

        expect(result).toEqual(lineItem);
        expect(mockSalesOrderLineItemsRepo.findById).toHaveBeenCalledWith(
          lineItem.id,
          TEST_TENANT_ID,
        );
      });

      it('should throw NotFoundError for non-existent line item', async () => {
        mockSalesOrderLineItemsRepo.findById.mockResolvedValue(undefined);

        await expect(service.getSalesOrderLineItem('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          SalesOrderLineItemNotFoundError,
        );
      });
    });

    describe('createSalesOrderLineItem', () => {
      it('should create line item on draft order', async () => {
        const order = createSalesOrderFixture({ status: 'draft' });
        const lineItem = createSalesOrderLineItemFixture();
        const existingLineItems = [createSalesOrderLineItemFixture()];

        mockSalesOrdersRepo.findById.mockResolvedValue(order);
        mockSalesOrderLineItemsRepo.create.mockResolvedValue([lineItem]);
        mockSalesOrderLineItemsRepo.findBySalesOrderId.mockResolvedValue(existingLineItems);
        mockSalesOrdersRepo.update.mockResolvedValue([order]);

        const result = await service.createSalesOrderLineItem(
          order.id,
          createSalesOrderLineItemInputFixture(),
          TEST_TENANT_ID,
        );

        expect(result).toEqual(lineItem);
      });

      it('should throw NotFoundError for non-existent order', async () => {
        mockSalesOrdersRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createSalesOrderLineItem(
            'non-existent',
            createSalesOrderLineItemInputFixture(),
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(SalesOrderNotFoundError);
      });

      it('should reject adding line item to confirmed order', async () => {
        const order = createConfirmedSalesOrderFixture();
        mockSalesOrdersRepo.findById.mockResolvedValue(order);

        await expect(
          service.createSalesOrderLineItem(
            order.id,
            createSalesOrderLineItemInputFixture(),
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(SalesOrderCannotEditNonDraftError);
      });

      it('should reject adding line item to shipped order', async () => {
        const order = createShippedSalesOrderFixture();
        mockSalesOrdersRepo.findById.mockResolvedValue(order);

        await expect(
          service.createSalesOrderLineItem(
            order.id,
            createSalesOrderLineItemInputFixture(),
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(SalesOrderCannotEditNonDraftError);
      });

      it('should recalculate order totals after adding line item', async () => {
        const order = createSalesOrderFixture({ status: 'draft' });
        const lineItem = createSalesOrderLineItemFixture();

        mockSalesOrdersRepo.findById.mockResolvedValue(order);
        mockSalesOrderLineItemsRepo.create.mockResolvedValue([lineItem]);
        // Return line items for recalculation
        mockSalesOrderLineItemsRepo.findBySalesOrderId.mockResolvedValue([lineItem]);
        mockSalesOrdersRepo.update.mockResolvedValue([order]);

        await service.createSalesOrderLineItem(
          order.id,
          createSalesOrderLineItemInputFixture(),
          TEST_TENANT_ID,
        );

        expect(mockSalesOrdersRepo.update).toHaveBeenCalled();
      });
    });

    describe('updateSalesOrderLineItem', () => {
      it('should update line item on draft order', async () => {
        const order = createSalesOrderFixture({ status: 'draft' });
        const existing = createSalesOrderLineItemFixture();
        const updated = { ...existing, quantity: '20' };
        const allLineItems = [updated];

        mockSalesOrderLineItemsRepo.findById.mockResolvedValue(existing);
        mockSalesOrdersRepo.findById.mockResolvedValue(order);
        mockSalesOrderLineItemsRepo.update.mockResolvedValue([updated]);
        mockSalesOrderLineItemsRepo.findBySalesOrderId.mockResolvedValue(allLineItems);
        mockSalesOrdersRepo.update.mockResolvedValue([order]);

        const result = await service.updateSalesOrderLineItem(
          existing.id,
          { quantity: '20' },
          TEST_TENANT_ID,
        );

        expect(result.quantity).toBe('20');
      });

      it('should throw NotFoundError for non-existent line item', async () => {
        mockSalesOrderLineItemsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateSalesOrderLineItem('non-existent', { quantity: '20' }, TEST_TENANT_ID),
        ).rejects.toThrow(SalesOrderLineItemNotFoundError);
      });

      it('should reject update on confirmed order', async () => {
        const order = createConfirmedSalesOrderFixture();
        const existing = createSalesOrderLineItemFixture();

        mockSalesOrderLineItemsRepo.findById.mockResolvedValue(existing);
        mockSalesOrdersRepo.findById.mockResolvedValue(order);

        await expect(
          service.updateSalesOrderLineItem(existing.id, { quantity: '20' }, TEST_TENANT_ID),
        ).rejects.toThrow(SalesOrderCannotEditNonDraftError);
      });

      it('should recalculate order totals after updating line item', async () => {
        const order = createSalesOrderFixture({ status: 'draft' });
        const existing = createSalesOrderLineItemFixture();
        const updated = { ...existing, quantity: '20', total: '200.0000' };

        mockSalesOrderLineItemsRepo.findById.mockResolvedValue(existing);
        mockSalesOrdersRepo.findById.mockResolvedValue(order);
        mockSalesOrderLineItemsRepo.update.mockResolvedValue([updated]);
        mockSalesOrderLineItemsRepo.findBySalesOrderId.mockResolvedValue([updated]);
        mockSalesOrdersRepo.update.mockResolvedValue([order]);

        await service.updateSalesOrderLineItem(existing.id, { quantity: '20' }, TEST_TENANT_ID);

        expect(mockSalesOrdersRepo.update).toHaveBeenCalled();
      });
    });

    describe('deleteSalesOrderLineItem', () => {
      it('should delete line item from draft order', async () => {
        const order = createSalesOrderFixture({ status: 'draft' });
        const existing = createSalesOrderLineItemFixture();

        mockSalesOrderLineItemsRepo.findById.mockResolvedValue(existing);
        mockSalesOrdersRepo.findById.mockResolvedValue(order);
        mockSalesOrderLineItemsRepo.delete.mockResolvedValue(undefined);
        mockSalesOrderLineItemsRepo.findBySalesOrderId.mockResolvedValue([]);
        mockSalesOrdersRepo.update.mockResolvedValue([order]);

        await service.deleteSalesOrderLineItem(existing.id, TEST_TENANT_ID);

        expect(mockSalesOrderLineItemsRepo.delete).toHaveBeenCalledWith(
          existing.id,
          TEST_TENANT_ID,
        );
      });

      it('should throw NotFoundError for non-existent line item', async () => {
        mockSalesOrderLineItemsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.deleteSalesOrderLineItem('non-existent', TEST_TENANT_ID),
        ).rejects.toThrow(SalesOrderLineItemNotFoundError);
      });

      it('should reject deletion from confirmed order', async () => {
        const order = createConfirmedSalesOrderFixture();
        const existing = createSalesOrderLineItemFixture();

        mockSalesOrderLineItemsRepo.findById.mockResolvedValue(existing);
        mockSalesOrdersRepo.findById.mockResolvedValue(order);

        await expect(service.deleteSalesOrderLineItem(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          SalesOrderCannotEditNonDraftError,
        );
      });

      it('should recalculate order totals after deleting line item', async () => {
        const order = createSalesOrderFixture({ status: 'draft' });
        const existing = createSalesOrderLineItemFixture();

        mockSalesOrderLineItemsRepo.findById.mockResolvedValue(existing);
        mockSalesOrdersRepo.findById.mockResolvedValue(order);
        mockSalesOrderLineItemsRepo.delete.mockResolvedValue(undefined);
        mockSalesOrderLineItemsRepo.findBySalesOrderId.mockResolvedValue([]);
        mockSalesOrdersRepo.update.mockResolvedValue([order]);

        await service.deleteSalesOrderLineItem(existing.id, TEST_TENANT_ID);

        // Should update order with zero totals since no line items remain
        expect(mockSalesOrdersRepo.update).toHaveBeenCalledWith(
          existing.salesOrderId,
          TEST_TENANT_ID,
          expect.objectContaining({
            subtotal: '0',
            discountAmount: '0',
            taxAmount: '0',
            total: '0',
          }),
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // QUOTATION SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Quotation Service', () => {
    describe('listQuotations', () => {
      it('should return paginated quotations', async () => {
        const quotation = createQuotationFixture();
        mockQuotationsRepo.findMany.mockResolvedValue({
          data: [quotation],
          total: 1,
          limit: 50,
          offset: 0,
        });

        const result = await service.listQuotations(TEST_TENANT_ID, { limit: 50, offset: 0 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
      });

      it('should return empty list when no quotations exist', async () => {
        mockQuotationsRepo.findMany.mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

        const result = await service.listQuotations(TEST_TENANT_ID, { limit: 50, offset: 0 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should pass customerId filter', async () => {
        mockQuotationsRepo.findMany.mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

        await service.listQuotations(TEST_TENANT_ID, {
          limit: 50,
          offset: 0,
          customerId: 'customer-1',
        });

        expect(mockQuotationsRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ customerId: 'customer-1' }),
        );
      });

      it('should pass status filter', async () => {
        mockQuotationsRepo.findMany.mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

        await service.listQuotations(TEST_TENANT_ID, {
          limit: 50,
          offset: 0,
          status: 'sent',
        });

        expect(mockQuotationsRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ status: 'sent' }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockQuotationsRepo.findMany.mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

        await service.listQuotations(TEST_TENANT_ID, { limit: 50, offset: 0 });

        expect(mockQuotationsRepo.findMany).toHaveBeenCalledWith(TEST_TENANT_ID, expect.anything());
      });
    });

    describe('getQuotation', () => {
      it('should return quotation by id', async () => {
        const quotation = createQuotationFixture();
        mockQuotationsRepo.findById.mockResolvedValue(quotation);

        const result = await service.getQuotation(quotation.id, TEST_TENANT_ID);

        expect(result).toEqual(quotation);
        expect(mockQuotationsRepo.findById).toHaveBeenCalledWith(quotation.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent quotation', async () => {
        mockQuotationsRepo.findById.mockResolvedValue(undefined);

        await expect(service.getQuotation('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          QuotationNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockQuotationsRepo.findById.mockResolvedValue(undefined);

        await expect(service.getQuotation('qt-1', OTHER_TENANT_ID)).rejects.toThrow(
          QuotationNotFoundError,
        );
        expect(mockQuotationsRepo.findById).toHaveBeenCalledWith('qt-1', OTHER_TENANT_ID);
      });
    });

    describe('getQuotationLineItems', () => {
      it('should return line items for a quotation', async () => {
        const quotation = createQuotationFixture();
        const lineItems = [createQuotationLineItemFixture()];

        mockQuotationsRepo.findById.mockResolvedValue(quotation);
        mockQuotationLineItemsRepo.findByQuotationId.mockResolvedValue(lineItems);

        const result = await service.getQuotationLineItems(quotation.id, TEST_TENANT_ID);

        expect(result).toEqual(lineItems);
      });

      it('should throw NotFoundError for non-existent quotation', async () => {
        mockQuotationsRepo.findById.mockResolvedValue(undefined);

        await expect(service.getQuotationLineItems('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          QuotationNotFoundError,
        );
      });
    });

    describe('createQuotation', () => {
      it('should create quotation with line items', async () => {
        const input = createQuotationInputFixture();
        const expected = createQuotationFixture();

        mockQuotationsRepo.findByQuotationNumber.mockResolvedValue(undefined);
        mockQuotationsRepo.create.mockResolvedValue([expected]);
        mockQuotationLineItemsRepo.createMany.mockResolvedValue([createQuotationLineItemFixture()]);

        const result = await service.createQuotation(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(mockQuotationsRepo.findByQuotationNumber).toHaveBeenCalledWith(
          input.quotationNumber,
          TEST_TENANT_ID,
        );
        expect(mockQuotationsRepo.create).toHaveBeenCalled();
        expect(mockQuotationLineItemsRepo.createMany).toHaveBeenCalled();
      });

      it('should set initial status to draft', async () => {
        const input = createQuotationInputFixture();
        const expected = createQuotationFixture();

        mockQuotationsRepo.findByQuotationNumber.mockResolvedValue(undefined);
        mockQuotationsRepo.create.mockResolvedValue([expected]);
        mockQuotationLineItemsRepo.createMany.mockResolvedValue([]);

        await service.createQuotation(input, TEST_TENANT_ID);

        expect(mockQuotationsRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'draft' }),
          TEST_TENANT_ID,
        );
      });

      it('should calculate line item totals', async () => {
        const input = createQuotationInputFixture({
          lineItems: [{ itemId: 'item-1', quantity: '10', unitPrice: '25.0000' }],
        });
        const expected = createQuotationFixture({ total: '250.0000', subtotal: '250.0000' });

        mockQuotationsRepo.findByQuotationNumber.mockResolvedValue(undefined);
        mockQuotationsRepo.create.mockResolvedValue([expected]);
        mockQuotationLineItemsRepo.createMany.mockResolvedValue([]);

        await service.createQuotation(input, TEST_TENANT_ID);

        expect(mockQuotationsRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            subtotal: '250.0000',
            total: '250.0000',
          }),
          TEST_TENANT_ID,
        );
      });

      it('should calculate quotation totals with discounts and tax', async () => {
        const input = createQuotationInputFixture({
          lineItems: [
            {
              itemId: 'item-1',
              quantity: '10',
              unitPrice: '100.0000',
              discountPercent: '0.1000',
              taxRate: '0.0500',
            },
          ],
        });
        const expected = createQuotationFixture();

        mockQuotationsRepo.findByQuotationNumber.mockResolvedValue(undefined);
        mockQuotationsRepo.create.mockResolvedValue([expected]);
        mockQuotationLineItemsRepo.createMany.mockResolvedValue([]);

        await service.createQuotation(input, TEST_TENANT_ID);

        // Line item:
        //   subtotal = 10 * 100 = 1000.0000
        //   discountAmount = 1000 * 0.10 = 100.0000
        //   lineNet = 1000 - 100 = 900.0000
        //   taxAmount = 900 * 0.05 = 45.0000
        //   total = 900 + 45 = 945.0000
        // Quotation level (recalculateOrderTotals sums line item totals):
        //   subtotal = 945.0000 (sum of line item totals)
        //   discountAmount = 100.0000
        //   taxAmount = 45.0000
        //   total = (945 - 100) + 45 = 890.0000
        expect(mockQuotationsRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            subtotal: '945.0000',
            discountAmount: '100.0000',
            taxAmount: '45.0000',
            total: '890.0000',
          }),
          TEST_TENANT_ID,
        );
      });

      it('should reject duplicate quotation number', async () => {
        const input = createQuotationInputFixture();
        const existing = createQuotationFixture();

        mockQuotationsRepo.findByQuotationNumber.mockResolvedValue(existing);

        await expect(service.createQuotation(input, TEST_TENANT_ID)).rejects.toThrow(
          QuotationDuplicateNumberError,
        );
      });

      it('should reject empty line items', async () => {
        const input = createQuotationInputFixture({ lineItems: [] });

        mockQuotationsRepo.findByQuotationNumber.mockResolvedValue(undefined);

        await expect(service.createQuotation(input, TEST_TENANT_ID)).rejects.toThrow(
          QuotationLineItemRequiredError,
        );
      });

      it('should scope quotation number uniqueness to tenant', async () => {
        const input = createQuotationInputFixture({ quotationNumber: 'QT-001' });
        const expected = createQuotationFixture();

        mockQuotationsRepo.findByQuotationNumber.mockImplementation(
          async (_num: string, tenantId: string) => {
            if (tenantId === OTHER_TENANT_ID) return createQuotationFixture();
            return undefined;
          },
        );
        mockQuotationsRepo.create.mockResolvedValue([expected]);
        mockQuotationLineItemsRepo.createMany.mockResolvedValue([]);

        const result = await service.createQuotation(input, TEST_TENANT_ID);
        expect(result).toBeDefined();
        expect(mockQuotationsRepo.findByQuotationNumber).toHaveBeenCalledWith(
          'QT-001',
          TEST_TENANT_ID,
        );
      });
    });

    describe('updateQuotation', () => {
      it('should update draft quotation', async () => {
        const existing = createQuotationFixture();
        const updated = { ...existing, notes: 'Updated notes' };

        mockQuotationsRepo.findById.mockResolvedValue(existing);
        mockQuotationsRepo.update.mockResolvedValue([updated]);

        const result = await service.updateQuotation(
          existing.id,
          { notes: 'Updated notes' },
          TEST_TENANT_ID,
        );

        expect(result.notes).toBe('Updated notes');
      });

      it('should throw NotFoundError for non-existent quotation', async () => {
        mockQuotationsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateQuotation('non-existent', { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(QuotationNotFoundError);
      });

      it('should reject update of sent quotation', async () => {
        const existing = createSentQuotationFixture();
        mockQuotationsRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateQuotation(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(QuotationCannotEditNonDraftError);
      });

      it('should reject update of accepted quotation', async () => {
        const existing = createQuotationFixture({ status: 'accepted' });
        mockQuotationsRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateQuotation(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(QuotationCannotEditNonDraftError);
      });

      it('should update with new line items and recalculate totals', async () => {
        const existing = createQuotationFixture();
        const updated = { ...existing, subtotal: '200.0000', total: '200.0000' };
        const newLineItem = createQuotationLineItemFixture({ total: '200.0000' });

        mockQuotationsRepo.findById.mockResolvedValue(existing);
        mockQuotationLineItemsRepo.deleteByQuotationId.mockResolvedValue(undefined);
        mockQuotationLineItemsRepo.createMany.mockResolvedValue([newLineItem]);
        mockQuotationLineItemsRepo.findByQuotationId.mockResolvedValue([newLineItem]);
        mockQuotationsRepo.update.mockResolvedValue([updated]);

        const result = await service.updateQuotation(
          existing.id,
          {
            lineItems: [{ itemId: 'item-1', quantity: '20', unitPrice: '10.0000' }],
          },
          TEST_TENANT_ID,
        );

        expect(result).toBeDefined();
        expect(mockQuotationLineItemsRepo.deleteByQuotationId).toHaveBeenCalledWith(
          existing.id,
          TEST_TENANT_ID,
        );
        expect(mockQuotationLineItemsRepo.createMany).toHaveBeenCalled();
      });

      it('should reject empty line items on update', async () => {
        const existing = createQuotationFixture();
        mockQuotationsRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateQuotation(existing.id, { lineItems: [] }, TEST_TENANT_ID),
        ).rejects.toThrow(QuotationLineItemRequiredError);
      });
    });

    describe('updateQuotationStatus', () => {
      it('should transition from draft to sent', async () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const expiryDate = futureDate.toISOString().split('T')[0];

        const existing = createQuotationFixture({ status: 'draft', expiryDate });
        const updated = { ...existing, status: 'sent' };

        mockQuotationsRepo.findById.mockResolvedValue(existing);
        mockQuotationsRepo.update.mockResolvedValue([updated]);

        const result = await service.updateQuotationStatus(existing.id, 'sent', TEST_TENANT_ID);

        expect(result.status).toBe('sent');
      });

      it('should transition from draft to cancelled', async () => {
        const existing = createQuotationFixture({ status: 'draft' });
        const updated = { ...existing, status: 'cancelled' };

        mockQuotationsRepo.findById.mockResolvedValue(existing);
        mockQuotationsRepo.update.mockResolvedValue([updated]);

        const result = await service.updateQuotationStatus(
          existing.id,
          'cancelled',
          TEST_TENANT_ID,
        );

        expect(result.status).toBe('cancelled');
      });

      it('should transition from sent to accepted', async () => {
        const existing = createQuotationFixture({ status: 'sent' });
        const updated = { ...existing, status: 'accepted' };

        mockQuotationsRepo.findById.mockResolvedValue(existing);
        mockQuotationsRepo.update.mockResolvedValue([updated]);

        const result = await service.updateQuotationStatus(existing.id, 'accepted', TEST_TENANT_ID);

        expect(result.status).toBe('accepted');
      });

      it('should transition from sent to rejected', async () => {
        const existing = createQuotationFixture({ status: 'sent' });
        const updated = { ...existing, status: 'rejected' };

        mockQuotationsRepo.findById.mockResolvedValue(existing);
        mockQuotationsRepo.update.mockResolvedValue([updated]);

        const result = await service.updateQuotationStatus(existing.id, 'rejected', TEST_TENANT_ID);

        expect(result.status).toBe('rejected');
      });

      it('should transition from sent to expired', async () => {
        const existing = createQuotationFixture({ status: 'sent' });
        const updated = { ...existing, status: 'expired' };

        mockQuotationsRepo.findById.mockResolvedValue(existing);
        mockQuotationsRepo.update.mockResolvedValue([updated]);

        const result = await service.updateQuotationStatus(existing.id, 'expired', TEST_TENANT_ID);

        expect(result.status).toBe('expired');
      });

      it('should transition from sent to cancelled', async () => {
        const existing = createQuotationFixture({ status: 'sent' });
        const updated = { ...existing, status: 'cancelled' };

        mockQuotationsRepo.findById.mockResolvedValue(existing);
        mockQuotationsRepo.update.mockResolvedValue([updated]);

        const result = await service.updateQuotationStatus(
          existing.id,
          'cancelled',
          TEST_TENANT_ID,
        );

        expect(result.status).toBe('cancelled');
      });

      it('should reject invalid transition from draft to accepted', async () => {
        const existing = createQuotationFixture({ status: 'draft' });
        mockQuotationsRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateQuotationStatus(existing.id, 'accepted', TEST_TENANT_ID),
        ).rejects.toThrow(QuotationStatusTransitionError);
      });

      it('should reject invalid transition from draft to rejected', async () => {
        const existing = createQuotationFixture({ status: 'draft' });
        mockQuotationsRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateQuotationStatus(existing.id, 'rejected', TEST_TENANT_ID),
        ).rejects.toThrow(QuotationStatusTransitionError);
      });

      it('should reject invalid transition from draft to expired', async () => {
        const existing = createQuotationFixture({ status: 'draft' });
        mockQuotationsRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateQuotationStatus(existing.id, 'expired', TEST_TENANT_ID),
        ).rejects.toThrow(QuotationStatusTransitionError);
      });

      it('should reject updating expired quotation', async () => {
        const existing = createExpiredQuotationFixture();
        mockQuotationsRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateQuotationStatus(existing.id, 'accepted', TEST_TENANT_ID),
        ).rejects.toThrow(QuotationAlreadyExpiredError);
      });

      it('should reject sending quotation with past expiry date', async () => {
        const existing = createQuotationFixture({
          status: 'draft',
          expiryDate: '2020-01-01',
        });
        mockQuotationsRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateQuotationStatus(existing.id, 'sent', TEST_TENANT_ID),
        ).rejects.toThrow(QuotationAlreadyExpiredError);
      });

      it('should throw NotFoundError for non-existent quotation', async () => {
        mockQuotationsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateQuotationStatus('non-existent', 'sent', TEST_TENANT_ID),
        ).rejects.toThrow(QuotationNotFoundError);
      });

      it('should scope status update to tenant', async () => {
        mockQuotationsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateQuotationStatus('qt-1', 'sent', OTHER_TENANT_ID),
        ).rejects.toThrow(QuotationNotFoundError);
        expect(mockQuotationsRepo.findById).toHaveBeenCalledWith('qt-1', OTHER_TENANT_ID);
      });
    });

    describe('expireQuotations', () => {
      it('should expire quotations past their expiry date', async () => {
        const expiredQuotation = createSentQuotationFixture({ expiryDate: '2026-01-01' });
        const updated = { ...expiredQuotation, status: 'expired' };

        mockQuotationsRepo.findExpired.mockResolvedValue([expiredQuotation]);
        mockQuotationsRepo.update.mockResolvedValue([updated]);

        const result = await service.expireQuotations(TEST_TENANT_ID);

        expect(result).toHaveLength(1);
        expect(result[0].status).toBe('expired');
        expect(mockQuotationsRepo.findExpired).toHaveBeenCalledWith(
          expect.any(String),
          TEST_TENANT_ID,
        );
      });

      it('should return empty array when no quotations to expire', async () => {
        mockQuotationsRepo.findExpired.mockResolvedValue([]);

        const result = await service.expireQuotations(TEST_TENANT_ID);

        expect(result).toHaveLength(0);
      });

      it('should expire multiple quotations', async () => {
        const q1 = createSentQuotationFixture({ id: 'qt-1', expiryDate: '2026-01-01' });
        const q2 = createSentQuotationFixture({ id: 'qt-2', expiryDate: '2026-02-01' });
        const u1 = { ...q1, status: 'expired' };
        const u2 = { ...q2, status: 'expired' };

        mockQuotationsRepo.findExpired.mockResolvedValue([q1, q2]);
        mockQuotationsRepo.update.mockResolvedValueOnce([u1]).mockResolvedValueOnce([u2]);

        const result = await service.expireQuotations(TEST_TENANT_ID);

        expect(result).toHaveLength(2);
        expect(mockQuotationsRepo.update).toHaveBeenCalledTimes(2);
      });
    });

    describe('deleteQuotation', () => {
      it('should delete draft quotation', async () => {
        const existing = createQuotationFixture({ status: 'draft' });

        mockQuotationsRepo.findById.mockResolvedValue(existing);
        mockQuotationLineItemsRepo.deleteByQuotationId.mockResolvedValue(undefined);
        mockQuotationsRepo.delete.mockResolvedValue(undefined);

        await service.deleteQuotation(existing.id, TEST_TENANT_ID);

        expect(mockQuotationLineItemsRepo.deleteByQuotationId).toHaveBeenCalledWith(
          existing.id,
          TEST_TENANT_ID,
        );
        expect(mockQuotationsRepo.delete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent quotation', async () => {
        mockQuotationsRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteQuotation('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          QuotationNotFoundError,
        );
      });

      it('should reject deletion of sent quotation', async () => {
        const existing = createSentQuotationFixture();
        mockQuotationsRepo.findById.mockResolvedValue(existing);

        await expect(service.deleteQuotation(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          QuotationCannotEditNonDraftError,
        );
      });

      it('should reject deletion of accepted quotation', async () => {
        const existing = createAcceptedQuotationFixture();
        mockQuotationsRepo.findById.mockResolvedValue(existing);

        await expect(service.deleteQuotation(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          QuotationCannotEditNonDraftError,
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // QUOTATION LINE ITEM SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Quotation Line Item Service', () => {
    describe('getQuotationLineItem', () => {
      it('should return line item by id', async () => {
        const lineItem = createQuotationLineItemFixture();
        mockQuotationLineItemsRepo.findById.mockResolvedValue(lineItem);

        const result = await service.getQuotationLineItem(lineItem.id, TEST_TENANT_ID);

        expect(result).toEqual(lineItem);
        expect(mockQuotationLineItemsRepo.findById).toHaveBeenCalledWith(
          lineItem.id,
          TEST_TENANT_ID,
        );
      });

      it('should throw NotFoundError for non-existent line item', async () => {
        mockQuotationLineItemsRepo.findById.mockResolvedValue(undefined);

        await expect(service.getQuotationLineItem('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          QuotationLineItemNotFoundError,
        );
      });
    });

    describe('createQuotationLineItem', () => {
      it('should create line item on draft quotation', async () => {
        const quotation = createQuotationFixture({ status: 'draft' });
        const lineItem = createQuotationLineItemFixture();
        const existingLineItems = [createQuotationLineItemFixture()];

        mockQuotationsRepo.findById.mockResolvedValue(quotation);
        mockQuotationLineItemsRepo.create.mockResolvedValue([lineItem]);
        mockQuotationLineItemsRepo.findByQuotationId.mockResolvedValue(existingLineItems);
        mockQuotationsRepo.update.mockResolvedValue([quotation]);

        const result = await service.createQuotationLineItem(
          quotation.id,
          createQuotationLineItemInputFixture(),
          TEST_TENANT_ID,
        );

        expect(result).toEqual(lineItem);
      });

      it('should throw NotFoundError for non-existent quotation', async () => {
        mockQuotationsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createQuotationLineItem(
            'non-existent',
            createQuotationLineItemInputFixture(),
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(QuotationNotFoundError);
      });

      it('should reject adding line item to sent quotation', async () => {
        const quotation = createSentQuotationFixture();
        mockQuotationsRepo.findById.mockResolvedValue(quotation);

        await expect(
          service.createQuotationLineItem(
            quotation.id,
            createQuotationLineItemInputFixture(),
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(QuotationCannotEditNonDraftError);
      });

      it('should reject adding line item to accepted quotation', async () => {
        const quotation = createAcceptedQuotationFixture();
        mockQuotationsRepo.findById.mockResolvedValue(quotation);

        await expect(
          service.createQuotationLineItem(
            quotation.id,
            createQuotationLineItemInputFixture(),
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(QuotationCannotEditNonDraftError);
      });

      it('should recalculate quotation totals after adding line item', async () => {
        const quotation = createQuotationFixture({ status: 'draft' });
        const lineItem = createQuotationLineItemFixture();

        mockQuotationsRepo.findById.mockResolvedValue(quotation);
        mockQuotationLineItemsRepo.create.mockResolvedValue([lineItem]);
        mockQuotationLineItemsRepo.findByQuotationId.mockResolvedValue([lineItem]);
        mockQuotationsRepo.update.mockResolvedValue([quotation]);

        await service.createQuotationLineItem(
          quotation.id,
          createQuotationLineItemInputFixture(),
          TEST_TENANT_ID,
        );

        expect(mockQuotationsRepo.update).toHaveBeenCalled();
      });
    });

    describe('updateQuotationLineItem', () => {
      it('should update line item on draft quotation', async () => {
        const quotation = createQuotationFixture({ status: 'draft' });
        const existing = createQuotationLineItemFixture();
        const updated = { ...existing, quantity: '20' };
        const allLineItems = [updated];

        mockQuotationLineItemsRepo.findById.mockResolvedValue(existing);
        mockQuotationsRepo.findById.mockResolvedValue(quotation);
        mockQuotationLineItemsRepo.update.mockResolvedValue([updated]);
        mockQuotationLineItemsRepo.findByQuotationId.mockResolvedValue(allLineItems);
        mockQuotationsRepo.update.mockResolvedValue([quotation]);

        const result = await service.updateQuotationLineItem(
          existing.id,
          { quantity: '20' },
          TEST_TENANT_ID,
        );

        expect(result.quantity).toBe('20');
      });

      it('should throw NotFoundError for non-existent line item', async () => {
        mockQuotationLineItemsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateQuotationLineItem('non-existent', { quantity: '20' }, TEST_TENANT_ID),
        ).rejects.toThrow(QuotationLineItemNotFoundError);
      });

      it('should reject update on sent quotation', async () => {
        const quotation = createSentQuotationFixture();
        const existing = createQuotationLineItemFixture();

        mockQuotationLineItemsRepo.findById.mockResolvedValue(existing);
        mockQuotationsRepo.findById.mockResolvedValue(quotation);

        await expect(
          service.updateQuotationLineItem(existing.id, { quantity: '20' }, TEST_TENANT_ID),
        ).rejects.toThrow(QuotationCannotEditNonDraftError);
      });

      it('should recalculate quotation totals after updating line item', async () => {
        const quotation = createQuotationFixture({ status: 'draft' });
        const existing = createQuotationLineItemFixture();
        const updated = { ...existing, quantity: '20', total: '200.0000' };

        mockQuotationLineItemsRepo.findById.mockResolvedValue(existing);
        mockQuotationsRepo.findById.mockResolvedValue(quotation);
        mockQuotationLineItemsRepo.update.mockResolvedValue([updated]);
        mockQuotationLineItemsRepo.findByQuotationId.mockResolvedValue([updated]);
        mockQuotationsRepo.update.mockResolvedValue([quotation]);

        await service.updateQuotationLineItem(existing.id, { quantity: '20' }, TEST_TENANT_ID);

        expect(mockQuotationsRepo.update).toHaveBeenCalled();
      });
    });

    describe('deleteQuotationLineItem', () => {
      it('should delete line item from draft quotation', async () => {
        const quotation = createQuotationFixture({ status: 'draft' });
        const existing = createQuotationLineItemFixture();

        mockQuotationLineItemsRepo.findById.mockResolvedValue(existing);
        mockQuotationsRepo.findById.mockResolvedValue(quotation);
        mockQuotationLineItemsRepo.delete.mockResolvedValue(undefined);
        mockQuotationLineItemsRepo.findByQuotationId.mockResolvedValue([]);
        mockQuotationsRepo.update.mockResolvedValue([quotation]);

        await service.deleteQuotationLineItem(existing.id, TEST_TENANT_ID);

        expect(mockQuotationLineItemsRepo.delete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent line item', async () => {
        mockQuotationLineItemsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.deleteQuotationLineItem('non-existent', TEST_TENANT_ID),
        ).rejects.toThrow(QuotationLineItemNotFoundError);
      });

      it('should reject deletion from sent quotation', async () => {
        const quotation = createSentQuotationFixture();
        const existing = createQuotationLineItemFixture();

        mockQuotationLineItemsRepo.findById.mockResolvedValue(existing);
        mockQuotationsRepo.findById.mockResolvedValue(quotation);

        await expect(service.deleteQuotationLineItem(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          QuotationCannotEditNonDraftError,
        );
      });

      it('should recalculate quotation totals after deleting line item', async () => {
        const quotation = createQuotationFixture({ status: 'draft' });
        const existing = createQuotationLineItemFixture();

        mockQuotationLineItemsRepo.findById.mockResolvedValue(existing);
        mockQuotationsRepo.findById.mockResolvedValue(quotation);
        mockQuotationLineItemsRepo.delete.mockResolvedValue(undefined);
        mockQuotationLineItemsRepo.findByQuotationId.mockResolvedValue([]);
        mockQuotationsRepo.update.mockResolvedValue([quotation]);

        await service.deleteQuotationLineItem(existing.id, TEST_TENANT_ID);

        // Should update quotation with zero totals since no line items remain
        expect(mockQuotationsRepo.update).toHaveBeenCalledWith(
          existing.quotationId,
          TEST_TENANT_ID,
          expect.objectContaining({
            subtotal: '0',
            discountAmount: '0',
            taxAmount: '0',
            total: '0',
          }),
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DISCOUNT POLICY SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Discount Policy Service', () => {
    describe('listDiscountPolicies', () => {
      it('should return paginated discount policies', async () => {
        const policy = createDiscountPolicyFixture();
        mockDiscountPoliciesRepo.findMany.mockResolvedValue({
          data: [policy],
          total: 1,
          limit: 50,
          offset: 0,
        });

        const result = await service.listDiscountPolicies(TEST_TENANT_ID, { limit: 50, offset: 0 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
      });

      it('should return empty list when no policies exist', async () => {
        mockDiscountPoliciesRepo.findMany.mockResolvedValue({
          data: [],
          total: 0,
          limit: 50,
          offset: 0,
        });

        const result = await service.listDiscountPolicies(TEST_TENANT_ID, { limit: 50, offset: 0 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should pass customerId filter', async () => {
        mockDiscountPoliciesRepo.findMany.mockResolvedValue({
          data: [],
          total: 0,
          limit: 50,
          offset: 0,
        });

        await service.listDiscountPolicies(TEST_TENANT_ID, {
          limit: 50,
          offset: 0,
          customerId: 'customer-1',
        });

        expect(mockDiscountPoliciesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ customerId: 'customer-1' }),
        );
      });

      it('should pass type filter', async () => {
        mockDiscountPoliciesRepo.findMany.mockResolvedValue({
          data: [],
          total: 0,
          limit: 50,
          offset: 0,
        });

        await service.listDiscountPolicies(TEST_TENANT_ID, {
          limit: 50,
          offset: 0,
          type: 'percentage',
        });

        expect(mockDiscountPoliciesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ type: 'percentage' }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockDiscountPoliciesRepo.findMany.mockResolvedValue({
          data: [],
          total: 0,
          limit: 50,
          offset: 0,
        });

        await service.listDiscountPolicies(TEST_TENANT_ID, { limit: 50, offset: 0 });

        expect(mockDiscountPoliciesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.anything(),
        );
      });
    });

    describe('getDiscountPolicy', () => {
      it('should return discount policy by id', async () => {
        const policy = createDiscountPolicyFixture();
        mockDiscountPoliciesRepo.findById.mockResolvedValue(policy);

        const result = await service.getDiscountPolicy(policy.id, TEST_TENANT_ID);

        expect(result).toEqual(policy);
        expect(mockDiscountPoliciesRepo.findById).toHaveBeenCalledWith(policy.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent policy', async () => {
        mockDiscountPoliciesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getDiscountPolicy('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          DiscountPolicyNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockDiscountPoliciesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getDiscountPolicy('dp-1', OTHER_TENANT_ID)).rejects.toThrow(
          DiscountPolicyNotFoundError,
        );
        expect(mockDiscountPoliciesRepo.findById).toHaveBeenCalledWith('dp-1', OTHER_TENANT_ID);
      });
    });

    describe('createDiscountPolicy', () => {
      it('should create discount policy', async () => {
        const input = createDiscountPolicyInputFixture();
        const expected = createDiscountPolicyFixture();

        mockDiscountPoliciesRepo.findMany.mockResolvedValue({
          data: [],
          total: 0,
          limit: 50,
          offset: 0,
        });
        mockDiscountPoliciesRepo.create.mockResolvedValue([expected]);

        const result = await service.createDiscountPolicy(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(mockDiscountPoliciesRepo.create).toHaveBeenCalled();
      });

      it('should reject duplicate policy name', async () => {
        const input = createDiscountPolicyInputFixture({ name: 'Bulk Discount' });
        const existing = createDiscountPolicyFixture({ name: 'Bulk Discount' });

        mockDiscountPoliciesRepo.findMany.mockResolvedValue({
          data: [existing],
          total: 1,
          limit: 50,
          offset: 0,
        });

        await expect(service.createDiscountPolicy(input, TEST_TENANT_ID)).rejects.toThrow(
          DiscountPolicyNameConflictError,
        );
      });

      it('should reject duplicate policy name case-insensitive', async () => {
        const input = createDiscountPolicyInputFixture({ name: 'bulk discount' });
        const existing = createDiscountPolicyFixture({ name: 'Bulk Discount' });

        mockDiscountPoliciesRepo.findMany.mockResolvedValue({
          data: [existing],
          total: 1,
          limit: 50,
          offset: 0,
        });

        await expect(service.createDiscountPolicy(input, TEST_TENANT_ID)).rejects.toThrow(
          DiscountPolicyNameConflictError,
        );
      });

      it('should reject validFrom after validUntil', async () => {
        const input = createDiscountPolicyInputFixture({
          validFrom: '2026-12-31',
          validUntil: '2026-01-01',
        });

        mockDiscountPoliciesRepo.findMany.mockResolvedValue({
          data: [],
          total: 0,
          limit: 50,
          offset: 0,
        });

        await expect(service.createDiscountPolicy(input, TEST_TENANT_ID)).rejects.toThrow(
          'validFrom must be before validUntil',
        );
      });

      it('should allow creating policy without validUntil', async () => {
        const input = createDiscountPolicyInputFixture({ validUntil: undefined });
        const expected = createDiscountPolicyFixture({ validUntil: null });

        mockDiscountPoliciesRepo.findMany.mockResolvedValue({
          data: [],
          total: 0,
          limit: 50,
          offset: 0,
        });
        mockDiscountPoliciesRepo.create.mockResolvedValue([expected]);

        const result = await service.createDiscountPolicy(input, TEST_TENANT_ID);

        expect(result).toBeDefined();
      });
    });

    describe('updateDiscountPolicy', () => {
      it('should update discount policy', async () => {
        const existing = createDiscountPolicyFixture();
        const updated = { ...existing, value: '20.0000' };

        mockDiscountPoliciesRepo.findById.mockResolvedValue(existing);
        mockDiscountPoliciesRepo.update.mockResolvedValue([updated]);

        const result = await service.updateDiscountPolicy(
          existing.id,
          { value: '20.0000' },
          TEST_TENANT_ID,
        );

        expect(result.value).toBe('20.0000');
      });

      it('should throw NotFoundError for non-existent policy', async () => {
        mockDiscountPoliciesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateDiscountPolicy('non-existent', { value: '20' }, TEST_TENANT_ID),
        ).rejects.toThrow(DiscountPolicyNotFoundError);
      });

      it('should reject duplicate name on update', async () => {
        const existing = createDiscountPolicyFixture({ name: 'Policy A' });
        const duplicate = createDiscountPolicyFixture({ id: 'dp-2', name: 'Policy B' });

        mockDiscountPoliciesRepo.findById.mockResolvedValue(existing);
        mockDiscountPoliciesRepo.findMany.mockResolvedValue({
          data: [existing, duplicate],
          total: 2,
          limit: 50,
          offset: 0,
        });

        await expect(
          service.updateDiscountPolicy(existing.id, { name: 'Policy B' }, TEST_TENANT_ID),
        ).rejects.toThrow(DiscountPolicyNameConflictError);
      });

      it('should allow updating name to same value', async () => {
        const existing = createDiscountPolicyFixture({ name: 'Policy A' });
        const updated = { ...existing, name: 'Policy A' };

        mockDiscountPoliciesRepo.findById.mockResolvedValue(existing);
        mockDiscountPoliciesRepo.update.mockResolvedValue([updated]);

        const result = await service.updateDiscountPolicy(
          existing.id,
          { name: 'Policy A' },
          TEST_TENANT_ID,
        );

        expect(result.name).toBe('Policy A');
      });

      it('should reject validFrom after validUntil on update', async () => {
        const existing = createDiscountPolicyFixture({
          validFrom: '2026-01-01',
          validUntil: '2026-12-31',
        });

        mockDiscountPoliciesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateDiscountPolicy(
            existing.id,
            { validFrom: '2026-12-31', validUntil: '2026-01-01' },
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow('validFrom must be before validUntil');
      });

      it('should scope name uniqueness check to tenant', async () => {
        const existing = createDiscountPolicyFixture({ name: 'Policy A' });

        mockDiscountPoliciesRepo.findById.mockResolvedValue(existing);
        // Policy B exists in OTHER tenant
        mockDiscountPoliciesRepo.findMany.mockImplementation(async (_tenantId: string) => {
          if (_tenantId === OTHER_TENANT_ID) {
            return {
              data: [createDiscountPolicyFixture({ name: 'Policy B' })],
              total: 1,
              limit: 50,
              offset: 0,
            };
          }
          return { data: [existing], total: 1, limit: 50, offset: 0 };
        });
        mockDiscountPoliciesRepo.update.mockResolvedValue([{ ...existing, name: 'Policy B' }]);

        const result = await service.updateDiscountPolicy(
          existing.id,
          { name: 'Policy B' },
          TEST_TENANT_ID,
        );

        expect(result.name).toBe('Policy B');
      });
    });

    describe('deleteDiscountPolicy', () => {
      it('should delete discount policy', async () => {
        const existing = createDiscountPolicyFixture();

        mockDiscountPoliciesRepo.findById.mockResolvedValue(existing);
        mockDiscountPoliciesRepo.delete.mockResolvedValue(undefined);

        await service.deleteDiscountPolicy(existing.id, TEST_TENANT_ID);

        expect(mockDiscountPoliciesRepo.delete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent policy', async () => {
        mockDiscountPoliciesRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteDiscountPolicy('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          DiscountPolicyNotFoundError,
        );
      });

      it('should scope deletion to tenant', async () => {
        mockDiscountPoliciesRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteDiscountPolicy('dp-1', OTHER_TENANT_ID)).rejects.toThrow(
          DiscountPolicyNotFoundError,
        );
        expect(mockDiscountPoliciesRepo.findById).toHaveBeenCalledWith('dp-1', OTHER_TENANT_ID);
      });
    });

    describe('getActiveDiscountPolicies', () => {
      it('should return active discount policies', async () => {
        const policies = [createDiscountPolicyFixture()];
        mockDiscountPoliciesRepo.findActive.mockResolvedValue(policies);

        const result = await service.getActiveDiscountPolicies('2026-07-15', TEST_TENANT_ID);

        expect(result).toEqual(policies);
        expect(mockDiscountPoliciesRepo.findActive).toHaveBeenCalledWith(
          '2026-07-15',
          TEST_TENANT_ID,
          undefined,
        );
      });

      it('should filter by customerId', async () => {
        mockDiscountPoliciesRepo.findActive.mockResolvedValue([]);

        await service.getActiveDiscountPolicies('2026-07-15', TEST_TENANT_ID, 'customer-1');

        expect(mockDiscountPoliciesRepo.findActive).toHaveBeenCalledWith(
          '2026-07-15',
          TEST_TENANT_ID,
          'customer-1',
        );
      });

      it('should return empty when no active policies', async () => {
        mockDiscountPoliciesRepo.findActive.mockResolvedValue([]);

        const result = await service.getActiveDiscountPolicies('2026-07-15', TEST_TENANT_ID);

        expect(result).toHaveLength(0);
      });
    });
  });
});
