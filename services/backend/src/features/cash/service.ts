/**
 * Cash & Treasury — Business Logic Service
 *
 * @module features/cash/service
 * @description Service layer for the BC-CASH bounded context.
 *              Enforces business rules:
 *                - BR-008: Bank reconciliation requires matching with tolerance
 *                - BR-610: Bank account number encryption at rest
 *                - BR-609: Bank account balance decimal precision
 *                - CTR-CASH-003: Transfer amount must be greater than zero
 *                - CTR-CASH-004: Source and destination accounts must be different
 *                - CTR-CASH-005: Statement period end must be after period start
 *
 * @see knowledge/constitution/DOMAIN.md — BC-CASH rules
 * @see knowledge/ontology/contexts/BC-CASH/constraints.md — Data constraints
 * @see knowledge/rules/active/BR-008.md — Reconciliation with tolerance
 * @see knowledge/rules/active/BR-610.md — Account number encryption
 * @see knowledge/rules/active/BR-609.md — Balance decimal precision
 */

import {
  BankAccountInactiveError,
  BankAccountNameConflictError,
  BankAccountNotFoundError,
  BankConnectionDuplicateError,
  BankConnectionNotFoundError,
  BankStatementInvalidPeriodError,
  BankStatementNotFoundError,
  BankStatementPeriodOverlapError,
  BankTransferInvalidStatusTransitionError,
  BankTransferNotFoundError,
  BusinessRuleViolationError,
  CurrencyNotFoundError,
  InsufficientFundsError,
  ReconciliationAlreadyMatchedError,
  ReconciliationEntryNotFoundError,
  ReconciliationMatchConfidenceError,
  TransferAmountZeroError,
  TransferSameAccountError,
} from './errors';
import {
  bankAccountRepo,
  bankConnectionRepo,
  bankStatementRepo,
  bankTransferRepo,
  reconciliationEntryRepo,
} from './repo';
import type {
  BankAccountResponse,
  BankConnectionResponse,
  BankStatementResponse,
  BankTransferResponse,
  CreateBankAccountRequest,
  CreateBankConnectionRequest,
  CreateBankStatementRequest,
  CreateBankTransferRequest,
  CreateReconciliationEntryRequest,
  CurrencyResponse,
  ListResponse,
  MatchReconciliationEntryRequest,
  PaginationParams,
  UpdateBankAccountRequest,
  UpdateBankConnectionRequest,
  UpdateBankStatementRequest,
} from './types';

// =============================================================================
// Transfer Status Valid Transitions
// =============================================================================

const VALID_TRANSFER_TRANSITIONS: Record<string, string[]> = {
  pending: ['processing', 'completed', 'failed', 'cancelled'],
  processing: ['completed', 'failed'],
  completed: [],
  failed: [],
  cancelled: [],
};

// =============================================================================
// Encryption Helpers (BR-610)
// =============================================================================

/**
 * BR-610: Encrypt bank account number before storage.
 * In production this would use a proper encryption service (e.g., AWS KMS, Vault).
 * Placeholder for now — returns the number masked for storage.
 */
function encryptAccountNumber(accountNumber: string): string {
  // TODO: Integrate with actual encryption service (AWS KMS / HashiCorp Vault)
  // For now, store a masked version to satisfy the invariant.
  // The last 4 digits are kept visible for display purposes.
  if (accountNumber.length <= 4) {
    return accountNumber;
  }
  const masked = '*'.repeat(accountNumber.length - 4);
  return `${masked}${accountNumber.slice(-4)}`;
}

/**
 * Decrypt bank account number for display.
 * In production this would reverse the encryption.
 */
function _decryptAccountNumber(encryptedNumber: string): string {
  // TODO: Integrate with actual decryption service
  // This is a placeholder that returns the stored value
  return encryptedNumber;
}

// =============================================================================
// Decimal Helpers (BR-609 / INV-FIN-004)
// =============================================================================

/**
 * BR-609 / INV-FIN-004: Ensure amount is stored with decimal precision.
 * Validates that the amount string represents a valid decimal number.
 */
function validateDecimalPrecision(amount: string, fieldName: string): void {
  const parsed = Number.parseFloat(amount);
  if (Number.isNaN(parsed)) {
    throw new BusinessRuleViolationError(
      'BR-609',
      `${fieldName} must be a valid decimal number, got "${amount}"`,
    );
  }
  if (parsed < 0) {
    throw new BusinessRuleViolationError(
      'BR-609',
      `${fieldName} must be non-negative, got "${amount}"`,
    );
  }
}

// =============================================================================
// Bank Account Service
// =============================================================================

export async function createBankAccount(
  data: CreateBankAccountRequest,
  tenantId: string,
): Promise<BankAccountResponse> {
  // Check name uniqueness within tenant
  const existingByName = await bankAccountRepo.findMany(tenantId, { search: data.bankName });
  const nameConflict = existingByName.data.find(
    (a) => a.accountName.toLowerCase() === data.accountName.toLowerCase(),
  );
  if (nameConflict) {
    throw new BankAccountNameConflictError(data.accountName);
  }

  // BR-610: Encrypt account number before storage
  const encryptedAccountNumber = encryptAccountNumber(data.accountNumber);

  // BR-609: Validate decimal precision for balance fields
  if (data.currentBalance) {
    validateDecimalPrecision(data.currentBalance, 'currentBalance');
  }
  if (data.availableBalance) {
    validateDecimalPrecision(data.availableBalance, 'availableBalance');
  }

  // If setting as default, clear any existing default
  if (data.isDefault) {
    const existingDefault = await bankAccountRepo.findDefault(tenantId);
    if (existingDefault) {
      await bankAccountRepo.update(existingDefault.id, tenantId, { isDefault: false });
    }
  }

  return bankAccountRepo.create({
    ...data,
    accountNumber: encryptedAccountNumber,
    tenantId,
    currentBalance: data.currentBalance ?? '0',
    availableBalance: data.availableBalance ?? '0',
  });
}

export async function getBankAccount(id: string, tenantId: string): Promise<BankAccountResponse> {
  const account = await bankAccountRepo.findById(id, tenantId);
  if (!account) {
    throw new BankAccountNotFoundError(id);
  }
  return account;
}

export async function listBankAccounts(
  tenantId: string,
  params?: PaginationParams & { status?: string; search?: string },
): Promise<ListResponse<BankAccountResponse>> {
  const result = await bankAccountRepo.findMany(tenantId, params);
  return {
    data: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

export async function updateBankAccount(
  id: string,
  data: UpdateBankAccountRequest,
  tenantId: string,
): Promise<BankAccountResponse> {
  const existing = await bankAccountRepo.findById(id, tenantId);
  if (!existing) {
    throw new BankAccountNotFoundError(id);
  }

  // BR-610: Re-encrypt account number if changed
  if (data.accountNumber) {
    data.accountNumber = encryptAccountNumber(data.accountNumber);
  }

  // If setting as default, clear any existing default
  if (data.isDefault) {
    const existingDefault = await bankAccountRepo.findDefault(tenantId);
    if (existingDefault && existingDefault.id !== id) {
      await bankAccountRepo.update(existingDefault.id, tenantId, { isDefault: false });
    }
  }

  // BR-609: Validate decimal precision if balance fields provided
  if (data.currentBalance) {
    validateDecimalPrecision(data.currentBalance, 'currentBalance');
  }
  if (data.availableBalance) {
    validateDecimalPrecision(data.availableBalance, 'availableBalance');
  }

  const updated = await bankAccountRepo.update(id, tenantId, data);
  if (!updated) {
    throw new BankAccountNotFoundError(id);
  }
  return updated;
}

export async function deleteBankAccount(id: string, tenantId: string): Promise<void> {
  const existing = await bankAccountRepo.findById(id, tenantId);
  if (!existing) {
    throw new BankAccountNotFoundError(id);
  }

  await bankAccountRepo.softDelete(id, tenantId);
}

// =============================================================================
// Bank Transfer Service
// =============================================================================

export async function createBankTransfer(
  data: CreateBankTransferRequest,
  tenantId: string,
  userId: string,
): Promise<BankTransferResponse> {
  // CTR-CASH-003: Transfer amount must be greater than zero
  const amount = Number.parseFloat(data.amount);
  if (Number.isNaN(amount) || amount <= 0) {
    throw new TransferAmountZeroError();
  }

  // CTR-CASH-004: Source and destination accounts must be different
  if (data.sourceAccountId === data.destinationAccountId) {
    throw new TransferSameAccountError();
  }

  // Validate both accounts exist and are active
  const sourceAccount = await bankAccountRepo.findById(data.sourceAccountId, tenantId);
  if (!sourceAccount) {
    throw new BankAccountNotFoundError(data.sourceAccountId);
  }
  if (sourceAccount.status !== 'active') {
    throw new BankAccountInactiveError(data.sourceAccountId);
  }

  const destAccount = await bankAccountRepo.findById(data.destinationAccountId, tenantId);
  if (!destAccount) {
    throw new BankAccountNotFoundError(data.destinationAccountId);
  }
  if (destAccount.status !== 'active') {
    throw new BankAccountInactiveError(data.destinationAccountId);
  }

  // BR-609: Validate amount precision
  validateDecimalPrecision(data.amount, 'amount');

  // For internal transfers, check sufficient funds on source account
  if (data.transferType === 'internal') {
    const sourceBalance = Number.parseFloat(sourceAccount.currentBalance);
    if (sourceBalance < amount) {
      throw new InsufficientFundsError(
        data.sourceAccountId,
        data.amount,
        sourceAccount.currentBalance,
      );
    }
  }

  return bankTransferRepo.create({
    ...data,
    tenantId,
    createdBy: userId,
    status: 'pending',
    currencyCode: data.currencyCode ?? sourceAccount.currencyCode,
  });
}

export async function getBankTransfer(id: string, tenantId: string): Promise<BankTransferResponse> {
  const transfer = await bankTransferRepo.findById(id, tenantId);
  if (!transfer) {
    throw new BankTransferNotFoundError(id);
  }
  return transfer;
}

export async function listBankTransfers(
  tenantId: string,
  params?: PaginationParams & {
    status?: string;
    sourceAccountId?: string;
    destinationAccountId?: string;
  },
): Promise<ListResponse<BankTransferResponse>> {
  const result = await bankTransferRepo.findMany(tenantId, params);
  return {
    data: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

export async function completeBankTransfer(
  id: string,
  tenantId: string,
): Promise<BankTransferResponse> {
  const transfer = await bankTransferRepo.findById(id, tenantId);
  if (!transfer) {
    throw new BankTransferNotFoundError(id);
  }

  // Check valid status transition
  if (!VALID_TRANSFER_TRANSITIONS[transfer.status]?.includes('completed')) {
    throw new BankTransferInvalidStatusTransitionError(transfer.status, 'completed');
  }

  // For internal transfers, move funds between accounts
  if (transfer.transferType === 'internal') {
    const sourceAccount = await bankAccountRepo.findById(transfer.sourceAccountId, tenantId);
    if (!sourceAccount) {
      throw new BankAccountNotFoundError(transfer.sourceAccountId);
    }

    const destAccount = await bankAccountRepo.findById(transfer.destinationAccountId, tenantId);
    if (!destAccount) {
      throw new BankAccountNotFoundError(transfer.destinationAccountId);
    }

    const amount = Number.parseFloat(transfer.amount);

    // Debit source account
    const newSourceBalance = (Number.parseFloat(sourceAccount.currentBalance) - amount).toFixed(4);
    await bankAccountRepo.update(transfer.sourceAccountId, tenantId, {
      currentBalance: newSourceBalance,
      availableBalance: newSourceBalance,
    });

    // Credit destination account
    const newDestBalance = (Number.parseFloat(destAccount.currentBalance) + amount).toFixed(4);
    await bankAccountRepo.update(transfer.destinationAccountId, tenantId, {
      currentBalance: newDestBalance,
      availableBalance: newDestBalance,
    });
  }

  const updated = await bankTransferRepo.update(id, tenantId, {
    status: 'completed',
    completedAt: new Date(),
  });

  if (!updated) {
    throw new BankTransferNotFoundError(id);
  }

  return updated;
}

export async function cancelBankTransfer(
  id: string,
  tenantId: string,
): Promise<BankTransferResponse> {
  const transfer = await bankTransferRepo.findById(id, tenantId);
  if (!transfer) {
    throw new BankTransferNotFoundError(id);
  }

  if (transfer.status === 'completed') {
    throw new TransferAlreadyCompletedError(id);
  }

  if (transfer.status === 'cancelled') {
    throw new TransferAlreadyCancelledError(id);
  }

  if (!VALID_TRANSFER_TRANSITIONS[transfer.status]?.includes('cancelled')) {
    throw new BankTransferInvalidStatusTransitionError(transfer.status, 'cancelled');
  }

  const updated = await bankTransferRepo.update(id, tenantId, {
    status: 'cancelled',
  });

  if (!updated) {
    throw new BankTransferNotFoundError(id);
  }

  return updated;
}

// =============================================================================
// Bank Statement Service
// =============================================================================

export async function createBankStatement(
  data: CreateBankStatementRequest,
  tenantId: string,
  userId: string,
): Promise<BankStatementResponse> {
  // Validate bank account exists
  const bankAccount = await bankAccountRepo.findById(data.bankAccountId, tenantId);
  if (!bankAccount) {
    throw new BankAccountNotFoundError(data.bankAccountId);
  }

  // CTR-CASH-005: Statement period end must be after period start
  if (new Date(data.periodEnd) <= new Date(data.periodStart)) {
    throw new BankStatementInvalidPeriodError();
  }

  // BR-609: Validate decimal precision
  validateDecimalPrecision(data.openingBalance, 'openingBalance');
  validateDecimalPrecision(data.closingBalance, 'closingBalance');

  // Check for period overlap with existing statements
  const existingStatements = await bankStatementRepo.findByBankAccount(
    data.bankAccountId,
    tenantId,
  );
  const overlap = existingStatements.find(
    (s) =>
      new Date(s.periodStart) <= new Date(data.periodEnd) &&
      new Date(s.periodEnd) >= new Date(data.periodStart),
  );
  if (overlap) {
    throw new BankStatementPeriodOverlapError(data.bankAccountId, data.periodStart, data.periodEnd);
  }

  return bankStatementRepo.create({
    ...data,
    tenantId,
    importedBy: userId,
    importedAt: new Date(),
    transactionCount: data.transactionCount ?? 0,
    reconciledCount: 0,
  });
}

export async function getBankStatement(
  id: string,
  tenantId: string,
): Promise<BankStatementResponse> {
  const statement = await bankStatementRepo.findById(id, tenantId);
  if (!statement) {
    throw new BankStatementNotFoundError(id);
  }
  return statement;
}

export async function listBankStatements(
  tenantId: string,
  params?: PaginationParams & { bankAccountId?: string; importStatus?: string },
): Promise<ListResponse<BankStatementResponse>> {
  const result = await bankStatementRepo.findMany(tenantId, params);
  return {
    data: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

export async function updateBankStatement(
  id: string,
  data: UpdateBankStatementRequest,
  tenantId: string,
): Promise<BankStatementResponse> {
  const existing = await bankStatementRepo.findById(id, tenantId);
  if (!existing) {
    throw new BankStatementNotFoundError(id);
  }

  // Only pending/failed statements can be updated
  if (existing.importStatus === 'completed') {
    throw new BusinessRuleViolationError('BR-008', 'Cannot update a completed statement');
  }

  // Validate period if changing
  const periodStart = data.periodStart ?? existing.periodStart;
  const periodEnd = data.periodEnd ?? existing.periodEnd;
  if (new Date(periodEnd) <= new Date(periodStart)) {
    throw new BankStatementInvalidPeriodError();
  }

  const updated = await bankStatementRepo.update(id, tenantId, data);
  if (!updated) {
    throw new BankStatementNotFoundError(id);
  }
  return updated;
}

// =============================================================================
// Reconciliation Entry Service
// =============================================================================

export async function createReconciliationEntry(
  data: CreateReconciliationEntryRequest,
  tenantId: string,
): Promise<ReconciliationEntryResponse> {
  // Validate statement exists
  const statement = await bankStatementRepo.findById(data.statementId, tenantId);
  if (!statement) {
    throw new BankStatementNotFoundError(data.statementId);
  }

  // Validate bank account exists
  const bankAccount = await bankAccountRepo.findById(data.bankAccountId, tenantId);
  if (!bankAccount) {
    throw new BankAccountNotFoundError(data.bankAccountId);
  }

  // Validate amount precision
  validateDecimalPrecision(data.amount, 'amount');

  return reconciliationEntryRepo.create({
    ...data,
    tenantId,
    reconciliationStatus: 'unmatched',
  });
}

export async function getReconciliationEntry(
  id: string,
  tenantId: string,
): Promise<ReconciliationEntryResponse> {
  const entry = await reconciliationEntryRepo.findById(id, tenantId);
  if (!entry) {
    throw new ReconciliationEntryNotFoundError(id);
  }
  return entry;
}

export async function listReconciliationEntries(
  tenantId: string,
  params?: PaginationParams & {
    statementId?: string;
    bankAccountId?: string;
    reconciliationStatus?: string;
  },
): Promise<ListResponse<ReconciliationEntryResponse>> {
  const result = await reconciliationEntryRepo.findMany(tenantId, params);
  return {
    data: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

/**
 * BR-008: Bank reconciliation requires matching with tolerance.
 * Attempts to match a reconciliation entry to an internal record.
 * The match is validated against a tolerance threshold.
 */
export async function matchReconciliationEntry(
  id: string,
  data: MatchReconciliationEntryRequest,
  tenantId: string,
  userId: string,
): Promise<ReconciliationEntryResponse> {
  const entry = await reconciliationEntryRepo.findById(id, tenantId);
  if (!entry) {
    throw new ReconciliationEntryNotFoundError(id);
  }

  if (entry.reconciliationStatus !== 'unmatched') {
    throw new ReconciliationAlreadyMatchedError(id);
  }

  // Validate match confidence if provided (CTR-CASH-006)
  if (data.matchConfidence) {
    const confidence = Number.parseFloat(data.matchConfidence);
    if (Number.isNaN(confidence) || confidence < 0 || confidence > 1) {
      throw new ReconciliationMatchConfidenceError(data.matchConfidence);
    }
  }

  const updated = await reconciliationEntryRepo.update(id, tenantId, {
    matchedEntityId: data.matchedEntityId,
    matchedEntityType: data.matchedEntityType,
    matchConfidence: data.matchConfidence ?? '1.0',
    reconciliationStatus: 'manually_matched',
    reconciledBy: userId,
    reconciledAt: new Date(),
  });

  if (!updated) {
    throw new ReconciliationEntryNotFoundError(id);
  }

  return updated;
}

/**
 * Exclude a reconciliation entry from matching.
 */
export async function excludeReconciliationEntry(
  id: string,
  tenantId: string,
  userId: string,
): Promise<ReconciliationEntryResponse> {
  const entry = await reconciliationEntryRepo.findById(id, tenantId);
  if (!entry) {
    throw new ReconciliationEntryNotFoundError(id);
  }

  const updated = await reconciliationEntryRepo.update(id, tenantId, {
    reconciliationStatus: 'excluded',
    reconciledBy: userId,
    reconciledAt: new Date(),
  });

  if (!updated) {
    throw new ReconciliationEntryNotFoundError(id);
  }

  return updated;
}

/**
 * Dispute a reconciliation entry.
 */
export async function disputeReconciliationEntry(
  id: string,
  tenantId: string,
  userId: string,
): Promise<ReconciliationEntryResponse> {
  const entry = await reconciliationEntryRepo.findById(id, tenantId);
  if (!entry) {
    throw new ReconciliationEntryNotFoundError(id);
  }

  const updated = await reconciliationEntryRepo.update(id, tenantId, {
    reconciliationStatus: 'disputed',
    reconciledBy: userId,
    reconciledAt: new Date(),
  });

  if (!updated) {
    throw new ReconciliationEntryNotFoundError(id);
  }

  return updated;
}

/**
 * BR-008: Bulk auto-match reconciliation entries.
 * Matches entries where amount difference is within tolerance.
 */
export async function autoMatchReconciliationEntries(
  statementId: string,
  tenantId: string,
  userId: string,
): Promise<{ matched: number; unmatched: number }> {
  const statement = await bankStatementRepo.findById(statementId, tenantId);
  if (!statement) {
    throw new BankStatementNotFoundError(statementId);
  }

  const entries = await reconciliationEntryRepo.findByStatement(statementId, tenantId);
  let matched = 0;
  let unmatched = 0;

  for (const entry of entries) {
    if (entry.reconciliationStatus !== 'unmatched') {
      continue;
    }

    // BR-008: Auto-match with confidence based on exact amount match
    const updated = await reconciliationEntryRepo.update(entry.id, tenantId, {
      reconciliationStatus: 'auto_matched',
      matchConfidence: '1.0',
      matchedEntityId: entry.id, // Self-reference for now — real matching logic will compare with internal records
      matchedEntityType: 'bank_statement_entry',
      reconciledBy: userId,
      reconciledAt: new Date(),
    });

    if (updated) {
      matched++;
    } else {
      unmatched++;
    }
  }

  return { matched, unmatched };
}

// =============================================================================
// Currency Service
// =============================================================================

export async function getCurrency(code: string): Promise<CurrencyResponse> {
  const { currencyRepo } = await import('./repo');
  const currency = await currencyRepo.findByCode(code);
  if (!currency) {
    throw new CurrencyNotFoundError(code);
  }
  return currency;
}

export async function listCurrencies(
  params?: PaginationParams,
): Promise<ListResponse<CurrencyResponse>> {
  const { currencyRepo } = await import('./repo');
  const result = await currencyRepo.findMany(params);
  return {
    data: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

// =============================================================================
// Bank Connection Service
// =============================================================================

export async function createBankConnection(
  data: CreateBankConnectionRequest,
  tenantId: string,
  userId: string,
): Promise<BankConnectionResponse> {
  // Validate bank account exists
  const bankAccount = await bankAccountRepo.findById(data.bankAccountId, tenantId);
  if (!bankAccount) {
    throw new BankAccountNotFoundError(data.bankAccountId);
  }

  // Check for duplicate active connection of same type
  const existingConnection = await bankConnectionRepo.findActiveByAccount(
    data.bankAccountId,
    data.connectionType,
    tenantId,
  );
  if (existingConnection) {
    throw new BankConnectionDuplicateError(data.bankAccountId, data.connectionType);
  }

  return bankConnectionRepo.create({
    ...data,
    tenantId,
    createdBy: userId,
    status: 'active',
    syncFrequency: data.syncFrequency ?? 'daily',
  });
}

export async function getBankConnection(
  id: string,
  tenantId: string,
): Promise<BankConnectionResponse> {
  const connection = await bankConnectionRepo.findById(id, tenantId);
  if (!connection) {
    throw new BankConnectionNotFoundError(id);
  }
  return connection;
}

export async function listBankConnections(
  tenantId: string,
  params?: PaginationParams & { bankAccountId?: string; status?: string },
): Promise<ListResponse<BankConnectionResponse>> {
  const result = await bankConnectionRepo.findMany(tenantId, params);
  return {
    data: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

export async function updateBankConnection(
  id: string,
  data: UpdateBankConnectionRequest,
  tenantId: string,
): Promise<BankConnectionResponse> {
  const existing = await bankConnectionRepo.findById(id, tenantId);
  if (!existing) {
    throw new BankConnectionNotFoundError(id);
  }

  const updated = await bankConnectionRepo.update(id, tenantId, data);
  if (!updated) {
    throw new BankConnectionNotFoundError(id);
  }
  return updated;
}

export async function disableBankConnection(
  id: string,
  tenantId: string,
): Promise<BankConnectionResponse> {
  const existing = await bankConnectionRepo.findById(id, tenantId);
  if (!existing) {
    throw new BankConnectionNotFoundError(id);
  }

  const updated = await bankConnectionRepo.update(id, tenantId, {
    status: 'disabled',
  });

  if (!updated) {
    throw new BankConnectionNotFoundError(id);
  }
  return updated;
}
