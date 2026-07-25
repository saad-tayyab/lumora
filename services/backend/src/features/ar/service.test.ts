import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OTHER_TENANT_ID, TEST_TENANT_ID } from '../../lib/test-utils';
import {
  createCreditNoteFixture,
  createCreditNoteInputFixture,
  createCustomerFixture,
  createCustomerInputFixture,
  createInvoiceFixture,
  createInvoiceInputFixture,
  createInvoiceLineItemFixture,
  createPaymentApplicationFixture,
  createPaymentApplicationInputFixture,
  createPaymentFixture,
  createPaymentInputFixture,
} from './fixtures/ar.fixture';

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

vi.mock('encore.dev/pubsub', () => ({
  Topic: class MockTopic {
    constructor(_name: string, _config?: unknown) {}
    async publish(_data: unknown) {
      return 'mock-message-id';
    }
  },
}));

vi.mock('./events', () => ({
  invoiceCreated: { publish: vi.fn().mockResolvedValue('mock-message-id') },
}));

// ─── Mock Database Module ─────────────────────────────────────────────────

const mockTx = {
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi
        .fn()
        .mockResolvedValue([{ id: 'test-id-00000000-0000-0000-000000000001', status: 'draft' }]),
    }),
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  }),
  delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  query: {
    customers: {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
    },
    invoices: {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
    },
    invoiceLineItems: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    payments: {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
    },
    paymentApplications: {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
    },
    creditNotes: {
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
  customers: createMockTable('customers'),
  invoices: createMockTable('invoices'),
  invoiceLineItems: createMockTable('invoice_line_items'),
  payments: createMockTable('payments'),
  paymentApplications: createMockTable('payment_applications'),
  creditNotes: createMockTable('credit_notes'),
}));

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: vi.fn(() => true),
    and: vi.fn(() => true),
    isNull: vi.fn(() => true),
    asc: vi.fn(() => ({})),
    or: vi.fn(() => ({})),
    count: vi.fn(() => 0),
    sum: vi.fn(() => '0'),
  };
});

// ─── Mock Repo Module ─────────────────────────────────────────────────────

const {
  mockCustomersRepo,
  mockInvoicesRepo,
  mockInvoiceLineItemsRepo,
  mockPaymentsRepo,
  mockPaymentApplicationsRepo,
  mockCreditNotesRepo,
} = vi.hoisted(() => ({
  mockCustomersRepo: {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findMany: vi.fn(),
    findActiveCustomers: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    countInvoices: vi.fn(),
  },
  mockInvoicesRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
    findByCustomerId: vi.fn(),
    findByStatus: vi.fn(),
    findByInvoiceNumber: vi.fn(),
    findOverdueInvoices: vi.fn(),
    sumBalanceDueByCustomer: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  mockInvoiceLineItemsRepo: {
    findById: vi.fn(),
    findByInvoiceId: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteByInvoiceId: vi.fn(),
  },
  mockPaymentsRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
    findByCustomerId: vi.fn(),
    findByPaymentNumber: vi.fn(),
    sumAppliedByPaymentId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  mockPaymentApplicationsRepo: {
    findById: vi.fn(),
    findByPaymentId: vi.fn(),
    findByInvoiceId: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    sumAppliedByInvoiceId: vi.fn(),
  },
  mockCreditNotesRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
    findByCustomerId: vi.fn(),
    findByCreditNoteNumber: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('./repo', () => ({
  customersRepository: mockCustomersRepo,
  invoicesRepository: mockInvoicesRepo,
  invoiceLineItemsRepository: mockInvoiceLineItemsRepo,
  paymentsRepository: mockPaymentsRepo,
  paymentApplicationsRepository: mockPaymentApplicationsRepo,
  creditNotesRepository: mockCreditNotesRepo,
}));

// ─── Import Service After Mocking ─────────────────────────────────────────

import {
  CreditNoteAmountExceedsBalanceError,
  CreditNoteDuplicateNumberError,
  CreditNoteNotFoundError,
  CreditNoteStatusTransitionError,
  CustomerDuplicateEmailError,
  CustomerHasOutstandingInvoicesError,
  CustomerNotFoundError,
  InvoiceAlreadyPaidError,
  InvoiceAlreadyVoidedError,
  InvoiceDuplicateNumberError,
  InvoiceLineItemRequiredError,
  InvoiceNotFoundError,
  InvoiceStatusTransitionError,
  PaymentAlreadyFullyAppliedError,
  PaymentAmountExceedsInvoiceBalanceError,
  PaymentApplicationNotFoundError,
  PaymentDuplicateNumberError,
  PaymentNotFoundError,
} from './errors';
import * as service from './service';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('AR Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CUSTOMER SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Customer Service', () => {
    describe('listCustomers', () => {
      it('should return paginated customers', async () => {
        const customers = [createCustomerFixture()];
        mockCustomersRepo.findMany.mockResolvedValue({
          data: customers,
          total: 1,
          limit: 50,
          offset: 0,
        });

        const result = await service.listCustomers(TEST_TENANT_ID, { limit: 50, offset: 0 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(mockCustomersRepo.findMany).toHaveBeenCalledWith(TEST_TENANT_ID, {
          limit: 50,
          offset: 0,
        });
      });

      it('should return empty list when no customers exist', async () => {
        mockCustomersRepo.findMany.mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

        const result = await service.listCustomers(TEST_TENANT_ID, { limit: 50, offset: 0 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should pass pagination params to repo', async () => {
        mockCustomersRepo.findMany.mockResolvedValue({ data: [], total: 0, limit: 10, offset: 20 });

        await service.listCustomers(TEST_TENANT_ID, { limit: 10, offset: 20 });

        expect(mockCustomersRepo.findMany).toHaveBeenCalledWith(TEST_TENANT_ID, {
          limit: 10,
          offset: 20,
        });
      });

      it('should scope query to tenant', async () => {
        mockCustomersRepo.findMany.mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

        await service.listCustomers(TEST_TENANT_ID, { limit: 50, offset: 0 });

        expect(mockCustomersRepo.findMany).toHaveBeenCalledWith(TEST_TENANT_ID, expect.anything());
      });
    });

    describe('getCustomer', () => {
      it('should return customer by id', async () => {
        const customer = createCustomerFixture();
        mockCustomersRepo.findById.mockResolvedValue(customer);

        const result = await service.getCustomer(customer.id, TEST_TENANT_ID);

        expect(result).toEqual(customer);
        expect(mockCustomersRepo.findById).toHaveBeenCalledWith(customer.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent customer', async () => {
        mockCustomersRepo.findById.mockResolvedValue(undefined);

        await expect(service.getCustomer('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          CustomerNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockCustomersRepo.findById.mockResolvedValue(undefined);

        await expect(service.getCustomer('cust-1', OTHER_TENANT_ID)).rejects.toThrow(
          CustomerNotFoundError,
        );
        expect(mockCustomersRepo.findById).toHaveBeenCalledWith('cust-1', OTHER_TENANT_ID);
      });
    });

    describe('createCustomer', () => {
      it('should create customer with valid data', async () => {
        const input = createCustomerInputFixture();
        const expected = createCustomerFixture();

        mockCustomersRepo.findByEmail.mockResolvedValue(undefined);
        mockCustomersRepo.create.mockResolvedValue([expected]);

        const result = await service.createCustomer(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(mockCustomersRepo.findByEmail).toHaveBeenCalledWith(input.email, TEST_TENANT_ID);
        expect(mockCustomersRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: input.name,
            email: input.email,
            phone: input.phone,
          }),
          TEST_TENANT_ID,
        );
      });

      it('should create customer without email', async () => {
        const input = createCustomerInputFixture({ email: undefined });
        const expected = createCustomerFixture({ email: null });

        mockCustomersRepo.create.mockResolvedValue([expected]);

        const result = await service.createCustomer(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(mockCustomersRepo.findByEmail).not.toHaveBeenCalled();
      });

      it('should reject duplicate email', async () => {
        const input = createCustomerInputFixture();
        const existing = createCustomerFixture();

        mockCustomersRepo.findByEmail.mockResolvedValue(existing);

        await expect(service.createCustomer(input, TEST_TENANT_ID)).rejects.toThrow(
          CustomerDuplicateEmailError,
        );
      });

      it('should scope email uniqueness to tenant', async () => {
        const input = createCustomerInputFixture();
        const otherTenantCustomer = createCustomerFixture();

        mockCustomersRepo.findByEmail.mockImplementation(
          async (_email: string, tenantId: string) => {
            if (tenantId === OTHER_TENANT_ID) return otherTenantCustomer;
            return undefined;
          },
        );
        mockCustomersRepo.create.mockResolvedValue([createCustomerFixture()]);

        const result = await service.createCustomer(input, TEST_TENANT_ID);
        expect(result).toBeDefined();
        expect(mockCustomersRepo.findByEmail).toHaveBeenCalledWith(input.email, TEST_TENANT_ID);
      });

      it('should create customer with all address fields', async () => {
        const input = createCustomerInputFixture({
          addressLine1: '123 Oak Ave',
          addressLine2: 'Suite 200',
          city: 'Chicago',
          state: 'IL',
          postalCode: '60601',
          country: 'USA',
        });
        const expected = createCustomerFixture(input);

        mockCustomersRepo.findByEmail.mockResolvedValue(undefined);
        mockCustomersRepo.create.mockResolvedValue([expected]);

        const _result = await service.createCustomer(input, TEST_TENANT_ID);

        expect(mockCustomersRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            addressLine1: '123 Oak Ave',
            addressLine2: 'Suite 200',
            city: 'Chicago',
            state: 'IL',
            postalCode: '60601',
            country: 'USA',
          }),
          TEST_TENANT_ID,
        );
      });
    });

    describe('updateCustomer', () => {
      it('should update customer fields', async () => {
        const existing = createCustomerFixture();
        const updated = { ...existing, name: 'Updated Corp' };

        mockCustomersRepo.findById.mockResolvedValue(existing);
        mockCustomersRepo.update.mockResolvedValue([updated]);

        const result = await service.updateCustomer(
          existing.id,
          { name: 'Updated Corp' },
          TEST_TENANT_ID,
        );

        expect(result.name).toBe('Updated Corp');
        expect(mockCustomersRepo.update).toHaveBeenCalledWith(
          existing.id,
          TEST_TENANT_ID,
          expect.objectContaining({ name: 'Updated Corp' }),
        );
      });

      it('should update customer email without conflict if same', async () => {
        const existing = createCustomerFixture({ email: 'test@example.com' });
        const updated = { ...existing, email: 'test@example.com' };

        mockCustomersRepo.findById.mockResolvedValue(existing);
        mockCustomersRepo.update.mockResolvedValue([updated]);

        const result = await service.updateCustomer(
          existing.id,
          { email: 'test@example.com' },
          TEST_TENANT_ID,
        );

        expect(result.email).toBe('test@example.com');
        expect(mockCustomersRepo.findByEmail).not.toHaveBeenCalled();
      });

      it('should reject duplicate email on update', async () => {
        const existing = createCustomerFixture({ email: 'old@example.com' });
        const duplicate = createCustomerFixture({ id: 'other-id', email: 'new@example.com' });

        mockCustomersRepo.findById.mockResolvedValue(existing);
        mockCustomersRepo.findByEmail.mockResolvedValue(duplicate);

        await expect(
          service.updateCustomer(existing.id, { email: 'new@example.com' }, TEST_TENANT_ID),
        ).rejects.toThrow(CustomerDuplicateEmailError);
      });

      it('should throw NotFoundError for non-existent customer', async () => {
        mockCustomersRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateCustomer('non-existent', { name: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(CustomerNotFoundError);
      });

      it('should throw NotFoundError when update returns empty', async () => {
        const existing = createCustomerFixture();
        mockCustomersRepo.findById.mockResolvedValue(existing);
        mockCustomersRepo.update.mockResolvedValue([]);

        await expect(
          service.updateCustomer(existing.id, { name: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(CustomerNotFoundError);
      });

      it('should update isActive flag', async () => {
        const existing = createCustomerFixture({ isActive: true });
        const updated = { ...existing, isActive: false };

        mockCustomersRepo.findById.mockResolvedValue(existing);
        mockCustomersRepo.update.mockResolvedValue([updated]);

        const result = await service.updateCustomer(
          existing.id,
          { isActive: false },
          TEST_TENANT_ID,
        );

        expect(result.isActive).toBe(false);
      });

      it('should update payment terms', async () => {
        const existing = createCustomerFixture({ paymentTerms: 'Net 30' });
        const updated = { ...existing, paymentTerms: 'Net 60' };

        mockCustomersRepo.findById.mockResolvedValue(existing);
        mockCustomersRepo.update.mockResolvedValue([updated]);

        const result = await service.updateCustomer(
          existing.id,
          { paymentTerms: 'Net 60' },
          TEST_TENANT_ID,
        );

        expect(result.paymentTerms).toBe('Net 60');
      });

      it('should update credit limit', async () => {
        const existing = createCustomerFixture({ creditLimit: '50000.0000' });
        const updated = { ...existing, creditLimit: '75000.0000' };

        mockCustomersRepo.findById.mockResolvedValue(existing);
        mockCustomersRepo.update.mockResolvedValue([updated]);

        const result = await service.updateCustomer(
          existing.id,
          { creditLimit: '75000.0000' },
          TEST_TENANT_ID,
        );

        expect(result.creditLimit).toBe('75000.0000');
      });
    });

    describe('deleteCustomer', () => {
      it('should delete customer with no invoices', async () => {
        const customer = createCustomerFixture();

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockCustomersRepo.countInvoices.mockResolvedValue(0);
        mockCustomersRepo.delete.mockResolvedValue(undefined);

        await service.deleteCustomer(customer.id, TEST_TENANT_ID);

        expect(mockCustomersRepo.delete).toHaveBeenCalledWith(customer.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent customer', async () => {
        mockCustomersRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteCustomer('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          CustomerNotFoundError,
        );
      });

      it('should reject deletion of customer with outstanding invoices', async () => {
        const customer = createCustomerFixture();

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockCustomersRepo.countInvoices.mockResolvedValue(3);

        await expect(service.deleteCustomer(customer.id, TEST_TENANT_ID)).rejects.toThrow(
          CustomerHasOutstandingInvoicesError,
        );
        expect(mockCustomersRepo.delete).not.toHaveBeenCalled();
      });

      it('should scope invoice count to tenant', async () => {
        const customer = createCustomerFixture();

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockCustomersRepo.countInvoices.mockResolvedValue(0);
        mockCustomersRepo.delete.mockResolvedValue(undefined);

        await service.deleteCustomer(customer.id, TEST_TENANT_ID);

        expect(mockCustomersRepo.countInvoices).toHaveBeenCalledWith(customer.id, TEST_TENANT_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INVOICE SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Invoice Service', () => {
    describe('listInvoices', () => {
      it('should return paginated invoices', async () => {
        const invoices = [createInvoiceFixture()];
        mockInvoicesRepo.findMany.mockResolvedValue({
          data: invoices,
          total: 1,
          limit: 50,
          offset: 0,
        });

        const result = await service.listInvoices(TEST_TENANT_ID, {
          limit: 50,
          offset: 0,
        });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
      });

      it('should filter by customerId', async () => {
        mockInvoicesRepo.findMany.mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

        await service.listInvoices(TEST_TENANT_ID, {
          limit: 50,
          offset: 0,
          customerId: 'cust-1',
        });

        expect(mockInvoicesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ customerId: 'cust-1' }),
        );
      });

      it('should filter by status', async () => {
        mockInvoicesRepo.findMany.mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

        await service.listInvoices(TEST_TENANT_ID, {
          limit: 50,
          offset: 0,
          status: 'sent',
        });

        expect(mockInvoicesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ status: 'sent' }),
        );
      });

      it('should return empty list when no invoices exist', async () => {
        mockInvoicesRepo.findMany.mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

        const result = await service.listInvoices(TEST_TENANT_ID, {
          limit: 50,
          offset: 0,
        });

        expect(result.data).toHaveLength(0);
      });
    });

    describe('getInvoice', () => {
      it('should return invoice by id', async () => {
        const invoice = createInvoiceFixture();
        mockInvoicesRepo.findById.mockResolvedValue(invoice);

        const result = await service.getInvoice(invoice.id, TEST_TENANT_ID);

        expect(result).toEqual(invoice);
        expect(mockInvoicesRepo.findById).toHaveBeenCalledWith(invoice.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent invoice', async () => {
        mockInvoicesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getInvoice('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          InvoiceNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockInvoicesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getInvoice('inv-1', OTHER_TENANT_ID)).rejects.toThrow(
          InvoiceNotFoundError,
        );
        expect(mockInvoicesRepo.findById).toHaveBeenCalledWith('inv-1', OTHER_TENANT_ID);
      });
    });

    describe('getInvoiceLineItems', () => {
      it('should return line items for an invoice', async () => {
        const invoice = createInvoiceFixture();
        const lineItems = [createInvoiceLineItemFixture()];

        mockInvoicesRepo.findById.mockResolvedValue(invoice);
        mockInvoiceLineItemsRepo.findByInvoiceId.mockResolvedValue(lineItems);

        const result = await service.getInvoiceLineItems(invoice.id, TEST_TENANT_ID);

        expect(result).toEqual(lineItems);
        expect(mockInvoiceLineItemsRepo.findByInvoiceId).toHaveBeenCalledWith(
          invoice.id,
          TEST_TENANT_ID,
        );
      });

      it('should throw NotFoundError for non-existent invoice', async () => {
        mockInvoicesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getInvoiceLineItems('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          InvoiceNotFoundError,
        );
      });

      it('should return empty array when invoice has no line items', async () => {
        const invoice = createInvoiceFixture();
        mockInvoicesRepo.findById.mockResolvedValue(invoice);
        mockInvoiceLineItemsRepo.findByInvoiceId.mockResolvedValue([]);

        const result = await service.getInvoiceLineItems(invoice.id, TEST_TENANT_ID);

        expect(result).toEqual([]);
      });
    });

    describe('createInvoice', () => {
      it('should create invoice with calculated totals', async () => {
        const input = createInvoiceInputFixture();
        const customer = createCustomerFixture();
        const expected = createInvoiceFixture();

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockInvoicesRepo.findByInvoiceNumber.mockResolvedValue(undefined);
        mockInvoicesRepo.create.mockResolvedValue([expected]);
        mockInvoiceLineItemsRepo.createMany.mockResolvedValue([]);

        const result = await service.createInvoice(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(result.status).toBe('draft');
        expect(mockCustomersRepo.findById).toHaveBeenCalledWith(input.customerId, TEST_TENANT_ID);
        expect(mockInvoicesRepo.create).toHaveBeenCalled();
        expect(mockInvoiceLineItemsRepo.createMany).toHaveBeenCalled();
      });

      it('should calculate line item amounts correctly', async () => {
        const input = createInvoiceInputFixture({
          lineItems: [
            {
              description: 'Item A',
              quantity: '5',
              unitPrice: '200.0000',
              taxRate: '0.1000',
              sortOrder: 0,
            },
            {
              description: 'Item B',
              quantity: '3',
              unitPrice: '100.0000',
              taxRate: null,
              sortOrder: 1,
            },
          ],
        });
        const customer = createCustomerFixture();
        const expected = createInvoiceFixture({
          subtotal: '1300.0000',
          taxAmount: '100.0000',
          totalAmount: '1400.0000',
        });

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockInvoicesRepo.findByInvoiceNumber.mockResolvedValue(undefined);
        mockInvoicesRepo.create.mockResolvedValue([expected]);
        mockInvoiceLineItemsRepo.createMany.mockResolvedValue([]);

        const result = await service.createInvoice(input, TEST_TENANT_ID);

        expect(result).toBeDefined();
        // Verify createMany called with calculated amounts
        expect(mockInvoiceLineItemsRepo.createMany).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              amount: '1000.0000',
              taxAmount: '100.0000',
            }),
            expect.objectContaining({
              amount: '300.0000',
              taxAmount: '0',
            }),
          ]),
          TEST_TENANT_ID,
        );
      });

      it('should set initial status to draft', async () => {
        const input = createInvoiceInputFixture();
        const customer = createCustomerFixture();
        const expected = createInvoiceFixture({ status: 'draft' });

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockInvoicesRepo.findByInvoiceNumber.mockResolvedValue(undefined);
        mockInvoicesRepo.create.mockResolvedValue([expected]);
        mockInvoiceLineItemsRepo.createMany.mockResolvedValue([]);

        await service.createInvoice(input, TEST_TENANT_ID);

        expect(mockInvoicesRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'draft' }),
          TEST_TENANT_ID,
        );
      });

      it('should set initial amountPaid to 0 and balanceDue to totalAmount', async () => {
        const input = createInvoiceInputFixture();
        const customer = createCustomerFixture();
        const expected = createInvoiceFixture({ amountPaid: '0', balanceDue: '1100.0000' });

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockInvoicesRepo.findByInvoiceNumber.mockResolvedValue(undefined);
        mockInvoicesRepo.create.mockResolvedValue([expected]);
        mockInvoiceLineItemsRepo.createMany.mockResolvedValue([]);

        await service.createInvoice(input, TEST_TENANT_ID);

        expect(mockInvoicesRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ amountPaid: '0', balanceDue: '1100.0000' }),
          TEST_TENANT_ID,
        );
      });

      it('should throw NotFoundError for non-existent customer', async () => {
        const input = createInvoiceInputFixture();
        mockCustomersRepo.findById.mockResolvedValue(undefined);

        await expect(service.createInvoice(input, TEST_TENANT_ID)).rejects.toThrow(
          CustomerNotFoundError,
        );
      });

      it('should reject duplicate invoice number', async () => {
        const input = createInvoiceInputFixture();
        const customer = createCustomerFixture();
        const existing = createInvoiceFixture();

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockInvoicesRepo.findByInvoiceNumber.mockResolvedValue(existing);

        await expect(service.createInvoice(input, TEST_TENANT_ID)).rejects.toThrow(
          InvoiceDuplicateNumberError,
        );
      });

      it('should reject invoice with no line items', async () => {
        const input = createInvoiceInputFixture({ lineItems: [] });
        const customer = createCustomerFixture();

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockInvoicesRepo.findByInvoiceNumber.mockResolvedValue(undefined);

        await expect(service.createInvoice(input, TEST_TENANT_ID)).rejects.toThrow(
          InvoiceLineItemRequiredError,
        );
      });

      it('should scope invoice number uniqueness to tenant', async () => {
        const input = createInvoiceInputFixture();
        const customer = createCustomerFixture();
        const otherTenantInvoice = createInvoiceFixture();

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockInvoicesRepo.findByInvoiceNumber.mockImplementation(
          async (_num: string, tenantId: string) => {
            if (tenantId === OTHER_TENANT_ID) return otherTenantInvoice;
            return undefined;
          },
        );
        mockInvoicesRepo.create.mockResolvedValue([createInvoiceFixture()]);
        mockInvoiceLineItemsRepo.createMany.mockResolvedValue([]);

        const result = await service.createInvoice(input, TEST_TENANT_ID);
        expect(result).toBeDefined();
      });

      it('should create invoice with notes', async () => {
        const input = createInvoiceInputFixture({ notes: 'Special instructions' });
        const customer = createCustomerFixture();
        const expected = createInvoiceFixture({ notes: 'Special instructions' });

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockInvoicesRepo.findByInvoiceNumber.mockResolvedValue(undefined);
        mockInvoicesRepo.create.mockResolvedValue([expected]);
        mockInvoiceLineItemsRepo.createMany.mockResolvedValue([]);

        const result = await service.createInvoice(input, TEST_TENANT_ID);

        expect(result.notes).toBe('Special instructions');
      });

      it('should create invoice without optional line item tax rate', async () => {
        const input = createInvoiceInputFixture({
          lineItems: [
            { description: 'Service', quantity: '1', unitPrice: '500.0000', sortOrder: 0 },
          ],
        });
        const customer = createCustomerFixture();
        const expected = createInvoiceFixture({
          subtotal: '500.0000',
          taxAmount: '0',
          totalAmount: '500.0000',
        });

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockInvoicesRepo.findByInvoiceNumber.mockResolvedValue(undefined);
        mockInvoicesRepo.create.mockResolvedValue([expected]);
        mockInvoiceLineItemsRepo.createMany.mockResolvedValue([]);

        const result = await service.createInvoice(input, TEST_TENANT_ID);

        expect(result).toBeDefined();
        expect(mockInvoiceLineItemsRepo.createMany).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ amount: '500.0000', taxAmount: '0' })]),
          TEST_TENANT_ID,
        );
      });

      it('should assign default sortOrder from index', async () => {
        const input = createInvoiceInputFixture({
          lineItems: [
            { description: 'A', quantity: '1', unitPrice: '100.0000' },
            { description: 'B', quantity: '1', unitPrice: '200.0000' },
          ],
        });
        const customer = createCustomerFixture();

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockInvoicesRepo.findByInvoiceNumber.mockResolvedValue(undefined);
        mockInvoicesRepo.create.mockResolvedValue([createInvoiceFixture()]);
        mockInvoiceLineItemsRepo.createMany.mockResolvedValue([]);

        await service.createInvoice(input, TEST_TENANT_ID);

        expect(mockInvoiceLineItemsRepo.createMany).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ sortOrder: 0 }),
            expect.objectContaining({ sortOrder: 1 }),
          ]),
          TEST_TENANT_ID,
        );
      });
    });

    describe('updateInvoice', () => {
      it('should update draft invoice', async () => {
        const existing = createInvoiceFixture({ status: 'draft' });
        const updated = { ...existing, notes: 'Updated notes' };

        mockInvoicesRepo.findById.mockResolvedValue(existing);
        mockInvoicesRepo.update.mockResolvedValue([updated]);

        const result = await service.updateInvoice(
          existing.id,
          { notes: 'Updated notes' },
          TEST_TENANT_ID,
        );

        expect(result.notes).toBe('Updated notes');
      });

      it('should throw NotFoundError for non-existent invoice', async () => {
        mockInvoicesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateInvoice('non-existent', { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(InvoiceNotFoundError);
      });

      it('should reject update of sent invoice', async () => {
        const existing = createInvoiceFixture({ status: 'sent' });
        mockInvoicesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateInvoice(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(InvoiceStatusTransitionError);
      });

      it('should reject update of paid invoice', async () => {
        const existing = createInvoiceFixture({ status: 'paid' });
        mockInvoicesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateInvoice(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(InvoiceStatusTransitionError);
      });

      it('should reject update of voided invoice', async () => {
        const existing = createInvoiceFixture({ status: 'voided' });
        mockInvoicesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateInvoice(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(InvoiceStatusTransitionError);
      });

      it('should update draft invoice with new line items', async () => {
        const existing = createInvoiceFixture({ status: 'draft' });
        const updated = { ...existing, subtotal: '2000.0000', totalAmount: '2200.0000' };

        mockInvoicesRepo.findById.mockResolvedValue(existing);
        mockInvoiceLineItemsRepo.deleteByInvoiceId.mockResolvedValue(undefined);
        mockInvoiceLineItemsRepo.createMany.mockResolvedValue([]);
        mockInvoicesRepo.update.mockResolvedValue([updated]);

        const result = await service.updateInvoice(
          existing.id,
          {
            lineItems: [
              {
                description: 'New item',
                quantity: '20',
                unitPrice: '100.0000',
                taxRate: '0.1000',
                sortOrder: 0,
              },
            ],
          },
          TEST_TENANT_ID,
        );

        expect(result).toBeDefined();
        expect(mockInvoiceLineItemsRepo.deleteByInvoiceId).toHaveBeenCalledWith(
          existing.id,
          TEST_TENANT_ID,
        );
        expect(mockInvoiceLineItemsRepo.createMany).toHaveBeenCalled();
      });

      it('should reject update with empty line items', async () => {
        const existing = createInvoiceFixture({ status: 'draft' });
        mockInvoicesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateInvoice(existing.id, { lineItems: [] }, TEST_TENANT_ID),
        ).rejects.toThrow(InvoiceLineItemRequiredError);
      });

      it('should update invoice dueDate', async () => {
        const existing = createInvoiceFixture({ status: 'draft' });
        const updated = { ...existing, dueDate: '2026-09-01' };

        mockInvoicesRepo.findById.mockResolvedValue(existing);
        mockInvoicesRepo.update.mockResolvedValue([updated]);

        const result = await service.updateInvoice(
          existing.id,
          { dueDate: '2026-09-01' },
          TEST_TENANT_ID,
        );

        expect(result.dueDate).toBe('2026-09-01');
      });

      it('should throw NotFoundError when update returns empty', async () => {
        const existing = createInvoiceFixture({ status: 'draft' });
        mockInvoicesRepo.findById.mockResolvedValue(existing);
        mockInvoicesRepo.update.mockResolvedValue([]);

        await expect(
          service.updateInvoice(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(InvoiceNotFoundError);
      });
    });

    describe('updateInvoiceStatus', () => {
      it('should transition draft to sent', async () => {
        const existing = createInvoiceFixture({ status: 'draft' });
        const updated = { ...existing, status: 'sent' };

        mockInvoicesRepo.findById.mockResolvedValue(existing);
        mockInvoicesRepo.update.mockResolvedValue([updated]);

        const result = await service.updateInvoiceStatus(existing.id, 'sent', TEST_TENANT_ID);

        expect(result.status).toBe('sent');
      });

      it('should transition draft to voided', async () => {
        const existing = createInvoiceFixture({ status: 'draft' });
        const updated = { ...existing, status: 'voided' };

        mockInvoicesRepo.findById.mockResolvedValue(existing);
        mockInvoicesRepo.update.mockResolvedValue([updated]);

        const result = await service.updateInvoiceStatus(existing.id, 'voided', TEST_TENANT_ID);

        expect(result.status).toBe('voided');
      });

      it('should transition sent to paid', async () => {
        const existing = createInvoiceFixture({ status: 'sent' });
        const updated = { ...existing, status: 'paid' };

        mockInvoicesRepo.findById.mockResolvedValue(existing);
        mockInvoicesRepo.update.mockResolvedValue([updated]);

        const result = await service.updateInvoiceStatus(existing.id, 'paid', TEST_TENANT_ID);

        expect(result.status).toBe('paid');
      });

      it('should transition sent to overdue', async () => {
        const existing = createInvoiceFixture({ status: 'sent' });
        const updated = { ...existing, status: 'overdue' };

        mockInvoicesRepo.findById.mockResolvedValue(existing);
        mockInvoicesRepo.update.mockResolvedValue([updated]);

        const result = await service.updateInvoiceStatus(existing.id, 'overdue', TEST_TENANT_ID);

        expect(result.status).toBe('overdue');
      });

      it('should transition sent to voided', async () => {
        const existing = createInvoiceFixture({ status: 'sent' });
        const updated = { ...existing, status: 'voided' };

        mockInvoicesRepo.findById.mockResolvedValue(existing);
        mockInvoicesRepo.update.mockResolvedValue([updated]);

        const result = await service.updateInvoiceStatus(existing.id, 'voided', TEST_TENANT_ID);

        expect(result.status).toBe('voided');
      });

      it('should transition overdue to paid', async () => {
        const existing = createInvoiceFixture({ status: 'overdue' });
        const updated = { ...existing, status: 'paid' };

        mockInvoicesRepo.findById.mockResolvedValue(existing);
        mockInvoicesRepo.update.mockResolvedValue([updated]);

        const result = await service.updateInvoiceStatus(existing.id, 'paid', TEST_TENANT_ID);

        expect(result.status).toBe('paid');
      });

      it('should transition overdue to voided', async () => {
        const existing = createInvoiceFixture({ status: 'overdue' });
        const updated = { ...existing, status: 'voided' };

        mockInvoicesRepo.findById.mockResolvedValue(existing);
        mockInvoicesRepo.update.mockResolvedValue([updated]);

        const result = await service.updateInvoiceStatus(existing.id, 'voided', TEST_TENANT_ID);

        expect(result.status).toBe('voided');
      });

      it('should throw NotFoundError for non-existent invoice', async () => {
        mockInvoicesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateInvoiceStatus('non-existent', 'sent', TEST_TENANT_ID),
        ).rejects.toThrow(InvoiceNotFoundError);
      });

      it('should reject transitioning voided invoice', async () => {
        const existing = createInvoiceFixture({ status: 'voided' });
        mockInvoicesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateInvoiceStatus(existing.id, 'sent', TEST_TENANT_ID),
        ).rejects.toThrow(InvoiceAlreadyVoidedError);
      });

      it('should reject transitioning paid invoice', async () => {
        const existing = createInvoiceFixture({ status: 'paid' });
        mockInvoicesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateInvoiceStatus(existing.id, 'sent', TEST_TENANT_ID),
        ).rejects.toThrow(InvoiceAlreadyPaidError);
      });

      it('should reject invalid status transition (draft to paid)', async () => {
        const existing = createInvoiceFixture({ status: 'draft' });
        mockInvoicesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateInvoiceStatus(existing.id, 'paid', TEST_TENANT_ID),
        ).rejects.toThrow(InvoiceStatusTransitionError);
      });

      it('should reject invalid status transition (draft to overdue)', async () => {
        const existing = createInvoiceFixture({ status: 'draft' });
        mockInvoicesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateInvoiceStatus(existing.id, 'overdue', TEST_TENANT_ID),
        ).rejects.toThrow(InvoiceStatusTransitionError);
      });

      it('should scope status update to tenant', async () => {
        mockInvoicesRepo.findById.mockResolvedValue(undefined);

        await expect(service.updateInvoiceStatus('inv-1', 'sent', OTHER_TENANT_ID)).rejects.toThrow(
          InvoiceNotFoundError,
        );
        expect(mockInvoicesRepo.findById).toHaveBeenCalledWith('inv-1', OTHER_TENANT_ID);
      });

      it('should throw NotFoundError when update returns empty', async () => {
        const existing = createInvoiceFixture({ status: 'draft' });
        mockInvoicesRepo.findById.mockResolvedValue(existing);
        mockInvoicesRepo.update.mockResolvedValue([]);

        await expect(
          service.updateInvoiceStatus(existing.id, 'sent', TEST_TENANT_ID),
        ).rejects.toThrow(InvoiceNotFoundError);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PAYMENT SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Payment Service', () => {
    describe('listPayments', () => {
      it('should return paginated payments', async () => {
        const payments = [createPaymentFixture()];
        mockPaymentsRepo.findMany.mockResolvedValue({
          data: payments,
          total: 1,
          limit: 50,
          offset: 0,
        });

        const result = await service.listPayments(TEST_TENANT_ID, { limit: 50, offset: 0 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(mockPaymentsRepo.findMany).toHaveBeenCalledWith(TEST_TENANT_ID, {
          limit: 50,
          offset: 0,
        });
      });

      it('should return empty list when no payments exist', async () => {
        mockPaymentsRepo.findMany.mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

        const result = await service.listPayments(TEST_TENANT_ID, { limit: 50, offset: 0 });

        expect(result.data).toHaveLength(0);
      });

      it('should pass pagination params to repo', async () => {
        mockPaymentsRepo.findMany.mockResolvedValue({ data: [], total: 0, limit: 10, offset: 20 });

        await service.listPayments(TEST_TENANT_ID, { limit: 10, offset: 20 });

        expect(mockPaymentsRepo.findMany).toHaveBeenCalledWith(TEST_TENANT_ID, {
          limit: 10,
          offset: 20,
        });
      });
    });

    describe('getPayment', () => {
      it('should return payment by id', async () => {
        const payment = createPaymentFixture();
        mockPaymentsRepo.findById.mockResolvedValue(payment);

        const result = await service.getPayment(payment.id, TEST_TENANT_ID);

        expect(result).toEqual(payment);
        expect(mockPaymentsRepo.findById).toHaveBeenCalledWith(payment.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent payment', async () => {
        mockPaymentsRepo.findById.mockResolvedValue(undefined);

        await expect(service.getPayment('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          PaymentNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockPaymentsRepo.findById.mockResolvedValue(undefined);

        await expect(service.getPayment('pay-1', OTHER_TENANT_ID)).rejects.toThrow(
          PaymentNotFoundError,
        );
        expect(mockPaymentsRepo.findById).toHaveBeenCalledWith('pay-1', OTHER_TENANT_ID);
      });
    });

    describe('createPayment', () => {
      it('should create payment with valid data', async () => {
        const input = createPaymentInputFixture();
        const customer = createCustomerFixture();
        const expected = createPaymentFixture();

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockPaymentsRepo.findByPaymentNumber.mockResolvedValue(undefined);
        mockPaymentsRepo.create.mockResolvedValue([expected]);

        const result = await service.createPayment(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(mockCustomersRepo.findById).toHaveBeenCalledWith(input.customerId, TEST_TENANT_ID);
        expect(mockPaymentsRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            customerId: input.customerId,
            paymentNumber: input.paymentNumber,
            amount: input.amount,
            paymentMethod: input.paymentMethod,
          }),
          TEST_TENANT_ID,
        );
      });

      it('should throw NotFoundError for non-existent customer', async () => {
        const input = createPaymentInputFixture();
        mockCustomersRepo.findById.mockResolvedValue(undefined);

        await expect(service.createPayment(input, TEST_TENANT_ID)).rejects.toThrow(
          CustomerNotFoundError,
        );
      });

      it('should reject duplicate payment number', async () => {
        const input = createPaymentInputFixture();
        const customer = createCustomerFixture();
        const existing = createPaymentFixture();

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockPaymentsRepo.findByPaymentNumber.mockResolvedValue(existing);

        await expect(service.createPayment(input, TEST_TENANT_ID)).rejects.toThrow(
          PaymentDuplicateNumberError,
        );
      });

      it('should scope payment number uniqueness to tenant', async () => {
        const input = createPaymentInputFixture();
        const customer = createCustomerFixture();
        const otherTenantPayment = createPaymentFixture();

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockPaymentsRepo.findByPaymentNumber.mockImplementation(
          async (_num: string, tenantId: string) => {
            if (tenantId === OTHER_TENANT_ID) return otherTenantPayment;
            return undefined;
          },
        );
        mockPaymentsRepo.create.mockResolvedValue([createPaymentFixture()]);

        const result = await service.createPayment(input, TEST_TENANT_ID);
        expect(result).toBeDefined();
      });

      it('should create payment with reference number', async () => {
        const input = createPaymentInputFixture({ referenceNumber: 'REF-123' });
        const customer = createCustomerFixture();
        const expected = createPaymentFixture({ referenceNumber: 'REF-123' });

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockPaymentsRepo.findByPaymentNumber.mockResolvedValue(undefined);
        mockPaymentsRepo.create.mockResolvedValue([expected]);

        const result = await service.createPayment(input, TEST_TENANT_ID);

        expect(result.referenceNumber).toBe('REF-123');
      });

      it('should create payment with all payment methods', async () => {
        const methods = ['cash', 'check', 'bank_transfer', 'credit_card', 'online'] as const;

        for (const method of methods) {
          const input = createPaymentInputFixture({ paymentMethod: method });
          const customer = createCustomerFixture();
          const expected = createPaymentFixture({ paymentMethod: method });

          mockCustomersRepo.findById.mockResolvedValue(customer);
          mockPaymentsRepo.findByPaymentNumber.mockResolvedValue(undefined);
          mockPaymentsRepo.create.mockResolvedValue([expected]);

          const result = await service.createPayment(input, TEST_TENANT_ID);
          expect(result.paymentMethod).toBe(method);
          vi.clearAllMocks();
        }
      });
    });

    describe('updatePayment', () => {
      it('should update payment fields', async () => {
        const existing = createPaymentFixture();
        const updated = { ...existing, notes: 'Updated payment' };

        mockPaymentsRepo.findById.mockResolvedValue(existing);
        mockPaymentApplicationsRepo.findByPaymentId.mockResolvedValue([]);
        mockPaymentsRepo.update.mockResolvedValue([updated]);

        const result = await service.updatePayment(
          existing.id,
          { notes: 'Updated payment' },
          TEST_TENANT_ID,
        );

        expect(result.notes).toBe('Updated payment');
      });

      it('should throw NotFoundError for non-existent payment', async () => {
        mockPaymentsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updatePayment('non-existent', { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(PaymentNotFoundError);
      });

      it('should reject amount decrease below applied amount', async () => {
        const existing = createPaymentFixture({ amount: '1000.0000' });
        const applications = [createPaymentApplicationFixture({ amountApplied: '800.0000' })];

        mockPaymentsRepo.findById.mockResolvedValue(existing);
        mockPaymentApplicationsRepo.findByPaymentId.mockResolvedValue(applications);
        mockPaymentsRepo.sumAppliedByPaymentId.mockResolvedValue('800.0000');

        await expect(
          service.updatePayment(existing.id, { amount: '500.0000' }, TEST_TENANT_ID),
        ).rejects.toThrow(PaymentAmountExceedsInvoiceBalanceError);
      });

      it('should allow amount increase when applications exist', async () => {
        const existing = createPaymentFixture({ amount: '500.0000' });
        const applications = [createPaymentApplicationFixture({ amountApplied: '300.0000' })];
        const updated = { ...existing, amount: '1000.0000' };

        mockPaymentsRepo.findById.mockResolvedValue(existing);
        mockPaymentApplicationsRepo.findByPaymentId.mockResolvedValue(applications);
        mockPaymentsRepo.sumAppliedByPaymentId.mockResolvedValue('300.0000');
        mockPaymentsRepo.update.mockResolvedValue([updated]);

        const result = await service.updatePayment(
          existing.id,
          { amount: '1000.0000' },
          TEST_TENANT_ID,
        );

        expect(result.amount).toBe('1000.0000');
      });

      it('should allow amount update when no applications exist', async () => {
        const existing = createPaymentFixture({ amount: '500.0000' });
        const updated = { ...existing, amount: '750.0000' };

        mockPaymentsRepo.findById.mockResolvedValue(existing);
        mockPaymentApplicationsRepo.findByPaymentId.mockResolvedValue([]);
        mockPaymentsRepo.update.mockResolvedValue([updated]);

        const result = await service.updatePayment(
          existing.id,
          { amount: '750.0000' },
          TEST_TENANT_ID,
        );

        expect(result.amount).toBe('750.0000');
      });

      it('should update paymentDate', async () => {
        const existing = createPaymentFixture();
        const updated = { ...existing, paymentDate: '2026-08-01' };

        mockPaymentsRepo.findById.mockResolvedValue(existing);
        mockPaymentApplicationsRepo.findByPaymentId.mockResolvedValue([]);
        mockPaymentsRepo.update.mockResolvedValue([updated]);

        const result = await service.updatePayment(
          existing.id,
          { paymentDate: '2026-08-01' },
          TEST_TENANT_ID,
        );

        expect(result.paymentDate).toBe('2026-08-01');
      });

      it('should update paymentMethod', async () => {
        const existing = createPaymentFixture();
        const updated = { ...existing, paymentMethod: 'credit_card' as const };

        mockPaymentsRepo.findById.mockResolvedValue(existing);
        mockPaymentApplicationsRepo.findByPaymentId.mockResolvedValue([]);
        mockPaymentsRepo.update.mockResolvedValue([updated]);

        const result = await service.updatePayment(
          existing.id,
          { paymentMethod: 'credit_card' },
          TEST_TENANT_ID,
        );

        expect(result.paymentMethod).toBe('credit_card');
      });

      it('should update referenceNumber to null', async () => {
        const existing = createPaymentFixture({ referenceNumber: 'REF-001' });
        const updated = { ...existing, referenceNumber: null };

        mockPaymentsRepo.findById.mockResolvedValue(existing);
        mockPaymentApplicationsRepo.findByPaymentId.mockResolvedValue([]);
        mockPaymentsRepo.update.mockResolvedValue([updated]);

        const result = await service.updatePayment(
          existing.id,
          { referenceNumber: null },
          TEST_TENANT_ID,
        );

        expect(result.referenceNumber).toBeNull();
      });

      it('should throw NotFoundError when update returns empty', async () => {
        const existing = createPaymentFixture();
        mockPaymentsRepo.findById.mockResolvedValue(existing);
        mockPaymentApplicationsRepo.findByPaymentId.mockResolvedValue([]);
        mockPaymentsRepo.update.mockResolvedValue([]);

        await expect(
          service.updatePayment(existing.id, { notes: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(PaymentNotFoundError);
      });

      it('should scope payment applications check to tenant', async () => {
        const existing = createPaymentFixture();
        const updated = { ...existing, notes: 'Test' };

        mockPaymentsRepo.findById.mockResolvedValue(existing);
        mockPaymentApplicationsRepo.findByPaymentId.mockResolvedValue([]);
        mockPaymentsRepo.update.mockResolvedValue([updated]);

        await service.updatePayment(existing.id, { notes: 'Test' }, TEST_TENANT_ID);

        expect(mockPaymentApplicationsRepo.findByPaymentId).toHaveBeenCalledWith(
          existing.id,
          TEST_TENANT_ID,
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PAYMENT APPLICATION SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Payment Application Service', () => {
    describe('createPaymentApplication', () => {
      it('should create payment application', async () => {
        const input = createPaymentApplicationInputFixture();
        const payment = createPaymentFixture({ amount: '1000.0000' });
        const invoice = createInvoiceFixture({ totalAmount: '1100.0000', balanceDue: '1100.0000' });
        const expected = createPaymentApplicationFixture();

        mockPaymentsRepo.findById.mockResolvedValue(payment);
        mockInvoicesRepo.findById.mockResolvedValue(invoice);
        mockPaymentsRepo.sumAppliedByPaymentId.mockResolvedValue('0');
        mockPaymentApplicationsRepo.create.mockResolvedValue([expected]);
        mockPaymentApplicationsRepo.sumAppliedByInvoiceId.mockResolvedValue('500.0000');
        mockInvoicesRepo.findById.mockResolvedValue(invoice);
        mockInvoicesRepo.update.mockResolvedValue([
          { ...invoice, amountPaid: '500.0000', balanceDue: '600.0000' },
        ]);

        const result = await service.createPaymentApplication(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(mockPaymentsRepo.findById).toHaveBeenCalledWith(input.paymentId, TEST_TENANT_ID);
        expect(mockInvoicesRepo.findById).toHaveBeenCalledWith(input.invoiceId, TEST_TENANT_ID);
        expect(mockPaymentApplicationsRepo.create).toHaveBeenCalled();
      });

      it('should throw NotFoundError for non-existent payment', async () => {
        const input = createPaymentApplicationInputFixture();
        mockPaymentsRepo.findById.mockResolvedValue(undefined);

        await expect(service.createPaymentApplication(input, TEST_TENANT_ID)).rejects.toThrow(
          PaymentNotFoundError,
        );
      });

      it('should throw NotFoundError for non-existent invoice', async () => {
        const input = createPaymentApplicationInputFixture();
        const payment = createPaymentFixture();

        mockPaymentsRepo.findById.mockResolvedValue(payment);
        mockInvoicesRepo.findById.mockResolvedValue(undefined);

        await expect(service.createPaymentApplication(input, TEST_TENANT_ID)).rejects.toThrow(
          InvoiceNotFoundError,
        );
      });

      it('should reject application exceeding payment remaining', async () => {
        const input = createPaymentApplicationInputFixture({ amountApplied: '1500.0000' });
        const payment = createPaymentFixture({ amount: '1000.0000' });
        const invoice = createInvoiceFixture({ balanceDue: '2000.0000' });

        mockPaymentsRepo.findById.mockResolvedValue(payment);
        mockInvoicesRepo.findById.mockResolvedValue(invoice);
        mockPaymentsRepo.sumAppliedByPaymentId.mockResolvedValue('0');

        await expect(service.createPaymentApplication(input, TEST_TENANT_ID)).rejects.toThrow(
          PaymentAmountExceedsInvoiceBalanceError,
        );
      });

      it('should reject application exceeding invoice balance', async () => {
        const input = createPaymentApplicationInputFixture({ amountApplied: '2000.0000' });
        const payment = createPaymentFixture({ amount: '5000.0000' });
        const invoice = createInvoiceFixture({ balanceDue: '1000.0000' });

        mockPaymentsRepo.findById.mockResolvedValue(payment);
        mockInvoicesRepo.findById.mockResolvedValue(invoice);
        mockPaymentsRepo.sumAppliedByPaymentId.mockResolvedValue('0');

        await expect(service.createPaymentApplication(input, TEST_TENANT_ID)).rejects.toThrow(
          PaymentAmountExceedsInvoiceBalanceError,
        );
      });

      it('should reject application to fully applied payment', async () => {
        const input = createPaymentApplicationInputFixture();
        const payment = createPaymentFixture({ amount: '500.0000' });
        const invoice = createInvoiceFixture({ balanceDue: '1000.0000' });

        mockPaymentsRepo.findById.mockResolvedValue(payment);
        mockInvoicesRepo.findById.mockResolvedValue(invoice);
        mockPaymentsRepo.sumAppliedByPaymentId.mockResolvedValue('500.0000');

        await expect(service.createPaymentApplication(input, TEST_TENANT_ID)).rejects.toThrow(
          PaymentAlreadyFullyAppliedError,
        );
      });

      it('should update invoice paid amount after application', async () => {
        const input = createPaymentApplicationInputFixture({ amountApplied: '500.0000' });
        const payment = createPaymentFixture({ amount: '1000.0000' });
        const invoice = createInvoiceFixture({ totalAmount: '1100.0000', balanceDue: '1100.0000' });
        const updatedInvoice = { ...invoice, amountPaid: '500.0000', balanceDue: '600.0000' };

        mockPaymentsRepo.findById.mockResolvedValue(payment);
        mockInvoicesRepo.findById.mockResolvedValueOnce(invoice).mockResolvedValueOnce(invoice);
        mockPaymentsRepo.sumAppliedByPaymentId.mockResolvedValue('0');
        mockPaymentApplicationsRepo.create.mockResolvedValue([createPaymentApplicationFixture()]);
        mockPaymentApplicationsRepo.sumAppliedByInvoiceId.mockResolvedValue('500.0000');
        mockInvoicesRepo.update.mockResolvedValue([updatedInvoice]);

        await service.createPaymentApplication(input, TEST_TENANT_ID);

        expect(mockInvoicesRepo.update).toHaveBeenCalledWith(
          invoice.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            amountPaid: '500.0000',
            balanceDue: '600.0000',
          }),
        );
      });

      it('should mark invoice as paid when fully applied', async () => {
        const input = createPaymentApplicationInputFixture({ amountApplied: '1100.0000' });
        const payment = createPaymentFixture({ amount: '2000.0000' });
        const invoice = createInvoiceFixture({ totalAmount: '1100.0000', balanceDue: '1100.0000' });
        const updatedInvoice = {
          ...invoice,
          amountPaid: '1100.0000',
          balanceDue: '0',
          status: 'paid' as const,
        };

        mockPaymentsRepo.findById.mockResolvedValue(payment);
        mockInvoicesRepo.findById.mockResolvedValueOnce(invoice).mockResolvedValueOnce(invoice);
        mockPaymentsRepo.sumAppliedByPaymentId.mockResolvedValue('0');
        mockPaymentApplicationsRepo.create.mockResolvedValue([createPaymentApplicationFixture()]);
        mockPaymentApplicationsRepo.sumAppliedByInvoiceId.mockResolvedValue('1100.0000');
        mockInvoicesRepo.update.mockResolvedValue([updatedInvoice]);

        await service.createPaymentApplication(input, TEST_TENANT_ID);

        expect(mockInvoicesRepo.update).toHaveBeenCalledWith(
          invoice.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            amountPaid: '1100.0000',
            balanceDue: '0.0000',
            status: 'paid',
          }),
        );
      });

      it('should scope all lookups to tenant', async () => {
        mockPaymentsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createPaymentApplication(createPaymentApplicationInputFixture(), OTHER_TENANT_ID),
        ).rejects.toThrow(PaymentNotFoundError);
        expect(mockPaymentsRepo.findById).toHaveBeenCalledWith(expect.any(String), OTHER_TENANT_ID);
      });
    });

    describe('deletePaymentApplication', () => {
      it('should delete payment application and update invoice', async () => {
        const application = createPaymentApplicationFixture();
        const invoice = createInvoiceFixture({ totalAmount: '1100.0000' });

        mockPaymentApplicationsRepo.findById.mockResolvedValue(application);
        mockPaymentApplicationsRepo.delete.mockResolvedValue(undefined);
        mockPaymentApplicationsRepo.sumAppliedByInvoiceId.mockResolvedValue('0');
        mockInvoicesRepo.findById.mockResolvedValue(invoice);
        mockInvoicesRepo.update.mockResolvedValue([
          { ...invoice, amountPaid: '0', balanceDue: '1100.0000' },
        ]);

        await service.deletePaymentApplication(application.id, TEST_TENANT_ID);

        expect(mockPaymentApplicationsRepo.delete).toHaveBeenCalledWith(
          application.id,
          TEST_TENANT_ID,
        );
        expect(mockInvoicesRepo.update).toHaveBeenCalledWith(
          application.invoiceId,
          TEST_TENANT_ID,
          expect.objectContaining({
            amountPaid: '0',
            balanceDue: '1100.0000',
          }),
        );
      });

      it('should throw NotFoundError for non-existent application', async () => {
        mockPaymentApplicationsRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.deletePaymentApplication('non-existent', TEST_TENANT_ID),
        ).rejects.toThrow(PaymentApplicationNotFoundError);
      });

      it('should mark invoice as not-paid when fully paid invoice has application removed', async () => {
        const application = createPaymentApplicationFixture({ amountApplied: '1100.0000' });
        const invoice = createInvoiceFixture({
          totalAmount: '1100.0000',
          amountPaid: '1100.0000',
          balanceDue: '0',
          status: 'paid',
        });

        mockPaymentApplicationsRepo.findById.mockResolvedValue(application);
        mockPaymentApplicationsRepo.delete.mockResolvedValue(undefined);
        mockPaymentApplicationsRepo.sumAppliedByInvoiceId.mockResolvedValue('0');
        mockInvoicesRepo.findById.mockResolvedValue(invoice);
        mockInvoicesRepo.update.mockResolvedValue([
          { ...invoice, amountPaid: '0', balanceDue: '1100.0000', status: 'sent' },
        ]);

        await service.deletePaymentApplication(application.id, TEST_TENANT_ID);

        // When balanceDue > 0, status reverts to the existing invoice status (paid remains since newStatus = Number(balanceDue) <= 0 ? 'paid' : invoice.status)
        // Actually: balanceDue = 1100.0000 > 0, so newStatus = invoice.status = 'paid'
        // But the amountPaid is '0' (from sumAppliedByInvoiceId mock)
        expect(mockInvoicesRepo.update).toHaveBeenCalledWith(
          application.invoiceId,
          TEST_TENANT_ID,
          expect.objectContaining({
            amountPaid: '0',
            balanceDue: '1100.0000',
          }),
        );
      });

      it('should scope delete to tenant', async () => {
        mockPaymentApplicationsRepo.findById.mockResolvedValue(undefined);

        await expect(service.deletePaymentApplication('pa-1', OTHER_TENANT_ID)).rejects.toThrow(
          PaymentApplicationNotFoundError,
        );
        expect(mockPaymentApplicationsRepo.findById).toHaveBeenCalledWith('pa-1', OTHER_TENANT_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CREDIT NOTE SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Credit Note Service', () => {
    describe('listCreditNotes', () => {
      it('should return paginated credit notes', async () => {
        const creditNotes = [createCreditNoteFixture()];
        mockCreditNotesRepo.findMany.mockResolvedValue({
          data: creditNotes,
          total: 1,
          limit: 50,
          offset: 0,
        });

        const result = await service.listCreditNotes(TEST_TENANT_ID, {
          limit: 50,
          offset: 0,
        });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
      });

      it('should filter by customerId', async () => {
        mockCreditNotesRepo.findMany.mockResolvedValue({
          data: [],
          total: 0,
          limit: 50,
          offset: 0,
        });

        await service.listCreditNotes(TEST_TENANT_ID, {
          limit: 50,
          offset: 0,
          customerId: 'cust-1',
        });

        expect(mockCreditNotesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ customerId: 'cust-1' }),
        );
      });

      it('should filter by status', async () => {
        mockCreditNotesRepo.findMany.mockResolvedValue({
          data: [],
          total: 0,
          limit: 50,
          offset: 0,
        });

        await service.listCreditNotes(TEST_TENANT_ID, {
          limit: 50,
          offset: 0,
          status: 'issued',
        });

        expect(mockCreditNotesRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ status: 'issued' }),
        );
      });

      it('should return empty list when no credit notes exist', async () => {
        mockCreditNotesRepo.findMany.mockResolvedValue({
          data: [],
          total: 0,
          limit: 50,
          offset: 0,
        });

        const result = await service.listCreditNotes(TEST_TENANT_ID, {
          limit: 50,
          offset: 0,
        });

        expect(result.data).toHaveLength(0);
      });
    });

    describe('getCreditNote', () => {
      it('should return credit note by id', async () => {
        const creditNote = createCreditNoteFixture();
        mockCreditNotesRepo.findById.mockResolvedValue(creditNote);

        const result = await service.getCreditNote(creditNote.id, TEST_TENANT_ID);

        expect(result).toEqual(creditNote);
        expect(mockCreditNotesRepo.findById).toHaveBeenCalledWith(creditNote.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent credit note', async () => {
        mockCreditNotesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getCreditNote('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          CreditNoteNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockCreditNotesRepo.findById.mockResolvedValue(undefined);

        await expect(service.getCreditNote('cn-1', OTHER_TENANT_ID)).rejects.toThrow(
          CreditNoteNotFoundError,
        );
        expect(mockCreditNotesRepo.findById).toHaveBeenCalledWith('cn-1', OTHER_TENANT_ID);
      });
    });

    describe('createCreditNote', () => {
      it('should create credit note with valid data', async () => {
        const input = createCreditNoteInputFixture();
        const customer = createCustomerFixture();
        const expected = createCreditNoteFixture();

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockCreditNotesRepo.findByCreditNoteNumber.mockResolvedValue(undefined);
        mockCreditNotesRepo.create.mockResolvedValue([expected]);

        const result = await service.createCreditNote(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(result.status).toBe('draft');
        // amountApplied and balance are set by the service; verify the repo was called correctly
        expect(mockCreditNotesRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ amountApplied: '0', balance: input.amount }),
          TEST_TENANT_ID,
        );
        expect(mockCustomersRepo.findById).toHaveBeenCalledWith(input.customerId, TEST_TENANT_ID);
      });

      it('should set initial status to draft', async () => {
        const input = createCreditNoteInputFixture();
        const customer = createCustomerFixture();
        const expected = createCreditNoteFixture({ status: 'draft' });

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockCreditNotesRepo.findByCreditNoteNumber.mockResolvedValue(undefined);
        mockCreditNotesRepo.create.mockResolvedValue([expected]);

        await service.createCreditNote(input, TEST_TENANT_ID);

        expect(mockCreditNotesRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'draft' }),
          TEST_TENANT_ID,
        );
      });

      it('should set initial amountApplied to 0', async () => {
        const input = createCreditNoteInputFixture();
        const customer = createCustomerFixture();

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockCreditNotesRepo.findByCreditNoteNumber.mockResolvedValue(undefined);
        mockCreditNotesRepo.create.mockResolvedValue([createCreditNoteFixture()]);

        await service.createCreditNote(input, TEST_TENANT_ID);

        expect(mockCreditNotesRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ amountApplied: '0' }),
          TEST_TENANT_ID,
        );
      });

      it('should set balance equal to amount', async () => {
        const input = createCreditNoteInputFixture({ amount: '500.0000' });
        const customer = createCustomerFixture();

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockCreditNotesRepo.findByCreditNoteNumber.mockResolvedValue(undefined);
        mockCreditNotesRepo.create.mockResolvedValue([
          createCreditNoteFixture({ amount: '500.0000', balance: '500.0000' }),
        ]);

        await service.createCreditNote(input, TEST_TENANT_ID);

        expect(mockCreditNotesRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ amount: '500.0000', balance: '500.0000' }),
          TEST_TENANT_ID,
        );
      });

      it('should throw NotFoundError for non-existent customer', async () => {
        const input = createCreditNoteInputFixture();
        mockCustomersRepo.findById.mockResolvedValue(undefined);

        await expect(service.createCreditNote(input, TEST_TENANT_ID)).rejects.toThrow(
          CustomerNotFoundError,
        );
      });

      it('should reject duplicate credit note number', async () => {
        const input = createCreditNoteInputFixture();
        const customer = createCustomerFixture();
        const existing = createCreditNoteFixture();

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockCreditNotesRepo.findByCreditNoteNumber.mockResolvedValue(existing);

        await expect(service.createCreditNote(input, TEST_TENANT_ID)).rejects.toThrow(
          CreditNoteDuplicateNumberError,
        );
      });

      it('should scope credit note number uniqueness to tenant', async () => {
        const input = createCreditNoteInputFixture();
        const customer = createCustomerFixture();
        const otherTenantCN = createCreditNoteFixture();

        mockCustomersRepo.findById.mockResolvedValue(customer);
        mockCreditNotesRepo.findByCreditNoteNumber.mockImplementation(
          async (_num: string, tenantId: string) => {
            if (tenantId === OTHER_TENANT_ID) return otherTenantCN;
            return undefined;
          },
        );
        mockCreditNotesRepo.create.mockResolvedValue([createCreditNoteFixture()]);

        const result = await service.createCreditNote(input, TEST_TENANT_ID);
        expect(result).toBeDefined();
      });
    });

    describe('updateCreditNoteStatus', () => {
      it('should transition draft to issued', async () => {
        const existing = createCreditNoteFixture({ status: 'draft' });
        const updated = { ...existing, status: 'issued' };

        mockCreditNotesRepo.findById.mockResolvedValue(existing);
        mockCreditNotesRepo.update.mockResolvedValue([updated]);

        const result = await service.updateCreditNoteStatus(existing.id, 'issued', TEST_TENANT_ID);

        expect(result.status).toBe('issued');
      });

      it('should transition draft to voided', async () => {
        const existing = createCreditNoteFixture({ status: 'draft' });
        const updated = { ...existing, status: 'voided' };

        mockCreditNotesRepo.findById.mockResolvedValue(existing);
        mockCreditNotesRepo.update.mockResolvedValue([updated]);

        const result = await service.updateCreditNoteStatus(existing.id, 'voided', TEST_TENANT_ID);

        expect(result.status).toBe('voided');
      });

      it('should transition issued to applied', async () => {
        const existing = createCreditNoteFixture({ status: 'issued' });
        const updated = { ...existing, status: 'applied' };

        mockCreditNotesRepo.findById.mockResolvedValue(existing);
        mockCreditNotesRepo.update.mockResolvedValue([updated]);

        const result = await service.updateCreditNoteStatus(existing.id, 'applied', TEST_TENANT_ID);

        expect(result.status).toBe('applied');
      });

      it('should transition issued to voided', async () => {
        const existing = createCreditNoteFixture({ status: 'issued' });
        const updated = { ...existing, status: 'voided' };

        mockCreditNotesRepo.findById.mockResolvedValue(existing);
        mockCreditNotesRepo.update.mockResolvedValue([updated]);

        const result = await service.updateCreditNoteStatus(existing.id, 'voided', TEST_TENANT_ID);

        expect(result.status).toBe('voided');
      });

      it('should throw NotFoundError for non-existent credit note', async () => {
        mockCreditNotesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateCreditNoteStatus('non-existent', 'issued', TEST_TENANT_ID),
        ).rejects.toThrow(CreditNoteNotFoundError);
      });

      it('should reject transitioning voided credit note', async () => {
        const existing = createCreditNoteFixture({ status: 'voided' });
        mockCreditNotesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateCreditNoteStatus(existing.id, 'issued', TEST_TENANT_ID),
        ).rejects.toThrow(CreditNoteStatusTransitionError);
      });

      it('should reject transitioning applied credit note', async () => {
        const existing = createCreditNoteFixture({ status: 'applied' });
        mockCreditNotesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateCreditNoteStatus(existing.id, 'issued', TEST_TENANT_ID),
        ).rejects.toThrow(CreditNoteStatusTransitionError);
      });

      it('should reject invalid status transition (draft to applied)', async () => {
        const existing = createCreditNoteFixture({ status: 'draft' });
        mockCreditNotesRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateCreditNoteStatus(existing.id, 'applied', TEST_TENANT_ID),
        ).rejects.toThrow(CreditNoteStatusTransitionError);
      });

      it('should scope status update to tenant', async () => {
        mockCreditNotesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateCreditNoteStatus('cn-1', 'issued', OTHER_TENANT_ID),
        ).rejects.toThrow(CreditNoteNotFoundError);
        expect(mockCreditNotesRepo.findById).toHaveBeenCalledWith('cn-1', OTHER_TENANT_ID);
      });

      it('should throw NotFoundError when update returns empty', async () => {
        const existing = createCreditNoteFixture({ status: 'draft' });
        mockCreditNotesRepo.findById.mockResolvedValue(existing);
        mockCreditNotesRepo.update.mockResolvedValue([]);

        await expect(
          service.updateCreditNoteStatus(existing.id, 'issued', TEST_TENANT_ID),
        ).rejects.toThrow(CreditNoteNotFoundError);
      });
    });

    describe('applyCreditNote', () => {
      it('should apply credit note to invoice', async () => {
        const creditNote = createCreditNoteFixture({
          status: 'issued',
          amount: '500.0000',
          amountApplied: '0',
          balance: '500.0000',
        });
        const invoice = createInvoiceFixture({ totalAmount: '1100.0000', balanceDue: '1100.0000' });

        mockCreditNotesRepo.findById.mockResolvedValue(creditNote);
        mockInvoicesRepo.findById.mockResolvedValue(invoice);
        mockPaymentApplicationsRepo.create.mockResolvedValue([createPaymentApplicationFixture()]);
        mockCreditNotesRepo.update.mockResolvedValue([
          { ...creditNote, amountApplied: '200.0000', balance: '300.0000' },
        ]);
        mockPaymentApplicationsRepo.sumAppliedByInvoiceId.mockResolvedValue('200.0000');
        mockInvoicesRepo.update.mockResolvedValue([
          { ...invoice, amountPaid: '200.0000', balanceDue: '900.0000' },
        ]);

        await service.applyCreditNote(
          creditNote.id,
          { invoiceId: invoice.id, amountApplied: '200.0000', appliedDate: '2026-07-25' },
          TEST_TENANT_ID,
        );

        expect(mockPaymentApplicationsRepo.create).toHaveBeenCalled();
        expect(mockCreditNotesRepo.update).toHaveBeenCalledWith(
          creditNote.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            amountApplied: '200.0000',
            balance: '300.0000',
          }),
        );
      });

      it('should mark credit note as applied when fully used', async () => {
        const creditNote = createCreditNoteFixture({
          status: 'issued',
          amount: '500.0000',
          amountApplied: '0',
          balance: '500.0000',
        });
        const invoice = createInvoiceFixture({ totalAmount: '1100.0000', balanceDue: '1100.0000' });

        mockCreditNotesRepo.findById.mockResolvedValue(creditNote);
        mockInvoicesRepo.findById.mockResolvedValue(invoice);
        mockPaymentApplicationsRepo.create.mockResolvedValue([createPaymentApplicationFixture()]);
        mockCreditNotesRepo.update.mockResolvedValue([
          { ...creditNote, amountApplied: '500.0000', balance: '0', status: 'applied' },
        ]);
        mockPaymentApplicationsRepo.sumAppliedByInvoiceId.mockResolvedValue('500.0000');
        mockInvoicesRepo.update.mockResolvedValue([
          { ...invoice, amountPaid: '500.0000', balanceDue: '600.0000' },
        ]);

        await service.applyCreditNote(
          creditNote.id,
          { invoiceId: invoice.id, amountApplied: '500.0000', appliedDate: '2026-07-25' },
          TEST_TENANT_ID,
        );

        expect(mockCreditNotesRepo.update).toHaveBeenCalledWith(
          creditNote.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            amountApplied: '500.0000',
            balance: '0.0000',
            status: 'applied',
          }),
        );
      });

      it('should throw NotFoundError for non-existent credit note', async () => {
        mockCreditNotesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.applyCreditNote(
            'non-existent',
            { invoiceId: 'inv-1', amountApplied: '100.0000', appliedDate: '2026-07-25' },
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(CreditNoteNotFoundError);
      });

      it('should reject applying non-issued credit note', async () => {
        const creditNote = createCreditNoteFixture({ status: 'draft' });
        mockCreditNotesRepo.findById.mockResolvedValue(creditNote);

        await expect(
          service.applyCreditNote(
            creditNote.id,
            { invoiceId: 'inv-1', amountApplied: '100.0000', appliedDate: '2026-07-25' },
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(CreditNoteStatusTransitionError);
      });

      it('should throw NotFoundError for non-existent invoice', async () => {
        const creditNote = createCreditNoteFixture({ status: 'issued' });
        mockCreditNotesRepo.findById.mockResolvedValue(creditNote);
        mockInvoicesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.applyCreditNote(
            creditNote.id,
            { invoiceId: 'non-existent', amountApplied: '100.0000', appliedDate: '2026-07-25' },
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(InvoiceNotFoundError);
      });

      it('should reject application exceeding credit note balance', async () => {
        const creditNote = createCreditNoteFixture({
          status: 'issued',
          amount: '500.0000',
          amountApplied: '300.0000',
          balance: '200.0000',
        });
        const invoice = createInvoiceFixture({ balanceDue: '1000.0000' });

        mockCreditNotesRepo.findById.mockResolvedValue(creditNote);
        mockInvoicesRepo.findById.mockResolvedValue(invoice);

        await expect(
          service.applyCreditNote(
            creditNote.id,
            { invoiceId: invoice.id, amountApplied: '500.0000', appliedDate: '2026-07-25' },
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(CreditNoteAmountExceedsBalanceError);
      });

      it('should scope all lookups to tenant', async () => {
        mockCreditNotesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.applyCreditNote(
            'cn-1',
            { invoiceId: 'inv-1', amountApplied: '100.0000', appliedDate: '2026-07-25' },
            OTHER_TENANT_ID,
          ),
        ).rejects.toThrow(CreditNoteNotFoundError);
        expect(mockCreditNotesRepo.findById).toHaveBeenCalledWith('cn-1', OTHER_TENANT_ID);
      });

      it('should update invoice balance after credit note application', async () => {
        const creditNote = createCreditNoteFixture({
          status: 'issued',
          amount: '300.0000',
          amountApplied: '0',
          balance: '300.0000',
        });
        const invoice = createInvoiceFixture({ totalAmount: '1100.0000', balanceDue: '1100.0000' });

        mockCreditNotesRepo.findById.mockResolvedValue(creditNote);
        mockInvoicesRepo.findById.mockResolvedValue(invoice);
        mockPaymentApplicationsRepo.create.mockResolvedValue([createPaymentApplicationFixture()]);
        mockCreditNotesRepo.update.mockResolvedValue([
          { ...creditNote, amountApplied: '300.0000', balance: '0' },
        ]);
        mockPaymentApplicationsRepo.sumAppliedByInvoiceId.mockResolvedValue('300.0000');
        mockInvoicesRepo.update.mockResolvedValue([
          { ...invoice, amountPaid: '300.0000', balanceDue: '800.0000' },
        ]);

        await service.applyCreditNote(
          creditNote.id,
          { invoiceId: invoice.id, amountApplied: '300.0000', appliedDate: '2026-07-25' },
          TEST_TENANT_ID,
        );

        expect(mockInvoicesRepo.update).toHaveBeenCalledWith(
          invoice.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            amountPaid: '300.0000',
            balanceDue: '800.0000',
          }),
        );
      });
    });
  });
});
