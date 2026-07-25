import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { testDb, TEST_TENANT_ID, TEST_USER_ID, cleanupTestData } from '../../lib/integration-test-utils';

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message);
      this.code = code;
      this.status = opts?.status ?? 500;
    }
  },
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));
vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class {
    connectionString = '';
    constructor(_n: string, _c?: unknown) {}
  },
}));
vi.mock('../../database', () => ({ db: testDb }));

import * as service from './service';
import * as schema from '@lumora/database/schema';
import { eq } from 'drizzle-orm';

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

// ── Shared Prerequisite IDs ──────────────────────────────────────────────────

let sharedVendorId: string;
let sharedItemId: string;
let sharedWarehouseId: string;
let sharedEmployeeId: string;

// ── Helpers ──────────────────────────────────────────────────────────────────

function randomCode(prefix: string): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  const ts = Date.now().toString(36).slice(-4);
  const code = `${prefix}${ts}${suffix}`;
  return code.slice(0, 20);
}

async function cleanupProcTestData(): Promise<void> {
  try {
    await testDb.delete(vendorCatalogItems);
  } catch {}
  try {
    await testDb.delete(receivingReports).where(eq(receivingReports.tenantId, TEST_TENANT_ID));
  } catch {}
  try {
    await testDb.delete(poLineItems);
  } catch {}
  try {
    await testDb.delete(purchaseOrders).where(eq(purchaseOrders.tenantId, TEST_TENANT_ID));
  } catch {}
  try {
    await testDb.delete(vendors).where(eq(vendors.tenantId, TEST_TENANT_ID));
  } catch {}
  try {
    await testDb.delete(items).where(eq(items.tenantId, TEST_TENANT_ID));
  } catch {}
  try {
    await testDb.delete(itemCategories).where(eq(itemCategories.tenantId, TEST_TENANT_ID));
  } catch {}
  try {
    await testDb.delete(unitOfMeasures).where(eq(unitOfMeasures.code, 'TEST-UOM'));
  } catch {}
  try {
    await testDb.delete(warehouses).where(eq(warehouses.tenantId, TEST_TENANT_ID));
  } catch {}
  try {
    await testDb.delete(employees).where(eq(employees.tenantId, TEST_TENANT_ID));
  } catch {}
  try {
    await testDb.delete(departments).where(eq(departments.code, 'TEST-DEPT'));
  } catch {}
  try {
    await testDb.delete(designations).where(eq(designations.code, 'TEST-DESIG'));
  } catch {}
}

async function seedPrerequisites(tenantId: string) {
  const [uom] = await testDb
    .insert(unitOfMeasures)
    .values({ code: 'TEST-UOM', name: 'Test UOM', category: 'count' })
    .returning()
    .onConflictDoNothing({ target: unitOfMeasures.code });

  const existingUom = uom ?? (
    await testDb.query.unitOfMeasures.findFirst({ where: eq(unitOfMeasures.code, 'TEST-UOM') })
  );

  const [dept] = await testDb
    .insert(departments)
    .values({
      name: 'Test Department',
      code: 'TEST-DEPT',
      status: 'active',
      tenantId,
    })
    .returning()
    .onConflictDoNothing({ target: departments.code });

  const existingDept = dept ?? (
    await testDb.query.departments.findFirst({ where: eq(departments.code, 'TEST-DEPT') })
  );

  const [desig] = await testDb
    .insert(designations)
    .values({
      name: 'Test Designation',
      code: 'TEST-DESIG',
      level: 1,
      isActive: true,
    })
    .returning()
    .onConflictDoNothing({ target: designations.code });

  const existingDesig = desig ?? (
    await testDb.query.designations.findFirst({ where: eq(designations.code, 'TEST-DESIG') })
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
      name: `Test Vendor ${Date.now()}`,
      code: `V-${Date.now()}`,
      email: `vendor-${Date.now()}@example.com`,
      tenantId,
      createdBy: TEST_USER_ID,
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
    vendorId: sharedVendorId,
    poNumber: randomCode('PO'),
    orderDate: '2026-07-25',
    shippingAddressLine1: '100 Test St',
    shippingCity: 'Testville',
    shippingState: 'TS',
    shippingPostalCode: '12345',
    currency: 'USD',
    paymentTerms: 'Net 30',
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Purchase Order Lifecycle: create PO → submit → approve → receive
// ═══════════════════════════════════════════════════════════════════════════════

describe('Purchase Order Lifecycle (service layer)', () => {
  beforeAll(async () => {
    await cleanupProcTestData();
    await seedPrerequisites(TEST_TENANT_ID);
  });

  afterAll(async () => {
    await cleanupProcTestData();
    await cleanupTestData();
  });

  it('should create a purchase order in draft status', async () => {
    const po = await service.createPurchaseOrder(
      makePoInput({ lineItems: [{ itemId: sharedItemId, description: 'Widget', quantity: '5', unitOfMeasure: 'EA', unitPrice: '100', amount: '500' }] }),
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    expect(po.id).toBeDefined();
    expect(po.status).toBe('draft');
    expect(po.vendorId).toBe(sharedVendorId);
    expect(po.tenantId).toBe(TEST_TENANT_ID);
    expect(po.lineItems).toHaveLength(1);

    const dbRow = await testDb.query.purchaseOrders.findFirst({
      where: eq(purchaseOrders.id, po.id),
    });
    expect(dbRow).toBeDefined();
    expect(dbRow!.status).toBe('draft');
  });

  it('should submit a draft PO with line items for approval', async () => {
    const po = await service.createPurchaseOrder(
      makePoInput({ lineItems: [{ itemId: sharedItemId, description: 'Gadget', quantity: '10', unitOfMeasure: 'EA', unitPrice: '25', amount: '250' }] }),
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    const submitted = await service.submitPoForApproval(po.id, TEST_TENANT_ID);
    expect(submitted.status).toBe('pending_approval');

    const dbRow = await testDb.query.purchaseOrders.findFirst({
      where: eq(purchaseOrders.id, po.id),
    });
    expect(dbRow!.status).toBe('pending_approval');
  });

  it('should approve a pending PO', async () => {
    const po = await service.createPurchaseOrder(
      makePoInput({ lineItems: [{ itemId: sharedItemId, description: 'Part', quantity: '20', unitOfMeasure: 'EA', unitPrice: '15', amount: '300' }] }),
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    await service.submitPoForApproval(po.id, TEST_TENANT_ID);
    const approved = await service.approvePo(po.id, TEST_TENANT_ID, TEST_USER_ID);

    expect(approved.status).toBe('approved');
    expect(approved.approvedBy).toBe(TEST_USER_ID);
    expect(approved.approvedAt).toBeDefined();

    const dbRow = await testDb.query.purchaseOrders.findFirst({
      where: eq(purchaseOrders.id, po.id),
    });
    expect(dbRow!.status).toBe('approved');
  });

  it('should reject submitting a PO with no line items', async () => {
    const po = await service.createPurchaseOrder(makePoInput(), TEST_TENANT_ID, TEST_USER_ID);

    await expect(service.submitPoForApproval(po.id, TEST_TENANT_ID)).rejects.toThrow();
  });

  it('should reject approving a draft PO (must be pending_approval)', async () => {
    const po = await service.createPurchaseOrder(
      makePoInput({ lineItems: [{ itemId: sharedItemId, description: 'Item', quantity: '1', unitOfMeasure: 'EA', unitPrice: '10', amount: '10' }] }),
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    await expect(service.approvePo(po.id, TEST_TENANT_ID, TEST_USER_ID)).rejects.toThrow();
  });

  it('should reject duplicate PO number within tenant', async () => {
    const poNumber = randomCode('DUP-PO');
    await service.createPurchaseOrder(makePoInput({ poNumber }), TEST_TENANT_ID, TEST_USER_ID);

    await expect(
      service.createPurchaseOrder(makePoInput({ poNumber }), TEST_TENANT_ID, TEST_USER_ID),
    ).rejects.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. PO with Line Items: create → verify totals → add more → verify recalc
// ═══════════════════════════════════════════════════════════════════════════════

describe('PO with Line Items (service layer)', () => {
  beforeAll(async () => {
    await cleanupProcTestData();
    await seedPrerequisites(TEST_TENANT_ID);
  });

  afterAll(async () => {
    await cleanupProcTestData();
    await cleanupTestData();
  });

  it('should create a PO with multiple line items and calculate totals', async () => {
    const po = await service.createPurchaseOrder(
      makePoInput({
        lineItems: [
          { itemId: sharedItemId, description: 'Widget A', quantity: '10', unitOfMeasure: 'EA', unitPrice: '50', amount: '500', taxRate: '0.1', taxAmount: '50' },
          { itemId: sharedItemId, description: 'Widget B', quantity: '5', unitOfMeasure: 'EA', unitPrice: '100', amount: '500', taxRate: '0.1', taxAmount: '50' },
        ],
      }),
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    expect(po.lineItems).toHaveLength(2);
    expect(Number.parseFloat(po.subtotal)).toBe(1000);
    expect(Number.parseFloat(po.taxAmount)).toBe(100);
    expect(Number.parseFloat(po.total)).toBe(1100);

    const dbLineItems = await testDb.query.poLineItems.findMany({
      where: eq(poLineItems.poId, po.id),
    });
    expect(dbLineItems).toHaveLength(2);
    expect(dbLineItems.map((i) => i.description).sort()).toEqual(['Widget A', 'Widget B']);

    const dbPo = await testDb.query.purchaseOrders.findFirst({
      where: eq(purchaseOrders.id, po.id),
    });
    expect(dbPo!.subtotal).toBe('1000.0000');
    expect(dbPo!.total).toBe('1100.0000');
  });

  it('should add a line item to a draft PO and recalculate totals', async () => {
    const po = await service.createPurchaseOrder(
      makePoInput({
        lineItems: [
          { itemId: sharedItemId, description: 'Initial Item', quantity: '2', unitOfMeasure: 'EA', unitPrice: '100', amount: '200' },
        ],
      }),
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    expect(Number.parseFloat(po.subtotal)).toBe(200);

    const newLine = await service.addPoLineItem(
      po.id,
      { itemId: sharedItemId, description: 'Added Item', quantity: '3', unitOfMeasure: 'EA', unitPrice: '50', amount: '150' },
      TEST_TENANT_ID,
    );

    expect(newLine.description).toBe('Added Item');
    expect(newLine.poId).toBe(po.id);

    const refreshed = await service.getPurchaseOrder(po.id, TEST_TENANT_ID);
    expect(refreshed.lineItems).toHaveLength(2);
    expect(Number.parseFloat(refreshed.subtotal)).toBe(350);
  });

  it('should get a PO with line items by id', async () => {
    const po = await service.createPurchaseOrder(
      makePoInput({
        lineItems: [
          { itemId: sharedItemId, description: 'Fetch Me', quantity: '7', unitOfMeasure: 'EA', unitPrice: '30', amount: '210' },
        ],
      }),
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    const fetched = await service.getPurchaseOrder(po.id, TEST_TENANT_ID);
    expect(fetched.id).toBe(po.id);
    expect(fetched.lineItems).toHaveLength(1);
    expect(fetched.lineItems![0].description).toBe('Fetch Me');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Receiving Flow: create PO → approve → create RR → confirm → verify
// ═══════════════════════════════════════════════════════════════════════════════

describe('Receiving Flow (service layer)', () => {
  beforeAll(async () => {
    await cleanupProcTestData();
    await seedPrerequisites(TEST_TENANT_ID);
  });

  afterAll(async () => {
    await cleanupProcTestData();
    await cleanupTestData();
  });

  it('should create a receiving report against an approved PO', async () => {
    const po = await service.createPurchaseOrder(
      makePoInput({
        lineItems: [
          { itemId: sharedItemId, description: 'Receive A', quantity: '10', unitOfMeasure: 'EA', unitPrice: '20', amount: '200' },
        ],
      }),
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
    await service.submitPoForApproval(po.id, TEST_TENANT_ID);
    await service.approvePo(po.id, TEST_TENANT_ID, TEST_USER_ID);

    const rr = await service.createReceivingReport(
      {
        poId: po.id,
        rrNumber: randomCode('RR'),
        vendorId: sharedVendorId,
        receivedDate: '2026-07-25',
        receivedBy: sharedEmployeeId,
        warehouseId: sharedWarehouseId,
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    expect(rr.id).toBeDefined();
    expect(rr.poId).toBe(po.id);
    expect(rr.status).toBe('draft');

    const dbRr = await testDb.query.receivingReports.findFirst({
      where: eq(receivingReports.id, rr.id),
    });
    expect(dbRr).toBeDefined();
    expect(dbRr!.poId).toBe(po.id);
  });

  it('should reject creating a receiving report for a draft PO', async () => {
    const po = await service.createPurchaseOrder(
      makePoInput({
        lineItems: [
          { itemId: sharedItemId, description: 'Nope', quantity: '1', unitOfMeasure: 'EA', unitPrice: '10', amount: '10' },
        ],
      }),
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    await expect(
      service.createReceivingReport(
        {
          poId: po.id,
          rrNumber: randomCode('RR'),
          vendorId: sharedVendorId,
          receivedDate: '2026-07-25',
          receivedBy: sharedEmployeeId,
          warehouseId: sharedWarehouseId,
        },
        TEST_TENANT_ID,
        TEST_USER_ID,
      ),
    ).rejects.toThrow();
  });

  it('should confirm a receiving report and update PO to partially_received', async () => {
    const po = await service.createPurchaseOrder(
      makePoInput({
        lineItems: [
          { itemId: sharedItemId, description: 'Partial', quantity: '10', unitOfMeasure: 'EA', unitPrice: '10', amount: '100' },
        ],
      }),
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
    await service.submitPoForApproval(po.id, TEST_TENANT_ID);
    await service.approvePo(po.id, TEST_TENANT_ID, TEST_USER_ID);

    const rr = await service.createReceivingReport(
      {
        poId: po.id,
        rrNumber: randomCode('RR'),
        vendorId: sharedVendorId,
        receivedDate: '2026-07-25',
        receivedBy: sharedEmployeeId,
        warehouseId: sharedWarehouseId,
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    const confirmed = await service.confirmReceivingReport(rr.id, TEST_TENANT_ID);
    expect(confirmed.status).toBe('confirmed');

    const dbPo = await testDb.query.purchaseOrders.findFirst({
      where: eq(purchaseOrders.id, po.id),
    });
    expect(dbPo!.status).toBe('partially_received');
  });

  it('should reject confirming an already-confirmed receiving report', async () => {
    const po = await service.createPurchaseOrder(
      makePoInput({
        lineItems: [
          { itemId: sharedItemId, description: 'Dup Confirm', quantity: '5', unitOfMeasure: 'EA', unitPrice: '20', amount: '100' },
        ],
      }),
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
    await service.submitPoForApproval(po.id, TEST_TENANT_ID);
    await service.approvePo(po.id, TEST_TENANT_ID, TEST_USER_ID);

    const rr = await service.createReceivingReport(
      {
        poId: po.id,
        rrNumber: randomCode('RR'),
        vendorId: sharedVendorId,
        receivedDate: '2026-07-25',
        receivedBy: sharedEmployeeId,
        warehouseId: sharedWarehouseId,
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    await service.confirmReceivingReport(rr.id, TEST_TENANT_ID);

    await expect(service.confirmReceivingReport(rr.id, TEST_TENANT_ID)).rejects.toThrow();
  });

  it('should list receiving reports for a PO', async () => {
    const po = await service.createPurchaseOrder(
      makePoInput({
        lineItems: [
          { itemId: sharedItemId, description: 'List RR', quantity: '3', unitOfMeasure: 'EA', unitPrice: '50', amount: '150' },
        ],
      }),
      TEST_TENANT_ID,
      TEST_USER_ID,
    );
    await service.submitPoForApproval(po.id, TEST_TENANT_ID);
    await service.approvePo(po.id, TEST_TENANT_ID, TEST_USER_ID);

    await service.createReceivingReport(
      {
        poId: po.id,
        rrNumber: randomCode('RR'),
        vendorId: sharedVendorId,
        receivedDate: '2026-07-25',
        receivedBy: sharedEmployeeId,
        warehouseId: sharedWarehouseId,
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    const list = await service.listReceivingReports(TEST_TENANT_ID, { poId: po.id });
    expect(list.data.length).toBeGreaterThanOrEqual(1);
    expect(list.data.every((rr) => rr.poId === po.id)).toBe(true);
  });
});
