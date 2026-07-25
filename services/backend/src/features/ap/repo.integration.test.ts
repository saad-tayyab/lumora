import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { testDb, TEST_TENANT_ID, cleanupTestData } from '../../lib/integration-test-utils';
import {
  vendors,
  bills,
  billLineItems,
  vendorPayments,
  paymentSchedules,
} from '@lumora/database/schema';
import {
  vendorRepo as vendorsRepo,
  billRepo as billsRepo,
  billLineItemRepo as billLineItemsRepo,
  vendorPaymentRepo as vendorPaymentsRepo,
  paymentScheduleRepo as paymentSchedulesRepo,
} from './repo';

vi.mock('../../database', () => ({
  db: testDb,
}));

vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class {
    connectionString = '';
  },
}));

vi.mock('encore.dev/api', () => ({
  APIError: class extends Error {
    constructor(public code: string, message: string) {
      super(message);
    }
  },
}));

const OTHER_TENANT_ID = '33333333-3333-4333-8333-333333333333';

function randomCode(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

async function cleanupApData(): Promise<void> {
  await testDb.delete(paymentSchedules).where(paymentSchedules.tenantId.eq(TEST_TENANT_ID));
  await testDb.delete(paymentSchedules).where(paymentSchedules.tenantId.eq(OTHER_TENANT_ID));
  await testDb.delete(vendorPayments).where(vendorPayments.tenantId.eq(TEST_TENANT_ID));
  await testDb.delete(vendorPayments).where(vendorPayments.tenantId.eq(OTHER_TENANT_ID));
  await testDb.delete(billLineItems);
  await testDb.delete(bills).where(bills.tenantId.eq(TEST_TENANT_ID));
  await testDb.delete(bills).where(bills.tenantId.eq(OTHER_TENANT_ID));
  await testDb.delete(vendors).where(vendors.tenantId.eq(TEST_TENANT_ID));
  await testDb.delete(vendors).where(vendors.tenantId.eq(OTHER_TENANT_ID));
}

async function createTestVendor(overrides?: Partial<{ name: string; code: string }>) {
  const code = overrides?.code ?? randomCode('VEND');
  return vendorsRepo.create({
    tenantId: TEST_TENANT_ID,
    name: overrides?.name ?? `Vendor ${code}`,
    code,
    currency: 'USD',
  });
}

async function createTestBill(vendorId: string, overrides?: Partial<{ billNumber: string; status: string }>) {
  const billNumber = overrides?.billNumber ?? randomCode('BILL');
  return billsRepo.create({
    tenantId: TEST_TENANT_ID,
    vendorId,
    billNumber,
    billDate: '2026-01-15',
    dueDate: '2026-02-15',
    subtotal: '1000.0000',
    taxAmount: '100.0000',
    totalAmount: '1100.0000',
    currency: 'USD',
    status: (overrides?.status ?? 'draft') as 'draft' | 'pending_approval' | 'approved' | 'partially_paid' | 'paid' | 'voided',
  });
}

// =============================================================================
// vendorsRepo
// =============================================================================

describe('vendorsRepo', () => {
  beforeAll(async () => {
    await cleanupApData();
  });

  afterAll(async () => {
    await cleanupApData();
    await cleanupTestData();
  });

  it('should create a vendor and return it', async () => {
    const vendor = await vendorsRepo.create({
      tenantId: TEST_TENANT_ID,
      name: 'Acme Supplies',
      code: 'ACME',
      currency: 'USD',
    });

    expect(vendor).toBeDefined();
    expect(vendor.id).toBeDefined();
    expect(vendor.name).toBe('Acme Supplies');
    expect(vendor.code).toBe('ACME');
    expect(vendor.tenantId).toBe(TEST_TENANT_ID);
    expect(vendor.currency).toBe('USD');
    expect(vendor.isActive).toBe(true);
  });

  it('should find a vendor by id', async () => {
    const created = await vendorsRepo.create({
      tenantId: TEST_TENANT_ID,
      name: 'Find By ID Vendor',
      code: randomCode('FBID'),
      currency: 'USD',
    });

    const found = await vendorsRepo.findById(created.id, TEST_TENANT_ID);

    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.name).toBe('Find By ID Vendor');
  });

  it('should return undefined for non-existent vendor id', async () => {
    const found = await vendorsRepo.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );

    expect(found).toBeUndefined();
  });

  it('should find a vendor by code', async () => {
    const code = randomCode('FBC');
    await vendorsRepo.create({
      tenantId: TEST_TENANT_ID,
      name: 'Find By Code Vendor',
      code,
      currency: 'USD',
    });

    const found = await vendorsRepo.findByCode(code, TEST_TENANT_ID);

    expect(found).toBeDefined();
    expect(found!.code).toBe(code);
  });

  it('should return undefined for non-existent vendor code', async () => {
    const found = await vendorsRepo.findByCode('NONEXIST', TEST_TENANT_ID);

    expect(found).toBeUndefined();
  });

  it('should find many vendors with pagination', async () => {
    const prefix = randomCode('PAGE');
    const created: Awaited<ReturnType<typeof vendorsRepo.create>>[] = [];

    for (let i = 0; i < 5; i++) {
      const v = await vendorsRepo.create({
        tenantId: TEST_TENANT_ID,
        name: `${prefix}-vendor-${i}`,
        code: `${prefix}-${i}`,
        currency: 'USD',
      });
      created.push(v);
    }

    const page1 = await vendorsRepo.findMany(TEST_TENANT_ID, { page: 1, limit: 2 });

    expect(page1.data.length).toBeLessThanOrEqual(2);
    expect(page1.total).toBeGreaterThanOrEqual(5);
    expect(page1.page).toBe(1);
    expect(page1.limit).toBe(2);

    const page2 = await vendorsRepo.findMany(TEST_TENANT_ID, { page: 2, limit: 2 });

    expect(page2.data.length).toBeLessThanOrEqual(2);
    expect(page2.page).toBe(2);

    const page3 = await vendorsRepo.findMany(TEST_TENANT_ID, { page: 3, limit: 2 });

    const page1Ids = page1.data.map((v) => v.id);
    const page2Ids = page2.data.map((v) => v.id);
    const page3Ids = page3.data.map((v) => v.id);

    expect(page1Ids.every((id) => !page2Ids.includes(id))).toBe(true);
    expect(page2Ids.every((id) => !page3Ids.includes(id))).toBe(true);
  });

  it('should update a vendor', async () => {
    const vendor = await createTestVendor({ name: 'Before Update' });

    const updated = await vendorsRepo.update(vendor.id, TEST_TENANT_ID, {
      name: 'After Update',
      email: 'updated@example.com',
    });

    expect(updated).toBeDefined();
    expect(updated!.name).toBe('After Update');
    expect(updated!.email).toBe('updated@example.com');
  });

  it('should return undefined when updating non-existent vendor', async () => {
    const result = await vendorsRepo.update(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
      { name: 'Ghost' },
    );

    expect(result).toBeUndefined();
  });

  it('should soft delete a vendor', async () => {
    const vendor = await createTestVendor({ name: 'To Be Soft Deleted' });

    const result = await vendorsRepo.softDelete(vendor.id, TEST_TENANT_ID);

    expect(result).toBeDefined();
    expect(result!.deletedAt).not.toBeNull();

    const found = await vendorsRepo.findById(vendor.id, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.deletedAt).not.toBeNull();
  });

  it('should enforce tenant isolation on vendors', async () => {
    const vendor = await createTestVendor({ name: 'Tenant Isolation Vendor' });

    const found = await vendorsRepo.findById(vendor.id, OTHER_TENANT_ID);

    expect(found).toBeUndefined();
  });

  it('should enforce tenant isolation on vendor update', async () => {
    const vendor = await createTestVendor({ name: 'Tenant Update Isolation' });

    const result = await vendorsRepo.update(vendor.id, OTHER_TENANT_ID, {
      name: 'Hacked Name',
    });

    expect(result).toBeUndefined();
  });

  it('should enforce tenant isolation on vendor code lookup', async () => {
    const code = randomCode('TI');
    await vendorsRepo.create({
      tenantId: TEST_TENANT_ID,
      name: 'Tenant Code Isolation',
      code,
      currency: 'USD',
    });

    const found = await vendorsRepo.findByCode(code, OTHER_TENANT_ID);

    expect(found).toBeUndefined();
  });
});

// =============================================================================
// billsRepo
// =============================================================================

describe('billsRepo', () => {
  let testVendorId: string;

  beforeAll(async () => {
    await cleanupApData();
    const vendor = await createTestVendor({ name: 'Bill Test Vendor', code: 'BTV' });
    testVendorId = vendor.id;
  });

  afterAll(async () => {
    await cleanupApData();
  });

  it('should create a bill and return it', async () => {
    const bill = await billsRepo.create({
      tenantId: TEST_TENANT_ID,
      vendorId: testVendorId,
      billNumber: 'BILL-001',
      billDate: '2026-01-15',
      dueDate: '2026-02-15',
      subtotal: '500.0000',
      taxAmount: '50.0000',
      totalAmount: '550.0000',
      currency: 'USD',
      status: 'draft',
    });

    expect(bill).toBeDefined();
    expect(bill.id).toBeDefined();
    expect(bill.billNumber).toBe('BILL-001');
    expect(bill.vendorId).toBe(testVendorId);
    expect(bill.status).toBe('draft');
    expect(bill.totalAmount).toBe('550.0000');
  });

  it('should find a bill by id', async () => {
    const created = await createTestBill(testVendorId, { billNumber: randomCode('FIND') });

    const found = await billsRepo.findById(created.id, TEST_TENANT_ID);

    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.billNumber).toBe(created.billNumber);
  });

  it('should return undefined for non-existent bill id', async () => {
    const found = await billsRepo.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );

    expect(found).toBeUndefined();
  });

  it('should find many bills with pagination', async () => {
    const prefix = randomCode('BP');
    for (let i = 0; i < 4; i++) {
      await createTestBill(testVendorId, { billNumber: `${prefix}-${i}` });
    }

    const result = await billsRepo.findMany(TEST_TENANT_ID, { page: 1, limit: 2 });

    expect(result.data.length).toBeLessThanOrEqual(2);
    expect(result.total).toBeGreaterThanOrEqual(4);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
  });

  it('should filter bills by status', async () => {
    const approvedCode = randomCode('APPR');
    const draftCode = randomCode('DRFT');

    await createTestBill(testVendorId, { billNumber: approvedCode, status: 'approved' });
    await createTestBill(testVendorId, { billNumber: draftCode, status: 'draft' });

    const approved = await billsRepo.findMany(TEST_TENANT_ID, {
      page: 1,
      limit: 50,
      status: 'approved',
    });

    expect(approved.data.every((b) => b.status === 'approved')).toBe(true);

    const drafts = await billsRepo.findMany(TEST_TENANT_ID, {
      page: 1,
      limit: 50,
      status: 'draft',
    });

    expect(drafts.data.every((b) => b.status === 'draft')).toBe(true);
  });

  it('should update a bill', async () => {
    const bill = await createTestBill(testVendorId, { billNumber: randomCode('UPD') });

    const updated = await billsRepo.update(bill.id, TEST_TENANT_ID, {
      status: 'approved',
      notes: 'Approved by test',
    });

    expect(updated).toBeDefined();
    expect(updated!.status).toBe('approved');
    expect(updated!.notes).toBe('Approved by test');
  });

  it('should return undefined when updating non-existent bill', async () => {
    const result = await billsRepo.update(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
      { status: 'paid' },
    );

    expect(result).toBeUndefined();
  });

  it('should soft delete a bill', async () => {
    const bill = await createTestBill(testVendorId, { billNumber: randomCode('DEL') });

    const result = await billsRepo.softDelete(bill.id, TEST_TENANT_ID);

    expect(result).toBeDefined();
    expect(result!.deletedAt).not.toBeNull();

    const found = await billsRepo.findById(bill.id, TEST_TENANT_ID);
    expect(found!.deletedAt).not.toBeNull();
  });

  it('should enforce tenant isolation on bills', async () => {
    const bill = await createTestBill(testVendorId, { billNumber: randomCode('ISO') });

    const found = await billsRepo.findById(bill.id, OTHER_TENANT_ID);

    expect(found).toBeUndefined();
  });

  it('should find bills by vendor id', async () => {
    const prefix = randomCode('BV');
    await createTestBill(testVendorId, { billNumber: `${prefix}-a` });
    await createTestBill(testVendorId, { billNumber: `${prefix}-b` });

    const result = await billsRepo.findByVendorId(testVendorId, TEST_TENANT_ID);

    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.every((b) => b.vendorId === testVendorId)).toBe(true);
  });

  it('should find pending approval bills', async () => {
    const code = randomCode('PEND');
    await createTestBill(testVendorId, { billNumber: code, status: 'pending_approval' });

    const result = await billsRepo.findPendingApproval(TEST_TENANT_ID);

    expect(result.some((b) => b.billNumber === code)).toBe(true);
    expect(result.every((b) => b.status === 'pending_approval')).toBe(true);
  });
});

// =============================================================================
// billLineItemsRepo
// =============================================================================

describe('billLineItemsRepo', () => {
  let testVendorId: string;
  let testBillId: string;

  beforeAll(async () => {
    await cleanupApData();
    const vendor = await createTestVendor({ name: 'LineItem Test Vendor', code: 'LTV' });
    testVendorId = vendor.id;
    const bill = await createTestBill(testVendorId, { billNumber: 'LINE-BILL-001' });
    testBillId = bill.id;
  });

  afterAll(async () => {
    await cleanupApData();
  });

  it('should create a bill line item', async () => {
    const item = await billLineItemsRepo.create({
      billId: testBillId,
      description: 'Widget A',
      quantity: '10.0000',
      unitPrice: '25.0000',
      amount: '250.0000',
      sortOrder: 0,
    });

    expect(item).toBeDefined();
    expect(item.id).toBeDefined();
    expect(item.billId).toBe(testBillId);
    expect(item.description).toBe('Widget A');
    expect(item.quantity).toBe('10.0000');
    expect(item.unitPrice).toBe('25.0000');
    expect(item.amount).toBe('250.0000');
  });

  it('should find line items by bill id', async () => {
    const prefix = randomCode('FBI');
    await billLineItemsRepo.create({
      billId: testBillId,
      description: `${prefix}-item-1`,
      quantity: '1.0000',
      unitPrice: '100.0000',
      amount: '100.0000',
      sortOrder: 0,
    });
    await billLineItemsRepo.create({
      billId: testBillId,
      description: `${prefix}-item-2`,
      quantity: '2.0000',
      unitPrice: '50.0000',
      amount: '100.0000',
      sortOrder: 1,
    });

    const items = await billLineItemsRepo.findByBillId(testBillId);

    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items.every((i) => i.billId === testBillId)).toBe(true);
  });

  it('should return empty array for bill with no line items', async () => {
    const vendor = await createTestVendor({ name: 'Empty Vendor', code: 'EMPT' });
    const bill = await createTestBill(vendor.id, { billNumber: randomCode('EMPTY') });

    const items = await billLineItemsRepo.findByBillId(bill.id);

    expect(items).toEqual([]);
  });

  it('should create many line items at once', async () => {
    const prefix = randomCode('CM');
    const items = await billLineItemsRepo.createMany([
      {
        billId: testBillId,
        description: `${prefix}-bulk-1`,
        quantity: '1.0000',
        unitPrice: '10.0000',
        amount: '10.0000',
        sortOrder: 0,
      },
      {
        billId: testBillId,
        description: `${prefix}-bulk-2`,
        quantity: '2.0000',
        unitPrice: '20.0000',
        amount: '40.0000',
        sortOrder: 1,
      },
      {
        billId: testBillId,
        description: `${prefix}-bulk-3`,
        quantity: '3.0000',
        unitPrice: '30.0000',
        amount: '90.0000',
        sortOrder: 2,
      },
    ]);

    expect(items.length).toBe(3);
    expect(items.map((i) => i.description).sort()).toEqual(
      [`${prefix}-bulk-1`, `${prefix}-bulk-2`, `${prefix}-bulk-3`].sort(),
    );
  });

  it('should return empty array when createMany is called with empty array', async () => {
    const items = await billLineItemsRepo.createMany([]);

    expect(items).toEqual([]);
  });

  it('should delete all line items by bill id', async () => {
    const vendor = await createTestVendor({ name: 'Delete Vendor', code: 'DLTV' });
    const bill = await createTestBill(vendor.id, { billNumber: randomCode('DLB') });

    await billLineItemsRepo.createMany([
      {
        billId: bill.id,
        description: 'Item to delete 1',
        quantity: '1.0000',
        unitPrice: '10.0000',
        amount: '10.0000',
        sortOrder: 0,
      },
      {
        billId: bill.id,
        description: 'Item to delete 2',
        quantity: '1.0000',
        unitPrice: '20.0000',
        amount: '20.0000',
        sortOrder: 1,
      },
    ]);

    const before = await billLineItemsRepo.findByBillId(bill.id);
    expect(before.length).toBe(2);

    await billLineItemsRepo.deleteByBillId(bill.id);

    const after = await billLineItemsRepo.findByBillId(bill.id);
    expect(after.length).toBe(0);
  });

  it('should update a bill line item', async () => {
    const item = await billLineItemsRepo.create({
      billId: testBillId,
      description: 'Before Update',
      quantity: '1.0000',
      unitPrice: '10.0000',
      amount: '10.0000',
      sortOrder: 0,
    });

    const updated = await billLineItemsRepo.update(item.id, {
      description: 'After Update',
      quantity: '5.0000',
    });

    expect(updated).toBeDefined();
    expect(updated!.description).toBe('After Update');
    expect(updated!.quantity).toBe('5.0000');
  });

  it('should hard delete a single line item', async () => {
    const item = await billLineItemsRepo.create({
      billId: testBillId,
      description: 'Hard Delete Target',
      quantity: '1.0000',
      unitPrice: '10.0000',
      amount: '10.0000',
      sortOrder: 0,
    });

    const deleted = await billLineItemsRepo.delete(item.id);

    expect(deleted).toBe(true);

    const found = await billLineItemsRepo.findById(item.id);
    expect(found).toBeUndefined();
  });

  it('should return false when hard deleting non-existent line item', async () => {
    const deleted = await billLineItemsRepo.delete(
      '00000000-0000-0000-0000-000000000000',
    );

    expect(deleted).toBe(false);
  });

  it('should find a line item by id', async () => {
    const item = await billLineItemsRepo.create({
      billId: testBillId,
      description: 'Find By Id Item',
      quantity: '1.0000',
      unitPrice: '99.0000',
      amount: '99.0000',
      sortOrder: 0,
    });

    const found = await billLineItemsRepo.findById(item.id);

    expect(found).toBeDefined();
    expect(found!.id).toBe(item.id);
    expect(found!.description).toBe('Find By Id Item');
  });

  it('should return undefined for non-existent line item id', async () => {
    const found = await billLineItemsRepo.findById(
      '00000000-0000-0000-0000-000000000000',
    );

    expect(found).toBeUndefined();
  });
});

// =============================================================================
// vendorPaymentsRepo
// =============================================================================

describe('vendorPaymentsRepo', () => {
  let testVendorId: string;
  let testBillId: string;

  beforeAll(async () => {
    await cleanupApData();
    const vendor = await createTestVendor({ name: 'Payment Test Vendor', code: 'PTV' });
    testVendorId = vendor.id;
    const bill = await createTestBill(testVendorId, { billNumber: 'PAY-BILL-001' });
    testBillId = bill.id;
  });

  afterAll(async () => {
    await cleanupApData();
  });

  it('should create a vendor payment', async () => {
    const payment = await vendorPaymentsRepo.create({
      tenantId: TEST_TENANT_ID,
      vendorId: testVendorId,
      billId: testBillId,
      amount: '500.0000',
      paymentDate: new Date('2026-02-01'),
      paymentMethod: 'bank_transfer',
      currency: 'USD',
    });

    expect(payment).toBeDefined();
    expect(payment.id).toBeDefined();
    expect(payment.amount).toBe('500.0000');
    expect(payment.vendorId).toBe(testVendorId);
    expect(payment.billId).toBe(testBillId);
    expect(payment.paymentMethod).toBe('bank_transfer');
  });

  it('should find a payment by id', async () => {
    const created = await vendorPaymentsRepo.create({
      tenantId: TEST_TENANT_ID,
      vendorId: testVendorId,
      billId: testBillId,
      amount: '250.0000',
      paymentDate: new Date('2026-03-01'),
      paymentMethod: 'check',
      currency: 'USD',
    });

    const found = await vendorPaymentsRepo.findById(created.id, TEST_TENANT_ID);

    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.amount).toBe('250.0000');
  });

  it('should return undefined for non-existent payment id', async () => {
    const found = await vendorPaymentsRepo.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );

    expect(found).toBeUndefined();
  });

  it('should find many payments with pagination', async () => {
    const prefix = randomCode('VPP');
    for (let i = 0; i < 4; i++) {
      await vendorPaymentsRepo.create({
        tenantId: TEST_TENANT_ID,
        vendorId: testVendorId,
        amount: `${(i + 1) * 100}.0000`,
        paymentDate: new Date(`2026-04-${String(i + 1).padStart(2, '0')}`),
        paymentMethod: 'bank_transfer',
        currency: 'USD',
      });
    }

    const page1 = await vendorPaymentsRepo.findMany(TEST_TENANT_ID, {
      page: 1,
      limit: 2,
    });

    expect(page1.data.length).toBeLessThanOrEqual(2);
    expect(page1.total).toBeGreaterThanOrEqual(4);
    expect(page1.page).toBe(1);
    expect(page1.limit).toBe(2);

    const page2 = await vendorPaymentsRepo.findMany(TEST_TENANT_ID, {
      page: 2,
      limit: 2,
    });

    const page1Ids = page1.data.map((p) => p.id);
    const page2Ids = page2.data.map((p) => p.id);
    expect(page1Ids.every((id) => !page2Ids.includes(id))).toBe(true);
  });

  it('should filter payments by vendor id', async () => {
    const vendor2 = await createTestVendor({ name: 'Pay Filter Vendor', code: randomCode('PFV') });
    await vendorPaymentsRepo.create({
      tenantId: TEST_TENANT_ID,
      vendorId: vendor2.id,
      amount: '100.0000',
      paymentDate: new Date('2026-05-01'),
      paymentMethod: 'cash',
      currency: 'USD',
    });

    const result = await vendorPaymentsRepo.findMany(TEST_TENANT_ID, {
      vendorId: vendor2.id,
    });

    expect(result.data.every((p) => p.vendorId === vendor2.id)).toBe(true);
  });

  it('should find payments by bill id', async () => {
    await vendorPaymentsRepo.create({
      tenantId: TEST_TENANT_ID,
      vendorId: testVendorId,
      billId: testBillId,
      amount: '75.0000',
      paymentDate: new Date('2026-06-01'),
      paymentMethod: 'credit_card',
      currency: 'USD',
    });

    const result = await vendorPaymentsRepo.findByBillId(testBillId, TEST_TENANT_ID);

    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.every((p) => p.billId === testBillId)).toBe(true);
  });

  it('should update a payment', async () => {
    const payment = await vendorPaymentsRepo.create({
      tenantId: TEST_TENANT_ID,
      vendorId: testVendorId,
      amount: '300.0000',
      paymentDate: new Date('2026-07-01'),
      paymentMethod: 'wire',
      currency: 'USD',
    });

    const updated = await vendorPaymentsRepo.update(payment.id, TEST_TENANT_ID, {
      referenceNumber: 'REF-12345',
      notes: 'Updated payment',
    });

    expect(updated).toBeDefined();
    expect(updated!.referenceNumber).toBe('REF-12345');
    expect(updated!.notes).toBe('Updated payment');
  });

  it('should return undefined when updating non-existent payment', async () => {
    const result = await vendorPaymentsRepo.update(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
      { notes: 'Ghost' },
    );

    expect(result).toBeUndefined();
  });

  it('should soft delete a payment', async () => {
    const payment = await vendorPaymentsRepo.create({
      tenantId: TEST_TENANT_ID,
      vendorId: testVendorId,
      amount: '150.0000',
      paymentDate: new Date('2026-08-01'),
      paymentMethod: 'check',
      currency: 'USD',
    });

    const result = await vendorPaymentsRepo.softDelete(payment.id, TEST_TENANT_ID);

    expect(result).toBeDefined();
    expect(result!.deletedAt).not.toBeNull();

    const found = await vendorPaymentsRepo.findById(payment.id, TEST_TENANT_ID);
    expect(found!.deletedAt).not.toBeNull();
  });

  it('should enforce tenant isolation on payments', async () => {
    const payment = await vendorPaymentsRepo.create({
      tenantId: TEST_TENANT_ID,
      vendorId: testVendorId,
      amount: '100.0000',
      paymentDate: new Date('2026-09-01'),
      paymentMethod: 'cash',
      currency: 'USD',
    });

    const found = await vendorPaymentsRepo.findById(payment.id, OTHER_TENANT_ID);

    expect(found).toBeUndefined();
  });

  it('should enforce tenant isolation on payment update', async () => {
    const payment = await vendorPaymentsRepo.create({
      tenantId: TEST_TENANT_ID,
      vendorId: testVendorId,
      amount: '100.0000',
      paymentDate: new Date('2026-10-01'),
      paymentMethod: 'cash',
      currency: 'USD',
    });

    const result = await vendorPaymentsRepo.update(payment.id, OTHER_TENANT_ID, {
      notes: 'Hacked',
    });

    expect(result).toBeUndefined();
  });

  it('should enforce tenant isolation on bill id lookup', async () => {
    const result = await vendorPaymentsRepo.findByBillId(testBillId, OTHER_TENANT_ID);

    expect(result.length).toBe(0);
  });
});

// =============================================================================
// paymentSchedulesRepo
// =============================================================================

describe('paymentSchedulesRepo', () => {
  let testVendorId: string;
  let testBillId: string;

  beforeAll(async () => {
    await cleanupApData();
    const vendor = await createTestVendor({ name: 'Schedule Test Vendor', code: 'STV' });
    testVendorId = vendor.id;
    const bill = await createTestBill(testVendorId, { billNumber: 'SCHED-BILL-001' });
    testBillId = bill.id;
  });

  afterAll(async () => {
    await cleanupApData();
  });

  it('should create a payment schedule', async () => {
    const schedule = await paymentSchedulesRepo.create({
      tenantId: TEST_TENANT_ID,
      billId: testBillId,
      dueDate: new Date('2026-03-15'),
      amount: '550.0000',
      status: 'pending',
    });

    expect(schedule).toBeDefined();
    expect(schedule.id).toBeDefined();
    expect(schedule.billId).toBe(testBillId);
    expect(schedule.amount).toBe('550.0000');
    expect(schedule.status).toBe('pending');
  });

  it('should find schedules by bill id', async () => {
    const prefix = randomCode('PBS');
    await paymentSchedulesRepo.createMany([
      {
        tenantId: TEST_TENANT_ID,
        billId: testBillId,
        dueDate: new Date('2026-04-01'),
        amount: '200.0000',
        status: 'pending',
      },
      {
        tenantId: TEST_TENANT_ID,
        billId: testBillId,
        dueDate: new Date('2026-05-01'),
        amount: '350.0000',
        status: 'pending',
      },
    ]);

    const schedules = await paymentSchedulesRepo.findByBillId(testBillId);

    expect(schedules.length).toBeGreaterThanOrEqual(2);
    expect(schedules.every((s) => s.billId === testBillId)).toBe(true);
  });

  it('should create many payment schedules at once', async () => {
    const schedules = await paymentSchedulesRepo.createMany([
      {
        tenantId: TEST_TENANT_ID,
        billId: testBillId,
        dueDate: new Date('2026-06-01'),
        amount: '100.0000',
        status: 'pending',
      },
      {
        tenantId: TEST_TENANT_ID,
        billId: testBillId,
        dueDate: new Date('2026-07-01'),
        amount: '200.0000',
        status: 'pending',
      },
      {
        tenantId: TEST_TENANT_ID,
        billId: testBillId,
        dueDate: new Date('2026-08-01'),
        amount: '300.0000',
        status: 'pending',
      },
    ]);

    expect(schedules.length).toBe(3);
    expect(schedules.every((s) => s.billId === testBillId)).toBe(true);
  });

  it('should return empty array when createMany is called with empty array', async () => {
    const schedules = await paymentSchedulesRepo.createMany([]);

    expect(schedules).toEqual([]);
  });

  it('should update a payment schedule', async () => {
    const schedule = await paymentSchedulesRepo.create({
      tenantId: TEST_TENANT_ID,
      billId: testBillId,
      dueDate: new Date('2026-09-01'),
      amount: '100.0000',
      status: 'pending',
    });

    const updated = await paymentSchedulesRepo.update(schedule.id, {
      status: 'paid',
      amount: '150.0000',
    });

    expect(updated).toBeDefined();
    expect(updated!.status).toBe('paid');
    expect(updated!.amount).toBe('150.0000');
  });

  it('should hard delete a payment schedule', async () => {
    const schedule = await paymentSchedulesRepo.create({
      tenantId: TEST_TENANT_ID,
      billId: testBillId,
      dueDate: new Date('2026-10-01'),
      amount: '100.0000',
      status: 'pending',
    });

    const deleted = await paymentSchedulesRepo.delete(schedule.id);

    expect(deleted).toBe(true);

    const found = await paymentSchedulesRepo.findById(schedule.id);
    expect(found).toBeUndefined();
  });

  it('should return false when deleting non-existent schedule', async () => {
    const deleted = await paymentSchedulesRepo.delete(
      '00000000-0000-0000-0000-000000000000',
    );

    expect(deleted).toBe(false);
  });

  it('should find a schedule by id', async () => {
    const schedule = await paymentSchedulesRepo.create({
      tenantId: TEST_TENANT_ID,
      billId: testBillId,
      dueDate: new Date('2026-11-01'),
      amount: '75.0000',
      status: 'pending',
    });

    const found = await paymentSchedulesRepo.findById(schedule.id);

    expect(found).toBeDefined();
    expect(found!.id).toBe(schedule.id);
    expect(found!.amount).toBe('75.0000');
  });

  it('should return undefined for non-existent schedule id', async () => {
    const found = await paymentSchedulesRepo.findById(
      '00000000-0000-0000-0000-000000000000',
    );

    expect(found).toBeUndefined();
  });

  it('should delete all schedules by bill id', async () => {
    const vendor = await createTestVendor({ name: 'Del Sched Vendor', code: randomCode('DSV') });
    const bill = await createTestBill(vendor.id, { billNumber: randomCode('DSB') });

    await paymentSchedulesRepo.createMany([
      {
        tenantId: TEST_TENANT_ID,
        billId: bill.id,
        dueDate: new Date('2026-12-01'),
        amount: '100.0000',
        status: 'pending',
      },
      {
        tenantId: TEST_TENANT_ID,
        billId: bill.id,
        dueDate: new Date('2027-01-01'),
        amount: '200.0000',
        status: 'pending',
      },
    ]);

    const before = await paymentSchedulesRepo.findByBillId(bill.id);
    expect(before.length).toBe(2);

    await paymentSchedulesRepo.deleteByBillId(bill.id);

    const after = await paymentSchedulesRepo.findByBillId(bill.id);
    expect(after.length).toBe(0);
  });

  it('should return empty array for bill with no schedules', async () => {
    const vendor = await createTestVendor({ name: 'No Sched Vendor', code: randomCode('NSV') });
    const bill = await createTestBill(vendor.id, { billNumber: randomCode('NSB') });

    const schedules = await paymentSchedulesRepo.findByBillId(bill.id);

    expect(schedules).toEqual([]);
  });
});
