import { asc, count, eq, isNull, type SQL } from 'drizzle-orm';
import { db } from '../../index';
import type {
  Account,
  JournalEntry,
  JournalEntryLine,
  NewAccount,
  NewJournalEntry,
  NewJournalEntryLine,
} from './schema';
import { accounts, journalEntries, journalEntryLines } from './schema';

// ─── Accounts Repository ──────────────────────────────────────────────────────

export const accountsRepository = {
  /**
   * Find an account by ID.
   */
  async findById(id: string): Promise<Account | undefined> {
    return db.query.accounts.findFirst({
      where: eq(accounts.id, id),
    });
  },

  /**
   * Find many accounts with pagination and optional ordering.
   */
  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<{ data: Account[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(accounts.code) } = args ?? {};

    const data = await db.query.accounts.findMany({
      limit,
      offset,
      orderBy,
    });

    const total = await db.select({ count: count() }).from(accounts);

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Find an account by its unique code (e.g., "1000", "2000").
   */
  async findByCode(code: string): Promise<Account | undefined> {
    return db.query.accounts.findFirst({
      where: eq(accounts.code, code),
    });
  },

  /**
   * Find all accounts of a given type (asset, liability, equity, revenue, expense).
   */
  async findByType(
    type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense',
    args?: { limit?: number; offset?: number; orderBy?: SQL },
  ): Promise<{ data: Account[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(accounts.code) } = args ?? {};

    const data = await db.query.accounts.findMany({
      limit,
      offset,
      orderBy,
      where: eq(accounts.type, type),
    });

    const total = await db.select({ count: count() }).from(accounts).where(eq(accounts.type, type));

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Find all direct child accounts of a given parent.
   */
  async findChildAccounts(
    parentId: string,
    args?: { limit?: number; offset?: number; orderBy?: SQL },
  ): Promise<{ data: Account[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(accounts.code) } = args ?? {};

    const data = await db.query.accounts.findMany({
      limit,
      offset,
      orderBy,
      where: eq(accounts.parentId, parentId),
    });

    const total = await db
      .select({ count: count() })
      .from(accounts)
      .where(eq(accounts.parentId, parentId));

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Find all root-level accounts (no parent).
   */
  async findRootAccounts(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<{ data: Account[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(accounts.code) } = args ?? {};

    const data = await db.query.accounts.findMany({
      limit,
      offset,
      orderBy,
      where: isNull(accounts.parentId),
    });

    const total = await db
      .select({ count: count() })
      .from(accounts)
      .where(isNull(accounts.parentId));

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Find all active accounts.
   */
  async findActiveAccounts(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<{ data: Account[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(accounts.code) } = args ?? {};

    const data = await db.query.accounts.findMany({
      limit,
      offset,
      orderBy,
      where: eq(accounts.isActive, true),
    });

    const total = await db
      .select({ count: count() })
      .from(accounts)
      .where(eq(accounts.isActive, true));

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Create a new account.
   */
  async create(data: NewAccount): Promise<Account[]> {
    return db.insert(accounts).values(data).returning();
  },

  /**
   * Update an account by ID.
   */
  async update(id: string, data: Partial<NewAccount>): Promise<Account[]> {
    return db.update(accounts).set(data).where(eq(accounts.id, id)).returning();
  },

  /**
   * Delete an account by ID.
   */
  async delete(id: string): Promise<Account[]> {
    return db.delete(accounts).where(eq(accounts.id, id)).returning();
  },
};

// ─── Journal Entries Repository ───────────────────────────────────────────────

export const journalEntriesRepository = {
  /**
   * Find a journal entry by ID.
   */
  async findById(id: string): Promise<JournalEntry | undefined> {
    return db.query.journalEntries.findFirst({
      where: eq(journalEntries.id, id),
    });
  },

  /**
   * Find many journal entries with pagination and optional ordering.
   */
  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }): Promise<{
    data: JournalEntry[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(journalEntries.date) } = args ?? {};

    const data = await db.query.journalEntries.findMany({
      limit,
      offset,
      orderBy,
    });

    const total = await db.select({ count: count() }).from(journalEntries);

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Find a journal entry by its reference number.
   */
  async findByReferenceNumber(referenceNumber: string): Promise<JournalEntry | undefined> {
    return db.query.journalEntries.findFirst({
      where: eq(journalEntries.referenceNumber, referenceNumber),
    });
  },

  /**
   * Find all journal entries with a given status (draft, posted, voided).
   */
  async findByStatus(
    status: 'draft' | 'posted' | 'voided',
    args?: { limit?: number; offset?: number; orderBy?: SQL },
  ): Promise<{
    data: JournalEntry[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(journalEntries.date) } = args ?? {};

    const data = await db.query.journalEntries.findMany({
      limit,
      offset,
      orderBy,
      where: eq(journalEntries.status, status),
    });

    const total = await db
      .select({ count: count() })
      .from(journalEntries)
      .where(eq(journalEntries.status, status));

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Find all journal entries created by a specific user.
   */
  async findByCreatedBy(
    createdBy: string,
    args?: { limit?: number; offset?: number; orderBy?: SQL },
  ): Promise<{
    data: JournalEntry[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(journalEntries.date) } = args ?? {};

    const data = await db.query.journalEntries.findMany({
      limit,
      offset,
      orderBy,
      where: eq(journalEntries.createdBy, createdBy),
    });

    const total = await db
      .select({ count: count() })
      .from(journalEntries)
      .where(eq(journalEntries.createdBy, createdBy));

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Find all journal entries for a specific date.
   */
  async findByDate(
    date: string,
    args?: { limit?: number; offset?: number; orderBy?: SQL },
  ): Promise<{
    data: JournalEntry[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(journalEntries.createdAt) } = args ?? {};

    const data = await db.query.journalEntries.findMany({
      limit,
      offset,
      orderBy,
      where: eq(journalEntries.date, date),
    });

    const total = await db
      .select({ count: count() })
      .from(journalEntries)
      .where(eq(journalEntries.date, date));

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Create a new journal entry.
   */
  async create(data: NewJournalEntry): Promise<JournalEntry[]> {
    return db.insert(journalEntries).values(data).returning();
  },

  /**
   * Update a journal entry by ID.
   */
  async update(id: string, data: Partial<NewJournalEntry>): Promise<JournalEntry[]> {
    return db.update(journalEntries).set(data).where(eq(journalEntries.id, id)).returning();
  },

  /**
   * Delete a journal entry by ID.
   */
  async delete(id: string): Promise<JournalEntry[]> {
    return db.delete(journalEntries).where(eq(journalEntries.id, id)).returning();
  },
};

// ─── Journal Entry Lines Repository ───────────────────────────────────────────

export const journalEntryLinesRepository = {
  /**
   * Find a journal entry line by ID.
   */
  async findById(id: string): Promise<JournalEntryLine | undefined> {
    return db.query.journalEntryLines.findFirst({
      where: eq(journalEntryLines.id, id),
    });
  },

  /**
   * Find many journal entry lines with pagination and optional ordering.
   */
  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }): Promise<{
    data: JournalEntryLine[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(journalEntryLines.createdAt) } = args ?? {};

    const data = await db.query.journalEntryLines.findMany({
      limit,
      offset,
      orderBy,
    });

    const total = await db.select({ count: count() }).from(journalEntryLines);

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Find all lines belonging to a specific journal entry.
   */
  async findByJournalEntryId(
    journalEntryId: string,
    args?: { limit?: number; offset?: number; orderBy?: SQL },
  ): Promise<{
    data: JournalEntryLine[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(journalEntryLines.createdAt) } = args ?? {};

    const data = await db.query.journalEntryLines.findMany({
      limit,
      offset,
      orderBy,
      where: eq(journalEntryLines.journalEntryId, journalEntryId),
    });

    const total = await db
      .select({ count: count() })
      .from(journalEntryLines)
      .where(eq(journalEntryLines.journalEntryId, journalEntryId));

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Find all journal entry lines referencing a specific account.
   */
  async findByAccountId(
    accountId: string,
    args?: { limit?: number; offset?: number; orderBy?: SQL },
  ): Promise<{
    data: JournalEntryLine[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(journalEntryLines.createdAt) } = args ?? {};

    const data = await db.query.journalEntryLines.findMany({
      limit,
      offset,
      orderBy,
      where: eq(journalEntryLines.accountId, accountId),
    });

    const total = await db
      .select({ count: count() })
      .from(journalEntryLines)
      .where(eq(journalEntryLines.accountId, accountId));

    return { data, total: total[0].count, limit, offset };
  },

  /**
   * Create a new journal entry line.
   */
  async create(data: NewJournalEntryLine): Promise<JournalEntryLine[]> {
    return db.insert(journalEntryLines).values(data).returning();
  },

  /**
   * Update a journal entry line by ID.
   */
  async update(id: string, data: Partial<NewJournalEntryLine>): Promise<JournalEntryLine[]> {
    return db.update(journalEntryLines).set(data).where(eq(journalEntryLines.id, id)).returning();
  },

  /**
   * Delete a journal entry line by ID.
   */
  async delete(id: string): Promise<JournalEntryLine[]> {
    return db.delete(journalEntryLines).where(eq(journalEntryLines.id, id)).returning();
  },

  /**
   * Delete all lines belonging to a specific journal entry.
   * Used when recreating lines for a journal entry in draft status.
   */
  async deleteByJournalEntryId(journalEntryId: string): Promise<JournalEntryLine[]> {
    return db
      .delete(journalEntryLines)
      .where(eq(journalEntryLines.journalEntryId, journalEntryId))
      .returning();
  },
};
