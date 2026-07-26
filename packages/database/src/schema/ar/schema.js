import { boolean, date, decimal, index, integer, pgEnum, pgTable, text, uuid, varchar, } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';
import { auditFields, softDeleteFields, tenantFields } from '../common/audit';
import { bankAccounts } from '../cash/schema';
// ─── Enums ────────────────────────────────────────────────────────────────────
export const invoiceStatusEnum = pgEnum('invoice_status', [
    'draft',
    'sent',
    'paid',
    'overdue',
    'voided',
]);
export const paymentMethodEnum = pgEnum('payment_method', [
    'cash',
    'check',
    'bank_transfer',
    'credit_card',
    'online',
]);
export const creditNoteStatusEnum = pgEnum('credit_note_status', [
    'draft',
    'issued',
    'applied',
    'voided',
]);
// ─── Tables ───────────────────────────────────────────────────────────────────
export const customers = pgTable('customers', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    name: varchar('name', { length: 200 }).notNull(),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    addressLine1: varchar('address_line1', { length: 200 }),
    addressLine2: varchar('address_line2', { length: 200 }),
    city: varchar('city', { length: 100 }),
    state: varchar('state', { length: 100 }),
    postalCode: varchar('postal_code', { length: 20 }),
    country: varchar('country', { length: 3 }),
    paymentTerms: varchar('payment_terms', { length: 50 }).notNull().default('Net 30'),
    creditLimit: decimal('credit_limit', { precision: 19, scale: 4 }),
    isActive: boolean('is_active').notNull().default(true),
}, (table) => [
    index('idx_customers_name').on(table.name),
    index('idx_customers_email').on(table.email),
]);
export const invoices = pgTable('invoices', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    customerId: uuid('customer_id')
        .notNull()
        .references(() => customers.id),
    invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
    status: invoiceStatusEnum('status').notNull().default('draft'),
    issueDate: date('issue_date').notNull(),
    dueDate: date('due_date').notNull(),
    subtotal: decimal('subtotal', { precision: 19, scale: 4 }).notNull().default('0'),
    taxAmount: decimal('tax_amount', { precision: 19, scale: 4 }).notNull().default('0'),
    totalAmount: decimal('total_amount', { precision: 19, scale: 4 }).notNull().default('0'),
    amountPaid: decimal('amount_paid', { precision: 19, scale: 4 }).notNull().default('0'),
    balanceDue: decimal('balance_due', { precision: 19, scale: 4 }).notNull().default('0'),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    notes: text('notes'),
}, (table) => [
    index('idx_invoices_customer_id').on(table.customerId),
    index('idx_invoices_status').on(table.status),
    index('idx_invoices_issue_date').on(table.issueDate),
    index('idx_invoices_due_date').on(table.dueDate),
]);
export const invoiceLineItems = pgTable('invoice_line_items', {
    ...auditFields,
    ...tenantFields,
    invoiceId: uuid('invoice_id')
        .notNull()
        .references(() => invoices.id, { onDelete: 'cascade' }),
    description: varchar('description', { length: 500 }).notNull(),
    quantity: decimal('quantity', { precision: 10, scale: 4 }).notNull().default('1'),
    unitPrice: decimal('unit_price', { precision: 19, scale: 4 }).notNull().default('0'),
    amount: decimal('amount', { precision: 19, scale: 4 }).notNull().default('0'),
    taxRate: decimal('tax_rate', { precision: 5, scale: 4 }),
    taxAmount: decimal('tax_amount', { precision: 19, scale: 4 }),
    sortOrder: integer('sort_order').notNull().default(0),
}, (table) => [index('idx_invoice_line_items_invoice_id').on(table.invoiceId)]);
export const payments = pgTable('payments', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    customerId: uuid('customer_id')
        .notNull()
        .references(() => customers.id),
    paymentNumber: varchar('payment_number', { length: 50 }).notNull().unique(),
    paymentDate: date('payment_date').notNull(),
    amount: decimal('amount', { precision: 19, scale: 4 }).notNull().default('0'),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    referenceNumber: varchar('reference_number', { length: 100 }),
    bankAccountId: uuid('bank_account_id').references(() => bankAccounts.id),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    notes: text('notes'),
}, (table) => [
    index('idx_payments_customer_id').on(table.customerId),
    index('idx_payments_payment_date').on(table.paymentDate),
    index('idx_payments_payment_method').on(table.paymentMethod),
]);
export const paymentApplications = pgTable('payment_applications', {
    ...auditFields,
    ...tenantFields,
    paymentId: uuid('payment_id')
        .notNull()
        .references(() => payments.id),
    invoiceId: uuid('invoice_id')
        .notNull()
        .references(() => invoices.id),
    amountApplied: decimal('amount_applied', { precision: 19, scale: 4 }).notNull().default('0'),
    appliedDate: date('applied_date').notNull(),
}, (table) => [
    index('idx_payment_applications_payment_id').on(table.paymentId),
    index('idx_payment_applications_invoice_id').on(table.invoiceId),
]);
export const creditNotes = pgTable('credit_notes', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    customerId: uuid('customer_id')
        .notNull()
        .references(() => customers.id),
    creditNoteNumber: varchar('credit_note_number', { length: 50 }).notNull().unique(),
    status: creditNoteStatusEnum('status').notNull().default('draft'),
    issueDate: date('issue_date').notNull(),
    reason: varchar('reason', { length: 500 }).notNull(),
    amount: decimal('amount', { precision: 19, scale: 4 }).notNull().default('0'),
    amountApplied: decimal('amount_applied', { precision: 19, scale: 4 }).notNull().default('0'),
    balance: decimal('balance', { precision: 19, scale: 4 }).notNull().default('0'),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    notes: text('notes'),
}, (table) => [
    index('idx_credit_notes_customer_id').on(table.customerId),
    index('idx_credit_notes_status').on(table.status),
]);
// ─── Zod Schemas ──────────────────────────────────────────────────────────────
export const insertCustomerSchema = createInsertSchema(customers, {
    name: (schema) => schema.min(1).max(200),
    email: (schema) => schema.email().optional(),
});
export const selectCustomerSchema = createSelectSchema(customers);
export const insertInvoiceSchema = createInsertSchema(invoices, {
    invoiceNumber: (schema) => schema.min(1).max(50),
});
export const selectInvoiceSchema = createSelectSchema(invoices);
export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems);
export const selectInvoiceLineItemSchema = createSelectSchema(invoiceLineItems);
export const insertPaymentSchema = createInsertSchema(payments, {
    paymentNumber: (schema) => schema.min(1).max(50),
});
export const selectPaymentSchema = createSelectSchema(payments);
export const insertPaymentApplicationSchema = createInsertSchema(paymentApplications);
export const selectPaymentApplicationSchema = createSelectSchema(paymentApplications);
export const insertCreditNoteSchema = createInsertSchema(creditNotes, {
    creditNoteNumber: (schema) => schema.min(1).max(50),
    reason: (schema) => schema.min(1).max(500),
});
export const selectCreditNoteSchema = createSelectSchema(creditNotes);
export const updateCustomerSchema = createUpdateSchema(customers);
export const updateInvoiceSchema = createUpdateSchema(invoices);
export const updateInvoiceLineItemSchema = createUpdateSchema(invoiceLineItems);
export const updatePaymentSchema = createUpdateSchema(payments);
export const updatePaymentApplicationSchema = createUpdateSchema(paymentApplications);
export const updateCreditNoteSchema = createUpdateSchema(creditNotes);
