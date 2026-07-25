import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TEST_TENANT_ID, TEST_USER_ID } from '../../lib/test-utils';
import {
  createItemCategoryFixture,
  createItemCategoryInputFixture,
  createItemFixture,
  createItemInputFixture,
  createStockLevelFixture,
  createStockMovementFixture,
  createStockMovementInputFixture,
  createUnitOfMeasureFixture,
  createWarehouseFixture,
  createWarehouseInputFixture,
} from './fixtures/inv.fixture';

// ─── Mock encore.dev/api (required to avoid runtime env error) ────────────

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string;
    status: number;
    details?: Record<string, string[]>;
    constructor(
      code: string,
      message: string,
      opts?: { status?: number; details?: Record<string, string[]> },
    ) {
      super(message);
      this.name = 'APIError';
      this.code = code;
      this.status = opts?.status ?? 500;
      this.details = opts?.details;
    }
  },
  api: vi.fn(),
}));

// ─── Mock Database Module ─────────────────────────────────────────────────

const mockTx = {
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{}]),
    }),
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  }),
  delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  select: vi.fn().mockResolvedValue([{ count: 0 }]),
  query: {},
};

vi.mock('@lumora/database', () => ({
  db: {
    query: {},
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn().mockResolvedValue([{ count: 0 }]),
    transaction: vi.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
  },
}));

// ─── Mock Schema (used directly in service transactions) ──────────────────

const { createMockTable } = vi.hoisted(() => ({
  createMockTable: (name: string) => {
    const table = { _: { name, schema: undefined } } as Record<string, unknown>;
    return new Proxy(table, {
      get: (_target, prop) => {
        if (typeof prop === 'symbol') return undefined;
        return {
          _: { name: String(prop), schema: undefined },
          toString: () => `${name}.${String(prop)}`,
        };
      },
    });
  },
}));

vi.mock('@lumora/database/schema', () => ({
  items: createMockTable('items'),
  warehouses: createMockTable('warehouses'),
  itemCategories: createMockTable('item_categories'),
  unitOfMeasures: createMockTable('unit_of_measures'),
  stockLevels: createMockTable('stock_levels'),
  stockMovements: createMockTable('stock_movements'),
}));

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: vi.fn(() => true),
    and: vi.fn(() => true),
    isNull: vi.fn(() => true),
    asc: vi.fn(() => ({})),
    desc: vi.fn(() => ({})),
    count: vi.fn(() => 0),
    sum: vi.fn(() => '0'),
  };
});

// ─── Mock Repo Module ─────────────────────────────────────────────────────

const {
  mockItemRepo,
  mockWarehouseRepo,
  mockItemCategoryRepo,
  mockUnitOfMeasureRepo,
  mockStockLevelRepo,
  mockStockMovementRepo,
} = vi.hoisted(() => ({
  mockItemRepo: {
    findById: vi.fn(),
    findBySku: vi.fn(),
    findByBarcode: vi.fn(),
    findActiveByTenant: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
  mockWarehouseRepo: {
    findById: vi.fn(),
    findByCode: vi.fn(),
    findActiveByTenant: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
  mockItemCategoryRepo: {
    findById: vi.fn(),
    findByCode: vi.fn(),
    findActiveByTenant: vi.fn(),
    findByParentId: vi.fn(),
    countItemsByCategory: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
  mockUnitOfMeasureRepo: {
    findById: vi.fn(),
    findByCode: vi.fn(),
    findMany: vi.fn(),
  },
  mockStockLevelRepo: {
    findById: vi.fn(),
    findByItemAndWarehouse: vi.fn(),
    findByItem: vi.fn(),
    findByWarehouse: vi.fn(),
    findMany: vi.fn(),
    upsertByItemAndWarehouse: vi.fn(),
  },
  mockStockMovementRepo: {
    findById: vi.fn(),
    findByItem: vi.fn(),
    findByWarehouse: vi.fn(),
    findBySourceDocument: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('./repo', () => ({
  itemRepo: mockItemRepo,
  warehouseRepo: mockWarehouseRepo,
  itemCategoryRepo: mockItemCategoryRepo,
  unitOfMeasureRepo: mockUnitOfMeasureRepo,
  stockLevelRepo: mockStockLevelRepo,
  stockMovementRepo: mockStockMovementRepo,
}));

// ─── Import Service After Mocking ─────────────────────────────────────────

import {
  DuplicateItemCategoryCodeError,
  DuplicateItemSkuError,
  DuplicateWarehouseCodeError,
  InsufficientStockError,
  InvalidMovementWarehouseError,
  ItemCategoryHasChildrenError,
  ItemCategoryHasItemsError,
  ItemCategoryNotFoundError,
  ItemNotFoundError,
  MissingSourceDocumentError,
  ReferenceWarehouseRequiredError,
  StockLevelNotFoundError,
  StockMovementNotFoundError,
  UnitOfMeasureNotFoundError,
  WarehouseNotFoundError,
} from './errors';
import * as service from './service';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Inventory Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ITEM SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Item Service', () => {
    describe('getItem', () => {
      it('should return item by id', async () => {
        const item = createItemFixture();
        mockItemRepo.findById.mockResolvedValue(item);

        const result = await service.getItem(item.id);

        expect(result).toEqual(item);
        expect(mockItemRepo.findById).toHaveBeenCalledWith(item.id);
      });

      it('should throw ItemNotFoundError for non-existent item', async () => {
        mockItemRepo.findById.mockResolvedValue(undefined);

        await expect(service.getItem('non-existent')).rejects.toThrow(ItemNotFoundError);
      });
    });

    describe('listItems', () => {
      it('should return paginated items', async () => {
        const items = [createItemFixture()];
        mockItemRepo.findMany.mockResolvedValue({ data: items, total: 1 });

        const result = await service.listItems(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.totalPages).toBe(1);
      });

      it('should return empty list when no items exist', async () => {
        mockItemRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listItems(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
        expect(result.totalPages).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockItemRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listItems(TEST_TENANT_ID, { page: 3, limit: 10 });

        expect(mockItemRepo.findMany).toHaveBeenCalledWith({
          tenantId: TEST_TENANT_ID,
          limit: 10,
          offset: 20,
        });
      });

      it('should calculate totalPages correctly', async () => {
        mockItemRepo.findMany.mockResolvedValue({ data: [], total: 45 });

        const result = await service.listItems(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.totalPages).toBe(3);
      });

      it('should pass tenantId to repo', async () => {
        mockItemRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listItems(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockItemRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID }),
        );
      });
    });

    describe('createItem', () => {
      it('should create item with valid inputs', async () => {
        const input = createItemInputFixture();
        const expected = createItemFixture();
        const category = createItemCategoryFixture();
        const uom = createUnitOfMeasureFixture();

        mockItemCategoryRepo.findById.mockResolvedValue(category);
        mockUnitOfMeasureRepo.findById.mockResolvedValue(uom);
        mockItemRepo.findBySku.mockResolvedValue(undefined);
        mockItemRepo.create.mockResolvedValue([expected]);

        const result = await service.createItem(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(result).toEqual(expected);
        expect(mockItemCategoryRepo.findById).toHaveBeenCalledWith(input.categoryId);
        expect(mockUnitOfMeasureRepo.findById).toHaveBeenCalledWith(input.unitOfMeasureId);
        expect(mockItemRepo.findBySku).toHaveBeenCalledWith(input.sku);
        expect(mockItemRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            ...input,
            tenantId: TEST_TENANT_ID,
            createdBy: TEST_USER_ID,
          }),
        );
      });

      it('should throw ItemCategoryNotFoundError for invalid category', async () => {
        const input = createItemInputFixture();
        mockItemCategoryRepo.findById.mockResolvedValue(undefined);

        await expect(service.createItem(TEST_TENANT_ID, TEST_USER_ID, input)).rejects.toThrow(
          ItemCategoryNotFoundError,
        );
      });

      it('should throw UnitOfMeasureNotFoundError for invalid UOM', async () => {
        const input = createItemInputFixture();
        mockItemCategoryRepo.findById.mockResolvedValue(createItemCategoryFixture());
        mockUnitOfMeasureRepo.findById.mockResolvedValue(undefined);

        await expect(service.createItem(TEST_TENANT_ID, TEST_USER_ID, input)).rejects.toThrow(
          UnitOfMeasureNotFoundError,
        );
      });

      it('should reject duplicate SKU', async () => {
        const input = createItemInputFixture();
        const existing = createItemFixture();

        mockItemCategoryRepo.findById.mockResolvedValue(createItemCategoryFixture());
        mockUnitOfMeasureRepo.findById.mockResolvedValue(createUnitOfMeasureFixture());
        mockItemRepo.findBySku.mockResolvedValue(existing);

        await expect(service.createItem(TEST_TENANT_ID, TEST_USER_ID, input)).rejects.toThrow(
          DuplicateItemSkuError,
        );
      });

      it('should reject duplicate barcode if provided', async () => {
        const input = createItemInputFixture({ barcode: 'BC-100' });
        const existing = createItemFixture({ barcode: 'BC-100' });

        mockItemCategoryRepo.findById.mockResolvedValue(createItemCategoryFixture());
        mockUnitOfMeasureRepo.findById.mockResolvedValue(createUnitOfMeasureFixture());
        mockItemRepo.findBySku.mockResolvedValue(undefined);
        mockItemRepo.findByBarcode.mockResolvedValue(existing);

        await expect(service.createItem(TEST_TENANT_ID, TEST_USER_ID, input)).rejects.toThrow(
          DuplicateItemSkuError,
        );
        expect(mockItemRepo.findByBarcode).toHaveBeenCalledWith('BC-100');
      });

      it('should skip barcode check if not provided', async () => {
        const input = createItemInputFixture({ barcode: undefined });

        mockItemCategoryRepo.findById.mockResolvedValue(createItemCategoryFixture());
        mockUnitOfMeasureRepo.findById.mockResolvedValue(createUnitOfMeasureFixture());
        mockItemRepo.findBySku.mockResolvedValue(undefined);
        mockItemRepo.create.mockResolvedValue([createItemFixture()]);

        await service.createItem(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(mockItemRepo.findByBarcode).not.toHaveBeenCalled();
      });
    });

    describe('updateItem', () => {
      it('should update item fields', async () => {
        const existing = createItemFixture();
        const updated = { ...existing, name: 'Updated Widget' };

        mockItemRepo.findById.mockResolvedValue(existing);
        mockItemRepo.update.mockResolvedValue([updated]);

        const result = await service.updateItem(existing.id, { name: 'Updated Widget' });

        expect(result.name).toBe('Updated Widget');
        expect(mockItemRepo.update).toHaveBeenCalledWith(existing.id, { name: 'Updated Widget' });
      });

      it('should throw ItemNotFoundError for non-existent item', async () => {
        mockItemRepo.findById.mockResolvedValue(undefined);

        await expect(service.updateItem('non-existent', { name: 'Test' })).rejects.toThrow(
          ItemNotFoundError,
        );
      });

      it('should validate new category exists when changing category', async () => {
        const existing = createItemFixture();
        const newCategory = createItemCategoryFixture({ id: 'cat-new' });

        mockItemRepo.findById.mockResolvedValue(existing);
        mockItemCategoryRepo.findById.mockResolvedValue(newCategory);
        mockItemRepo.update.mockResolvedValue([{ ...existing, categoryId: 'cat-new' }]);

        const result = await service.updateItem(existing.id, { categoryId: 'cat-new' });

        expect(mockItemCategoryRepo.findById).toHaveBeenCalledWith('cat-new');
        expect(result).toBeDefined();
      });

      it('should throw ItemCategoryNotFoundError for invalid new category', async () => {
        const existing = createItemFixture();

        mockItemRepo.findById.mockResolvedValue(existing);
        mockItemCategoryRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateItem(existing.id, { categoryId: 'cat-invalid' }),
        ).rejects.toThrow(ItemCategoryNotFoundError);
      });

      it('should validate new UOM exists when changing UOM', async () => {
        const existing = createItemFixture();
        const newUom = createUnitOfMeasureFixture({ id: 'uom-new' });

        mockItemRepo.findById.mockResolvedValue(existing);
        mockUnitOfMeasureRepo.findById.mockResolvedValue(newUom);
        mockItemRepo.update.mockResolvedValue([{ ...existing, unitOfMeasureId: 'uom-new' }]);

        const result = await service.updateItem(existing.id, { unitOfMeasureId: 'uom-new' });

        expect(mockUnitOfMeasureRepo.findById).toHaveBeenCalledWith('uom-new');
        expect(result).toBeDefined();
      });

      it('should throw UnitOfMeasureNotFoundError for invalid new UOM', async () => {
        const existing = createItemFixture();

        mockItemRepo.findById.mockResolvedValue(existing);
        mockUnitOfMeasureRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateItem(existing.id, { unitOfMeasureId: 'uom-invalid' }),
        ).rejects.toThrow(UnitOfMeasureNotFoundError);
      });

      it('should reject duplicate barcode on update', async () => {
        const existing = createItemFixture({ barcode: null });
        const duplicate = createItemFixture({ id: 'other', barcode: 'BC-new' });

        mockItemRepo.findById.mockResolvedValue(existing);
        mockItemRepo.findByBarcode.mockResolvedValue(duplicate);

        await expect(service.updateItem(existing.id, { barcode: 'BC-new' })).rejects.toThrow(
          DuplicateItemSkuError,
        );
      });

      it('should allow updating barcode to same value', async () => {
        const existing = createItemFixture({ barcode: 'BC-same' });
        const updated = { ...existing, barcode: 'BC-same' };

        mockItemRepo.findById.mockResolvedValue(existing);
        mockItemRepo.update.mockResolvedValue([updated]);

        const result = await service.updateItem(existing.id, { barcode: 'BC-same' });

        expect(result.barcode).toBe('BC-same');
        expect(mockItemRepo.findByBarcode).not.toHaveBeenCalled();
      });

      it('should skip category check if not provided', async () => {
        const existing = createItemFixture();

        mockItemRepo.findById.mockResolvedValue(existing);
        mockItemRepo.update.mockResolvedValue([{ ...existing, name: 'New Name' }]);

        await service.updateItem(existing.id, { name: 'New Name' });

        expect(mockItemCategoryRepo.findById).not.toHaveBeenCalled();
      });

      it('should skip UOM check if not provided', async () => {
        const existing = createItemFixture();

        mockItemRepo.findById.mockResolvedValue(existing);
        mockItemRepo.update.mockResolvedValue([{ ...existing, name: 'New Name' }]);

        await service.updateItem(existing.id, { name: 'New Name' });

        expect(mockUnitOfMeasureRepo.findById).not.toHaveBeenCalled();
      });
    });

    describe('deleteItem', () => {
      it('should soft delete item', async () => {
        const existing = createItemFixture();

        mockItemRepo.findById.mockResolvedValue(existing);
        mockItemRepo.softDelete.mockResolvedValue([existing]);

        await service.deleteItem(existing.id);

        expect(mockItemRepo.softDelete).toHaveBeenCalledWith(existing.id);
      });

      it('should throw ItemNotFoundError for non-existent item', async () => {
        mockItemRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteItem('non-existent')).rejects.toThrow(ItemNotFoundError);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // WAREHOUSE SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Warehouse Service', () => {
    describe('getWarehouse', () => {
      it('should return warehouse by id', async () => {
        const warehouse = createWarehouseFixture();
        mockWarehouseRepo.findById.mockResolvedValue(warehouse);

        const result = await service.getWarehouse(warehouse.id);

        expect(result).toEqual(warehouse);
        expect(mockWarehouseRepo.findById).toHaveBeenCalledWith(warehouse.id);
      });

      it('should throw WarehouseNotFoundError for non-existent warehouse', async () => {
        mockWarehouseRepo.findById.mockResolvedValue(undefined);

        await expect(service.getWarehouse('non-existent')).rejects.toThrow(WarehouseNotFoundError);
      });
    });

    describe('listWarehouses', () => {
      it('should return paginated warehouses', async () => {
        const warehouses = [createWarehouseFixture()];
        mockWarehouseRepo.findMany.mockResolvedValue({ data: warehouses, total: 1 });

        const result = await service.listWarehouses(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.totalPages).toBe(1);
      });

      it('should return empty list when no warehouses exist', async () => {
        mockWarehouseRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listWarehouses(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockWarehouseRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listWarehouses(TEST_TENANT_ID, { page: 2, limit: 10 });

        expect(mockWarehouseRepo.findMany).toHaveBeenCalledWith({
          tenantId: TEST_TENANT_ID,
          limit: 10,
          offset: 10,
        });
      });

      it('should pass tenantId to repo', async () => {
        mockWarehouseRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listWarehouses(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockWarehouseRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID }),
        );
      });
    });

    describe('createWarehouse', () => {
      it('should create warehouse with unique code', async () => {
        const input = createWarehouseInputFixture();
        const expected = createWarehouseFixture();

        mockWarehouseRepo.findByCode.mockResolvedValue(undefined);
        mockWarehouseRepo.create.mockResolvedValue([expected]);

        const result = await service.createWarehouse(TEST_TENANT_ID, input);

        expect(result).toEqual(expected);
        expect(mockWarehouseRepo.findByCode).toHaveBeenCalledWith(TEST_TENANT_ID, input.code);
        expect(mockWarehouseRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ ...input, tenantId: TEST_TENANT_ID }),
        );
      });

      it('should reject duplicate warehouse code within tenant', async () => {
        const input = createWarehouseInputFixture();
        const existing = createWarehouseFixture();

        mockWarehouseRepo.findByCode.mockResolvedValue(existing);

        await expect(service.createWarehouse(TEST_TENANT_ID, input)).rejects.toThrow(
          DuplicateWarehouseCodeError,
        );
      });

      it('should scope code uniqueness to tenant', async () => {
        const input = createWarehouseInputFixture({ code: 'WH-NEW' });

        // Same code exists in OTHER tenant, not this one
        mockWarehouseRepo.findByCode.mockImplementation(
          async (_tenantId: string, _code: string) => {
            return undefined;
          },
        );
        mockWarehouseRepo.create.mockResolvedValue([createWarehouseFixture({ code: 'WH-NEW' })]);

        const result = await service.createWarehouse(TEST_TENANT_ID, input);
        expect(result).toBeDefined();
        expect(mockWarehouseRepo.findByCode).toHaveBeenCalledWith(TEST_TENANT_ID, 'WH-NEW');
      });
    });

    describe('updateWarehouse', () => {
      it('should update warehouse fields', async () => {
        const existing = createWarehouseFixture();
        const updated = { ...existing, name: 'Updated Warehouse' };

        mockWarehouseRepo.findById.mockResolvedValue(existing);
        mockWarehouseRepo.update.mockResolvedValue([updated]);

        const result = await service.updateWarehouse(existing.id, { name: 'Updated Warehouse' });

        expect(result.name).toBe('Updated Warehouse');
        expect(mockWarehouseRepo.update).toHaveBeenCalledWith(existing.id, {
          name: 'Updated Warehouse',
        });
      });

      it('should throw WarehouseNotFoundError for non-existent warehouse', async () => {
        mockWarehouseRepo.findById.mockResolvedValue(undefined);

        await expect(service.updateWarehouse('non-existent', { name: 'Test' })).rejects.toThrow(
          WarehouseNotFoundError,
        );
      });
    });

    describe('deleteWarehouse', () => {
      it('should soft delete warehouse', async () => {
        const existing = createWarehouseFixture();

        mockWarehouseRepo.findById.mockResolvedValue(existing);
        mockWarehouseRepo.softDelete.mockResolvedValue([existing]);

        await service.deleteWarehouse(existing.id);

        expect(mockWarehouseRepo.softDelete).toHaveBeenCalledWith(existing.id);
      });

      it('should throw WarehouseNotFoundError for non-existent warehouse', async () => {
        mockWarehouseRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteWarehouse('non-existent')).rejects.toThrow(
          WarehouseNotFoundError,
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ITEM CATEGORY SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Item Category Service', () => {
    describe('getItemCategory', () => {
      it('should return category by id', async () => {
        const category = createItemCategoryFixture();
        mockItemCategoryRepo.findById.mockResolvedValue(category);

        const result = await service.getItemCategory(category.id);

        expect(result).toEqual(category);
        expect(mockItemCategoryRepo.findById).toHaveBeenCalledWith(category.id);
      });

      it('should throw ItemCategoryNotFoundError for non-existent category', async () => {
        mockItemCategoryRepo.findById.mockResolvedValue(undefined);

        await expect(service.getItemCategory('non-existent')).rejects.toThrow(
          ItemCategoryNotFoundError,
        );
      });
    });

    describe('listItemCategories', () => {
      it('should return paginated categories', async () => {
        const categories = [createItemCategoryFixture()];
        mockItemCategoryRepo.findMany.mockResolvedValue({ data: categories, total: 1 });

        const result = await service.listItemCategories(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.totalPages).toBe(1);
      });

      it('should return empty list when no categories exist', async () => {
        mockItemCategoryRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listItemCategories(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockItemCategoryRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listItemCategories(TEST_TENANT_ID, { page: 4, limit: 5 });

        expect(mockItemCategoryRepo.findMany).toHaveBeenCalledWith({
          tenantId: TEST_TENANT_ID,
          limit: 5,
          offset: 15,
        });
      });
    });

    describe('createItemCategory', () => {
      it('should create category with unique code', async () => {
        const input = createItemCategoryInputFixture();
        const expected = createItemCategoryFixture();

        mockItemCategoryRepo.findByCode.mockResolvedValue(undefined);
        mockItemCategoryRepo.create.mockResolvedValue([expected]);

        const result = await service.createItemCategory(TEST_TENANT_ID, input);

        expect(result).toEqual(expected);
        expect(mockItemCategoryRepo.findByCode).toHaveBeenCalledWith(TEST_TENANT_ID, input.code);
        expect(mockItemCategoryRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ ...input, tenantId: TEST_TENANT_ID }),
        );
      });

      it('should reject duplicate category code within tenant', async () => {
        const input = createItemCategoryInputFixture();
        const existing = createItemCategoryFixture();

        mockItemCategoryRepo.findByCode.mockResolvedValue(existing);

        await expect(service.createItemCategory(TEST_TENANT_ID, input)).rejects.toThrow(
          DuplicateItemCategoryCodeError,
        );
      });

      it('should validate parent category exists if provided', async () => {
        const parent = createItemCategoryFixture({ id: 'cat-parent' });
        const input = createItemCategoryInputFixture({ parentId: 'cat-parent' });

        mockItemCategoryRepo.findByCode.mockResolvedValue(undefined);
        mockItemCategoryRepo.findById.mockResolvedValue(parent);
        mockItemCategoryRepo.create.mockResolvedValue([
          createItemCategoryFixture({ parentId: 'cat-parent' }),
        ]);

        const result = await service.createItemCategory(TEST_TENANT_ID, input);

        expect(result).toBeDefined();
        expect(mockItemCategoryRepo.findById).toHaveBeenCalledWith('cat-parent');
      });

      it('should throw ItemCategoryNotFoundError for invalid parent', async () => {
        const input = createItemCategoryInputFixture({ parentId: 'cat-invalid' });

        mockItemCategoryRepo.findByCode.mockResolvedValue(undefined);
        mockItemCategoryRepo.findById.mockResolvedValue(undefined);

        await expect(service.createItemCategory(TEST_TENANT_ID, input)).rejects.toThrow(
          ItemCategoryNotFoundError,
        );
      });

      it('should skip parent validation if parentId not provided', async () => {
        const input = createItemCategoryInputFixture({ parentId: undefined });

        mockItemCategoryRepo.findByCode.mockResolvedValue(undefined);
        mockItemCategoryRepo.create.mockResolvedValue([createItemCategoryFixture()]);

        await service.createItemCategory(TEST_TENANT_ID, input);

        expect(mockItemCategoryRepo.findById).not.toHaveBeenCalled();
      });

      it('should scope code uniqueness to tenant', async () => {
        const input = createItemCategoryInputFixture({ code: 'UNIQUE' });

        mockItemCategoryRepo.findByCode.mockImplementation(async (_tenantId: string) => {
          return undefined;
        });
        mockItemCategoryRepo.create.mockResolvedValue([
          createItemCategoryFixture({ code: 'UNIQUE' }),
        ]);

        const result = await service.createItemCategory(TEST_TENANT_ID, input);
        expect(result).toBeDefined();
        expect(mockItemCategoryRepo.findByCode).toHaveBeenCalledWith(TEST_TENANT_ID, 'UNIQUE');
      });
    });

    describe('updateItemCategory', () => {
      it('should update category fields', async () => {
        const existing = createItemCategoryFixture();
        const updated = { ...existing, name: 'Updated Category' };

        mockItemCategoryRepo.findById.mockResolvedValue(existing);
        mockItemCategoryRepo.update.mockResolvedValue([updated]);

        const result = await service.updateItemCategory(existing.id, { name: 'Updated Category' });

        expect(result.name).toBe('Updated Category');
        expect(mockItemCategoryRepo.update).toHaveBeenCalledWith(existing.id, {
          name: 'Updated Category',
        });
      });

      it('should throw ItemCategoryNotFoundError for non-existent category', async () => {
        mockItemCategoryRepo.findById.mockResolvedValue(undefined);

        await expect(service.updateItemCategory('non-existent', { name: 'Test' })).rejects.toThrow(
          ItemCategoryNotFoundError,
        );
      });

      it('should prevent circular parent reference', async () => {
        const existing = createItemCategoryFixture({ id: 'cat-self' });

        mockItemCategoryRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateItemCategory('cat-self', { parentId: 'cat-self' }),
        ).rejects.toThrow(ItemCategoryNotFoundError);
      });

      it('should allow setting parentId to null', async () => {
        const existing = createItemCategoryFixture({ parentId: 'cat-parent' });
        const updated = { ...existing, parentId: null };

        mockItemCategoryRepo.findById.mockResolvedValue(existing);
        mockItemCategoryRepo.update.mockResolvedValue([updated]);

        const result = await service.updateItemCategory(existing.id, { parentId: null });

        expect(result.parentId).toBeNull();
      });
    });

    describe('deleteItemCategory', () => {
      it('should soft delete category with no children or items', async () => {
        const existing = createItemCategoryFixture();

        mockItemCategoryRepo.findById.mockResolvedValue(existing);
        mockItemCategoryRepo.findByParentId.mockResolvedValue([]);
        mockItemCategoryRepo.countItemsByCategory.mockResolvedValue(0);
        mockItemCategoryRepo.softDelete.mockResolvedValue([existing]);

        await service.deleteItemCategory(existing.id);

        expect(mockItemCategoryRepo.softDelete).toHaveBeenCalledWith(existing.id);
      });

      it('should throw ItemCategoryNotFoundError for non-existent category', async () => {
        mockItemCategoryRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteItemCategory('non-existent')).rejects.toThrow(
          ItemCategoryNotFoundError,
        );
      });

      it('should reject deletion of category with children', async () => {
        const existing = createItemCategoryFixture();
        const child = createItemCategoryFixture({ id: 'cat-child', parentId: existing.id });

        mockItemCategoryRepo.findById.mockResolvedValue(existing);
        mockItemCategoryRepo.findByParentId.mockResolvedValue([child]);

        await expect(service.deleteItemCategory(existing.id)).rejects.toThrow(
          ItemCategoryHasChildrenError,
        );
        // Should NOT check items if children exist
        expect(mockItemCategoryRepo.countItemsByCategory).not.toHaveBeenCalled();
      });

      it('should reject deletion of category with items', async () => {
        const existing = createItemCategoryFixture();

        mockItemCategoryRepo.findById.mockResolvedValue(existing);
        mockItemCategoryRepo.findByParentId.mockResolvedValue([]);
        mockItemCategoryRepo.countItemsByCategory.mockResolvedValue(5);

        await expect(service.deleteItemCategory(existing.id)).rejects.toThrow(
          ItemCategoryHasItemsError,
        );
      });

      it('should check children before items', async () => {
        const existing = createItemCategoryFixture();
        const child = createItemCategoryFixture({ id: 'cat-child', parentId: existing.id });

        mockItemCategoryRepo.findById.mockResolvedValue(existing);
        mockItemCategoryRepo.findByParentId.mockResolvedValue([child]);
        mockItemCategoryRepo.countItemsByCategory.mockResolvedValue(5);

        await expect(service.deleteItemCategory(existing.id)).rejects.toThrow(
          ItemCategoryHasChildrenError,
        );
        expect(mockItemCategoryRepo.countItemsByCategory).not.toHaveBeenCalled();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT OF MEASURE SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Unit of Measure Service', () => {
    describe('getUnitOfMeasure', () => {
      it('should return UOM by id', async () => {
        const uom = createUnitOfMeasureFixture();
        mockUnitOfMeasureRepo.findById.mockResolvedValue(uom);

        const result = await service.getUnitOfMeasure(uom.id);

        expect(result).toEqual(uom);
        expect(mockUnitOfMeasureRepo.findById).toHaveBeenCalledWith(uom.id);
      });

      it('should throw UnitOfMeasureNotFoundError for non-existent UOM', async () => {
        mockUnitOfMeasureRepo.findById.mockResolvedValue(undefined);

        await expect(service.getUnitOfMeasure('non-existent')).rejects.toThrow(
          UnitOfMeasureNotFoundError,
        );
      });
    });

    describe('listUnitOfMeasures', () => {
      it('should return paginated UOMs', async () => {
        const uoms = [createUnitOfMeasureFixture()];
        mockUnitOfMeasureRepo.findMany.mockResolvedValue({ data: uoms, total: 1 });

        const result = await service.listUnitOfMeasures({ page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.totalPages).toBe(1);
      });

      it('should return empty list when no UOMs exist', async () => {
        mockUnitOfMeasureRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listUnitOfMeasures({ page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockUnitOfMeasureRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listUnitOfMeasures({ page: 3, limit: 10 });

        expect(mockUnitOfMeasureRepo.findMany).toHaveBeenCalledWith({
          limit: 10,
          offset: 20,
        });
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // STOCK LEVEL SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Stock Level Service', () => {
    describe('getStockLevel', () => {
      it('should return stock level by item and warehouse', async () => {
        const level = createStockLevelFixture();
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValue(level);

        const result = await service.getStockLevel(level.itemId, level.warehouseId);

        expect(result).toEqual(level);
        expect(mockStockLevelRepo.findByItemAndWarehouse).toHaveBeenCalledWith(
          level.itemId,
          level.warehouseId,
        );
      });

      it('should throw StockLevelNotFoundError when level does not exist', async () => {
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValue(undefined);

        await expect(service.getStockLevel('item-1', 'wh-1')).rejects.toThrow(
          StockLevelNotFoundError,
        );
      });
    });

    describe('listStockLevels', () => {
      it('should return paginated stock levels', async () => {
        const levels = [createStockLevelFixture()];
        mockStockLevelRepo.findMany.mockResolvedValue({ data: levels, total: 1 });

        const result = await service.listStockLevels(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.totalPages).toBe(1);
      });

      it('should return empty list when no stock levels exist', async () => {
        mockStockLevelRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listStockLevels(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockStockLevelRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listStockLevels(TEST_TENANT_ID, { page: 2, limit: 15 });

        expect(mockStockLevelRepo.findMany).toHaveBeenCalledWith({
          tenantId: TEST_TENANT_ID,
          limit: 15,
          offset: 15,
        });
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // STOCK MOVEMENT SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Stock Movement Service', () => {
    describe('getStockMovement', () => {
      it('should return movement by id', async () => {
        const movement = createStockMovementFixture();
        mockStockMovementRepo.findById.mockResolvedValue(movement);

        const result = await service.getStockMovement(movement.id);

        expect(result).toEqual(movement);
        expect(mockStockMovementRepo.findById).toHaveBeenCalledWith(movement.id);
      });

      it('should throw StockMovementNotFoundError for non-existent movement', async () => {
        mockStockMovementRepo.findById.mockResolvedValue(undefined);

        await expect(service.getStockMovement('non-existent')).rejects.toThrow(
          StockMovementNotFoundError,
        );
      });
    });

    describe('listStockMovements', () => {
      it('should return paginated stock movements', async () => {
        const movements = [createStockMovementFixture()];
        mockStockMovementRepo.findMany.mockResolvedValue({ data: movements, total: 1 });

        const result = await service.listStockMovements(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.totalPages).toBe(1);
      });

      it('should return empty list when no movements exist', async () => {
        mockStockMovementRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listStockMovements(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockStockMovementRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listStockMovements(TEST_TENANT_ID, { page: 5, limit: 10 });

        expect(mockStockMovementRepo.findMany).toHaveBeenCalledWith({
          tenantId: TEST_TENANT_ID,
          limit: 10,
          offset: 40,
        });
      });

      it('should pass tenantId to repo', async () => {
        mockStockMovementRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listStockMovements(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockStockMovementRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID }),
        );
      });
    });

    describe('createStockMovement', () => {
      // ─── INV-INV-002: Source document required ────────────────────────

      it('should throw MissingSourceDocumentError when source document type is missing', async () => {
        const input = createStockMovementInputFixture({
          sourceDocumentType: undefined as unknown as string,
        });

        await expect(
          service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(MissingSourceDocumentError);
      });

      it('should throw MissingSourceDocumentError when source document id is missing', async () => {
        const input = createStockMovementInputFixture({
          sourceDocumentId: undefined as unknown as string,
        });

        await expect(
          service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(MissingSourceDocumentError);
      });

      // ─── Entity validation ────────────────────────────────────────────

      it('should throw ItemNotFoundError for invalid item', async () => {
        const input = createStockMovementInputFixture();
        mockItemRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(ItemNotFoundError);
      });

      it('should throw WarehouseNotFoundError for invalid warehouse', async () => {
        const input = createStockMovementInputFixture();
        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(WarehouseNotFoundError);
      });

      // ─── Transfer validations ─────────────────────────────────────────

      it('should throw ReferenceWarehouseRequiredError for transfer without reference', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'transfer',
          referenceWarehouseId: undefined,
        });
        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById.mockResolvedValue(createWarehouseFixture());

        await expect(
          service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(ReferenceWarehouseRequiredError);
      });

      it('should throw InvalidMovementWarehouseError when transfer source equals destination', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'transfer',
          warehouseId: 'wh-1',
          referenceWarehouseId: 'wh-1',
        });
        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById.mockResolvedValue(createWarehouseFixture());

        await expect(
          service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(InvalidMovementWarehouseError);
      });

      it('should throw WarehouseNotFoundError for invalid reference warehouse on transfer', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'transfer',
          warehouseId: 'wh-1',
          referenceWarehouseId: 'wh-2',
        });
        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById
          .mockResolvedValueOnce(createWarehouseFixture({ id: 'wh-1' }))
          .mockResolvedValueOnce(undefined);

        await expect(
          service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(WarehouseNotFoundError);
      });

      // ─── Inbound movements ────────────────────────────────────────────

      it('should create inbound movement (adds stock)', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'inbound',
          quantity: 50,
        });
        const item = createItemFixture();
        const warehouse = createWarehouseFixture();
        const movement = createStockMovementFixture({ movementType: 'inbound', quantity: 50 });

        mockItemRepo.findById.mockResolvedValue(item);
        mockWarehouseRepo.findById.mockResolvedValue(warehouse);
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValue(null);
        mockStockMovementRepo.create.mockResolvedValue([movement]);
        mockStockLevelRepo.upsertByItemAndWarehouse.mockResolvedValue([]);

        const result = await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(result).toEqual(movement);
        expect(mockStockLevelRepo.upsertByItemAndWarehouse).toHaveBeenCalledWith(
          input.itemId,
          input.warehouseId,
          expect.objectContaining({ quantityOnHand: 50 }),
        );
      });

      it('should add inbound quantity to existing stock', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'inbound',
          quantity: 30,
        });
        const existingLevel = createStockLevelFixture({ quantityOnHand: 100 });
        const movement = createStockMovementFixture({ movementType: 'inbound', quantity: 30 });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById.mockResolvedValue(createWarehouseFixture());
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValue(existingLevel);
        mockStockMovementRepo.create.mockResolvedValue([movement]);
        mockStockLevelRepo.upsertByItemAndWarehouse.mockResolvedValue([]);

        await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(mockStockLevelRepo.upsertByItemAndWarehouse).toHaveBeenCalledWith(
          input.itemId,
          input.warehouseId,
          expect.objectContaining({ quantityOnHand: 130 }),
        );
      });

      // ─── Outbound movements ───────────────────────────────────────────

      it('should create outbound movement (deducts stock)', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'outbound',
          quantity: 30,
        });
        const existingLevel = createStockLevelFixture({ quantityOnHand: 100 });
        const movement = createStockMovementFixture({ movementType: 'outbound', quantity: 30 });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById.mockResolvedValue(createWarehouseFixture());
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValue(existingLevel);
        mockStockMovementRepo.create.mockResolvedValue([movement]);
        mockStockLevelRepo.upsertByItemAndWarehouse.mockResolvedValue([]);

        await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(mockStockLevelRepo.upsertByItemAndWarehouse).toHaveBeenCalledWith(
          input.itemId,
          input.warehouseId,
          expect.objectContaining({ quantityOnHand: 70 }),
        );
      });

      it('should throw InsufficientStockError when outbound exceeds available', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'outbound',
          quantity: 200,
        });
        const existingLevel = createStockLevelFixture({ quantityOnHand: 100 });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById.mockResolvedValue(createWarehouseFixture());
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValue(existingLevel);

        await expect(
          service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(InsufficientStockError);
      });

      it('should allow outbound of exactly available quantity', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'outbound',
          quantity: 100,
        });
        const existingLevel = createStockLevelFixture({ quantityOnHand: 100 });
        const movement = createStockMovementFixture({ movementType: 'outbound', quantity: 100 });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById.mockResolvedValue(createWarehouseFixture());
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValue(existingLevel);
        mockStockMovementRepo.create.mockResolvedValue([movement]);
        mockStockLevelRepo.upsertByItemAndWarehouse.mockResolvedValue([]);

        await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(mockStockLevelRepo.upsertByItemAndWarehouse).toHaveBeenCalledWith(
          input.itemId,
          input.warehouseId,
          expect.objectContaining({ quantityOnHand: 0 }),
        );
      });

      it('should throw InsufficientStockError when no stock and outbound', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'outbound',
          quantity: 10,
        });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById.mockResolvedValue(createWarehouseFixture());
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValue(null);

        await expect(
          service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(InsufficientStockError);
      });

      // ─── Adjustment movements ─────────────────────────────────────────

      it('should create positive adjustment (adds stock)', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'adjustment',
          quantity: 25,
        });
        const existingLevel = createStockLevelFixture({ quantityOnHand: 100 });
        const movement = createStockMovementFixture({ movementType: 'adjustment', quantity: 25 });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById.mockResolvedValue(createWarehouseFixture());
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValue(existingLevel);
        mockStockMovementRepo.create.mockResolvedValue([movement]);
        mockStockLevelRepo.upsertByItemAndWarehouse.mockResolvedValue([]);

        await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(mockStockLevelRepo.upsertByItemAndWarehouse).toHaveBeenCalledWith(
          input.itemId,
          input.warehouseId,
          expect.objectContaining({ quantityOnHand: 125 }),
        );
      });

      it('should create negative adjustment (deducts stock)', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'adjustment',
          quantity: -25,
        });
        const existingLevel = createStockLevelFixture({ quantityOnHand: 100 });
        const movement = createStockMovementFixture({ movementType: 'adjustment', quantity: -25 });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById.mockResolvedValue(createWarehouseFixture());
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValue(existingLevel);
        mockStockMovementRepo.create.mockResolvedValue([movement]);
        mockStockLevelRepo.upsertByItemAndWarehouse.mockResolvedValue([]);

        await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(mockStockLevelRepo.upsertByItemAndWarehouse).toHaveBeenCalledWith(
          input.itemId,
          input.warehouseId,
          expect.objectContaining({ quantityOnHand: 75 }),
        );
      });

      it('should throw InsufficientStockError when negative adjustment causes negative stock', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'adjustment',
          quantity: -200,
        });
        const existingLevel = createStockLevelFixture({ quantityOnHand: 100 });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById.mockResolvedValue(createWarehouseFixture());
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValue(existingLevel);

        await expect(
          service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(InsufficientStockError);
      });

      // ─── Transfer movements ───────────────────────────────────────────

      it('should create transfer movement (deducts from source, adds to destination)', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'transfer',
          warehouseId: 'wh-source',
          referenceWarehouseId: 'wh-dest',
          quantity: 40,
        });
        const sourceLevel = createStockLevelFixture({
          warehouseId: 'wh-source',
          quantityOnHand: 100,
        });
        const destLevel = createStockLevelFixture({
          warehouseId: 'wh-dest',
          quantityOnHand: 50,
        });
        const movement = createStockMovementFixture({
          movementType: 'transfer',
          warehouseId: 'wh-source',
          referenceWarehouseId: 'wh-dest',
          quantity: 40,
        });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById
          .mockResolvedValueOnce(createWarehouseFixture({ id: 'wh-source' }))
          .mockResolvedValueOnce(createWarehouseFixture({ id: 'wh-dest' }));
        mockStockLevelRepo.findByItemAndWarehouse
          .mockResolvedValueOnce(sourceLevel)
          .mockResolvedValueOnce(destLevel);
        mockStockMovementRepo.create.mockResolvedValue([movement]);
        mockStockLevelRepo.upsertByItemAndWarehouse.mockResolvedValue([]);

        await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input);

        // Source warehouse deducted
        expect(mockStockLevelRepo.upsertByItemAndWarehouse).toHaveBeenCalledWith(
          'item-00000000-0000-0000-000000000001',
          'wh-source',
          expect.objectContaining({ quantityOnHand: 60 }),
        );
        // Destination warehouse increased
        expect(mockStockLevelRepo.upsertByItemAndWarehouse).toHaveBeenCalledWith(
          'item-00000000-0000-0000-000000000001',
          'wh-dest',
          expect.objectContaining({ quantityOnHand: 90 }),
        );
      });

      it('should throw InsufficientStockError when transfer exceeds source stock', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'transfer',
          warehouseId: 'wh-source',
          referenceWarehouseId: 'wh-dest',
          quantity: 200,
        });
        const sourceLevel = createStockLevelFixture({
          warehouseId: 'wh-source',
          quantityOnHand: 50,
        });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById
          .mockResolvedValueOnce(createWarehouseFixture({ id: 'wh-source' }))
          .mockResolvedValueOnce(createWarehouseFixture({ id: 'wh-dest' }));
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValueOnce(sourceLevel);

        await expect(
          service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(InsufficientStockError);
      });

      it('should handle transfer with no existing destination stock level', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'transfer',
          warehouseId: 'wh-source',
          referenceWarehouseId: 'wh-dest',
          quantity: 30,
        });
        const sourceLevel = createStockLevelFixture({
          warehouseId: 'wh-source',
          quantityOnHand: 100,
        });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById
          .mockResolvedValueOnce(createWarehouseFixture({ id: 'wh-source' }))
          .mockResolvedValueOnce(createWarehouseFixture({ id: 'wh-dest' }));
        mockStockLevelRepo.findByItemAndWarehouse
          .mockResolvedValueOnce(sourceLevel)
          .mockResolvedValueOnce(null);
        mockStockMovementRepo.create.mockResolvedValue([
          createStockMovementFixture({ movementType: 'transfer' }),
        ]);
        mockStockLevelRepo.upsertByItemAndWarehouse.mockResolvedValue([]);

        await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input);

        // Destination should start at 0 + 30 = 30
        expect(mockStockLevelRepo.upsertByItemAndWarehouse).toHaveBeenCalledWith(
          'item-00000000-0000-0000-000000000001',
          'wh-dest',
          expect.objectContaining({ quantityOnHand: 30 }),
        );
      });

      it('should use absolute value of quantity for transfer deduction', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'transfer',
          warehouseId: 'wh-source',
          referenceWarehouseId: 'wh-dest',
          quantity: -50,
        });
        const sourceLevel = createStockLevelFixture({
          warehouseId: 'wh-source',
          quantityOnHand: 100,
        });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById
          .mockResolvedValueOnce(createWarehouseFixture({ id: 'wh-source' }))
          .mockResolvedValueOnce(createWarehouseFixture({ id: 'wh-dest' }));
        mockStockLevelRepo.findByItemAndWarehouse
          .mockResolvedValueOnce(sourceLevel)
          .mockResolvedValueOnce(null);
        mockStockMovementRepo.create.mockResolvedValue([
          createStockMovementFixture({ movementType: 'transfer' }),
        ]);
        mockStockLevelRepo.upsertByItemAndWarehouse.mockResolvedValue([]);

        await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input);

        // abs(-50) = 50, so 100 - 50 = 50
        expect(mockStockLevelRepo.upsertByItemAndWarehouse).toHaveBeenCalledWith(
          'item-00000000-0000-0000-000000000001',
          'wh-source',
          expect.objectContaining({ quantityOnHand: 50 }),
        );
      });

      // ─── Movement record ──────────────────────────────────────────────

      it('should pass tenantId and createdBy to movement creation', async () => {
        const input = createStockMovementInputFixture({ movementType: 'inbound', quantity: 10 });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById.mockResolvedValue(createWarehouseFixture());
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValue(null);
        mockStockMovementRepo.create.mockResolvedValue([createStockMovementFixture()]);
        mockStockLevelRepo.upsertByItemAndWarehouse.mockResolvedValue([]);

        await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(mockStockMovementRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            ...input,
            tenantId: TEST_TENANT_ID,
            createdBy: TEST_USER_ID,
          }),
        );
      });

      it('should call upsert for source warehouse on non-transfer movement', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'inbound',
          quantity: 20,
        });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById.mockResolvedValue(createWarehouseFixture());
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValue(null);
        mockStockMovementRepo.create.mockResolvedValue([createStockMovementFixture()]);
        mockStockLevelRepo.upsertByItemAndWarehouse.mockResolvedValue([]);

        await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input);

        // Only called once for non-transfer (source warehouse only)
        expect(mockStockLevelRepo.upsertByItemAndWarehouse).toHaveBeenCalledTimes(1);
      });

      it('should call upsert twice for transfer (source + destination)', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'transfer',
          warehouseId: 'wh-source',
          referenceWarehouseId: 'wh-dest',
          quantity: 10,
        });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById
          .mockResolvedValueOnce(createWarehouseFixture({ id: 'wh-source' }))
          .mockResolvedValueOnce(createWarehouseFixture({ id: 'wh-dest' }));
        mockStockLevelRepo.findByItemAndWarehouse
          .mockResolvedValueOnce(createStockLevelFixture({ quantityOnHand: 100 }))
          .mockResolvedValueOnce(null);
        mockStockMovementRepo.create.mockResolvedValue([createStockMovementFixture()]);
        mockStockLevelRepo.upsertByItemAndWarehouse.mockResolvedValue([]);

        await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input);

        // Called twice: once for source, once for destination
        expect(mockStockLevelRepo.upsertByItemAndWarehouse).toHaveBeenCalledTimes(2);
      });

      // ─── Tenant isolation ─────────────────────────────────────────────

      it('should pass tenantId to movement creation', async () => {
        const input = createStockMovementInputFixture({ movementType: 'inbound', quantity: 10 });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById.mockResolvedValue(createWarehouseFixture());
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValue(null);
        mockStockMovementRepo.create.mockResolvedValue([createStockMovementFixture()]);
        mockStockLevelRepo.upsertByItemAndWarehouse.mockResolvedValue([]);

        await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(mockStockMovementRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID }),
        );
      });

      it('should use absolute value for quantity in inbound movement', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'inbound',
          quantity: -50,
        });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById.mockResolvedValue(createWarehouseFixture());
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValue(null);
        mockStockMovementRepo.create.mockResolvedValue([createStockMovementFixture()]);
        mockStockLevelRepo.upsertByItemAndWarehouse.mockResolvedValue([]);

        await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input);

        // abs(-50) = 50, 0 + 50 = 50
        expect(mockStockLevelRepo.upsertByItemAndWarehouse).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.objectContaining({ quantityOnHand: 50 }),
        );
      });

      it('should use absolute value for quantity in outbound movement', async () => {
        const input = createStockMovementInputFixture({
          movementType: 'outbound',
          quantity: -30,
        });
        const existingLevel = createStockLevelFixture({ quantityOnHand: 100 });

        mockItemRepo.findById.mockResolvedValue(createItemFixture());
        mockWarehouseRepo.findById.mockResolvedValue(createWarehouseFixture());
        mockStockLevelRepo.findByItemAndWarehouse.mockResolvedValue(existingLevel);
        mockStockMovementRepo.create.mockResolvedValue([createStockMovementFixture()]);
        mockStockLevelRepo.upsertByItemAndWarehouse.mockResolvedValue([]);

        await service.createStockMovement(TEST_TENANT_ID, TEST_USER_ID, input);

        // abs(-30) = 30, 100 - 30 = 70
        expect(mockStockLevelRepo.upsertByItemAndWarehouse).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.objectContaining({ quantityOnHand: 70 }),
        );
      });
    });
  });
});
