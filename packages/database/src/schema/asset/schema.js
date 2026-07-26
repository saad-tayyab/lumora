import { boolean, date, decimal, index, integer, pgEnum, pgTable, text, uuid, varchar, } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';
import { auditFields, createdByFields, softDeleteFields, tenantFields } from '../common/audit';
// ─── Enums ────────────────────────────────────────────────────────────────────
export const depreciationMethodEnum = pgEnum('depreciation_method', [
    'straight_line',
    'declining_balance',
    'units_of_activity',
    'sum_of_years_digits',
]);
export const assetStatusEnum = pgEnum('asset_status', [
    'active',
    'fully_depreciated',
    'disposed',
    'under_construction',
]);
export const assetAdjustmentTypeEnum = pgEnum('asset_adjustment_type', [
    'revaluation',
    'impairment',
    'restoration',
    'transfer',
    'reclassification',
]);
export const adjustmentDirectionEnum = pgEnum('adjustment_direction', [
    'increase',
    'decrease',
]);
export const depreciationEntryStatusEnum = pgEnum('depreciation_entry_status', [
    'draft',
    'posted',
    'voided',
]);
// ─── Tables ───────────────────────────────────────────────────────────────────
export const assetCategories = pgTable('asset_categories', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    name: varchar('name', { length: 100 }).notNull(),
    code: varchar('code', { length: 20 }).notNull(),
    description: text('description'),
    defaultDepreciationMethod: depreciationMethodEnum('default_depreciation_method')
        .notNull()
        .default('straight_line'),
    defaultUsefulLifeMonths: integer('default_useful_life_months').notNull().default(60),
    defaultSalvageValuePercent: decimal('default_salvage_value_percent', {
        precision: 5,
        scale: 2,
    })
        .notNull()
        .default('0'),
    isDepreciable: boolean('is_depreciable').notNull().default(true),
    glAccountId: uuid('gl_account_id'),
    isActive: boolean('is_active').notNull().default(true),
}, (table) => [
    index('idx_asset_categories_tenant_id').on(table.tenantId),
    index('idx_asset_categories_code').on(table.code),
]);
export const fixedAssets = pgTable('fixed_assets', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    name: varchar('name', { length: 200 }).notNull(),
    assetNumber: varchar('asset_number', { length: 50 }).notNull(),
    description: text('description'),
    categoryId: uuid('category_id')
        .notNull()
        .references(() => assetCategories.id),
    acquisitionDate: date('acquisition_date').notNull(),
    acquisitionCost: decimal('acquisition_cost', { precision: 19, scale: 4 }).notNull().default('0'),
    salvageValue: decimal('salvage_value', { precision: 19, scale: 4 }).notNull().default('0'),
    usefulLifeMonths: integer('useful_life_months').notNull().default(60),
    depreciationMethod: depreciationMethodEnum('depreciation_method')
        .notNull()
        .default('straight_line'),
    status: assetStatusEnum('status').notNull().default('active'),
    accumulatedDepreciation: decimal('accumulated_depreciation', {
        precision: 19,
        scale: 4,
    })
        .notNull()
        .default('0'),
    netBookValue: decimal('net_book_value', { precision: 19, scale: 4 }).notNull().default('0'),
    glAccountId: uuid('gl_account_id'),
    isDepreciable: boolean('is_depreciable').notNull().default(true),
    disposalDate: date('disposal_date'),
    disposalProceeds: decimal('disposal_proceeds', { precision: 19, scale: 4 }),
    ...createdByFields,
}, (table) => [
    index('idx_fixed_assets_tenant_id').on(table.tenantId),
    index('idx_fixed_assets_category_id').on(table.categoryId),
    index('idx_fixed_assets_status').on(table.status),
    index('idx_fixed_assets_asset_number').on(table.assetNumber),
]);
export const depreciationSchedules = pgTable('depreciation_schedules', {
    ...auditFields,
    ...tenantFields,
    assetId: uuid('asset_id')
        .notNull()
        .references(() => fixedAssets.id),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    totalDepreciableCost: decimal('total_depreciable_cost', {
        precision: 19,
        scale: 4,
    }).notNull(),
    monthlyAmount: decimal('monthly_amount', { precision: 19, scale: 4 }).notNull(),
    method: depreciationMethodEnum('method').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('active'),
}, (table) => [
    index('idx_depreciation_schedules_asset_id').on(table.assetId),
    index('idx_depreciation_schedules_tenant_id').on(table.tenantId),
]);
export const depreciationEntries = pgTable('depreciation_entries', {
    ...auditFields,
    ...tenantFields,
    assetId: uuid('asset_id')
        .notNull()
        .references(() => fixedAssets.id),
    scheduleId: uuid('schedule_id').references(() => depreciationSchedules.id),
    periodStartDate: date('period_start_date').notNull(),
    periodEndDate: date('period_end_date').notNull(),
    depreciationAmount: decimal('depreciation_amount', { precision: 19, scale: 4 }).notNull(),
    accumulatedDepreciation: decimal('accumulated_depreciation', {
        precision: 19,
        scale: 4,
    }).notNull(),
    netBookValue: decimal('net_book_value', { precision: 19, scale: 4 }).notNull(),
    journalEntryId: uuid('journal_entry_id'),
    status: depreciationEntryStatusEnum('status').notNull().default('draft'),
    ...createdByFields,
}, (table) => [
    index('idx_depreciation_entries_asset_id').on(table.assetId),
    index('idx_depreciation_entries_schedule_id').on(table.scheduleId),
    index('idx_depreciation_entries_tenant_id').on(table.tenantId),
    index('idx_depreciation_entries_status').on(table.status),
]);
export const assetAdjustments = pgTable('asset_adjustments', {
    ...auditFields,
    ...tenantFields,
    assetId: uuid('asset_id')
        .notNull()
        .references(() => fixedAssets.id),
    adjustmentType: assetAdjustmentTypeEnum('adjustment_type').notNull(),
    adjustmentDate: date('adjustment_date').notNull(),
    adjustmentAmount: decimal('adjustment_amount', { precision: 19, scale: 4 }).notNull(),
    direction: adjustmentDirectionEnum('direction').notNull(),
    journalEntryId: uuid('journal_entry_id'),
    description: text('description').notNull(),
    revisedUsefulLifeMonths: integer('revised_useful_life_months'),
    revisedSalvageValue: decimal('revised_salvage_value', { precision: 19, scale: 4 }),
    status: depreciationEntryStatusEnum('status').notNull().default('draft'),
    ...createdByFields,
}, (table) => [
    index('idx_asset_adjustments_asset_id').on(table.assetId),
    index('idx_asset_adjustments_tenant_id').on(table.tenantId),
]);
// ─── Zod Schemas ──────────────────────────────────────────────────────────────
export const insertAssetCategorySchema = createInsertSchema(assetCategories, {
    name: (schema) => schema.min(1).max(100),
    code: (schema) => schema.min(1).max(20),
});
export const selectAssetCategorySchema = createSelectSchema(assetCategories);
export const updateAssetCategorySchema = createUpdateSchema(assetCategories);
export const insertFixedAssetSchema = createInsertSchema(fixedAssets, {
    name: (schema) => schema.min(1).max(200),
    assetNumber: (schema) => schema.min(1).max(50),
});
export const selectFixedAssetSchema = createSelectSchema(fixedAssets);
export const updateFixedAssetSchema = createUpdateSchema(fixedAssets);
export const insertDepreciationScheduleSchema = createInsertSchema(depreciationSchedules);
export const selectDepreciationScheduleSchema = createSelectSchema(depreciationSchedules);
export const insertDepreciationEntrySchema = createInsertSchema(depreciationEntries);
export const selectDepreciationEntrySchema = createSelectSchema(depreciationEntries);
export const insertAssetAdjustmentSchema = createInsertSchema(assetAdjustments);
export const selectAssetAdjustmentSchema = createSelectSchema(assetAdjustments);
export const updateAssetAdjustmentSchema = createUpdateSchema(assetAdjustments);
