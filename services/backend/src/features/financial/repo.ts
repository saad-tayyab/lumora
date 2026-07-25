import { db } from '@lumora/database';
import {
  type Account,
  accounts,
  type FiscalYear,
  fiscalYears,
  type JournalEntry,
  type JournalEntryLine,
  journalEntries,
  journalEntryLines,
  type NewAccount,
  type NewFiscalYear,
  type NewJournalEntry,
  type NewJournalEntryLine,
} from '@lumora/database/schema';
import { and, asc, count, eq, isNull, type SQL, sum } from 'drizzle-orm';

// ─── Accounts Repository ────────────────────────────────────────────────────

export const accountsRepo = {
  async findById(id: string, tenantId: string): Promise<Account | undefined> {
    return db.query.accounts.findFirst({
      where: and(eq(accounts.id, id), eq(accounts.tenantId, tenantId), isNull(accounts.deletedAt)),
    });
  },

  async findByCode(code: string, tenantId: string): Promise<Account | undefined> {
    return db.query.accounts.findFirst({
      where: and(
        eq(accounts.code, code),
        eq(accounts.tenantId, tenantId),
        isNull(accounts.deletedAt),
      ),
    });
  },

  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
      type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    },
  ): Promise<{ data: Account[]; total: number }> {
    const { limit = 50, offset = 0, type } = args ?? {};
    const conditions: SQL[] = [eq(accounts.tenantId, tenantId), isNull(accounts.deletedAt)];
    if (type) {
      conditions.push(eq(accounts.type, type));
    }

    const where = and(...conditions);

    const data = await db.query.accounts.findMany({
      where,
      orderBy: asc(accounts.code),
      limit,
      offset,
    });

    const [totalResult] = await db.select({ count: count() }).from(accounts).where(where);

    return { data, total: totalResult.count };
  },

  async create(data: NewAccount): Promise<Account> {
    const [result] = await db.insert(accounts).values(data).returning();
    return result;
  },

  async update(id: string, tenantId: string, data: Partial<NewAccount>): Promise<Account> {
    const [result] = await db
      .update(accounts)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(accounts.id, id), eq(accounts.tenantId, tenantId)))
      .returning();
    return result;
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await db
      .update(accounts)
      .set({ deletedAt: new Date() })
      .where(and(eq(accounts.id, id), eq(accounts.tenantId, tenantId)));
  },

  async countByParentId(parentId: string, tenantId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(accounts)
      .where(
        and(
          eq(accounts.parentId, parentId),
          eq(accounts.tenantId, tenantId),
          isNull(accounts.deletedAt),
        ),
      );
    return result.count;
  },

  async countLinesByAccountId(accountId: string, tenantId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(journalEntryLines)
      .where(
        and(eq(journalEntryLines.accountId, accountId), eq(journalEntryLines.tenantId, tenantId)),
      );
    return result.count;
  },
};

// ─── Journal Entries Repository ─────────────────────────────────────────────

export const journalEntriesRepo = {
  async findById(id: string, tenantId: string): Promise<JournalEntry | undefined> {
    return db.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.id, id),
        eq(journalEntries.tenantId, tenantId),
        isNull(journalEntries.deletedAt),
      ),
    });
  },

  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
      status?: 'draft' | 'posted' | 'voided';
    },
  ): Promise<{ data: JournalEntry[]; total: number }> {
    const { limit = 50, offset = 0, status } = args ?? {};
    const conditions: SQL[] = [
      eq(journalEntries.tenantId, tenantId),
      isNull(journalEntries.deletedAt),
    ];
    if (status) {
      conditions.push(eq(journalEntries.status, status));
    }

    const where = and(...conditions);

    const data = await db.query.journalEntries.findMany({
      where,
      orderBy: asc(journalEntries.date),
      limit,
      offset,
    });

    const [totalResult] = await db.select({ count: count() }).from(journalEntries).where(where);

    return { data, total: totalResult.count };
  },

  async create(data: NewJournalEntry): Promise<JournalEntry> {
    const [result] = await db.insert(journalEntries).values(data).returning();
    return result;
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<NewJournalEntry>,
  ): Promise<JournalEntry> {
    const [result] = await db
      .update(journalEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(journalEntries.id, id), eq(journalEntries.tenantId, tenantId)))
      .returning();
    return result;
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await db
      .update(journalEntries)
      .set({ deletedAt: new Date() })
      .where(and(eq(journalEntries.id, id), eq(journalEntries.tenantId, tenantId)));
  },

  async getTotalDebits(entryId: string, tenantId: string): Promise<string> {
    const [result] = await db
      .select({ total: sum(journalEntryLines.debit) })
      .from(journalEntryLines)
      .where(
        and(
          eq(journalEntryLines.journalEntryId, entryId),
          eq(journalEntryLines.tenantId, tenantId),
        ),
      );
    return result.total ?? '0';
  },

  async getTotalCredits(entryId: string, tenantId: string): Promise<string> {
    const [result] = await db
      .select({ total: sum(journalEntryLines.credit) })
      .from(journalEntryLines)
      .where(
        and(
          eq(journalEntryLines.journalEntryId, entryId),
          eq(journalEntryLines.tenantId, tenantId),
        ),
      );
    return result.total ?? '0';
  },
};

// ─── Journal Entry Lines Repository ─────────────────────────────────────────

export const journalEntryLinesRepo = {
  async findByJournalEntryId(
    journalEntryId: string,
    tenantId: string,
  ): Promise<JournalEntryLine[]> {
    return db.query.journalEntryLines.findMany({
      where: and(
        eq(journalEntryLines.journalEntryId, journalEntryId),
        eq(journalEntryLines.tenantId, tenantId),
        isNull(journalEntryLines.deletedAt),
      ),
      orderBy: asc(journalEntryLines.createdAt),
    });
  },

  async create(data: NewJournalEntryLine): Promise<JournalEntryLine> {
    const [result] = await db.insert(journalEntryLines).values(data).returning();
    return result;
  },

  async createMany(data: NewJournalEntryLine[]): Promise<JournalEntryLine[]> {
    return db.insert(journalEntryLines).values(data).returning();
  },

  async deleteByJournalEntryId(journalEntryId: string, tenantId: string): Promise<void> {
    await db
      .update(journalEntryLines)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(journalEntryLines.journalEntryId, journalEntryId),
          eq(journalEntryLines.tenantId, tenantId),
        ),
      );
  },
};

// ─── Fiscal Years Repository ────────────────────────────────────────────────

export const fiscalYearsRepo = {
  async findById(id: string, tenantId: string): Promise<FiscalYear | undefined> {
    return db.query.fiscalYears.findFirst({
      where: and(
        eq(fiscalYears.id, id),
        eq(fiscalYears.tenantId, tenantId),
        isNull(fiscalYears.deletedAt),
      ),
    });
  },

  async findMany(
    tenantId: string,
    args?: {
      limit?: number;
      offset?: number;
      status?: string;
    },
  ): Promise<{ data: FiscalYear[]; total: number }> {
    const { limit = 50, offset = 0, status } = args ?? {};
    const conditions: SQL[] = [eq(fiscalYears.tenantId, tenantId), isNull(fiscalYears.deletedAt)];
    if (status) {
      conditions.push(eq(fiscalYears.status, status));
    }

    const where = and(...conditions);

    const data = await db.query.fiscalYears.findMany({
      where,
      orderBy: asc(fiscalYears.startDate),
      limit,
      offset,
    });

    const [totalResult] = await db.select({ count: count() }).from(fiscalYears).where(where);

    return { data, total: totalResult.count };
  },

  async create(data: NewFiscalYear): Promise<FiscalYear> {
    const [result] = await db.insert(fiscalYears).values(data).returning();
    return result;
  },

  async update(id: string, tenantId: string, data: Partial<NewFiscalYear>): Promise<FiscalYear> {
    const [result] = await db
      .update(fiscalYears)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(fiscalYears.id, id), eq(fiscalYears.tenantId, tenantId)))
      .returning();
    return result;
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await db
      .update(fiscalYears)
      .set({ deletedAt: new Date() })
      .where(and(eq(fiscalYears.id, id), eq(fiscalYears.tenantId, tenantId)));
  },

  async hasOverlap(
    startDate: Date,
    endDate: Date,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const allYears = await db.query.fiscalYears.findMany({
      where: and(eq(fiscalYears.tenantId, tenantId), isNull(fiscalYears.deletedAt)),
    });

    const startMs = startDate.getTime();
    const endMs = endDate.getTime();

    return allYears.some((fy) => {
      if (excludeId && fy.id === excludeId) return false;
      const fyStart = new Date(fy.startDate).getTime();
      const fyEnd = new Date(fy.endDate).getTime();
      // Overlap: existing.start <= new.end AND existing.end >= new.start
      return fyStart <= endMs && fyEnd >= startMs;
    });
  },

  async isDateInClosedPeriod(date: string, tenantId: string): Promise<boolean> {
    const dateMs = new Date(date).getTime();

    const closedPeriods = await db.query.fiscalYears.findMany({
      where: and(
        eq(fiscalYears.tenantId, tenantId),
        eq(fiscalYears.status, 'closed'),
        isNull(fiscalYears.deletedAt),
      ),
    });

    return closedPeriods.some((fy) => {
      const start = new Date(fy.startDate).getTime();
      const end = new Date(fy.endDate).getTime();
      return dateMs >= start && dateMs <= end;
    });
  },
};
