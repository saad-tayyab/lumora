import { TEST_TENANT_ID } from '../../../lib/test-utils';

// ─── Sales Order Fixtures ───────────────────────────────────────────────────

export const createSalesOrderFixture = (overrides = {}) => ({
  id: 'so-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  orderNumber: 'SO-2026-0001',
  customerId: 'customer-00000000-0000-0000-000000000001',
  status: 'draft' as const,
  orderDate: '2026-07-15',
  expectedDeliveryDate: '2026-08-15',
  subtotal: '100.0000',
  discountAmount: '0.0000',
  taxAmount: '0.0000',
  total: '100.0000',
  currency: 'USD',
  notes: 'Test sales order',
  createdAt: new Date('2026-07-15'),
  updatedAt: new Date('2026-07-15'),
  deletedAt: null,
  ...overrides,
});

export const createConfirmedSalesOrderFixture = (overrides = {}) =>
  createSalesOrderFixture({ status: 'confirmed', ...overrides });

export const createShippedSalesOrderFixture = (overrides = {}) =>
  createSalesOrderFixture({ status: 'shipped', ...overrides });

export const createDeliveredSalesOrderFixture = (overrides = {}) =>
  createSalesOrderFixture({ status: 'delivered', ...overrides });

export const createCancelledSalesOrderFixture = (overrides = {}) =>
  createSalesOrderFixture({ status: 'cancelled', ...overrides });

export const createClosedSalesOrderFixture = (overrides = {}) =>
  createSalesOrderFixture({ status: 'closed', ...overrides });

// ─── Sales Order Line Item Fixtures ─────────────────────────────────────────

export const createSalesOrderLineItemFixture = (overrides = {}) => ({
  id: 'sol-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  salesOrderId: 'so-00000000-0000-0000-000000000001',
  itemId: 'item-00000000-0000-0000-000000000001',
  description: 'Widget A',
  quantity: '10',
  unitPrice: '10.0000',
  discountPercent: null,
  discountAmount: '0.0000',
  taxRate: null,
  taxAmount: '0.0000',
  total: '100.0000',
  createdAt: new Date('2026-07-15'),
  updatedAt: new Date('2026-07-15'),
  deletedAt: null,
  ...overrides,
});

// ─── Quotation Fixtures ─────────────────────────────────────────────────────

export const createQuotationFixture = (overrides = {}) => ({
  id: 'qt-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  quotationNumber: 'QT-2026-0001',
  customerId: 'customer-00000000-0000-0000-000000000001',
  status: 'draft' as const,
  issueDate: '2026-07-15',
  expiryDate: '2026-08-14',
  validDays: 30,
  subtotal: '200.0000',
  discountAmount: '0.0000',
  taxAmount: '0.0000',
  total: '200.0000',
  currency: 'USD',
  notes: 'Test quotation',
  createdAt: new Date('2026-07-15'),
  updatedAt: new Date('2026-07-15'),
  deletedAt: null,
  ...overrides,
});

export const createSentQuotationFixture = (overrides = {}) =>
  createQuotationFixture({ status: 'sent', ...overrides });

export const createAcceptedQuotationFixture = (overrides = {}) =>
  createQuotationFixture({ status: 'accepted', ...overrides });

export const createExpiredQuotationFixture = (overrides = {}) =>
  createQuotationFixture({ status: 'expired', ...overrides });

export const createCancelledQuotationFixture = (overrides = {}) =>
  createQuotationFixture({ status: 'cancelled', ...overrides });

// ─── Quotation Line Item Fixtures ───────────────────────────────────────────

export const createQuotationLineItemFixture = (overrides = {}) => ({
  id: 'qtl-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  quotationId: 'qt-00000000-0000-0000-000000000001',
  itemId: 'item-00000000-0000-0000-000000000001',
  description: 'Service A',
  quantity: '5',
  unitPrice: '40.0000',
  discountPercent: null,
  discountAmount: '0.0000',
  taxRate: null,
  taxAmount: '0.0000',
  total: '200.0000',
  createdAt: new Date('2026-07-15'),
  updatedAt: new Date('2026-07-15'),
  deletedAt: null,
  ...overrides,
});

// ─── Discount Policy Fixtures ───────────────────────────────────────────────

export const createDiscountPolicyFixture = (overrides = {}) => ({
  id: 'dp-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  name: 'Bulk Discount',
  type: 'percentage' as const,
  value: '10.0000',
  minQuantity: '5',
  maxDiscountAmount: '50.0000',
  validFrom: '2026-01-01',
  validUntil: '2026-12-31',
  customerId: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createFixedAmountDiscountPolicyFixture = (overrides = {}) =>
  createDiscountPolicyFixture({
    name: 'Flat $20 Off',
    type: 'fixed_amount' as const,
    value: '20.0000',
    minQuantity: null,
    ...overrides,
  });

export const createTieredDiscountPolicyFixture = (overrides = {}) =>
  createDiscountPolicyFixture({
    name: 'Tiered Discount',
    type: 'tiered' as const,
    value: '15.0000',
    ...overrides,
  });

export const createCustomerSpecificDiscountPolicyFixture = (overrides = {}) =>
  createDiscountPolicyFixture({
    name: 'VIP Discount',
    customerId: 'customer-00000000-0000-0000-000000000001',
    ...overrides,
  });

// ─── Input Fixtures ─────────────────────────────────────────────────────────

export const createSalesOrderInputFixture = (overrides = {}) => ({
  orderNumber: 'SO-2026-0001',
  customerId: 'customer-00000000-0000-0000-000000000001',
  orderDate: '2026-07-15',
  expectedDeliveryDate: '2026-08-15',
  currency: 'USD',
  notes: 'Test sales order',
  lineItems: [
    {
      itemId: 'item-00000000-0000-0000-000000000001',
      description: 'Widget A',
      quantity: '10',
      unitPrice: '10.0000',
    },
  ],
  ...overrides,
});

export const createSalesOrderLineItemInputFixture = (overrides = {}) => ({
  itemId: 'item-00000000-0000-0000-000000000001',
  description: 'Widget A',
  quantity: '10',
  unitPrice: '10.0000',
  ...overrides,
});

export const createQuotationInputFixture = (overrides = {}) => ({
  quotationNumber: 'QT-2026-0001',
  customerId: 'customer-00000000-0000-0000-000000000001',
  issueDate: '2026-07-15',
  expiryDate: '2026-08-14',
  validDays: 30,
  currency: 'USD',
  notes: 'Test quotation',
  lineItems: [
    {
      itemId: 'item-00000000-0000-0000-000000000001',
      description: 'Service A',
      quantity: '5',
      unitPrice: '40.0000',
    },
  ],
  ...overrides,
});

export const createQuotationLineItemInputFixture = (overrides = {}) => ({
  itemId: 'item-00000000-0000-0000-000000000001',
  description: 'Service A',
  quantity: '5',
  unitPrice: '40.0000',
  ...overrides,
});

export const createDiscountPolicyInputFixture = (overrides = {}) => ({
  name: 'Bulk Discount',
  type: 'percentage' as const,
  value: '10.0000',
  minQuantity: '5',
  maxDiscountAmount: '50.0000',
  validFrom: '2026-01-01',
  validUntil: '2026-12-31',
  ...overrides,
});
