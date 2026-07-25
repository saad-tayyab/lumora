import {
  index,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/zod';
import { auditFields, tenantFields } from '../common/audit';
import { generateUUIDv7 } from '../common/uuid';

// ─── Tables ───────────────────────────────────────────────────────────────────

export const auditLogEntries = pgTable(
  'audit_log_entries',
  {
    id: uuid('id').primaryKey().$defaultFn(() => generateUUIDv7()),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userId: uuid('user_id'),
    tenantId: uuid('tenant_id').notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    entityType: varchar('entity_type', { length: 100 }).notNull(),
    entityId: uuid('entity_id').notNull(),
    oldValues: json('old_values'),
    newValues: json('new_values'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
    metadata: json('metadata'),
  },
  (table) => [
    index('idx_audit_log_entries_tenant_id').on(table.tenantId),
    index('idx_audit_log_entries_user_id').on(table.userId),
    index('idx_audit_log_entries_entity_type_entity_id').on(table.entityType, table.entityId),
    index('idx_audit_log_entries_action').on(table.action),
    index('idx_audit_log_entries_created_at').on(table.createdAt),
  ],
);

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const insertAuditLogEntrySchema = createInsertSchema(auditLogEntries);
export const selectAuditLogEntrySchema = createSelectSchema(auditLogEntries);

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuditLogEntry = typeof auditLogEntries.$inferSelect;
export type NewAuditLogEntry = typeof auditLogEntries.$inferInsert;
