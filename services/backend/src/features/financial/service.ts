import { db } from '@lumora/database';
import { accounts, journalEntries, journalEntryLines } from '@lumora/database/schema';
import { eq } from 'drizzle-orm';
import {
  AccountCodeAlreadyExistsError,
  AccountHasChildAccountsError,
  AccountHasTransactionsError,
  AccountNotFoundError,
  ClosedPeriodError,
  FiscalYearNotFoundError,
  FiscalYearNotOpenError,
  FiscalYearOverlapError,
  JournalEntryAlreadyPostedError,
  JournalEntryNotBalancedError,
  JournalEntryNotDraftError,
  JournalEntryNotFoundError,
} from './errors';
import { accountsRepo, fiscalYearsRepo, journalEntriesRepo, journalEntryLinesRepo } from './repo';
import type {
  AccountResponse,
  CreateAccountRequest,
  CreateFiscalYearRequest,
  CreateJournalEntryRequest,
  FiscalYearResponse,
  JournalEntryResponse,
  ListResponse,
  PaginationParams,
  UpdateAccountRequest,
  UpdateFiscalYearRequest,
  UpdateJournalEntryRequest,
} from './types';

// ─── Account Service ────────────────────────────────────────────────────────

export async function createAccount(
  data: CreateAccountRequest,
  tenantId: string,
): Promise<AccountResponse> {
  // BR-001: Validate code uniqueness within tenant
  const existing = await accountsRepo.findByCode(data.code, tenantId);
  if (existing) {
    throw new AccountCodeAlreadyExistsError(data.code);
  }

  return accountsRepo.create({
    ...data,
    tenantId,
    balance: '0',
  });
}

export async function getAccount(id: string, tenantId: string): Promise<AccountResponse> {
  const account = await accountsRepo.findById(id, tenantId);
  if (!account) {
    throw new AccountNotFoundError(id);
  }
  return account;
}

export async function listAccounts(
  tenantId: string,
  params: PaginationParams & {
    type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  },
): Promise<ListResponse<AccountResponse>> {
  const offset = (params.page - 1) * params.limit;
  const { data, total } = await accountsRepo.findMany(tenantId, {
    limit: params.limit,
    offset,
    type: params.type,
  });

  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function updateAccount(
  id: string,
  data: UpdateAccountRequest,
  tenantId: string,
): Promise<AccountResponse> {
  const existing = await accountsRepo.findById(id, tenantId);
  if (!existing) {
    throw new AccountNotFoundError(id);
  }

  // If updating code, check uniqueness
  if (data.code && data.code !== existing.code) {
    const duplicate = await accountsRepo.findByCode(data.code, tenantId);
    if (duplicate) {
      throw new AccountCodeAlreadyExistsError(data.code);
    }
  }

  return accountsRepo.update(id, tenantId, data);
}

export async function deleteAccount(id: string, tenantId: string): Promise<void> {
  const existing = await accountsRepo.findById(id, tenantId);
  if (!existing) {
    throw new AccountNotFoundError(id);
  }

  // INV-FIN-005: Cannot delete account with child accounts
  const childCount = await accountsRepo.countByParentId(id, tenantId);
  if (childCount > 0) {
    throw new AccountHasChildAccountsError(id);
  }

  // Cannot delete account with existing journal entry lines
  const lineCount = await accountsRepo.countLinesByAccountId(id, tenantId);
  if (lineCount > 0) {
    throw new AccountHasTransactionsError(id);
  }

  await accountsRepo.delete(id, tenantId);
}

// ─── Journal Entry Service ──────────────────────────────────────────────────

function validateLinesBalance(lines: { debit: string; credit: string }[]): {
  totalDebits: string;
  totalCredits: string;
} {
  const totalDebits = lines.reduce((sum, line) => sum + Number(line.debit), 0).toFixed(4);
  const totalCredits = lines.reduce((sum, line) => sum + Number(line.credit), 0).toFixed(4);

  if (totalDebits !== totalCredits) {
    throw new JournalEntryNotBalancedError(totalDebits, totalCredits);
  }

  return { totalDebits, totalCredits };
}

export async function createJournalEntry(
  data: CreateJournalEntryRequest,
  tenantId: string,
  userId: string,
): Promise<JournalEntryResponse> {
  // INV-FIN-001: Journal entries must balance
  validateLinesBalance(data.lines);

  // INV-FIN-002: Closed periods cannot be modified
  const isClosed = await fiscalYearsRepo.isDateInClosedPeriod(data.date, tenantId);
  if (isClosed) {
    throw new ClosedPeriodError(data.date);
  }

  // Create entry and lines in a transaction
  const entry = await db.transaction(async (tx) => {
    // Create the journal entry
    const [journalEntry] = await tx
      .insert(journalEntries)
      .values({
        date: data.date,
        description: data.description,
        referenceNumber: data.referenceNumber,
        status: 'draft',
        tenantId,
        createdBy: userId,
      })
      .returning();

    // Create the journal entry lines
    const lineValues = data.lines.map((line) => ({
      journalEntryId: journalEntry.id,
      accountId: line.accountId,
      debit: line.debit,
      credit: line.credit,
      description: line.description,
      tenantId,
    }));

    await tx.insert(journalEntryLines).values(lineValues);

    return journalEntry;
  });

  // Fetch lines to return complete response
  const lines = await journalEntryLinesRepo.findByJournalEntryId(entry.id, tenantId);

  return { ...entry, lines };
}

export async function getJournalEntry(id: string, tenantId: string): Promise<JournalEntryResponse> {
  const entry = await journalEntriesRepo.findById(id, tenantId);
  if (!entry) {
    throw new JournalEntryNotFoundError(id);
  }

  const lines = await journalEntryLinesRepo.findByJournalEntryId(id, tenantId);

  return { ...entry, lines };
}

export async function listJournalEntries(
  tenantId: string,
  params: PaginationParams & {
    status?: 'draft' | 'posted' | 'voided';
  },
): Promise<ListResponse<JournalEntryResponse>> {
  const offset = (params.page - 1) * params.limit;
  const { data, total } = await journalEntriesRepo.findMany(tenantId, {
    limit: params.limit,
    offset,
    status: params.status,
  });

  // Enrich with lines
  const entriesWithLines: JournalEntryResponse[] = await Promise.all(
    data.map(async (entry) => {
      const lines = await journalEntryLinesRepo.findByJournalEntryId(entry.id, tenantId);
      return { ...entry, lines };
    }),
  );

  return {
    data: entriesWithLines,
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function updateJournalEntry(
  id: string,
  data: UpdateJournalEntryRequest,
  tenantId: string,
): Promise<JournalEntryResponse> {
  const existing = await journalEntriesRepo.findById(id, tenantId);
  if (!existing) {
    throw new JournalEntryNotFoundError(id);
  }

  // INV-FIN-002: Only draft entries can be modified
  if (existing.status !== 'draft') {
    throw new JournalEntryNotDraftError(id, existing.status);
  }

  // If lines are being updated, validate balance
  if (data.lines) {
    validateLinesBalance(data.lines);
  }

  // If date is being updated, check period
  const newDate = data.date ?? existing.date;
  const isClosed = await fiscalYearsRepo.isDateInClosedPeriod(newDate, tenantId);
  if (isClosed) {
    throw new ClosedPeriodError(newDate);
  }

  // Update entry and optionally replace lines
  await db.transaction(async (tx) => {
    // Update the journal entry
    await tx
      .update(journalEntries)
      .set({
        ...(data.date && { date: data.date }),
        ...(data.description && { description: data.description }),
        ...(data.referenceNumber !== undefined && {
          referenceNumber: data.referenceNumber,
        }),
        updatedAt: new Date(),
      })
      .where(eq(journalEntries.id, id));

    // If lines provided, replace them
    if (data.lines) {
      // Soft-delete existing lines
      await tx
        .update(journalEntryLines)
        .set({ deletedAt: new Date() })
        .where(eq(journalEntryLines.journalEntryId, id));

      // Insert new lines
      const lineValues = data.lines.map((line) => ({
        journalEntryId: id,
        accountId: line.accountId,
        debit: line.debit,
        credit: line.credit,
        description: line.description,
        tenantId,
      }));

      await tx.insert(journalEntryLines).values(lineValues);
    }
  });

  return getJournalEntry(id, tenantId);
}

export async function postJournalEntry(
  id: string,
  tenantId: string,
  _userId: string,
): Promise<JournalEntryResponse> {
  const entry = await journalEntriesRepo.findById(id, tenantId);
  if (!entry) {
    throw new JournalEntryNotFoundError(id);
  }

  // INV-FIN-002: Already posted entries cannot be posted again
  if (entry.status === 'posted') {
    throw new JournalEntryAlreadyPostedError(id);
  }

  // Only draft entries can be posted
  if (entry.status !== 'draft') {
    throw new JournalEntryNotDraftError(id, entry.status);
  }

  // INV-FIN-001: Verify balance before posting
  const totalDebits = await journalEntriesRepo.getTotalDebits(id, tenantId);
  const totalCredits = await journalEntriesRepo.getTotalCredits(id, tenantId);

  if (Number(totalDebits) !== Number(totalCredits)) {
    throw new JournalEntryNotBalancedError(totalDebits, totalCredits);
  }

  // INV-FIN-002: Check period is open
  const isClosed = await fiscalYearsRepo.isDateInClosedPeriod(entry.date, tenantId);
  if (isClosed) {
    throw new ClosedPeriodError(entry.date);
  }

  // Update account balances and post entry
  await db.transaction(async (tx) => {
    // Fetch lines for balance updates
    const lines = await tx.query.journalEntryLines.findMany({
      where: eq(journalEntryLines.journalEntryId, id),
    });

    // Update account balances: balance += (debit - credit)
    for (const line of lines) {
      const netAmount = Number(line.debit) > 0 ? Number(line.debit) : -Number(line.credit);

      if (netAmount !== 0) {
        await tx
          .update(accounts)
          .set({
            balance: String(
              Number(
                (
                  await tx.query.accounts.findFirst({
                    where: eq(accounts.id, line.accountId),
                  })
                )?.balance ?? '0',
              ) + netAmount,
            ),
            updatedAt: new Date(),
          })
          .where(eq(accounts.id, line.accountId));
      }
    }

    // Update journal entry status
    await tx
      .update(journalEntries)
      .set({ status: 'posted', updatedAt: new Date() })
      .where(eq(journalEntries.id, id));
  });

  return getJournalEntry(id, tenantId);
}

export async function voidJournalEntry(
  id: string,
  tenantId: string,
): Promise<JournalEntryResponse> {
  const entry = await journalEntriesRepo.findById(id, tenantId);
  if (!entry) {
    throw new JournalEntryNotFoundError(id);
  }

  // Only posted entries can be voided
  if (entry.status !== 'posted') {
    throw new JournalEntryNotDraftError(id, entry.status);
  }

  // Reverse account balances and void entry
  await db.transaction(async (tx) => {
    // Fetch lines for balance reversal
    const lines = await tx.query.journalEntryLines.findMany({
      where: eq(journalEntryLines.journalEntryId, id),
    });

    // Reverse account balances: balance -= (debit - credit)
    for (const line of lines) {
      const netAmount = Number(line.debit) > 0 ? Number(line.debit) : -Number(line.credit);

      if (netAmount !== 0) {
        await tx
          .update(accounts)
          .set({
            balance: String(
              Number(
                (
                  await tx.query.accounts.findFirst({
                    where: eq(accounts.id, line.accountId),
                  })
                )?.balance ?? '0',
              ) - netAmount,
            ),
            updatedAt: new Date(),
          })
          .where(eq(accounts.id, line.accountId));
      }
    }

    // Update journal entry status
    await tx
      .update(journalEntries)
      .set({ status: 'voided', updatedAt: new Date() })
      .where(eq(journalEntries.id, id));
  });

  return getJournalEntry(id, tenantId);
}

// ─── Fiscal Year Service ────────────────────────────────────────────────────

export async function createFiscalYear(
  data: CreateFiscalYearRequest,
  tenantId: string,
): Promise<FiscalYearResponse> {
  // Check for overlapping fiscal years
  const hasOverlap = await fiscalYearsRepo.hasOverlap(
    new Date(data.startDate),
    new Date(data.endDate),
    tenantId,
  );
  if (hasOverlap) {
    throw new FiscalYearOverlapError(data.name);
  }

  return fiscalYearsRepo.create({
    name: data.name,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    status: 'open',
    tenantId,
  });
}

export async function getFiscalYear(id: string, tenantId: string): Promise<FiscalYearResponse> {
  const fy = await fiscalYearsRepo.findById(id, tenantId);
  if (!fy) {
    throw new FiscalYearNotFoundError(id);
  }
  return fy;
}

export async function listFiscalYears(
  tenantId: string,
  params: PaginationParams,
): Promise<ListResponse<FiscalYearResponse>> {
  const offset = (params.page - 1) * params.limit;
  const { data, total } = await fiscalYearsRepo.findMany(tenantId, {
    limit: params.limit,
    offset,
  });

  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function updateFiscalYear(
  id: string,
  data: UpdateFiscalYearRequest,
  tenantId: string,
): Promise<FiscalYearResponse> {
  const existing = await fiscalYearsRepo.findById(id, tenantId);
  if (!existing) {
    throw new FiscalYearNotFoundError(id);
  }

  // Cannot change name/dates of a closed fiscal year
  if (existing.status === 'closed' && (data.name || data.status === 'open')) {
    throw new FiscalYearNotOpenError(id, existing.status);
  }

  return fiscalYearsRepo.update(id, tenantId, data);
}

export async function closeFiscalYear(id: string, tenantId: string): Promise<FiscalYearResponse> {
  const existing = await fiscalYearsRepo.findById(id, tenantId);
  if (!existing) {
    throw new FiscalYearNotFoundError(id);
  }

  if (existing.status !== 'open') {
    throw new FiscalYearNotOpenError(id, existing.status);
  }

  // INV-FIN-002: Ensure all draft entries in this period are posted or voided
  const draftEntries = await journalEntriesRepo.findMany(tenantId, {
    status: 'draft',
  });

  const startDate = new Date(existing.startDate).getTime();
  const endDate = new Date(existing.endDate).getTime();

  const draftInPeriod = draftEntries.data.filter((entry) => {
    const entryDate = new Date(entry.date).getTime();
    return entryDate >= startDate && entryDate <= endDate;
  });

  if (draftInPeriod.length > 0) {
    throw new ClosedPeriodError(
      `Cannot close period: ${draftInPeriod.length} draft journal entries remain`,
    );
  }

  return fiscalYearsRepo.update(id, tenantId, { status: 'closed' });
}
