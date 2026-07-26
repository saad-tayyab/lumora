import { asc, count, eq, and, isNull, type SQL } from 'drizzle-orm';
import { db } from '../../index';
import type {
  NewTaxAutoAssignmentRule,
  NewTaxCode,
  NewTaxRate,
  TaxAutoAssignmentRule,
  TaxCode,
  TaxRate,
} from './schema';
import { taxAutoAssignmentRules, taxCodes, taxRates } from './schema';

// ─── Pagination Result Type ─────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Tax Codes Repository ──────────────────────────────────────────────────────

export const taxCodesRepository = {
  async findById(id: string): Promise<TaxCode | undefined> {
    return db.query.taxCodes.findFirst({
      where: and(eq(taxCodes.id, id), isNull(taxCodes.deletedAt)),
    });
  },

  async findMany(args?: {
    tenantId?: string;
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<TaxCode>> {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(taxCodes.id) } = args ?? {};
    const where = tenantId
      ? and(eq(taxCodes.tenantId, tenantId), isNull(taxCodes.deletedAt))
      : isNull(taxCodes.deletedAt);
    const data = await db.query.taxCodes.findMany({ where, limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(taxCodes).where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewTaxCode): Promise<TaxCode[]> {
    return db.insert(taxCodes).values(data).returning();
  },

  async update(id: string, data: Partial<NewTaxCode>): Promise<TaxCode[]> {
    return db
      .update(taxCodes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(taxCodes.id, id))
      .returning();
  },

  async softDelete(id: string): Promise<TaxCode[]> {
    return db
      .update(taxCodes)
      .set({ deletedAt: new Date() })
      .where(eq(taxCodes.id, id))
      .returning();
  },

  async findByCode(code: string, tenantId: string): Promise<TaxCode | undefined> {
    return db.query.taxCodes.findFirst({
      where: and(
        eq(taxCodes.code, code),
        eq(taxCodes.tenantId, tenantId),
        isNull(taxCodes.deletedAt),
      ),
    });
  },

  async findActive(tenantId: string): Promise<TaxCode[]> {
    return db.query.taxCodes.findMany({
      where: and(
        eq(taxCodes.tenantId, tenantId),
        eq(taxCodes.isActive, true),
        isNull(taxCodes.deletedAt),
      ),
      orderBy: asc(taxCodes.code),
    });
  },

  async findByType(
    type: TaxCode['type'],
    tenantId: string,
  ): Promise<TaxCode[]> {
    return db.query.taxCodes.findMany({
      where: and(
        eq(taxCodes.type, type),
        eq(taxCodes.tenantId, tenantId),
        isNull(taxCodes.deletedAt),
      ),
      orderBy: asc(taxCodes.code),
    });
  },
};

// ─── Tax Rates Repository ──────────────────────────────────────────────────────

export const taxRatesRepository = {
  async findById(id: string): Promise<TaxRate | undefined> {
    return db.query.taxRates.findFirst({ where: eq(taxRates.id, id) });
  },

  async findMany(args?: {
    tenantId?: string;
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<TaxRate>> {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(taxRates.id) } = args ?? {};
    const where = tenantId ? eq(taxRates.tenantId, tenantId) : undefined;
    const data = await db.query.taxRates.findMany({ where, limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(taxRates).where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewTaxRate): Promise<TaxRate[]> {
    return db.insert(taxRates).values(data).returning();
  },

  async update(id: string, data: Partial<NewTaxRate>): Promise<TaxRate[]> {
    return db
      .update(taxRates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(taxRates.id, id))
      .returning();
  },

  async findByTaxCodeId(taxCodeId: string): Promise<TaxRate[]> {
    return db.query.taxRates.findMany({
      where: eq(taxRates.taxCodeId, taxCodeId),
      orderBy: asc(taxRates.effectiveDate),
    });
  },

  async findActiveByTaxCodeId(taxCodeId: string): Promise<TaxRate | undefined> {
    return db.query.taxRates.findFirst({
      where: and(eq(taxRates.taxCodeId, taxCodeId), eq(taxRates.isActive, true)),
      orderBy: asc(taxRates.effectiveDate),
    });
  },

  async findEffectiveRates(tenantId: string, asOfDate: Date): Promise<TaxRate[]> {
    return db.query.taxRates.findMany({
      where: and(
        eq(taxRates.tenantId, tenantId),
        eq(taxRates.isActive, true),
      ),
      orderBy: asc(taxRates.effectiveDate),
    });
  },
};

// ─── Tax Auto Assignment Rules Repository ──────────────────────────────────────

export const taxAutoAssignmentRulesRepository = {
  async findById(id: string): Promise<TaxAutoAssignmentRule | undefined> {
    return db.query.taxAutoAssignmentRules.findFirst({
      where: and(
        eq(taxAutoAssignmentRules.id, id),
        isNull(taxAutoAssignmentRules.deletedAt),
      ),
    });
  },

  async findMany(args?: {
    tenantId?: string;
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<TaxAutoAssignmentRule>> {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(taxAutoAssignmentRules.priority) } =
      args ?? {};
    const where = tenantId
      ? and(
          eq(taxAutoAssignmentRules.tenantId, tenantId),
          isNull(taxAutoAssignmentRules.deletedAt),
        )
      : isNull(taxAutoAssignmentRules.deletedAt);
    const data = await db.query.taxAutoAssignmentRules.findMany({ where, limit, offset, orderBy });
    const total = await db
      .select({ count: count() })
      .from(taxAutoAssignmentRules)
      .where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewTaxAutoAssignmentRule): Promise<TaxAutoAssignmentRule[]> {
    return db.insert(taxAutoAssignmentRules).values(data).returning();
  },

  async update(
    id: string,
    data: Partial<NewTaxAutoAssignmentRule>,
  ): Promise<TaxAutoAssignmentRule[]> {
    return db
      .update(taxAutoAssignmentRules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(taxAutoAssignmentRules.id, id))
      .returning();
  },

  async softDelete(id: string): Promise<TaxAutoAssignmentRule[]> {
    return db
      .update(taxAutoAssignmentRules)
      .set({ deletedAt: new Date() })
      .where(eq(taxAutoAssignmentRules.id, id))
      .returning();
  },

  async findActiveByTenantId(tenantId: string): Promise<TaxAutoAssignmentRule[]> {
    return db.query.taxAutoAssignmentRules.findMany({
      where: and(
        eq(taxAutoAssignmentRules.tenantId, tenantId),
        eq(taxAutoAssignmentRules.isActive, true),
        isNull(taxAutoAssignmentRules.deletedAt),
      ),
      orderBy: asc(taxAutoAssignmentRules.priority),
    });
  },

  async findByEntityType(
    entityType: string,
    tenantId: string,
  ): Promise<TaxAutoAssignmentRule[]> {
    return db.query.taxAutoAssignmentRules.findMany({
      where: and(
        eq(taxAutoAssignmentRules.entityType, entityType),
        eq(taxAutoAssignmentRules.tenantId, tenantId),
        isNull(taxAutoAssignmentRules.deletedAt),
      ),
      orderBy: asc(taxAutoAssignmentRules.priority),
    });
  },
};
