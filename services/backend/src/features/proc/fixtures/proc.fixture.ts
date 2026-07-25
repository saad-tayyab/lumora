import { TEST_TENANT_ID, TEST_USER_ID } from '../../../lib/test-utils';

// ─── Purchase Order Fixtures ─────────────────────────────────────────────

export const createPurchaseOrderFixture = (overrides = {}) => ({
  id: 'po-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  vendorId: 'vendor-00000000-0000-0000-000000000001',
  poNumber: 'PO-2026-0001',
  orderDate: '2026-07-15',
  expectedDeliveryDate: '2026-08-15',
  shippingAddressLine1: '123 Warehouse Blvd',
  shippingAddressLine2: 'Suite 100',
  shippingCity: 'Springfield',
  shippingState: 'IL',
  shippingPostalCode: '62704',
  shippingCountry: 'US',
  currency: 'USD',
  paymentTerms: 'net_30',
  notes: 'Test purchase order',
  status: 'draft' as const,
  subtotal: '0',
  taxAmount: '0',
  total: '0',
  createdBy: TEST_USER_ID,
  approvedBy: null,
  approvedAt: null,
  createdAt: new Date('2026-07-15'),
  updatedAt: new Date('2026-07-15'),
  deletedAt: null,
  ...overrides,
});

// ─── PO Line Item Fixtures ───────────────────────────────────────────────

export const createPoLineItemFixture = (overrides = {}) => ({
  id: 'poli-00000000-0000-0000-000000000001',
  poId: 'po-00000000-0000-0000-000000000001',
  lineNumber: 1,
  itemId: 'item-00000000-0000-0000-000000000001',
  description: 'Widget A',
  quantity: '10',
  unitOfMeasure: 'ea',
  unitPrice: '25.00',
  amount: '250.00',
  taxRate: '0.1000',
  taxAmount: '25.00',
  receivedQuantity: '0',
  notes: 'Test line item',
  createdAt: new Date('2026-07-15'),
  updatedAt: new Date('2026-07-15'),
  deletedAt: null,
  ...overrides,
});

// ─── Receiving Report Fixtures ───────────────────────────────────────────

export const createReceivingReportFixture = (overrides = {}) => ({
  id: 'rr-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  poId: 'po-00000000-0000-0000-000000000001',
  rrNumber: 'RR-2026-0001',
  vendorId: 'vendor-00000000-0000-0000-000000000001',
  receivedDate: '2026-07-20',
  receivedBy: TEST_USER_ID,
  warehouseId: 'wh-00000000-0000-0000-000000000001',
  notes: 'Test receiving report',
  status: 'draft' as const,
  createdAt: new Date('2026-07-20'),
  updatedAt: new Date('2026-07-20'),
  deletedAt: null,
  ...overrides,
});

// ─── Vendor Catalog Item Fixtures ────────────────────────────────────────

export const createVendorCatalogItemFixture = (overrides = {}) => ({
  id: 'vci-00000000-0000-0000-000000000001',
  vendorId: 'vendor-00000000-0000-0000-000000000001',
  vendorItemCode: 'VND-WIDGET-A',
  internalItemId: 'item-00000000-0000-0000-000000000001',
  description: 'Widget A from Vendor',
  unitPrice: '22.50',
  currency: 'USD',
  unitOfMeasure: 'ea',
  leadTimeDays: 14,
  minimumOrderQuantity: '5',
  effectiveDate: '2026-01-01',
  expiryDate: '2026-12-31',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

// ─── Input Fixtures ───────────────────────────────────────────────────────

export const createPurchaseOrderInputFixture = (overrides = {}) => ({
  vendorId: 'vendor-00000000-0000-0000-000000000001',
  poNumber: 'PO-2026-0001',
  orderDate: '2026-07-15',
  expectedDeliveryDate: '2026-08-15',
  shippingAddressLine1: '123 Warehouse Blvd',
  shippingAddressLine2: 'Suite 100',
  shippingCity: 'Springfield',
  shippingState: 'IL',
  shippingPostalCode: '62704',
  shippingCountry: 'US',
  currency: 'USD',
  paymentTerms: 'net_30',
  notes: 'Test purchase order',
  ...overrides,
});

export const createPoLineItemInputFixture = (overrides = {}) => ({
  itemId: 'item-00000000-0000-0000-000000000001',
  description: 'Widget A',
  quantity: '10',
  unitOfMeasure: 'ea',
  unitPrice: '25.00',
  amount: '250.00',
  taxRate: '0.1000',
  taxAmount: '25.00',
  notes: 'Test line item',
  ...overrides,
});

export const createReceivingReportInputFixture = (overrides = {}) => ({
  poId: 'po-00000000-0000-0000-000000000001',
  rrNumber: 'RR-2026-0001',
  vendorId: 'vendor-00000000-0000-0000-000000000001',
  receivedDate: '2026-07-20',
  receivedBy: TEST_USER_ID,
  warehouseId: 'wh-00000000-0000-0000-000000000001',
  notes: 'Test receiving report',
  ...overrides,
});

export const createVendorCatalogItemInputFixture = (overrides = {}) => ({
  vendorId: 'vendor-00000000-0000-0000-000000000001',
  vendorItemCode: 'VND-WIDGET-A',
  internalItemId: 'item-00000000-0000-0000-000000000001',
  description: 'Widget A from Vendor',
  unitPrice: '22.50',
  currency: 'USD',
  unitOfMeasure: 'ea',
  leadTimeDays: 14,
  minimumOrderQuantity: '5',
  effectiveDate: '2026-01-01',
  expiryDate: '2026-12-31',
  ...overrides,
});
