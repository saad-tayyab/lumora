import { index, json, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/zod';
import { generateUUIDv7 } from '../common/uuid';
// ─── Tables ───────────────────────────────────────────────────────────────────
export const auditLogEntries = pgTable('audit_log_entries', {
    id: uuid('id')
        .primaryKey()
        .$defaultFn(() => generateUUIDv7()),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userId: uuid('user_id'),
    tenantId: uuid('tenant_id').notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    resource: varchar('resource', { length: 100 }).notNull(),
    resourceId: uuid('resource_id'),
    oldValues: json('old_values'),
    newValues: json('new_values'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
    metadata: json('metadata'),
}, (table) => [
    index('idx_audit_log_entries_tenant_id').on(table.tenantId),
    index('idx_audit_log_entries_user_id').on(table.userId),
    index('idx_audit_log_entries_resource_resource_id').on(table.resource, table.resourceId),
    index('idx_audit_log_entries_action').on(table.action),
    index('idx_audit_log_entries_created_at').on(table.createdAt),
]);
// ─── Zod Schemas ──────────────────────────────────────────────────────────────
export const insertAuditLogEntrySchema = createInsertSchema(auditLogEntries);
export const selectAuditLogEntrySchema = createSelectSchema(auditLogEntries);
