import {
  date,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';

import { auditFields, createdByFields, tenantFields } from '../common/audit';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const poStatusEnum = pgEnum('po_status', [
  'draft',
  'pending_approval',
  'approved',
  'partially_received',
  'fully_received',
  'closed',
  'cancelled',
]);

export const receivingReportStatusEnum = pgEnum('receiving_report_status', [
  'draft',
  'confirmed',
  'rejected',
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const purchaseOrders = pgTable(
  'purchase_orders',
  {
    ...auditFields,
    ...tenantFields,
    poNumber: varchar('po_number', { length: 30 }).notNull().unique(),
    vendorId: uuid('vendor_id').notNull(),
    status: poStatusEnum('status').notNull().default('draft'),
    orderDate: date('order_date').notNull(),
    expectedDeliveryDate: date('expected_delivery_date'),
    shippingAddressLine1: varchar('shipping_address_line1', { length: 200 }).notNull(),
    shippingAddressLine2: varchar('shipping_address_line2', { length: 200 }),
    shippingCity: varchar('shipping_city', { length: 100 }).notNull(),
    shippingState: varchar('shipping_state', { length: 100 }).notNull(),
    shippingPostalCode: varchar('shipping_postal_code', { length: 20 }).notNull(),
    shippingCountry: varchar('shipping_country', { length: 3 }).notNull().default('USD'),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    subtotal: decimal('subtotal', { precision: 19, scale: 4 }).notNull().default('0'),
    taxAmount: decimal('tax_amount', { precision: 19, scale: 4 }).notNull().default('0'),
    total: decimal('total', { precision: 19, scale: 4 }).notNull().default('0'),
    paymentTerms: varchar('payment_terms', { length: 50 }).notNull(),
    notes: text('notes'),
    ...createdByFields,
    approvedBy: uuid('approved_by'),
    approvedAt: timestamp('approved_at'),
  },
  (table) => [
    index('idx_purchase_orders_vendor_id').on(table.vendorId),
    index('idx_purchase_orders_status').on(table.status),
    index('idx_purchase_orders_order_date').on(table.orderDate),
  ],
);

export const poLineItems = pgTable(
  'po_line_items',
  {
    ...auditFields,
    poId: uuid('po_id')
      .notNull()
      .references(() => purchaseOrders.id, { onDelete: 'cascade' }),
    lineNumber: integer('line_number').notNull(),
    itemId: uuid('item_id').notNull(),
    description: varchar('description', { length: 500 }).notNull(),
    quantity: decimal('quantity', { precision: 19, scale: 4 }).notNull().default('1'),
    unitOfMeasure: varchar('unit_of_measure', { length: 20 }).notNull(),
    unitPrice: decimal('unit_price', { precision: 19, scale: 4 }).notNull().default('0'),
    amount: decimal('amount', { precision: 19, scale: 4 }).notNull().default('0'),
    taxRate: decimal('tax_rate', { precision: 5, scale: 4 }),
    taxAmount: decimal('tax_amount', { precision: 19, scale: 4 }),
    receivedQuantity: decimal('received_quantity', { precision: 19, scale: 4 })
      .notNull()
      .default('0'),
    notes: text('notes'),
  },
  (table) => [
    index('idx_po_line_items_po_id').on(table.poId),
    index('idx_po_line_items_item_id').on(table.itemId),
  ],
);

export const receivingReports = pgTable(
  'receiving_reports',
  {
    ...auditFields,
    ...tenantFields,
    rrNumber: varchar('rr_number', { length: 30 }).notNull().unique(),
    poId: uuid('po_id')
      .notNull()
      .references(() => purchaseOrders.id),
    vendorId: uuid('vendor_id').notNull(),
    receivedDate: date('received_date').notNull(),
    receivedBy: uuid('received_by').notNull(),
    warehouseId: uuid('warehouse_id').notNull(),
    status: receivingReportStatusEnum('status').notNull().default('draft'),
    notes: text('notes'),
  },
  (table) => [
    index('idx_receiving_reports_po_id').on(table.poId),
    index('idx_receiving_reports_vendor_id').on(table.vendorId),
    index('idx_receiving_reports_received_date').on(table.receivedDate),
  ],
);

export const vendorCatalogItems = pgTable(
  'vendor_catalog_items',
  {
    ...auditFields,
    vendorId: uuid('vendor_id').notNull(),
    vendorItemCode: varchar('vendor_item_code', { length: 50 }).notNull(),
    internalItemId: uuid('internal_item_id'),
    description: varchar('description', { length: 500 }).notNull(),
    unitPrice: decimal('unit_price', { precision: 19, scale: 4 }).notNull().default('0'),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    unitOfMeasure: varchar('unit_of_measure', { length: 20 }).notNull(),
    leadTimeDays: integer('lead_time_days'),
    minimumOrderQuantity: decimal('minimum_order_quantity', { precision: 19, scale: 4 }),
    effectiveDate: date('effective_date').notNull(),
    expiryDate: date('expiry_date'),
  },
  (table) => [
    uniqueIndex('idx_vendor_catalog_items_vendor_code').on(table.vendorId, table.vendorItemCode),
  ],
);

// ─── Zod Schemas — Insert ─────────────────────────────────────────────────────

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders);
export const insertPoLineItemSchema = createInsertSchema(poLineItems);
export const insertReceivingReportSchema = createInsertSchema(receivingReports);
export const insertVendorCatalogItemSchema = createInsertSchema(vendorCatalogItems);

// ─── Zod Schemas — Select ─────────────────────────────────────────────────────

export const selectPurchaseOrderSchema = createSelectSchema(purchaseOrders);
export const selectPoLineItemSchema = createSelectSchema(poLineItems);
export const selectReceivingReportSchema = createSelectSchema(receivingReports);
export const selectVendorCatalogItemSchema = createSelectSchema(vendorCatalogItems);

// ─── Zod Schemas — Update ─────────────────────────────────────────────────────

export const updatePurchaseOrderSchema = createUpdateSchema(purchaseOrders);
export const updatePoLineItemSchema = createUpdateSchema(poLineItems);
export const updateReceivingReportSchema = createUpdateSchema(receivingReports);
export const updateVendorCatalogItemSchema = createUpdateSchema(vendorCatalogItems);

// ─── Types ────────────────────────────────────────────────────────────────────

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type NewPurchaseOrder = typeof purchaseOrders.$inferInsert;

export type PoLineItem = typeof poLineItems.$inferSelect;
export type NewPoLineItem = typeof poLineItems.$inferInsert;

export type ReceivingReport = typeof receivingReports.$inferSelect;
export type NewReceivingReport = typeof receivingReports.$inferInsert;

export type VendorCatalogItem = typeof vendorCatalogItems.$inferSelect;
export type NewVendorCatalogItem = typeof vendorCatalogItems.$inferInsert;
