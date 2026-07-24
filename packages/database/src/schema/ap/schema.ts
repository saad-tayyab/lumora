import {
  boolean,
  date,
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';
import { auditFields, createdByFields, tenantFields } from '../common/audit';

// =============================================================================
// Enums
// =============================================================================

export const billStatusEnum = pgEnum('bill_status', [
  'draft',
  'pending_approval',
  'approved',
  'partially_paid',
  'paid',
  'voided',
]);

// =============================================================================
// Tables
// =============================================================================

export const vendors = pgTable(
  'vendors',
  {
    ...auditFields,
    ...tenantFields,
    ...createdByFields,
    name: varchar('name', { length: 200 }).notNull(),
    code: varchar('code', { length: 20 }).notNull(),
    taxId: varchar('tax_id', { length: 50 }),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 30 }),
    addressLine1: varchar('address_line1', { length: 200 }),
    addressLine2: varchar('address_line2', { length: 200 }),
    city: varchar('city', { length: 100 }),
    state: varchar('state', { length: 100 }),
    postalCode: varchar('postal_code', { length: 20 }),
    country: varchar('country', { length: 3 }),
    paymentTerms: varchar('payment_terms', { length: 50 }),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    isActive: boolean('is_active').notNull().default(true),
  },
  (table) => [
    uniqueIndex('vendors_tenant_id_code_unique').on(table.tenantId, table.code),
    uniqueIndex('vendors_tenant_id_name_unique').on(table.tenantId, table.name),
  ],
);

export const bills = pgTable(
  'bills',
  {
    ...auditFields,
    ...createdByFields,
    vendorId: uuid('vendor_id')
      .notNull()
      .references(() => vendors.id),
    billNumber: varchar('bill_number', { length: 50 }).notNull(),
    billDate: date('bill_date').notNull(),
    dueDate: date('due_date').notNull(),
    purchaseOrderId: uuid('purchase_order_id'),
    subtotal: decimal('subtotal', { precision: 19, scale: 4 }).notNull().default('0'),
    taxAmount: decimal('tax_amount', { precision: 19, scale: 4 }).notNull().default('0'),
    totalAmount: decimal('total_amount', { precision: 19, scale: 4 }).notNull().default('0'),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    status: billStatusEnum('status').notNull().default('draft'),
    notes: text('notes'),
  },
  (table) => [
    uniqueIndex('bills_vendor_id_bill_number_unique').on(table.vendorId, table.billNumber),
    uniqueIndex('idx_bills_status').on(table.status),
    uniqueIndex('idx_bills_due_date').on(table.dueDate),
  ],
);

export const billLineItems = pgTable(
  'bill_line_items',
  {
    ...auditFields,
    billId: uuid('bill_id')
      .notNull()
      .references(() => bills.id, { onDelete: 'cascade' }),
    description: varchar('description', { length: 500 }).notNull(),
    quantity: decimal('quantity', { precision: 10, scale: 4 }).notNull().default('1'),
    unitPrice: decimal('unit_price', { precision: 19, scale: 4 }).notNull().default('0'),
    amount: decimal('amount', { precision: 19, scale: 4 }).notNull().default('0'),
    taxRate: decimal('tax_rate', { precision: 5, scale: 4 }),
    taxAmount: decimal('tax_amount', { precision: 19, scale: 4 }),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [uniqueIndex('idx_bill_line_items_bill_id').on(table.billId)],
);

// =============================================================================
// Zod Schemas — Insert
// =============================================================================

export const insertVendorSchema = createInsertSchema(vendors);
export const insertBillSchema = createInsertSchema(bills);
export const insertBillLineItemSchema = createInsertSchema(billLineItems);

// =============================================================================
// Zod Schemas — Select
// =============================================================================

export const selectVendorSchema = createSelectSchema(vendors);
export const selectBillSchema = createSelectSchema(bills);
export const selectBillLineItemSchema = createSelectSchema(billLineItems);

// =============================================================================
// Zod Schemas — Update
// =============================================================================

export const updateVendorSchema = createUpdateSchema(vendors);
export const updateBillSchema = createUpdateSchema(bills);
export const updateBillLineItemSchema = createUpdateSchema(billLineItems);

export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;
export type Bill = typeof bills.$inferSelect;
export type NewBill = typeof bills.$inferInsert;
export type BillLineItem = typeof billLineItems.$inferSelect;
export type NewBillLineItem = typeof billLineItems.$inferInsert;
