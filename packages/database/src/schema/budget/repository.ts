import { asc, count, eq, and, isNull, sql, type SQL } from 'drizzle-orm';
import { db } from '../../index';
import type {
  BudgetConsumption,
  BudgetHeader,
  BudgetLine,
  NewBudgetConsumption,
  NewBudgetHeader,
  NewBudgetLine,
} from './schema';
import { budgetConsumptions, budgetHeaders, budgetLines } from './schema';

// ─── Pagination Result Type ─────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Budget Headers Repository ─────────────────────────────────────────────────

export const budgetHeadersRepository = {
  async findById(id: string): Promise<BudgetHeader | undefined> {
    return db.query.budgetHeaders.findFirst({
      where: and(eq(budgetHeaders.id, id), isNull(budgetHeaders.deletedAt)),
    });
  },

  async findMany(args?: {
    tenantId?: string;
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<BudgetHeader>> {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(budgetHeaders.id) } = args ?? {};
    const where = tenantId
      ? and(eq(budgetHeaders.tenantId, tenantId), isNull(budgetHeaders.deletedAt))
      : isNull(budgetHeaders.deletedAt);
    const data = await db.query.budgetHeaders.findMany({ where, limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(budgetHeaders).where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewBudgetHeader): Promise<BudgetHeader[]> {
    return db.insert(budgetHeaders).values(data).returning();
  },

  async update(id: string, data: Partial<NewBudgetHeader>): Promise<BudgetHeader[]> {
    return db
      .update(budgetHeaders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(budgetHeaders.id, id))
      .returning();
  },

  async softDelete(id: string): Promise<BudgetHeader[]> {
    return db
      .update(budgetHeaders)
      .set({ deletedAt: new Date() })
      .where(eq(budgetHeaders.id, id))
      .returning();
  },

  async findActive(tenantId: string): Promise<BudgetHeader[]> {
    return db.query.budgetHeaders.findMany({
      where: and(
        eq(budgetHeaders.tenantId, tenantId),
        eq(budgetHeaders.isActive, true),
        isNull(budgetHeaders.deletedAt),
      ),
      orderBy: asc(budgetHeaders.name),
    });
  },

  async findByStatus(
    status: string,
    tenantId: string,
  ): Promise<BudgetHeader[]> {
    return db.query.budgetHeaders.findMany({
      where: and(
        eq(budgetHeaders.status, status),
        eq(budgetHeaders.tenantId, tenantId),
        isNull(budgetHeaders.deletedAt),
      ),
      orderBy: asc(budgetHeaders.name),
    });
  },

  async findWithLines(id: string): Promise<(BudgetHeader & { lines: BudgetLine[] }) | undefined> {
    const header = await db.query.budgetHeaders.findFirst({
      where: and(eq(budgetHeaders.id, id), isNull(budgetHeaders.deletedAt)),
    });
    if (!header) return undefined;

    const lines = await db.query.budgetLines.findMany({
      where: eq(budgetLines.budgetHeaderId, id),
      orderBy: asc(budgetLines.glAccountId),
    });

    return { ...header, lines };
  },

  async findActiveForPeriod(
    periodStart: Date,
    periodEnd: Date,
    tenantId: string,
  ): Promise<BudgetHeader[]> {
    return db.query.budgetHeaders.findMany({
      where: and(
        eq(budgetHeaders.tenantId, tenantId),
        eq(budgetHeaders.isActive, true),
        isNull(budgetHeaders.deletedAt),
      ),
      orderBy: asc(budgetHeaders.periodStart),
    });
  },
};

// ─── Budget Lines Repository ───────────────────────────────────────────────────

export const budgetLinesRepository = {
  async findById(id: string): Promise<BudgetLine | undefined> {
    return db.query.budgetLines.findFirst({ where: eq(budgetLines.id, id) });
  },

  async findMany(args?: {
    tenantId?: string;
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<BudgetLine>> {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(budgetLines.id) } = args ?? {};
    const where = tenantId ? eq(budgetLines.tenantId, tenantId) : undefined;
    const data = await db.query.budgetLines.findMany({ where, limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(budgetLines).where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewBudgetLine): Promise<BudgetLine[]> {
    return db.insert(budgetLines).values(data).returning();
  },

  async update(id: string, data: Partial<NewBudgetLine>): Promise<BudgetLine[]> {
    return db
      .update(budgetLines)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(budgetLines.id, id))
      .returning();
  },

  async delete(id: string): Promise<BudgetLine[]> {
    return db.delete(budgetLines).where(eq(budgetLines.id, id)).returning();
  },

  async findByBudgetHeaderId(budgetHeaderId: string): Promise<BudgetLine[]> {
    return db.query.budgetLines.findMany({
      where: eq(budgetLines.budgetHeaderId, budgetHeaderId),
      orderBy: asc(budgetLines.glAccountId),
    });
  },

  async findByGlAccountId(glAccountId: string, tenantId: string): Promise<BudgetLine[]> {
    return db.query.budgetLines.findMany({
      where: and(
        eq(budgetLines.glAccountId, glAccountId),
        eq(budgetLines.tenantId, tenantId),
      ),
      orderBy: asc(budgetLines.glAccountId),
    });
  },

  async updateConsumedAmount(id: string, amount: string): Promise<BudgetLine[]> {
    return db
      .update(budgetLines)
      .set({
        consumedAmount: sql`${budgetLines.consumedAmount} + ${amount}`,
        varianceAmount: sql`${budgetLines.budgetAmount} - (${budgetLines.consumedAmount} + ${amount})`,
        updatedAt: new Date(),
      })
      .where(eq(budgetLines.id, id))
      .returning();
  },

  async reverseConsumedAmount(id: string, amount: string): Promise<BudgetLine[]> {
    return db
      .update(budgetLines)
      .set({
        consumedAmount: sql`${budgetLines.consumedAmount} - ${amount}`,
        varianceAmount: sql`${budgetLines.budgetAmount} - (${budgetLines.consumedAmount} - ${amount})`,
        updatedAt: new Date(),
      })
      .where(eq(budgetLines.id, id))
      .returning();
  },

  async calculateVariance(id: string): Promise<{ budgetAmount: string; consumedAmount: string; varianceAmount: string } | undefined> {
    const result = await db
      .select({
        budgetAmount: budgetLines.budgetAmount,
        consumedAmount: budgetLines.consumedAmount,
        varianceAmount: sql<string>`${budgetLines.budgetAmount} - ${budgetLines.consumedAmount}`.as('variance_amount'),
      })
      .from(budgetLines)
      .where(eq(budgetLines.id, id))
      .limit(1);
    return result[0];
  },
};

// ─── Budget Consumptions Repository ────────────────────────────────────────────

export const budgetConsumptionsRepository = {
  async findById(id: string): Promise<BudgetConsumption | undefined> {
    return db.query.budgetConsumptions.findFirst({ where: eq(budgetConsumptions.id, id) });
  },

  async findMany(args?: {
    tenantId?: string;
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<BudgetConsumption>> {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(budgetConsumptions.id) } = args ?? {};
    const where = tenantId ? eq(budgetConsumptions.tenantId, tenantId) : undefined;
    const data = await db.query.budgetConsumptions.findMany({ where, limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(budgetConsumptions).where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewBudgetConsumption): Promise<BudgetConsumption[]> {
    return db.insert(budgetConsumptions).values(data).returning();
  },

  async findByBudgetLineId(budgetLineId: string): Promise<BudgetConsumption[]> {
    return db.query.budgetConsumptions.findMany({
      where: eq(budgetConsumptions.budgetLineId, budgetLineId),
      orderBy: asc(budgetConsumptions.consumptionDate),
    });
  },

  async findByJournalEntryId(journalEntryId: string): Promise<BudgetConsumption | undefined> {
    return db.query.budgetConsumptions.findFirst({
      where: eq(budgetConsumptions.journalEntryId, journalEntryId),
    });
  },

  async sumByBudgetLineId(
    budgetLineId: string,
  ): Promise<{ total: string } | undefined> {
    const result = await db
      .select({
        total: sql<string>`COALESCE(SUM(${budgetConsumptions.amount}), 0)`.as('total'),
      })
      .from(budgetConsumptions)
      .where(eq(budgetConsumptions.budgetLineId, budgetLineId));
    return result[0];
  },

  async deleteByJournalEntryId(journalEntryId: string): Promise<BudgetConsumption[]> {
    return db
      .delete(budgetConsumptions)
      .where(eq(budgetConsumptions.journalEntryId, journalEntryId))
      .returning();
  },
};
