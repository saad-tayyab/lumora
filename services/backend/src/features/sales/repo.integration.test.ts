import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { testDb, TEST_TENANT_ID } from '../../lib/integration-test-utils';
import * as schema from '@lumora/database/schema';
import * as repos from './repo';
import { eq } from 'drizzle-orm';

vi.mock('../../database', () => ({
  db: testDb,
}));

vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class {
    connectionString = '';
    migrations = {};
  },
}));

vi.mock('encore.dev/api', () => ({
  Gateway: class {},
  APIError: class extends Error {
    constructor(public readonly code: string, message: string) {
      super(message);
    }
  },
  Err: class {
    constructor(public readonly code: string, public readonly message: string) {}
  },
  api: vi.fn(),
}));

const OTHER_TENANT_ID = '33333333-3333-4333-8333-333333333333';
const OTHER_CUSTOMER_ID = '00000000-0000-0000-0000-00000000ffff';
const OTHER_ITEM_ID = '00000000-0000-0000-0000-00000000fffe';

let customerId: string;
let itemId: string;
let otherTenantCustomerId: string;
let otherTenantItemId: string;

async function cleanupSalesTestData(): Promise<void> {
  await testDb.delete(schema.quotationLineItems).where(eq(schema.quotationLineItems.tenantId, TEST_TENANT_ID));
  await testDb.delete(schema.salesOrderLineItems).where(eq(schema.salesOrderLineItems.tenantId, TEST_TENANT_ID));
  await testDb.delete(schema.quotations).where(eq(schema.quotations.tenantId, TEST_TENANT_ID));
  await testDb.delete(schema.salesOrders).where(eq(schema.salesOrders.tenantId, TEST_TENANT_ID));
  await testDb.delete(schema.discountPolicies).where(eq(schema.discountPolicies.tenantId, TEST_TENANT_ID));
  await testDb.delete(schema.items).where(eq(schema.items.tenantId, TEST_TENANT_ID));
  await testDb.delete(schema.itemCategories).where(eq(schema.itemCategories.tenantId, TEST_TENANT_ID));
  await testDb.delete(schema.unitOfMeasures);
  await testDb.delete(schema.customers).where(eq(schema.customers.tenantId, TEST_TENANT_ID));

  await testDb.delete(schema.quotationLineItems).where(eq(schema.quotationLineItems.tenantId, OTHER_TENANT_ID));
  await testDb.delete(schema.salesOrderLineItems).where(eq(schema.salesOrderLineItems.tenantId, OTHER_TENANT_ID));
  await testDb.delete(schema.quotations).where(eq(schema.quotations.tenantId, OTHER_TENANT_ID));
  await testDb.delete(schema.salesOrders).where(eq(schema.salesOrders.tenantId, OTHER_TENANT_ID));
  await testDb.delete(schema.discountPolicies).where(eq(schema.discountPolicies.tenantId, OTHER_TENANT_ID));
  await testDb.delete(schema.items).where(eq(schema.items.tenantId, OTHER_TENANT_ID));
  await testDb.delete(schema.itemCategories).where(eq(schema.itemCategories.tenantId, OTHER_TENANT_ID));
  await testDb.delete(schema.customers).where(eq(schema.customers.tenantId, OTHER_TENANT_ID));
}

async function seedPrerequisites(): Promise<void> {
  const [uom] = await testDb
    .insert(schema.unitOfMeasures)
    .values({
      code: 'EA',
      name: 'Each',
      category: 'count',
      decimalPlaces: 0,
    })
    .returning();

  const [cat] = await testDb
    .insert(schema.itemCategories)
    .values({
      tenantId: TEST_TENANT_ID,
      name: 'Test Category',
      code: 'TEST-CAT',
      isActive: true,
    })
    .returning();

  const [cust] = await testDb
    .insert(schema.customers)
    .values({
      tenantId: TEST_TENANT_ID,
      name: 'Test Customer',
      email: 'sales-test@example.com',
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
      sku: `ITEM-SALES-${Date.now()}`,
      name: 'Test Item',
      categoryId: cat.id,
      unitOfMeasureId: uom.id,
      isActive: true,
    })
    .returning();

  customerId = cust.id;
  itemId = item.id;

  const [otherCat] = await testDb
    .insert(schema.itemCategories)
    .values({
      tenantId: OTHER_TENANT_ID,
      name: 'Other Category',
      code: 'OTHER-CAT',
      isActive: true,
    })
    .returning();

  const [otherCust] = await testDb
    .insert(schema.customers)
    .values({
      tenantId: OTHER_TENANT_ID,
      name: 'Other Customer',
      email: 'other-tenant@example.com',
      paymentTerms: 'Net 30',
      creditLimit: '10000.0000',
      isActive: true,
    })
    .returning();

  const [otherItem] = await testDb
    .insert(schema.items)
    .values({
      tenantId: OTHER_TENANT_ID,
      sku: `ITEM-OTHER-${Date.now()}`,
      name: 'Other Item',
      categoryId: otherCat.id,
      unitOfMeasureId: uom.id,
      isActive: true,
    })
    .returning();

  otherTenantCustomerId = otherCust.id;
  otherTenantItemId = otherItem.id;
}

function makeSalesOrderInput(overrides: Record<string, unknown> = {}) {
  return {
    orderNumber: `SO-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    customerId,
    status: 'draft' as const,
    orderDate: '2026-07-25',
    expectedDeliveryDate: '2026-08-10',
    subtotal: '1000.0000',
    discountAmount: '50.0000',
    taxAmount: '95.0000',
    total: '1045.0000',
    currency: 'USD',
    notes: 'Test order',
    ...overrides,
  };
}

function makeSalesOrderLineItemInput(salesOrderId: string, overrides: Record<string, unknown> = {}) {
  return {
    salesOrderId,
    itemId,
    description: 'Line Item',
    quantity: '10',
    unitPrice: '100.0000',
    total: '1000.0000',
    ...overrides,
  };
}

function makeQuotationInput(overrides: Record<string, unknown> = {}) {
  return {
    quotationNumber: `QT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    customerId,
    status: 'draft' as const,
    issueDate: '2026-07-25',
    expiryDate: '2026-08-24',
    subtotal: '500.0000',
    discountAmount: '25.0000',
    taxAmount: '47.5000',
    total: '522.5000',
    currency: 'USD',
    validDays: 30,
    notes: 'Test quotation',
    ...overrides,
  };
}

function makeQuotationLineItemInput(quotationId: string, overrides: Record<string, unknown> = {}) {
  return {
    quotationId,
    itemId,
    description: 'Quotation Line',
    quantity: '5',
    unitPrice: '100.0000',
    total: '500.0000',
    ...overrides,
  };
}

function makeDiscountPolicyInput(overrides: Record<string, unknown> = {}) {
  return {
    name: `Discount-${Date.now()}`,
    type: 'percentage',
    value: '10.00',
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sales Orders Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('salesOrdersRepository', () => {
  beforeAll(async () => {
    await cleanupSalesTestData();
    await seedPrerequisites();
  });

  afterAll(async () => {
    await cleanupSalesTestData();
  });

  it('should create a sales order and return it', async () => {
    const input = makeSalesOrderInput();
    const [created] = await repos.salesOrdersRepository.create(input, TEST_TENANT_ID);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.customerId).toBe(customerId);
    expect(created.status).toBe('draft');
    expect(created.total).toBe('1045.0000');
    expect(created.currency).toBe('USD');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should find a sales order by id', async () => {
    const input = makeSalesOrderInput({ orderNumber: `SO-FIND-${Date.now()}` });
    const [created] = await repos.salesOrdersRepository.create(input, TEST_TENANT_ID);

    const found = await repos.salesOrdersRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.orderNumber).toBe(input.orderNumber);
  });

  it('should return undefined for non-existent sales order id', async () => {
    const found = await repos.salesOrdersRepository.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should isolate tenants and not return order from another tenant', async () => {
    const input = makeSalesOrderInput({ orderNumber: `SO-TENANT-${Date.now()}` });
    const [created] = await repos.salesOrdersRepository.create(input, TEST_TENANT_ID);

    const found = await repos.salesOrdersRepository.findById(created.id, OTHER_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should find a sales order by order number', async () => {
    const orderNumber = `SO-NUM-${Date.now()}`;
    await repos.salesOrdersRepository.create(
      makeSalesOrderInput({ orderNumber }),
      TEST_TENANT_ID,
    );

    const found = await repos.salesOrdersRepository.findByOrderNumber(orderNumber, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.orderNumber).toBe(orderNumber);
  });

  it('should return undefined for non-existent order number', async () => {
    const found = await repos.salesOrdersRepository.findByOrderNumber(
      'NO-SUCH-ORDER',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should update a sales order', async () => {
    const input = makeSalesOrderInput({ orderNumber: `SO-UPDATE-${Date.now()}` });
    const [created] = await repos.salesOrdersRepository.create(input, TEST_TENANT_ID);

    const updated = await repos.salesOrdersRepository.update(created.id, TEST_TENANT_ID, {
      status: 'confirmed',
      notes: 'Updated notes',
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].status).toBe('confirmed');
    expect(updated[0].notes).toBe('Updated notes');
  });

  it('should return empty array when updating non-existent sales order', async () => {
    const result = await repos.salesOrdersRepository.update(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
      { status: 'confirmed' },
    );
    expect(result).toHaveLength(0);
  });

  it('should delete a sales order', async () => {
    const input = makeSalesOrderInput({ orderNumber: `SO-DELETE-${Date.now()}` });
    const [created] = await repos.salesOrdersRepository.create(input, TEST_TENANT_ID);

    const deleted = await repos.salesOrdersRepository.delete(created.id, TEST_TENANT_ID);
    expect(deleted).toHaveLength(1);

    const found = await repos.salesOrdersRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should find many sales orders with default pagination', async () => {
    const result = await repos.salesOrdersRepository.findMany(TEST_TENANT_ID);
    expect(result.data).toBeDefined();
    expect(result.limit).toBe(50);
    expect(result.offset).toBe(0);
    expect(typeof result.total).toBe('number');
  });

  it('should find many sales orders with custom pagination', async () => {
    const prefix = `SO-PAGE-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      await repos.salesOrdersRepository.create(
        makeSalesOrderInput({ orderNumber: `${prefix}-${i}` }),
        TEST_TENANT_ID,
      );
    }

    const page1 = await repos.salesOrdersRepository.findMany(TEST_TENANT_ID, {
      limit: 2,
      offset: 0,
    });
    expect(page1.data.length).toBeLessThanOrEqual(2);
    expect(page1.limit).toBe(2);
    expect(page1.offset).toBe(0);

    const page2 = await repos.salesOrdersRepository.findMany(TEST_TENANT_ID, {
      limit: 2,
      offset: 2,
    });
    expect(page2.offset).toBe(2);
  });

  it('should filter sales orders by customer id', async () => {
    const prefix = `SO-CUST-${Date.now()}`;
    const [otherCust] = await testDb
      .insert(schema.customers)
      .values({
        tenantId: TEST_TENANT_ID,
        name: 'Filter Customer',
        email: `${prefix}@example.com`,
        paymentTerms: 'Net 30',
        creditLimit: '10000.0000',
        isActive: true,
      })
      .returning();

    await repos.salesOrdersRepository.create(
      makeSalesOrderInput({ orderNumber: `${prefix}-MINE`, customerId }),
      TEST_TENANT_ID,
    );
    await repos.salesOrdersRepository.create(
      makeSalesOrderInput({ orderNumber: `${prefix}-OTHER`, customerId: otherCust.id }),
      TEST_TENANT_ID,
    );

    const mine = await repos.salesOrdersRepository.findMany(TEST_TENANT_ID, { customerId });
    const allMine = mine.data.every((o) => o.customerId === customerId);
    expect(allMine).toBe(true);
  });

  it('should filter sales orders by status', async () => {
    const prefix = `SO-STATUS-${Date.now()}`;
    await repos.salesOrdersRepository.create(
      makeSalesOrderInput({ orderNumber: `${prefix}-DRAFT`, status: 'draft' }),
      TEST_TENANT_ID,
    );
    await repos.salesOrdersRepository.create(
      makeSalesOrderInput({ orderNumber: `${prefix}-SHIPPED`, status: 'shipped' }),
      TEST_TENANT_ID,
    );

    const drafts = await repos.salesOrdersRepository.findMany(TEST_TENANT_ID, {
      status: 'draft',
    });
    const allDraft = drafts.data.every((o) => o.status === 'draft');
    expect(allDraft).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Sales Order Line Items Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('salesOrderLineItemsRepository', () => {
  let salesOrderId: string;

  beforeAll(async () => {
    await cleanupSalesTestData();
    await seedPrerequisites();
    const [order] = await repos.salesOrdersRepository.create(
      makeSalesOrderInput({ orderNumber: `SO-LINE-PARENT-${Date.now()}` }),
      TEST_TENANT_ID,
    );
    salesOrderId = order.id;
  });

  afterAll(async () => {
    await cleanupSalesTestData();
  });

  it('should create a line item and return it', async () => {
    const input = makeSalesOrderLineItemInput(salesOrderId, { description: 'Widget A' });
    const [created] = await repos.salesOrderLineItemsRepository.create(input, TEST_TENANT_ID);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.salesOrderId).toBe(salesOrderId);
    expect(created.itemId).toBe(itemId);
    expect(created.description).toBe('Widget A');
    expect(created.quantity).toBe('10');
    expect(created.unitPrice).toBe('100.0000');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should find a line item by id', async () => {
    const input = makeSalesOrderLineItemInput(salesOrderId, { description: 'Find Me' });
    const [created] = await repos.salesOrderLineItemsRepository.create(input, TEST_TENANT_ID);

    const found = await repos.salesOrderLineItemsRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.description).toBe('Find Me');
  });

  it('should return undefined for non-existent line item id', async () => {
    const found = await repos.salesOrderLineItemsRepository.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should find line items by sales order id', async () => {
    const prefix = `SO-LINE-FIND-${Date.now()}`;
    await repos.salesOrderLineItemsRepository.create(
      makeSalesOrderLineItemInput(salesOrderId, { description: `${prefix}-A` }),
      TEST_TENANT_ID,
    );
    await repos.salesOrderLineItemsRepository.create(
      makeSalesOrderLineItemInput(salesOrderId, { description: `${prefix}-B` }),
      TEST_TENANT_ID,
    );

    const items = await repos.salesOrderLineItemsRepository.findBySalesOrderId(
      salesOrderId,
      TEST_TENANT_ID,
    );
    expect(items.length).toBeGreaterThanOrEqual(2);
    items.forEach((item) => {
      expect(item.salesOrderId).toBe(salesOrderId);
    });
  });

  it('should return empty array for order with no line items', async () => {
    const [emptyOrder] = await repos.salesOrdersRepository.create(
      makeSalesOrderInput({ orderNumber: `SO-EMPTY-${Date.now()}` }),
      TEST_TENANT_ID,
    );
    const items = await repos.salesOrderLineItemsRepository.findBySalesOrderId(
      emptyOrder.id,
      TEST_TENANT_ID,
    );
    expect(items).toHaveLength(0);
  });

  it('should create many line items at once', async () => {
    const prefix = `SO-LINE-MANY-${Date.now()}`;
    const items = [
      makeSalesOrderLineItemInput(salesOrderId, { description: `${prefix}-Item-1` }),
      makeSalesOrderLineItemInput(salesOrderId, { description: `${prefix}-Item-2` }),
      makeSalesOrderLineItemInput(salesOrderId, { description: `${prefix}-Item-3` }),
    ];

    const created = await repos.salesOrderLineItemsRepository.createMany(items, TEST_TENANT_ID);
    expect(created).toHaveLength(3);
    created.forEach((item) => {
      expect(item.salesOrderId).toBe(salesOrderId);
    });
  });

  it('should update a line item', async () => {
    const input = makeSalesOrderLineItemInput(salesOrderId, { description: 'Update Me' });
    const [created] = await repos.salesOrderLineItemsRepository.create(input, TEST_TENANT_ID);

    const updated = await repos.salesOrderLineItemsRepository.update(created.id, TEST_TENANT_ID, {
      description: 'Updated Description',
      quantity: '20',
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].description).toBe('Updated Description');
    expect(updated[0].quantity).toBe('20');
  });

  it('should return empty array when updating non-existent line item', async () => {
    const result = await repos.salesOrderLineItemsRepository.update(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
      { description: 'Ghost' },
    );
    expect(result).toHaveLength(0);
  });

  it('should delete a line item by id', async () => {
    const input = makeSalesOrderLineItemInput(salesOrderId, { description: 'Delete Me' });
    const [created] = await repos.salesOrderLineItemsRepository.create(input, TEST_TENANT_ID);

    const deleted = await repos.salesOrderLineItemsRepository.delete(created.id, TEST_TENANT_ID);
    expect(deleted).toHaveLength(1);

    const found = await repos.salesOrderLineItemsRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should delete all line items by sales order id', async () => {
    const [targetOrder] = await repos.salesOrdersRepository.create(
      makeSalesOrderInput({ orderNumber: `SO-DELBY-${Date.now()}` }),
      TEST_TENANT_ID,
    );

    await repos.salesOrderLineItemsRepository.createMany(
      [
        makeSalesOrderLineItemInput(targetOrder.id, { description: 'Del-A' }),
        makeSalesOrderLineItemInput(targetOrder.id, { description: 'Del-B' }),
      ],
      TEST_TENANT_ID,
    );

    await repos.salesOrderLineItemsRepository.deleteBySalesOrderId(targetOrder.id, TEST_TENANT_ID);

    const remaining = await repos.salesOrderLineItemsRepository.findBySalesOrderId(
      targetOrder.id,
      TEST_TENANT_ID,
    );
    expect(remaining).toHaveLength(0);
  });

  it('should isolate line items by tenant', async () => {
    const [otherOrder] = await repos.salesOrdersRepository.create(
      makeSalesOrderInput({ orderNumber: `SO-TENANT-LINE-${Date.now()}` }),
      TEST_TENANT_ID,
    );
    const input = makeSalesOrderLineItemInput(otherOrder.id, { description: 'Tenant Test' });
    const [created] = await repos.salesOrderLineItemsRepository.create(input, TEST_TENANT_ID);

    const found = await repos.salesOrderLineItemsRepository.findById(
      created.id,
      OTHER_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should persist tax and discount fields on line item', async () => {
    const input = makeSalesOrderLineItemInput(salesOrderId, {
      description: 'Tax Line',
      discountPercent: '5.00',
      discountAmount: '50.0000',
      taxRate: '0.1000',
      taxAmount: '95.0000',
    });
    const [created] = await repos.salesOrderLineItemsRepository.create(input, TEST_TENANT_ID);

    expect(created.discountPercent).toBe('5.00');
    expect(created.discountAmount).toBe('50.0000');
    expect(created.taxRate).toBe('0.1000');
    expect(created.taxAmount).toBe('95.0000');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Quotations Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('quotationsRepository', () => {
  beforeAll(async () => {
    await cleanupSalesTestData();
    await seedPrerequisites();
  });

  afterAll(async () => {
    await cleanupSalesTestData();
  });

  it('should create a quotation and return it', async () => {
    const input = makeQuotationInput();
    const [created] = await repos.quotationsRepository.create(input, TEST_TENANT_ID);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.customerId).toBe(customerId);
    expect(created.status).toBe('draft');
    expect(created.total).toBe('522.5000');
    expect(created.currency).toBe('USD');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should find a quotation by id', async () => {
    const input = makeQuotationInput({ quotationNumber: `QT-FIND-${Date.now()}` });
    const [created] = await repos.quotationsRepository.create(input, TEST_TENANT_ID);

    const found = await repos.quotationsRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.quotationNumber).toBe(input.quotationNumber);
  });

  it('should return undefined for non-existent quotation id', async () => {
    const found = await repos.quotationsRepository.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should isolate tenants and not return quotation from another tenant', async () => {
    const input = makeQuotationInput({ quotationNumber: `QT-TENANT-${Date.now()}` });
    const [created] = await repos.quotationsRepository.create(input, TEST_TENANT_ID);

    const found = await repos.quotationsRepository.findById(created.id, OTHER_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should find a quotation by quotation number', async () => {
    const quotationNumber = `QT-NUM-${Date.now()}`;
    await repos.quotationsRepository.create(
      makeQuotationInput({ quotationNumber }),
      TEST_TENANT_ID,
    );

    const found = await repos.quotationsRepository.findByQuotationNumber(
      quotationNumber,
      TEST_TENANT_ID,
    );
    expect(found).toBeDefined();
    expect(found!.quotationNumber).toBe(quotationNumber);
  });

  it('should return undefined for non-existent quotation number', async () => {
    const found = await repos.quotationsRepository.findByQuotationNumber(
      'NO-SUCH-QUOTE',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should update a quotation', async () => {
    const input = makeQuotationInput({ quotationNumber: `QT-UPDATE-${Date.now()}` });
    const [created] = await repos.quotationsRepository.create(input, TEST_TENANT_ID);

    const updated = await repos.quotationsRepository.update(created.id, TEST_TENANT_ID, {
      status: 'sent',
      notes: 'Updated quotation',
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].status).toBe('sent');
    expect(updated[0].notes).toBe('Updated quotation');
  });

  it('should return empty array when updating non-existent quotation', async () => {
    const result = await repos.quotationsRepository.update(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
      { status: 'sent' },
    );
    expect(result).toHaveLength(0);
  });

  it('should delete a quotation', async () => {
    const input = makeQuotationInput({ quotationNumber: `QT-DELETE-${Date.now()}` });
    const [created] = await repos.quotationsRepository.create(input, TEST_TENANT_ID);

    const deleted = await repos.quotationsRepository.delete(created.id, TEST_TENANT_ID);
    expect(deleted).toHaveLength(1);

    const found = await repos.quotationsRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should find many quotations with default pagination', async () => {
    const result = await repos.quotationsRepository.findMany(TEST_TENANT_ID);
    expect(result.data).toBeDefined();
    expect(result.limit).toBe(50);
    expect(result.offset).toBe(0);
    expect(typeof result.total).toBe('number');
  });

  it('should find many quotations with custom pagination', async () => {
    const prefix = `QT-PAGE-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      await repos.quotationsRepository.create(
        makeQuotationInput({ quotationNumber: `${prefix}-${i}` }),
        TEST_TENANT_ID,
      );
    }

    const page1 = await repos.quotationsRepository.findMany(TEST_TENANT_ID, {
      limit: 2,
      offset: 0,
    });
    expect(page1.data.length).toBeLessThanOrEqual(2);
    expect(page1.limit).toBe(2);

    const page2 = await repos.quotationsRepository.findMany(TEST_TENANT_ID, {
      limit: 2,
      offset: 2,
    });
    expect(page2.offset).toBe(2);
  });

  it('should filter quotations by customer id', async () => {
    const prefix = `QT-CUST-${Date.now()}`;
    const [otherCust] = await testDb
      .insert(schema.customers)
      .values({
        tenantId: TEST_TENANT_ID,
        name: 'Quote Filter Customer',
        email: `${prefix}@example.com`,
        paymentTerms: 'Net 30',
        creditLimit: '10000.0000',
        isActive: true,
      })
      .returning();

    await repos.quotationsRepository.create(
      makeQuotationInput({ quotationNumber: `${prefix}-MINE`, customerId }),
      TEST_TENANT_ID,
    );
    await repos.quotationsRepository.create(
      makeQuotationInput({ quotationNumber: `${prefix}-OTHER`, customerId: otherCust.id }),
      TEST_TENANT_ID,
    );

    const mine = await repos.quotationsRepository.findMany(TEST_TENANT_ID, { customerId });
    const allMine = mine.data.every((q) => q.customerId === customerId);
    expect(allMine).toBe(true);
  });

  it('should filter quotations by status', async () => {
    const prefix = `QT-STATUS-${Date.now()}`;
    await repos.quotationsRepository.create(
      makeQuotationInput({ quotationNumber: `${prefix}-DRAFT`, status: 'draft' }),
      TEST_TENANT_ID,
    );
    await repos.quotationsRepository.create(
      makeQuotationInput({ quotationNumber: `${prefix}-ACCEPTED`, status: 'accepted' }),
      TEST_TENANT_ID,
    );

    const drafts = await repos.quotationsRepository.findMany(TEST_TENANT_ID, {
      status: 'draft',
    });
    const allDraft = drafts.data.every((q) => q.status === 'draft');
    expect(allDraft).toBe(true);
  });

  it('should find expired quotations', async () => {
    const prefix = `QT-EXP-${Date.now()}`;
    await repos.quotationsRepository.create(
      makeQuotationInput({
        quotationNumber: `${prefix}-SENT`,
        status: 'sent',
        issueDate: '2026-01-01',
        expiryDate: '2026-06-01',
      }),
      TEST_TENANT_ID,
    );
    await repos.quotationsRepository.create(
      makeQuotationInput({
        quotationNumber: `${prefix}-DRAFT`,
        status: 'draft',
        issueDate: '2026-01-01',
        expiryDate: '2026-06-01',
      }),
      TEST_TENANT_ID,
    );

    const expired = await repos.quotationsRepository.findExpired('2026-07-25', TEST_TENANT_ID);
    const allSent = expired.every((q) => q.status === 'sent');
    expect(allSent).toBe(true);
    expired.forEach((q) => {
      expect(q.expiryDate <= '2026-07-25').toBe(true);
    });
  });

  it('should not return non-expired quotations from findExpired', async () => {
    const prefix = `QT-NOTEXP-${Date.now()}`;
    await repos.quotationsRepository.create(
      makeQuotationInput({
        quotationNumber: `${prefix}-FUTURE`,
        status: 'sent',
        issueDate: '2026-07-01',
        expiryDate: '2026-12-31',
      }),
      TEST_TENANT_ID,
    );

    const expired = await repos.quotationsRepository.findExpired('2026-07-25', TEST_TENANT_ID);
    const notFound = expired.find((q) => q.quotationNumber === `${prefix}-FUTURE`);
    expect(notFound).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Quotation Line Items Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('quotationLineItemsRepository', () => {
  let quotationId: string;

  beforeAll(async () => {
    await cleanupSalesTestData();
    await seedPrerequisites();
    const [quote] = await repos.quotationsRepository.create(
      makeQuotationInput({ quotationNumber: `QT-LINE-PARENT-${Date.now()}` }),
      TEST_TENANT_ID,
    );
    quotationId = quote.id;
  });

  afterAll(async () => {
    await cleanupSalesTestData();
  });

  it('should create a quotation line item and return it', async () => {
    const input = makeQuotationLineItemInput(quotationId, { description: 'Quote Widget' });
    const [created] = await repos.quotationLineItemsRepository.create(input, TEST_TENANT_ID);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.quotationId).toBe(quotationId);
    expect(created.itemId).toBe(itemId);
    expect(created.description).toBe('Quote Widget');
    expect(created.quantity).toBe('5');
    expect(created.unitPrice).toBe('100.0000');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should find a quotation line item by id', async () => {
    const input = makeQuotationLineItemInput(quotationId, { description: 'Find Quote Line' });
    const [created] = await repos.quotationLineItemsRepository.create(input, TEST_TENANT_ID);

    const found = await repos.quotationLineItemsRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.description).toBe('Find Quote Line');
  });

  it('should return undefined for non-existent quotation line item id', async () => {
    const found = await repos.quotationLineItemsRepository.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should find quotation line items by quotation id', async () => {
    const prefix = `QT-LINE-FIND-${Date.now()}`;
    await repos.quotationLineItemsRepository.create(
      makeQuotationLineItemInput(quotationId, { description: `${prefix}-A` }),
      TEST_TENANT_ID,
    );
    await repos.quotationLineItemsRepository.create(
      makeQuotationLineItemInput(quotationId, { description: `${prefix}-B` }),
      TEST_TENANT_ID,
    );

    const items = await repos.quotationLineItemsRepository.findByQuotationId(
      quotationId,
      TEST_TENANT_ID,
    );
    expect(items.length).toBeGreaterThanOrEqual(2);
    items.forEach((item) => {
      expect(item.quotationId).toBe(quotationId);
    });
  });

  it('should return empty array for quotation with no line items', async () => {
    const [emptyQuote] = await repos.quotationsRepository.create(
      makeQuotationInput({ quotationNumber: `QT-EMPTY-${Date.now()}` }),
      TEST_TENANT_ID,
    );
    const items = await repos.quotationLineItemsRepository.findByQuotationId(
      emptyQuote.id,
      TEST_TENANT_ID,
    );
    expect(items).toHaveLength(0);
  });

  it('should create many quotation line items at once', async () => {
    const prefix = `QT-LINE-MANY-${Date.now()}`;
    const items = [
      makeQuotationLineItemInput(quotationId, { description: `${prefix}-Item-1` }),
      makeQuotationLineItemInput(quotationId, { description: `${prefix}-Item-2` }),
      makeQuotationLineItemInput(quotationId, { description: `${prefix}-Item-3` }),
    ];

    const created = await repos.quotationLineItemsRepository.createMany(items, TEST_TENANT_ID);
    expect(created).toHaveLength(3);
    created.forEach((item) => {
      expect(item.quotationId).toBe(quotationId);
    });
  });

  it('should update a quotation line item', async () => {
    const input = makeQuotationLineItemInput(quotationId, { description: 'Update Quote Line' });
    const [created] = await repos.quotationLineItemsRepository.create(input, TEST_TENANT_ID);

    const updated = await repos.quotationLineItemsRepository.update(created.id, TEST_TENANT_ID, {
      description: 'Updated Quote Line',
      quantity: '15',
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].description).toBe('Updated Quote Line');
    expect(updated[0].quantity).toBe('15');
  });

  it('should return empty array when updating non-existent quotation line item', async () => {
    const result = await repos.quotationLineItemsRepository.update(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
      { description: 'Ghost' },
    );
    expect(result).toHaveLength(0);
  });

  it('should delete a quotation line item by id', async () => {
    const input = makeQuotationLineItemInput(quotationId, { description: 'Delete Quote Line' });
    const [created] = await repos.quotationLineItemsRepository.create(input, TEST_TENANT_ID);

    const deleted = await repos.quotationLineItemsRepository.delete(created.id, TEST_TENANT_ID);
    expect(deleted).toHaveLength(1);

    const found = await repos.quotationLineItemsRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should delete all line items by quotation id', async () => {
    const [targetQuote] = await repos.quotationsRepository.create(
      makeQuotationInput({ quotationNumber: `QT-DELBY-${Date.now()}` }),
      TEST_TENANT_ID,
    );

    await repos.quotationLineItemsRepository.createMany(
      [
        makeQuotationLineItemInput(targetQuote.id, { description: 'Del-A' }),
        makeQuotationLineItemInput(targetQuote.id, { description: 'Del-B' }),
      ],
      TEST_TENANT_ID,
    );

    await repos.quotationLineItemsRepository.deleteByQuotationId(targetQuote.id, TEST_TENANT_ID);

    const remaining = await repos.quotationLineItemsRepository.findByQuotationId(
      targetQuote.id,
      TEST_TENANT_ID,
    );
    expect(remaining).toHaveLength(0);
  });

  it('should isolate quotation line items by tenant', async () => {
    const [otherQuote] = await repos.quotationsRepository.create(
      makeQuotationInput({ quotationNumber: `QT-TENANT-LINE-${Date.now()}` }),
      TEST_TENANT_ID,
    );
    const input = makeQuotationLineItemInput(otherQuote.id, { description: 'Tenant Quote Line' });
    const [created] = await repos.quotationLineItemsRepository.create(input, TEST_TENANT_ID);

    const found = await repos.quotationLineItemsRepository.findById(
      created.id,
      OTHER_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should persist tax and discount fields on quotation line item', async () => {
    const input = makeQuotationLineItemInput(quotationId, {
      description: 'Tax Quote Line',
      discountPercent: '10.00',
      discountAmount: '50.0000',
      taxRate: '0.0800',
      taxAmount: '36.0000',
    });
    const [created] = await repos.quotationLineItemsRepository.create(input, TEST_TENANT_ID);

    expect(created.discountPercent).toBe('10.00');
    expect(created.discountAmount).toBe('50.0000');
    expect(created.taxRate).toBe('0.0800');
    expect(created.taxAmount).toBe('36.0000');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Discount Policies Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('discountPoliciesRepository', () => {
  beforeAll(async () => {
    await cleanupSalesTestData();
    await seedPrerequisites();
  });

  afterAll(async () => {
    await cleanupSalesTestData();
  });

  it('should create a discount policy and return it', async () => {
    const input = makeDiscountPolicyInput({ name: 'Test Discount' });
    const [created] = await repos.discountPoliciesRepository.create(input, TEST_TENANT_ID);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Test Discount');
    expect(created.type).toBe('percentage');
    expect(created.value).toBe('10.00');
    expect(created.validFrom).toBe('2026-01-01');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should find a discount policy by id', async () => {
    const input = makeDiscountPolicyInput({ name: 'Find Discount' });
    const [created] = await repos.discountPoliciesRepository.create(input, TEST_TENANT_ID);

    const found = await repos.discountPoliciesRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.name).toBe('Find Discount');
  });

  it('should return undefined for non-existent discount policy id', async () => {
    const found = await repos.discountPoliciesRepository.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should isolate tenants and not return discount policy from another tenant', async () => {
    const input = makeDiscountPolicyInput({ name: 'Tenant Discount' });
    const [created] = await repos.discountPoliciesRepository.create(input, TEST_TENANT_ID);

    const found = await repos.discountPoliciesRepository.findById(created.id, OTHER_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should update a discount policy', async () => {
    const input = makeDiscountPolicyInput({ name: 'Update Discount' });
    const [created] = await repos.discountPoliciesRepository.create(input, TEST_TENANT_ID);

    const updated = await repos.discountPoliciesRepository.update(created.id, TEST_TENANT_ID, {
      name: 'Updated Discount',
      value: '20.00',
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].name).toBe('Updated Discount');
    expect(updated[0].value).toBe('20.00');
  });

  it('should return empty array when updating non-existent discount policy', async () => {
    const result = await repos.discountPoliciesRepository.update(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
      { name: 'Ghost' },
    );
    expect(result).toHaveLength(0);
  });

  it('should delete a discount policy', async () => {
    const input = makeDiscountPolicyInput({ name: 'Delete Discount' });
    const [created] = await repos.discountPoliciesRepository.create(input, TEST_TENANT_ID);

    const deleted = await repos.discountPoliciesRepository.delete(created.id, TEST_TENANT_ID);
    expect(deleted).toHaveLength(1);

    const found = await repos.discountPoliciesRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should find many discount policies with default pagination', async () => {
    const result = await repos.discountPoliciesRepository.findMany(TEST_TENANT_ID);
    expect(result.data).toBeDefined();
    expect(result.limit).toBe(50);
    expect(result.offset).toBe(0);
    expect(typeof result.total).toBe('number');
  });

  it('should find many discount policies with custom pagination', async () => {
    const prefix = `DP-PAGE-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      await repos.discountPoliciesRepository.create(
        makeDiscountPolicyInput({ name: `${prefix}-${i}` }),
        TEST_TENANT_ID,
      );
    }

    const page1 = await repos.discountPoliciesRepository.findMany(TEST_TENANT_ID, {
      limit: 2,
      offset: 0,
    });
    expect(page1.data.length).toBeLessThanOrEqual(2);
    expect(page1.limit).toBe(2);

    const page2 = await repos.discountPoliciesRepository.findMany(TEST_TENANT_ID, {
      limit: 2,
      offset: 2,
    });
    expect(page2.offset).toBe(2);
  });

  it('should filter discount policies by customer id', async () => {
    const prefix = `DP-CUST-${Date.now()}`;
    const [otherCust] = await testDb
      .insert(schema.customers)
      .values({
        tenantId: TEST_TENANT_ID,
        name: 'Discount Filter Customer',
        email: `${prefix}@example.com`,
        paymentTerms: 'Net 30',
        creditLimit: '10000.0000',
        isActive: true,
      })
      .returning();

    await repos.discountPoliciesRepository.create(
      makeDiscountPolicyInput({ name: `${prefix}-MINE`, customerId }),
      TEST_TENANT_ID,
    );
    await repos.discountPoliciesRepository.create(
      makeDiscountPolicyInput({ name: `${prefix}-OTHER`, customerId: otherCust.id }),
      TEST_TENANT_ID,
    );

    const mine = await repos.discountPoliciesRepository.findMany(TEST_TENANT_ID, { customerId });
    const allMine = mine.data.every((d) => d.customerId === customerId);
    expect(allMine).toBe(true);
  });

  it('should filter discount policies by type', async () => {
    const prefix = `DP-TYPE-${Date.now()}`;
    await repos.discountPoliciesRepository.create(
      makeDiscountPolicyInput({ name: `${prefix}-PCT`, type: 'percentage' }),
      TEST_TENANT_ID,
    );
    await repos.discountPoliciesRepository.create(
      makeDiscountPolicyInput({ name: `${prefix}-FLAT`, type: 'fixed' }),
      TEST_TENANT_ID,
    );

    const percentages = await repos.discountPoliciesRepository.findMany(TEST_TENANT_ID, {
      type: 'percentage',
    });
    const allPercentage = percentages.data.every((d) => d.type === 'percentage');
    expect(allPercentage).toBe(true);
  });

  it('should find active discount policies', async () => {
    const prefix = `DP-ACTIVE-${Date.now()}`;
    await repos.discountPoliciesRepository.create(
      makeDiscountPolicyInput({
        name: `${prefix}-VALID`,
        validFrom: '2026-01-01',
        validUntil: '2026-12-31',
      }),
      TEST_TENANT_ID,
    );
    await repos.discountPoliciesRepository.create(
      makeDiscountPolicyInput({
        name: `${prefix}-FUTURE`,
        validFrom: '2027-01-01',
        validUntil: '2027-12-31',
      }),
      TEST_TENANT_ID,
    );

    const active = await repos.discountPoliciesRepository.findActive(
      '2026-07-25',
      TEST_TENANT_ID,
    );
    const allValid = active.every((d) => d.validFrom <= '2026-07-25');
    expect(allValid).toBe(true);
  });

  it('should find active discount policies filtered by customer id', async () => {
    const prefix = `DP-ACTCUST-${Date.now()}`;
    await repos.discountPoliciesRepository.create(
      makeDiscountPolicyInput({
        name: `${prefix}-CUST`,
        validFrom: '2026-01-01',
        customerId,
      }),
      TEST_TENANT_ID,
    );

    const active = await repos.discountPoliciesRepository.findActive(
      '2026-07-25',
      TEST_TENANT_ID,
      customerId,
    );
    const allMatch = active.every((d) => d.customerId === customerId);
    expect(allMatch).toBe(true);
  });

  it('should not return future policies from findActive', async () => {
    const prefix = `DP-FUTURE-${Date.now()}`;
    await repos.discountPoliciesRepository.create(
      makeDiscountPolicyInput({
        name: `${prefix}-FUTURE`,
        validFrom: '2099-01-01',
      }),
      TEST_TENANT_ID,
    );

    const active = await repos.discountPoliciesRepository.findActive(
      '2026-07-25',
      TEST_TENANT_ID,
    );
    const notFound = active.find((d) => d.name === `${prefix}-FUTURE`);
    expect(notFound).toBeUndefined();
  });

  it('should persist minQuantity and maxDiscountAmount fields', async () => {
    const input = makeDiscountPolicyInput({
      name: 'Tiered Discount',
      minQuantity: '5.00',
      maxDiscountAmount: '500.0000',
    });
    const [created] = await repos.discountPoliciesRepository.create(input, TEST_TENANT_ID);

    expect(created.minQuantity).toBe('5.00');
    expect(created.maxDiscountAmount).toBe('500.0000');
  });

  it('should allow discount policy without customer id (global)', async () => {
    const input = makeDiscountPolicyInput({
      name: 'Global Discount',
      customerId: undefined,
    });
    const [created] = await repos.discountPoliciesRepository.create(input, TEST_TENANT_ID);

    expect(created).toBeDefined();
    expect(created.customerId).toBeNull();
  });

  it('should allow discount policy with customer id (targeted)', async () => {
    const input = makeDiscountPolicyInput({
      name: 'Targeted Discount',
      customerId,
    });
    const [created] = await repos.discountPoliciesRepository.create(input, TEST_TENANT_ID);

    expect(created).toBeDefined();
    expect(created.customerId).toBe(customerId);
  });
});
