import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { testDb, TEST_TENANT_ID, TEST_USER_ID } from '../../lib/integration-test-utils';
import {
  unitOfMeasures,
  itemCategories,
  items,
  warehouses,
  stockLevels,
  stockMovements,
} from '@lumora/database/schema/inv';
import { eq } from 'drizzle-orm';

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message);
      this.code = code;
      this.status = opts?.status ?? 500;
    }
  },
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));
vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class {
    connectionString = '';
    constructor(_n: string, _c?: unknown) {}
  },
}));
vi.mock('encore.dev/pubsub', () => ({
  Topic: class {
    publish = vi.fn().mockResolvedValue(undefined);
  },
}));
vi.mock('../../database', () => ({ db: testDb }));

import * as service from './service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function cleanupInvTestData(): Promise<void> {
  await testDb.delete(stockMovements).where(eq(stockMovements.tenantId, TEST_TENANT_ID));
  await testDb.delete(stockLevels).where(eq(stockLevels.tenantId, TEST_TENANT_ID));
  await testDb.delete(items).where(eq(items.tenantId, TEST_TENANT_ID));
  await testDb.delete(warehouses).where(eq(warehouses.tenantId, TEST_TENANT_ID));
  await testDb.delete(itemCategories).where(eq(itemCategories.tenantId, TEST_TENANT_ID));
  await testDb.delete(unitOfMeasures);
}

function makeUomInput(overrides: Record<string, unknown> = {}) {
  return {
    code: `UOM-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'Pieces',
    category: 'count' as const,
    decimalPlaces: 0,
    conversionFactor: '1',
    ...overrides,
  };
}

function makeCategoryInput(overrides: Record<string, unknown> = {}) {
  return {
    name: `Category-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    code: `CAT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    description: 'Test category',
    isActive: true,
    ...overrides,
  };
}

function makeItemInput(
  categoryId: string,
  unitOfMeasureId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    sku: `SKU-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: 'Test Item',
    description: 'A test item',
    categoryId,
    unitOfMeasureId,
    isActive: true,
    isSerialized: false,
    isLotTracked: false,
    reorderPoint: 10,
    reorderOptimalQuantity: 100,
    reorderLeadTimeDays: 7,
    reorderSafetyStock: 5,
    costMethod: 'weighted_average' as const,
    ...overrides,
  };
}

function makeWarehouseInput(overrides: Record<string, unknown> = {}) {
  return {
    name: `Warehouse-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    code: `WH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    isActive: true,
    isDefault: false,
    ...overrides,
  };
}

// ─── Item Lifecycle ───────────────────────────────────────────────────────────

describe('Item lifecycle (service layer)', () => {
  let uomId: string;

  beforeAll(async () => {
    await cleanupInvTestData();
    const uom = await testDb.insert(unitOfMeasures).values(makeUomInput()).returning();
    uomId = uom[0].id;
  });

  afterAll(async () => {
    await cleanupInvTestData();
  });

  it('should create an item category', async () => {
    const category = await service.createItemCategory(TEST_TENANT_ID, makeCategoryInput());

    expect(category.id).toBeDefined();
    expect(category.tenantId).toBe(TEST_TENANT_ID);
    expect(category.isActive).toBe(true);

    const dbRow = await testDb.query.itemCategories.findFirst({
      where: eq(itemCategories.id, category.id),
    });
    expect(dbRow).toBeDefined();
    expect(dbRow!.code).toBe(category.code);
  });

  it('should create an item referencing the category', async () => {
    const category = await service.createItemCategory(TEST_TENANT_ID, makeCategoryInput());
    const item = await service.createItem(TEST_TENANT_ID, TEST_USER_ID, {
      ...makeItemInput(category.id, uomId),
      name: 'Widget A',
    });

    expect(item.id).toBeDefined();
    expect(item.name).toBe('Widget A');
    expect(item.categoryId).toBe(category.id);
    expect(item.unitOfMeasureId).toBe(uomId);
    expect(item.tenantId).toBe(TEST_TENANT_ID);

    const dbRow = await testDb.query.items.findFirst({ where: eq(items.id, item.id) });
    expect(dbRow).toBeDefined();
    expect(dbRow!.sku).toBe(item.sku);
  });

  it('should get an item by id', async () => {
    const category = await service.createItemCategory(TEST_TENANT_ID, makeCategoryInput());
    const created = await service.createItem(TEST_TENANT_ID, TEST_USER_ID, {
      ...makeItemInput(category.id, uomId),
      name: 'Widget B',
    });

    const found = await service.getItem(created.id);
    expect(found.id).toBe(created.id);
    expect(found.name).toBe('Widget B');
  });

  it('should update an item', async () => {
    const category = await service.createItemCategory(TEST_TENANT_ID, makeCategoryInput());
    const created = await service.createItem(TEST_TENANT_ID, TEST_USER_ID, {
      ...makeItemInput(category.id, uomId),
      name: 'Before Update',
    });

    const updated = await service.updateItem(created.id, {
      name: 'After Update',
      reorderPoint: 25,
    });

    expect(updated.name).toBe('After Update');
    expect(updated.reorderPoint).toBe(25);

    const dbRow = await testDb.query.items.findFirst({ where: eq(items.id, created.id) });
    expect(dbRow!.name).toBe('After Update');
    expect(dbRow!.reorderPoint).toBe(25);
  });

  it('should list items with pagination', async () => {
    const category = await service.createItemCategory(TEST_TENANT_ID, makeCategoryInput());
    for (let i = 0; i < 3; i++) {
      await service.createItem(TEST_TENANT_ID, TEST_USER_ID, {
        ...makeItemInput(category.id, uomId),
        name: `Listed Item ${i}`,
      });
    }

    const result = await service.listItems(TEST_TENANT_ID, { page: 1, limit: 2 });
    expect(result.data.length).toBeLessThanOrEqual(2);
    expect(result.total).toBeGreaterThanOrEqual(3);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBeGreaterThanOrEqual(2);
  });

  it('should throw DuplicateItemSkuError on duplicate SKU', async () => {
    const category = await service.createItemCategory(TEST_TENANT_ID, makeCategoryInput());
    const sku = `DUP-SKU-${Date.now()}`;
    await service.createItem(TEST_TENANT_ID, TEST_USER_ID, {
      ...makeItemInput(category.id, uomId),
      sku,
    });

    await expect(
      service.createItem(TEST_TENANT_ID, TEST_USER_ID, {
        ...makeItemInput(category.id, uomId),
        sku,
      }),
    ).rejects.toThrow();
  });

  it('should soft-delete an item', async () => {
    const category = await service.createItemCategory(TEST_TENANT_ID, makeCategoryInput());
    const created = await service.createItem(TEST_TENANT_ID, TEST_USER_ID, {
      ...makeItemInput(category.id, uomId),
    });

    await service.deleteItem(created.id);

    const dbRow = await testDb.query.items.findFirst({ where: eq(items.id, created.id) });
    expect(dbRow).toBeDefined();
    expect(dbRow!.deletedAt).not.toBeNull();
  });
});

// ─── Stock Movement ───────────────────────────────────────────────────────────

describe('Stock movement (service layer)', () => {
  let uomId: string;

  beforeAll(async () => {
    await cleanupInvTestData();
    const uom = await testDb.insert(unitOfMeasures).values(makeUomInput()).returning();
    uomId = uom[0].id;
  });

  afterAll(async () => {
    await cleanupInvTestData();
  });

  it('should create an inbound stock movement and update stock level', async () => {
    const category = await service.createItemCategory(TEST_TENANT_ID, makeCategoryInput());
    const item = await service.createItem(TEST_TENANT_ID, TEST_USER_ID, {
      ...makeItemInput(category.id, uomId),
    });
    const warehouse = await service.createWarehouse(TEST_TENANT_ID, makeWarehouseInput());

    const movement = await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, {
      itemId: item.id,
      warehouseId: warehouse.id,
      movementType: 'inbound',
      quantity: 50,
      sourceDocumentType: 'purchase_order',
      sourceDocumentId: '00000000-0000-0000-0000-000000000001',
      unitCost: '12.50',
      totalCost: '625.00',
    });

    expect(movement.id).toBeDefined();
    expect(movement.movementType).toBe('inbound');
    expect(movement.quantity).toBe(50);

    const level = await service.getStockLevel(item.id, warehouse.id);
    expect(level.quantityOnHand).toBe(50);

    const dbLevel = await testDb.query.stockLevels.findFirst({
      where: eq(stockLevels.id, level.id),
    });
    expect(dbLevel).toBeDefined();
    expect(dbLevel!.quantityOnHand).toBe(50);
  });

  it('should accumulate stock on multiple inbound movements', async () => {
    const category = await service.createItemCategory(TEST_TENANT_ID, makeCategoryInput());
    const item = await service.createItem(TEST_TENANT_ID, TEST_USER_ID, {
      ...makeItemInput(category.id, uomId),
    });
    const warehouse = await service.createWarehouse(TEST_TENANT_ID, makeWarehouseInput());

    await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, {
      itemId: item.id,
      warehouseId: warehouse.id,
      movementType: 'inbound',
      quantity: 30,
      sourceDocumentType: 'purchase_order',
      sourceDocumentId: '00000000-0000-0000-0000-000000000010',
    });
    await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, {
      itemId: item.id,
      warehouseId: warehouse.id,
      movementType: 'inbound',
      quantity: 20,
      sourceDocumentType: 'purchase_order',
      sourceDocumentId: '00000000-0000-0000-0000-000000000011',
    });

    const level = await service.getStockLevel(item.id, warehouse.id);
    expect(level.quantityOnHand).toBe(50);
  });

  it('should reject outbound movement that exceeds available stock (INV-INV-001)', async () => {
    const category = await service.createItemCategory(TEST_TENANT_ID, makeCategoryInput());
    const item = await service.createItem(TEST_TENANT_ID, TEST_USER_ID, {
      ...makeItemInput(category.id, uomId),
    });
    const warehouse = await service.createWarehouse(TEST_TENANT_ID, makeWarehouseInput());

    await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, {
      itemId: item.id,
      warehouseId: warehouse.id,
      movementType: 'inbound',
      quantity: 10,
      sourceDocumentType: 'purchase_order',
      sourceDocumentId: '00000000-0000-0000-0000-000000000020',
    });

    await expect(
      service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, {
        itemId: item.id,
        warehouseId: warehouse.id,
        movementType: 'outbound',
        quantity: -25,
        sourceDocumentType: 'sales_order',
        sourceDocumentId: '00000000-0000-0000-0000-000000000021',
      }),
    ).rejects.toThrow();

    const level = await service.getStockLevel(item.id, warehouse.id);
    expect(level.quantityOnHand).toBe(10);
  });

  it('should reject stock movement without source document (INV-INV-002)', async () => {
    const category = await service.createItemCategory(TEST_TENANT_ID, makeCategoryInput());
    const item = await service.createItem(TEST_TENANT_ID, TEST_USER_ID, {
      ...makeItemInput(category.id, uomId),
    });
    const warehouse = await service.createWarehouse(TEST_TENANT_ID, makeWarehouseInput());

    await expect(
      service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, {
        itemId: item.id,
        warehouseId: warehouse.id,
        movementType: 'inbound',
        quantity: 10,
        sourceDocumentType: '',
        sourceDocumentId: '',
      }),
    ).rejects.toThrow();
  });
});

// ─── Warehouse Lifecycle ──────────────────────────────────────────────────────

describe('Warehouse lifecycle (service layer)', () => {
  beforeAll(async () => {
    await cleanupInvTestData();
  });

  afterAll(async () => {
    await cleanupInvTestData();
  });

  it('should create a warehouse', async () => {
    const warehouse = await service.createWarehouse(TEST_TENANT_ID, makeWarehouseInput());

    expect(warehouse.id).toBeDefined();
    expect(warehouse.tenantId).toBe(TEST_TENANT_ID);
    expect(warehouse.isActive).toBe(true);

    const dbRow = await testDb.query.warehouses.findFirst({
      where: eq(warehouses.id, warehouse.id),
    });
    expect(dbRow).toBeDefined();
    expect(dbRow!.code).toBe(warehouse.code);
  });

  it('should get a warehouse by id', async () => {
    const created = await service.createWarehouse(TEST_TENANT_ID, makeWarehouseInput());

    const found = await service.getWarehouse(created.id);
    expect(found.id).toBe(created.id);
    expect(found.code).toBe(created.code);
  });

  it('should update a warehouse', async () => {
    const created = await service.createWarehouse(TEST_TENANT_ID, makeWarehouseInput());

    const updated = await service.updateWarehouse(created.id, {
      name: 'Updated Warehouse',
      city: 'Springfield',
    });

    expect(updated.name).toBe('Updated Warehouse');
    expect(updated.city).toBe('Springfield');

    const dbRow = await testDb.query.warehouses.findFirst({
      where: eq(warehouses.id, created.id),
    });
    expect(dbRow!.name).toBe('Updated Warehouse');
    expect(dbRow!.city).toBe('Springfield');
  });

  it('should list warehouses with pagination', async () => {
    for (let i = 0; i < 3; i++) {
      await service.createWarehouse(TEST_TENANT_ID, makeWarehouseInput());
    }

    const result = await service.listWarehouses(TEST_TENANT_ID, { page: 1, limit: 2 });
    expect(result.data.length).toBeLessThanOrEqual(2);
    expect(result.total).toBeGreaterThanOrEqual(3);
    expect(result.totalPages).toBeGreaterThanOrEqual(2);
  });

  it('should reject duplicate warehouse code within tenant', async () => {
    const code = `WH-DUP-${Date.now()}`;
    await service.createWarehouse(TEST_TENANT_ID, makeWarehouseInput({ code }));

    await expect(
      service.createWarehouse(TEST_TENANT_ID, makeWarehouseInput({ code })),
    ).rejects.toThrow();
  });

  it('should soft-delete a warehouse', async () => {
    const created = await service.createWarehouse(TEST_TENANT_ID, makeWarehouseInput());

    await service.deleteWarehouse(created.id);

    const dbRow = await testDb.query.warehouses.findFirst({
      where: eq(warehouses.id, created.id),
    });
    expect(dbRow).toBeDefined();
    expect(dbRow!.deletedAt).not.toBeNull();
  });
});
