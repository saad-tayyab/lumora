import { TEST_TENANT_ID } from '../../../lib/test-utils';

// ─── Customer Fixtures ────────────────────────────────────────────────────

export const createCustomerFixture = (overrides = {}) => ({
  id: 'cust-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  name: 'Acme Corp',
  email: 'billing@acme.com',
  phone: '+1-555-0100',
  addressLine1: '100 Main St',
  addressLine2: null,
  city: 'Springfield',
  state: 'IL',
  postalCode: '62701',
  country: 'USA',
  paymentTerms: 'Net 30',
  creditLimit: '50000.0000',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createCustomerInputFixture = (overrides = {}) => ({
  name: 'Acme Corp',
  email: 'billing@acme.com',
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
});

// ─── Invoice Fixtures ─────────────────────────────────────────────────────

export const createInvoiceFixture = (overrides = {}) => ({
  id: 'inv-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  customerId: 'cust-00000000-0000-0000-000000000001',
  invoiceNumber: 'INV-2026-001',
  status: 'draft' as const,
  issueDate: '2026-07-15',
  dueDate: '2026-08-14',
  subtotal: '1000.0000',
  taxAmount: '100.0000',
  totalAmount: '1100.0000',
  amountPaid: '0.0000',
  balanceDue: '1100.0000',
  currency: 'USD',
  notes: null,
  createdAt: new Date('2026-07-15'),
  updatedAt: new Date('2026-07-15'),
  deletedAt: null,
  ...overrides,
});

export const createInvoiceInputFixture = (overrides = {}) => ({
  customerId: 'cust-00000000-0000-0000-000000000001',
  invoiceNumber: 'INV-2026-001',
  issueDate: '2026-07-15',
  dueDate: '2026-08-14',
  currency: 'USD',
  notes: 'Test invoice',
  lineItems: [
    {
      description: 'Widget A',
      quantity: '10',
      unitPrice: '100.0000',
      taxRate: '0.1000',
      sortOrder: 0,
    },
  ],
  ...overrides,
});

// ─── Invoice Line Item Fixtures ───────────────────────────────────────────

export const createInvoiceLineItemFixture = (overrides = {}) => ({
  id: 'ili-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  invoiceId: 'inv-00000000-0000-0000-000000000001',
  description: 'Widget A',
  quantity: '10',
  unitPrice: '100.0000',
  amount: '1000.0000',
  taxRate: '0.1000',
  taxAmount: '100.0000',
  sortOrder: 0,
  createdAt: new Date('2026-07-15'),
  updatedAt: new Date('2026-07-15'),
  deletedAt: null,
  ...overrides,
});

// ─── Payment Fixtures ─────────────────────────────────────────────────────

export const createPaymentFixture = (overrides = {}) => ({
  id: 'pay-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  customerId: 'cust-00000000-0000-0000-000000000001',
  paymentNumber: 'PAY-2026-001',
  paymentDate: '2026-07-20',
  amount: '500.0000',
  paymentMethod: 'bank_transfer' as const,
  referenceNumber: 'REF-001',
  bankAccountId: null,
  currency: 'USD',
  notes: null,
  createdAt: new Date('2026-07-20'),
  updatedAt: new Date('2026-07-20'),
  deletedAt: null,
  ...overrides,
});

export const createPaymentInputFixture = (overrides = {}) => ({
  customerId: 'cust-00000000-0000-0000-000000000001',
  paymentNumber: 'PAY-2026-001',
  paymentDate: '2026-07-20',
  amount: '500.0000',
  paymentMethod: 'bank_transfer' as const,
  referenceNumber: 'REF-001',
  currency: 'USD',
  notes: 'Test payment',
  ...overrides,
});

// ─── Payment Application Fixtures ─────────────────────────────────────────

export const createPaymentApplicationFixture = (overrides = {}) => ({
  id: 'pa-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  paymentId: 'pay-00000000-0000-0000-000000000001',
  invoiceId: 'inv-00000000-0000-0000-000000000001',
  amountApplied: '500.0000',
  appliedDate: '2026-07-20',
  createdAt: new Date('2026-07-20'),
  updatedAt: new Date('2026-07-20'),
  deletedAt: null,
  ...overrides,
});

export const createPaymentApplicationInputFixture = (overrides = {}) => ({
  paymentId: 'pay-00000000-0000-0000-000000000001',
  invoiceId: 'inv-00000000-0000-0000-000000000001',
  amountApplied: '500.0000',
  appliedDate: '2026-07-20',
  ...overrides,
});

// ─── Credit Note Fixtures ─────────────────────────────────────────────────

export const createCreditNoteFixture = (overrides = {}) => ({
  id: 'cn-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  customerId: 'cust-00000000-0000-0000-000000000001',
  creditNoteNumber: 'CN-2026-001',
  status: 'draft' as const,
  issueDate: '2026-07-25',
  reason: 'Product return',
  amount: '200.0000',
  amountApplied: '0.0000',
  balance: '200.0000',
  currency: 'USD',
  notes: null,
  createdAt: new Date('2026-07-25'),
  updatedAt: new Date('2026-07-25'),
  deletedAt: null,
  ...overrides,
});

export const createCreditNoteInputFixture = (overrides = {}) => ({
  customerId: 'cust-00000000-0000-0000-000000000001',
  creditNoteNumber: 'CN-2026-001',
  issueDate: '2026-07-25',
  reason: 'Product return',
  amount: '200.0000',
  currency: 'USD',
  notes: 'Test credit note',
  ...overrides,
});
