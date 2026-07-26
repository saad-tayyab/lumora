import { asc, count, eq, and, gte, lte, type SQL } from 'drizzle-orm';
import { db } from '../../index';
import type { AuditLogEntry, NewAuditLogEntry } from './schema';
import { auditLogEntries } from './schema';

// ─── Pagination Result Type ─────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Audit Log Entries Repository ──────────────────────────────────────────────

export const auditLogEntriesRepository = {
  async findById(id: string): Promise<AuditLogEntry | undefined> {
    return db.query.auditLogEntries.findFirst({ where: eq(auditLogEntries.id, id) });
  },

  async create(data: NewAuditLogEntry): Promise<AuditLogEntry[]> {
    return db.insert(auditLogEntries).values(data).returning();
  },

  async findByResourceAndId(
    resource: string,
    resourceId: string,
    tenantId: string,
  ): Promise<PaginatedResult<AuditLogEntry>> {
    const where = and(
      eq(auditLogEntries.resource, resource),
      eq(auditLogEntries.resourceId, resourceId),
      eq(auditLogEntries.tenantId, tenantId),
    );
    const data = await db.query.auditLogEntries.findMany({
      where,
      orderBy: asc(auditLogEntries.createdAt),
      limit: 50,
      offset: 0,
    });
    const total = await db
      .select({ count: count() })
      .from(auditLogEntries)
      .where(where);
    return { data, total: total[0].count, limit: 50, offset: 0 };
  },

  async findByUserId(
    userId: string,
    tenantId: string,
    args?: { limit?: number; offset?: number },
  ): Promise<PaginatedResult<AuditLogEntry>> {
    const { limit = 50, offset = 0 } = args ?? {};
    const where = and(
      eq(auditLogEntries.userId, userId),
      eq(auditLogEntries.tenantId, tenantId),
    );
    const data = await db.query.auditLogEntries.findMany({
      where,
      orderBy: asc(auditLogEntries.createdAt),
      limit,
      offset,
    });
    const total = await db
      .select({ count: count() })
      .from(auditLogEntries)
      .where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async findByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    args?: { limit?: number; offset?: number },
  ): Promise<PaginatedResult<AuditLogEntry>> {
    const { limit = 50, offset = 0 } = args ?? {};
    const where = and(
      eq(auditLogEntries.tenantId, tenantId),
      gte(auditLogEntries.createdAt, startDate),
      lte(auditLogEntries.createdAt, endDate),
    );
    const data = await db.query.auditLogEntries.findMany({
      where,
      orderBy: asc(auditLogEntries.createdAt),
      limit,
      offset,
    });
    const total = await db
      .select({ count: count() })
      .from(auditLogEntries)
      .where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async findByAction(
    action: string,
    tenantId: string,
    args?: { limit?: number; offset?: number },
  ): Promise<PaginatedResult<AuditLogEntry>> {
    const { limit = 50, offset = 0 } = args ?? {};
    const where = and(
      eq(auditLogEntries.action, action),
      eq(auditLogEntries.tenantId, tenantId),
    );
    const data = await db.query.auditLogEntries.findMany({
      where,
      orderBy: asc(auditLogEntries.createdAt),
      limit,
      offset,
    });
    const total = await db
      .select({ count: count() })
      .from(auditLogEntries)
      .where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
      orderBy?: SQL;
    },
  ): Promise<PaginatedResult<AuditLogEntry>> {
    const { limit = 50, offset = 0, orderBy = asc(auditLogEntries.createdAt) } = args ?? {};
    const where = eq(auditLogEntries.tenantId, tenantId);
    const data = await db.query.auditLogEntries.findMany({ where, limit, offset, orderBy });
    const total = await db
      .select({ count: count() })
      .from(auditLogEntries)
      .where(where);
    return { data, total: total[0].count, limit, offset };
  },
};
