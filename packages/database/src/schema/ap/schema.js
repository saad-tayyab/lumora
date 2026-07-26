import { boolean, date, decimal, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar, } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';
import { auditFields, createdByFields, softDeleteFields, tenantFields } from '../common/audit';
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
export const vendors = pgTable('vendors', {
    ...auditFields,
    ...tenantFields,
    ...createdByFields,
    ...softDeleteFields,
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
}, (table) => [
    uniqueIndex('vendors_tenant_id_code_unique').on(table.tenantId, table.code),
    uniqueIndex('vendors_tenant_id_name_unique').on(table.tenantId, table.name),
]);
export const bills = pgTable('bills', {
    ...auditFields,
    ...tenantFields,
    ...createdByFields,
    ...softDeleteFields,
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
}, (table) => [
    uniqueIndex('bills_vendor_id_bill_number_unique').on(table.vendorId, table.billNumber),
    index('idx_bills_status').on(table.status),
    index('idx_bills_due_date').on(table.dueDate),
]);
export const billLineItems = pgTable('bill_line_items', {
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
}, (table) => [index('idx_bill_line_items_bill_id').on(table.billId)]);
export const vendorPayments = pgTable('vendor_payments', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    vendorId: uuid('vendor_id').notNull().references(() => vendors.id),
    billId: uuid('bill_id').references(() => bills.id),
    amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
    paymentDate: timestamp('payment_date').notNull(),
    paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
    referenceNumber: varchar('reference_number', { length: 100 }),
    bankAccountId: uuid('bank_account_id'),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    notes: text('notes'),
}, (table) => [
    index('idx_vendor_payments_vendor_id').on(table.vendorId),
    index('idx_vendor_payments_bill_id').on(table.billId),
    index('idx_vendor_payments_payment_date').on(table.paymentDate),
]);
export const paymentSchedules = pgTable('payment_schedules', {
    ...auditFields,
    ...tenantFields,
    billId: uuid('bill_id')
        .notNull()
        .references(() => bills.id),
    dueDate: timestamp('due_date').notNull(),
    amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
}, (table) => [
    index('idx_payment_schedules_bill_id').on(table.billId),
    index('idx_payment_schedules_due_date').on(table.dueDate),
]);
// =============================================================================
// Zod Schemas — Insert
// =============================================================================
export const insertVendorSchema = createInsertSchema(vendors, {
    name: (schema) => schema.min(1).max(200),
    code: (schema) => schema.min(1).max(20),
    email: (schema) => schema.email().optional(),
});
export const insertBillSchema = createInsertSchema(bills, {
    billNumber: (schema) => schema.min(1).max(50),
});
export const insertBillLineItemSchema = createInsertSchema(billLineItems);
export const insertVendorPaymentSchema = createInsertSchema(vendorPayments);
export const insertPaymentScheduleSchema = createInsertSchema(paymentSchedules);
// =============================================================================
// Zod Schemas — Select
// =============================================================================
export const selectVendorSchema = createSelectSchema(vendors);
export const selectBillSchema = createSelectSchema(bills);
export const selectBillLineItemSchema = createSelectSchema(billLineItems);
export const selectVendorPaymentSchema = createSelectSchema(vendorPayments);
export const selectPaymentScheduleSchema = createSelectSchema(paymentSchedules);
// =============================================================================
// Zod Schemas — Update
// =============================================================================
export const updateVendorSchema = createUpdateSchema(vendors);
export const updateBillSchema = createUpdateSchema(bills);
export const updateBillLineItemSchema = createUpdateSchema(billLineItems);
export const updateVendorPaymentSchema = createUpdateSchema(vendorPayments);
export const updatePaymentScheduleSchema = createUpdateSchema(paymentSchedules);
