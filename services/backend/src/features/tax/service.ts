import {
  TaxAutoAssignmentRuleNotFoundError,
  TaxAutoAssignmentRulePriorityConflictError,
  TaxCodeAlreadyExistsError,
  TaxCodeGlAccountRequiredError,
  TaxCodeHasAutoAssignmentRulesError,
  TaxCodeHasRatesError,
  TaxCodeInactiveError,
  TaxCodeNotFoundError,
  TaxRateNotFoundError,
  TaxRateOverlapError,
} from './errors';
import { taxAutoAssignmentRulesRepo, taxCodesRepo, taxRatesRepo } from './repo';
import type {
  CreateTaxAutoAssignmentRuleRequest,
  CreateTaxCodeRequest,
  CreateTaxRateRequest,
  ListResponse,
  PaginationParams,
  ResolveAutoAssignmentRequest,
  TaxAutoAssignmentRuleResponse,
  TaxCalculationResult,
  TaxCodeResponse,
  TaxRateResponse,
  UpdateTaxAutoAssignmentRuleRequest,
  UpdateTaxCodeRequest,
  UpdateTaxRateRequest,
} from './types';

// ─── Tax Code Service ──────────────────────────────────────────────────────

export async function createTaxCode(
  data: CreateTaxCodeRequest,
  tenantId: string,
): Promise<TaxCodeResponse> {
  // INV-TAX-003: Tax codes must link to a GL account
  if (!data.glAccountId) {
    throw new TaxCodeGlAccountRequiredError('new');
  }

  // Code uniqueness within tenant
  const existing = await taxCodesRepo.findByCode(data.code, tenantId);
  if (existing) {
    throw new TaxCodeAlreadyExistsError(data.code);
  }

  return taxCodesRepo.create({
    ...data,
    tenantId,
  });
}

export async function getTaxCode(id: string, tenantId: string): Promise<TaxCodeResponse> {
  const taxCode = await taxCodesRepo.findById(id, tenantId);
  if (!taxCode) {
    throw new TaxCodeNotFoundError(id);
  }
  return taxCode;
}

export async function listTaxCodes(
  tenantId: string,
  params: PaginationParams & {
    type?: 'sales_tax' | 'vat' | 'gst' | 'excise' | 'withholding';
    isActive?: boolean;
  },
): Promise<ListResponse<TaxCodeResponse>> {
  const offset = (params.page - 1) * params.limit;
  const { data, total } = await taxCodesRepo.findMany(tenantId, {
    limit: params.limit,
    offset,
    type: params.type,
    isActive: params.isActive,
  });

  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function updateTaxCode(
  id: string,
  data: UpdateTaxCodeRequest,
  tenantId: string,
): Promise<TaxCodeResponse> {
  const existing = await taxCodesRepo.findById(id, tenantId);
  if (!existing) {
    throw new TaxCodeNotFoundError(id);
  }

  // INV-TAX-003: If updating GL account, ensure it's provided
  if (data.glAccountId !== undefined && !data.glAccountId) {
    throw new TaxCodeGlAccountRequiredError(id);
  }

  // If updating code, check uniqueness
  if (data.code && data.code !== existing.code) {
    const duplicate = await taxCodesRepo.findByCode(data.code, tenantId);
    if (duplicate) {
      throw new TaxCodeAlreadyExistsError(data.code);
    }
  }

  return taxCodesRepo.update(id, tenantId, data);
}

export async function deleteTaxCode(id: string, tenantId: string): Promise<void> {
  const existing = await taxCodesRepo.findById(id, tenantId);
  if (!existing) {
    throw new TaxCodeNotFoundError(id);
  }

  // Cannot delete tax code with associated tax rates
  const rateCount = await taxCodesRepo.countRatesByTaxCodeId(id, tenantId);
  if (rateCount > 0) {
    throw new TaxCodeHasRatesError(id);
  }

  // Cannot delete tax code with associated auto-assignment rules
  const ruleCount = await taxCodesRepo.countAutoAssignmentRulesByTaxCodeId(id, tenantId);
  if (ruleCount > 0) {
    throw new TaxCodeHasAutoAssignmentRulesError(id);
  }

  await taxCodesRepo.delete(id, tenantId);
}

// ─── Tax Rate Service ──────────────────────────────────────────────────────

export async function createTaxRate(
  data: CreateTaxRateRequest,
  tenantId: string,
): Promise<TaxRateResponse> {
  // INV-TAX-001: Every tax rate must have effective date and optional expiry date
  if (!data.effectiveDate) {
    throw new TaxCodeGlAccountRequiredError(data.taxCodeId);
  }

  // Ensure the referenced tax code exists
  const taxCode = await taxCodesRepo.findById(data.taxCodeId, tenantId);
  if (!taxCode) {
    throw new TaxCodeNotFoundError(data.taxCodeId);
  }

  // Tax code must be active
  if (!taxCode.isActive) {
    throw new TaxCodeInactiveError(data.taxCodeId);
  }

  // BR-014: Check for overlapping effective dates on the same tax code
  const hasOverlap = await taxRatesRepo.hasOverlap(data.taxCodeId, data.effectiveDate, tenantId);
  if (hasOverlap) {
    throw new TaxRateOverlapError(data.taxCodeId, data.effectiveDate);
  }

  return taxRatesRepo.create({
    ...data,
    tenantId,
    expiryDate: data.expiryDate ?? null,
  });
}

export async function getTaxRate(id: string, tenantId: string): Promise<TaxRateResponse> {
  const taxRate = await taxRatesRepo.findById(id, tenantId);
  if (!taxRate) {
    throw new TaxRateNotFoundError(id);
  }
  return taxRate;
}

export async function listTaxRates(
  tenantId: string,
  params: PaginationParams & {
    taxCodeId?: string;
    isActive?: boolean;
  },
): Promise<ListResponse<TaxRateResponse>> {
  const offset = (params.page - 1) * params.limit;
  const { data, total } = await taxRatesRepo.findMany(tenantId, {
    limit: params.limit,
    offset,
    taxCodeId: params.taxCodeId,
    isActive: params.isActive,
  });

  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function updateTaxRate(
  id: string,
  data: UpdateTaxRateRequest,
  tenantId: string,
): Promise<TaxRateResponse> {
  const existing = await taxRatesRepo.findById(id, tenantId);
  if (!existing) {
    throw new TaxRateNotFoundError(id);
  }

  // If updating effective date, check for overlaps
  const newEffectiveDate = data.effectiveDate ?? existing.effectiveDate;
  if (data.effectiveDate && data.effectiveDate !== existing.effectiveDate) {
    const hasOverlap = await taxRatesRepo.hasOverlap(
      existing.taxCodeId,
      data.effectiveDate,
      tenantId,
      id,
    );
    if (hasOverlap) {
      throw new TaxRateOverlapError(existing.taxCodeId, data.effectiveDate);
    }
  }

  // Validate expiry date is after effective date
  const newExpiryDate = data.expiryDate !== undefined ? data.expiryDate : existing.expiryDate;
  if (newExpiryDate && newEffectiveDate && newExpiryDate <= newEffectiveDate) {
    throw new TaxRateOverlapError(existing.taxCodeId, newEffectiveDate);
  }

  return taxRatesRepo.update(id, tenantId, data);
}

export async function deleteTaxRate(id: string, tenantId: string): Promise<void> {
  const existing = await taxRatesRepo.findById(id, tenantId);
  if (!existing) {
    throw new TaxRateNotFoundError(id);
  }

  await taxRatesRepo.delete(id, tenantId);
}

// ─── Tax Calculation Service ───────────────────────────────────────────────

/**
 * Calculate tax amount for a given tax code and taxable amount.
 *
 * INV-TAX-002: Tax transactions must snapshot the rate at time of calculation.
 * INV-TAX-003: Tax codes must link to a GL account.
 * BR-015: Tax amount is calculated and snapshotted at transaction time.
 * BR-017: Expired tax rates cannot be applied to new transactions.
 */
export async function calculateTax(
  taxCodeId: string,
  taxableAmount: string,
  transactionDate: string,
  tenantId: string,
): Promise<TaxCalculationResult> {
  // Validate tax code exists and is active
  const taxCode = await taxCodesRepo.findById(taxCodeId, tenantId);
  if (!taxCode) {
    throw new TaxCodeNotFoundError(taxCodeId);
  }
  if (!taxCode.isActive) {
    throw new TaxCodeInactiveError(taxCodeId);
  }

  // INV-TAX-003: Tax code must have a GL account linked
  if (!taxCode.glAccountId) {
    throw new TaxCodeGlAccountRequiredError(taxCodeId);
  }

  // BR-017: Find the active rate for the transaction date
  const taxRate = await taxRatesRepo.findActiveRateForDate(taxCodeId, transactionDate, tenantId);
  if (!taxRate) {
    throw new TaxCodeNotFoundError(taxCodeId);
  }

  // Calculate tax amount: taxableAmount * rate
  const rateDecimal = Number(taxRate.rate);
  const taxableDecimal = Number(taxableAmount);
  const taxAmount = (taxableDecimal * rateDecimal).toFixed(4);

  // INV-TAX-002: Return the snapshotted rate details for transaction recording
  return {
    taxCodeId: taxCode.id,
    taxRateId: taxRate.id,
    rate: taxRate.rate,
    taxableAmount,
    taxAmount,
    effectiveDate: taxRate.effectiveDate,
    expiryDate: taxRate.expiryDate,
  };
}

// ─── Tax Auto-Assignment Rule Service ──────────────────────────────────────

export async function createAutoAssignmentRule(
  data: CreateTaxAutoAssignmentRuleRequest,
  tenantId: string,
): Promise<TaxAutoAssignmentRuleResponse> {
  // Validate tax code exists
  const taxCode = await taxCodesRepo.findById(data.taxCodeId, tenantId);
  if (!taxCode) {
    throw new TaxCodeNotFoundError(data.taxCodeId);
  }

  // Tax code must be active
  if (!taxCode.isActive) {
    throw new TaxCodeInactiveError(data.taxCodeId);
  }

  // BR-016: Check priority uniqueness
  const hasConflict = await taxAutoAssignmentRulesRepo.hasPriorityConflict(data.priority, tenantId);
  if (hasConflict) {
    throw new TaxAutoAssignmentRulePriorityConflictError(data.priority);
  }

  return taxAutoAssignmentRulesRepo.create({
    ...data,
    tenantId,
    entityCategoryId: data.entityCategoryId ?? null,
    customerGroupId: data.customerGroupId ?? null,
    itemCategoryId: data.itemCategoryId ?? null,
    regionCode: data.regionCode ?? null,
  });
}

export async function getAutoAssignmentRule(
  id: string,
  tenantId: string,
): Promise<TaxAutoAssignmentRuleResponse> {
  const rule = await taxAutoAssignmentRulesRepo.findById(id, tenantId);
  if (!rule) {
    throw new TaxAutoAssignmentRuleNotFoundError(id);
  }
  return rule;
}

export async function listAutoAssignmentRules(
  tenantId: string,
  params: PaginationParams & {
    isActive?: boolean;
  },
): Promise<ListResponse<TaxAutoAssignmentRuleResponse>> {
  const offset = (params.page - 1) * params.limit;
  const { data, total } = await taxAutoAssignmentRulesRepo.findMany(tenantId, {
    limit: params.limit,
    offset,
    isActive: params.isActive,
  });

  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function updateAutoAssignmentRule(
  id: string,
  data: UpdateTaxAutoAssignmentRuleRequest,
  tenantId: string,
): Promise<TaxAutoAssignmentRuleResponse> {
  const existing = await taxAutoAssignmentRulesRepo.findById(id, tenantId);
  if (!existing) {
    throw new TaxAutoAssignmentRuleNotFoundError(id);
  }

  // If updating tax code, validate it exists and is active
  if (data.taxCodeId) {
    const taxCode = await taxCodesRepo.findById(data.taxCodeId, tenantId);
    if (!taxCode) {
      throw new TaxCodeNotFoundError(data.taxCodeId);
    }
    if (!taxCode.isActive) {
      throw new TaxCodeInactiveError(data.taxCodeId);
    }
  }

  // BR-016: If updating priority, check for conflicts
  if (data.priority !== undefined && data.priority !== existing.priority) {
    const hasConflict = await taxAutoAssignmentRulesRepo.hasPriorityConflict(
      data.priority,
      tenantId,
      id,
    );
    if (hasConflict) {
      throw new TaxAutoAssignmentRulePriorityConflictError(data.priority);
    }
  }

  return taxAutoAssignmentRulesRepo.update(id, tenantId, data);
}

export async function deleteAutoAssignmentRule(id: string, tenantId: string): Promise<void> {
  const existing = await taxAutoAssignmentRulesRepo.findById(id, tenantId);
  if (!existing) {
    throw new TaxAutoAssignmentRuleNotFoundError(id);
  }

  await taxAutoAssignmentRulesRepo.delete(id, tenantId);
}

// ─── Auto-Assignment Resolution Service ─────────────────────────────────────

/**
 * Resolve the applicable tax code for an entity based on auto-assignment rules.
 *
 * BR-016: Tax auto-assignment rules are evaluated by priority order.
 * Returns the highest-priority matching rule's tax code, or undefined if none match.
 */
export async function resolveAutoAssignment(
  params: ResolveAutoAssignmentRequest,
  tenantId: string,
): Promise<TaxCalculationResult | undefined> {
  // Find matching rules ordered by priority
  const rules = await taxAutoAssignmentRulesRepo.findMatchingRules(tenantId, {
    entityType: params.entityType,
    entityCategoryId: params.entityCategoryId,
    customerGroupId: params.customerGroupId,
    itemCategoryId: params.itemCategoryId,
    regionCode: params.regionCode,
  });

  if (rules.length === 0) {
    return undefined;
  }

  // BR-016: First rule (lowest priority number = highest priority) wins
  const matchedRule = rules[0];

  // Validate tax code is active
  const taxCode = await taxCodesRepo.findById(matchedRule.taxCodeId, tenantId);
  if (!taxCode?.isActive) {
    return undefined;
  }

  // Find active rate for the transaction date
  const taxRate = await taxRatesRepo.findActiveRateForDate(
    matchedRule.taxCodeId,
    params.transactionDate,
    tenantId,
  );
  if (!taxRate) {
    return undefined;
  }

  // Return the tax code and rate information for the caller to calculate
  return {
    taxCodeId: taxCode.id,
    taxRateId: taxRate.id,
    rate: taxRate.rate,
    taxableAmount: '0', // Caller provides the taxable amount
    taxAmount: '0', // Caller calculates the tax amount
    effectiveDate: taxRate.effectiveDate,
    expiryDate: taxRate.expiryDate,
  };
}
