/**
 * Cash & Treasury — Type Definitions
 *
 * @module features/cash/types
 * @description Domain types derived from Drizzle schema + API request/response
 *              interfaces for the BC-CASH bounded context.
 *
 * @see packages/database/src/schema/cash/schema.ts — Source schema
 */

// =============================================================================
// Bank Account — API Types
// =============================================================================

export interface CreateBankAccountRequest {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  accountType: 'checking' | 'savings' | 'money_market' | 'credit_line';
  currencyCode?: string;
  currentBalance?: string;
  availableBalance?: string;
  isDefault?: boolean;
}

export interface UpdateBankAccountRequest {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountType?: 'checking' | 'savings' | 'money_market' | 'credit_line';
  currencyCode?: string;
  status?: 'active' | 'inactive' | 'frozen' | 'closed';
  isDefault?: boolean;
}

export interface BankAccountResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string | null;
  accountType: 'checking' | 'savings' | 'money_market' | 'credit_line';
  currencyCode: string;
  currentBalance: string;
  availableBalance: string;
  status: 'active' | 'inactive' | 'frozen' | 'closed';
  isDefault: boolean;
  lastSyncedAt: Date | null;
}

// =============================================================================
// Bank Transfer — API Types
// =============================================================================

export interface CreateBankTransferRequest {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: string;
  currencyCode?: string;
  transferType: 'internal' | 'external' | 'wire' | 'ach' | 'check';
  referenceNumber?: string;
  description?: string;
  scheduledDate?: string;
}

export interface UpdateBankTransferRequest {
  description?: string;
  scheduledDate?: string;
}

export interface BankTransferResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: string;
  currencyCode: string;
  transferType: 'internal' | 'external' | 'wire' | 'ach' | 'check';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  referenceNumber: string | null;
  description: string | null;
  scheduledDate: string | null;
  completedAt: Date | null;
  failureReason: string | null;
  createdBy: string;
}

// =============================================================================
// Bank Statement — API Types
// =============================================================================

export interface CreateBankStatementRequest {
  bankAccountId: string;
  statementDate: string;
  periodStart: string;
  periodEnd: string;
  openingBalance: string;
  closingBalance: string;
  importSource: 'api' | 'csv' | 'ofx' | 'manual';
  fileReference?: string;
  transactionCount?: number;
}

export interface UpdateBankStatementRequest {
  statementDate?: string;
  periodStart?: string;
  periodEnd?: string;
  openingBalance?: string;
  closingBalance?: string;
  importStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  fileReference?: string;
  transactionCount?: number;
  reconciledCount?: number;
}

export interface BankStatementResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  bankAccountId: string;
  statementDate: string;
  periodStart: string;
  periodEnd: string;
  openingBalance: string;
  closingBalance: string;
  importSource: 'api' | 'csv' | 'ofx' | 'manual';
  importStatus: 'pending' | 'processing' | 'completed' | 'failed';
  fileReference: string | null;
  transactionCount: number;
  reconciledCount: number;
  importedBy: string;
  importedAt: Date;
}

// =============================================================================
// Reconciliation Entry — API Types
// =============================================================================

export interface CreateReconciliationEntryRequest {
  statementId: string;
  bankAccountId: string;
  transactionDate: string;
  description: string;
  amount: string;
  balanceAfter?: string;
  transactionType: 'credit' | 'debit' | 'transfer' | 'fee' | 'interest';
  referenceNumber?: string;
}

export interface UpdateReconciliationEntryRequest {
  transactionDate?: string;
  description?: string;
  amount?: string;
  balanceAfter?: string;
  referenceNumber?: string;
}

export interface MatchReconciliationEntryRequest {
  matchedEntityId: string;
  matchedEntityType: string;
  matchConfidence?: string;
}

export interface ReconciliationEntryResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  statementId: string;
  bankAccountId: string;
  transactionDate: string;
  description: string;
  amount: string;
  balanceAfter: string | null;
  transactionType: 'credit' | 'debit' | 'transfer' | 'fee' | 'interest';
  referenceNumber: string | null;
  reconciliationStatus: 'unmatched' | 'auto_matched' | 'manually_matched' | 'excluded' | 'disputed';
  matchedEntityId: string | null;
  matchedEntityType: string | null;
  matchConfidence: string | null;
  reconciledBy: string | null;
  reconciledAt: Date | null;
}

// =============================================================================
// Currency — API Types
// =============================================================================

export interface CreateCurrencyRequest {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces?: number;
  isActive?: boolean;
}

export interface UpdateCurrencyRequest {
  name?: string;
  symbol?: string;
  decimalPlaces?: number;
  isActive?: boolean;
}

export interface CurrencyResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isActive: boolean;
}

// =============================================================================
// Bank Connection — API Types
// =============================================================================

export interface CreateBankConnectionRequest {
  bankAccountId: string;
  connectionType: 'plaid' | 'yodlee' | 'ofx' | 'manual';
  institutionName: string;
  institutionId?: string;
  accessToken: string;
  refreshToken?: string;
  syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'manual';
}

export interface UpdateBankConnectionRequest {
  status?: 'active' | 'expired' | 'error' | 'disabled';
  syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'manual';
  lastSyncError?: string;
}

export interface BankConnectionResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  bankAccountId: string;
  connectionType: 'plaid' | 'yodlee' | 'ofx' | 'manual';
  institutionName: string;
  institutionId: string | null;
  accessToken: string;
  refreshToken: string | null;
  status: 'active' | 'expired' | 'error' | 'disabled';
  lastSyncAt: Date | null;
  lastSyncError: string | null;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  createdBy: string;
}

// =============================================================================
// Transfer Actions
// =============================================================================

export interface CompleteTransferRequest {
  transferId: string;
}

export interface CancelTransferRequest {
  transferId: string;
  reason?: string;
}

// =============================================================================
// List / Pagination
// =============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
