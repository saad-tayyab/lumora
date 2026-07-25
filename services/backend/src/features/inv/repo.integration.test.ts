import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { testDb, TEST_TENANT_ID } from '../../lib/integration-test-utils';
import * as schema from '@lumora/database/schema';
import {
  unitOfMeasures,
  itemCategories,
  items,
  warehouses,
  stockLevels,
  stockMovements,
} from '@lumora/database/schema/inv';
import {
  unitOfMeasureRepo,
  itemCategoryRepo,
  itemRepo,
  warehouseRepo,
  stockLevelRepo,
  stockMovementRepo,
} from './repo';
import { eq } from 'drizzle-orm';

vi.mock('../../database', () => ({ db: testDb }));
vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class {
    connectionString = '';
  },
}));
vi.mock('encore.dev/api', () => ({
  APIError: class extends Error {
    constructor(c: string, m: string) {
      super(m);
    }
  },
  api: vi.fn(),
}));

async function cleanupInvTestData(): Promise<void> {
  await testDb.delete(stockMovements).where(eq(stockMovements.tenantId, TEST_TENANT_ID));
  await testDb.delete(stockLevels).where(eq(stockLevels.tenantId, TEST_TENANT_ID));
  await testDb.delete(items).where(eq(items.tenantId, TEST_TENANT_ID));
  await testDb.delete(warehouses).where(eq(warehouses.tenantId, TEST_TENANT_ID));
  await testDb.delete(itemCategories).where(eq(itemCategories.tenantId, TEST_TENANT_ID));
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
    tenantId: TEST_TENANT_ID,
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
    tenantId: TEST_TENANT_ID,
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
    tenantId: TEST_TENANT_ID,
    name: `Warehouse-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    code: `WH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    isActive: true,
    isDefault: false,
    ...overrides,
  };
}

function makeStockLevelInput(
  itemId: string,
  warehouseId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    tenantId: TEST_TENANT_ID,
    itemId,
    warehouseId,
    quantityOnHand: 100,
    quantityReserved: 0,
    quantityAvailable: 100,
    quantityOnOrder: 0,
    ...overrides,
  };
}

function makeStockMovementInput(
  itemId: string,
  warehouseId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    tenantId: TEST_TENANT_ID,
    itemId,
    warehouseId,
    movementType: 'inbound' as const,
    quantity: 10,
    sourceDocumentType: 'purchase_order',
    sourceDocumentId: `00000000-0000-0000-0000-000000000001`,
    unitCost: '10.0000',
    totalCost: '100.0000',
    movementDate: new Date(),
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Unit of Measures Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('unitOfMeasureRepo', () => {
  beforeAll(async () => {
    await testDb.delete(stockMovements);
    await testDb.delete(stockLevels);
    await testDb.delete(items);
    await testDb.delete(warehouses);
    await testDb.delete(itemCategories);
  });

  afterAll(async () => {
    await testDb.delete(stockMovements);
    await testDb.delete(stockLevels);
    await testDb.delete(items);
    await testDb.delete(warehouses);
    await testDb.delete(itemCategories);
  });

  it('should find a unit of measure by id', async () => {
    const input = makeUomInput();
    const [created] = await testDb.insert(unitOfMeasures).values(input).returning();

    const found = await unitOfMeasureRepo.findById(created.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.code).toBe(input.code);
  });

  it('should return undefined for non-existent unit of measure id', async () => {
    const found = await unitOfMeasureRepo.findById('00000000-0000-0000-0000-000000000000');
    expect(found).toBeUndefined();
  });

  it('should find a unit of measure by code', async () => {
    const input = makeUomInput({ code: `UOM-CODE-${Date.now()}` });
    const [created] = await testDb.insert(unitOfMeasures).values(input).returning();

    const found = await unitOfMeasureRepo.findByCode(input.code);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.code).toBe(input.code);
  });

  it('should return undefined for non-existent unit of measure code', async () => {
    const found = await unitOfMeasureRepo.findByCode('NO-SUCH-CODE');
    expect(found).toBeUndefined();
  });

  it('should find many unit of measures with default pagination', async () => {
    const result = await unitOfMeasureRepo.findMany();
    expect(result.data).toBeInstanceOf(Array);
    expect(result.limit).toBe(50);
    expect(result.offset).toBe(0);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it('should find many unit of measures with custom pagination', async () => {
    const result = await unitOfMeasureRepo.findMany({ limit: 5, offset: 0 });
    expect(result.limit).toBe(5);
    expect(result.offset).toBe(0);
    expect(result.data.length).toBeLessThanOrEqual(5);
  });

  it('should return total count of unit of measures', async () => {
    const result = await unitOfMeasureRepo.findMany();
    expect(typeof result.total).toBe('number');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Item Categories Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('itemCategoryRepo', () => {
  beforeAll(async () => {
    await cleanupInvTestData();
  });

  afterAll(async () => {
    await cleanupInvTestData();
  });

  it('should create an item category and return it', async () => {
    const input = makeCategoryInput();
    const [created] = await itemCategoryRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.name).toBe(input.name);
    expect(created.code).toBe(input.code);
    expect(created.tenantId).toBe(TEST_TENANT_ID);
    expect(created.isActive).toBe(true);
  });

  it('should find an item category by id', async () => {
    const input = makeCategoryInput();
    const [created] = await itemCategoryRepo.create(input);

    const found = await itemCategoryRepo.findById(created.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.code).toBe(input.code);
  });

  it('should return undefined for non-existent category id', async () => {
    const found = await itemCategoryRepo.findById('00000000-0000-0000-0000-000000000000');
    expect(found).toBeUndefined();
  });

  it('should find a category by tenant and code', async () => {
    const input = makeCategoryInput({ code: `CAT-UNIQUE-${Date.now()}` });
    const [created] = await itemCategoryRepo.create(input);

    const found = await itemCategoryRepo.findByCode(TEST_TENANT_ID, input.code);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
  });

  it('should return undefined for non-existent category code', async () => {
    const found = await itemCategoryRepo.findByCode(TEST_TENANT_ID, 'NO-SUCH-CODE');
    expect(found).toBeUndefined();
  });

  it('should find active categories by tenant', async () => {
    const prefix = `CAT-ACTIVE-${Date.now()}`;
    await itemCategoryRepo.create(makeCategoryInput({ name: `${prefix}-A`, isActive: true }));
    await itemCategoryRepo.create(makeCategoryInput({ name: `${prefix}-B`, isActive: false }));

    const active = await itemCategoryRepo.findActiveByTenant(TEST_TENANT_ID);
    const allActive = active.every((c) => c.isActive === true);
    expect(allActive).toBe(true);
  });

  it('should find categories by parent id', async () => {
    const prefix = `CAT-PARENT-${Date.now()}`;
    const [parent] = await itemCategoryRepo.create(
      makeCategoryInput({ name: `${prefix}-Parent` }),
    );
    await itemCategoryRepo.create(
      makeCategoryInput({ name: `${prefix}-Child1`, parentId: parent.id }),
    );
    await itemCategoryRepo.create(
      makeCategoryInput({ name: `${prefix}-Child2`, parentId: parent.id }),
    );

    const children = await itemCategoryRepo.findByParentId(parent.id);
    expect(children.length).toBeGreaterThanOrEqual(2);
    children.forEach((child) => {
      expect(child.parentId).toBe(parent.id);
    });
  });

  it('should count items by category', async () => {
    const prefix = `CAT-COUNT-${Date.now()}`;
    const [category] = await itemCategoryRepo.create(
      makeCategoryInput({ name: `${prefix}-Cat` }),
    );

    // Create a UOM for items
    const [uom] = await testDb
      .insert(unitOfMeasures)
      .values(makeUomInput({ code: `UOM-${prefix}` }))
      .returning();

    await itemRepo.create(makeItemInput(category.id, uom.id, { name: `${prefix}-Item1` }));
    await itemRepo.create(makeItemInput(category.id, uom.id, { name: `${prefix}-Item2` }));

    const count = await itemCategoryRepo.countItemsByCategory(category.id);
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it('should update an item category', async () => {
    const input = makeCategoryInput({ name: 'Original Name' });
    const [created] = await itemCategoryRepo.create(input);

    const updated = await itemCategoryRepo.update(created.id, {
      name: 'Updated Name',
      description: 'Updated description',
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].name).toBe('Updated Name');
    expect(updated[0].description).toBe('Updated description');
  });

  it('should soft delete an item category', async () => {
    const input = makeCategoryInput();
    const [created] = await itemCategoryRepo.create(input);

    const deleted = await itemCategoryRepo.softDelete(created.id);
    expect(deleted).toHaveLength(1);
    expect(deleted[0].deletedAt).toBeDefined();
  });

  it('should find many categories with pagination', async () => {
    const prefix = `CAT-PAGE-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      await itemCategoryRepo.create(
        makeCategoryInput({ name: `${prefix}-${i}`, code: `${prefix}-${i}` }),
      );
    }

    const page1 = await itemCategoryRepo.findMany({
      tenantId: TEST_TENANT_ID,
      limit: 2,
      offset: 0,
    });
    expect(page1.data.length).toBeLessThanOrEqual(2);
    expect(page1.limit).toBe(2);
    expect(page1.offset).toBe(0);

    const page2 = await itemCategoryRepo.findMany({
      tenantId: TEST_TENANT_ID,
      limit: 2,
      offset: 2,
    });
    expect(page2.offset).toBe(2);
    expect(page2.data.length).toBeLessThanOrEqual(2);
  });

  it('should filter categories by tenant', async () => {
    const prefix = `CAT-TENANT-${Date.now()}`;
    await itemCategoryRepo.create(
      makeCategoryInput({ name: `${prefix}-MINE`, code: `${prefix}-MINE` }),
    );

    const filtered = await itemCategoryRepo.findMany({ tenantId: TEST_TENANT_ID });
    const allMine = filtered.data.every((c) => c.tenantId === TEST_TENANT_ID);
    expect(allMine).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Items Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('itemRepo', () => {
  let uomId: string;
  let categoryId: string;

  beforeAll(async () => {
    await cleanupInvTestData();
    const [uom] = await testDb
      .insert(unitOfMeasures)
      .values(makeUomInput({ code: `UOM-ITEM-${Date.now()}` }))
      .returning();
    uomId = uom.id;
    const [cat] = await itemCategoryRepo.create(
      makeCategoryInput({ code: `CAT-ITEM-${Date.now()}` }),
    );
    categoryId = cat.id;
  });

  afterAll(async () => {
    await cleanupInvTestData();
  });

  it('should create an item and return it', async () => {
    const input = makeItemInput(categoryId, uomId);
    const [created] = await itemRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.sku).toBe(input.sku);
    expect(created.name).toBe('Test Item');
    expect(created.categoryId).toBe(categoryId);
    expect(created.unitOfMeasureId).toBe(uomId);
    expect(created.tenantId).toBe(TEST_TENANT_ID);
    expect(created.isActive).toBe(true);
  });

  it('should find an item by id', async () => {
    const input = makeItemInput(categoryId, uomId);
    const [created] = await itemRepo.create(input);

    const found = await itemRepo.findById(created.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.sku).toBe(input.sku);
  });

  it('should return undefined for non-existent item id', async () => {
    const found = await itemRepo.findById('00000000-0000-0000-0000-000000000000');
    expect(found).toBeUndefined();
  });

  it('should find an item by sku', async () => {
    const sku = `SKU-UNIQUE-${Date.now()}`;
    const input = makeItemInput(categoryId, uomId, { sku });
    const [created] = await itemRepo.create(input);

    const found = await itemRepo.findBySku(sku);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.sku).toBe(sku);
  });

  it('should return undefined for non-existent sku', async () => {
    const found = await itemRepo.findBySku('NO-SUCH-SKU');
    expect(found).toBeUndefined();
  });

  it('should find an item by barcode', async () => {
    const barcode = `BAR-${Date.now()}`;
    const input = makeItemInput(categoryId, uomId, { barcode });
    const [created] = await itemRepo.create(input);

    const found = await itemRepo.findByBarcode(barcode);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.barcode).toBe(barcode);
  });

  it('should return undefined for non-existent barcode', async () => {
    const found = await itemRepo.findByBarcode('NO-SUCH-BARCODE');
    expect(found).toBeUndefined();
  });

  it('should find active items by tenant', async () => {
    const prefix = `ITEM-ACTIVE-${Date.now()}`;
    await itemRepo.create(
      makeItemInput(categoryId, uomId, { name: `${prefix}-Active`, isActive: true }),
    );
    await itemRepo.create(
      makeItemInput(categoryId, uomId, { name: `${prefix}-Inactive`, isActive: false }),
    );

    const active = await itemRepo.findActiveByTenant(TEST_TENANT_ID);
    const allActive = active.every((i) => i.isActive === true);
    expect(allActive).toBe(true);
  });

  it('should update an item', async () => {
    const input = makeItemInput(categoryId, uomId, { name: 'Original Item' });
    const [created] = await itemRepo.create(input);

    const updated = await itemRepo.update(created.id, {
      name: 'Updated Item',
      description: 'Updated description',
      reorderPoint: 20,
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].name).toBe('Updated Item');
    expect(updated[0].description).toBe('Updated description');
    expect(updated[0].reorderPoint).toBe(20);
  });

  it('should soft delete an item', async () => {
    const input = makeItemInput(categoryId, uomId);
    const [created] = await itemRepo.create(input);

    const deleted = await itemRepo.softDelete(created.id);
    expect(deleted).toHaveLength(1);
    expect(deleted[0].deletedAt).toBeDefined();
  });

  it('should find many items with pagination', async () => {
    const prefix = `ITEM-PAGE-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      await itemRepo.create(
        makeItemInput(categoryId, uomId, { name: `${prefix}-${i}` }),
      );
    }

    const page1 = await itemRepo.findMany({
      tenantId: TEST_TENANT_ID,
      limit: 2,
      offset: 0,
    });
    expect(page1.data.length).toBeLessThanOrEqual(2);
    expect(page1.limit).toBe(2);
    expect(page1.offset).toBe(0);

    const page2 = await itemRepo.findMany({
      tenantId: TEST_TENANT_ID,
      limit: 2,
      offset: 2,
    });
    expect(page2.offset).toBe(2);
    expect(page2.data.length).toBeLessThanOrEqual(2);
  });

  it('should filter items by tenant', async () => {
    const prefix = `ITEM-TENANT-${Date.now()}`;
    await itemRepo.create(
      makeItemInput(categoryId, uomId, { name: `${prefix}-MINE` }),
    );

    const filtered = await itemRepo.findMany({ tenantId: TEST_TENANT_ID });
    const allMine = filtered.data.every((i) => i.tenantId === TEST_TENANT_ID);
    expect(allMine).toBe(true);
  });

  it('should return total count of items', async () => {
    const result = await itemRepo.findMany({ tenantId: TEST_TENANT_ID });
    expect(typeof result.total).toBe('number');
    expect(result.total).toBeGreaterThanOrEqual(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Warehouses Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('warehouseRepo', () => {
  beforeAll(async () => {
    await cleanupInvTestData();
  });

  afterAll(async () => {
    await cleanupInvTestData();
  });

  it('should create a warehouse and return it', async () => {
    const input = makeWarehouseInput();
    const [created] = await warehouseRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.name).toBe(input.name);
    expect(created.code).toBe(input.code);
    expect(created.tenantId).toBe(TEST_TENANT_ID);
    expect(created.isActive).toBe(true);
  });

  it('should find a warehouse by id', async () => {
    const input = makeWarehouseInput();
    const [created] = await warehouseRepo.create(input);

    const found = await warehouseRepo.findById(created.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.code).toBe(input.code);
  });

  it('should return undefined for non-existent warehouse id', async () => {
    const found = await warehouseRepo.findById('00000000-0000-0000-0000-000000000000');
    expect(found).toBeUndefined();
  });

  it('should find a warehouse by tenant and code', async () => {
    const input = makeWarehouseInput({ code: `WH-UNIQUE-${Date.now()}` });
    const [created] = await warehouseRepo.create(input);

    const found = await warehouseRepo.findByCode(TEST_TENANT_ID, input.code);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
  });

  it('should return undefined for non-existent warehouse code', async () => {
    const found = await warehouseRepo.findByCode(TEST_TENANT_ID, 'NO-SUCH-CODE');
    expect(found).toBeUndefined();
  });

  it('should find active warehouses by tenant', async () => {
    const prefix = `WH-ACTIVE-${Date.now()}`;
    await warehouseRepo.create(makeWarehouseInput({ name: `${prefix}-A`, isActive: true }));
    await warehouseRepo.create(makeWarehouseInput({ name: `${prefix}-B`, isActive: false }));

    const active = await warehouseRepo.findActiveByTenant(TEST_TENANT_ID);
    const allActive = active.every((w) => w.isActive === true);
    expect(allActive).toBe(true);
  });

  it('should update a warehouse', async () => {
    const input = makeWarehouseInput({ name: 'Original Warehouse' });
    const [created] = await warehouseRepo.create(input);

    const updated = await warehouseRepo.update(created.id, {
      name: 'Updated Warehouse',
      addressLine1: '123 Main St',
      city: 'Springfield',
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].name).toBe('Updated Warehouse');
    expect(updated[0].addressLine1).toBe('123 Main St');
    expect(updated[0].city).toBe('Springfield');
  });

  it('should soft delete a warehouse', async () => {
    const input = makeWarehouseInput();
    const [created] = await warehouseRepo.create(input);

    const deleted = await warehouseRepo.softDelete(created.id);
    expect(deleted).toHaveLength(1);
    expect(deleted[0].deletedAt).toBeDefined();
  });

  it('should find many warehouses with pagination', async () => {
    const prefix = `WH-PAGE-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      await warehouseRepo.create(
        makeWarehouseInput({ name: `${prefix}-${i}`, code: `${prefix}-${i}` }),
      );
    }

    const page1 = await warehouseRepo.findMany({
      tenantId: TEST_TENANT_ID,
      limit: 2,
      offset: 0,
    });
    expect(page1.data.length).toBeLessThanOrEqual(2);
    expect(page1.limit).toBe(2);
    expect(page1.offset).toBe(0);

    const page2 = await warehouseRepo.findMany({
      tenantId: TEST_TENANT_ID,
      limit: 2,
      offset: 2,
    });
    expect(page2.offset).toBe(2);
    expect(page2.data.length).toBeLessThanOrEqual(2);
  });

  it('should filter warehouses by tenant', async () => {
    const prefix = `WH-TENANT-${Date.now()}`;
    await warehouseRepo.create(
      makeWarehouseInput({ name: `${prefix}-MINE`, code: `${prefix}-MINE` }),
    );

    const filtered = await warehouseRepo.findMany({ tenantId: TEST_TENANT_ID });
    const allMine = filtered.data.every((w) => w.tenantId === TEST_TENANT_ID);
    expect(allMine).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Stock Levels Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('stockLevelRepo', () => {
  let uomId: string;
  let categoryId: string;
  let itemId: string;
  let warehouseId: string;

  beforeAll(async () => {
    await cleanupInvTestData();

    const [uom] = await testDb
      .insert(unitOfMeasures)
      .values(makeUomInput({ code: `UOM-STOCK-${Date.now()}` }))
      .returning();
    uomId = uom.id;

    const [cat] = await itemCategoryRepo.create(
      makeCategoryInput({ code: `CAT-STOCK-${Date.now()}` }),
    );
    categoryId = cat.id;

    const [item] = await itemRepo.create(
      makeItemInput(categoryId, uomId, { sku: `SKU-STOCK-${Date.now()}` }),
    );
    itemId = item.id;

    const [wh] = await warehouseRepo.create(
      makeWarehouseInput({ code: `WH-STOCK-${Date.now()}` }),
    );
    warehouseId = wh.id;
  });

  afterAll(async () => {
    await cleanupInvTestData();
  });

  it('should create a stock level via upsert and return it', async () => {
    const result = await stockLevelRepo.upsertByItemAndWarehouse(itemId, warehouseId, {
      quantityOnHand: 100,
      quantityAvailable: 100,
    });
    expect(result).toHaveLength(1);
    expect(result[0].itemId).toBe(itemId);
    expect(result[0].warehouseId).toBe(warehouseId);
    expect(result[0].quantityOnHand).toBe(100);
    expect(result[0].tenantId).toBe(TEST_TENANT_ID);
  });

  it('should find a stock level by id', async () => {
    const result = await stockLevelRepo.upsertByItemAndWarehouse(itemId, warehouseId, {
      quantityOnHand: 50,
    });
    const found = await stockLevelRepo.findById(result[0].id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(result[0].id);
    expect(found!.itemId).toBe(itemId);
  });

  it('should return undefined for non-existent stock level id', async () => {
    const found = await stockLevelRepo.findById('00000000-0000-0000-0000-000000000000');
    expect(found).toBeUndefined();
  });

  it('should find stock level by item and warehouse', async () => {
    const result = await stockLevelRepo.upsertByItemAndWarehouse(itemId, warehouseId, {
      quantityOnHand: 75,
    });

    const found = await stockLevelRepo.findByItemAndWarehouse(itemId, warehouseId);
    expect(found).toBeDefined();
    expect(found!.itemId).toBe(itemId);
    expect(found!.warehouseId).toBe(warehouseId);
  });

  it('should find stock levels by item', async () => {
    const result = await stockLevelRepo.findByItem(itemId);
    expect(result).toBeInstanceOf(Array);
    result.forEach((sl) => {
      expect(sl.itemId).toBe(itemId);
    });
  });

  it('should find stock levels by warehouse', async () => {
    const result = await stockLevelRepo.findByWarehouse(warehouseId);
    expect(result).toBeInstanceOf(Array);
    result.forEach((sl) => {
      expect(sl.warehouseId).toBe(warehouseId);
    });
  });

  it('should upsert (update) an existing stock level', async () => {
    const [initial] = await stockLevelRepo.upsertByItemAndWarehouse(itemId, warehouseId, {
      quantityOnHand: 200,
    });

    const [updated] = await stockLevelRepo.upsertByItemAndWarehouse(itemId, warehouseId, {
      quantityOnHand: 300,
    });

    expect(updated.id).toBe(initial.id);
    expect(updated.quantityOnHand).toBe(300);
  });

  it('should find many stock levels with pagination', async () => {
    const result = await stockLevelRepo.findMany({
      tenantId: TEST_TENANT_ID,
      limit: 10,
      offset: 0,
    });
    expect(result.data).toBeInstanceOf(Array);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
    expect(typeof result.total).toBe('number');
  });

  it('should filter stock levels by tenant', async () => {
    const result = await stockLevelRepo.findMany({ tenantId: TEST_TENANT_ID });
    const allMine = result.data.every((sl) => sl.tenantId === TEST_TENANT_ID);
    expect(allMine).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Stock Movements Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('stockMovementRepo', () => {
  let uomId: string;
  let categoryId: string;
  let itemId: string;
  let warehouseId: string;

  beforeAll(async () => {
    await cleanupInvTestData();

    const [uom] = await testDb
      .insert(unitOfMeasures)
      .values(makeUomInput({ code: `UOM-MOV-${Date.now()}` }))
      .returning();
    uomId = uom.id;

    const [cat] = await itemCategoryRepo.create(
      makeCategoryInput({ code: `CAT-MOV-${Date.now()}` }),
    );
    categoryId = cat.id;

    const [item] = await itemRepo.create(
      makeItemInput(categoryId, uomId, { sku: `SKU-MOV-${Date.now()}` }),
    );
    itemId = item.id;

    const [wh] = await warehouseRepo.create(
      makeWarehouseInput({ code: `WH-MOV-${Date.now()}` }),
    );
    warehouseId = wh.id;
  });

  afterAll(async () => {
    await cleanupInvTestData();
  });

  it('should create a stock movement and return it', async () => {
    const input = makeStockMovementInput(itemId, warehouseId);
    const [created] = await stockMovementRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.itemId).toBe(itemId);
    expect(created.warehouseId).toBe(warehouseId);
    expect(created.movementType).toBe('inbound');
    expect(created.quantity).toBe(10);
    expect(created.tenantId).toBe(TEST_TENANT_ID);
  });

  it('should find a stock movement by id', async () => {
    const input = makeStockMovementInput(itemId, warehouseId);
    const [created] = await stockMovementRepo.create(input);

    const found = await stockMovementRepo.findById(created.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.itemId).toBe(itemId);
  });

  it('should return undefined for non-existent stock movement id', async () => {
    const found = await stockMovementRepo.findById('00000000-0000-0000-0000-000000000000');
    expect(found).toBeUndefined();
  });

  it('should find stock movements by item', async () => {
    const prefix = `MOV-BYITEM-${Date.now()}`;
    await stockMovementRepo.create(
      makeStockMovementInput(itemId, warehouseId, {
        sourceDocumentType: 'po',
        sourceDocumentId: `00000000-0000-0000-0000-000000000101`,
        quantity: 5,
      }),
    );
    await stockMovementRepo.create(
      makeStockMovementInput(itemId, warehouseId, {
        sourceDocumentType: 'po',
        sourceDocumentId: `00000000-0000-0000-0000-000000000102`,
        quantity: 15,
      }),
    );

    const found = await stockMovementRepo.findByItem(itemId);
    expect(found.length).toBeGreaterThanOrEqual(2);
    found.forEach((m) => {
      expect(m.itemId).toBe(itemId);
    });
  });

  it('should find stock movements by warehouse', async () => {
    await stockMovementRepo.create(
      makeStockMovementInput(itemId, warehouseId, {
        sourceDocumentType: 'po',
        sourceDocumentId: `00000000-0000-0000-0000-000000000201`,
        quantity: 25,
      }),
    );

    const found = await stockMovementRepo.findByWarehouse(warehouseId);
    expect(found.length).toBeGreaterThanOrEqual(1);
    found.forEach((m) => {
      expect(m.warehouseId).toBe(warehouseId);
    });
  });

  it('should find stock movements by source document', async () => {
    const docType = `purchase_order`;
    const docId = `00000000-0000-0000-0000-000000000301`;
    await stockMovementRepo.create(
      makeStockMovementInput(itemId, warehouseId, {
        sourceDocumentType: docType,
        sourceDocumentId: docId,
        quantity: 30,
      }),
    );

    const found = await stockMovementRepo.findBySourceDocument(docType, docId);
    expect(found.length).toBeGreaterThanOrEqual(1);
    found.forEach((m) => {
      expect(m.sourceDocumentType).toBe(docType);
      expect(m.sourceDocumentId).toBe(docId);
    });
  });

  it('should return empty array for non-existent source document', async () => {
    const found = await stockMovementRepo.findBySourceDocument(
      'nonexistent_type',
      '00000000-0000-0000-0000-000000000999',
    );
    expect(found).toHaveLength(0);
  });

  it('should find many stock movements with pagination', async () => {
    const result = await stockMovementRepo.findMany({
      tenantId: TEST_TENANT_ID,
      limit: 5,
      offset: 0,
    });
    expect(result.data).toBeInstanceOf(Array);
    expect(result.limit).toBe(5);
    expect(result.offset).toBe(0);
    expect(typeof result.total).toBe('number');
  });

  it('should filter stock movements by tenant', async () => {
    const result = await stockMovementRepo.findMany({ tenantId: TEST_TENANT_ID });
    const allMine = result.data.every((m) => m.tenantId === TEST_TENANT_ID);
    expect(allMine).toBe(true);
  });

  it('should create stock movement with outbound type', async () => {
    const input = makeStockMovementInput(itemId, warehouseId, {
      movementType: 'outbound' as const,
      quantity: -5,
      sourceDocumentType: 'sales_order',
      sourceDocumentId: `00000000-0000-0000-0000-000000000401`,
    });
    const [created] = await stockMovementRepo.create(input);

    expect(created.movementType).toBe('outbound');
    expect(created.quantity).toBe(-5);
  });

  it('should create stock movement with adjustment type', async () => {
    const input = makeStockMovementInput(itemId, warehouseId, {
      movementType: 'adjustment' as const,
      quantity: -3,
      reason: 'Damaged goods',
      sourceDocumentType: 'adjustment',
      sourceDocumentId: `00000000-0000-0000-0000-000000000501`,
    });
    const [created] = await stockMovementRepo.create(input);

    expect(created.movementType).toBe('adjustment');
    expect(created.reason).toBe('Damaged goods');
  });

  it('should create stock movement with transfer type', async () => {
    const input = makeStockMovementInput(itemId, warehouseId, {
      movementType: 'transfer' as const,
      quantity: 20,
      sourceDocumentType: 'stock_transfer',
      sourceDocumentId: `00000000-0000-0000-0000-000000000601`,
    });
    const [created] = await stockMovementRepo.create(input);

    expect(created.movementType).toBe('transfer');
    expect(created.quantity).toBe(20);
  });
});
