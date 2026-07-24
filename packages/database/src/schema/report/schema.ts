import {
  bigint,
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';
import { auditFields, createdByFields, tenantFields } from '../common/audit';

// ─── Tables ───────────────────────────────────────────────────────────────────

export const reportTemplates = pgTable(
  'report_templates',
  {
    ...auditFields,
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 20 }).notNull(),
    layoutConfig: jsonb('layout_config').notNull(),
    parameterSchema: jsonb('parameter_schema').notNull(),
    outputFormats: jsonb('output_formats').notNull(),
    version: integer('version').notNull().default(1),
    isSystem: boolean('is_system').notNull().default(false),
  },
  (table) => [
    index('idx_report_templates_category').on(table.category),
    index('idx_report_templates_is_system').on(table.isSystem),
  ],
);

export const reports = pgTable(
  'reports',
  {
    ...auditFields,
    ...tenantFields,
    ...createdByFields,
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description'),
    templateId: uuid('template_id')
      .notNull()
      .references(() => reportTemplates.id),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
  },
  (table) => [
    index('idx_reports_tenant_id').on(table.tenantId),
    index('idx_reports_status').on(table.status),
    index('idx_reports_created_by').on(table.createdBy),
  ],
);

export const dashboards = pgTable(
  'dashboards',
  {
    ...auditFields,
    ...tenantFields,
    ...createdByFields,
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    layout: jsonb('layout').notNull(),
    isShared: boolean('is_shared').notNull().default(false),
    refreshIntervalSeconds: integer('refresh_interval_seconds'),
  },
  (table) => [
    index('idx_dashboards_tenant_id').on(table.tenantId),
    index('idx_dashboards_is_shared').on(table.isShared),
    index('idx_dashboards_created_by').on(table.createdBy),
  ],
);

export const kpis = pgTable(
  'kpis',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ...tenantFields,
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description'),
    metricType: varchar('metric_type', { length: 20 }).notNull(),
    formula: text('formula'),
    unit: varchar('unit', { length: 50 }),
    targetValue: decimal('target_value', { precision: 19, scale: 4 }).notNull(),
    warningThreshold: decimal('warning_threshold', { precision: 19, scale: 4 }),
    criticalThreshold: decimal('critical_threshold', { precision: 19, scale: 4 }),
    direction: varchar('direction', { length: 30 }).notNull(),
    currentValue: decimal('current_value', { precision: 19, scale: 4 }),
    lastCalculatedAt: timestamp('last_calculated_at'),
    ...createdByFields,
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_kpis_tenant_id').on(table.tenantId),
    index('idx_kpis_metric_type').on(table.metricType),
    index('idx_kpis_created_by').on(table.createdBy),
  ],
);

export const dataSources = pgTable(
  'data_sources',
  {
    ...auditFields,
    name: varchar('name', { length: 200 }).notNull(),
    sourceType: varchar('source_type', { length: 20 }).notNull(),
    contextRef: varchar('context_ref', { length: 100 }).notNull(),
    queryConfig: jsonb('query_config').notNull(),
    refreshPolicy: varchar('refresh_policy', { length: 20 }).notNull(),
    cacheTtlSeconds: integer('cache_ttl_seconds'),
    isActive: boolean('is_active').notNull().default(true),
  },
  (table) => [
    index('idx_data_sources_source_type').on(table.sourceType),
    index('idx_data_sources_context_ref').on(table.contextRef),
    index('idx_data_sources_is_active').on(table.isActive),
  ],
);

export const reportSchedules = pgTable(
  'report_schedules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reportId: uuid('report_id')
      .notNull()
      .references(() => reports.id),
    ...tenantFields,
    cronExpression: varchar('cron_expression', { length: 100 }).notNull(),
    timezone: varchar('timezone', { length: 50 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    nextRunAt: timestamp('next_run_at'),
    lastRunAt: timestamp('last_run_at'),
    deliveryMethod: varchar('delivery_method', { length: 20 }).notNull(),
    deliveryConfig: jsonb('delivery_config'),
    ...createdByFields,
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_report_schedules_report_id').on(table.reportId),
    index('idx_report_schedules_tenant_id').on(table.tenantId),
    index('idx_report_schedules_is_active').on(table.isActive),
  ],
);

export const reportExports = pgTable(
  'report_exports',
  {
    ...auditFields,
    reportId: uuid('report_id')
      .notNull()
      .references(() => reports.id),
    format: varchar('format', { length: 10 }).notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }),
    storagePath: varchar('storage_path', { length: 500 }),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    requestedBy: uuid('requested_by').notNull(),
    requestedAt: timestamp('requested_at').notNull(),
    completedAt: timestamp('completed_at'),
    expiresAt: timestamp('expires_at'),
  },
  (table) => [
    index('idx_report_exports_report_id').on(table.reportId),
    index('idx_report_exports_status').on(table.status),
    index('idx_report_exports_requested_by').on(table.requestedBy),
  ],
);

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const insertReportTemplateSchema = createInsertSchema(reportTemplates, {
  name: (schema) => schema.min(1).max(200),
});
export const selectReportTemplateSchema = createSelectSchema(reportTemplates);

export const insertReportSchema = createInsertSchema(reports, {
  name: (schema) => schema.min(1).max(200),
});
export const selectReportSchema = createSelectSchema(reports);

export const insertDashboardSchema = createInsertSchema(dashboards, {
  title: (schema) => schema.min(1).max(200),
});
export const selectDashboardSchema = createSelectSchema(dashboards);

export const insertKpiSchema = createInsertSchema(kpis, {
  name: (schema) => schema.min(1).max(200),
});
export const selectKpiSchema = createSelectSchema(kpis);

export const insertDataSourceSchema = createInsertSchema(dataSources, {
  name: (schema) => schema.min(1).max(200),
});
export const selectDataSourceSchema = createSelectSchema(dataSources);

export const insertReportScheduleSchema = createInsertSchema(reportSchedules);
export const selectReportScheduleSchema = createSelectSchema(reportSchedules);

export const insertReportExportSchema = createInsertSchema(reportExports);
export const selectReportExportSchema = createSelectSchema(reportExports);

export const updateReportTemplateSchema = createUpdateSchema(reportTemplates);
export const updateReportSchema = createUpdateSchema(reports);
export const updateDashboardSchema = createUpdateSchema(dashboards);
export const updateKpiSchema = createUpdateSchema(kpis);
export const updateDataSourceSchema = createUpdateSchema(dataSources);
export const updateReportScheduleSchema = createUpdateSchema(reportSchedules);
export const updateReportExportSchema = createUpdateSchema(reportExports);

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type NewReportTemplate = typeof reportTemplates.$inferInsert;

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;

export type Dashboard = typeof dashboards.$inferSelect;
export type NewDashboard = typeof dashboards.$inferInsert;

export type Kpi = typeof kpis.$inferSelect;
export type NewKpi = typeof kpis.$inferInsert;

export type DataSource = typeof dataSources.$inferSelect;
export type NewDataSource = typeof dataSources.$inferInsert;

export type ReportSchedule = typeof reportSchedules.$inferSelect;
export type NewReportSchedule = typeof reportSchedules.$inferInsert;

export type ReportExport = typeof reportExports.$inferSelect;
export type NewReportExport = typeof reportExports.$inferInsert;
