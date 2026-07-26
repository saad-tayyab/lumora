import { boolean, date, decimal, index, integer, pgEnum, pgTable, text, uuid, varchar, } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';
import { auditFields, softDeleteFields, tenantFields } from '../common/audit';
// ─── Enums ────────────────────────────────────────────────────────────────────
export const taxTypeEnum = pgEnum('tax_type', [
    'sales_tax',
    'vat',
    'gst',
    'excise',
    'withholding',
]);
export const taxPostingRuleEnum = pgEnum('tax_posting_rule', [
    'output_liability',
    'input_asset',
    'expense',
]);
// ─── Tables ───────────────────────────────────────────────────────────────────
export const taxCodes = pgTable('tax_codes', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    code: varchar('code', { length: 20 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    type: taxTypeEnum('type').notNull(),
    glAccountId: uuid('gl_account_id').notNull(),
    isClaimable: boolean('is_claimable').notNull().default(false),
    postingRule: taxPostingRuleEnum('posting_rule').notNull().default('output_liability'),
    isActive: boolean('is_active').notNull().default(true),
    description: text('description'),
}, (table) => [
    index('idx_tax_codes_tenant_id').on(table.tenantId),
    index('idx_tax_codes_code').on(table.code),
    index('idx_tax_codes_type').on(table.type),
]);
export const taxRates = pgTable('tax_rates', {
    ...auditFields,
    ...tenantFields,
    taxCodeId: uuid('tax_code_id')
        .notNull()
        .references(() => taxCodes.id),
    rate: decimal('rate', { precision: 7, scale: 4 }).notNull(),
    effectiveDate: date('effective_date').notNull(),
    expiryDate: date('expiry_date'),
    description: text('description'),
    isActive: boolean('is_active').notNull().default(true),
}, (table) => [
    index('idx_tax_rates_tax_code_id').on(table.taxCodeId),
    index('idx_tax_rates_effective_date').on(table.effectiveDate),
    index('idx_tax_rates_tenant_id').on(table.tenantId),
]);
export const taxAutoAssignmentRules = pgTable('tax_auto_assignment_rules', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    priority: integer('priority').notNull().default(0),
    taxCodeId: uuid('tax_code_id')
        .notNull()
        .references(() => taxCodes.id),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    entityCategoryId: uuid('entity_category_id'),
    customerGroupId: uuid('customer_group_id'),
    itemCategoryId: uuid('item_category_id'),
    regionCode: varchar('region_code', { length: 10 }),
    isActive: boolean('is_active').notNull().default(true),
}, (table) => [
    index('idx_tax_auto_assignment_rules_tenant_id').on(table.tenantId),
    index('idx_tax_auto_assignment_rules_priority').on(table.priority),
]);
// ─── Zod Schemas ──────────────────────────────────────────────────────────────
export const insertTaxCodeSchema = createInsertSchema(taxCodes, {
    code: (schema) => schema.min(1).max(20),
    name: (schema) => schema.min(1).max(100),
});
export const selectTaxCodeSchema = createSelectSchema(taxCodes);
export const updateTaxCodeSchema = createUpdateSchema(taxCodes);
export const insertTaxRateSchema = createInsertSchema(taxRates);
export const selectTaxRateSchema = createSelectSchema(taxRates);
export const updateTaxRateSchema = createUpdateSchema(taxRates);
export const insertTaxAutoAssignmentRuleSchema = createInsertSchema(taxAutoAssignmentRules, {
    name: (schema) => schema.min(1).max(100),
});
export const selectTaxAutoAssignmentRuleSchema = createSelectSchema(taxAutoAssignmentRules);
export const updateTaxAutoAssignmentRuleSchema = createUpdateSchema(taxAutoAssignmentRules);
