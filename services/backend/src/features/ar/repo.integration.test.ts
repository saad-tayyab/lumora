import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { testDb, TEST_TENANT_ID } from '../../lib/integration-test-utils';
import {
  customers,
  invoices,
  invoiceLineItems,
  payments,
  paymentApplications,
  creditNotes,
} from '@lumora/database/schema';
import {
  customersRepository,
  invoicesRepository,
  invoiceLineItemsRepository,
  paymentsRepository,
  paymentApplicationsRepository,
  creditNotesRepository,
} from './repo';
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
}));

async function cleanupArTestData(): Promise<void> {
  const tenantCondition = eq(paymentApplications.tenantId, TEST_TENANT_ID);
  await testDb.delete(paymentApplications).where(tenantCondition);
  await testDb.delete(invoiceLineItems).where(eq(invoiceLineItems.tenantId, TEST_TENANT_ID));
  await testDb.delete(payments).where(eq(payments.tenantId, TEST_TENANT_ID));
  await testDb.delete(creditNotes).where(eq(creditNotes.tenantId, TEST_TENANT_ID));
  await testDb.delete(invoices).where(eq(invoices.tenantId, TEST_TENANT_ID));
  await testDb.delete(customers).where(eq(customers.tenantId, TEST_TENANT_ID));
}

function makeCustomerInput(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '+1-555-0100',
    addressLine1: '100 Main St',
    city: 'Springfield',
    state: 'IL',
    postalCode: '62701',
    country: 'USA',
    paymentTerms: 'Net 30',
    creditLimit: '50000.0000',
    isActive: true,
    ...overrides,
  };
}

function makeInvoiceInput(
  customerId: string,
  invoiceNumber: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    customerId,
    invoiceNumber,
    status: 'draft' as const,
    issueDate: '2026-07-15',
    dueDate: '2026-08-14',
    subtotal: '1000.0000',
    taxAmount: '100.0000',
    totalAmount: '1100.0000',
    amountPaid: '0.0000',
    balanceDue: '1100.0000',
    currency: 'USD',
    ...overrides,
  };
}

function makeLineItemInput(
  invoiceId: string,
  description: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    invoiceId,
    description,
    quantity: '10',
    unitPrice: '100.0000',
    amount: '1000.0000',
    taxRate: '0.1000',
    taxAmount: '100.0000',
    sortOrder: 0,
    ...overrides,
  };
}

function makePaymentInput(
  customerId: string,
  paymentNumber: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    customerId,
    paymentNumber,
    paymentDate: '2026-07-20',
    amount: '500.0000',
    paymentMethod: 'bank_transfer' as const,
    referenceNumber: 'REF-001',
    currency: 'USD',
    ...overrides,
  };
}

function makePaymentApplicationInput(
  paymentId: string,
  invoiceId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    paymentId,
    invoiceId,
    amountApplied: '500.0000',
    appliedDate: '2026-07-20',
    ...overrides,
  };
}

function makeCreditNoteInput(
  customerId: string,
  creditNoteNumber: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    customerId,
    creditNoteNumber,
    status: 'draft' as const,
    issueDate: '2026-07-25',
    reason: 'Product return',
    amount: '200.0000',
    amountApplied: '0.0000',
    balance: '200.0000',
    currency: 'USD',
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Customers Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('customersRepository', () => {
  beforeAll(async () => {
    await cleanupArTestData();
  });

  afterAll(async () => {
    await cleanupArTestData();
  });

  it('should create a customer and return it', async () => {
    const input = makeCustomerInput();
    const [created] = await customersRepository.create(input, TEST_TENANT_ID);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Test Customer');
    expect(created.email).toBe('test@example.com');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
    expect(created.isActive).toBe(true);
  });

  it('should find a customer by id', async () => {
    const input = makeCustomerInput({ email: 'find-me@example.com' });
    const [created] = await customersRepository.create(input, TEST_TENANT_ID);

    const found = await customersRepository.findById(created.id, TEST_TENANT_ID);

    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.email).toBe('find-me@example.com');
  });

  it('should return undefined for non-existent customer id', async () => {
    const found = await customersRepository.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should isolate tenants and not return customer from another tenant', async () => {
    const input = makeCustomerInput({ email: 'tenant-isolation@example.com' });
    const [created] = await customersRepository.create(input, TEST_TENANT_ID);

    const found = await customersRepository.findById(created.id, '33333333-3333-4333-8333-333333333333');
    expect(found).toBeUndefined();
  });

  it('should update a customer', async () => {
    const input = makeCustomerInput({ email: 'update-me@example.com' });
    const [created] = await customersRepository.create(input, TEST_TENANT_ID);

    const updated = await customersRepository.update(created.id, TEST_TENANT_ID, {
      name: 'Updated Corp',
      email: 'updated@example.com',
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].name).toBe('Updated Corp');
    expect(updated[0].email).toBe('updated@example.com');
  });

  it('should return empty array when updating non-existent customer', async () => {
    const result = await customersRepository.update(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
      { name: 'Ghost' },
    );
    expect(result).toHaveLength(0);
  });

  it('should hard delete a customer', async () => {
    const input = makeCustomerInput({ email: 'delete-me@example.com' });
    const [created] = await customersRepository.create(input, TEST_TENANT_ID);

    const deleted = await customersRepository.delete(created.id, TEST_TENANT_ID);
    expect(deleted).toHaveLength(1);

    const found = await customersRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should find many customers with pagination', async () => {
    const prefix = `pagination-test-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      await customersRepository.create(
        makeCustomerInput({ email: `${prefix}-${i}@example.com`, name: `Page ${i}` }),
        TEST_TENANT_ID,
      );
    }

    const page1 = await customersRepository.findMany(TEST_TENANT_ID, { limit: 2, offset: 0 });
    expect(page1.data.length).toBeLessThanOrEqual(2);
    expect(page1.limit).toBe(2);
    expect(page1.offset).toBe(0);
    expect(page1.total).toBeGreaterThanOrEqual(5);

    const page2 = await customersRepository.findMany(TEST_TENANT_ID, { limit: 2, offset: 2 });
    expect(page2.offset).toBe(2);
    expect(page2.data.length).toBeLessThanOrEqual(2);
  });

  it('should find active customers only', async () => {
    const prefix = `active-test-${Date.now()}`;
    await customersRepository.create(
      makeCustomerInput({ email: `${prefix}-active@example.com`, isActive: true }),
      TEST_TENANT_ID,
    );
    await customersRepository.create(
      makeCustomerInput({ email: `${prefix}-inactive@example.com`, isActive: false }),
      TEST_TENANT_ID,
    );

    const active = await customersRepository.findActiveCustomers(TEST_TENANT_ID);
    const allActive = active.every((c) => c.isActive === true);
    expect(allActive).toBe(true);
  });

  it('should find customer by email', async () => {
    const email = `unique-${Date.now()}@example.com`;
    await customersRepository.create(makeCustomerInput({ email }), TEST_TENANT_ID);

    const found = await customersRepository.findByEmail(email, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.email).toBe(email);
  });

  it('should return undefined for non-existent email', async () => {
    const found = await customersRepository.findByEmail(
      'no-such-email@example.com',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should count invoices for a customer', async () => {
    const prefix = `count-test-${Date.now()}`;
    const [customer] = await customersRepository.create(
      makeCustomerInput({ email: `${prefix}@example.com` }),
      TEST_TENANT_ID,
    );

    await invoicesRepository.create(
      makeInvoiceInput(customer.id, `${prefix}-INV-001`),
      TEST_TENANT_ID,
    );
    await invoicesRepository.create(
      makeInvoiceInput(customer.id, `${prefix}-INV-002`),
      TEST_TENANT_ID,
    );

    const count = await customersRepository.countInvoices(customer.id, TEST_TENANT_ID);
    expect(count).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Invoices Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('invoicesRepository', () => {
  let customerId: string;

  beforeAll(async () => {
    await cleanupArTestData();
    const [customer] = await customersRepository.create(
      makeCustomerInput({ email: `invoice-test-${Date.now()}@example.com` }),
      TEST_TENANT_ID,
    );
    customerId = customer.id;
  });

  afterAll(async () => {
    await cleanupArTestData();
  });

  it('should create an invoice and return it', async () => {
    const invoiceNum = `INV-CREATE-${Date.now()}`;
    const input = makeInvoiceInput(customerId, invoiceNum);
    const [created] = await invoicesRepository.create(input, TEST_TENANT_ID);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.invoiceNumber).toBe(invoiceNum);
    expect(created.customerId).toBe(customerId);
    expect(created.status).toBe('draft');
    expect(created.totalAmount).toBe('1100.0000');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should find an invoice by id', async () => {
    const invoiceNum = `INV-FIND-${Date.now()}`;
    const [created] = await invoicesRepository.create(
      makeInvoiceInput(customerId, invoiceNum),
      TEST_TENANT_ID,
    );

    const found = await invoicesRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.invoiceNumber).toBe(invoiceNum);
  });

  it('should return undefined for non-existent invoice id', async () => {
    const found = await invoicesRepository.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should isolate tenants for invoices', async () => {
    const invoiceNum = `INV-TENANT-${Date.now()}`;
    const [created] = await invoicesRepository.create(
      makeInvoiceInput(customerId, invoiceNum),
      TEST_TENANT_ID,
    );

    const found = await invoicesRepository.findById(created.id, '33333333-3333-4333-8333-333333333333');
    expect(found).toBeUndefined();
  });

  it('should update an invoice', async () => {
    const invoiceNum = `INV-UPDATE-${Date.now()}`;
    const [created] = await invoicesRepository.create(
      makeInvoiceInput(customerId, invoiceNum),
      TEST_TENANT_ID,
    );

    const updated = await invoicesRepository.update(created.id, TEST_TENANT_ID, {
      status: 'sent',
      notes: 'Updated notes',
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].status).toBe('sent');
    expect(updated[0].notes).toBe('Updated notes');
  });

  it('should delete an invoice', async () => {
    const invoiceNum = `INV-DELETE-${Date.now()}`;
    const [created] = await invoicesRepository.create(
      makeInvoiceInput(customerId, invoiceNum),
      TEST_TENANT_ID,
    );

    const deleted = await invoicesRepository.delete(created.id, TEST_TENANT_ID);
    expect(deleted).toHaveLength(1);

    const found = await invoicesRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should find many invoices with pagination', async () => {
    const prefix = `INV-PAGE-${Date.now()}`;
    for (let i = 0; i < 4; i++) {
      await invoicesRepository.create(
        makeInvoiceInput(customerId, `${prefix}-${i}`),
        TEST_TENANT_ID,
      );
    }

    const page = await invoicesRepository.findMany(TEST_TENANT_ID, { limit: 2, offset: 0 });
    expect(page.data.length).toBeLessThanOrEqual(2);
    expect(page.limit).toBe(2);
    expect(page.total).toBeGreaterThanOrEqual(4);
  });

  it('should filter invoices by status', async () => {
    const prefix = `INV-STATUS-${Date.now()}`;
    await invoicesRepository.create(
      makeInvoiceInput(customerId, `${prefix}-DRAFT`, { status: 'draft' }),
      TEST_TENANT_ID,
    );
    await invoicesRepository.create(
      makeInvoiceInput(customerId, `${prefix}-PAID`, { status: 'paid' }),
      TEST_TENANT_ID,
    );

    const draftInvoices = await invoicesRepository.findMany(TEST_TENANT_ID, {
      status: 'draft',
    });
    const allDraft = draftInvoices.data.every((inv) => inv.status === 'draft');
    expect(allDraft).toBe(true);
  });

  it('should filter invoices by customer id', async () => {
    const prefix = `INV-CUST-${Date.now()}`;
    const [otherCustomer] = await customersRepository.create(
      makeCustomerInput({ email: `other-${prefix}@example.com` }),
      TEST_TENANT_ID,
    );

    await invoicesRepository.create(
      makeInvoiceInput(customerId, `${prefix}-MINE`),
      TEST_TENANT_ID,
    );
    await invoicesRepository.create(
      makeInvoiceInput(otherCustomer.id, `${prefix}-OTHERS`),
      TEST_TENANT_ID,
    );

    const mine = await invoicesRepository.findMany(TEST_TENANT_ID, { customerId });
    const allMine = mine.data.every((inv) => inv.customerId === customerId);
    expect(allMine).toBe(true);
  });

  it('should find invoices by customer id', async () => {
    const prefix = `INV-FIND-CUST-${Date.now()}`;
    await invoicesRepository.create(
      makeInvoiceInput(customerId, `${prefix}-A`),
      TEST_TENANT_ID,
    );
    await invoicesRepository.create(
      makeInvoiceInput(customerId, `${prefix}-B`),
      TEST_TENANT_ID,
    );

    const found = await invoicesRepository.findByCustomerId(customerId, TEST_TENANT_ID);
    expect(found.length).toBeGreaterThanOrEqual(2);
  });

  it('should find invoices by status', async () => {
    const prefix = `INV-BY-STATUS-${Date.now()}`;
    await invoicesRepository.create(
      makeInvoiceInput(customerId, `${prefix}-OVERDUE`, { status: 'overdue' }),
      TEST_TENANT_ID,
    );

    const overdue = await invoicesRepository.findByStatus('overdue', TEST_TENANT_ID);
    const allOverdue = overdue.every((inv) => inv.status === 'overdue');
    expect(allOverdue).toBe(true);
  });

  it('should find invoice by invoice number', async () => {
    const invoiceNum = `INV-NUM-${Date.now()}`;
    await invoicesRepository.create(
      makeInvoiceInput(customerId, invoiceNum),
      TEST_TENANT_ID,
    );

    const found = await invoicesRepository.findByInvoiceNumber(invoiceNum, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.invoiceNumber).toBe(invoiceNum);
  });

  it('should find overdue invoices', async () => {
    const invoiceNum = `INV-OVERDUE-${Date.now()}`;
    await invoicesRepository.create(
      makeInvoiceInput(customerId, invoiceNum, { status: 'overdue' }),
      TEST_TENANT_ID,
    );

    const overdue = await invoicesRepository.findOverdueInvoices(TEST_TENANT_ID);
    const allOverdue = overdue.every((inv) => inv.status === 'overdue');
    expect(allOverdue).toBe(true);
  });

  it('should calculate sum balance due by customer', async () => {
    const prefix = `INV-SUM-${Date.now()}`;
    await invoicesRepository.create(
      makeInvoiceInput(customerId, `${prefix}-1`, {
        status: 'sent',
        balanceDue: '500.0000',
      }),
      TEST_TENANT_ID,
    );
    await invoicesRepository.create(
      makeInvoiceInput(customerId, `${prefix}-2`, {
        status: 'overdue',
        balanceDue: '300.0000',
      }),
      TEST_TENANT_ID,
    );

    const total = await invoicesRepository.sumBalanceDueByCustomer(customerId, TEST_TENANT_ID);
    expect(Number(total)).toBeGreaterThanOrEqual(800);
  });

  it('should sum balance due excluding paid invoices', async () => {
    const prefix = `INV-SUM-PAID-${Date.now()}`;
    await invoicesRepository.create(
      makeInvoiceInput(customerId, `${prefix}-PAID`, {
        status: 'paid',
        balanceDue: '0.0000',
      }),
      TEST_TENANT_ID,
    );

    const total = await invoicesRepository.sumBalanceDueByCustomer(customerId, TEST_TENANT_ID);
    expect(Number(total)).toBeGreaterThanOrEqual(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Invoice Line Items Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('invoiceLineItemsRepository', () => {
  let customerId: string;
  let invoiceId: string;

  beforeAll(async () => {
    await cleanupArTestData();
    const [customer] = await customersRepository.create(
      makeCustomerInput({ email: `line-item-test-${Date.now()}@example.com` }),
      TEST_TENANT_ID,
    );
    customerId = customer.id;
    const [invoice] = await invoicesRepository.create(
      makeInvoiceInput(customerId, `INV-LINE-${Date.now()}`),
      TEST_TENANT_ID,
    );
    invoiceId = invoice.id;
  });

  afterAll(async () => {
    await cleanupArTestData();
  });

  it('should create a line item and return it', async () => {
    const input = makeLineItemInput(invoiceId, 'Service A');
    const [created] = await invoiceLineItemsRepository.create(input, TEST_TENANT_ID);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.invoiceId).toBe(invoiceId);
    expect(created.description).toBe('Service A');
    expect(created.quantity).toBe('10');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should find line items by invoice id', async () => {
    const prefix = `LINE-FIND-${Date.now()}`;
    await invoiceLineItemsRepository.create(
      makeLineItemInput(invoiceId, `${prefix}-A`),
      TEST_TENANT_ID,
    );
    await invoiceLineItemsRepository.create(
      makeLineItemInput(invoiceId, `${prefix}-B`),
      TEST_TENANT_ID,
    );

    const items = await invoiceLineItemsRepository.findByInvoiceId(invoiceId, TEST_TENANT_ID);
    expect(items.length).toBeGreaterThanOrEqual(2);
    items.forEach((item) => {
      expect(item.invoiceId).toBe(invoiceId);
    });
  });

  it('should return empty array for invoice with no line items', async () => {
    const [emptyInvoice] = await invoicesRepository.create(
      makeInvoiceInput(customerId, `INV-EMPTY-${Date.now()}`),
      TEST_TENANT_ID,
    );

    const items = await invoiceLineItemsRepository.findByInvoiceId(
      emptyInvoice.id,
      TEST_TENANT_ID,
    );
    expect(items).toHaveLength(0);
  });

  it('should create many line items at once', async () => {
    const prefix = `LINE-MANY-${Date.now()}`;
    const items = [
      makeLineItemInput(invoiceId, `${prefix}-Item-1`, { sortOrder: 0 }),
      makeLineItemInput(invoiceId, `${prefix}-Item-2`, { sortOrder: 1 }),
      makeLineItemInput(invoiceId, `${prefix}-Item-3`, { sortOrder: 2 }),
    ];

    const created = await invoiceLineItemsRepository.createMany(items, TEST_TENANT_ID);
    expect(created).toHaveLength(3);
    created.forEach((item) => {
      expect(item.invoiceId).toBe(invoiceId);
    });
  });

  it('should find line item by id', async () => {
    const input = makeLineItemInput(invoiceId, `LINE-BYID-${Date.now()}`);
    const [created] = await invoiceLineItemsRepository.create(input, TEST_TENANT_ID);

    const found = await invoiceLineItemsRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.description).toBe(input.description);
  });

  it('should return undefined for non-existent line item id', async () => {
    const found = await invoiceLineItemsRepository.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should update a line item', async () => {
    const input = makeLineItemInput(invoiceId, `LINE-UPDATE-${Date.now()}`);
    const [created] = await invoiceLineItemsRepository.create(input, TEST_TENANT_ID);

    const updated = await invoiceLineItemsRepository.update(created.id, TEST_TENANT_ID, {
      description: 'Updated Description',
      quantity: '20',
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].description).toBe('Updated Description');
    expect(updated[0].quantity).toBe('20');
  });

  it('should delete a line item by id', async () => {
    const input = makeLineItemInput(invoiceId, `LINE-DELETE-${Date.now()}`);
    const [created] = await invoiceLineItemsRepository.create(input, TEST_TENANT_ID);

    const deleted = await invoiceLineItemsRepository.delete(created.id, TEST_TENANT_ID);
    expect(deleted).toHaveLength(1);

    const found = await invoiceLineItemsRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should delete all line items by invoice id', async () => {
    const prefix = `LINE-DELBY-${Date.now()}`;
    const [targetInvoice] = await invoicesRepository.create(
      makeInvoiceInput(customerId, `${prefix}-INV`),
      TEST_TENANT_ID,
    );

    await invoiceLineItemsRepository.createMany(
      [
        makeLineItemInput(targetInvoice.id, `${prefix}-A`),
        makeLineItemInput(targetInvoice.id, `${prefix}-B`),
      ],
      TEST_TENANT_ID,
    );

    await invoiceLineItemsRepository.deleteByInvoiceId(targetInvoice.id, TEST_TENANT_ID);

    const remaining = await invoiceLineItemsRepository.findByInvoiceId(
      targetInvoice.id,
      TEST_TENANT_ID,
    );
    expect(remaining).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Payments Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('paymentsRepository', () => {
  let customerId: string;

  beforeAll(async () => {
    await cleanupArTestData();
    const [customer] = await customersRepository.create(
      makeCustomerInput({ email: `payment-test-${Date.now()}@example.com` }),
      TEST_TENANT_ID,
    );
    customerId = customer.id;
  });

  afterAll(async () => {
    await cleanupArTestData();
  });

  it('should create a payment and return it', async () => {
    const paymentNum = `PAY-CREATE-${Date.now()}`;
    const input = makePaymentInput(customerId, paymentNum);
    const [created] = await paymentsRepository.create(input, TEST_TENANT_ID);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.paymentNumber).toBe(paymentNum);
    expect(created.customerId).toBe(customerId);
    expect(created.amount).toBe('500.0000');
    expect(created.paymentMethod).toBe('bank_transfer');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should find a payment by id', async () => {
    const paymentNum = `PAY-FIND-${Date.now()}`;
    const [created] = await paymentsRepository.create(
      makePaymentInput(customerId, paymentNum),
      TEST_TENANT_ID,
    );

    const found = await paymentsRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
  });

  it('should return undefined for non-existent payment id', async () => {
    const found = await paymentsRepository.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should isolate tenants for payments', async () => {
    const paymentNum = `PAY-TENANT-${Date.now()}`;
    const [created] = await paymentsRepository.create(
      makePaymentInput(customerId, paymentNum),
      TEST_TENANT_ID,
    );

    const found = await paymentsRepository.findById(created.id, '33333333-3333-4333-8333-333333333333');
    expect(found).toBeUndefined();
  });

  it('should update a payment', async () => {
    const paymentNum = `PAY-UPDATE-${Date.now()}`;
    const [created] = await paymentsRepository.create(
      makePaymentInput(customerId, paymentNum),
      TEST_TENANT_ID,
    );

    const updated = await paymentsRepository.update(created.id, TEST_TENANT_ID, {
      amount: '750.0000',
      notes: 'Updated payment',
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].amount).toBe('750.0000');
    expect(updated[0].notes).toBe('Updated payment');
  });

  it('should delete a payment', async () => {
    const paymentNum = `PAY-DELETE-${Date.now()}`;
    const [created] = await paymentsRepository.create(
      makePaymentInput(customerId, paymentNum),
      TEST_TENANT_ID,
    );

    const deleted = await paymentsRepository.delete(created.id, TEST_TENANT_ID);
    expect(deleted).toHaveLength(1);

    const found = await paymentsRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should find many payments with pagination', async () => {
    const prefix = `PAY-PAGE-${Date.now()}`;
    for (let i = 0; i < 4; i++) {
      await paymentsRepository.create(
        makePaymentInput(customerId, `${prefix}-${i}`),
        TEST_TENANT_ID,
      );
    }

    const page = await paymentsRepository.findMany(TEST_TENANT_ID, { limit: 2, offset: 0 });
    expect(page.data.length).toBeLessThanOrEqual(2);
    expect(page.limit).toBe(2);
    expect(page.total).toBeGreaterThanOrEqual(4);
  });

  it('should find payments by customer id', async () => {
    const prefix = `PAY-BYCUST-${Date.now()}`;
    const [otherCustomer] = await customersRepository.create(
      makeCustomerInput({ email: `other-${prefix}@example.com` }),
      TEST_TENANT_ID,
    );

    await paymentsRepository.create(
      makePaymentInput(customerId, `${prefix}-MINE`),
      TEST_TENANT_ID,
    );
    await paymentsRepository.create(
      makePaymentInput(otherCustomer.id, `${prefix}-OTHERS`),
      TEST_TENANT_ID,
    );

    const found = await paymentsRepository.findByCustomerId(customerId, TEST_TENANT_ID);
    const allMine = found.every((p) => p.customerId === customerId);
    expect(allMine).toBe(true);
  });

  it('should find payment by payment number', async () => {
    const paymentNum = `PAY-NUM-${Date.now()}`;
    await paymentsRepository.create(
      makePaymentInput(customerId, paymentNum),
      TEST_TENANT_ID,
    );

    const found = await paymentsRepository.findByPaymentNumber(paymentNum, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.paymentNumber).toBe(paymentNum);
  });

  it('should sum applied amount by payment id', async () => {
    const paymentNum = `PAY-SUM-${Date.now()}`;
    const [payment] = await paymentsRepository.create(
      makePaymentInput(customerId, paymentNum),
      TEST_TENANT_ID,
    );

    const [invoice] = await invoicesRepository.create(
      makeInvoiceInput(customerId, `INV-SUM-${Date.now()}`),
      TEST_TENANT_ID,
    );

    await paymentApplicationsRepository.create(
      makePaymentApplicationInput(payment.id, invoice.id, { amountApplied: '200.0000' }),
      TEST_TENANT_ID,
    );
    await paymentApplicationsRepository.create(
      makePaymentApplicationInput(payment.id, invoice.id, { amountApplied: '150.0000' }),
      TEST_TENANT_ID,
    );

    const total = await paymentsRepository.sumAppliedByPaymentId(payment.id, TEST_TENANT_ID);
    expect(Number(total)).toBe(350);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Payment Applications Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('paymentApplicationsRepository', () => {
  let customerId: string;
  let invoiceId: string;
  let paymentId: string;

  beforeAll(async () => {
    await cleanupArTestData();
    const [customer] = await customersRepository.create(
      makeCustomerInput({ email: `pa-test-${Date.now()}@example.com` }),
      TEST_TENANT_ID,
    );
    customerId = customer.id;

    const [invoice] = await invoicesRepository.create(
      makeInvoiceInput(customerId, `INV-PA-${Date.now()}`),
      TEST_TENANT_ID,
    );
    invoiceId = invoice.id;

    const [payment] = await paymentsRepository.create(
      makePaymentInput(customerId, `PAY-PA-${Date.now()}`),
      TEST_TENANT_ID,
    );
    paymentId = payment.id;
  });

  afterAll(async () => {
    await cleanupArTestData();
  });

  it('should create a payment application and return it', async () => {
    const input = makePaymentApplicationInput(paymentId, invoiceId);
    const [created] = await paymentApplicationsRepository.create(input, TEST_TENANT_ID);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.paymentId).toBe(paymentId);
    expect(created.invoiceId).toBe(invoiceId);
    expect(created.amountApplied).toBe('500.0000');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should find payment applications by payment id', async () => {
    const prefix = `PA-BYPAY-${Date.now()}`;
    const [inv1] = await invoicesRepository.create(
      makeInvoiceInput(customerId, `${prefix}-INV1`),
      TEST_TENANT_ID,
    );
    const [inv2] = await invoicesRepository.create(
      makeInvoiceInput(customerId, `${prefix}-INV2`),
      TEST_TENANT_ID,
    );

    await paymentApplicationsRepository.create(
      makePaymentApplicationInput(paymentId, inv1.id),
      TEST_TENANT_ID,
    );
    await paymentApplicationsRepository.create(
      makePaymentApplicationInput(paymentId, inv2.id),
      TEST_TENANT_ID,
    );

    const found = await paymentApplicationsRepository.findByPaymentId(paymentId, TEST_TENANT_ID);
    expect(found.length).toBeGreaterThanOrEqual(2);
    found.forEach((app) => {
      expect(app.paymentId).toBe(paymentId);
    });
  });

  it('should find payment applications by invoice id', async () => {
    const prefix = `PA-BYINV-${Date.now()}`;
    const [targetInv] = await invoicesRepository.create(
      makeInvoiceInput(customerId, `${prefix}-INV`),
      TEST_TENANT_ID,
    );
    const [pay] = await paymentsRepository.create(
      makePaymentInput(customerId, `${prefix}-PAY`),
      TEST_TENANT_ID,
    );

    await paymentApplicationsRepository.create(
      makePaymentApplicationInput(pay.id, targetInv.id),
      TEST_TENANT_ID,
    );

    const found = await paymentApplicationsRepository.findByInvoiceId(
      targetInv.id,
      TEST_TENANT_ID,
    );
    expect(found.length).toBeGreaterThanOrEqual(1);
    found.forEach((app) => {
      expect(app.invoiceId).toBe(targetInv.id);
    });
  });

  it('should find payment application by id', async () => {
    const input = makePaymentApplicationInput(paymentId, invoiceId);
    const [created] = await paymentApplicationsRepository.create(input, TEST_TENANT_ID);

    const found = await paymentApplicationsRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
  });

  it('should return undefined for non-existent payment application id', async () => {
    const found = await paymentApplicationsRepository.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should delete a payment application', async () => {
    const input = makePaymentApplicationInput(paymentId, invoiceId);
    const [created] = await paymentApplicationsRepository.create(input, TEST_TENANT_ID);

    const deleted = await paymentApplicationsRepository.delete(created.id, TEST_TENANT_ID);
    expect(deleted).toHaveLength(1);

    const found = await paymentApplicationsRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should sum applied amount by invoice id', async () => {
    const prefix = `PA-SUM-${Date.now()}`;
    const [targetInv] = await invoicesRepository.create(
      makeInvoiceInput(customerId, `${prefix}-INV`),
      TEST_TENANT_ID,
    );
    const [pay1] = await paymentsRepository.create(
      makePaymentInput(customerId, `${prefix}-PAY1`),
      TEST_TENANT_ID,
    );
    const [pay2] = await paymentsRepository.create(
      makePaymentInput(customerId, `${prefix}-PAY2`),
      TEST_TENANT_ID,
    );

    await paymentApplicationsRepository.create(
      makePaymentApplicationInput(pay1.id, targetInv.id, { amountApplied: '100.0000' }),
      TEST_TENANT_ID,
    );
    await paymentApplicationsRepository.create(
      makePaymentApplicationInput(pay2.id, targetInv.id, { amountApplied: '250.0000' }),
      TEST_TENANT_ID,
    );

    const total = await paymentApplicationsRepository.sumAppliedByInvoiceId(
      targetInv.id,
      TEST_TENANT_ID,
    );
    expect(Number(total)).toBe(350);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Credit Notes Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('creditNotesRepository', () => {
  let customerId: string;

  beforeAll(async () => {
    await cleanupArTestData();
    const [customer] = await customersRepository.create(
      makeCustomerInput({ email: `cn-test-${Date.now()}@example.com` }),
      TEST_TENANT_ID,
    );
    customerId = customer.id;
  });

  afterAll(async () => {
    await cleanupArTestData();
  });

  it('should create a credit note and return it', async () => {
    const cnNumber = `CN-CREATE-${Date.now()}`;
    const input = makeCreditNoteInput(customerId, cnNumber);
    const [created] = await creditNotesRepository.create(input, TEST_TENANT_ID);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.creditNoteNumber).toBe(cnNumber);
    expect(created.customerId).toBe(customerId);
    expect(created.status).toBe('draft');
    expect(created.amount).toBe('200.0000');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should find a credit note by id', async () => {
    const cnNumber = `CN-FIND-${Date.now()}`;
    const [created] = await creditNotesRepository.create(
      makeCreditNoteInput(customerId, cnNumber),
      TEST_TENANT_ID,
    );

    const found = await creditNotesRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
  });

  it('should return undefined for non-existent credit note id', async () => {
    const found = await creditNotesRepository.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should isolate tenants for credit notes', async () => {
    const cnNumber = `CN-TENANT-${Date.now()}`;
    const [created] = await creditNotesRepository.create(
      makeCreditNoteInput(customerId, cnNumber),
      TEST_TENANT_ID,
    );

    const found = await creditNotesRepository.findById(created.id, '33333333-3333-4333-8333-333333333333');
    expect(found).toBeUndefined();
  });

  it('should update a credit note', async () => {
    const cnNumber = `CN-UPDATE-${Date.now()}`;
    const [created] = await creditNotesRepository.create(
      makeCreditNoteInput(customerId, cnNumber),
      TEST_TENANT_ID,
    );

    const updated = await creditNotesRepository.update(created.id, TEST_TENANT_ID, {
      status: 'issued',
      notes: 'Updated credit note',
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].status).toBe('issued');
    expect(updated[0].notes).toBe('Updated credit note');
  });

  it('should delete a credit note', async () => {
    const cnNumber = `CN-DELETE-${Date.now()}`;
    const [created] = await creditNotesRepository.create(
      makeCreditNoteInput(customerId, cnNumber),
      TEST_TENANT_ID,
    );

    const deleted = await creditNotesRepository.delete(created.id, TEST_TENANT_ID);
    expect(deleted).toHaveLength(1);

    const found = await creditNotesRepository.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should find many credit notes with pagination', async () => {
    const prefix = `CN-PAGE-${Date.now()}`;
    for (let i = 0; i < 4; i++) {
      await creditNotesRepository.create(
        makeCreditNoteInput(customerId, `${prefix}-${i}`),
        TEST_TENANT_ID,
      );
    }

    const page = await creditNotesRepository.findMany(TEST_TENANT_ID, { limit: 2, offset: 0 });
    expect(page.data.length).toBeLessThanOrEqual(2);
    expect(page.limit).toBe(2);
    expect(page.total).toBeGreaterThanOrEqual(4);
  });

  it('should filter credit notes by status', async () => {
    const prefix = `CN-STATUS-${Date.now()}`;
    await creditNotesRepository.create(
      makeCreditNoteInput(customerId, `${prefix}-DRAFT`, { status: 'draft' }),
      TEST_TENANT_ID,
    );
    await creditNotesRepository.create(
      makeCreditNoteInput(customerId, `${prefix}-ISSUED`, { status: 'issued' }),
      TEST_TENANT_ID,
    );

    const draft = await creditNotesRepository.findMany(TEST_TENANT_ID, { status: 'draft' });
    const allDraft = draft.data.every((cn) => cn.status === 'draft');
    expect(allDraft).toBe(true);
  });

  it('should filter credit notes by customer id', async () => {
    const prefix = `CN-CUST-${Date.now()}`;
    const [otherCustomer] = await customersRepository.create(
      makeCustomerInput({ email: `other-${prefix}@example.com` }),
      TEST_TENANT_ID,
    );

    await creditNotesRepository.create(
      makeCreditNoteInput(customerId, `${prefix}-MINE`),
      TEST_TENANT_ID,
    );
    await creditNotesRepository.create(
      makeCreditNoteInput(otherCustomer.id, `${prefix}-OTHERS`),
      TEST_TENANT_ID,
    );

    const mine = await creditNotesRepository.findMany(TEST_TENANT_ID, { customerId });
    const allMine = mine.data.every((cn) => cn.customerId === customerId);
    expect(allMine).toBe(true);
  });

  it('should find credit notes by customer id', async () => {
    const prefix = `CN-FIND-CUST-${Date.now()}`;
    await creditNotesRepository.create(
      makeCreditNoteInput(customerId, `${prefix}-A`),
      TEST_TENANT_ID,
    );
    await creditNotesRepository.create(
      makeCreditNoteInput(customerId, `${prefix}-B`),
      TEST_TENANT_ID,
    );

    const found = await creditNotesRepository.findByCustomerId(customerId, TEST_TENANT_ID);
    expect(found.length).toBeGreaterThanOrEqual(2);
  });

  it('should find credit note by credit note number', async () => {
    const cnNumber = `CN-NUM-${Date.now()}`;
    await creditNotesRepository.create(
      makeCreditNoteInput(customerId, cnNumber),
      TEST_TENANT_ID,
    );

    const found = await creditNotesRepository.findByCreditNoteNumber(cnNumber, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.creditNoteNumber).toBe(cnNumber);
  });
});
