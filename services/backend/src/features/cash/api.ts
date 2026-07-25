/**
 * Cash & Treasury — API Endpoints
 *
 * @module features/cash/api
 * @description Encore.ts API endpoints for the BC-CASH bounded context.
 *              Each endpoint authenticates via auth middleware, validates input
 *              with Zod, and delegates business logic to the service layer.
 *
 * @see engineering/api/STANDARDS.md — Endpoint naming conventions
 * @see engineering/backend/STANDARDS.md — Encore.ts service patterns
 */

import { APIError, api } from 'encore.dev/api';
import { z } from 'zod';
import { getAuthData } from '~encore/auth';
import * as service from './service';
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
  ReconciliationEntryResponse,
  UpdateBankAccountRequest,
  UpdateBankConnectionRequest,
  UpdateBankStatementRequest,
} from './types';

// =============================================================================
// Zod Validation Schemas — API Boundary
// =============================================================================

const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const CreateBankAccountSchema = z.object({
  bankName: z.string().min(1).max(100),
  accountName: z.string().min(1).max(100),
  accountNumber: z.string().min(1).max(50),
  routingNumber: z.string().max(20).optional(),
  accountType: z.enum(['checking', 'savings', 'money_market', 'credit_line']),
  currencyCode: z.string().length(3).default('USD'),
  currentBalance: z.string().optional(),
  availableBalance: z.string().optional(),
  isDefault: z.boolean().default(false),
});

const UpdateBankAccountSchema = z.object({
  bankName: z.string().min(1).max(100).optional(),
  accountName: z.string().min(1).max(100).optional(),
  accountNumber: z.string().min(1).max(50).optional(),
  routingNumber: z.string().max(20).optional(),
  accountType: z.enum(['checking', 'savings', 'money_market', 'credit_line']).optional(),
  currencyCode: z.string().length(3).optional(),
  status: z.enum(['active', 'inactive', 'frozen', 'closed']).optional(),
  isDefault: z.boolean().optional(),
});

const CreateBankTransferSchema = z.object({
  sourceAccountId: z.string().uuid(),
  destinationAccountId: z.string().uuid(),
  amount: z.string(),
  currencyCode: z.string().length(3).default('USD'),
  transferType: z.enum(['internal', 'external', 'wire', 'ach', 'check']),
  referenceNumber: z.string().max(50).optional(),
  description: z.string().max(255).optional(),
  scheduledDate: z.string().optional(),
});

const CreateBankStatementSchema = z.object({
  bankAccountId: z.string().uuid(),
  statementDate: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
  openingBalance: z.string(),
  closingBalance: z.string(),
  importSource: z.enum(['api', 'csv', 'ofx', 'manual']),
  fileReference: z.string().max(255).optional(),
  transactionCount: z.number().int().optional(),
});

const CreateReconciliationEntrySchema = z.object({
  statementId: z.string().uuid(),
  bankAccountId: z.string().uuid(),
  transactionDate: z.string(),
  description: z.string().min(1).max(255),
  amount: z.string(),
  balanceAfter: z.string().optional(),
  transactionType: z.enum(['credit', 'debit', 'transfer', 'fee', 'interest']),
  referenceNumber: z.string().max(50).optional(),
});

const MatchReconciliationEntrySchema = z.object({
  matchedEntityId: z.string().uuid(),
  matchedEntityType: z.string().min(1).max(50),
  matchConfidence: z.string().optional(),
});

const CreateBankConnectionSchema = z.object({
  bankAccountId: z.string().uuid(),
  connectionType: z.enum(['plaid', 'yodlee', 'ofx', 'manual']),
  institutionName: z.string().min(1).max(100),
  institutionId: z.string().max(50).optional(),
  accessToken: z.string().min(1).max(255),
  refreshToken: z.string().max(255).optional(),
  syncFrequency: z.enum(['realtime', 'hourly', 'daily', 'manual']).default('daily'),
});

// =============================================================================
// Helper — Validate & Parse
// =============================================================================

function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      const key = path || '_root';
      if (!details[key]) details[key] = [];
      details[key].push(issue.message);
    }
    throw new APIError('validation_error', 'Invalid request', { details });
  }
  return result.data;
}

// =============================================================================
// Bank Account Endpoints
// =============================================================================

/** Create a new bank account (BR-610: account number encrypted at rest) */
export const createBankAccount = api(
  { expose: true, auth: true, method: 'POST', path: '/cash/bank-accounts' },
  async (req: CreateBankAccountRequest): Promise<BankAccountResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(CreateBankAccountSchema, req);
    return service.createBankAccount(input, auth.tenantId);
  },
);

/** Get a bank account by ID */
export const getBankAccount = api(
  { expose: true, auth: true, method: 'GET', path: '/cash/bank-accounts/:id' },
  async ({ id }: { id: string }): Promise<BankAccountResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getBankAccount(id, auth.tenantId);
  },
);

/** List bank accounts with pagination, status, and search filters */
export const listBankAccounts = api(
  { expose: true, auth: true, method: 'GET', path: '/cash/bank-accounts' },
  async (
    params: PaginationParams & { status?: string; search?: string },
  ): Promise<ListResponse<BankAccountResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const { page, limit, status, search } = validate(
      PaginationSchema.extend({
        status: z.string().optional(),
        search: z.string().optional(),
      }),
      params,
    );
    return service.listBankAccounts(auth.tenantId, { page, limit, status, search });
  },
);

/** Update a bank account */
export const updateBankAccount = api(
  { expose: true, auth: true, method: 'PATCH', path: '/cash/bank-accounts/:id' },
  async ({
    id,
    ...data
  }: { id: string } & UpdateBankAccountRequest): Promise<BankAccountResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(UpdateBankAccountSchema, data);
    return service.updateBankAccount(id, input, auth.tenantId);
  },
);

/** Soft-delete a bank account */
export const deleteBankAccount = api(
  { expose: true, auth: true, method: 'DELETE', path: '/cash/bank-accounts/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteBankAccount(id, auth.tenantId);
  },
);

// =============================================================================
// Bank Transfer Endpoints
// =============================================================================

/** Create a new bank transfer */
export const createBankTransfer = api(
  { expose: true, auth: true, method: 'POST', path: '/cash/transfers' },
  async (req: CreateBankTransferRequest): Promise<BankTransferResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(CreateBankTransferSchema, req);
    return service.createBankTransfer(input, auth.tenantId, auth.userId);
  },
);

/** Get a bank transfer by ID */
export const getBankTransfer = api(
  { expose: true, auth: true, method: 'GET', path: '/cash/transfers/:id' },
  async ({ id }: { id: string }): Promise<BankTransferResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getBankTransfer(id, auth.tenantId);
  },
);

/** List bank transfers with pagination and filters */
export const listBankTransfers = api(
  { expose: true, auth: true, method: 'GET', path: '/cash/transfers' },
  async (
    params: PaginationParams & {
      status?: string;
      sourceAccountId?: string;
      destinationAccountId?: string;
    },
  ): Promise<ListResponse<BankTransferResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const { page, limit, status, sourceAccountId, destinationAccountId } = validate(
      PaginationSchema.extend({
        status: z.string().optional(),
        sourceAccountId: z.string().uuid().optional(),
        destinationAccountId: z.string().uuid().optional(),
      }),
      params,
    );
    return service.listBankTransfers(auth.tenantId, {
      page,
      limit,
      status,
      sourceAccountId,
      destinationAccountId,
    });
  },
);

/** Complete a pending bank transfer */
export const completeBankTransfer = api(
  { expose: true, auth: true, method: 'POST', path: '/cash/transfers/:id/complete' },
  async ({ id }: { id: string }): Promise<BankTransferResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.completeBankTransfer(id, auth.tenantId);
  },
);

/** Cancel a pending bank transfer */
export const cancelBankTransfer = api(
  { expose: true, auth: true, method: 'POST', path: '/cash/transfers/:id/cancel' },
  async ({ id }: { id: string }): Promise<BankTransferResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.cancelBankTransfer(id, auth.tenantId);
  },
);

// =============================================================================
// Bank Statement Endpoints
// =============================================================================

/** Create a new bank statement */
export const createBankStatement = api(
  { expose: true, auth: true, method: 'POST', path: '/cash/statements' },
  async (req: CreateBankStatementRequest): Promise<BankStatementResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(CreateBankStatementSchema, req);
    return service.createBankStatement(input, auth.tenantId, auth.userId);
  },
);

/** Get a bank statement by ID */
export const getBankStatement = api(
  { expose: true, auth: true, method: 'GET', path: '/cash/statements/:id' },
  async ({ id }: { id: string }): Promise<BankStatementResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getBankStatement(id, auth.tenantId);
  },
);

/** List bank statements with pagination and filters */
export const listBankStatements = api(
  { expose: true, auth: true, method: 'GET', path: '/cash/statements' },
  async (
    params: PaginationParams & { bankAccountId?: string; importStatus?: string },
  ): Promise<ListResponse<BankStatementResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const { page, limit, bankAccountId, importStatus } = validate(
      PaginationSchema.extend({
        bankAccountId: z.string().uuid().optional(),
        importStatus: z.string().optional(),
      }),
      params,
    );
    return service.listBankStatements(auth.tenantId, { page, limit, bankAccountId, importStatus });
  },
);

/** Update a bank statement (only pending/failed statements) */
export const updateBankStatement = api(
  { expose: true, auth: true, method: 'PATCH', path: '/cash/statements/:id' },
  async ({
    id,
    ...data
  }: { id: string } & UpdateBankStatementRequest): Promise<BankStatementResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.updateBankStatement(id, data, auth.tenantId);
  },
);

// =============================================================================
// Reconciliation Entry Endpoints
// =============================================================================

/** Create a new reconciliation entry */
export const createReconciliationEntry = api(
  { expose: true, auth: true, method: 'POST', path: '/cash/reconciliation-entries' },
  async (req: CreateReconciliationEntryRequest): Promise<ReconciliationEntryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(CreateReconciliationEntrySchema, req);
    return service.createReconciliationEntry(input, auth.tenantId);
  },
);

/** Get a reconciliation entry by ID */
export const getReconciliationEntry = api(
  { expose: true, auth: true, method: 'GET', path: '/cash/reconciliation-entries/:id' },
  async ({ id }: { id: string }): Promise<ReconciliationEntryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getReconciliationEntry(id, auth.tenantId);
  },
);

/** List reconciliation entries with pagination and filters */
export const listReconciliationEntries = api(
  { expose: true, auth: true, method: 'GET', path: '/cash/reconciliation-entries' },
  async (
    params: PaginationParams & {
      statementId?: string;
      bankAccountId?: string;
      reconciliationStatus?: string;
    },
  ): Promise<ListResponse<ReconciliationEntryResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const { page, limit, statementId, bankAccountId, reconciliationStatus } = validate(
      PaginationSchema.extend({
        statementId: z.string().uuid().optional(),
        bankAccountId: z.string().uuid().optional(),
        reconciliationStatus: z.string().optional(),
      }),
      params,
    );
    return service.listReconciliationEntries(auth.tenantId, {
      page,
      limit,
      statementId,
      bankAccountId,
      reconciliationStatus,
    });
  },
);

/** BR-008: Match a reconciliation entry to an internal record with tolerance */
export const matchReconciliationEntry = api(
  { expose: true, auth: true, method: 'POST', path: '/cash/reconciliation-entries/:id/match' },
  async ({
    id,
    ...data
  }: { id: string } & MatchReconciliationEntryRequest): Promise<ReconciliationEntryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(MatchReconciliationEntrySchema, data);
    return service.matchReconciliationEntry(id, input, auth.tenantId, auth.userId);
  },
);

/** Exclude a reconciliation entry from matching */
export const excludeReconciliationEntry = api(
  { expose: true, auth: true, method: 'POST', path: '/cash/reconciliation-entries/:id/exclude' },
  async ({ id }: { id: string }): Promise<ReconciliationEntryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.excludeReconciliationEntry(id, auth.tenantId, auth.userId);
  },
);

/** Dispute a reconciliation entry */
export const disputeReconciliationEntry = api(
  { expose: true, auth: true, method: 'POST', path: '/cash/reconciliation-entries/:id/dispute' },
  async ({ id }: { id: string }): Promise<ReconciliationEntryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.disputeReconciliationEntry(id, auth.tenantId, auth.userId);
  },
);

/** BR-008: Auto-match reconciliation entries for a statement */
export const autoMatchReconciliationEntries = api(
  { expose: true, auth: true, method: 'POST', path: '/cash/statements/:statementId/auto-match' },
  async ({
    statementId,
  }: {
    statementId: string;
  }): Promise<{ matched: number; unmatched: number }> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.autoMatchReconciliationEntries(statementId, auth.tenantId, auth.userId);
  },
);

// =============================================================================
// Currency Endpoints
// =============================================================================

/** Get a currency by code */
export const getCurrency = api(
  { expose: true, auth: true, method: 'GET', path: '/cash/currencies/:code' },
  async ({ code }: { code: string }): Promise<CurrencyResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getCurrency(code);
  },
);

/** List all currencies */
export const listCurrencies = api(
  { expose: true, auth: true, method: 'GET', path: '/cash/currencies' },
  async (params: PaginationParams): Promise<ListResponse<CurrencyResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const { page, limit } = validate(PaginationSchema, params);
    return service.listCurrencies({ page, limit });
  },
);

// =============================================================================
// Bank Connection Endpoints
// =============================================================================

/** Create a new bank connection */
export const createBankConnection = api(
  { expose: true, auth: true, method: 'POST', path: '/cash/connections' },
  async (req: CreateBankConnectionRequest): Promise<BankConnectionResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(CreateBankConnectionSchema, req);
    return service.createBankConnection(input, auth.tenantId, auth.userId);
  },
);

/** Get a bank connection by ID */
export const getBankConnection = api(
  { expose: true, auth: true, method: 'GET', path: '/cash/connections/:id' },
  async ({ id }: { id: string }): Promise<BankConnectionResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getBankConnection(id, auth.tenantId);
  },
);

/** List bank connections with pagination and filters */
export const listBankConnections = api(
  { expose: true, auth: true, method: 'GET', path: '/cash/connections' },
  async (
    params: PaginationParams & { bankAccountId?: string; status?: string },
  ): Promise<ListResponse<BankConnectionResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const { page, limit, bankAccountId, status } = validate(
      PaginationSchema.extend({
        bankAccountId: z.string().uuid().optional(),
        status: z.string().optional(),
      }),
      params,
    );
    return service.listBankConnections(auth.tenantId, { page, limit, bankAccountId, status });
  },
);

/** Update a bank connection */
export const updateBankConnection = api(
  { expose: true, auth: true, method: 'PATCH', path: '/cash/connections/:id' },
  async ({
    id,
    ...data
  }: { id: string } & UpdateBankConnectionRequest): Promise<BankConnectionResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.updateBankConnection(id, data, auth.tenantId);
  },
);

/** Disable a bank connection */
export const disableBankConnection = api(
  { expose: true, auth: true, method: 'POST', path: '/cash/connections/:id/disable' },
  async ({ id }: { id: string }): Promise<BankConnectionResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.disableBankConnection(id, auth.tenantId);
  },
);
