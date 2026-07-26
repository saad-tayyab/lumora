import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { testDb, TEST_TENANT_ID, TEST_USER_ID } from '../../lib/integration-test-utils';

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string; status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message); this.code = code; this.status = opts?.status ?? 500;
    }
  },
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));
vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class { connectionString = ''; constructor(_n: string, _c?: unknown) {} },
}));
vi.mock('../../database', () => ({ db: testDb }));

import * as schema from '@lumora/database/schema';
import { eq } from 'drizzle-orm';
import * as service from './service';
import {
  SalesOrderNotFoundError,
  SalesOrderDuplicateNumberError,
  SalesOrderStatusTransitionError,
  SalesOrderAlreadyCancelledError,
  SalesOrderLineItemRequiredError,
  SalesOrderCannotEditNonDraftError,
  QuotationNotFoundError,
  QuotationDuplicateNumberError,
  QuotationStatusTransitionError,
  QuotationAlreadyExpiredError,
  QuotationLineItemRequiredError,
  DiscountPolicyNotFoundError,
  DiscountPolicyNameConflictError,
} from './errors';

const OTHER_TENANT_ID = '33333333-3333-4333-8333-333333333333';

function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

async function cleanupSalesTestData(): Promise<void> {
  try { await testDb.delete(schema.poLineItems).where(eq(schema.poLineItems.tenantId, TEST_TENANT_ID)); } catch {}
  try { await testDb.delete(schema.quotationLineItems).where(eq(schema.quotationLineItems.tenantId, TEST_TENANT_ID)); } catch {}
  try { await testDb.delete(schema.salesOrderLineItems).where(eq(schema.salesOrderLineItems.tenantId, TEST_TENANT_ID)); } catch {}
  try { await testDb.delete(schema.quotations).where(eq(schema.quotations.tenantId, TEST_TENANT_ID)); } catch {}
  try { await testDb.delete(schema.salesOrders).where(eq(schema.salesOrders.tenantId, TEST_TENANT_ID)); } catch {}
  try { await testDb.delete(schema.discountPolicies).where(eq(schema.discountPolicies.tenantId, TEST_TENANT_ID)); } catch {}
  try { await testDb.delete(schema.items).where(eq(schema.items.tenantId, TEST_TENANT_ID)); } catch {}
  try { await testDb.delete(schema.itemCategories).where(eq(schema.itemCategories.tenantId, TEST_TENANT_ID)); } catch {}
  try { await testDb.delete(schema.unitOfMeasures); } catch {}
  try { await testDb.delete(schema.customers).where(eq(schema.customers.tenantId, TEST_TENANT_ID)); } catch {}
}

let customerId: string;
let itemId: string;

async function seedPrerequisites(): Promise<void> {
  await cleanupSalesTestData();

  const [uom] = await testDb
    .insert(schema.unitOfMeasures)
    .values({ code: 'EA', name: 'Each', category: 'count', decimalPlaces: 0 })
    .returning();

  const [cat] = await testDb
    .insert(schema.itemCategories)
    .values({ tenantId: TEST_TENANT_ID, name: 'Test Category', code: 'TEST-CAT', isActive: true })
    .returning();

  const [cust] = await testDb
    .insert(schema.customers)
    .values({
      tenantId: TEST_TENANT_ID,
      name: 'Test Customer',
      email: `sales-svc-${uniqueSuffix()}@example.com`,
      phone: '+1-555-0100',
      addressLine1: '100 Main St',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'USA',
      paymentTerms: 'Net 30',
      creditLimit: '50000.0000',
      isActive: true,
    })
    .returning();

  const [item] = await testDb
    .insert(schema.items)
    .values({
      tenantId: TEST_TENANT_ID,
      sku: `ITEM-SVC-${Date.now()}`,
      name: 'Test Item',
      categoryId: cat.id,
      unitOfMeasureId: uom.id,
      isActive: true,
      createdBy: TEST_USER_ID,
    })
    .returning();

  customerId = cust.id;
  itemId = item.id;
}

function makeOrderInput(overrides: Record<string, unknown> = {}) {
  return {
    orderNumber: `SO-${uniqueSuffix()}`,
    customerId,
    orderDate: '2026-07-25',
    expectedDeliveryDate: '2026-08-10',
    currency: 'USD',
    lineItems: [
      { itemId, description: 'Widget', quantity: '5', unitPrice: '100.0000' },
    ],
    ...overrides,
  };
}

function makeQuotationInput(overrides: Record<string, unknown> = {}) {
  return {
    quotationNumber: `QT-${uniqueSuffix()}`,
    customerId,
    issueDate: '2026-07-25',
    expiryDate: '2026-08-24',
    validDays: 30,
    currency: 'USD',
    lineItems: [
      { itemId, description: 'Quoted Item', quantity: '10', unitPrice: '50.0000' },
    ],
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Sales Order Lifecycle: create → get → update status → list
// ═══════════════════════════════════════════════════════════════════════════════

describe('Sales order lifecycle', () => {
  beforeAll(async () => {
    await seedPrerequisites();
  });

  afterAll(async () => {
    await cleanupSalesTestData();
  });

  it('should create a sales order with calculated line item totals', async () => {
    const order = await service.createSalesOrder(makeOrderInput(), TEST_TENANT_ID);

    expect(order.id).toBeDefined();
    expect(order.status).toBe('draft');
    expect(order.subtotal).toBe('500.0000');
    expect(order.taxAmount).toBe('0.0000');
    expect(order.total).toBe('500.0000');
    expect(order.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should retrieve a sales order by id and verify line items', async () => {
    const created = await service.createSalesOrder(makeOrderInput(), TEST_TENANT_ID);
    const fetched = await service.getSalesOrder(created.id, TEST_TENANT_ID);

    expect(fetched.id).toBe(created.id);
    expect(fetched.orderNumber).toBe(created.orderNumber);

    const lineItems = await service.getSalesOrderLineItems(created.id, TEST_TENANT_ID);
    expect(lineItems).toHaveLength(1);
    expect(lineItems[0].quantity).toBe('5.00');
    expect(lineItems[0].unitPrice).toBe('100.0000');
    expect(lineItems[0].total).toBe('500.0000');
  });

  it('should transition order through draft → confirmed → processing → shipped → delivered → closed', async () => {
    const order = await service.createSalesOrder(makeOrderInput(), TEST_TENANT_ID);

    let updated = await service.updateSalesOrderStatus(order.id, 'confirmed', TEST_TENANT_ID);
    expect(updated.status).toBe('confirmed');

    updated = await service.updateSalesOrderStatus(order.id, 'processing', TEST_TENANT_ID);
    expect(updated.status).toBe('processing');

    updated = await service.updateSalesOrderStatus(order.id, 'shipped', TEST_TENANT_ID);
    expect(updated.status).toBe('shipped');

    updated = await service.updateSalesOrderStatus(order.id, 'delivered', TEST_TENANT_ID);
    expect(updated.status).toBe('delivered');

    updated = await service.updateSalesOrderStatus(order.id, 'closed', TEST_TENANT_ID);
    expect(updated.status).toBe('closed');

    const persisted = await service.getSalesOrder(order.id, TEST_TENANT_ID);
    expect(persisted.status).toBe('closed');
  });

  it('should list sales orders filtered by status', async () => {
    await service.createSalesOrder(makeOrderInput(), TEST_TENANT_ID);
    const draftOrder = await service.createSalesOrder(makeOrderInput(), TEST_TENANT_ID);
    await service.updateSalesOrderStatus(draftOrder.id, 'confirmed', TEST_TENANT_ID);

    const result = await service.listSalesOrders(TEST_TENANT_ID, { status: 'confirmed', limit: 50, offset: 0 });
    expect(result.data.length).toBeGreaterThanOrEqual(1);
    expect(result.data.every((o) => o.status === 'confirmed')).toBe(true);
  });

  it('should reject invalid status transition (draft → shipped)', async () => {
    const order = await service.createSalesOrder(makeOrderInput(), TEST_TENANT_ID);

    await expect(
      service.updateSalesOrderStatus(order.id, 'shipped', TEST_TENANT_ID),
    ).rejects.toThrow(SalesOrderStatusTransitionError);
  });

  it('should reject status update on cancelled order', async () => {
    const order = await service.createSalesOrder(makeOrderInput(), TEST_TENANT_ID);
    await service.updateSalesOrderStatus(order.id, 'cancelled', TEST_TENANT_ID);

    await expect(
      service.updateSalesOrderStatus(order.id, 'confirmed', TEST_TENANT_ID),
    ).rejects.toThrow(SalesOrderAlreadyCancelledError);
  });

  it('should reject duplicate order numbers within same tenant', async () => {
    const num = `DUP-${uniqueSuffix()}`;
    await service.createSalesOrder(makeOrderInput({ orderNumber: num }), TEST_TENANT_ID);

    await expect(
      service.createSalesOrder(makeOrderInput({ orderNumber: num }), TEST_TENANT_ID),
    ).rejects.toThrow(SalesOrderDuplicateNumberError);
  });

  it('should reject order with no line items', async () => {
    await expect(
      service.createSalesOrder(makeOrderInput({ lineItems: [] }), TEST_TENANT_ID),
    ).rejects.toThrow(SalesOrderLineItemRequiredError);
  });

  it('should throw SalesOrderNotFoundError for non-existent id', async () => {
    await expect(
      service.getSalesOrder('00000000-0000-0000-0000-000000000000', TEST_TENANT_ID),
    ).rejects.toThrow(SalesOrderNotFoundError);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Quotation Lifecycle: create → get → update status → list
// ═══════════════════════════════════════════════════════════════════════════════

describe('Quotation lifecycle', () => {
  beforeAll(async () => {
    await seedPrerequisites();
  });

  afterAll(async () => {
    await cleanupSalesTestData();
  });

  it('should create a quotation with calculated totals', async () => {
    const quotation = await service.createQuotation(makeQuotationInput(), TEST_TENANT_ID);

    expect(quotation.id).toBeDefined();
    expect(quotation.status).toBe('draft');
    expect(quotation.subtotal).toBe('500.0000');
    expect(quotation.taxAmount).toBe('0.0000');
    expect(quotation.total).toBe('500.0000');
    expect(quotation.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should retrieve a quotation by id and verify line items', async () => {
    const created = await service.createQuotation(makeQuotationInput(), TEST_TENANT_ID);
    const fetched = await service.getQuotation(created.id, TEST_TENANT_ID);

    expect(fetched.id).toBe(created.id);

    const lineItems = await service.getQuotationLineItems(created.id, TEST_TENANT_ID);
    expect(lineItems).toHaveLength(1);
    expect(lineItems[0].quantity).toBe('10.00');
    expect(lineItems[0].unitPrice).toBe('50.0000');
    expect(lineItems[0].total).toBe('500.0000');
  });

  it('should transition quotation through draft → sent → accepted', async () => {
    const quotation = await service.createQuotation(
      makeQuotationInput({ expiryDate: '2026-12-31' }),
      TEST_TENANT_ID,
    );

    let updated = await service.updateQuotationStatus(quotation.id, 'sent', TEST_TENANT_ID);
    expect(updated.status).toBe('sent');

    updated = await service.updateQuotationStatus(quotation.id, 'accepted', TEST_TENANT_ID);
    expect(updated.status).toBe('accepted');

    const persisted = await service.getQuotation(quotation.id, TEST_TENANT_ID);
    expect(persisted.status).toBe('accepted');
  });

  it('should convert accepted quotation into a sales order', async () => {
    const quotation = await service.createQuotation(
      makeQuotationInput({ expiryDate: '2026-12-31' }),
      TEST_TENANT_ID,
    );
    await service.updateQuotationStatus(quotation.id, 'sent', TEST_TENANT_ID);
    await service.updateQuotationStatus(quotation.id, 'accepted', TEST_TENANT_ID);

    const quotationLineItems = await service.getQuotationLineItems(quotation.id, TEST_TENANT_ID);

    const order = await service.createSalesOrder(
      {
        orderNumber: `SO-CONV-${uniqueSuffix()}`,
        customerId,
        orderDate: '2026-07-25',
        currency: 'USD',
        lineItems: quotationLineItems.map((li) => ({
          itemId: li.itemId,
          description: li.description ?? undefined,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          discountPercent: li.discountPercent ?? undefined,
          taxRate: li.taxRate ?? undefined,
        })),
      },
      TEST_TENANT_ID,
    );

    expect(order.id).toBeDefined();
    expect(order.status).toBe('draft');
    expect(order.total).toBe('500.0000');
  });

  it('should reject invalid quotation status transition (draft → accepted)', async () => {
    const quotation = await service.createQuotation(makeQuotationInput(), TEST_TENANT_ID);

    await expect(
      service.updateQuotationStatus(quotation.id, 'accepted', TEST_TENANT_ID),
    ).rejects.toThrow(QuotationStatusTransitionError);
  });

  it('should reject duplicate quotation numbers', async () => {
    const num = `QT-DUP-${uniqueSuffix()}`;
    await service.createQuotation(makeQuotationInput({ quotationNumber: num }), TEST_TENANT_ID);

    await expect(
      service.createQuotation(makeQuotationInput({ quotationNumber: num }), TEST_TENANT_ID),
    ).rejects.toThrow(QuotationDuplicateNumberError);
  });

  it('should reject quotation with no line items', async () => {
    await expect(
      service.createQuotation(makeQuotationInput({ lineItems: [] }), TEST_TENANT_ID),
    ).rejects.toThrow(QuotationLineItemRequiredError);
  });

  it('should list quotations filtered by customer', async () => {
    await service.createQuotation(makeQuotationInput(), TEST_TENANT_ID);

    const result = await service.listQuotations(TEST_TENANT_ID, { customerId, limit: 50, offset: 0 });
    expect(result.data.length).toBeGreaterThanOrEqual(1);
    expect(result.data.every((q) => q.customerId === customerId)).toBe(true);
  });

  it('should throw QuotationNotFoundError for non-existent id', async () => {
    await expect(
      service.getQuotation('00000000-0000-0000-0000-000000000000', TEST_TENANT_ID),
    ).rejects.toThrow(QuotationNotFoundError);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Discount Policy Lifecycle: create → list → apply → update
// ═══════════════════════════════════════════════════════════════════════════════

describe('Discount policy lifecycle', () => {
  beforeAll(async () => {
    await seedPrerequisites();
  });

  afterAll(async () => {
    await cleanupSalesTestData();
  });

  it('should create a discount policy and retrieve it', async () => {
    const policy = await service.createDiscountPolicy(
      {
        name: `Percent-${uniqueSuffix()}`,
        type: 'percentage',
        value: '10.00',
        validFrom: '2026-07-01',
        validUntil: '2026-12-31',
      },
      TEST_TENANT_ID,
    );

    expect(policy.id).toBeDefined();
    expect(policy.name).toContain('Percent-');
    expect(policy.type).toBe('percentage');
    expect(policy.value).toBe('10.00');

    const fetched = await service.getDiscountPolicy(policy.id, TEST_TENANT_ID);
    expect(fetched.id).toBe(policy.id);
  });

  it('should list discount policies', async () => {
    await service.createDiscountPolicy(
      {
        name: `List-${uniqueSuffix()}`,
        type: 'fixed_amount',
        value: '25.00',
        validFrom: '2026-07-01',
      },
      TEST_TENANT_ID,
    );

    const result = await service.listDiscountPolicies(TEST_TENANT_ID, { limit: 50, offset: 0 });
    expect(result.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should update a discount policy and persist changes', async () => {
    const policy = await service.createDiscountPolicy(
      {
        name: `Upd-${uniqueSuffix()}`,
        type: 'percentage',
        value: '5.00',
        validFrom: '2026-07-01',
      },
      TEST_TENANT_ID,
    );

    const updated = await service.updateDiscountPolicy(
      policy.id,
      { value: '15.00', name: `Renamed-${uniqueSuffix()}` },
      TEST_TENANT_ID,
    );
    expect(updated.value).toBe('15.00');

    const fetched = await service.getDiscountPolicy(policy.id, TEST_TENANT_ID);
    expect(fetched.value).toBe('15.00');
  });

  it('should reject duplicate policy names within same tenant', async () => {
    const name = `DupName-${uniqueSuffix()}`;
    await service.createDiscountPolicy(
      { name, type: 'percentage', value: '10.00', validFrom: '2026-07-01' },
      TEST_TENANT_ID,
    );

    await expect(
      service.createDiscountPolicy(
        { name, type: 'fixed_amount', value: '5.00', validFrom: '2026-07-01' },
        TEST_TENANT_ID,
      ),
    ).rejects.toThrow(DiscountPolicyNameConflictError);
  });

  it('should delete a discount policy', async () => {
    const policy = await service.createDiscountPolicy(
      {
        name: `Del-${uniqueSuffix()}`,
        type: 'tiered',
        value: '20.00',
        validFrom: '2026-07-01',
      },
      TEST_TENANT_ID,
    );

    await service.deleteDiscountPolicy(policy.id, TEST_TENANT_ID);

    await expect(
      service.getDiscountPolicy(policy.id, TEST_TENANT_ID),
    ).rejects.toThrow(DiscountPolicyNotFoundError);
  });

  it('should throw DiscountPolicyNotFoundError for non-existent id', async () => {
    await expect(
      service.getDiscountPolicy('00000000-0000-0000-0000-000000000000', TEST_TENANT_ID),
    ).rejects.toThrow(DiscountPolicyNotFoundError);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Line Item Calculations with Tax and Discounts
// ═══════════════════════════════════════════════════════════════════════════════

describe('Line item calculations', () => {
  beforeAll(async () => {
    await seedPrerequisites();
  });

  afterAll(async () => {
    await cleanupSalesTestData();
  });

  it('should calculate line items with percentage discount and tax', async () => {
    const order = await service.createSalesOrder(
      makeOrderInput({
        lineItems: [
          {
            itemId,
            description: 'Premium Widget',
            quantity: '10',
            unitPrice: '200.0000',
            discountPercent: '0.10',
            taxRate: '0.08',
          },
        ],
      }),
      TEST_TENANT_ID,
    );

    // subtotal = 10 * 200 = 2000, discount = 2000 * 0.10 = 200, net = 1800, tax = 1800 * 0.08 = 144, total = 1944
    expect(order.subtotal).toBe('2000.0000');
    expect(order.discountAmount).toBe('200.0000');
    expect(order.taxAmount).toBe('144.0000');
    expect(order.total).toBe('1944.0000');

    const lineItems = await service.getSalesOrderLineItems(order.id, TEST_TENANT_ID);
    expect(lineItems[0].total).toBe('1944.0000');
  });

  it('should recalculate totals when line item is updated', async () => {
    const order = await service.createSalesOrder(
      makeOrderInput({
        lineItems: [
          { itemId, description: 'Item A', quantity: '2', unitPrice: '100.0000' },
          { itemId, description: 'Item B', quantity: '3', unitPrice: '50.0000' },
        ],
      }),
      TEST_TENANT_ID,
    );

    expect(order.total).toBe('350.0000');

    const lineItems = await service.getSalesOrderLineItems(order.id, TEST_TENANT_ID);
    await service.updateSalesOrderLineItem(
      lineItems[0].id,
      { quantity: '5', unitPrice: '200.0000' },
      TEST_TENANT_ID,
    );

    const updated = await service.getSalesOrder(order.id, TEST_TENANT_ID);
    // 5*200 + 3*50 = 1000 + 150 = 1150
    expect(updated.total).toBe('1150.0000');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Tenant Isolation
// ═══════════════════════════════════════════════════════════════════════════════

describe('Tenant isolation', () => {
  beforeAll(async () => {
    await seedPrerequisites();
  });

  afterAll(async () => {
    await cleanupSalesTestData();
  });

  it('should not expose sales orders from other tenants', async () => {
    const order = await service.createSalesOrder(makeOrderInput(), TEST_TENANT_ID);

    await expect(
      service.getSalesOrder(order.id, OTHER_TENANT_ID),
    ).rejects.toThrow(SalesOrderNotFoundError);
  });

  it('should not expose quotations from other tenants', async () => {
    const quotation = await service.createQuotation(makeQuotationInput(), TEST_TENANT_ID);

    await expect(
      service.getQuotation(quotation.id, OTHER_TENANT_ID),
    ).rejects.toThrow(QuotationNotFoundError);
  });
});
