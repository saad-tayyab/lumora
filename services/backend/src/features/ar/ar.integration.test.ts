import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { TEST_TENANT_ID, testDb } from '../../lib/integration-test-utils';

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
  },
}));

vi.mock('../../database', () => ({ db: testDb }));

vi.mock('encore.dev/pubsub', () => ({
  Topic: class MockTopic {
    name: string;
    publish = vi.fn().mockResolvedValue(undefined);
    constructor(name: string) {
      this.name = name;
    }
  },
}));

import {
  creditNotes,
  customers,
  invoiceLineItems,
  invoices,
  paymentApplications,
  payments,
} from '@lumora/database/schema';
import { eq } from 'drizzle-orm';
import {
  CreditNoteAmountExceedsBalanceError,
  CreditNoteDuplicateNumberError,
  CreditNoteNotFoundError,
  CreditNoteStatusTransitionError,
  CustomerDuplicateEmailError,
  CustomerNotFoundError,
  InvoiceDuplicateNumberError,
  InvoiceLineItemRequiredError,
  InvoiceNotFoundError,
  InvoiceStatusTransitionError,
  PaymentDuplicateNumberError,
  PaymentNotFoundError,
} from './errors';
import * as service from './service';

const OTHER_TENANT_ID = '33333333-3333-4333-8333-333333333333';

async function cleanupArTestData(): Promise<void> {
  await testDb.delete(paymentApplications).where(eq(paymentApplications.tenantId, TEST_TENANT_ID));
  await testDb.delete(invoiceLineItems).where(eq(invoiceLineItems.tenantId, TEST_TENANT_ID));
  await testDb.delete(payments).where(eq(payments.tenantId, TEST_TENANT_ID));
  await testDb.delete(creditNotes).where(eq(creditNotes.tenantId, TEST_TENANT_ID));
  await testDb.delete(invoices).where(eq(invoices.tenantId, TEST_TENANT_ID));
  await testDb.delete(customers).where(eq(customers.tenantId, TEST_TENANT_ID));
}

function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function makeCustomerInput(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Test Customer',
    email: `test-${uniqueSuffix()}@example.com`,
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

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Customer Lifecycle: create → get → update → list
// ═══════════════════════════════════════════════════════════════════════════════

describe('Customer lifecycle', () => {
  beforeAll(async () => {
    await cleanupArTestData();
  });

  afterAll(async () => {
    await cleanupArTestData();
  });

  it('should create a customer and retrieve it by id', async () => {
    const input = makeCustomerInput();
    const created = await service.createCustomer(input, TEST_TENANT_ID);

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Test Customer');
    expect(created.email).toBe(input.email);
    expect(created.tenantId).toBe(TEST_TENANT_ID);
    expect(created.isActive).toBe(true);

    const fetched = await service.getCustomer(created.id, TEST_TENANT_ID);
    expect(fetched.id).toBe(created.id);
    expect(fetched.name).toBe(created.name);
  });

  it('should update a customer and persist changes', async () => {
    const input = makeCustomerInput();
    const created = await service.createCustomer(input, TEST_TENANT_ID);

    const updated = await service.updateCustomer(
      created.id,
      { name: 'Renamed Corp', creditLimit: '75000.0000' },
      TEST_TENANT_ID,
    );
    expect(updated.name).toBe('Renamed Corp');
    expect(updated.creditLimit).toBe('75000.0000');

    const fetched = await service.getCustomer(created.id, TEST_TENANT_ID);
    expect(fetched.name).toBe('Renamed Corp');
    expect(fetched.creditLimit).toBe('75000.0000');
  });

  it('should list customers with pagination', async () => {
    const prefix = `list-${uniqueSuffix()}`;
    await service.createCustomer(
      makeCustomerInput({ email: `${prefix}-a@example.com` }),
      TEST_TENANT_ID,
    );
    await service.createCustomer(
      makeCustomerInput({ email: `${prefix}-b@example.com` }),
      TEST_TENANT_ID,
    );

    const page = await service.listCustomers(TEST_TENANT_ID, { limit: 1, offset: 0 });
    expect(page.data.length).toBeLessThanOrEqual(1);
    expect(page.limit).toBe(1);
    expect(page.total).toBeGreaterThanOrEqual(2);

    const page2 = await service.listCustomers(TEST_TENANT_ID, { limit: 1, offset: 1 });
    expect(page2.offset).toBe(1);
  });

  it('should throw CustomerNotFoundError for non-existent id', async () => {
    await expect(
      service.getCustomer('00000000-0000-0000-0000-000000000000', TEST_TENANT_ID),
    ).rejects.toThrow(CustomerNotFoundError);
  });

  it('should reject duplicate email within same tenant', async () => {
    const email = `dup-${uniqueSuffix()}@example.com`;
    await service.createCustomer(makeCustomerInput({ email }), TEST_TENANT_ID);

    await expect(
      service.createCustomer(makeCustomerInput({ email }), TEST_TENANT_ID),
    ).rejects.toThrow(CustomerDuplicateEmailError);
  });

  it('should isolate customers by tenant', async () => {
    const created = await service.createCustomer(makeCustomerInput(), TEST_TENANT_ID);

    await expect(service.getCustomer(created.id, OTHER_TENANT_ID)).rejects.toThrow(
      CustomerNotFoundError,
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Invoice Lifecycle: create customer → create invoice → get → list
// ═══════════════════════════════════════════════════════════════════════════════

describe('Invoice lifecycle', () => {
  let customerId: string;

  beforeAll(async () => {
    await cleanupArTestData();
    const customer = await service.createCustomer(makeCustomerInput(), TEST_TENANT_ID);
    customerId = customer.id;
  });

  afterAll(async () => {
    await cleanupArTestData();
  });

  it('should create an invoice with calculated totals', async () => {
    const invoiceNumber = `INV-${uniqueSuffix()}`;
    const invoice = await service.createInvoice(
      {
        customerId,
        invoiceNumber,
        issueDate: '2026-07-15',
        dueDate: '2026-08-14',
        currency: 'USD',
        lineItems: [
          { description: 'Widget A', quantity: '5', unitPrice: '100.0000', sortOrder: 0 },
          { description: 'Widget B', quantity: '2', unitPrice: '250.0000', sortOrder: 1 },
        ],
      },
      TEST_TENANT_ID,
    );

    expect(invoice.id).toBeDefined();
    expect(invoice.invoiceNumber).toBe(invoiceNumber);
    expect(invoice.status).toBe('draft');
    // subtotal = 5*100 + 2*250 = 1000
    expect(invoice.subtotal).toBe('1000.0000');
    expect(invoice.taxAmount).toBe('0.0000');
    expect(invoice.totalAmount).toBe('1000.0000');
    expect(invoice.amountPaid).toBe('0.0000');
    expect(invoice.balanceDue).toBe('1000.0000');
    expect(invoice.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should retrieve an invoice by id', async () => {
    const invoiceNumber = `INV-${uniqueSuffix()}`;
    const created = await service.createInvoice(
      {
        customerId,
        invoiceNumber,
        issueDate: '2026-07-15',
        dueDate: '2026-08-14',
        currency: 'USD',
        lineItems: [{ description: 'Service', quantity: '1', unitPrice: '500.0000', sortOrder: 0 }],
      },
      TEST_TENANT_ID,
    );

    const fetched = await service.getInvoice(created.id, TEST_TENANT_ID);
    expect(fetched.id).toBe(created.id);
    expect(fetched.invoiceNumber).toBe(invoiceNumber);
  });

  it('should list invoices filtered by customer', async () => {
    const prefix = `INV-${uniqueSuffix()}`;
    await service.createInvoice(
      {
        customerId,
        invoiceNumber: `${prefix}-1`,
        issueDate: '2026-07-15',
        dueDate: '2026-08-14',
        currency: 'USD',
        lineItems: [{ description: 'Item', quantity: '1', unitPrice: '100.0000', sortOrder: 0 }],
      },
      TEST_TENANT_ID,
    );

    const result = await service.listInvoices(TEST_TENANT_ID, {
      customerId,
      limit: 50,
      offset: 0,
    });
    expect(result.data.length).toBeGreaterThanOrEqual(1);
    expect(result.data.every((inv) => inv.customerId === customerId)).toBe(true);
  });

  it('should reject duplicate invoice numbers', async () => {
    const invoiceNumber = `DUP-${uniqueSuffix()}`;
    await service.createInvoice(
      {
        customerId,
        invoiceNumber,
        issueDate: '2026-07-15',
        dueDate: '2026-08-14',
        currency: 'USD',
        lineItems: [{ description: 'Item', quantity: '1', unitPrice: '100.0000', sortOrder: 0 }],
      },
      TEST_TENANT_ID,
    );

    await expect(
      service.createInvoice(
        {
          customerId,
          invoiceNumber,
          issueDate: '2026-07-20',
          dueDate: '2026-08-19',
          currency: 'USD',
          lineItems: [{ description: 'Item', quantity: '1', unitPrice: '50.0000', sortOrder: 0 }],
        },
        TEST_TENANT_ID,
      ),
    ).rejects.toThrow(InvoiceDuplicateNumberError);
  });

  it('should reject invoice with no line items', async () => {
    await expect(
      service.createInvoice(
        {
          customerId,
          invoiceNumber: `NOLINE-${uniqueSuffix()}`,
          issueDate: '2026-07-15',
          dueDate: '2026-08-14',
          currency: 'USD',
          lineItems: [],
        },
        TEST_TENANT_ID,
      ),
    ).rejects.toThrow(InvoiceLineItemRequiredError);
  });

  it('should update invoice status following valid transitions', async () => {
    const created = await service.createInvoice(
      {
        customerId,
        invoiceNumber: `STATUS-${uniqueSuffix()}`,
        issueDate: '2026-07-15',
        dueDate: '2026-08-14',
        currency: 'USD',
        lineItems: [{ description: 'Item', quantity: '1', unitPrice: '100.0000', sortOrder: 0 }],
      },
      TEST_TENANT_ID,
    );

    expect(created.status).toBe('draft');

    const sent = await service.updateInvoiceStatus(created.id, 'sent', TEST_TENANT_ID);
    expect(sent.status).toBe('sent');

    const paid = await service.updateInvoiceStatus(created.id, 'paid', TEST_TENANT_ID);
    expect(paid.status).toBe('paid');
  });

  it('should reject invalid status transition (draft → paid)', async () => {
    const created = await service.createInvoice(
      {
        customerId,
        invoiceNumber: `BADSTAT-${uniqueSuffix()}`,
        issueDate: '2026-07-15',
        dueDate: '2026-08-14',
        currency: 'USD',
        lineItems: [{ description: 'Item', quantity: '1', unitPrice: '100.0000', sortOrder: 0 }],
      },
      TEST_TENANT_ID,
    );

    await expect(service.updateInvoiceStatus(created.id, 'paid', TEST_TENANT_ID)).rejects.toThrow(
      InvoiceStatusTransitionError,
    );
  });

  it('should throw InvoiceNotFoundError for non-existent invoice', async () => {
    await expect(
      service.getInvoice('00000000-0000-0000-0000-000000000000', TEST_TENANT_ID),
    ).rejects.toThrow(InvoiceNotFoundError);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Invoice Line Items: create invoice with line items → verify
// ═══════════════════════════════════════════════════════════════════════════════

describe('Invoice line items', () => {
  let customerId: string;

  beforeAll(async () => {
    await cleanupArTestData();
    const customer = await service.createCustomer(makeCustomerInput(), TEST_TENANT_ID);
    customerId = customer.id;
  });

  afterAll(async () => {
    await cleanupArTestData();
  });

  it('should create invoice with line items and return them', async () => {
    const invoice = await service.createInvoice(
      {
        customerId,
        invoiceNumber: `INV-LINE-${uniqueSuffix()}`,
        issueDate: '2026-07-15',
        dueDate: '2026-08-14',
        currency: 'USD',
        lineItems: [
          { description: 'Product A', quantity: '10', unitPrice: '25.0000', sortOrder: 0 },
          {
            description: 'Product B',
            quantity: '3',
            unitPrice: '100.0000',
            taxRate: '0.10',
            sortOrder: 1,
          },
        ],
      },
      TEST_TENANT_ID,
    );

    const items = await service.getInvoiceLineItems(invoice.id, TEST_TENANT_ID);

    expect(items).toHaveLength(2);
    expect(items[0].description).toBe('Product A');
    expect(items[0].amount).toBe('250.0000');
    expect(items[0].taxAmount).toBe('0.0000');
    expect(items[1].description).toBe('Product B');
    expect(items[1].amount).toBe('300.0000');
    expect(items[1].taxAmount).toBe('30.0000');

    const refetched = await service.getInvoice(invoice.id, TEST_TENANT_ID);
    expect(refetched.subtotal).toBe('550.0000');
    expect(refetched.taxAmount).toBe('30.0000');
    expect(refetched.totalAmount).toBe('580.0000');
  });

  it('should calculate tax amounts correctly', async () => {
    const invoice = await service.createInvoice(
      {
        customerId,
        invoiceNumber: `INV-TAX-${uniqueSuffix()}`,
        issueDate: '2026-07-15',
        dueDate: '2026-08-14',
        currency: 'USD',
        lineItems: [
          {
            description: 'Taxed Item',
            quantity: '2',
            unitPrice: '500.0000',
            taxRate: '0.15',
            sortOrder: 0,
          },
        ],
      },
      TEST_TENANT_ID,
    );

    const items = await service.getInvoiceLineItems(invoice.id, TEST_TENANT_ID);
    expect(items).toHaveLength(1);
    expect(items[0].amount).toBe('1000.0000');
    expect(items[0].taxAmount).toBe('150.0000');

    const invoiceRecord = await service.getInvoice(invoice.id, TEST_TENANT_ID);
    expect(invoiceRecord.subtotal).toBe('1000.0000');
    expect(invoiceRecord.taxAmount).toBe('150.0000');
    expect(invoiceRecord.totalAmount).toBe('1150.0000');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Payment Lifecycle: create invoice → create payment → apply to invoice
// ═══════════════════════════════════════════════════════════════════════════════

describe('Payment lifecycle', () => {
  let customerId: string;

  beforeAll(async () => {
    await cleanupArTestData();
    const customer = await service.createCustomer(makeCustomerInput(), TEST_TENANT_ID);
    customerId = customer.id;
  });

  afterAll(async () => {
    await cleanupArTestData();
  });

  it('should create a payment for a customer', async () => {
    const payment = await service.createPayment(
      {
        customerId,
        paymentNumber: `PAY-${uniqueSuffix()}`,
        paymentDate: '2026-07-20',
        amount: '500.0000',
        paymentMethod: 'bank_transfer',
        referenceNumber: 'REF-001',
        currency: 'USD',
      },
      TEST_TENANT_ID,
    );

    expect(payment.id).toBeDefined();
    expect(payment.amount).toBe('500.0000');
    expect(payment.paymentMethod).toBe('bank_transfer');
    expect(payment.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should apply payment to invoice and update balance', async () => {
    const invoice = await service.createInvoice(
      {
        customerId,
        invoiceNumber: `INV-PAY-${uniqueSuffix()}`,
        issueDate: '2026-07-15',
        dueDate: '2026-08-14',
        currency: 'USD',
        lineItems: [
          { description: 'Service', quantity: '1', unitPrice: '1000.0000', sortOrder: 0 },
        ],
      },
      TEST_TENANT_ID,
    );

    const payment = await service.createPayment(
      {
        customerId,
        paymentNumber: `PAY-${uniqueSuffix()}`,
        paymentDate: '2026-07-20',
        amount: '600.0000',
        paymentMethod: 'bank_transfer',
        currency: 'USD',
      },
      TEST_TENANT_ID,
    );

    const application = await service.createPaymentApplication(
      {
        paymentId: payment.id,
        invoiceId: invoice.id,
        amountApplied: '600.0000',
        appliedDate: '2026-07-20',
      },
      TEST_TENANT_ID,
    );

    expect(application.id).toBeDefined();
    expect(application.amountApplied).toBe('600.0000');

    const updatedInvoice = await service.getInvoice(invoice.id, TEST_TENANT_ID);
    expect(updatedInvoice.amountPaid).toBe('600.0000');
    expect(updatedInvoice.balanceDue).toBe('400.0000');
    expect(updatedInvoice.status).toBe('draft');
  });

  it('should mark invoice as paid when fully paid', async () => {
    const invoice = await service.createInvoice(
      {
        customerId,
        invoiceNumber: `INV-FULL-${uniqueSuffix()}`,
        issueDate: '2026-07-15',
        dueDate: '2026-08-14',
        currency: 'USD',
        lineItems: [{ description: 'Service', quantity: '1', unitPrice: '200.0000', sortOrder: 0 }],
      },
      TEST_TENANT_ID,
    );

    const payment = await service.createPayment(
      {
        customerId,
        paymentNumber: `PAY-${uniqueSuffix()}`,
        paymentDate: '2026-07-20',
        amount: '200.0000',
        paymentMethod: 'cash',
        currency: 'USD',
      },
      TEST_TENANT_ID,
    );

    await service.createPaymentApplication(
      {
        paymentId: payment.id,
        invoiceId: invoice.id,
        amountApplied: '200.0000',
        appliedDate: '2026-07-20',
      },
      TEST_TENANT_ID,
    );

    const updatedInvoice = await service.getInvoice(invoice.id, TEST_TENANT_ID);
    expect(updatedInvoice.amountPaid).toBe('200.0000');
    expect(updatedInvoice.balanceDue).toBe('0.0000');
    expect(updatedInvoice.status).toBe('paid');
  });

  it('should throw PaymentNotFoundError for non-existent payment', async () => {
    await expect(
      service.getPayment('00000000-0000-0000-0000-000000000000', TEST_TENANT_ID),
    ).rejects.toThrow(PaymentNotFoundError);
  });

  it('should reject duplicate payment numbers', async () => {
    const num = `PAY-DUP-${uniqueSuffix()}`;
    await service.createPayment(
      {
        customerId,
        paymentNumber: num,
        paymentDate: '2026-07-20',
        amount: '100.0000',
        paymentMethod: 'cash',
        currency: 'USD',
      },
      TEST_TENANT_ID,
    );

    await expect(
      service.createPayment(
        {
          customerId,
          paymentNumber: num,
          paymentDate: '2026-07-21',
          amount: '50.0000',
          paymentMethod: 'cash',
          currency: 'USD',
        },
        TEST_TENANT_ID,
      ),
    ).rejects.toThrow(PaymentDuplicateNumberError);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Credit Note Flow: create invoice → create credit note → apply
// ═══════════════════════════════════════════════════════════════════════════════

describe('Credit note flow', () => {
  let customerId: string;

  beforeAll(async () => {
    await cleanupArTestData();
    const customer = await service.createCustomer(makeCustomerInput(), TEST_TENANT_ID);
    customerId = customer.id;
  });

  afterAll(async () => {
    await cleanupArTestData();
  });

  it('should create a credit note in draft status', async () => {
    const creditNote = await service.createCreditNote(
      {
        customerId,
        creditNoteNumber: `CN-${uniqueSuffix()}`,
        issueDate: '2026-07-25',
        reason: 'Defective product',
        amount: '300.0000',
        currency: 'USD',
      },
      TEST_TENANT_ID,
    );

    expect(creditNote.id).toBeDefined();
    expect(creditNote.status).toBe('draft');
    expect(creditNote.amount).toBe('300.0000');
    expect(creditNote.amountApplied).toBe('0.0000');
    expect(creditNote.balance).toBe('300.0000');
  });

  it('should transition credit note through draft → issued → applied', async () => {
    const creditNote = await service.createCreditNote(
      {
        customerId,
        creditNoteNumber: `CN-${uniqueSuffix()}`,
        issueDate: '2026-07-25',
        reason: 'Return',
        amount: '500.0000',
        currency: 'USD',
      },
      TEST_TENANT_ID,
    );

    const issued = await service.updateCreditNoteStatus(creditNote.id, 'issued', TEST_TENANT_ID);
    expect(issued.status).toBe('issued');

    const invoice = await service.createInvoice(
      {
        customerId,
        invoiceNumber: `INV-CN-${uniqueSuffix()}`,
        issueDate: '2026-07-15',
        dueDate: '2026-08-14',
        currency: 'USD',
        lineItems: [{ description: 'Service', quantity: '1', unitPrice: '500.0000', sortOrder: 0 }],
      },
      TEST_TENANT_ID,
    );

    await service.applyCreditNote(
      creditNote.id,
      { invoiceId: invoice.id, amountApplied: '500.0000', appliedDate: '2026-07-25' },
      TEST_TENANT_ID,
    );

    const updatedCN = await service.getCreditNote(creditNote.id, TEST_TENANT_ID);
    expect(updatedCN.status).toBe('applied');
    expect(updatedCN.amountApplied).toBe('500.0000');
    expect(updatedCN.balance).toBe('0.0000');
  });

  it('should partially apply credit note and update invoice balance', async () => {
    const creditNote = await service.createCreditNote(
      {
        customerId,
        creditNoteNumber: `CN-${uniqueSuffix()}`,
        issueDate: '2026-07-25',
        reason: 'Partial return',
        amount: '200.0000',
        currency: 'USD',
      },
      TEST_TENANT_ID,
    );

    await service.updateCreditNoteStatus(creditNote.id, 'issued', TEST_TENANT_ID);

    const invoice = await service.createInvoice(
      {
        customerId,
        invoiceNumber: `INV-CN-${uniqueSuffix()}`,
        issueDate: '2026-07-15',
        dueDate: '2026-08-14',
        currency: 'USD',
        lineItems: [{ description: 'Service', quantity: '1', unitPrice: '500.0000', sortOrder: 0 }],
      },
      TEST_TENANT_ID,
    );

    await service.applyCreditNote(
      creditNote.id,
      { invoiceId: invoice.id, amountApplied: '100.0000', appliedDate: '2026-07-25' },
      TEST_TENANT_ID,
    );

    const updatedCN = await service.getCreditNote(creditNote.id, TEST_TENANT_ID);
    expect(updatedCN.status).toBe('issued');
    expect(updatedCN.amountApplied).toBe('100.0000');
    expect(updatedCN.balance).toBe('100.0000');

    const updatedInvoice = await service.getInvoice(invoice.id, TEST_TENANT_ID);
    expect(updatedInvoice.amountPaid).toBe('100.0000');
    expect(updatedInvoice.balanceDue).toBe('400.0000');
  });

  it('should throw CreditNoteNotFoundError for non-existent id', async () => {
    await expect(
      service.getCreditNote('00000000-0000-0000-0000-000000000000', TEST_TENANT_ID),
    ).rejects.toThrow(CreditNoteNotFoundError);
  });

  it('should reject duplicate credit note numbers', async () => {
    const num = `CN-DUP-${uniqueSuffix()}`;
    await service.createCreditNote(
      {
        customerId,
        creditNoteNumber: num,
        issueDate: '2026-07-25',
        reason: 'Return',
        amount: '100.0000',
        currency: 'USD',
      },
      TEST_TENANT_ID,
    );

    await expect(
      service.createCreditNote(
        {
          customerId,
          creditNoteNumber: num,
          issueDate: '2026-07-26',
          reason: 'Another return',
          amount: '50.0000',
          currency: 'USD',
        },
        TEST_TENANT_ID,
      ),
    ).rejects.toThrow(CreditNoteDuplicateNumberError);
  });

  it('should reject applying credit note in draft status', async () => {
    const creditNote = await service.createCreditNote(
      {
        customerId,
        creditNoteNumber: `CN-${uniqueSuffix()}`,
        issueDate: '2026-07-25',
        reason: 'Return',
        amount: '100.0000',
        currency: 'USD',
      },
      TEST_TENANT_ID,
    );

    const invoice = await service.createInvoice(
      {
        customerId,
        invoiceNumber: `INV-CN-${uniqueSuffix()}`,
        issueDate: '2026-07-15',
        dueDate: '2026-08-14',
        currency: 'USD',
        lineItems: [{ description: 'Item', quantity: '1', unitPrice: '200.0000', sortOrder: 0 }],
      },
      TEST_TENANT_ID,
    );

    await expect(
      service.applyCreditNote(
        creditNote.id,
        { invoiceId: invoice.id, amountApplied: '100.0000', appliedDate: '2026-07-25' },
        TEST_TENANT_ID,
      ),
    ).rejects.toThrow(CreditNoteStatusTransitionError);
  });

  it('should reject credit note apply when amount exceeds balance', async () => {
    const creditNote = await service.createCreditNote(
      {
        customerId,
        creditNoteNumber: `CN-${uniqueSuffix()}`,
        issueDate: '2026-07-25',
        reason: 'Return',
        amount: '100.0000',
        currency: 'USD',
      },
      TEST_TENANT_ID,
    );

    await service.updateCreditNoteStatus(creditNote.id, 'issued', TEST_TENANT_ID);

    const invoice = await service.createInvoice(
      {
        customerId,
        invoiceNumber: `INV-CN-${uniqueSuffix()}`,
        issueDate: '2026-07-15',
        dueDate: '2026-08-14',
        currency: 'USD',
        lineItems: [{ description: 'Item', quantity: '1', unitPrice: '500.0000', sortOrder: 0 }],
      },
      TEST_TENANT_ID,
    );

    await expect(
      service.applyCreditNote(
        creditNote.id,
        { invoiceId: invoice.id, amountApplied: '200.0000', appliedDate: '2026-07-25' },
        TEST_TENANT_ID,
      ),
    ).rejects.toThrow(CreditNoteAmountExceedsBalanceError);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Tenant Isolation: verify scoped queries
// ═══════════════════════════════════════════════════════════════════════════════

describe('Tenant isolation', () => {
  beforeAll(async () => {
    await cleanupArTestData();
  });

  afterAll(async () => {
    await cleanupArTestData();
  });

  it('should not expose customers from other tenants', async () => {
    const created = await service.createCustomer(makeCustomerInput(), TEST_TENANT_ID);

    await expect(service.getCustomer(created.id, OTHER_TENANT_ID)).rejects.toThrow(
      CustomerNotFoundError,
    );

    const otherPage = await service.listCustomers(OTHER_TENANT_ID, { limit: 100, offset: 0 });
    expect(otherPage.data.find((c) => c.id === created.id)).toBeUndefined();
  });

  it('should not expose invoices from other tenants', async () => {
    const customer = await service.createCustomer(makeCustomerInput(), TEST_TENANT_ID);

    const invoice = await service.createInvoice(
      {
        customerId: customer.id,
        invoiceNumber: `INV-ISO-${uniqueSuffix()}`,
        issueDate: '2026-07-15',
        dueDate: '2026-08-14',
        currency: 'USD',
        lineItems: [{ description: 'Item', quantity: '1', unitPrice: '100.0000', sortOrder: 0 }],
      },
      TEST_TENANT_ID,
    );

    await expect(service.getInvoice(invoice.id, OTHER_TENANT_ID)).rejects.toThrow(
      InvoiceNotFoundError,
    );
  });

  it('should not expose payments from other tenants', async () => {
    const customer = await service.createCustomer(makeCustomerInput(), TEST_TENANT_ID);

    const payment = await service.createPayment(
      {
        customerId: customer.id,
        paymentNumber: `PAY-ISO-${uniqueSuffix()}`,
        paymentDate: '2026-07-20',
        amount: '500.0000',
        paymentMethod: 'cash',
        currency: 'USD',
      },
      TEST_TENANT_ID,
    );

    await expect(service.getPayment(payment.id, OTHER_TENANT_ID)).rejects.toThrow(
      PaymentNotFoundError,
    );
  });

  it('should not expose credit notes from other tenants', async () => {
    const customer = await service.createCustomer(makeCustomerInput(), TEST_TENANT_ID);

    const creditNote = await service.createCreditNote(
      {
        customerId: customer.id,
        creditNoteNumber: `CN-ISO-${uniqueSuffix()}`,
        issueDate: '2026-07-25',
        reason: 'Return',
        amount: '100.0000',
        currency: 'USD',
      },
      TEST_TENANT_ID,
    );

    await expect(service.getCreditNote(creditNote.id, OTHER_TENANT_ID)).rejects.toThrow(
      CreditNoteNotFoundError,
    );
  });
});
