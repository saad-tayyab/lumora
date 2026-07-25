import { TEST_TENANT_ID, TEST_USER_ID } from '../../../lib/test-utils';

// ─── Asset Category Fixtures ───────────────────────────────────────────────

export const createAssetCategoryFixture = (overrides = {}) => ({
  id: 'acat-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  code: 'BLDG',
  name: 'Buildings',
  description: 'Buildings and structures',
  defaultDepreciationMethod: 'straight_line' as const,
  defaultUsefulLifeMonths: 240,
  defaultSalvageValuePercent: '10',
  isDepreciable: true,
  glAccountId: 'gl-00000000-0000-0000-000000000001',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createLandCategoryFixture = (overrides = {}) =>
  createAssetCategoryFixture({
    code: 'LAND',
    name: 'Land',
    isDepreciable: false,
    defaultDepreciationMethod: null,
    defaultUsefulLifeMonths: null,
    ...overrides,
  });

export const createEquipmentCategoryFixture = (overrides = {}) =>
  createAssetCategoryFixture({
    code: 'EQPM',
    name: 'Equipment',
    defaultDepreciationMethod: 'straight_line' as const,
    defaultUsefulLifeMonths: 60,
    defaultSalvageValuePercent: '5',
    ...overrides,
  });

// ─── Fixed Asset Fixtures ──────────────────────────────────────────────────

export const createFixedAssetFixture = (overrides = {}) => ({
  id: 'fa-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  name: 'Office Building',
  assetNumber: 'FA-001',
  description: 'Main office building',
  categoryId: 'acat-00000000-0000-0000-000000000001',
  acquisitionDate: '2026-01-01',
  acquisitionCost: '500000',
  salvageValue: '50000',
  usefulLifeMonths: 240,
  depreciationMethod: 'straight_line' as const,
  status: 'active' as const,
  accumulatedDepreciation: '0',
  netBookValue: '500000',
  glAccountId: 'gl-00000000-0000-0000-000000000001',
  isDepreciable: true,
  disposalDate: null,
  disposalProceeds: null,
  createdBy: TEST_USER_ID,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createLandAssetFixture = (overrides = {}) =>
  createFixedAssetFixture({
    id: 'fa-land-00000000-00000000-00000001',
    name: 'Land Parcel',
    assetNumber: 'FA-LAND-001',
    categoryId: 'acat-land-0000-0000-0000000000001',
    isDepreciable: false,
    depreciationMethod: null,
    usefulLifeMonths: null,
    salvageValue: '0',
    accumulatedDepreciation: '0',
    ...overrides,
  });

export const createFullyDepreciatedAssetFixture = (overrides = {}) =>
  createFixedAssetFixture({
    id: 'fa-depr-00000000-0000-0000-00000001',
    name: 'Fully Depreciated Asset',
    assetNumber: 'FA-DEPR-001',
    status: 'fully_depreciated' as const,
    accumulatedDepreciation: '450000',
    netBookValue: '50000',
    ...overrides,
  });

export const createDisposedAssetFixture = (overrides = {}) =>
  createFixedAssetFixture({
    id: 'fa-disp-00000000-0000-0000-00000001',
    name: 'Disposed Asset',
    assetNumber: 'FA-DISP-001',
    status: 'disposed' as const,
    disposalDate: '2026-06-15',
    disposalProceeds: '30000',
    accumulatedDepreciation: '400000',
    netBookValue: '100000',
    ...overrides,
  });

// ─── Depreciation Schedule Fixtures ────────────────────────────────────────

export const createDepreciationScheduleFixture = (overrides = {}) => ({
  id: 'ds-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  assetId: 'fa-00000000-0000-0000-000000000001',
  startDate: '2026-01-01',
  endDate: '2046-01-01',
  totalDepreciableCost: '450000',
  monthlyAmount: '1875',
  method: 'straight_line' as const,
  status: 'active' as const,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

// ─── Depreciation Entry Fixtures ───────────────────────────────────────────

export const createDepreciationEntryFixture = (overrides = {}) => ({
  id: 'de-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  assetId: 'fa-00000000-0000-0000-000000000001',
  scheduleId: 'ds-00000000-0000-0000-000000000001',
  periodStartDate: '2026-01-01',
  periodEndDate: '2026-01-31',
  depreciationAmount: '1875',
  accumulatedDepreciation: '1875',
  netBookValue: '498125',
  status: 'draft' as const,
  journalEntryId: null,
  createdBy: TEST_USER_ID,
  createdAt: new Date('2026-01-31'),
  updatedAt: new Date('2026-01-31'),
  deletedAt: null,
  ...overrides,
});

export const createPostedDepreciationEntryFixture = (overrides = {}) =>
  createDepreciationEntryFixture({
    id: 'de-post-00000000-0000-0000-00000001',
    status: 'posted' as const,
    journalEntryId: 'je-00000000-0000-0000-000000000001',
    ...overrides,
  });

export const createVoidedDepreciationEntryFixture = (overrides = {}) =>
  createDepreciationEntryFixture({
    id: 'de-void-00000000-0000-0000-00000001',
    status: 'voided' as const,
    ...overrides,
  });

// ─── Asset Adjustment Fixtures ─────────────────────────────────────────────

export const createAssetAdjustmentFixture = (overrides = {}) => ({
  id: 'adj-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  assetId: 'fa-00000000-0000-0000-000000000001',
  adjustmentType: 'revaluation' as const,
  adjustmentDate: '2026-06-15',
  adjustmentAmount: '50000',
  direction: 'increase' as const,
  description: 'Revaluation of office building',
  revisedUsefulLifeMonths: null,
  revisedSalvageValue: null,
  status: 'draft' as const,
  journalEntryId: null,
  createdBy: TEST_USER_ID,
  createdAt: new Date('2026-06-15'),
  updatedAt: new Date('2026-06-15'),
  deletedAt: null,
  ...overrides,
});

export const createPostedAdjustmentFixture = (overrides = {}) =>
  createAssetAdjustmentFixture({
    id: 'adj-post-00000000-0000-0000-00000001',
    status: 'posted' as const,
    journalEntryId: 'je-00000000-0000-0000-000000000099',
    ...overrides,
  });

// ─── Input Fixtures ────────────────────────────────────────────────────────

export const createAssetCategoryInputFixture = (overrides = {}) => ({
  code: 'BLDG',
  name: 'Buildings',
  description: 'Buildings and structures',
  defaultDepreciationMethod: 'straight_line' as const,
  defaultUsefulLifeMonths: 240,
  defaultSalvageValuePercent: '10',
  isDepreciable: true,
  glAccountId: 'gl-00000000-0000-0000-000000000001',
  ...overrides,
});

export const createFixedAssetInputFixture = (overrides = {}) => ({
  name: 'Office Building',
  assetNumber: 'FA-001',
  description: 'Main office building',
  categoryId: 'acat-00000000-0000-0000-000000000001',
  acquisitionDate: '2026-01-01',
  acquisitionCost: '500000',
  salvageValue: '50000',
  usefulLifeMonths: 240,
  depreciationMethod: 'straight_line' as const,
  glAccountId: 'gl-00000000-0000-0000-000000000001',
  ...overrides,
});

export const createDepreciationScheduleInputFixture = (overrides = {}) => ({
  assetId: 'fa-00000000-0000-0000-000000000001',
  startDate: '2026-01-01',
  endDate: '2046-01-01',
  totalDepreciableCost: '450000',
  monthlyAmount: '1875',
  method: 'straight_line' as const,
  ...overrides,
});

export const createDepreciationEntryInputFixture = (overrides = {}) => ({
  assetId: 'fa-00000000-0000-0000-000000000001',
  scheduleId: 'ds-00000000-0000-0000-000000000001',
  periodStartDate: '2026-01-01',
  periodEndDate: '2026-01-31',
  depreciationAmount: '1875',
  ...overrides,
});

export const createAssetAdjustmentInputFixture = (overrides = {}) => ({
  assetId: 'fa-00000000-0000-0000-000000000001',
  adjustmentType: 'revaluation' as const,
  adjustmentDate: '2026-06-15',
  adjustmentAmount: '50000',
  direction: 'increase' as const,
  description: 'Revaluation of office building',
  ...overrides,
});

export const createDisposeAssetInputFixture = (overrides = {}) => ({
  disposalDate: '2026-06-15',
  disposalProceeds: '30000',
  ...overrides,
});
