import type { AuditLogEntry, NewAuditLogEntry } from '@lumora/database/schema';
import { auditLogEntries } from '@lumora/database/schema';
import { and, asc, count, eq, gte, lte, type SQL } from 'drizzle-orm';
import { db } from '../../database';

// ─── Pagination Result Type ──────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Audit Log Entries Repository ────────────────────────────────────────────
// INV-AUDIT-001: Audit log entries are append-only; no updates or deletes permitted.
// BR-022: Audit log entries must not be modifiable or deletable.

export const auditLogEntriesRepository = {
  /**
   * Insert a new audit log entry. This is the ONLY write operation permitted.
   * INV-AUDIT-001: No updates or deletes — append-only.
   */
  async create(data: NewAuditLogEntry, tenantId: string): Promise<AuditLogEntry[]> {
    return db
      .insert(auditLogEntries)
      .values({ ...data, tenantId })
      .returning();
  },

  /**
   * Find an audit log entry by ID, scoped to tenant.
   */
  async findById(id: string, tenantId: string): Promise<AuditLogEntry | undefined> {
    return db.query.auditLogEntries.findFirst({
      where: and(eq(auditLogEntries.id, id), eq(auditLogEntries.tenantId, tenantId)),
    });
  },

  /**
   * List audit log entries with optional filters, scoped to tenant.
   */
  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
      orderBy?: SQL;
      userId?: string;
      resource?: string;
      resourceId?: string;
      action?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<PaginatedResult<AuditLogEntry>> {
    const {
      limit = 50,
      offset = 0,
      orderBy = asc(auditLogEntries.createdAt),
      userId,
      resource,
      resourceId,
      action,
      startDate,
      endDate,
    } = args ?? {};

    const conditions: SQL[] = [eq(auditLogEntries.tenantId, tenantId)];

    if (userId) conditions.push(eq(auditLogEntries.userId, userId));
    if (resource) conditions.push(eq(auditLogEntries.resource, resource));
    if (resourceId) conditions.push(eq(auditLogEntries.resourceId, resourceId));
    if (action) conditions.push(eq(auditLogEntries.action, action));
    if (startDate) conditions.push(gte(auditLogEntries.createdAt, new Date(startDate)));
    if (endDate) conditions.push(lte(auditLogEntries.createdAt, new Date(endDate)));

    const where = conditions.length > 1 ? and(...conditions) : conditions[0];

    const data = await db.query.auditLogEntries.findMany({
      where,
      limit,
      offset,
      orderBy,
    });

    const total = await db.select({ count: count() }).from(auditLogEntries).where(where);

    return { data, total: total[0].count, limit, offset };
  },
};
