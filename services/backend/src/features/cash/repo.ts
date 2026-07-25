/**
 * Cash & Treasury — Data Access Layer
 *
 * @module features/cash/repo
 * @description Repository layer for the BC-CASH bounded context.
 *              All queries enforce tenant isolation via tenantId filtering.
 *              Implements INV-CROSS-001 (no cross-context table access).
 *
 * @see knowledge/constitution/DOMAIN.md — INV-CROSS-001
 * @see packages/database/src/schema/cash/schema.ts — Table definitions
 * @see packages/database/src/schema/cash/repository.ts — Base repository
 */

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
} from '@lumora/database/schema';
import {
  bankAccounts,
  bankConnections,
  bankStatements,
  bankTransfers,
  currencies,
  reconciliationEntries,
} from '@lumora/database/schema';
import { and, asc, count, desc, eq, type SQL } from 'drizzle-orm';
import { db } from '../../database';

// =============================================================================
// Pagination Result
// =============================================================================

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// =============================================================================
// Bank Accounts Repository (tenant-scoped)
// =============================================================================

export const bankAccountRepo = {
  async findById(id: string, tenantId: string): Promise<BankAccount | undefined> {
    return db.query.bankAccounts.findFirst({
      where: and(eq(bankAccounts.id, id), eq(bankAccounts.tenantId, tenantId)),
    });
  },

  async findMany(
    tenantId: string,
    args?: { page?: number; limit?: number; status?: string; search?: string },
  ): Promise<PaginatedResult<BankAccount>> {
    const { page = 1, limit = 20, status, search } = args ?? {};
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(bankAccounts.tenantId, tenantId)];

    if (status) {
      conditions.push(eq(bankAccounts.status, status as BankAccount['status']));
    }
    if (search) {
      conditions.push(eq(bankAccounts.bankName, search));
    }

    const where = and(...conditions);

    const data = await db.query.bankAccounts.findMany({
      where,
      orderBy: asc(bankAccounts.bankName),
      limit,
      offset,
    });

    const [{ total }] = await db.select({ total: count() }).from(bankAccounts).where(where);

    return { data, total, page, limit };
  },

  async findByAccountNumber(
    accountNumber: string,
    tenantId: string,
  ): Promise<BankAccount | undefined> {
    return db.query.bankAccounts.findFirst({
      where: and(
        eq(bankAccounts.accountNumber, accountNumber),
        eq(bankAccounts.tenantId, tenantId),
      ),
    });
  },

  async findDefault(tenantId: string): Promise<BankAccount | undefined> {
    return db.query.bankAccounts.findFirst({
      where: and(eq(bankAccounts.tenantId, tenantId), eq(bankAccounts.isDefault, true)),
    });
  },

  async findByStatus(tenantId: string, status: BankAccount['status']): Promise<BankAccount[]> {
    return db.query.bankAccounts.findMany({
      where: and(eq(bankAccounts.tenantId, tenantId), eq(bankAccounts.status, status)),
      orderBy: asc(bankAccounts.bankName),
    });
  },

  async create(data: NewBankAccount): Promise<BankAccount> {
    const [result] = await db.insert(bankAccounts).values(data).returning();
    return result;
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<NewBankAccount>,
  ): Promise<BankAccount | undefined> {
    const [result] = await db
      .update(bankAccounts)
      .set(data)
      .where(and(eq(bankAccounts.id, id), eq(bankAccounts.tenantId, tenantId)))
      .returning();
    return result;
  },

  async softDelete(id: string, tenantId: string): Promise<BankAccount | undefined> {
    const [result] = await db
      .update(bankAccounts)
      .set({ deletedAt: new Date() })
      .where(and(eq(bankAccounts.id, id), eq(bankAccounts.tenantId, tenantId)))
      .returning();
    return result;
  },

  async countActive(tenantId: string): Promise<number> {
    const [{ total }] = await db
      .select({ total: count() })
      .from(bankAccounts)
      .where(and(eq(bankAccounts.tenantId, tenantId), eq(bankAccounts.isDefault, true)));
    return total;
  },
};

// =============================================================================
// Bank Transfers Repository (tenant-scoped)
// =============================================================================

export const bankTransferRepo = {
  async findById(id: string, tenantId: string): Promise<BankTransfer | undefined> {
    return db.query.bankTransfers.findFirst({
      where: and(eq(bankTransfers.id, id), eq(bankTransfers.tenantId, tenantId)),
    });
  },

  async findMany(
    tenantId: string,
    args?: {
      page?: number;
      limit?: number;
      status?: string;
      sourceAccountId?: string;
      destinationAccountId?: string;
    },
  ): Promise<PaginatedResult<BankTransfer>> {
    const { page = 1, limit = 20, status, sourceAccountId, destinationAccountId } = args ?? {};
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(bankTransfers.tenantId, tenantId)];

    if (status) {
      conditions.push(eq(bankTransfers.status, status as BankTransfer['status']));
    }
    if (sourceAccountId) {
      conditions.push(eq(bankTransfers.sourceAccountId, sourceAccountId));
    }
    if (destinationAccountId) {
      conditions.push(eq(bankTransfers.destinationAccountId, destinationAccountId));
    }

    const where = and(...conditions);

    const data = await db.query.bankTransfers.findMany({
      where,
      orderBy: desc(bankTransfers.createdAt),
      limit,
      offset,
    });

    const [{ total }] = await db.select({ total: count() }).from(bankTransfers).where(where);

    return { data, total, page, limit };
  },

  async findBySourceAccount(accountId: string, tenantId: string): Promise<BankTransfer[]> {
    return db.query.bankTransfers.findMany({
      where: and(
        eq(bankTransfers.sourceAccountId, accountId),
        eq(bankTransfers.tenantId, tenantId),
      ),
      orderBy: desc(bankTransfers.createdAt),
    });
  },

  async findByDestinationAccount(accountId: string, tenantId: string): Promise<BankTransfer[]> {
    return db.query.bankTransfers.findMany({
      where: and(
        eq(bankTransfers.destinationAccountId, accountId),
        eq(bankTransfers.tenantId, tenantId),
      ),
      orderBy: desc(bankTransfers.createdAt),
    });
  },

  async findPending(tenantId: string): Promise<BankTransfer[]> {
    return db.query.bankTransfers.findMany({
      where: and(eq(bankTransfers.tenantId, tenantId), eq(bankTransfers.status, 'pending')),
      orderBy: asc(bankTransfers.scheduledDate),
    });
  },

  async create(data: NewBankTransfer): Promise<BankTransfer> {
    const [result] = await db.insert(bankTransfers).values(data).returning();
    return result;
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<NewBankTransfer>,
  ): Promise<BankTransfer | undefined> {
    const [result] = await db
      .update(bankTransfers)
      .set(data)
      .where(and(eq(bankTransfers.id, id), eq(bankTransfers.tenantId, tenantId)))
      .returning();
    return result;
  },

  async softDelete(id: string, tenantId: string): Promise<BankTransfer | undefined> {
    const [result] = await db
      .update(bankTransfers)
      .set({ deletedAt: new Date() })
      .where(and(eq(bankTransfers.id, id), eq(bankTransfers.tenantId, tenantId)))
      .returning();
    return result;
  },
};

// =============================================================================
// Bank Statements Repository (tenant-scoped)
// =============================================================================

export const bankStatementRepo = {
  async findById(id: string, tenantId: string): Promise<BankStatement | undefined> {
    return db.query.bankStatements.findFirst({
      where: and(eq(bankStatements.id, id), eq(bankStatements.tenantId, tenantId)),
    });
  },

  async findMany(
    tenantId: string,
    args?: { page?: number; limit?: number; bankAccountId?: string; importStatus?: string },
  ): Promise<PaginatedResult<BankStatement>> {
    const { page = 1, limit = 20, bankAccountId, importStatus } = args ?? {};
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(bankStatements.tenantId, tenantId)];

    if (bankAccountId) {
      conditions.push(eq(bankStatements.bankAccountId, bankAccountId));
    }
    if (importStatus) {
      conditions.push(
        eq(bankStatements.importStatus, importStatus as BankStatement['importStatus']),
      );
    }

    const where = and(...conditions);

    const data = await db.query.bankStatements.findMany({
      where,
      orderBy: desc(bankStatements.statementDate),
      limit,
      offset,
    });

    const [{ total }] = await db.select({ total: count() }).from(bankStatements).where(where);

    return { data, total, page, limit };
  },

  async findByBankAccount(bankAccountId: string, tenantId: string): Promise<BankStatement[]> {
    return db.query.bankStatements.findMany({
      where: and(
        eq(bankStatements.bankAccountId, bankAccountId),
        eq(bankStatements.tenantId, tenantId),
      ),
      orderBy: desc(bankStatements.statementDate),
    });
  },

  async findByDateRange(
    tenantId: string,
    bankAccountId: string,
    _startDate: string,
    _endDate: string,
  ): Promise<BankStatement[]> {
    return db.query.bankStatements.findMany({
      where: and(
        eq(bankStatements.tenantId, tenantId),
        eq(bankStatements.bankAccountId, bankAccountId),
      ),
      orderBy: asc(bankStatements.statementDate),
    });
  },

  async create(data: NewBankStatement): Promise<BankStatement> {
    const [result] = await db.insert(bankStatements).values(data).returning();
    return result;
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<NewBankStatement>,
  ): Promise<BankStatement | undefined> {
    const [result] = await db
      .update(bankStatements)
      .set(data)
      .where(and(eq(bankStatements.id, id), eq(bankStatements.tenantId, tenantId)))
      .returning();
    return result;
  },
};

// =============================================================================
// Reconciliation Entries Repository (tenant-scoped via bank account)
// =============================================================================

export const reconciliationEntryRepo = {
  async findById(id: string, tenantId: string): Promise<ReconciliationEntry | undefined> {
    return db.query.reconciliationEntries.findFirst({
      where: and(eq(reconciliationEntries.id, id), eq(reconciliationEntries.tenantId, tenantId)),
    });
  },

  async findMany(
    tenantId: string,
    args?: {
      page?: number;
      limit?: number;
      statementId?: string;
      bankAccountId?: string;
      reconciliationStatus?: string;
    },
  ): Promise<PaginatedResult<ReconciliationEntry>> {
    const { page = 1, limit = 20, statementId, bankAccountId, reconciliationStatus } = args ?? {};
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(reconciliationEntries.tenantId, tenantId)];

    if (statementId) {
      conditions.push(eq(reconciliationEntries.statementId, statementId));
    }
    if (bankAccountId) {
      conditions.push(eq(reconciliationEntries.bankAccountId, bankAccountId));
    }
    if (reconciliationStatus) {
      conditions.push(
        eq(
          reconciliationEntries.reconciliationStatus,
          reconciliationStatus as ReconciliationEntry['reconciliationStatus'],
        ),
      );
    }

    const where = and(...conditions);

    const data = await db.query.reconciliationEntries.findMany({
      where,
      orderBy: desc(reconciliationEntries.transactionDate),
      limit,
      offset,
    });

    const [{ total }] = await db
      .select({ total: count() })
      .from(reconciliationEntries)
      .where(where);

    return { data, total, page, limit };
  },

  async findByStatement(statementId: string, tenantId: string): Promise<ReconciliationEntry[]> {
    return db.query.reconciliationEntries.findMany({
      where: and(
        eq(reconciliationEntries.statementId, statementId),
        eq(reconciliationEntries.tenantId, tenantId),
      ),
      orderBy: asc(reconciliationEntries.transactionDate),
    });
  },

  async findByBankAccount(bankAccountId: string, tenantId: string): Promise<ReconciliationEntry[]> {
    return db.query.reconciliationEntries.findMany({
      where: and(
        eq(reconciliationEntries.bankAccountId, bankAccountId),
        eq(reconciliationEntries.tenantId, tenantId),
      ),
      orderBy: desc(reconciliationEntries.transactionDate),
    });
  },

  async findUnmatched(tenantId: string): Promise<ReconciliationEntry[]> {
    return db.query.reconciliationEntries.findMany({
      where: and(
        eq(reconciliationEntries.tenantId, tenantId),
        eq(reconciliationEntries.reconciliationStatus, 'unmatched'),
      ),
      orderBy: asc(reconciliationEntries.transactionDate),
    });
  },

  async create(data: NewReconciliationEntry): Promise<ReconciliationEntry> {
    const [result] = await db.insert(reconciliationEntries).values(data).returning();
    return result;
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<NewReconciliationEntry>,
  ): Promise<ReconciliationEntry | undefined> {
    const [result] = await db
      .update(reconciliationEntries)
      .set(data)
      .where(and(eq(reconciliationEntries.id, id), eq(reconciliationEntries.tenantId, tenantId)))
      .returning();
    return result;
  },
};

// =============================================================================
// Currencies Repository (global, not tenant-scoped)
// =============================================================================

export const currencyRepo = {
  async findByCode(code: string): Promise<Currency | undefined> {
    return db.query.currencies.findFirst({
      where: eq(currencies.code, code),
    });
  },

  async findMany(args?: { page?: number; limit?: number }): Promise<PaginatedResult<Currency>> {
    const { page = 1, limit = 50 } = args ?? {};
    const offset = (page - 1) * limit;

    const data = await db.query.currencies.findMany({
      orderBy: asc(currencies.code),
      limit,
      offset,
    });

    const [{ total }] = await db.select({ total: count() }).from(currencies);

    return { data, total, page, limit };
  },

  async findActive(): Promise<Currency[]> {
    return db.query.currencies.findMany({
      where: eq(currencies.isActive, true),
      orderBy: asc(currencies.code),
    });
  },

  async create(data: NewCurrency): Promise<Currency> {
    const [result] = await db.insert(currencies).values(data).returning();
    return result;
  },

  async update(code: string, data: Partial<NewCurrency>): Promise<Currency | undefined> {
    const [result] = await db
      .update(currencies)
      .set(data)
      .where(eq(currencies.code, code))
      .returning();
    return result;
  },
};

// =============================================================================
// Bank Connections Repository (tenant-scoped)
// =============================================================================

export const bankConnectionRepo = {
  async findById(id: string, tenantId: string): Promise<BankConnection | undefined> {
    return db.query.bankConnections.findFirst({
      where: and(eq(bankConnections.id, id), eq(bankConnections.tenantId, tenantId)),
    });
  },

  async findMany(
    tenantId: string,
    args?: { page?: number; limit?: number; bankAccountId?: string; status?: string },
  ): Promise<PaginatedResult<BankConnection>> {
    const { page = 1, limit = 20, bankAccountId, status } = args ?? {};
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(bankConnections.tenantId, tenantId)];

    if (bankAccountId) {
      conditions.push(eq(bankConnections.bankAccountId, bankAccountId));
    }
    if (status) {
      conditions.push(eq(bankConnections.status, status as BankConnection['status']));
    }

    const where = and(...conditions);

    const data = await db.query.bankConnections.findMany({
      where,
      orderBy: asc(bankConnections.institutionName),
      limit,
      offset,
    });

    const [{ total }] = await db.select({ total: count() }).from(bankConnections).where(where);

    return { data, total, page, limit };
  },

  async findByBankAccount(bankAccountId: string, tenantId: string): Promise<BankConnection[]> {
    return db.query.bankConnections.findMany({
      where: and(
        eq(bankConnections.bankAccountId, bankAccountId),
        eq(bankConnections.tenantId, tenantId),
      ),
    });
  },

  async findActiveByAccount(
    bankAccountId: string,
    connectionType: string,
    tenantId: string,
  ): Promise<BankConnection | undefined> {
    return db.query.bankConnections.findFirst({
      where: and(
        eq(bankConnections.bankAccountId, bankAccountId),
        eq(bankConnections.connectionType, connectionType as BankConnection['connectionType']),
        eq(bankConnections.status, 'active'),
        eq(bankConnections.tenantId, tenantId),
      ),
    });
  },

  async create(data: NewBankConnection): Promise<BankConnection> {
    const [result] = await db.insert(bankConnections).values(data).returning();
    return result;
  },

  async update(
    id: string,
    tenantId: string,
    data: Partial<NewBankConnection>,
  ): Promise<BankConnection | undefined> {
    const [result] = await db
      .update(bankConnections)
      .set(data)
      .where(and(eq(bankConnections.id, id), eq(bankConnections.tenantId, tenantId)))
      .returning();
    return result;
  },

  async softDelete(id: string, tenantId: string): Promise<BankConnection | undefined> {
    const [result] = await db
      .update(bankConnections)
      .set({ deletedAt: new Date() })
      .where(and(eq(bankConnections.id, id), eq(bankConnections.tenantId, tenantId)))
      .returning();
    return result;
  },
};
