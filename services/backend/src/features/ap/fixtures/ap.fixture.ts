/**
 * Accounts Payable — Test Fixtures
 *
 * @module features/ap/fixtures/ap.fixture
 * @description Factory functions for AP domain entities.
 *              Each factory provides sensible defaults and accepts overrides.
 *
 * @see knowledge/constitution/DOMAIN.md — BC-AP definition
 */

import { OTHER_TENANT_ID, TEST_TENANT_ID, TEST_USER_ID } from '../../../lib/test-utils';

// ─── Vendor Fixtures ─────────────────────────────────────────────────────

export const createVendorFixture = (overrides = {}) => ({
  id: 'vendor-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  code: 'VEND-001',
  name: 'Acme Supplies',
  taxId: 'TAX-123456789',
  email: 'billing@acme.com',
  phone: '+1-555-0100',
  addressLine1: '100 Main St',
  addressLine2: null,
  city: 'Springfield',
  state: 'IL',
  postalCode: '62701',
  country: 'US',
  paymentTerms: 'net_30',
  currency: 'USD',
  isActive: true,
  createdBy: TEST_USER_ID,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createInactiveVendorFixture = (overrides = {}) =>
  createVendorFixture({ isActive: false, code: 'VEND-002', name: 'Inactive Corp', ...overrides });

export const createVendorInputFixture = (overrides = {}) => ({
  name: 'Acme Supplies',
  code: 'VEND-001',
  taxId: 'TAX-123456789',
  email: 'billing@acme.com',
  phone: '+1-555-0100',
  paymentTerms: 'net_30',
  currency: 'USD',
  isActive: true,
  ...overrides,
});

// ─── Bill Fixtures ───────────────────────────────────────────────────────

export const createBillFixture = (overrides = {}) => ({
  id: 'bill-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  vendorId: 'vendor-00000000-0000-0000-000000000001',
  billNumber: 'BILL-001',
  billDate: '2026-07-01',
  dueDate: '2026-07-31',
  purchaseOrderId: null,
  subtotal: '100.0000',
  taxAmount: '10.0000',
  totalAmount: '110.0000',
  currency: 'USD',
  status: 'draft' as const,
  notes: null,
  createdBy: TEST_USER_ID,
  createdAt: new Date('2026-07-01'),
  updatedAt: new Date('2026-07-01'),
  deletedAt: null,
  ...overrides,
});

export const createDraftBillFixture = (overrides = {}) =>
  createBillFixture({ status: 'draft' as const, ...overrides });

export const createPendingApprovalBillFixture = (overrides = {}) =>
  createBillFixture({ status: 'pending_approval' as const, ...overrides });

export const createApprovedBillFixture = (overrides = {}) =>
  createBillFixture({ status: 'approved' as const, ...overrides });

export const createPartiallyPaidBillFixture = (overrides = {}) =>
  createBillFixture({ status: 'partially_paid' as const, ...overrides });

export const createPaidBillFixture = (overrides = {}) =>
  createBillFixture({ status: 'paid' as const, ...overrides });

export const createVoidedBillFixture = (overrides = {}) =>
  createBillFixture({ status: 'voided' as const, ...overrides });

export const createBillWithPOFixture = (overrides = {}) =>
  createBillFixture({
    purchaseOrderId: 'po-00000000-0000-0000-000000000001',
    ...overrides,
  });

export const createBillInputFixture = (overrides = {}) => ({
  vendorId: 'vendor-00000000-0000-0000-000000000001',
  billNumber: 'BILL-001',
  billDate: '2026-07-01',
  dueDate: '2026-07-31',
  subtotal: '100.0000',
  taxAmount: '10.0000',
  totalAmount: '110.0000',
  currency: 'USD',
  ...overrides,
});

// ─── Bill Line Item Fixtures ─────────────────────────────────────────────

export const createBillLineItemFixture = (overrides = {}) => ({
  id: 'bli-00000000-0000-0000-000000000001',
  billId: 'bill-00000000-0000-0000-000000000001',
  description: 'Widget A',
  quantity: '10',
  unitPrice: '10.0000',
  amount: '100.0000',
  taxRate: '10',
  taxAmount: '10.0000',
  sortOrder: 0,
  createdAt: new Date('2026-07-01'),
  updatedAt: new Date('2026-07-01'),
  deletedAt: null,
  ...overrides,
});

export const createSecondBillLineItemFixture = (overrides = {}) =>
  createBillLineItemFixture({
    id: 'bli-00000000-0000-0000-000000000002',
    description: 'Widget B',
    quantity: '5',
    unitPrice: '20.0000',
    amount: '100.0000',
    taxRate: '10',
    taxAmount: '10.0000',
    sortOrder: 1,
    ...overrides,
  });

export const createBillLineItemInputFixture = (overrides = {}) => ({
  description: 'Widget A',
  quantity: '10',
  unitPrice: '10.0000',
  amount: '100.0000',
  taxRate: '10',
  taxAmount: '10.0000',
  sortOrder: 0,
  ...overrides,
});

// ─── Vendor Payment Fixtures ─────────────────────────────────────────────

export const createVendorPaymentFixture = (overrides = {}) => ({
  id: 'vp-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  vendorId: 'vendor-00000000-0000-0000-000000000001',
  billId: 'bill-00000000-0000-0000-000000000001',
  amount: '50.0000',
  paymentDate: '2026-07-15',
  paymentMethod: 'bank_transfer',
  referenceNumber: 'TXN-001',
  bankAccountId: 'bank-00000000-0000-0000-000000000001',
  currency: 'USD',
  notes: null,
  createdBy: TEST_USER_ID,
  createdAt: new Date('2026-07-15'),
  updatedAt: new Date('2026-07-15'),
  deletedAt: null,
  ...overrides,
});

export const createVendorPaymentInputFixture = (overrides = {}) => ({
  vendorId: 'vendor-00000000-0000-0000-000000000001',
  billId: 'bill-00000000-0000-0000-000000000001',
  amount: '50.0000',
  paymentDate: '2026-07-15',
  paymentMethod: 'bank_transfer',
  referenceNumber: 'TXN-001',
  currency: 'USD',
  ...overrides,
});

// ─── Cross-Tenant Fixtures ───────────────────────────────────────────────

export const createOtherTenantVendorFixture = (overrides = {}) =>
  createVendorFixture({
    id: 'vendor-00000000-0000-0000-000000000099',
    tenantId: OTHER_TENANT_ID,
    code: 'VEND-999',
    name: 'Other Tenant Vendor',
    ...overrides,
  });

export const createOtherTenantBillFixture = (overrides = {}) =>
  createBillFixture({
    id: 'bill-00000000-0000-0000-000000000099',
    tenantId: OTHER_TENANT_ID,
    billNumber: 'BILL-999',
    ...overrides,
  });
