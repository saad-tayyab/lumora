import { TEST_TENANT_ID } from '../../../lib/test-utils';

// ─── Tax Code Fixtures ─────────────────────────────────────────────────────

export const createTaxCodeFixture = (overrides = {}) => ({
  id: 'tax-code-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  code: 'VAT-STD',
  name: 'Standard VAT',
  type: 'vat' as const,
  glAccountId: 'gl-account-00000000-0000-0000-000000000001',
  isClaimable: false,
  postingRule: 'output_liability' as const,
  isActive: true,
  description: 'Standard VAT rate',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createInactiveTaxCodeFixture = (overrides = {}) =>
  createTaxCodeFixture({
    isActive: false,
    code: 'VAT-INACTIVE',
    name: 'Inactive VAT',
    ...overrides,
  });

export const createSalesTaxCodeFixture = (overrides = {}) =>
  createTaxCodeFixture({
    code: 'SALES-TX',
    name: 'Sales Tax',
    type: 'sales_tax' as const,
    ...overrides,
  });

export const createGstTaxCodeFixture = (overrides = {}) =>
  createTaxCodeFixture({ code: 'GST', name: 'GST', type: 'gst' as const, ...overrides });

export const createExciseTaxCodeFixture = (overrides = {}) =>
  createTaxCodeFixture({
    code: 'EXCISE',
    name: 'Excise Duty',
    type: 'excise' as const,
    ...overrides,
  });

export const createWithholdingTaxCodeFixture = (overrides = {}) =>
  createTaxCodeFixture({
    code: 'WHT',
    name: 'Withholding Tax',
    type: 'withholding' as const,
    ...overrides,
  });

export const createNoGlAccountTaxCodeFixture = (overrides = {}) =>
  createTaxCodeFixture({ glAccountId: null, ...overrides });

// ─── Tax Rate Fixtures ─────────────────────────────────────────────────────

export const createTaxRateFixture = (overrides = {}) => ({
  id: 'tax-rate-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  taxCodeId: 'tax-code-00000000-0000-0000-000000000001',
  rate: '0.1500',
  effectiveDate: '2026-01-01',
  expiryDate: '2026-12-31',
  description: 'Standard 15% VAT rate',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createExpiredTaxRateFixture = (overrides = {}) =>
  createTaxRateFixture({
    rate: '0.1000',
    effectiveDate: '2024-01-01',
    expiryDate: '2024-12-31',
    description: 'Expired 10% rate',
    ...overrides,
  });

export const createIndefiniteTaxRateFixture = (overrides = {}) =>
  createTaxRateFixture({ expiryDate: null, description: 'Indefinite rate', ...overrides });

// ─── Tax Auto-Assignment Rule Fixtures ─────────────────────────────────────

export const createAutoAssignmentRuleFixture = (overrides = {}) => ({
  id: 'rule-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  name: 'Standard VAT Rule',
  description: 'Apply standard VAT to all sales',
  priority: 10,
  taxCodeId: 'tax-code-00000000-0000-0000-000000000001',
  entityType: 'sales_invoice',
  entityCategoryId: null,
  customerGroupId: null,
  itemCategoryId: null,
  regionCode: null,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createHighPriorityRuleFixture = (overrides = {}) =>
  createAutoAssignmentRuleFixture({ name: 'High Priority Rule', priority: 1, ...overrides });

export const createLowPriorityRuleFixture = (overrides = {}) =>
  createAutoAssignmentRuleFixture({ name: 'Low Priority Rule', priority: 100, ...overrides });

// ─── Input Fixtures ────────────────────────────────────────────────────────

export const createTaxCodeInputFixture = (overrides = {}) => ({
  code: 'VAT-STD',
  name: 'Standard VAT',
  type: 'vat' as const,
  glAccountId: 'gl-account-00000000-0000-0000-000000000001',
  isClaimable: false,
  postingRule: 'output_liability' as const,
  isActive: true,
  description: 'Standard VAT rate',
  ...overrides,
});

export const createTaxRateInputFixture = (overrides = {}) => ({
  taxCodeId: 'tax-code-00000000-0000-0000-000000000001',
  rate: '0.1500',
  effectiveDate: '2026-01-01',
  expiryDate: '2026-12-31',
  description: 'Standard 15% VAT rate',
  isActive: true,
  ...overrides,
});

export const createAutoAssignmentRuleInputFixture = (overrides = {}) => ({
  name: 'Standard VAT Rule',
  description: 'Apply standard VAT to all sales',
  priority: 10,
  taxCodeId: 'tax-code-00000000-0000-0000-000000000001',
  entityType: 'sales_invoice',
  isActive: true,
  ...overrides,
});
