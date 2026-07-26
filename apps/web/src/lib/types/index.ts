export type { Snippet } from 'svelte';

// ─── Financial Types ──────────────────────────────────────────────────────────

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId: string | null;
  balance: string;
  isActive: boolean;
  description: string | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  entryDate: string;
  description: string;
  reference: string;
  totalDebit: string;
  totalCredit: string;
  status: string;
  createdBy: string | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  description: string;
  debit: string;
  credit: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryLineInput {
  accountId: string;
  debit: string;
  credit: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  status: 'active' | 'suspended';
  emailVerified: boolean;
  mfaEnabled: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  userId: string;
  tenantId: string;
  user: User;
}

export interface Tenant {
  id: string;
  name: string;
}

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'voided';
export type PaymentMethod = 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'online';
export type BillStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'partially_paid'
  | 'paid'
  | 'voided';
export type PoStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'partially_received'
  | 'fully_received'
  | 'closed'
  | 'cancelled';
export type SalesOrderStatus =
  | 'draft'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'closed';
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
export type BudgetStatus = 'draft' | 'active' | 'closed';
export type FiscalYearStatus = 'open' | 'closed';
export type EmployeeStatus = 'active' | 'inactive' | 'terminated';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
export type PayrollStatus = 'draft' | 'processed' | 'paid' | 'cancelled';
export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';
export type BankAccountStatus = 'active' | 'inactive' | 'frozen' | 'closed';
export type TransferStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type ReconciliationStatus =
  | 'unmatched'
  | 'auto_matched'
  | 'manually_matched'
  | 'excluded'
  | 'disputed';
export type DepreciationMethod =
  | 'straight_line'
  | 'declining_balance'
  | 'sum_of_years'
  | 'units_of_production';
export type TaxCodeType = 'sales_tax' | 'vat' | 'gst' | 'excise' | 'withholding';
export type PostingRule = 'output_liability' | 'input_asset' | 'expense';
export type DiscountPolicyType = 'percentage' | 'fixed_amount' | 'tiered';
export type CreditNoteStatus = 'draft' | 'issued' | 'applied' | 'voided';
export type DepreciationEntryStatus = 'draft' | 'posted' | 'voided';
export type AssetStatus = 'active' | 'fully_depreciated' | 'disposed' | 'under_construction';
export type AssetAdjustmentType =
  | 'revaluation'
  | 'impairment'
  | 'restoration'
  | 'transfer'
  | 'reclassification';
export type AdjustmentDirection = 'increase' | 'decrease';

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  paymentTerms: string;
  creditLimit: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  amountPaid: string;
  balanceDue: string;
  currency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
  taxRate: string | null;
  taxAmount: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  customerId: string;
  paymentNumber: string;
  paymentDate: string;
  amount: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string | null;
  bankAccountId: string | null;
  currency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentApplication {
  id: string;
  paymentId: string;
  invoiceId: string;
  amountApplied: string;
  appliedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditNote {
  id: string;
  customerId: string;
  creditNoteNumber: string;
  status: CreditNoteStatus;
  issueDate: string;
  reason: string;
  amount: string;
  amountApplied: string;
  balance: string;
  currency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Asset Types ───────────────────────────────────────────────────────────────

export interface AssetCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  defaultDepreciationMethod: DepreciationMethod;
  defaultUsefulLifeMonths: number;
  defaultSalvageValuePercent: string;
  isDepreciable: boolean;
  glAccountId: string | null;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FixedAsset {
  id: string;
  name: string;
  assetNumber: string;
  description: string | null;
  categoryId: string;
  acquisitionDate: string;
  acquisitionCost: string;
  salvageValue: string;
  usefulLifeMonths: number;
  depreciationMethod: DepreciationMethod;
  status: AssetStatus;
  accumulatedDepreciation: string;
  netBookValue: string;
  glAccountId: string | null;
  isDepreciable: boolean;
  disposalDate: string | null;
  disposalProceeds: string | null;
  tenantId: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepreciationSchedule {
  id: string;
  assetId: string;
  startDate: string;
  endDate: string;
  totalDepreciableCost: string;
  monthlyAmount: string;
  method: DepreciationMethod;
  status: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepreciationEntry {
  id: string;
  assetId: string;
  scheduleId: string | null;
  periodStartDate: string;
  periodEndDate: string;
  depreciationAmount: string;
  accumulatedDepreciation: string;
  netBookValue: string;
  journalEntryId: string | null;
  status: DepreciationEntryStatus;
  tenantId: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetAdjustment {
  id: string;
  assetId: string;
  adjustmentType: AssetAdjustmentType;
  adjustmentDate: string;
  adjustmentAmount: string;
  direction: AdjustmentDirection;
  journalEntryId: string | null;
  description: string;
  revisedUsefulLifeMonths: number | null;
  revisedSalvageValue: string | null;
  status: DepreciationEntryStatus;
  tenantId: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Tax Types ─────────────────────────────────────────────────────────────────

export interface TaxCode {
  id: string;
  code: string;
  name: string;
  type: TaxCodeType;
  glAccountId: string;
  isClaimable: boolean;
  postingRule: PostingRule;
  isActive: boolean;
  description: string | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaxRate {
  id: string;
  taxCodeId: string;
  rate: string;
  effectiveDate: string;
  expiryDate: string | null;
  description: string | null;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaxAutoAssignmentRule {
  id: string;
  name: string;
  description: string | null;
  priority: number;
  taxCodeId: string;
  entityType: string;
  entityCategoryId: string | null;
  customerGroupId: string | null;
  itemCategoryId: string | null;
  regionCode: string | null;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Budget Types ──────────────────────────────────────────────────────────────

export interface BudgetHeader {
  id: string;
  name: string;
  description: string | null;
  periodStart: string;
  periodEnd: string;
  totalAmount: string;
  status: BudgetStatus;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetLine {
  id: string;
  budgetHeaderId: string;
  glAccountId: string;
  description: string | null;
  budgetAmount: string;
  consumedAmount: string;
  varianceAmount: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetConsumption {
  id: string;
  budgetLineId: string;
  journalEntryId: string | null;
  amount: string;
  description: string | null;
  consumptionDate: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetVariance {
  budgetLineId: string;
  glAccountId: string;
  budgetAmount: string;
  consumedAmount: string;
  varianceAmount: string;
}

export interface BudgetHeaderWithLines extends BudgetHeader {
  lines: BudgetLine[];
}

// ─── Audit Types ───────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  createdAt: string;
  userId: string | null;
  tenantId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
}

// ─── Auth Types ────────────────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  roleId: string;
  resource: string;
  action: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}
