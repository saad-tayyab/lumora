import { boolean, date, decimal, index, pgEnum, pgTable, text, timestamp, uuid, varchar, } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';
import { auditFields, createdByFields, softDeleteFields, tenantFields } from '../common/audit';
// ─── Enums ────────────────────────────────────────────────────────────────────
export const accountTypeEnum = pgEnum('account_type', [
    'asset',
    'liability',
    'equity',
    'revenue',
    'expense',
]);
export const journalEntryStatusEnum = pgEnum('journal_entry_status', ['draft', 'posted', 'voided']);
// ─── Tables ───────────────────────────────────────────────────────────────────
export const accounts = pgTable('accounts', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    code: varchar('code', { length: 20 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    type: accountTypeEnum('type').notNull(),
    // biome-ignore lint/suspicious/noExplicitAny: Drizzle self-referencing FK requires any
    parentId: uuid('parent_id').references(() => accounts.id),
    balance: decimal('balance', { precision: 19, scale: 4 }).notNull().default('0'),
    isActive: boolean('is_active').notNull().default(true),
}, (table) => [
    index('idx_accounts_type').on(table.type),
    index('idx_accounts_parent_id').on(table.parentId),
    index('idx_accounts_is_active').on(table.isActive),
]);
export const journalEntries = pgTable('journal_entries', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    date: date('date').notNull(),
    description: text('description').notNull(),
    referenceNumber: varchar('reference_number', { length: 50 }),
    status: journalEntryStatusEnum('status').notNull().default('draft'),
    createdBy: createdByFields.createdBy,
}, (table) => [
    index('idx_journal_entries_date').on(table.date),
    index('idx_journal_entries_status').on(table.status),
    index('idx_journal_entries_created_by').on(table.createdBy),
]);
export const journalEntryLines = pgTable('journal_entry_lines', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    journalEntryId: uuid('journal_entry_id')
        .notNull()
        .references(() => journalEntries.id),
    accountId: uuid('account_id')
        .notNull()
        .references(() => accounts.id),
    debit: decimal('debit', { precision: 19, scale: 4 }).notNull().default('0'),
    credit: decimal('credit', { precision: 19, scale: 4 }).notNull().default('0'),
    description: text('description'),
}, (table) => [
    index('idx_journal_entry_lines_journal_entry_id').on(table.journalEntryId),
    index('idx_journal_entry_lines_account_id').on(table.accountId),
]);
export const fiscalYears = pgTable('fiscal_years', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    name: varchar('name', { length: 100 }).notNull(),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('open'),
}, (table) => [
    index('idx_fiscal_years_tenant_id').on(table.tenantId),
    index('idx_fiscal_years_status').on(table.status),
]);
// ─── Zod Schemas ──────────────────────────────────────────────────────────────
export const insertAccountSchema = createInsertSchema(accounts, {
    code: (schema) => schema.min(1).max(20),
    name: (schema) => schema.min(1).max(100),
});
export const selectAccountSchema = createSelectSchema(accounts);
export const insertJournalEntrySchema = createInsertSchema(journalEntries);
export const selectJournalEntrySchema = createSelectSchema(journalEntries);
export const insertJournalEntryLineSchema = createInsertSchema(journalEntryLines);
export const selectJournalEntryLineSchema = createSelectSchema(journalEntryLines);
export const insertFiscalYearSchema = createInsertSchema(fiscalYears, {
    name: (schema) => schema.min(1).max(100),
});
export const selectFiscalYearSchema = createSelectSchema(fiscalYears);
export const updateAccountSchema = createUpdateSchema(accounts);
export const updateJournalEntrySchema = createUpdateSchema(journalEntries);
export const updateJournalEntryLineSchema = createUpdateSchema(journalEntryLines);
export const updateFiscalYearSchema = createUpdateSchema(fiscalYears);
