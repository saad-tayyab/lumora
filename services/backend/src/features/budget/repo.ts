import {
  type BudgetConsumption,
  type BudgetHeader,
  type BudgetLine,
  budgetConsumptions,
  budgetHeaders,
  budgetLines,
  type NewBudgetConsumption,
  type NewBudgetHeader,
  type NewBudgetLine,
} from '@lumora/database/schema';
import { and, asc, count, eq, isNull, type SQL, sum } from 'drizzle-orm';
import { db } from '../../database';

// ─── Budget Headers Repository ──────────────────────────────────────────

export const budgetHeadersRepo = {
  async findById(id: string, tenantId: string): Promise<BudgetHeader | undefined> {
    return db.query.budgetHeaders.findFirst({
      where: and(
        eq(budgetHeaders.id, id),
        eq(budgetHeaders.tenantId, tenantId),
        isNull(budgetHeaders.deletedAt),
      ),
    });
  },

  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
      status?: string;
      isActive?: boolean;
    },
  ): Promise<{ data: BudgetHeader[]; total: number }> {
    const { limit = 50, offset = 0, status, isActive } = args ?? {};
    const conditions: SQL[] = [
      eq(budgetHeaders.tenantId, tenantId),
      isNull(budgetHeaders.deletedAt),
    ];

    if (status) {
      conditions.push(eq(budgetHeaders.status, status));
    }

    if (isActive !== undefined) {
      conditions.push(eq(budgetHeaders.isActive, isActive));
    }

    const where = and(...conditions);

    const data = await db.query.budgetHeaders.findMany({
      where,
      orderBy: asc(budgetHeaders.periodStart),
      limit,
      offset,
    });

    const [totalResult] = await db.select({ count: count() }).from(budgetHeaders).where(where);

    return { data, total: totalResult.count };
  },

  async findActiveByPeriod(
    periodStart: string,
    periodEnd: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<BudgetHeader | undefined> {
    const allActive = await db.query.budgetHeaders.findMany({
      where: and(
        eq(budgetHeaders.tenantId, tenantId),
        eq(budgetHeaders.isActive, true),
        eq(budgetHeaders.status, 'active'),
        isNull(budgetHeaders.deletedAt),
      ),
    });

    return allActive.find((bh) => {
      if (excludeId && bh.id === excludeId) return false;
      // Check for period overlap: existing.start <= new.end AND existing.end >= new.start
      const existingStart = new Date(bh.periodStart).getTime();
      const existingEnd = new Date(bh.periodEnd).getTime();
      const newStart = new Date(periodStart).getTime();
      const newEnd = new Date(periodEnd).getTime();
      return existingStart <= newEnd && existingEnd >= newStart;
    });
  },

  async create(data: NewBudgetHeader): Promise<BudgetHeader> {
    const [result] = await db.insert(budgetHeaders).values(data).returning();
    return result;
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<NewBudgetHeader>,
  ): Promise<BudgetHeader> {
    const [result] = await db
      .update(budgetHeaders)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(budgetHeaders.id, id), eq(budgetHeaders.tenantId, tenantId)))
      .returning();
    return result;
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await db
      .update(budgetHeaders)
      .set({ deletedAt: new Date() })
      .where(and(eq(budgetHeaders.id, id), eq(budgetHeaders.tenantId, tenantId)));
  },
};

// ─── Budget Lines Repository ────────────────────────────────────────────

export const budgetLinesRepo = {
  async findById(id: string, tenantId: string): Promise<BudgetLine | undefined> {
    return db.query.budgetLines.findFirst({
      where: and(
        eq(budgetLines.id, id),
        eq(budgetLines.tenantId, tenantId),
        isNull(budgetLines.deletedAt),
      ),
    });
  },

  async findByBudgetHeaderId(budgetHeaderId: string, tenantId: string): Promise<BudgetLine[]> {
    return db.query.budgetLines.findMany({
      where: and(
        eq(budgetLines.budgetHeaderId, budgetHeaderId),
        eq(budgetLines.tenantId, tenantId),
        isNull(budgetLines.deletedAt),
      ),
      orderBy: asc(budgetLines.createdAt),
    });
  },

  async findByGlAccountId(glAccountId: string, tenantId: string): Promise<BudgetLine | undefined> {
    return db.query.budgetLines.findFirst({
      where: and(
        eq(budgetLines.glAccountId, glAccountId),
        eq(budgetLines.tenantId, tenantId),
        isNull(budgetLines.deletedAt),
      ),
    });
  },

  async findByBudgetHeaderAndGlAccount(
    budgetHeaderId: string,
    glAccountId: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<BudgetLine | undefined> {
    const lines = await db.query.budgetLines.findMany({
      where: and(
        eq(budgetLines.budgetHeaderId, budgetHeaderId),
        eq(budgetLines.tenantId, tenantId),
        isNull(budgetLines.deletedAt),
      ),
    });

    return lines.find((line) => {
      if (excludeId && line.id === excludeId) return false;
      return line.glAccountId === glAccountId;
    });
  },

  async create(data: NewBudgetLine): Promise<BudgetLine> {
    const [result] = await db.insert(budgetLines).values(data).returning();
    return result;
  },

  async createMany(data: NewBudgetLine[]): Promise<BudgetLine[]> {
    return db.insert(budgetLines).values(data).returning();
  },

  async update(id: string, tenantId: string, data: Partial<NewBudgetLine>): Promise<BudgetLine> {
    const [result] = await db
      .update(budgetLines)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(budgetLines.id, id), eq(budgetLines.tenantId, tenantId)))
      .returning();
    return result;
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await db
      .update(budgetLines)
      .set({ deletedAt: new Date() })
      .where(and(eq(budgetLines.id, id), eq(budgetLines.tenantId, tenantId)));
  },

  async deleteByBudgetHeaderId(budgetHeaderId: string, tenantId: string): Promise<void> {
    await db
      .update(budgetLines)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(budgetLines.budgetHeaderId, budgetHeaderId), eq(budgetLines.tenantId, tenantId)),
      );
  },

  async getTotalBudgetAmount(budgetHeaderId: string, tenantId: string): Promise<string> {
    const [result] = await db
      .select({ total: sum(budgetLines.budgetAmount) })
      .from(budgetLines)
      .where(
        and(
          eq(budgetLines.budgetHeaderId, budgetHeaderId),
          eq(budgetLines.tenantId, tenantId),
          isNull(budgetLines.deletedAt),
        ),
      );
    return result.total ?? '0';
  },
};

// ─── Budget Consumptions Repository ─────────────────────────────────────

export const budgetConsumptionsRepo = {
  async findById(id: string, tenantId: string): Promise<BudgetConsumption | undefined> {
    return db.query.budgetConsumptions.findFirst({
      where: and(eq(budgetConsumptions.id, id), eq(budgetConsumptions.tenantId, tenantId)),
    });
  },

  async findByBudgetLineId(budgetLineId: string, tenantId: string): Promise<BudgetConsumption[]> {
    return db.query.budgetConsumptions.findMany({
      where: and(
        eq(budgetConsumptions.budgetLineId, budgetLineId),
        eq(budgetConsumptions.tenantId, tenantId),
      ),
      orderBy: asc(budgetConsumptions.consumptionDate),
    });
  },

  async findByJournalEntryId(
    journalEntryId: string,
    tenantId: string,
  ): Promise<BudgetConsumption[]> {
    return db.query.budgetConsumptions.findMany({
      where: and(
        eq(budgetConsumptions.journalEntryId, journalEntryId),
        eq(budgetConsumptions.tenantId, tenantId),
      ),
      orderBy: asc(budgetConsumptions.consumptionDate),
    });
  },

  async getTotalConsumedByLineId(budgetLineId: string, tenantId: string): Promise<string> {
    const [result] = await db
      .select({ total: sum(budgetConsumptions.amount) })
      .from(budgetConsumptions)
      .where(
        and(
          eq(budgetConsumptions.budgetLineId, budgetLineId),
          eq(budgetConsumptions.tenantId, tenantId),
        ),
      );
    return result.total ?? '0';
  },

  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
      budgetLineId?: string;
    },
  ): Promise<{ data: BudgetConsumption[]; total: number }> {
    const { limit = 50, offset = 0, budgetLineId } = args ?? {};
    const conditions: SQL[] = [eq(budgetConsumptions.tenantId, tenantId)];

    if (budgetLineId) {
      conditions.push(eq(budgetConsumptions.budgetLineId, budgetLineId));
    }

    const where = and(...conditions);

    const data = await db.query.budgetConsumptions.findMany({
      where,
      orderBy: asc(budgetConsumptions.consumptionDate),
      limit,
      offset,
    });

    const [totalResult] = await db.select({ count: count() }).from(budgetConsumptions).where(where);

    return { data, total: totalResult.count };
  },

  async create(data: NewBudgetConsumption): Promise<BudgetConsumption> {
    const [result] = await db.insert(budgetConsumptions).values(data).returning();
    return result;
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await db
      .delete(budgetConsumptions)
      .where(and(eq(budgetConsumptions.id, id), eq(budgetConsumptions.tenantId, tenantId)));
  },
};
