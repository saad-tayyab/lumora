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

vi.mock('encore.dev/pubsub', () => ({
  Topic: class MockTopic {
    constructor(_name: string, _config?: unknown) {}
    async publish(_data: unknown) {
      return 'mock-message-id';
    }
  },
}));

vi.mock('./events', () => ({
  billReceived: { publish: vi.fn().mockResolvedValue('mock-message-id') },
}));

import * as service from './service';
import {
  vendors,
  bills,
  billLineItems,
  vendorPayments,
} from '@lumora/database/schema';
import { eq, and } from 'drizzle-orm';

const OTHER_TENANT_ID = '33333333-3333-4333-8333-333333333333';

async function cleanupApData(): Promise<void> {
  try {
    await testDb.delete(vendorPayments).where(
      and(
        eq(vendorPayments.tenantId, TEST_TENANT_ID),
      ),
    );
  } catch {}
  try {
    await testDb.delete(vendorPayments).where(
      and(
        eq(vendorPayments.tenantId, OTHER_TENANT_ID),
      ),
    );
  } catch {}
  try {
    await testDb.delete(billLineItems);
  } catch {}
  try {
    await testDb.delete(bills).where(eq(bills.tenantId, TEST_TENANT_ID));
  } catch {}
  try {
    await testDb.delete(bills).where(eq(bills.tenantId, OTHER_TENANT_ID));
  } catch {}
  try {
    await testDb.delete(vendors).where(eq(vendors.tenantId, TEST_TENANT_ID));
  } catch {}
  try {
    await testDb.delete(vendors).where(eq(vendors.tenantId, OTHER_TENANT_ID));
  } catch {}
}

function randomCode(prefix: string): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  const ts = Date.now().toString(36).slice(-4);
  const code = `${prefix}${ts}${suffix}`;
  return code.slice(0, 20);
}

function uniqueVendor() {
  const code = randomCode('VEND');
  return { name: `Vendor ${code}`, code, currency: 'USD' };
}

function uniqueBill(vendorId: string) {
  const billNumber = randomCode('BILL');
  return {
    vendorId,
    billNumber,
    billDate: '2026-01-15',
    dueDate: '2026-02-15',
    subtotal: '1000.0000',
    taxAmount: '100.0000',
    totalAmount: '1100.0000',
    currency: 'USD',
  };
}

// =============================================================================
// 1. Vendor Lifecycle
// =============================================================================

describe('Vendor Lifecycle (service layer)', () => {
  beforeAll(async () => {
    await cleanupApData();
  });

  afterAll(async () => {
    await cleanupApData();
    await cleanupTestData();
  });

  it('should create a vendor via service and persist to DB', async () => {
    const vendorData = uniqueVendor();
    const vendor = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);

    expect(vendor.id).toBeDefined();
    expect(vendor.name).toBe(vendorData.name);
    expect(vendor.code).toBe(vendorData.code);
    expect(vendor.tenantId).toBe(TEST_TENANT_ID);
    expect(vendor.isActive).toBe(true);

    const dbRow = await testDb.query.vendors.findFirst({
      where: eq(vendors.id, vendor.id),
    });
    expect(dbRow).toBeDefined();
    expect(dbRow!.name).toBe(vendorData.name);
    expect(dbRow!.code).toBe(vendorData.code);
  });

  it('should get a vendor by id via service', async () => {
    const vendorData = uniqueVendor();
    const created = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);

    const fetched = await service.getVendor(created.id, TEST_TENANT_ID);

    expect(fetched.id).toBe(created.id);
    expect(fetched.name).toBe(vendorData.name);
    expect(fetched.code).toBe(vendorData.code);
  });

  it('should update a vendor via service and reflect in DB', async () => {
    const vendorData = uniqueVendor();
    const created = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);

    const updated = await service.updateVendor(
      created.id,
      { name: 'Updated Name', email: 'updated@test.com' },
      TEST_TENANT_ID,
    );

    expect(updated.name).toBe('Updated Name');
    expect(updated.email).toBe('updated@test.com');

    const dbRow = await testDb.query.vendors.findFirst({
      where: eq(vendors.id, created.id),
    });
    expect(dbRow!.name).toBe('Updated Name');
    expect(dbRow!.email).toBe('updated@test.com');
  });

  it('should list vendors via service', async () => {
    const vendorData1 = uniqueVendor();
    const vendorData2 = uniqueVendor();
    await service.createVendor(vendorData1, TEST_TENANT_ID, TEST_USER_ID);
    await service.createVendor(vendorData2, TEST_TENANT_ID, TEST_USER_ID);

    const list = await service.listVendors(TEST_TENANT_ID, { page: 1, limit: 100 });

    expect(list.data.length).toBeGreaterThanOrEqual(2);
    expect(list.total).toBeGreaterThanOrEqual(2);
    expect(list.data.some((v) => v.code === vendorData1.code)).toBe(true);
    expect(list.data.some((v) => v.code === vendorData2.code)).toBe(true);
  });

  it('should reject duplicate vendor code', async () => {
    const code = randomCode('DUP');
    await service.createVendor({ name: 'First', code, currency: 'USD' }, TEST_TENANT_ID, TEST_USER_ID);

    await expect(
      service.createVendor({ name: 'Second', code, currency: 'USD' }, TEST_TENANT_ID, TEST_USER_ID),
    ).rejects.toThrow();
  });
});

// =============================================================================
// 2. Bill Lifecycle
// =============================================================================

describe('Bill Lifecycle (service layer)', () => {
  beforeAll(async () => {
    await cleanupApData();
  });

  afterAll(async () => {
    await cleanupApData();
    await cleanupTestData();
  });

  it('should create a bill linked to an active vendor', async () => {
    const vendorData = uniqueVendor();
    const vendor = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);
    const billData = uniqueBill(vendor.id);

    const bill = await service.createBill(billData, TEST_TENANT_ID, TEST_USER_ID);

    expect(bill.id).toBeDefined();
    expect(bill.vendorId).toBe(vendor.id);
    expect(bill.billNumber).toBe(billData.billNumber);
    expect(bill.status).toBe('draft');
    expect(bill.totalAmount).toBe('1100.0000');

    const dbRow = await testDb.query.bills.findFirst({
      where: eq(bills.id, bill.id),
    });
    expect(dbRow).toBeDefined();
    expect(dbRow!.vendorId).toBe(vendor.id);
  });

  it('should get a bill with computed outstanding amount', async () => {
    const vendorData = uniqueVendor();
    const vendor = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);
    const billData = uniqueBill(vendor.id);
    const bill = await service.createBill(billData, TEST_TENANT_ID, TEST_USER_ID);

    const fetched = await service.getBill(bill.id, TEST_TENANT_ID);

    expect(fetched.id).toBe(bill.id);
    expect(fetched.totalPaid).toBe('0');
    expect(fetched.outstandingAmount).toBe('1100');
  });

  it('should list bills via service', async () => {
    const vendorData = uniqueVendor();
    const vendor = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);

    await service.createBill(uniqueBill(vendor.id), TEST_TENANT_ID, TEST_USER_ID);
    await service.createBill(uniqueBill(vendor.id), TEST_TENANT_ID, TEST_USER_ID);

    const list = await service.listBills(TEST_TENANT_ID, { page: 1, limit: 100 });

    expect(list.data.length).toBeGreaterThanOrEqual(2);
    expect(list.total).toBeGreaterThanOrEqual(2);
  });

  it('should reject bill for inactive vendor', async () => {
    const vendorData = uniqueVendor();
    const vendor = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);
    await service.updateVendor(vendor.id, { isActive: false }, TEST_TENANT_ID);

    await expect(
      service.createBill(uniqueBill(vendor.id), TEST_TENANT_ID, TEST_USER_ID),
    ).rejects.toThrow();
  });
});

// =============================================================================
// 3. Bill with Line Items
// =============================================================================

describe('Bill with Line Items (service layer)', () => {
  beforeAll(async () => {
    await cleanupApData();
  });

  afterAll(async () => {
    await cleanupApData();
    await cleanupTestData();
  });

  it('should create a bill with line items and recalculate totals', async () => {
    const vendorData = uniqueVendor();
    const vendor = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);
    const billNumber = randomCode('LI');

    const bill = await service.createBill(
      {
        vendorId: vendor.id,
        billNumber,
        billDate: '2026-03-01',
        dueDate: '2026-04-01',
        subtotal: '0',
        taxAmount: '0',
        totalAmount: '0',
        currency: 'USD',
        lineItems: [
          { description: 'Widget A', quantity: '10', unitPrice: '25.0000', amount: '250.0000', taxAmount: '25.0000', sortOrder: 0 },
          { description: 'Widget B', quantity: '5', unitPrice: '50.0000', amount: '250.0000', taxAmount: '25.0000', sortOrder: 1 },
        ],
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    expect(bill.lineItems).toHaveLength(2);
    expect(bill.subtotal).toBe('500.0000');
    expect(bill.taxAmount).toBe('50.0000');
    expect(bill.totalAmount).toBe('550.0000');

    const dbLineItems = await testDb.query.billLineItems.findMany({
      where: eq(billLineItems.billId, bill.id),
    });
    expect(dbLineItems).toHaveLength(2);
    expect(dbLineItems.map((i) => i.description).sort()).toEqual(['Widget A', 'Widget B']);

    const dbBill = await testDb.query.bills.findFirst({
      where: eq(bills.id, bill.id),
    });
    expect(dbBill!.subtotal).toBe('500.0000');
    expect(dbBill!.totalAmount).toBe('550.0000');
  });

  it('should add a line item to a draft bill and recalculate totals', async () => {
    const vendorData = uniqueVendor();
    const vendor = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);
    const bill = await service.createBill(
      {
        vendorId: vendor.id,
        billNumber: randomCode('ALI'),
        billDate: '2026-03-01',
        dueDate: '2026-04-01',
        lineItems: [
          { description: 'Initial Item', amount: '100.0000', taxAmount: '10.0000', sortOrder: 0 },
        ],
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    expect(bill.subtotal).toBe('100.0000');
    expect(bill.totalAmount).toBe('110.0000');

    const newLineItem = await service.addBillLineItem(
      bill.id,
      { description: 'Added Item', quantity: '2', unitPrice: '75.0000', amount: '150.0000', taxAmount: '15.0000' },
      TEST_TENANT_ID,
    );

    expect(newLineItem.description).toBe('Added Item');
    expect(newLineItem.billId).toBe(bill.id);

    const dbLineItems = await testDb.query.billLineItems.findMany({
      where: eq(billLineItems.billId, bill.id),
    });
    expect(dbLineItems).toHaveLength(2);

    const refreshedBill = await service.getBill(bill.id, TEST_TENANT_ID);
    expect(refreshedBill.subtotal).toBe('250.0000');
    expect(refreshedBill.taxAmount).toBe('25.0000');
    expect(refreshedBill.totalAmount).toBe('275.0000');
  });
});

// =============================================================================
// 4. Bill Status Transitions
// =============================================================================

describe('Bill Status Transitions (service layer)', () => {
  beforeAll(async () => {
    await cleanupApData();
  });

  afterAll(async () => {
    await cleanupApData();
    await cleanupTestData();
  });

  it('should transition draft → pending_approval → approved', async () => {
    const vendorData = uniqueVendor();
    const vendor = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);
    const bill = await service.createBill(
      {
        vendorId: vendor.id,
        billNumber: randomCode('ST'),
        billDate: '2026-01-01',
        dueDate: '2026-02-01',
        subtotal: '500.0000',
        taxAmount: '50.0000',
        totalAmount: '550.0000',
        lineItems: [
          { description: 'Service', amount: '500.0000', taxAmount: '50.0000' },
        ],
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    expect(bill.status).toBe('draft');

    const submitted = await service.submitBillForApproval(bill.id, TEST_TENANT_ID);
    expect(submitted.status).toBe('pending_approval');

    const approved = await service.approveBill(bill.id, TEST_TENANT_ID);
    expect(approved.status).toBe('approved');

    const dbBill = await testDb.query.bills.findFirst({
      where: eq(bills.id, bill.id),
    });
    expect(dbBill!.status).toBe('approved');
  });

  it('should reject approving a draft bill', async () => {
    const vendorData = uniqueVendor();
    const vendor = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);
    const bill = await service.createBill(
      {
        vendorId: vendor.id,
        billNumber: randomCode('ND'),
        billDate: '2026-01-01',
        dueDate: '2026-02-01',
        subtotal: '0',
        taxAmount: '0',
        totalAmount: '0',
        lineItems: [{ description: 'Fee', amount: '100.0000' }],
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    await expect(service.approveBill(bill.id, TEST_TENANT_ID)).rejects.toThrow();
  });

  it('should void a draft bill', async () => {
    const vendorData = uniqueVendor();
    const vendor = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);
    const bill = await service.createBill(
      {
        vendorId: vendor.id,
        billNumber: randomCode('VD'),
        billDate: '2026-01-01',
        dueDate: '2026-02-01',
        subtotal: '0',
        taxAmount: '0',
        totalAmount: '0',
        lineItems: [{ description: 'Item', amount: '50.0000' }],
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    const voided = await service.voidBill(bill.id, TEST_TENANT_ID);
    expect(voided.status).toBe('voided');

    const dbBill = await testDb.query.bills.findFirst({
      where: eq(bills.id, bill.id),
    });
    expect(dbBill!.status).toBe('voided');
  });
});

// =============================================================================
// 5. Payment Flow
// =============================================================================

describe('Payment Flow (service layer)', () => {
  beforeAll(async () => {
    await cleanupApData();
  });

  afterAll(async () => {
    await cleanupApData();
    await cleanupTestData();
  });

  it('should create a payment against an approved bill and update bill status', async () => {
    const vendorData = uniqueVendor();
    const vendor = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);
    const bill = await service.createBill(
      {
        vendorId: vendor.id,
        billNumber: randomCode('PF'),
        billDate: '2026-01-01',
        dueDate: '2026-02-01',
        subtotal: '1000.0000',
        taxAmount: '0',
        totalAmount: '1000.0000',
        lineItems: [{ description: 'Invoice item', amount: '1000.0000' }],
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    await service.submitBillForApproval(bill.id, TEST_TENANT_ID);
    await service.approveBill(bill.id, TEST_TENANT_ID);

    const payment = await service.createVendorPayment(
      {
        vendorId: vendor.id,
        billId: bill.id,
        amount: '400.0000',
        paymentDate: '2026-02-15',
        paymentMethod: 'bank_transfer',
        currency: 'USD',
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    expect(payment.id).toBeDefined();
    expect(payment.amount).toBe('400.0000');
    expect(payment.billId).toBe(bill.id);

    const dbBill = await testDb.query.bills.findFirst({
      where: eq(bills.id, bill.id),
    });
    expect(dbBill!.status).toBe('partially_paid');

    const refreshed = await service.getBill(bill.id, TEST_TENANT_ID);
    expect(refreshed.totalPaid).toBe('400');
    expect(refreshed.outstandingAmount).toBe('600');
  });

  it('should mark bill as paid when full amount is received', async () => {
    const vendorData = uniqueVendor();
    const vendor = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);
    const bill = await service.createBill(
      {
        vendorId: vendor.id,
        billNumber: randomCode('FP'),
        billDate: '2026-01-01',
        dueDate: '2026-02-01',
        subtotal: '500.0000',
        taxAmount: '0',
        totalAmount: '500.0000',
        lineItems: [{ description: 'Full payment item', amount: '500.0000' }],
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    await service.submitBillForApproval(bill.id, TEST_TENANT_ID);
    await service.approveBill(bill.id, TEST_TENANT_ID);

    await service.createVendorPayment(
      {
        vendorId: vendor.id,
        billId: bill.id,
        amount: '500.0000',
        paymentDate: '2026-02-20',
        paymentMethod: 'bank_transfer',
        currency: 'USD',
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    const dbBill = await testDb.query.bills.findFirst({
      where: eq(bills.id, bill.id),
    });
    expect(dbBill!.status).toBe('paid');
  });
});

// =============================================================================
// 6. Tenant Isolation
// =============================================================================

describe('Tenant Isolation (service layer)', () => {
  beforeAll(async () => {
    await cleanupApData();
  });

  afterAll(async () => {
    await cleanupApData();
    await cleanupTestData();
  });

  it('should not find vendor from other tenant', async () => {
    const vendorData = uniqueVendor();
    const vendor = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);

    await expect(service.getVendor(vendor.id, OTHER_TENANT_ID)).rejects.toThrow();
  });

  it('should not find bill from other tenant', async () => {
    const vendorData = uniqueVendor();
    const vendor = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);
    const bill = await service.createBill(
      {
        vendorId: vendor.id,
        billNumber: randomCode('ISO'),
        billDate: '2026-01-01',
        dueDate: '2026-02-01',
        subtotal: '0',
        taxAmount: '0',
        totalAmount: '0',
        lineItems: [{ description: 'Item', amount: '100.0000' }],
      },
      TEST_TENANT_ID,
      TEST_USER_ID,
    );

    await expect(service.getBill(bill.id, OTHER_TENANT_ID)).rejects.toThrow();
  });

  it('should not allow creating bill for vendor in another tenant', async () => {
    const vendorData = uniqueVendor();
    const vendor = await service.createVendor(vendorData, TEST_TENANT_ID, TEST_USER_ID);

    await expect(
      service.createBill(
        {
          vendorId: vendor.id,
          billNumber: randomCode('XBT'),
          billDate: '2026-01-01',
          dueDate: '2026-02-01',
          subtotal: '0',
          taxAmount: '0',
          totalAmount: '0',
          lineItems: [{ description: 'Cross', amount: '100.0000' }],
        },
        OTHER_TENANT_ID,
        TEST_USER_ID,
      ),
    ).rejects.toThrow();
  });
});
