import { and, asc, count, desc, eq, gte, lte, type SQL } from 'drizzle-orm';

import { db } from '../../index';
import type {
  BankAccount,
  BankConnection,
  BankStatement,
  BankTransfer,
  Currency,
  NewBankAccount,
  NewBankConnection,
  NewBankStatement,
  NewBankTransfer,
  NewCurrency,
  NewReconciliationEntry,
  ReconciliationEntry,
} from './schema';
import {
  bankAccounts,
  bankConnections,
  bankStatements,
  bankTransfers,
  currencies,
  reconciliationEntries,
} from './schema';

// ─── Bank Accounts ─────────────────────────────────────────────────────────────

export const bankAccountsRepository = {
  async findById(id: string): Promise<BankAccount | undefined> {
    return db.query.bankAccounts.findFirst({ where: eq(bankAccounts.id, id) });
  },

  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<{ data: BankAccount[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(bankAccounts.id) } = args ?? {};
    const data = await db.query.bankAccounts.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(bankAccounts);
    return { data, total: total[0].count, limit, offset };
  },

  async findByTenant(
    tenantId: string,
    args?: { limit?: number; offset?: number },
  ): Promise<{ data: BankAccount[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0 } = args ?? {};
    const data = await db.query.bankAccounts.findMany({
      where: eq(bankAccounts.tenantId, tenantId),
      limit,
      offset,
    });
    const total = await db
      .select({ count: count() })
      .from(bankAccounts)
      .where(eq(bankAccounts.tenantId, tenantId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByStatus(tenantId: string, status: BankAccount['status']): Promise<BankAccount[]> {
    return db.query.bankAccounts.findMany({
      where: and(eq(bankAccounts.tenantId, tenantId), eq(bankAccounts.status, status)),
    });
  },

  async findDefault(tenantId: string): Promise<BankAccount | undefined> {
    return db.query.bankAccounts.findFirst({
      where: and(eq(bankAccounts.tenantId, tenantId), eq(bankAccounts.isDefault, true)),
    });
  },

  async create(data: NewBankAccount): Promise<BankAccount[]> {
    return db.insert(bankAccounts).values(data).returning();
  },

  async update(id: string, data: Partial<NewBankAccount>): Promise<BankAccount[]> {
    return db.update(bankAccounts).set(data).where(eq(bankAccounts.id, id)).returning();
  },

  async delete(id: string): Promise<BankAccount[]> {
    return db.delete(bankAccounts).where(eq(bankAccounts.id, id)).returning();
  },
};

// ─── Bank Transfers ────────────────────────────────────────────────────────────

export const bankTransfersRepository = {
  async findById(id: string): Promise<BankTransfer | undefined> {
    return db.query.bankTransfers.findFirst({ where: eq(bankTransfers.id, id) });
  },

  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<{ data: BankTransfer[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(bankTransfers.id) } = args ?? {};
    const data = await db.query.bankTransfers.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(bankTransfers);
    return { data, total: total[0].count, limit, offset };
  },

  async findByTenant(
    tenantId: string,
    args?: { limit?: number; offset?: number },
  ): Promise<{ data: BankTransfer[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0 } = args ?? {};
    const data = await db.query.bankTransfers.findMany({
      where: eq(bankTransfers.tenantId, tenantId),
      limit,
      offset,
    });
    const total = await db
      .select({ count: count() })
      .from(bankTransfers)
      .where(eq(bankTransfers.tenantId, tenantId));
    return { data, total: total[0].count, limit, offset };
  },

  async findBySourceAccount(accountId: string): Promise<BankTransfer[]> {
    return db.query.bankTransfers.findMany({
      where: eq(bankTransfers.sourceAccountId, accountId),
      orderBy: desc(bankTransfers.createdAt),
    });
  },

  async findByDestinationAccount(accountId: string): Promise<BankTransfer[]> {
    return db.query.bankTransfers.findMany({
      where: eq(bankTransfers.destinationAccountId, accountId),
      orderBy: desc(bankTransfers.createdAt),
    });
  },

  async findByStatus(tenantId: string, status: BankTransfer['status']): Promise<BankTransfer[]> {
    return db.query.bankTransfers.findMany({
      where: and(eq(bankTransfers.tenantId, tenantId), eq(bankTransfers.status, status)),
      orderBy: desc(bankTransfers.createdAt),
    });
  },

  async create(data: NewBankTransfer): Promise<BankTransfer[]> {
    return db.insert(bankTransfers).values(data).returning();
  },

  async update(id: string, data: Partial<NewBankTransfer>): Promise<BankTransfer[]> {
    return db.update(bankTransfers).set(data).where(eq(bankTransfers.id, id)).returning();
  },

  async delete(id: string): Promise<BankTransfer[]> {
    return db.delete(bankTransfers).where(eq(bankTransfers.id, id)).returning();
  },
};

// ─── Bank Statements ───────────────────────────────────────────────────────────

export const bankStatementsRepository = {
  async findById(id: string): Promise<BankStatement | undefined> {
    return db.query.bankStatements.findFirst({ where: eq(bankStatements.id, id) });
  },

  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<{ data: BankStatement[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(bankStatements.id) } = args ?? {};
    const data = await db.query.bankStatements.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(bankStatements);
    return { data, total: total[0].count, limit, offset };
  },

  async findByTenant(
    tenantId: string,
    args?: { limit?: number; offset?: number },
  ): Promise<{ data: BankStatement[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0 } = args ?? {};
    const data = await db.query.bankStatements.findMany({
      where: eq(bankStatements.tenantId, tenantId),
      limit,
      offset,
    });
    const total = await db
      .select({ count: count() })
      .from(bankStatements)
      .where(eq(bankStatements.tenantId, tenantId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByBankAccount(bankAccountId: string): Promise<BankStatement[]> {
    return db.query.bankStatements.findMany({
      where: eq(bankStatements.bankAccountId, bankAccountId),
      orderBy: desc(bankStatements.statementDate),
    });
  },

  async findByDateRange(
    tenantId: string,
    startDate: string,
    endDate: string,
  ): Promise<BankStatement[]> {
    return db.query.bankStatements.findMany({
      where: and(
        eq(bankStatements.tenantId, tenantId),
        gte(bankStatements.statementDate, startDate),
        lte(bankStatements.statementDate, endDate),
      ),
      orderBy: asc(bankStatements.statementDate),
    });
  },

  async findByImportStatus(
    tenantId: string,
    importStatus: BankStatement['importStatus'],
  ): Promise<BankStatement[]> {
    return db.query.bankStatements.findMany({
      where: and(
        eq(bankStatements.tenantId, tenantId),
        eq(bankStatements.importStatus, importStatus),
      ),
      orderBy: desc(bankStatements.importedAt),
    });
  },

  async create(data: NewBankStatement): Promise<BankStatement[]> {
    return db.insert(bankStatements).values(data).returning();
  },

  async update(id: string, data: Partial<NewBankStatement>): Promise<BankStatement[]> {
    return db.update(bankStatements).set(data).where(eq(bankStatements.id, id)).returning();
  },

  async delete(id: string): Promise<BankStatement[]> {
    return db.delete(bankStatements).where(eq(bankStatements.id, id)).returning();
  },
};

// ─── Reconciliation Entries ────────────────────────────────────────────────────

export const reconciliationEntriesRepository = {
  async findById(id: string): Promise<ReconciliationEntry | undefined> {
    return db.query.reconciliationEntries.findFirst({
      where: eq(reconciliationEntries.id, id),
    });
  },

  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }): Promise<{
    data: ReconciliationEntry[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(reconciliationEntries.id) } = args ?? {};
    const data = await db.query.reconciliationEntries.findMany({
      limit,
      offset,
      orderBy,
    });
    const total = await db.select({ count: count() }).from(reconciliationEntries);
    return { data, total: total[0].count, limit, offset };
  },

  async findByTenant(
    tenantId: string,
    args?: { limit?: number; offset?: number },
  ): Promise<{
    data: ReconciliationEntry[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0 } = args ?? {};
    const data = await db.query.reconciliationEntries.findMany({
      where: eq(reconciliationEntries.tenantId, tenantId),
      limit,
      offset,
    });
    const total = await db
      .select({ count: count() })
      .from(reconciliationEntries)
      .where(eq(reconciliationEntries.tenantId, tenantId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByStatement(statementId: string): Promise<ReconciliationEntry[]> {
    return db.query.reconciliationEntries.findMany({
      where: eq(reconciliationEntries.statementId, statementId),
      orderBy: asc(reconciliationEntries.transactionDate),
    });
  },

  async findByBankAccount(bankAccountId: string): Promise<ReconciliationEntry[]> {
    return db.query.reconciliationEntries.findMany({
      where: eq(reconciliationEntries.bankAccountId, bankAccountId),
      orderBy: desc(reconciliationEntries.transactionDate),
    });
  },

  async findByStatus(
    tenantId: string,
    status: ReconciliationEntry['reconciliationStatus'],
  ): Promise<ReconciliationEntry[]> {
    return db.query.reconciliationEntries.findMany({
      where: and(
        eq(reconciliationEntries.tenantId, tenantId),
        eq(reconciliationEntries.reconciliationStatus, status),
      ),
      orderBy: desc(reconciliationEntries.transactionDate),
    });
  },

  async create(data: NewReconciliationEntry): Promise<ReconciliationEntry[]> {
    return db.insert(reconciliationEntries).values(data).returning();
  },

  async update(id: string, data: Partial<NewReconciliationEntry>): Promise<ReconciliationEntry[]> {
    return db
      .update(reconciliationEntries)
      .set(data)
      .where(eq(reconciliationEntries.id, id))
      .returning();
  },

  async delete(id: string): Promise<ReconciliationEntry[]> {
    return db.delete(reconciliationEntries).where(eq(reconciliationEntries.id, id)).returning();
  },
};

// ─── Currencies ────────────────────────────────────────────────────────────────
// Note: currencies uses `code` as the business key (not uuid PK lookup).

export const currenciesRepository = {
  async findByCode(code: string): Promise<Currency | undefined> {
    return db.query.currencies.findFirst({ where: eq(currencies.code, code) });
  },

  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<{ data: Currency[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(currencies.code) } = args ?? {};
    const data = await db.query.currencies.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(currencies);
    return { data, total: total[0].count, limit, offset };
  },

  async findActive(): Promise<Currency[]> {
    return db.query.currencies.findMany({
      where: eq(currencies.isActive, true),
      orderBy: asc(currencies.code),
    });
  },

  async create(data: NewCurrency): Promise<Currency[]> {
    return db.insert(currencies).values(data).returning();
  },

  async update(code: string, data: Partial<NewCurrency>): Promise<Currency[]> {
    return db.update(currencies).set(data).where(eq(currencies.code, code)).returning();
  },

  async delete(code: string): Promise<Currency[]> {
    return db.delete(currencies).where(eq(currencies.code, code)).returning();
  },
};

// ─── Bank Connections ──────────────────────────────────────────────────────────

export const bankConnectionsRepository = {
  async findById(id: string): Promise<BankConnection | undefined> {
    return db.query.bankConnections.findFirst({
      where: eq(bankConnections.id, id),
    });
  },

  async findMany(args?: {
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<{ data: BankConnection[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(bankConnections.id) } = args ?? {};
    const data = await db.query.bankConnections.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(bankConnections);
    return { data, total: total[0].count, limit, offset };
  },

  async findByTenant(
    tenantId: string,
    args?: { limit?: number; offset?: number },
  ): Promise<{ data: BankConnection[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0 } = args ?? {};
    const data = await db.query.bankConnections.findMany({
      where: eq(bankConnections.tenantId, tenantId),
      limit,
      offset,
    });
    const total = await db
      .select({ count: count() })
      .from(bankConnections)
      .where(eq(bankConnections.tenantId, tenantId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByBankAccount(bankAccountId: string): Promise<BankConnection[]> {
    return db.query.bankConnections.findMany({
      where: eq(bankConnections.bankAccountId, bankAccountId),
    });
  },

  async findByStatus(
    tenantId: string,
    status: BankConnection['status'],
  ): Promise<BankConnection[]> {
    return db.query.bankConnections.findMany({
      where: and(eq(bankConnections.tenantId, tenantId), eq(bankConnections.status, status)),
    });
  },

  async create(data: NewBankConnection): Promise<BankConnection[]> {
    return db.insert(bankConnections).values(data).returning();
  },

  async update(id: string, data: Partial<NewBankConnection>): Promise<BankConnection[]> {
    return db.update(bankConnections).set(data).where(eq(bankConnections.id, id)).returning();
  },

  async delete(id: string): Promise<BankConnection[]> {
    return db.delete(bankConnections).where(eq(bankConnections.id, id)).returning();
  },
};
