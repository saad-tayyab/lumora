import { TEST_TENANT_ID, TEST_USER_ID } from '../../../lib/test-utils';

// ─── Item Fixtures ──────────────────────────────────────────────────────────

export const createItemFixture = (overrides = {}) => ({
  id: 'item-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  sku: 'SKU-001',
  barcode: null as string | null,
  name: 'Widget A',
  description: 'A standard widget',
  categoryId: 'cat-00000000-0000-0000-000000000001',
  unitOfMeasureId: 'uom-00000000-0000-0000-000000000001',
  isActive: true,
  isSerialized: false,
  isLotTracked: false,
  reorderPoint: 10,
  reorderOptimalQuantity: 50,
  reorderLeadTimeDays: 7,
  reorderSafetyStock: 5,
  costMethod: 'weighted_average' as const,
  createdBy: TEST_USER_ID,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createItemInputFixture = (overrides = {}) => ({
  sku: 'SKU-001',
  barcode: undefined as string | undefined,
  name: 'Widget A',
  description: 'A standard widget',
  categoryId: 'cat-00000000-0000-0000-000000000001',
  unitOfMeasureId: 'uom-00000000-0000-0000-000000000001',
  isActive: true,
  isSerialized: false,
  isLotTracked: false,
  reorderPoint: 10,
  reorderOptimalQuantity: 50,
  reorderLeadTimeDays: 7,
  reorderSafetyStock: 5,
  costMethod: 'weighted_average' as const,
  ...overrides,
});

// ─── Warehouse Fixtures ─────────────────────────────────────────────────────

export const createWarehouseFixture = (overrides = {}) => ({
  id: 'wh-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  name: 'Main Warehouse',
  code: 'WH-01',
  addressLine1: '123 Storage Ave',
  addressLine2: null as string | null,
  city: 'Warehouse City',
  state: 'CA',
  postalCode: '90210',
  country: 'US',
  isActive: true,
  isDefault: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createWarehouseInputFixture = (overrides = {}) => ({
  name: 'Main Warehouse',
  code: 'WH-01',
  addressLine1: '123 Storage Ave',
  addressLine2: undefined as string | undefined,
  city: 'Warehouse City',
  state: 'CA',
  postalCode: '90210',
  country: 'US',
  isActive: true,
  isDefault: true,
  ...overrides,
});

// ─── Item Category Fixtures ─────────────────────────────────────────────────

export const createItemCategoryFixture = (overrides = {}) => ({
  id: 'cat-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  name: 'Electronics',
  code: 'ELEC',
  description: 'Electronic components',
  parentId: null as string | null,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createItemCategoryInputFixture = (overrides = {}) => ({
  name: 'Electronics',
  code: 'ELEC',
  description: 'Electronic components',
  parentId: undefined as string | undefined,
  isActive: true,
  ...overrides,
});

// ─── Unit of Measure Fixtures ───────────────────────────────────────────────

export const createUnitOfMeasureFixture = (overrides = {}) => ({
  id: 'uom-00000000-0000-0000-000000000001',
  name: 'Each',
  code: 'EA',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

// ─── Stock Level Fixtures ───────────────────────────────────────────────────

export const createStockLevelFixture = (overrides = {}) => ({
  id: 'sl-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  itemId: 'item-00000000-0000-0000-000000000001',
  warehouseId: 'wh-00000000-0000-0000-000000000001',
  quantityOnHand: 100,
  lastMovementAt: new Date('2026-07-15'),
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-07-15'),
  deletedAt: null,
  ...overrides,
});

// ─── Stock Movement Fixtures ────────────────────────────────────────────────

export const createStockMovementFixture = (overrides = {}) => ({
  id: 'sm-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  itemId: 'item-00000000-0000-0000-000000000001',
  warehouseId: 'wh-00000000-0000-0000-000000000001',
  movementType: 'inbound' as const,
  quantity: 50,
  sourceDocumentType: 'purchase_order',
  sourceDocumentId: 'po-00000000-0000-0000-000000000001',
  unitCost: '10.00',
  totalCost: '500.00',
  referenceWarehouseId: null as string | null,
  reason: 'Initial stock receipt',
  movementDate: '2026-07-15',
  createdBy: TEST_USER_ID,
  createdAt: new Date('2026-07-15'),
  updatedAt: new Date('2026-07-15'),
  deletedAt: null,
  ...overrides,
});

export const createStockMovementInputFixture = (overrides = {}) => ({
  itemId: 'item-00000000-0000-0000-000000000001',
  warehouseId: 'wh-00000000-0000-0000-000000000001',
  movementType: 'inbound' as const,
  quantity: 50,
  sourceDocumentType: 'purchase_order',
  sourceDocumentId: 'po-00000000-0000-0000-000000000001',
  unitCost: '10.00',
  totalCost: '500.00',
  referenceWarehouseId: undefined as string | undefined,
  reason: 'Initial stock receipt',
  movementDate: '2026-07-15',
  ...overrides,
});
