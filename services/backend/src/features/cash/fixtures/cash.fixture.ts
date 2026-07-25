import { TEST_TENANT_ID, TEST_USER_ID } from '../../../lib/test-utils';

// ─── Bank Account Fixtures ────────────────────────────────────────────────

export const createBankAccountFixture = (overrides = {}) => ({
  id: 'bank-acct-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  bankName: 'Chase Bank',
  accountName: 'Operating Checking',
  accountNumber: '**********4567',
  routingNumber: '021000021',
  accountType: 'checking' as const,
  currencyCode: 'USD',
  currentBalance: '10000.0000',
  availableBalance: '9500.0000',
  status: 'active' as const,
  isDefault: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createBankAccountInputFixture = (overrides = {}) => ({
  bankName: 'Chase Bank',
  accountName: 'Operating Checking',
  accountNumber: '12345678904567',
  routingNumber: '021000021',
  accountType: 'checking' as const,
  currencyCode: 'USD',
  ...overrides,
});

// ─── Bank Transfer Fixtures ───────────────────────────────────────────────

export const createBankTransferFixture = (overrides = {}) => ({
  id: 'bank-xfer-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  sourceAccountId: 'bank-acct-00000000-0000-0000-000000000001',
  destinationAccountId: 'bank-acct-00000000-0000-0000-000000000002',
  amount: '500.0000',
  currencyCode: 'USD',
  transferType: 'internal' as const,
  referenceNumber: 'XFER-001',
  description: 'Monthly transfer',
  scheduledDate: '2026-07-15',
  status: 'pending' as const,
  createdBy: TEST_USER_ID,
  completedAt: null,
  createdAt: new Date('2026-07-01'),
  updatedAt: new Date('2026-07-01'),
  deletedAt: null,
  ...overrides,
});

export const createBankTransferInputFixture = (overrides = {}) => ({
  sourceAccountId: 'bank-acct-00000000-0000-0000-000000000001',
  destinationAccountId: 'bank-acct-00000000-0000-0000-000000000002',
  amount: '500.0000',
  transferType: 'internal' as const,
  referenceNumber: 'XFER-001',
  description: 'Monthly transfer',
  ...overrides,
});

// ─── Bank Statement Fixtures ──────────────────────────────────────────────

export const createBankStatementFixture = (overrides = {}) => ({
  id: 'bank-stmt-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  bankAccountId: 'bank-acct-00000000-0000-0000-000000000001',
  statementDate: '2026-07-01',
  periodStart: '2026-06-01',
  periodEnd: '2026-06-30',
  openingBalance: '9000.0000',
  closingBalance: '10000.0000',
  importSource: 'csv' as const,
  importStatus: 'completed' as const,
  fileReference: 'stmt_june_2026.csv',
  transactionCount: 45,
  reconciledCount: 30,
  importedBy: TEST_USER_ID,
  importedAt: new Date('2026-07-01'),
  createdAt: new Date('2026-07-01'),
  updatedAt: new Date('2026-07-01'),
  deletedAt: null,
  ...overrides,
});

export const createBankStatementInputFixture = (overrides = {}) => ({
  bankAccountId: 'bank-acct-00000000-0000-0000-000000000001',
  statementDate: '2026-07-01',
  periodStart: '2026-06-01',
  periodEnd: '2026-06-30',
  openingBalance: '9000.0000',
  closingBalance: '10000.0000',
  importSource: 'csv' as const,
  fileReference: 'stmt_june_2026.csv',
  transactionCount: 45,
  ...overrides,
});

// ─── Reconciliation Entry Fixtures ────────────────────────────────────────

export const createReconciliationEntryFixture = (overrides = {}) => ({
  id: 'recon-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  statementId: 'bank-stmt-00000000-0000-0000-000000000001',
  bankAccountId: 'bank-acct-00000000-0000-0000-000000000001',
  transactionDate: '2026-06-15',
  description: 'Wire transfer from client',
  amount: '2500.0000',
  balanceAfter: '11500.0000',
  transactionType: 'credit' as const,
  referenceNumber: 'WIRE-001',
  reconciliationStatus: 'unmatched' as const,
  matchedEntityId: null,
  matchedEntityType: null,
  matchConfidence: null,
  reconciledBy: null,
  reconciledAt: null,
  createdAt: new Date('2026-07-01'),
  updatedAt: new Date('2026-07-01'),
  deletedAt: null,
  ...overrides,
});

export const createReconciliationEntryInputFixture = (overrides = {}) => ({
  statementId: 'bank-stmt-00000000-0000-0000-000000000001',
  bankAccountId: 'bank-acct-00000000-0000-0000-000000000001',
  transactionDate: '2026-06-15',
  description: 'Wire transfer from client',
  amount: '2500.0000',
  balanceAfter: '11500.0000',
  transactionType: 'credit' as const,
  referenceNumber: 'WIRE-001',
  ...overrides,
});

// ─── Currency Fixtures ────────────────────────────────────────────────────

export const createCurrencyFixture = (overrides = {}) => ({
  id: 'curr-00000000-0000-0000-000000000001',
  code: 'USD',
  name: 'United States Dollar',
  symbol: '$',
  decimalPlaces: 2,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

// ─── Bank Connection Fixtures ─────────────────────────────────────────────

export const createBankConnectionFixture = (overrides = {}) => ({
  id: 'bank-conn-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  bankAccountId: 'bank-acct-00000000-0000-0000-000000000001',
  connectionType: 'plaid' as const,
  institutionName: 'Chase Bank',
  institutionId: 'ins_3',
  accessToken: 'access-token-encrypted',
  refreshToken: 'refresh-token-encrypted',
  syncFrequency: 'daily' as const,
  status: 'active' as const,
  lastSyncAt: new Date('2026-07-01'),
  lastSyncError: null,
  createdBy: TEST_USER_ID,
  createdAt: new Date('2026-07-01'),
  updatedAt: new Date('2026-07-01'),
  deletedAt: null,
  ...overrides,
});

export const createBankConnectionInputFixture = (overrides = {}) => ({
  bankAccountId: 'bank-acct-00000000-0000-0000-000000000001',
  connectionType: 'plaid' as const,
  institutionName: 'Chase Bank',
  institutionId: 'ins_3',
  accessToken: 'access-token-encrypted',
  refreshToken: 'refresh-token-encrypted',
  ...overrides,
});
