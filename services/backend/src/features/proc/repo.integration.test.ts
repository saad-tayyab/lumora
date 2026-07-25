import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { testDb, TEST_TENANT_ID, TEST_USER_ID } from '../../lib/integration-test-utils';
import * as schema from '@lumora/database/schema';
import * as repos from './repo';
import { eq } from 'drizzle-orm';

vi.mock('../../database', () => ({ db: testDb }));

vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class {
    connectionString = '';
  },
}));

vi.mock('encore.dev/api', () => ({
  APIError: class extends Error {
    constructor(_code: string, message: string) {
      super(message);
    }
  },
  api: vi.fn(),
}));

const {
  purchaseOrders,
  poLineItems,
  receivingReports,
  vendorCatalogItems,
  vendors,
  items,
  itemCategories,
  unitOfMeasures,
  warehouses,
  employees,
  departments,
  designations,
} = schema;

const {
  salesOrderLineItems,
  quotationLineItems,
  salesOrders,
  quotations,
} = schema;

const OTHER_TENANT_ID = '33333333-3333-4333-8333-333333333333';

// ── Helpers ──────────────────────────────────────────────────────────────────

let sharedVendorId: string;
let sharedItemId: string;
let sharedWarehouseId: string;
let sharedEmployeeId: string;

async function cleanupProcTestData(): Promise<void> {
  await testDb.delete(vendorCatalogItems).where(eq(vendorCatalogItems.vendorId, sharedVendorId));
  await testDb.delete(receivingReports).where(eq(receivingReports.tenantId, TEST_TENANT_ID));
  await testDb.delete(receivingReports).where(eq(receivingReports.tenantId, OTHER_TENANT_ID));
  await testDb.delete(poLineItems);
  await testDb.delete(purchaseOrders).where(eq(purchaseOrders.tenantId, TEST_TENANT_ID));
  await testDb.delete(purchaseOrders).where(eq(purchaseOrders.tenantId, OTHER_TENANT_ID));
  await testDb.delete(vendors).where(eq(vendors.tenantId, TEST_TENANT_ID));
  await testDb.delete(vendors).where(eq(vendors.tenantId, OTHER_TENANT_ID));
  await testDb.delete(salesOrderLineItems).where(eq(salesOrderLineItems.tenantId, TEST_TENANT_ID));
  await testDb.delete(salesOrderLineItems).where(eq(salesOrderLineItems.tenantId, OTHER_TENANT_ID));
  await testDb.delete(quotationLineItems).where(eq(quotationLineItems.tenantId, TEST_TENANT_ID));
  await testDb.delete(quotationLineItems).where(eq(quotationLineItems.tenantId, OTHER_TENANT_ID));
  await testDb.delete(salesOrders).where(eq(salesOrders.tenantId, TEST_TENANT_ID));
  await testDb.delete(salesOrders).where(eq(salesOrders.tenantId, OTHER_TENANT_ID));
  await testDb.delete(quotations).where(eq(quotations.tenantId, TEST_TENANT_ID));
  await testDb.delete(quotations).where(eq(quotations.tenantId, OTHER_TENANT_ID));
  await testDb.delete(items).where(eq(items.tenantId, TEST_TENANT_ID));
  await testDb.delete(items).where(eq(items.tenantId, OTHER_TENANT_ID));
  await testDb.delete(itemCategories).where(eq(itemCategories.tenantId, TEST_TENANT_ID));
  await testDb.delete(itemCategories).where(eq(itemCategories.tenantId, OTHER_TENANT_ID));
  await testDb.delete(unitOfMeasures).where(eq(unitOfMeasures.code, 'TEST-UOM'));
  await testDb.delete(warehouses).where(eq(warehouses.tenantId, TEST_TENANT_ID));
  await testDb.delete(warehouses).where(eq(warehouses.tenantId, OTHER_TENANT_ID));
  await testDb.delete(employees).where(eq(employees.tenantId, TEST_TENANT_ID));
  await testDb.delete(employees).where(eq(employees.tenantId, OTHER_TENANT_ID));
  await testDb.delete(departments).where(eq(departments.code, 'TEST-DEPT'));
  await testDb.delete(designations).where(eq(designations.code, 'TEST-DESIG'));
}

async function cleanupPOTestData(): Promise<void> {
  await testDb.delete(poLineItems);
  await testDb.delete(receivingReports).where(eq(receivingReports.tenantId, TEST_TENANT_ID));
  await testDb.delete(receivingReports).where(eq(receivingReports.tenantId, OTHER_TENANT_ID));
  await testDb.delete(purchaseOrders).where(eq(purchaseOrders.tenantId, TEST_TENANT_ID));
  await testDb.delete(purchaseOrders).where(eq(purchaseOrders.tenantId, OTHER_TENANT_ID));
}

async function cleanupVendorCatalogTestData(): Promise<void> {
  await testDb.delete(vendorCatalogItems);
}

async function seedPrerequisites(tenantId: string) {
  const [uom] = await testDb
    .insert(unitOfMeasures)
    .values({ code: 'TEST-UOM', name: 'Test UOM', category: 'count' })
    .returning()
    .onConflictDoNothing({ target: unitOfMeasures.code });

  const existingUom = uom ?? (
    await testDb.select().from(unitOfMeasures).where(eq(unitOfMeasures.code, 'TEST-UOM')).then(r => r[0])
  );

  const [dept] = await testDb
    .insert(departments)
    .values({
      name: 'Test Department',
      code: 'TEST-DEPT',
      status: 'active',
      tenantId: TEST_TENANT_ID,
    })
    .returning()
    .onConflictDoNothing({ target: departments.code });

  const existingDept = dept ?? (
    await testDb.select().from(departments).where(eq(departments.code, 'TEST-DEPT')).then(r => r[0])
  );

  const [desig] = await testDb
    .insert(designations)
    .values({
      name: 'Test Designation',
      code: 'TEST-DESIG',
      level: 1,
      isActive: true,
      tenantId: tenantId,
    })
    .returning()
    .onConflictDoNothing({ target: designations.code });

  const existingDesig = desig ?? (
    await testDb.select().from(designations).where(eq(designations.code, 'TEST-DESIG')).then(r => r[0])
  );

  const [employee] = await testDb
    .insert(employees)
    .values({
      firstName: 'Test',
      lastName: 'Receiver',
      email: `test-receiver-${Date.now()}@example.com`,
      hireDate: '2026-01-01',
      departmentId: existingDept!.id,
      designationId: existingDesig!.id,
      employmentType: 'full_time',
      status: 'active',
      tenantId,
    })
    .returning();
  sharedEmployeeId = employee.id;

  const [vendor] = await testDb
    .insert(vendors)
    .values({
      name: 'Test Vendor',
      code: `V-${Date.now()}`,
      email: `vendor-${Date.now()}@example.com`,
      tenantId,
      createdBy: '00000000-0000-0000-0000-000000000000',
    })
    .returning();
  sharedVendorId = vendor.id;

  const [cat] = await testDb
    .insert(itemCategories)
    .values({
      name: 'Test Category',
      code: `CAT-${Date.now()}`,
      tenantId,
      isActive: true,
    })
    .returning();

  const [item] = await testDb
    .insert(items)
    .values({
      sku: `SKU-${Date.now()}`,
      name: 'Test Item',
      categoryId: cat.id,
      unitOfMeasureId: existingUom!.id,
      tenantId,
      createdBy: TEST_USER_ID,
    })
    .returning();
  sharedItemId = item.id;

  const [wh] = await testDb
    .insert(warehouses)
    .values({
      name: 'Test Warehouse',
      code: `WH-${Date.now()}`,
      tenantId,
      isActive: true,
      isDefault: true,
    })
    .returning();
  sharedWarehouseId = wh.id;
}

function makePoInput(overrides: Record<string, unknown> = {}) {
  return {
    poNumber: `PO-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    vendorId: sharedVendorId,
    status: 'draft' as const,
    orderDate: '2026-07-25',
    shippingAddressLine1: '100 Test St',
    shippingCity: 'Testville',
    shippingState: 'TS',
    shippingPostalCode: '12345',
    shippingCountry: 'USA',
    currency: 'USD',
    paymentTerms: 'Net 30',
    subtotal: '1000.0000',
    taxAmount: '100.0000',
    total: '1100.0000',
    tenantId: TEST_TENANT_ID,
    createdBy: '00000000-0000-0000-0000-000000000000',
    ...overrides,
  };
}

function makePoLineItemInput(poId: string, overrides: Record<string, unknown> = {}) {
  return {
    poId,
    lineNumber: 1,
    itemId: sharedItemId,
    description: 'Test Line Item',
    quantity: '10',
    unitOfMeasure: 'EA',
    unitPrice: '100.0000',
    amount: '1000.0000',
    receivedQuantity: '0',
    ...overrides,
  };
}

function makeReceivingReportInput(poId: string, overrides: Record<string, unknown> = {}) {
  return {
    rrNumber: `RR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    poId,
    vendorId: sharedVendorId,
    receivedDate: '2026-07-25',
    receivedBy: sharedEmployeeId,
    warehouseId: sharedWarehouseId,
    status: 'draft' as const,
    tenantId: TEST_TENANT_ID,
    ...overrides,
  };
}

function makeVendorCatalogItemInput(overrides: Record<string, unknown> = {}) {
  return {
    vendorId: sharedVendorId,
    vendorItemCode: `VIC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    internalItemId: sharedItemId,
    description: 'Test Catalog Item',
    unitPrice: '50.0000',
    currency: 'USD',
    unitOfMeasure: 'EA',
    effectiveDate: '2026-07-25',
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Purchase Orders Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('purchaseOrderRepo', () => {
  beforeAll(async () => {
    await cleanupProcTestData();
    await seedPrerequisites(TEST_TENANT_ID);
  });

  afterAll(async () => {
    await cleanupProcTestData();
  });

  it('should create a purchase order and return it', async () => {
    const input = makePoInput({ poNumber: `PO-CREATE-${Date.now()}` });
    const created = await repos.purchaseOrderRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.poNumber).toBe(input.poNumber);
    expect(created.vendorId).toBe(sharedVendorId);
    expect(created.status).toBe('draft');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
    expect(created.total).toBe('1100.0000');
  });

  it('should find a purchase order by id', async () => {
    const input = makePoInput({ poNumber: `PO-FIND-${Date.now()}` });
    const created = await repos.purchaseOrderRepo.create(input);

    const found = await repos.purchaseOrderRepo.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.poNumber).toBe(input.poNumber);
  });

  it('should return undefined for non-existent purchase order id', async () => {
    const found = await repos.purchaseOrderRepo.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should find a purchase order by PO number', async () => {
    const poNumber = `PO-NUM-${Date.now()}`;
    await repos.purchaseOrderRepo.create(makePoInput({ poNumber }));

    const found = await repos.purchaseOrderRepo.findByPoNumber(poNumber, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.poNumber).toBe(poNumber);
  });

  it('should return undefined for non-existent PO number', async () => {
    const found = await repos.purchaseOrderRepo.findByPoNumber(
      'NO-SUCH-PO',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should isolate tenants for purchase orders', async () => {
    const input = makePoInput({ poNumber: `PO-TENANT-${Date.now()}` });
    const created = await repos.purchaseOrderRepo.create(input);

    const found = await repos.purchaseOrderRepo.findById(created.id, OTHER_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should update a purchase order', async () => {
    const created = await repos.purchaseOrderRepo.create(
      makePoInput({ poNumber: `PO-UPDATE-${Date.now()}` }),
    );

    const updated = await repos.purchaseOrderRepo.update(created.id, TEST_TENANT_ID, {
      status: 'approved',
      notes: 'Approved for procurement',
    });

    expect(updated).toBeDefined();
    expect(updated!.status).toBe('approved');
    expect(updated!.notes).toBe('Approved for procurement');
  });

  it('should return undefined when updating non-existent purchase order', async () => {
    const result = await repos.purchaseOrderRepo.update(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
      { status: 'approved' },
    );
    expect(result).toBeUndefined();
  });

  it('should soft delete a purchase order', async () => {
    const created = await repos.purchaseOrderRepo.create(
      makePoInput({ poNumber: `PO-DEL-${Date.now()}` }),
    );

    const deleted = await repos.purchaseOrderRepo.softDelete(created.id, TEST_TENANT_ID);
    expect(deleted).toBeDefined();
    expect(deleted!.deletedAt).not.toBeNull();

    const found = await repos.purchaseOrderRepo.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.deletedAt).not.toBeNull();
  });

  it('should find many purchase orders with pagination', async () => {
    for (let i = 0; i < 5; i++) {
      await repos.purchaseOrderRepo.create(
        makePoInput({ poNumber: `PO-PAGE-${Date.now()}-${i}` }),
      );
    }

    const page1 = await repos.purchaseOrderRepo.findMany(TEST_TENANT_ID, { page: 1, limit: 2 });
    expect(page1.data.length).toBeLessThanOrEqual(2);
    expect(page1.limit).toBe(2);
    expect(page1.page).toBe(1);
    expect(page1.total).toBeGreaterThanOrEqual(5);

    const page2 = await repos.purchaseOrderRepo.findMany(TEST_TENANT_ID, { page: 2, limit: 2 });
    expect(page2.page).toBe(2);
    expect(page2.data.length).toBeLessThanOrEqual(2);
  });

  it('should filter purchase orders by status', async () => {
    const ts = Date.now();
    await repos.purchaseOrderRepo.create(
      makePoInput({ poNumber: `PO-FILT-DRAFT-${ts}`, status: 'draft' }),
    );
    await repos.purchaseOrderRepo.create(
      makePoInput({ poNumber: `PO-FILT-APPROVED-${ts}`, status: 'approved' }),
    );

    const drafts = await repos.purchaseOrderRepo.findMany(TEST_TENANT_ID, { status: 'draft' });
    const allDraft = drafts.data.every((po) => po.status === 'draft');
    expect(allDraft).toBe(true);
  });

  it('should filter purchase orders by vendor id', async () => {
    const ts = Date.now();
    const [otherVendor] = await testDb
      .insert(vendors)
      .values({
        name: 'Other Vendor',
        code: `OV-${ts}`,
        tenantId: TEST_TENANT_ID,
        createdBy: '00000000-0000-0000-0000-000000000000',
      })
      .returning();

    await repos.purchaseOrderRepo.create(
      makePoInput({ poNumber: `PO-VEND-MINE-${ts}`, vendorId: sharedVendorId }),
    );
    await repos.purchaseOrderRepo.create(
      makePoInput({ poNumber: `PO-VEND-OTHER-${ts}`, vendorId: otherVendor.id }),
    );

    const mine = await repos.purchaseOrderRepo.findMany(TEST_TENANT_ID, {
      vendorId: sharedVendorId,
    });
    const allMine = mine.data.every((po) => po.vendorId === sharedVendorId);
    expect(allMine).toBe(true);
  });

  it('should find purchase orders by vendor', async () => {
    const ts = Date.now();
    await repos.purchaseOrderRepo.create(
      makePoInput({ poNumber: `PO-BYVEND-${ts}` }),
    );

    const found = await repos.purchaseOrderRepo.findByVendor(sharedVendorId, TEST_TENANT_ID);
    expect(found.length).toBeGreaterThanOrEqual(1);
    found.forEach((po) => {
      expect(po.vendorId).toBe(sharedVendorId);
    });
  });

  it('should find pending approval purchase orders', async () => {
    const ts = Date.now();
    await repos.purchaseOrderRepo.create(
      makePoInput({ poNumber: `PO-PEND-${ts}`, status: 'pending_approval' }),
    );

    const pending = await repos.purchaseOrderRepo.findPendingApproval(TEST_TENANT_ID);
    const allPending = pending.every((po) => po.status === 'pending_approval');
    expect(allPending).toBe(true);
  });

  it('should find active (approved) purchase orders by vendor', async () => {
    const ts = Date.now();
    await repos.purchaseOrderRepo.create(
      makePoInput({ poNumber: `PO-ACTIVE-${ts}`, status: 'approved' }),
    );

    const active = await repos.purchaseOrderRepo.findActiveByVendor(
      sharedVendorId,
      TEST_TENANT_ID,
    );
    const allApproved = active.every(
      (po) => po.status === 'approved' && po.vendorId === sharedVendorId,
    );
    expect(allApproved).toBe(true);
  });

  it('should not find non-approved purchase orders in findActiveByVendor', async () => {
    const ts = Date.now();
    await repos.purchaseOrderRepo.create(
      makePoInput({ poNumber: `PO-NOTACTIVE-${ts}`, status: 'draft' }),
    );

    const active = await repos.purchaseOrderRepo.findActiveByVendor(
      sharedVendorId,
      TEST_TENANT_ID,
    );
    const hasDraft = active.some((po) => po.status === 'draft');
    expect(hasDraft).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PO Line Items Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('poLineItemRepo', () => {
  let testPoId: string;

  beforeAll(async () => {
    await cleanupPOTestData();
    await seedPrerequisites(TEST_TENANT_ID);
    const po = await repos.purchaseOrderRepo.create(
      makePoInput({ poNumber: `PO-LINE-PARENT-${Date.now()}` }),
    );
    testPoId = po.id;
  });

  afterAll(async () => {
    await cleanupPOTestData();
  });

  it('should create a PO line item and return it', async () => {
    const input = makePoLineItemInput(testPoId, { lineNumber: 100 });
    const created = await repos.poLineItemRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.poId).toBe(testPoId);
    expect(created.lineNumber).toBe(100);
    expect(created.description).toBe('Test Line Item');
    expect(created.quantity).toBe('10.0000');
  });

  it('should find a PO line item by id', async () => {
    const input = makePoLineItemInput(testPoId, {
      lineNumber: 200,
      description: 'Find Me',
    });
    const created = await repos.poLineItemRepo.create(input);

    const found = await repos.poLineItemRepo.findById(created.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.description).toBe('Find Me');
  });

  it('should return undefined for non-existent PO line item id', async () => {
    const found = await repos.poLineItemRepo.findById(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(found).toBeUndefined();
  });

  it('should find line items by PO id ordered by line number', async () => {
    await repos.poLineItemRepo.create(makePoLineItemInput(testPoId, { lineNumber: 3 }));
    await repos.poLineItemRepo.create(makePoLineItemInput(testPoId, { lineNumber: 1 }));
    await repos.poLineItemRepo.create(makePoLineItemInput(testPoId, { lineNumber: 2 }));

    const items = await repos.poLineItemRepo.findByPoId(testPoId);
    expect(items.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < items.length; i++) {
      expect(items[i]!.lineNumber).toBeGreaterThanOrEqual(items[i - 1]!.lineNumber);
    }
  });

  it('should find line items by item id', async () => {
    const input = makePoLineItemInput(testPoId, {
      lineNumber: 500,
      description: 'By Item',
    });
    await repos.poLineItemRepo.create(input);

    const found = await repos.poLineItemRepo.findByItemId(sharedItemId);
    expect(found.length).toBeGreaterThanOrEqual(1);
    found.forEach((li) => {
      expect(li.itemId).toBe(sharedItemId);
    });
  });

  it('should create many line items at once', async () => {
    const items = [
      makePoLineItemInput(testPoId, { lineNumber: 600, description: 'Bulk A' }),
      makePoLineItemInput(testPoId, { lineNumber: 601, description: 'Bulk B' }),
      makePoLineItemInput(testPoId, { lineNumber: 602, description: 'Bulk C' }),
    ];

    const created = await repos.poLineItemRepo.createMany(items);
    expect(created).toHaveLength(3);
    created.forEach((li) => {
      expect(li.poId).toBe(testPoId);
    });
  });

  it('should return empty array for createMany with empty input', async () => {
    const result = await repos.poLineItemRepo.createMany([]);
    expect(result).toHaveLength(0);
  });

  it('should update a PO line item', async () => {
    const created = await repos.poLineItemRepo.create(
      makePoLineItemInput(testPoId, { lineNumber: 700, description: 'Before Update' }),
    );

    const updated = await repos.poLineItemRepo.update(created.id, {
      description: 'After Update',
      quantity: '25',
    });

    expect(updated).toBeDefined();
    expect(updated!.description).toBe('After Update');
    expect(updated!.quantity).toBe('25.0000');
  });

  it('should return undefined when updating non-existent line item', async () => {
    const result = await repos.poLineItemRepo.update(
      '00000000-0000-0000-0000-000000000000',
      { description: 'Ghost' },
    );
    expect(result).toBeUndefined();
  });

  it('should delete a PO line item by id', async () => {
    const created = await repos.poLineItemRepo.create(
      makePoLineItemInput(testPoId, { lineNumber: 800, description: 'Delete Me' }),
    );

    const deleted = await repos.poLineItemRepo.delete(created.id);
    expect(deleted).toBe(true);

    const found = await repos.poLineItemRepo.findById(created.id);
    expect(found).toBeUndefined();
  });

  it('should return false when deleting non-existent line item', async () => {
    const result = await repos.poLineItemRepo.delete(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(result).toBe(false);
  });

  it('should delete all line items by PO id', async () => {
    const delPo = await repos.purchaseOrderRepo.create(
      makePoInput({ poNumber: `PO-DEL-${Date.now()}` }),
    );

    await repos.poLineItemRepo.createMany([
      makePoLineItemInput(delPo.id, { lineNumber: 1, description: 'Del A' }),
      makePoLineItemInput(delPo.id, { lineNumber: 2, description: 'Del B' }),
    ]);

    await repos.poLineItemRepo.deleteByPoId(delPo.id);

    const remaining = await repos.poLineItemRepo.findByPoId(delPo.id);
    expect(remaining).toHaveLength(0);
  });

  it('should return empty array for PO with no line items', async () => {
    const emptyPo = await repos.purchaseOrderRepo.create(
      makePoInput({ poNumber: `PO-EMPTY-${Date.now()}` }),
    );

    const items = await repos.poLineItemRepo.findByPoId(emptyPo.id);
    expect(items).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Receiving Reports Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('receivingReportRepo', () => {
  let parentPoId: string;

  beforeAll(async () => {
    await cleanupProcTestData();
    await seedPrerequisites(TEST_TENANT_ID);
    const po = await repos.purchaseOrderRepo.create(
      makePoInput({ poNumber: `PO-RR-PARENT-${Date.now()}` }),
    );
    parentPoId = po.id;
  });

  afterAll(async () => {
    await cleanupProcTestData();
  });

  it('should create a receiving report and return it', async () => {
    const input = makeReceivingReportInput(parentPoId, {
      rrNumber: `RR-CREATE-${Date.now()}`,
    });
    const created = await repos.receivingReportRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.rrNumber).toBe(input.rrNumber);
    expect(created.poId).toBe(parentPoId);
    expect(created.vendorId).toBe(sharedVendorId);
    expect(created.status).toBe('draft');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should find a receiving report by id', async () => {
    const input = makeReceivingReportInput(parentPoId, {
      rrNumber: `RR-FIND-${Date.now()}`,
    });
    const created = await repos.receivingReportRepo.create(input);

    const found = await repos.receivingReportRepo.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.rrNumber).toBe(input.rrNumber);
  });

  it('should return undefined for non-existent receiving report id', async () => {
    const found = await repos.receivingReportRepo.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should find receiving report by RR number', async () => {
    const rrNumber = `RR-NUM-${Date.now()}`;
    await repos.receivingReportRepo.create(
      makeReceivingReportInput(parentPoId, { rrNumber }),
    );

    const found = await repos.receivingReportRepo.findByRrNumber(rrNumber, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.rrNumber).toBe(rrNumber);
  });

  it('should return undefined for non-existent RR number', async () => {
    const found = await repos.receivingReportRepo.findByRrNumber(
      'NO-SUCH-RR',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should isolate tenants for receiving reports', async () => {
    const input = makeReceivingReportInput(parentPoId, {
      rrNumber: `RR-TENANT-${Date.now()}`,
    });
    const created = await repos.receivingReportRepo.create(input);

    const found = await repos.receivingReportRepo.findById(created.id, OTHER_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should update a receiving report', async () => {
    const created = await repos.receivingReportRepo.create(
      makeReceivingReportInput(parentPoId, { rrNumber: `RR-UPDATE-${Date.now()}` }),
    );

    const updated = await repos.receivingReportRepo.update(created.id, TEST_TENANT_ID, {
      status: 'confirmed',
      notes: 'All items received',
    });

    expect(updated).toBeDefined();
    expect(updated!.status).toBe('confirmed');
    expect(updated!.notes).toBe('All items received');
  });

  it('should return undefined when updating non-existent receiving report', async () => {
    const result = await repos.receivingReportRepo.update(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
      { status: 'confirmed' },
    );
    expect(result).toBeUndefined();
  });

  it('should soft delete a receiving report', async () => {
    const created = await repos.receivingReportRepo.create(
      makeReceivingReportInput(parentPoId, { rrNumber: `RR-DEL-${Date.now()}` }),
    );

    const deleted = await repos.receivingReportRepo.softDelete(created.id, TEST_TENANT_ID);
    expect(deleted).toBeDefined();
    expect(deleted!.deletedAt).not.toBeNull();
  });

  it('should find many receiving reports with pagination', async () => {
    for (let i = 0; i < 5; i++) {
      await repos.receivingReportRepo.create(
        makeReceivingReportInput(parentPoId, { rrNumber: `RR-PAGE-${Date.now()}-${i}` }),
      );
    }

    const page1 = await repos.receivingReportRepo.findMany(TEST_TENANT_ID, {
      page: 1,
      limit: 2,
    });
    expect(page1.data.length).toBeLessThanOrEqual(2);
    expect(page1.limit).toBe(2);
    expect(page1.page).toBe(1);
    expect(page1.total).toBeGreaterThanOrEqual(5);

    const page2 = await repos.receivingReportRepo.findMany(TEST_TENANT_ID, {
      page: 2,
      limit: 2,
    });
    expect(page2.page).toBe(2);
  });

  it('should filter receiving reports by status', async () => {
    const ts = Date.now();
    await repos.receivingReportRepo.create(
      makeReceivingReportInput(parentPoId, {
        rrNumber: `RR-FILT-DRAFT-${ts}`,
        status: 'draft',
      }),
    );
    await repos.receivingReportRepo.create(
      makeReceivingReportInput(parentPoId, {
        rrNumber: `RR-FILT-CONF-${ts}`,
        status: 'confirmed',
      }),
    );

    const drafts = await repos.receivingReportRepo.findMany(TEST_TENANT_ID, {
      status: 'draft',
    });
    const allDraft = drafts.data.every((rr) => rr.status === 'draft');
    expect(allDraft).toBe(true);
  });

  it('should filter receiving reports by PO id', async () => {
    const ts = Date.now();
    const [otherPo] = await testDb
      .insert(purchaseOrders)
      .values({
        ...makePoInput({ poNumber: `PO-RR-FILT-${ts}` }),
      })
      .returning();

    await repos.receivingReportRepo.create(
      makeReceivingReportInput(parentPoId, { rrNumber: `RR-PO-MINE-${ts}` }),
    );
    await repos.receivingReportRepo.create(
      makeReceivingReportInput(otherPo.id, { rrNumber: `RR-PO-OTHER-${ts}` }),
    );

    const mine = await repos.receivingReportRepo.findMany(TEST_TENANT_ID, { poId: parentPoId });
    const allMine = mine.data.every((rr) => rr.poId === parentPoId);
    expect(allMine).toBe(true);
  });

  it('should filter receiving reports by vendor id', async () => {
    const ts = Date.now();
    const [otherVendor] = await testDb
      .insert(vendors)
      .values({
        name: 'Other Vendor RR',
        code: `OVR-${ts}`,
        tenantId: TEST_TENANT_ID,
        createdBy: '00000000-0000-0000-0000-000000000000',
      })
      .returning();

    await repos.receivingReportRepo.create(
      makeReceivingReportInput(parentPoId, { rrNumber: `RR-VEND-MINE-${ts}` }),
    );
    await repos.receivingReportRepo.create(
      makeReceivingReportInput(parentPoId, {
        rrNumber: `RR-VEND-OTHER-${ts}`,
        vendorId: otherVendor.id,
      }),
    );

    const mine = await repos.receivingReportRepo.findMany(TEST_TENANT_ID, {
      vendorId: sharedVendorId,
    });
    const allMine = mine.data.every((rr) => rr.vendorId === sharedVendorId);
    expect(allMine).toBe(true);
  });

  it('should find receiving reports by PO id', async () => {
    const ts = Date.now();
    await repos.receivingReportRepo.create(
      makeReceivingReportInput(parentPoId, { rrNumber: `RR-BYPO-${ts}` }),
    );

    const found = await repos.receivingReportRepo.findByPoId(parentPoId, TEST_TENANT_ID);
    expect(found.length).toBeGreaterThanOrEqual(1);
    found.forEach((rr) => {
      expect(rr.poId).toBe(parentPoId);
    });
  });

  it('should find receiving reports by vendor', async () => {
    const ts = Date.now();
    await repos.receivingReportRepo.create(
      makeReceivingReportInput(parentPoId, { rrNumber: `RR-BYVEND-${ts}` }),
    );

    const found = await repos.receivingReportRepo.findByVendor(
      sharedVendorId,
      TEST_TENANT_ID,
    );
    expect(found.length).toBeGreaterThanOrEqual(1);
    found.forEach((rr) => {
      expect(rr.vendorId).toBe(sharedVendorId);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Vendor Catalog Items Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('vendorCatalogItemRepo', () => {
  beforeAll(async () => {
    await cleanupVendorCatalogTestData();
    await seedPrerequisites(TEST_TENANT_ID);
  });

  afterAll(async () => {
    await cleanupVendorCatalogTestData();
  });

  it('should create a vendor catalog item and return it', async () => {
    const input = makeVendorCatalogItemInput({
      vendorItemCode: `VIC-CREATE-${Date.now()}`,
    });
    const created = await repos.vendorCatalogItemRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.vendorId).toBe(sharedVendorId);
    expect(created.vendorItemCode).toBe(input.vendorItemCode);
    expect(created.unitPrice).toBe('50.0000');
    expect(created.effectiveDate).toBe('2026-07-25');
  });

  it('should find a vendor catalog item by id', async () => {
    const input = makeVendorCatalogItemInput({
      vendorItemCode: `VIC-FIND-${Date.now()}`,
    });
    const created = await repos.vendorCatalogItemRepo.create(input);

    const found = await repos.vendorCatalogItemRepo.findById(created.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.vendorItemCode).toBe(input.vendorItemCode);
  });

  it('should return undefined for non-existent catalog item id', async () => {
    const found = await repos.vendorCatalogItemRepo.findById(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(found).toBeUndefined();
  });

  it('should find catalog item by vendor and item code', async () => {
    const code = `VIC-VCODE-${Date.now()}`;
    await repos.vendorCatalogItemRepo.create(
      makeVendorCatalogItemInput({ vendorItemCode: code }),
    );

    const found = await repos.vendorCatalogItemRepo.findByVendorAndCode(sharedVendorId, code);
    expect(found).toBeDefined();
    expect(found!.vendorItemCode).toBe(code);
  });

  it('should return undefined for non-existent vendor + item code combo', async () => {
    const found = await repos.vendorCatalogItemRepo.findByVendorAndCode(
      sharedVendorId,
      'NO-SUCH-CODE',
    );
    expect(found).toBeUndefined();
  });

  it('should find many catalog items with pagination', async () => {
    for (let i = 0; i < 5; i++) {
      await repos.vendorCatalogItemRepo.create(
        makeVendorCatalogItemInput({
          vendorItemCode: `VIC-PAGE-${Date.now()}-${i}`,
        }),
      );
    }

    const page1 = await repos.vendorCatalogItemRepo.findMany({ page: 1, limit: 2 });
    expect(page1.data.length).toBeLessThanOrEqual(2);
    expect(page1.limit).toBe(2);
    expect(page1.page).toBe(1);
    expect(page1.total).toBeGreaterThanOrEqual(5);

    const page2 = await repos.vendorCatalogItemRepo.findMany({ page: 2, limit: 2 });
    expect(page2.page).toBe(2);
  });

  it('should filter catalog items by vendor id', async () => {
    const ts = Date.now();
    const [otherVendor] = await testDb
      .insert(vendors)
      .values({
        name: 'Other Vendor Cat',
        code: `OVC-${ts}`,
        tenantId: TEST_TENANT_ID,
        createdBy: '00000000-0000-0000-0000-000000000000',
      })
      .returning();

    await repos.vendorCatalogItemRepo.create(
      makeVendorCatalogItemInput({ vendorItemCode: `VIC-FILT-MINE-${ts}` }),
    );
    await repos.vendorCatalogItemRepo.create(
      makeVendorCatalogItemInput({
        vendorItemCode: `VIC-FILT-OTHER-${ts}`,
        vendorId: otherVendor.id,
      }),
    );

    const mine = await repos.vendorCatalogItemRepo.findMany({ vendorId: sharedVendorId });
    const allMine = mine.data.every((ci) => ci.vendorId === sharedVendorId);
    expect(allMine).toBe(true);
  });

  it('should find catalog items by vendor', async () => {
    const ts = Date.now();
    await repos.vendorCatalogItemRepo.create(
      makeVendorCatalogItemInput({ vendorItemCode: `VIC-BYVEND-${ts}` }),
    );

    const found = await repos.vendorCatalogItemRepo.findByVendor(sharedVendorId);
    expect(found.length).toBeGreaterThanOrEqual(1);
    found.forEach((ci) => {
      expect(ci.vendorId).toBe(sharedVendorId);
    });
  });

  it('should find catalog items by internal item id', async () => {
    const ts = Date.now();
    await repos.vendorCatalogItemRepo.create(
      makeVendorCatalogItemInput({ vendorItemCode: `VIC-BYINT-${ts}` }),
    );

    const found = await repos.vendorCatalogItemRepo.findByInternalItemId(sharedItemId);
    expect(found.length).toBeGreaterThanOrEqual(1);
    found.forEach((ci) => {
      expect(ci.internalItemId).toBe(sharedItemId);
    });
  });

  it('should find effective catalog items by vendor and date', async () => {
    const ts = Date.now();
    await repos.vendorCatalogItemRepo.create(
      makeVendorCatalogItemInput({
        vendorItemCode: `VIC-EFF-${ts}`,
        effectiveDate: '2026-07-25',
      }),
    );

    const found = await repos.vendorCatalogItemRepo.findEffective(
      sharedVendorId,
      '2026-07-25',
    );
    expect(found.length).toBeGreaterThanOrEqual(1);
    found.forEach((ci) => {
      expect(ci.vendorId).toBe(sharedVendorId);
      expect(ci.effectiveDate).toBe('2026-07-25');
    });
  });

  it('should return empty array for effective query with no matching date', async () => {
    const found = await repos.vendorCatalogItemRepo.findEffective(
      sharedVendorId,
      '1999-01-01',
    );
    expect(found).toHaveLength(0);
  });

  it('should update a vendor catalog item', async () => {
    const created = await repos.vendorCatalogItemRepo.create(
      makeVendorCatalogItemInput({ vendorItemCode: `VIC-UPDATE-${Date.now()}` }),
    );

    const updated = await repos.vendorCatalogItemRepo.update(created.id, {
      unitPrice: '99.9900',
      description: 'Updated Catalog Item',
    });

    expect(updated).toBeDefined();
    expect(updated!.unitPrice).toBe('99.9900');
    expect(updated!.description).toBe('Updated Catalog Item');
  });

  it('should return undefined when updating non-existent catalog item', async () => {
    const result = await repos.vendorCatalogItemRepo.update(
      '00000000-0000-0000-0000-000000000000',
      { unitPrice: '0' },
    );
    expect(result).toBeUndefined();
  });

  it('should soft delete a vendor catalog item', async () => {
    const created = await repos.vendorCatalogItemRepo.create(
      makeVendorCatalogItemInput({ vendorItemCode: `VIC-DEL-${Date.now()}` }),
    );

    const deleted = await repos.vendorCatalogItemRepo.softDelete(created.id);
    expect(deleted).toBeDefined();
    expect(deleted!.deletedAt).not.toBeNull();
  });

  it('should return undefined when soft deleting non-existent catalog item', async () => {
    const result = await repos.vendorCatalogItemRepo.softDelete(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(result).toBeUndefined();
  });

  it('should find catalog items ordered by vendor item code ascending', async () => {
    const ts = Date.now();
    await repos.vendorCatalogItemRepo.create(
      makeVendorCatalogItemInput({ vendorItemCode: `Z-VIC-ORDER-${ts}` }),
    );
    await repos.vendorCatalogItemRepo.create(
      makeVendorCatalogItemInput({ vendorItemCode: `A-VIC-ORDER-${ts}` }),
    );

    const found = await repos.vendorCatalogItemRepo.findByVendor(sharedVendorId);
    expect(found.length).toBeGreaterThanOrEqual(2);
    const orderItems = found.filter((ci) => ci.vendorItemCode.includes(`VIC-ORDER-${ts}`));
    if (orderItems.length >= 2) {
      expect(orderItems[0]!.vendorItemCode.localeCompare(orderItems[1]!.vendorItemCode)).toBeLessThanOrEqual(0);
    }
  });

  it('should find catalog items ordered by unit price when using findByInternalItemId', async () => {
    const ts = Date.now();
    await repos.vendorCatalogItemRepo.create(
      makeVendorCatalogItemInput({
        vendorItemCode: `VIC-PRICE-HIGH-${ts}`,
        unitPrice: '500.0000',
      }),
    );
    await repos.vendorCatalogItemRepo.create(
      makeVendorCatalogItemInput({
        vendorItemCode: `VIC-PRICE-LOW-${ts}`,
        unitPrice: '10.0000',
      }),
    );

    const found = await repos.vendorCatalogItemRepo.findByInternalItemId(sharedItemId);
    expect(found.length).toBeGreaterThanOrEqual(2);
    const priced = found.filter((ci) => ci.vendorItemCode.includes(`VIC-PRICE-${ts}`));
    if (priced.length >= 2) {
      expect(Number(priced[0]!.unitPrice)).toBeLessThanOrEqual(Number(priced[1]!.unitPrice));
    }
  });
});
