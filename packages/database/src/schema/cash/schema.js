import { boolean, date, decimal, index, integer, pgEnum, pgTable, timestamp, uuid, varchar, } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';
import { auditFields, createdByFields, softDeleteFields, tenantFields } from '../common/audit';
// ─── Enums ────────────────────────────────────────────────────────────────────
export const bankAccountTypeEnum = pgEnum('bank_account_type', [
    'checking',
    'savings',
    'money_market',
    'credit_line',
]);
export const bankAccountStatusEnum = pgEnum('bank_account_status', [
    'active',
    'inactive',
    'frozen',
    'closed',
]);
export const transferTypeEnum = pgEnum('transfer_type', [
    'internal',
    'external',
    'wire',
    'ach',
    'check',
]);
export const transferStatusEnum = pgEnum('transfer_status', [
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
]);
export const importSourceEnum = pgEnum('import_source', ['api', 'csv', 'ofx', 'manual']);
export const importStatusEnum = pgEnum('import_status', [
    'pending',
    'processing',
    'completed',
    'failed',
]);
export const transactionTypeEnum = pgEnum('transaction_type', [
    'credit',
    'debit',
    'transfer',
    'fee',
    'interest',
]);
export const reconciliationStatusEnum = pgEnum('reconciliation_status', [
    'unmatched',
    'auto_matched',
    'manually_matched',
    'excluded',
    'disputed',
]);
export const connectionTypeEnum = pgEnum('connection_type', ['plaid', 'yodlee', 'ofx', 'manual']);
export const connectionStatusEnum = pgEnum('connection_status', [
    'active',
    'expired',
    'error',
    'disabled',
]);
export const syncFrequencyEnum = pgEnum('sync_frequency', [
    'realtime',
    'hourly',
    'daily',
    'manual',
]);
// ─── Tables ───────────────────────────────────────────────────────────────────
export const bankAccounts = pgTable('bank_accounts', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    bankName: varchar('bank_name', { length: 100 }).notNull(),
    accountName: varchar('account_name', { length: 100 }).notNull(),
    accountNumber: varchar('account_number', { length: 50 }).notNull(),
    routingNumber: varchar('routing_number', { length: 20 }),
    accountType: bankAccountTypeEnum('account_type').notNull(),
    currencyCode: varchar('currency_code', { length: 3 }).notNull().default('USD'),
    currentBalance: decimal('current_balance', { precision: 19, scale: 4 }).notNull().default('0'),
    availableBalance: decimal('available_balance', { precision: 19, scale: 4 })
        .notNull()
        .default('0'),
    status: bankAccountStatusEnum('status').notNull().default('active'),
    isDefault: boolean('is_default').notNull().default(false),
    lastSyncedAt: timestamp('last_synced_at'),
}, (table) => [
    index('idx_bank_accounts_tenant_id').on(table.tenantId),
    index('idx_bank_accounts_account_number').on(table.accountNumber),
    index('idx_bank_accounts_status').on(table.status),
]);
export const bankTransfers = pgTable('bank_transfers', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    sourceAccountId: uuid('source_account_id')
        .notNull()
        .references(() => bankAccounts.id),
    destinationAccountId: uuid('destination_account_id')
        .notNull()
        .references(() => bankAccounts.id),
    amount: decimal('amount', { precision: 19, scale: 4 }).notNull().default('0'),
    currencyCode: varchar('currency_code', { length: 3 }).notNull().default('USD'),
    transferType: transferTypeEnum('transfer_type').notNull(),
    status: transferStatusEnum('status').notNull().default('pending'),
    referenceNumber: varchar('reference_number', { length: 50 }),
    description: varchar('description', { length: 255 }),
    scheduledDate: date('scheduled_date'),
    completedAt: timestamp('completed_at'),
    failureReason: varchar('failure_reason', { length: 255 }),
    createdBy: createdByFields.createdBy,
}, (table) => [
    index('idx_bank_transfers_tenant_id').on(table.tenantId),
    index('idx_bank_transfers_source_account_id').on(table.sourceAccountId),
    index('idx_bank_transfers_destination_account_id').on(table.destinationAccountId),
    index('idx_bank_transfers_status').on(table.status),
]);
export const bankStatements = pgTable('bank_statements', {
    ...auditFields,
    ...tenantFields,
    bankAccountId: uuid('bank_account_id')
        .notNull()
        .references(() => bankAccounts.id),
    statementDate: date('statement_date').notNull(),
    periodStart: date('period_start').notNull(),
    periodEnd: date('period_end').notNull(),
    openingBalance: decimal('opening_balance', { precision: 19, scale: 4 }).notNull().default('0'),
    closingBalance: decimal('closing_balance', { precision: 19, scale: 4 }).notNull().default('0'),
    importSource: importSourceEnum('import_source').notNull(),
    importStatus: importStatusEnum('import_status').notNull().default('pending'),
    fileReference: varchar('file_reference', { length: 255 }),
    transactionCount: integer('transaction_count').notNull().default(0),
    reconciledCount: integer('reconciled_count').notNull().default(0),
    importedBy: uuid('imported_by').notNull(),
    importedAt: timestamp('imported_at').notNull(),
}, (table) => [
    index('idx_bank_statements_tenant_id').on(table.tenantId),
    index('idx_bank_statements_bank_account_id').on(table.bankAccountId),
    index('idx_bank_statements_statement_date').on(table.statementDate),
]);
export const reconciliationEntries = pgTable('reconciliation_entries', {
    ...auditFields,
    ...tenantFields,
    statementId: uuid('statement_id')
        .notNull()
        .references(() => bankStatements.id),
    bankAccountId: uuid('bank_account_id')
        .notNull()
        .references(() => bankAccounts.id),
    transactionDate: date('transaction_date').notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    amount: decimal('amount', { precision: 19, scale: 4 }).notNull().default('0'),
    balanceAfter: decimal('balance_after', { precision: 19, scale: 4 }),
    transactionType: transactionTypeEnum('transaction_type').notNull(),
    referenceNumber: varchar('reference_number', { length: 50 }),
    reconciliationStatus: reconciliationStatusEnum('reconciliation_status')
        .notNull()
        .default('unmatched'),
    matchedEntityId: uuid('matched_entity_id'),
    matchedEntityType: varchar('matched_entity_type', { length: 50 }),
    matchConfidence: decimal('match_confidence', { precision: 5, scale: 4 }),
    reconciledBy: uuid('reconciled_by'),
    reconciledAt: timestamp('reconciled_at'),
}, (table) => [
    index('idx_reconciliation_entries_tenant_id').on(table.tenantId),
    index('idx_reconciliation_entries_statement_id').on(table.statementId),
    index('idx_reconciliation_entries_bank_account_id').on(table.bankAccountId),
    index('idx_reconciliation_entries_reconciliation_status').on(table.reconciliationStatus),
]);
export const currencies = pgTable('currencies', {
    ...auditFields,
    code: varchar('code', { length: 3 }).notNull().unique(),
    name: varchar('name', { length: 50 }).notNull(),
    symbol: varchar('symbol', { length: 5 }).notNull(),
    decimalPlaces: integer('decimal_places').notNull().default(2),
    isActive: boolean('is_active').notNull().default(true),
});
export const bankConnections = pgTable('bank_connections', {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    bankAccountId: uuid('bank_account_id')
        .notNull()
        .references(() => bankAccounts.id),
    connectionType: connectionTypeEnum('connection_type').notNull(),
    institutionName: varchar('institution_name', { length: 100 }).notNull(),
    institutionId: varchar('institution_id', { length: 50 }),
    accessToken: varchar('access_token', { length: 255 }).notNull(),
    refreshToken: varchar('refresh_token', { length: 255 }),
    status: connectionStatusEnum('status').notNull().default('active'),
    lastSyncAt: timestamp('last_sync_at'),
    lastSyncError: varchar('last_sync_error', { length: 255 }),
    syncFrequency: syncFrequencyEnum('sync_frequency').notNull().default('daily'),
    createdBy: createdByFields.createdBy,
}, (table) => [
    index('idx_bank_connections_tenant_id').on(table.tenantId),
    index('idx_bank_connections_bank_account_id').on(table.bankAccountId),
    index('idx_bank_connections_status').on(table.status),
]);
// ─── Zod Schemas ──────────────────────────────────────────────────────────────
export const insertBankAccountSchema = createInsertSchema(bankAccounts, {
    bankName: (schema) => schema.min(1).max(100),
    accountName: (schema) => schema.min(1).max(100),
    accountNumber: (schema) => schema.min(1).max(50),
});
export const selectBankAccountSchema = createSelectSchema(bankAccounts);
export const insertBankTransferSchema = createInsertSchema(bankTransfers);
export const selectBankTransferSchema = createSelectSchema(bankTransfers);
export const insertBankStatementSchema = createInsertSchema(bankStatements);
export const selectBankStatementSchema = createSelectSchema(bankStatements);
export const insertReconciliationEntrySchema = createInsertSchema(reconciliationEntries);
export const selectReconciliationEntrySchema = createSelectSchema(reconciliationEntries);
export const insertCurrencySchema = createInsertSchema(currencies);
export const selectCurrencySchema = createSelectSchema(currencies);
export const insertBankConnectionSchema = createInsertSchema(bankConnections);
export const selectBankConnectionSchema = createSelectSchema(bankConnections);
export const updateBankAccountSchema = createUpdateSchema(bankAccounts);
export const updateBankTransferSchema = createUpdateSchema(bankTransfers);
export const updateBankStatementSchema = createUpdateSchema(bankStatements);
export const updateReconciliationEntrySchema = createUpdateSchema(reconciliationEntries);
export const updateCurrencySchema = createUpdateSchema(currencies);
export const updateBankConnectionSchema = createUpdateSchema(bankConnections);
