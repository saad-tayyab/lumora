import { db } from '@lumora/database';
import {
  type NewTaxAutoAssignmentRule,
  type NewTaxCode,
  type NewTaxRate,
  type TaxAutoAssignmentRule,
  type TaxCode,
  type TaxRate,
  taxAutoAssignmentRules,
  taxCodes,
  taxRates,
} from '@lumora/database/schema';
import { and, asc, count, eq, isNull, type SQL, sql } from 'drizzle-orm';

// ─── Tax Codes Repository ──────────────────────────────────────────────────

export const taxCodesRepo = {
  async findById(id: string, tenantId: string): Promise<TaxCode | undefined> {
    return db.query.taxCodes.findFirst({
      where: and(eq(taxCodes.id, id), eq(taxCodes.tenantId, tenantId), isNull(taxCodes.deletedAt)),
    });
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

  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
      type?: 'sales_tax' | 'vat' | 'gst' | 'excise' | 'withholding';
      isActive?: boolean;
    },
  ): Promise<{ data: TaxCode[]; total: number }> {
    const { limit = 50, offset = 0, type, isActive } = args ?? {};
    const conditions: SQL[] = [eq(taxCodes.tenantId, tenantId), isNull(taxCodes.deletedAt)];

    if (type) {
      conditions.push(eq(taxCodes.type, type));
    }
    if (isActive !== undefined) {
      conditions.push(eq(taxCodes.isActive, isActive));
    }

    const where = and(...conditions);

    const data = await db.query.taxCodes.findMany({
      where,
      orderBy: asc(taxCodes.code),
      limit,
      offset,
    });

    const [totalResult] = await db.select({ count: count() }).from(taxCodes).where(where);

    return { data, total: totalResult.count };
  },

  async create(data: NewTaxCode): Promise<TaxCode> {
    const [result] = await db.insert(taxCodes).values(data).returning();
    return result;
  },

  async update(id: string, tenantId: string, data: Partial<NewTaxCode>): Promise<TaxCode> {
    const [result] = await db
      .update(taxCodes)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(taxCodes.id, id), eq(taxCodes.tenantId, tenantId)))
      .returning();
    return result;
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await db
      .update(taxCodes)
      .set({ deletedAt: new Date() })
      .where(and(eq(taxCodes.id, id), eq(taxCodes.tenantId, tenantId)));
  },

  async countRatesByTaxCodeId(taxCodeId: string, tenantId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(taxRates)
      .where(and(eq(taxRates.taxCodeId, taxCodeId), eq(taxRates.tenantId, tenantId)));
    return result.count;
  },

  async countAutoAssignmentRulesByTaxCodeId(taxCodeId: string, tenantId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(taxAutoAssignmentRules)
      .where(
        and(
          eq(taxAutoAssignmentRules.taxCodeId, taxCodeId),
          eq(taxAutoAssignmentRules.tenantId, tenantId),
          isNull(taxAutoAssignmentRules.deletedAt),
        ),
      );
    return result.count;
  },
};

// ─── Tax Rates Repository ──────────────────────────────────────────────────

export const taxRatesRepo = {
  async findById(id: string, tenantId: string): Promise<TaxRate | undefined> {
    return db.query.taxRates.findFirst({
      where: and(eq(taxRates.id, id), eq(taxRates.tenantId, tenantId)),
    });
  },

  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
      taxCodeId?: string;
      isActive?: boolean;
    },
  ): Promise<{ data: TaxRate[]; total: number }> {
    const { limit = 50, offset = 0, taxCodeId, isActive } = args ?? {};
    const conditions: SQL[] = [eq(taxRates.tenantId, tenantId)];

    if (taxCodeId) {
      conditions.push(eq(taxRates.taxCodeId, taxCodeId));
    }
    if (isActive !== undefined) {
      conditions.push(eq(taxRates.isActive, isActive));
    }

    const where = and(...conditions);

    const data = await db.query.taxRates.findMany({
      where,
      orderBy: asc(taxRates.effectiveDate),
      limit,
      offset,
    });

    const [totalResult] = await db.select({ count: count() }).from(taxRates).where(where);

    return { data, total: totalResult.count };
  },

  /**
   * Find the active tax rate for a given tax code on a specific date.
   * BR-014: Tax rates are versioned with effective dates.
   * BR-017: Expired tax rates cannot be applied to new transactions.
   */
  async findActiveRateForDate(
    taxCodeId: string,
    date: string,
    tenantId: string,
  ): Promise<TaxRate | undefined> {
    return db.query.taxRates.findFirst({
      where: and(
        eq(taxRates.taxCodeId, taxCodeId),
        eq(taxRates.tenantId, tenantId),
        eq(taxRates.isActive, true),
        // effectiveDate <= date
        sql`${taxRates.effectiveDate} <= ${date}`,
        // expiryDate is NULL or expiryDate >= date
        sql`(${taxRates.expiryDate} IS NULL OR ${taxRates.expiryDate} >= ${date})`,
      ),
      orderBy: asc(taxRates.effectiveDate),
    });
  },

  async create(data: NewTaxRate): Promise<TaxRate> {
    const [result] = await db.insert(taxRates).values(data).returning();
    return result;
  },

  async update(id: string, tenantId: string, data: Partial<NewTaxRate>): Promise<TaxRate> {
    const [result] = await db
      .update(taxRates)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(taxRates.id, id), eq(taxRates.tenantId, tenantId)))
      .returning();
    return result;
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await db.delete(taxRates).where(and(eq(taxRates.id, id), eq(taxRates.tenantId, tenantId)));
  },

  async hasOverlap(
    taxCodeId: string,
    effectiveDate: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const conditions: SQL[] = [
      eq(taxRates.taxCodeId, taxCodeId),
      eq(taxRates.tenantId, tenantId),
      eq(taxRates.effectiveDate, effectiveDate),
    ];

    if (excludeId) {
      conditions.push(sql`${taxRates.id} != ${excludeId}`);
    }

    const [result] = await db
      .select({ count: count() })
      .from(taxRates)
      .where(and(...conditions));

    return result.count > 0;
  },
};

// ─── Tax Auto-Assignment Rules Repository ──────────────────────────────────

export const taxAutoAssignmentRulesRepo = {
  async findById(id: string, tenantId: string): Promise<TaxAutoAssignmentRule | undefined> {
    return db.query.taxAutoAssignmentRules.findFirst({
      where: and(
        eq(taxAutoAssignmentRules.id, id),
        eq(taxAutoAssignmentRules.tenantId, tenantId),
        isNull(taxAutoAssignmentRules.deletedAt),
      ),
    });
  },

  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
      isActive?: boolean;
    },
  ): Promise<{ data: TaxAutoAssignmentRule[]; total: number }> {
    const { limit = 50, offset = 0, isActive } = args ?? {};
    const conditions: SQL[] = [
      eq(taxAutoAssignmentRules.tenantId, tenantId),
      isNull(taxAutoAssignmentRules.deletedAt),
    ];

    if (isActive !== undefined) {
      conditions.push(eq(taxAutoAssignmentRules.isActive, isActive));
    }

    const where = and(...conditions);

    const data = await db.query.taxAutoAssignmentRules.findMany({
      where,
      orderBy: asc(taxAutoAssignmentRules.priority),
      limit,
      offset,
    });

    const [totalResult] = await db
      .select({ count: count() })
      .from(taxAutoAssignmentRules)
      .where(where);

    return { data, total: totalResult.count };
  },

  /**
   * Find matching auto-assignment rules by entity type and optional filters.
   * BR-016: Tax auto-assignment rules are evaluated by priority order.
   */
  async findMatchingRules(
    tenantId: string,
    params: {
      entityType: string;
      entityCategoryId?: string;
      customerGroupId?: string;
      itemCategoryId?: string;
      regionCode?: string;
    },
  ): Promise<TaxAutoAssignmentRule[]> {
    const conditions: SQL[] = [
      eq(taxAutoAssignmentRules.tenantId, tenantId),
      eq(taxAutoAssignmentRules.entityType, params.entityType),
      eq(taxAutoAssignmentRules.isActive, true),
      isNull(taxAutoAssignmentRules.deletedAt),
    ];

    if (params.entityCategoryId) {
      conditions.push(eq(taxAutoAssignmentRules.entityCategoryId, params.entityCategoryId));
    }
    if (params.customerGroupId) {
      conditions.push(eq(taxAutoAssignmentRules.customerGroupId, params.customerGroupId));
    }
    if (params.itemCategoryId) {
      conditions.push(eq(taxAutoAssignmentRules.itemCategoryId, params.itemCategoryId));
    }
    if (params.regionCode) {
      conditions.push(eq(taxAutoAssignmentRules.regionCode, params.regionCode));
    }

    return db.query.taxAutoAssignmentRules.findMany({
      where: and(...conditions),
      orderBy: asc(taxAutoAssignmentRules.priority),
    });
  },

  async hasPriorityConflict(
    priority: number,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const conditions: SQL[] = [
      eq(taxAutoAssignmentRules.priority, priority),
      eq(taxAutoAssignmentRules.tenantId, tenantId),
      isNull(taxAutoAssignmentRules.deletedAt),
    ];

    if (excludeId) {
      conditions.push(sql`${taxAutoAssignmentRules.id} != ${excludeId}`);
    }

    const [result] = await db
      .select({ count: count() })
      .from(taxAutoAssignmentRules)
      .where(and(...conditions));

    return result.count > 0;
  },

  async create(data: NewTaxAutoAssignmentRule): Promise<TaxAutoAssignmentRule> {
    const [result] = await db.insert(taxAutoAssignmentRules).values(data).returning();
    return result;
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<NewTaxAutoAssignmentRule>,
  ): Promise<TaxAutoAssignmentRule> {
    const [result] = await db
      .update(taxAutoAssignmentRules)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(taxAutoAssignmentRules.id, id), eq(taxAutoAssignmentRules.tenantId, tenantId)))
      .returning();
    return result;
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await db
      .update(taxAutoAssignmentRules)
      .set({ deletedAt: new Date() })
      .where(and(eq(taxAutoAssignmentRules.id, id), eq(taxAutoAssignmentRules.tenantId, tenantId)));
  },
};
