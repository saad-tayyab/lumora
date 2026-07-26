import { boolean, date, decimal, index, pgTable, text, uuid, varchar, } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';
import { auditFields, softDeleteFields, tenantFields } from '../common/audit';
// ─── Tables ───────────────────────────────────────────────────────────────────
export const budgetHeaders = pgTable('budget_headers', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    periodStart: date('period_start').notNull(),
    periodEnd: date('period_end').notNull(),
    totalAmount: decimal('total_amount', { precision: 19, scale: 4 }).notNull().default('0'),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    isActive: boolean('is_active').notNull().default(true),
}, (table) => [
    index('idx_budget_headers_tenant_id').on(table.tenantId),
    index('idx_budget_headers_period_start').on(table.periodStart),
    index('idx_budget_headers_status').on(table.status),
]);
export const budgetLines = pgTable('budget_lines', {
    ...auditFields,
    ...tenantFields,
    budgetHeaderId: uuid('budget_header_id')
        .notNull()
        .references(() => budgetHeaders.id, { onDelete: 'cascade' }),
    glAccountId: uuid('gl_account_id').notNull(),
    description: varchar('description', { length: 200 }),
    budgetAmount: decimal('budget_amount', { precision: 19, scale: 4 }).notNull().default('0'),
    consumedAmount: decimal('consumed_amount', { precision: 19, scale: 4 }).notNull().default('0'),
    varianceAmount: decimal('variance_amount', { precision: 19, scale: 4 }).notNull().default('0'),
    isActive: boolean('is_active').notNull().default(true),
}, (table) => [
    index('idx_budget_lines_budget_header_id').on(table.budgetHeaderId),
    index('idx_budget_lines_gl_account_id').on(table.glAccountId),
    index('idx_budget_lines_tenant_id').on(table.tenantId),
]);
export const budgetConsumptions = pgTable('budget_consumptions', {
    ...auditFields,
    ...tenantFields,
    budgetLineId: uuid('budget_line_id')
        .notNull()
        .references(() => budgetLines.id),
    journalEntryId: uuid('journal_entry_id'),
    amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
    description: text('description'),
    consumptionDate: date('consumption_date').notNull(),
}, (table) => [
    index('idx_budget_consumptions_budget_line_id').on(table.budgetLineId),
    index('idx_budget_consumptions_tenant_id').on(table.tenantId),
]);
// ─── Zod Schemas ──────────────────────────────────────────────────────────────
export const insertBudgetHeaderSchema = createInsertSchema(budgetHeaders, {
    name: (schema) => schema.min(1).max(100),
});
export const selectBudgetHeaderSchema = createSelectSchema(budgetHeaders);
export const updateBudgetHeaderSchema = createUpdateSchema(budgetHeaders);
export const insertBudgetLineSchema = createInsertSchema(budgetLines);
export const selectBudgetLineSchema = createSelectSchema(budgetLines);
export const updateBudgetLineSchema = createUpdateSchema(budgetLines);
export const insertBudgetConsumptionSchema = createInsertSchema(budgetConsumptions);
export const selectBudgetConsumptionSchema = createSelectSchema(budgetConsumptions);
