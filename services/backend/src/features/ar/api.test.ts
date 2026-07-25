import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { TEST_TENANT_ID } from '../../lib/test-utils';

vi.mock('encore.dev/api', () => {
  class MockAPIError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message);
      this.code = code;
      this.status = opts?.status ?? 500;
    }
    static unauthenticated(message: string) {
      return new MockAPIError('UNAUTHENTICATED', message, { status: 401 });
    }
    static notFound(message: string) {
      return new MockAPIError('NOT_FOUND', message, { status: 404 });
    }
    static invalidArgument(message: string) {
      return new MockAPIError('INVALID_ARGUMENT', message, { status: 400 });
    }
  }
  return {
    APIError: MockAPIError,
    api: vi.fn((_config: unknown, handler: unknown) => handler),
  };
});

vi.mock('~encore/auth', () => ({
  getAuthData: vi.fn(),
}));

vi.mock('./service', () => ({
  listCustomers: vi.fn(),
  getCustomer: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
  listInvoices: vi.fn(),
  getInvoice: vi.fn(),
  getInvoiceLineItems: vi.fn(),
  createInvoice: vi.fn(),
  updateInvoice: vi.fn(),
  updateInvoiceStatus: vi.fn(),
  listPayments: vi.fn(),
  getPayment: vi.fn(),
  createPayment: vi.fn(),
  updatePayment: vi.fn(),
  createPaymentApplication: vi.fn(),
  deletePaymentApplication: vi.fn(),
  listCreditNotes: vi.fn(),
  getCreditNote: vi.fn(),
  createCreditNote: vi.fn(),
  updateCreditNoteStatus: vi.fn(),
  applyCreditNote: vi.fn(),
}));

import { getAuthData } from '~encore/auth';
import * as service from './service';
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  listInvoices,
  getInvoice,
  getInvoiceLineItems,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  listPayments,
  getPayment,
  createPayment,
  updatePayment,
  createPaymentApplication,
  deletePaymentApplication,
  listCreditNotes,
  getCreditNote,
  createCreditNote,
  updateCreditNoteStatus,
  applyCreditNote,
} from './api';

const mockGetAuthData = vi.mocked(getAuthData);

const mockAuth = { tenantId: TEST_TENANT_ID };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthData.mockReturnValue(mockAuth);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Customer Tests ──────────────────────────────────────────────────────────

describe('listCustomers', () => {
  it('returns paginated customers', async () => {
    const result = { data: [], total: 0, limit: 50, offset: 0 };
    vi.mocked(service.listCustomers).mockResolvedValue(result);

    const res = await (listCustomers as Function)({ limit: 10, offset: 5 });

    expect(service.listCustomers).toHaveBeenCalledWith(TEST_TENANT_ID, { limit: 10, offset: 5 });
    expect(res).toEqual(result);
  });

  it('applies default pagination', async () => {
    vi.mocked(service.listCustomers).mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

    await (listCustomers as Function)({});

    expect(service.listCustomers).toHaveBeenCalledWith(TEST_TENANT_ID, { limit: 50, offset: 0 });
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((listCustomers as Function)({})).rejects.toThrow('not authenticated');
  });
});

describe('getCustomer', () => {
  it('returns a customer by id', async () => {
    const customer = { id: 'c1', name: 'Acme' };
    vi.mocked(service.getCustomer).mockResolvedValue(customer);

    const res = await (getCustomer as Function)({ id: 'c1' });

    expect(service.getCustomer).toHaveBeenCalledWith('c1', TEST_TENANT_ID);
    expect(res).toEqual(customer);
  });

  it('propagates service errors', async () => {
    vi.mocked(service.getCustomer).mockRejectedValue(new Error('not found'));

    await expect((getCustomer as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((getCustomer as Function)({ id: 'c1' })).rejects.toThrow('not authenticated');
  });
});

describe('createCustomer', () => {
  it('creates a customer with valid data', async () => {
    const customer = { id: 'c1', name: 'Acme' };
    vi.mocked(service.createCustomer).mockResolvedValue(customer);

    const res = await (createCustomer as Function)({
      name: 'Acme',
      email: 'acme@test.com',
      paymentTerms: 'Net 30',
    });

    expect(service.createCustomer).toHaveBeenCalled();
    expect(res).toEqual(customer);
  });

  it('rejects invalid email', async () => {
    await expect(
      (createCustomer as Function)({ name: 'Test', email: 'not-an-email' }),
    ).rejects.toThrow();
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (createCustomer as Function)({ name: 'Test' }),
    ).rejects.toThrow('not authenticated');
  });
});

describe('updateCustomer', () => {
  it('updates a customer', async () => {
    const customer = { id: 'c1', name: 'Updated' };
    vi.mocked(service.updateCustomer).mockResolvedValue(customer);

    const res = await (updateCustomer as Function)({ id: 'c1', name: 'Updated' });

    expect(service.updateCustomer).toHaveBeenCalledWith('c1', { name: 'Updated' }, TEST_TENANT_ID);
    expect(res).toEqual(customer);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((updateCustomer as Function)({ id: 'c1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.updateCustomer).mockRejectedValue(new Error('not found'));

    await expect((updateCustomer as Function)({ id: 'bad', name: 'X' })).rejects.toThrow('not found');
  });
});

describe('deleteCustomer', () => {
  it('deletes a customer', async () => {
    vi.mocked(service.deleteCustomer).mockResolvedValue(undefined);

    await (deleteCustomer as Function)({ id: 'c1' });

    expect(service.deleteCustomer).toHaveBeenCalledWith('c1', TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((deleteCustomer as Function)({ id: 'c1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.deleteCustomer).mockRejectedValue(new Error('has invoices'));

    await expect((deleteCustomer as Function)({ id: 'c1' })).rejects.toThrow('has invoices');
  });
});

// ─── Invoice Tests ───────────────────────────────────────────────────────────

describe('listInvoices', () => {
  it('returns paginated invoices', async () => {
    const result = { data: [], total: 0, limit: 50, offset: 0 };
    vi.mocked(service.listInvoices).mockResolvedValue(result);

    const res = await (listInvoices as Function)({
      customerId: 'cust-1',
      status: 'draft',
      limit: 10,
      offset: 0,
    });

    expect(service.listInvoices).toHaveBeenCalledWith(TEST_TENANT_ID, {
      customerId: 'cust-1',
      status: 'draft',
      limit: 10,
      offset: 0,
    });
    expect(res).toEqual(result);
  });

  it('applies default pagination', async () => {
    vi.mocked(service.listInvoices).mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

    await (listInvoices as Function)({});

    expect(service.listInvoices).toHaveBeenCalledWith(TEST_TENANT_ID, {
      customerId: undefined,
      status: undefined,
      limit: 50,
      offset: 0,
    });
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((listInvoices as Function)({})).rejects.toThrow('not authenticated');
  });
});

describe('getInvoice', () => {
  it('returns an invoice by id', async () => {
    const invoice = { id: 'inv-1', invoiceNumber: 'INV-001' };
    vi.mocked(service.getInvoice).mockResolvedValue(invoice);

    const res = await (getInvoice as Function)({ id: 'inv-1' });

    expect(service.getInvoice).toHaveBeenCalledWith('inv-1', TEST_TENANT_ID);
    expect(res).toEqual(invoice);
  });

  it('propagates service errors', async () => {
    vi.mocked(service.getInvoice).mockRejectedValue(new Error('not found'));

    await expect((getInvoice as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((getInvoice as Function)({ id: 'inv-1' })).rejects.toThrow('not authenticated');
  });
});

describe('getInvoiceLineItems', () => {
  it('returns line items for an invoice', async () => {
    const items = [{ id: 'li-1', description: 'Widget' }];
    vi.mocked(service.getInvoiceLineItems).mockResolvedValue(items);

    const res = await (getInvoiceLineItems as Function)({ id: 'inv-1' });

    expect(service.getInvoiceLineItems).toHaveBeenCalledWith('inv-1', TEST_TENANT_ID);
    expect(res).toEqual(items);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((getInvoiceLineItems as Function)({ id: 'inv-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.getInvoiceLineItems).mockRejectedValue(new Error('invoice not found'));

    await expect((getInvoiceLineItems as Function)({ id: 'bad' })).rejects.toThrow('invoice not found');
  });
});

describe('createInvoice', () => {
  it('creates an invoice with valid data', async () => {
    const invoice = { id: 'inv-1', invoiceNumber: 'INV-001' };
    vi.mocked(service.createInvoice).mockResolvedValue(invoice);

    const res = await (createInvoice as Function)({
      customerId: '550e8400-e29b-41d4-a716-446655440000',
      invoiceNumber: 'INV-001',
      issueDate: '2026-01-15',
      dueDate: '2026-02-15',
      lineItems: [
        { description: 'Widget', quantity: '10', unitPrice: '25.00' },
      ],
    });

    expect(service.createInvoice).toHaveBeenCalled();
    expect(res).toEqual(invoice);
  });

  it('rejects missing line items', async () => {
    await expect(
      (createInvoice as Function)({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        invoiceNumber: 'INV-001',
        issueDate: '2026-01-15',
        dueDate: '2026-02-15',
        lineItems: [],
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid date format', async () => {
    await expect(
      (createInvoice as Function)({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        invoiceNumber: 'INV-001',
        issueDate: '01-15-2026',
        dueDate: '2026-02-15',
        lineItems: [{ description: 'W', quantity: '1', unitPrice: '10' }],
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid customer uuid', async () => {
    await expect(
      (createInvoice as Function)({
        customerId: 'not-a-uuid',
        invoiceNumber: 'INV-001',
        issueDate: '2026-01-15',
        dueDate: '2026-02-15',
        lineItems: [{ description: 'W', quantity: '1', unitPrice: '10' }],
      }),
    ).rejects.toThrow();
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (createInvoice as Function)({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        invoiceNumber: 'INV-001',
        issueDate: '2026-01-15',
        dueDate: '2026-02-15',
        lineItems: [{ description: 'W', quantity: '1', unitPrice: '10' }],
      }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.createInvoice).mockRejectedValue(new Error('duplicate number'));

    await expect(
      (createInvoice as Function)({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        invoiceNumber: 'INV-001',
        issueDate: '2026-01-15',
        dueDate: '2026-02-15',
        lineItems: [{ description: 'W', quantity: '1', unitPrice: '10' }],
      }),
    ).rejects.toThrow('duplicate number');
  });
});

describe('updateInvoice', () => {
  it('updates an invoice', async () => {
    const invoice = { id: 'inv-1', invoiceNumber: 'INV-001' };
    vi.mocked(service.updateInvoice).mockResolvedValue(invoice);

    const res = await (updateInvoice as Function)({
      id: 'inv-1',
      notes: 'Updated notes',
    });

    expect(service.updateInvoice).toHaveBeenCalledWith(
      'inv-1',
      { notes: 'Updated notes' },
      TEST_TENANT_ID,
    );
    expect(res).toEqual(invoice);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((updateInvoice as Function)({ id: 'inv-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.updateInvoice).mockRejectedValue(new Error('not found'));

    await expect((updateInvoice as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });
});

describe('updateInvoiceStatus', () => {
  it('updates invoice status', async () => {
    const invoice = { id: 'inv-1', status: 'sent' };
    vi.mocked(service.updateInvoiceStatus).mockResolvedValue(invoice);

    const res = await (updateInvoiceStatus as Function)({ id: 'inv-1', status: 'sent' });

    expect(service.updateInvoiceStatus).toHaveBeenCalledWith('inv-1', 'sent', TEST_TENANT_ID);
    expect(res).toEqual(invoice);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (updateInvoiceStatus as Function)({ id: 'inv-1', status: 'sent' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.updateInvoiceStatus).mockRejectedValue(new Error('invalid transition'));

    await expect(
      (updateInvoiceStatus as Function)({ id: 'inv-1', status: 'paid' }),
    ).rejects.toThrow('invalid transition');
  });
});

// ─── Payment Tests ───────────────────────────────────────────────────────────

describe('listPayments', () => {
  it('returns paginated payments', async () => {
    const result = { data: [], total: 0, limit: 50, offset: 0 };
    vi.mocked(service.listPayments).mockResolvedValue(result);

    const res = await (listPayments as Function)({ limit: 20, offset: 10 });

    expect(service.listPayments).toHaveBeenCalledWith(TEST_TENANT_ID, { limit: 20, offset: 10 });
    expect(res).toEqual(result);
  });

  it('applies default pagination', async () => {
    vi.mocked(service.listPayments).mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

    await (listPayments as Function)({});

    expect(service.listPayments).toHaveBeenCalledWith(TEST_TENANT_ID, { limit: 50, offset: 0 });
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((listPayments as Function)({})).rejects.toThrow('not authenticated');
  });
});

describe('getPayment', () => {
  it('returns a payment by id', async () => {
    const payment = { id: 'pmt-1', paymentNumber: 'PMT-001' };
    vi.mocked(service.getPayment).mockResolvedValue(payment);

    const res = await (getPayment as Function)({ id: 'pmt-1' });

    expect(service.getPayment).toHaveBeenCalledWith('pmt-1', TEST_TENANT_ID);
    expect(res).toEqual(payment);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((getPayment as Function)({ id: 'pmt-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.getPayment).mockRejectedValue(new Error('not found'));

    await expect((getPayment as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });
});

describe('createPayment', () => {
  it('creates a payment with valid data', async () => {
    const payment = { id: 'pmt-1', paymentNumber: 'PMT-001' };
    vi.mocked(service.createPayment).mockResolvedValue(payment);

    const res = await (createPayment as Function)({
      customerId: '550e8400-e29b-41d4-a716-446655440000',
      paymentNumber: 'PMT-001',
      paymentDate: '2026-01-20',
      amount: '500.00',
      paymentMethod: 'bank_transfer',
    });

    expect(service.createPayment).toHaveBeenCalled();
    expect(res).toEqual(payment);
  });

  it('rejects invalid payment method', async () => {
    await expect(
      (createPayment as Function)({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        paymentNumber: 'PMT-001',
        paymentDate: '2026-01-20',
        amount: '500.00',
        paymentMethod: 'invalid_method',
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid date format', async () => {
    await expect(
      (createPayment as Function)({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        paymentNumber: 'PMT-001',
        paymentDate: '20-01-2026',
        amount: '500.00',
        paymentMethod: 'cash',
      }),
    ).rejects.toThrow();
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (createPayment as Function)({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        paymentNumber: 'PMT-001',
        paymentDate: '2026-01-20',
        amount: '500.00',
        paymentMethod: 'cash',
      }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.createPayment).mockRejectedValue(new Error('duplicate number'));

    await expect(
      (createPayment as Function)({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        paymentNumber: 'PMT-001',
        paymentDate: '2026-01-20',
        amount: '500.00',
        paymentMethod: 'cash',
      }),
    ).rejects.toThrow('duplicate number');
  });
});

describe('updatePayment', () => {
  it('updates a payment', async () => {
    const payment = { id: 'pmt-1', amount: '600.00' };
    vi.mocked(service.updatePayment).mockResolvedValue(payment);

    const res = await (updatePayment as Function)({ id: 'pmt-1', amount: '600.00' });

    expect(service.updatePayment).toHaveBeenCalledWith(
      'pmt-1',
      { amount: '600.00' },
      TEST_TENANT_ID,
    );
    expect(res).toEqual(payment);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((updatePayment as Function)({ id: 'pmt-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.updatePayment).mockRejectedValue(new Error('not found'));

    await expect((updatePayment as Function)({ id: 'bad', amount: '100' })).rejects.toThrow('not found');
  });
});

// ─── Payment Application Tests ───────────────────────────────────────────────

describe('createPaymentApplication', () => {
  it('creates a payment application', async () => {
    const app = { id: 'pa-1', paymentId: 'pmt-1' };
    vi.mocked(service.createPaymentApplication).mockResolvedValue(app);

    const res = await (createPaymentApplication as Function)({
      paymentId: '550e8400-e29b-41d4-a716-446655440000',
      invoiceId: '660e8400-e29b-41d4-a716-446655440001',
      amountApplied: '250.00',
      appliedDate: '2026-01-25',
    });

    expect(service.createPaymentApplication).toHaveBeenCalled();
    expect(res).toEqual(app);
  });

  it('rejects invalid payment uuid', async () => {
    await expect(
      (createPaymentApplication as Function)({
        paymentId: 'not-a-uuid',
        invoiceId: '660e8400-e29b-41d4-a716-446655440001',
        amountApplied: '250.00',
        appliedDate: '2026-01-25',
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid date format', async () => {
    await expect(
      (createPaymentApplication as Function)({
        paymentId: '550e8400-e29b-41d4-a716-446655440000',
        invoiceId: '660e8400-e29b-41d4-a716-446655440001',
        amountApplied: '250.00',
        appliedDate: '25-01-2026',
      }),
    ).rejects.toThrow();
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (createPaymentApplication as Function)({
        paymentId: '550e8400-e29b-41d4-a716-446655440000',
        invoiceId: '660e8400-e29b-41d4-a716-446655440001',
        amountApplied: '250.00',
        appliedDate: '2026-01-25',
      }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.createPaymentApplication).mockRejectedValue(new Error('payment not found'));

    await expect(
      (createPaymentApplication as Function)({
        paymentId: '550e8400-e29b-41d4-a716-446655440000',
        invoiceId: '660e8400-e29b-41d4-a716-446655440001',
        amountApplied: '250.00',
        appliedDate: '2026-01-25',
      }),
    ).rejects.toThrow('payment not found');
  });
});

describe('deletePaymentApplication', () => {
  it('deletes a payment application', async () => {
    vi.mocked(service.deletePaymentApplication).mockResolvedValue(undefined);

    await (deletePaymentApplication as Function)({ id: 'pa-1' });

    expect(service.deletePaymentApplication).toHaveBeenCalledWith('pa-1', TEST_TENANT_ID);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (deletePaymentApplication as Function)({ id: 'pa-1' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.deletePaymentApplication).mockRejectedValue(new Error('not found'));

    await expect(
      (deletePaymentApplication as Function)({ id: 'bad' }),
    ).rejects.toThrow('not found');
  });
});

// ─── Credit Note Tests ───────────────────────────────────────────────────────

describe('listCreditNotes', () => {
  it('returns paginated credit notes', async () => {
    const result = { data: [], total: 0, limit: 50, offset: 0 };
    vi.mocked(service.listCreditNotes).mockResolvedValue(result);

    const res = await (listCreditNotes as Function)({
      customerId: 'cust-1',
      status: 'draft',
      limit: 10,
      offset: 5,
    });

    expect(service.listCreditNotes).toHaveBeenCalledWith(TEST_TENANT_ID, {
      customerId: 'cust-1',
      status: 'draft',
      limit: 10,
      offset: 5,
    });
    expect(res).toEqual(result);
  });

  it('applies default pagination', async () => {
    vi.mocked(service.listCreditNotes).mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 });

    await (listCreditNotes as Function)({});

    expect(service.listCreditNotes).toHaveBeenCalledWith(TEST_TENANT_ID, {
      customerId: undefined,
      status: undefined,
      limit: 50,
      offset: 0,
    });
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((listCreditNotes as Function)({})).rejects.toThrow('not authenticated');
  });
});

describe('getCreditNote', () => {
  it('returns a credit note by id', async () => {
    const cn = { id: 'cn-1', creditNoteNumber: 'CN-001' };
    vi.mocked(service.getCreditNote).mockResolvedValue(cn);

    const res = await (getCreditNote as Function)({ id: 'cn-1' });

    expect(service.getCreditNote).toHaveBeenCalledWith('cn-1', TEST_TENANT_ID);
    expect(res).toEqual(cn);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect((getCreditNote as Function)({ id: 'cn-1' })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.getCreditNote).mockRejectedValue(new Error('not found'));

    await expect((getCreditNote as Function)({ id: 'bad' })).rejects.toThrow('not found');
  });
});

describe('createCreditNote', () => {
  it('creates a credit note with valid data', async () => {
    const cn = { id: 'cn-1', creditNoteNumber: 'CN-001' };
    vi.mocked(service.createCreditNote).mockResolvedValue(cn);

    const res = await (createCreditNote as Function)({
      customerId: '550e8400-e29b-41d4-a716-446655440000',
      creditNoteNumber: 'CN-001',
      issueDate: '2026-02-01',
      reason: 'Returned goods',
      amount: '100.00',
    });

    expect(service.createCreditNote).toHaveBeenCalled();
    expect(res).toEqual(cn);
  });

  it('rejects missing reason', async () => {
    await expect(
      (createCreditNote as Function)({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        creditNoteNumber: 'CN-001',
        issueDate: '2026-02-01',
        reason: '',
        amount: '100.00',
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid date format', async () => {
    await expect(
      (createCreditNote as Function)({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        creditNoteNumber: 'CN-001',
        issueDate: '02-01-2026',
        reason: 'Return',
        amount: '100.00',
      }),
    ).rejects.toThrow();
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (createCreditNote as Function)({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        creditNoteNumber: 'CN-001',
        issueDate: '2026-02-01',
        reason: 'Return',
        amount: '100.00',
      }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.createCreditNote).mockRejectedValue(new Error('duplicate number'));

    await expect(
      (createCreditNote as Function)({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        creditNoteNumber: 'CN-001',
        issueDate: '2026-02-01',
        reason: 'Return',
        amount: '100.00',
      }),
    ).rejects.toThrow('duplicate number');
  });
});

describe('updateCreditNoteStatus', () => {
  it('updates credit note status', async () => {
    const cn = { id: 'cn-1', status: 'issued' };
    vi.mocked(service.updateCreditNoteStatus).mockResolvedValue(cn);

    const res = await (updateCreditNoteStatus as Function)({ id: 'cn-1', status: 'issued' });

    expect(service.updateCreditNoteStatus).toHaveBeenCalledWith('cn-1', 'issued', TEST_TENANT_ID);
    expect(res).toEqual(cn);
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (updateCreditNoteStatus as Function)({ id: 'cn-1', status: 'issued' }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.updateCreditNoteStatus).mockRejectedValue(new Error('invalid transition'));

    await expect(
      (updateCreditNoteStatus as Function)({ id: 'cn-1', status: 'paid' }),
    ).rejects.toThrow('invalid transition');
  });
});

describe('applyCreditNote', () => {
  it('applies a credit note to an invoice', async () => {
    vi.mocked(service.applyCreditNote).mockResolvedValue(undefined);

    await (applyCreditNote as Function)({
      id: 'cn-1',
      invoiceId: '550e8400-e29b-41d4-a716-446655440000',
      amountApplied: '50.00',
      appliedDate: '2026-02-10',
    });

    expect(service.applyCreditNote).toHaveBeenCalledWith(
      'cn-1',
      { invoiceId: '550e8400-e29b-41d4-a716-446655440000', amountApplied: '50.00', appliedDate: '2026-02-10' },
      TEST_TENANT_ID,
    );
  });

  it('rejects invalid invoice uuid', async () => {
    await expect(
      (applyCreditNote as Function)({
        id: 'cn-1',
        invoiceId: 'not-a-uuid',
        amountApplied: '50.00',
        appliedDate: '2026-02-10',
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid date format', async () => {
    await expect(
      (applyCreditNote as Function)({
        id: 'cn-1',
        invoiceId: '550e8400-e29b-41d4-a716-446655440000',
        amountApplied: '50.00',
        appliedDate: '10-02-2026',
      }),
    ).rejects.toThrow();
  });

  it('throws when unauthenticated', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      (applyCreditNote as Function)({
        id: 'cn-1',
        invoiceId: '550e8400-e29b-41d4-a716-446655440000',
        amountApplied: '50.00',
        appliedDate: '2026-02-10',
      }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    vi.mocked(service.applyCreditNote).mockRejectedValue(new Error('credit note not issued'));

    await expect(
      (applyCreditNote as Function)({
        id: 'cn-1',
        invoiceId: '550e8400-e29b-41d4-a716-446655440000',
        amountApplied: '50.00',
        appliedDate: '2026-02-10',
      }),
    ).rejects.toThrow('credit note not issued');
  });
});
