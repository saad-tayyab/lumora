import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TEST_TENANT_ID, TEST_USER_ID } from '../../lib/test-utils';
import type {
  CreateItemCategoryRequest,
  CreateItemRequest,
  CreateStockMovementRequest,
  CreateWarehouseRequest,
} from './types';

// ─── Hoisted mocks ────────────────────────────────────────────────────────

const { mockGetAuthData, svc, MockAPIError } = vi.hoisted(() => {
  class MockAPIError extends Error {
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
    static unauthenticated(message: string) {
      return new MockAPIError('unauthenticated', message, { status: 401 });
    }
  }
  return {
    mockGetAuthData: vi.fn(),
    MockAPIError,
    svc: {
      getItem: vi.fn(),
      listItems: vi.fn(),
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      getWarehouse: vi.fn(),
      listWarehouses: vi.fn(),
      createWarehouse: vi.fn(),
      updateWarehouse: vi.fn(),
      deleteWarehouse: vi.fn(),
      getItemCategory: vi.fn(),
      listItemCategories: vi.fn(),
      createItemCategory: vi.fn(),
      updateItemCategory: vi.fn(),
      deleteItemCategory: vi.fn(),
      getUnitOfMeasure: vi.fn(),
      listUnitOfMeasures: vi.fn(),
      getStockLevel: vi.fn(),
      listStockLevels: vi.fn(),
      getStockMovement: vi.fn(),
      listStockMovements: vi.fn(),
      createStockMovement: vi.fn(),
    },
  };
});

// ─── Mock encore.dev/api ──────────────────────────────────────────────────

vi.mock('encore.dev/api', () => ({
  APIError: MockAPIError,
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));

// ─── Mock ~encore/auth ────────────────────────────────────────────────────

vi.mock('~encore/auth', () => ({ getAuthData: () => mockGetAuthData() }));

// ─── Mock ../../lib/errors ────────────────────────────────────────────────

vi.mock('../../lib/errors', () => ({
  ValidationError: class ValidationError extends MockAPIError {
    constructor(message: string, details?: Record<string, string[]>) {
      super('VALIDATION_ERROR', message, { status: 400, details });
    }
  },
  NotFoundError: class NotFoundError extends MockAPIError {
    constructor(resource: string, id: string) {
      super('NOT_FOUND', `${resource} with id ${id} not found`, { status: 404 });
    }
  },
}));

// ─── Mock ./service ───────────────────────────────────────────────────────

vi.mock('./service', () => svc);

// ─── Import handlers after mocks ──────────────────────────────────────────

import { ValidationError } from '../../lib/errors';
import {
  createItem,
  createItemCategory,
  createStockMovement,
  createWarehouse,
  deleteItem,
  deleteItemCategory,
  deleteWarehouse,
  getItem,
  getItemCategory,
  getStockLevel,
  getStockMovement,
  getUnitOfMeasure,
  getWarehouse,
  listItemCategories,
  listItems,
  listStockLevels,
  listStockMovements,
  listUnitOfMeasures,
  listWarehouses,
  updateItem,
  updateItemCategory,
  updateWarehouse,
} from './api';
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

// ─── Helpers ──────────────────────────────────────────────────────────────

const mockSession = { tenantId: TEST_TENANT_ID, userId: TEST_USER_ID };

const UUID = {
  ITEM: '10000000-0000-4000-8000-000000000001',
  WAREHOUSE: '20000000-0000-4000-8000-000000000002',
  CATEGORY: '30000000-0000-4000-8000-000000000003',
  UOM: '40000000-0000-4000-8000-000000000004',
  SOURCE_DOC: '50000000-0000-4000-8000-000000000005',
  REF_WAREHOUSE: '60000000-0000-4000-8000-000000000006',
};

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Inventory API Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthData.mockReturnValue(mockSession);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getItem
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getItem', () => {
    it('should return item by id', async () => {
      const item = createItemFixture();
      svc.getItem.mockResolvedValue(item);

      const result = await getItem({ id: item.id });

      expect(result).toEqual(item);
      expect(svc.getItem).toHaveBeenCalledWith(item.id);
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(getItem({ id: 'any-id' })).rejects.toThrow();
    });

    it('should propagate service errors', async () => {
      const error = new Error('not found');
      svc.getItem.mockRejectedValue(error);

      await expect(getItem({ id: 'missing-id' })).rejects.toThrow('not found');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // listItems
  // ═══════════════════════════════════════════════════════════════════════════

  describe('listItems', () => {
    it('should return paginated items with defaults', async () => {
      const response = { data: [createItemFixture()], total: 1, page: 1, limit: 20, totalPages: 1 };
      svc.listItems.mockResolvedValue(response);

      const result = await listItems({});

      expect(result).toEqual(response);
      expect(svc.listItems).toHaveBeenCalledWith(TEST_TENANT_ID, { page: 1, limit: 20 });
    });

    it('should pass custom pagination params', async () => {
      svc.listItems.mockResolvedValue({ data: [], total: 0, page: 3, limit: 10, totalPages: 0 });

      await listItems({ page: 3, limit: 10 });

      expect(svc.listItems).toHaveBeenCalledWith(TEST_TENANT_ID, { page: 3, limit: 10 });
    });

    it('should coerce string page/limit to numbers', async () => {
      svc.listItems.mockResolvedValue({ data: [], total: 0, page: 2, limit: 50, totalPages: 0 });

      await listItems({ page: '2', limit: '50' } as unknown as { page?: number; limit?: number });

      expect(svc.listItems).toHaveBeenCalledWith(TEST_TENANT_ID, { page: 2, limit: 50 });
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(listItems({})).rejects.toThrow();
    });

    it('should reject limit over 100', async () => {
      await expect(listItems({ limit: 101 })).rejects.toThrow(ValidationError);
    });

    it('should reject negative page', async () => {
      await expect(listItems({ page: -1 })).rejects.toThrow(ValidationError);
    });

    it('should reject zero limit', async () => {
      await expect(listItems({ limit: 0 })).rejects.toThrow(ValidationError);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // createItem
  // ═══════════════════════════════════════════════════════════════════════════

  describe('createItem', () => {
    it('should create item with valid input', async () => {
      const input = createItemInputFixture({
        categoryId: UUID.CATEGORY,
        unitOfMeasureId: UUID.UOM,
      });
      const item = createItemFixture();
      svc.createItem.mockResolvedValue(item);

      const result = await createItem(input);

      expect(result).toEqual(item);
      expect(svc.createItem).toHaveBeenCalledWith(TEST_TENANT_ID, TEST_USER_ID, input);
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(createItem(createItemInputFixture())).rejects.toThrow();
    });

    it('should reject missing sku', async () => {
      const { sku: _, ...rest } = createItemInputFixture();

      await expect(createItem(rest as unknown as CreateItemRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should reject missing name', async () => {
      const { name: _, ...rest } = createItemInputFixture();

      await expect(createItem(rest as unknown as CreateItemRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should reject missing categoryId', async () => {
      const { categoryId: _, ...rest } = createItemInputFixture();

      await expect(createItem(rest as unknown as CreateItemRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should reject missing unitOfMeasureId', async () => {
      const { unitOfMeasureId: _, ...rest } = createItemInputFixture();

      await expect(createItem(rest as unknown as CreateItemRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should reject invalid categoryId format (not uuid)', async () => {
      await expect(
        createItem(createItemInputFixture({ categoryId: 'not-a-uuid' })),
      ).rejects.toThrow(ValidationError);
    });

    it('should reject invalid costMethod enum', async () => {
      await expect(
        createItem(
          createItemInputFixture({ costMethod: 'invalid' as CreateItemRequest['costMethod'] }),
        ),
      ).rejects.toThrow(ValidationError);
    });

    it('should propagate service errors', async () => {
      svc.createItem.mockRejectedValue(new Error('duplicate sku'));

      await expect(
        createItem(
          createItemInputFixture({
            categoryId: UUID.CATEGORY,
            unitOfMeasureId: UUID.UOM,
          }),
        ),
      ).rejects.toThrow('duplicate sku');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // updateItem
  // ═══════════════════════════════════════════════════════════════════════════

  describe('updateItem', () => {
    it('should update item with valid input', async () => {
      const updated = { ...createItemFixture(), name: 'Updated Widget' };
      svc.updateItem.mockResolvedValue(updated);

      const result = await updateItem({ id: updated.id, name: 'Updated Widget' });

      expect(result).toEqual(updated);
      expect(svc.updateItem).toHaveBeenCalledWith(updated.id, { name: 'Updated Widget' });
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(updateItem({ id: 'any-id', name: 'Test' })).rejects.toThrow();
    });

    it('should reject empty name on update', async () => {
      await expect(updateItem({ id: 'any-id', name: '' })).rejects.toThrow(ValidationError);
    });

    it('should reject invalid categoryId on update', async () => {
      await expect(updateItem({ id: 'any-id', categoryId: 'not-uuid' })).rejects.toThrow(
        ValidationError,
      );
    });

    it('should reject invalid costMethod on update', async () => {
      await expect(updateItem({ id: 'any-id', costMethod: 'fifo' })).resolves.toBeDefined();

      await expect(
        updateItem({
          id: 'any-id',
          costMethod: 'invalid' as unknown as Record<string, unknown>['costMethod'],
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('should propagate service errors', async () => {
      svc.updateItem.mockRejectedValue(new Error('not found'));

      await expect(updateItem({ id: 'missing', name: 'Test' })).rejects.toThrow('not found');
    });

    it('should allow partial updates', async () => {
      const updated = { ...createItemFixture(), barcode: 'NEW-BC' };
      svc.updateItem.mockResolvedValue(updated);

      const result = await updateItem({ id: updated.id, barcode: 'NEW-BC' });

      expect(result).toEqual(updated);
      expect(svc.updateItem).toHaveBeenCalledWith(updated.id, { barcode: 'NEW-BC' });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // deleteItem
  // ═══════════════════════════════════════════════════════════════════════════

  describe('deleteItem', () => {
    it('should delete item', async () => {
      svc.deleteItem.mockResolvedValue(undefined);

      await expect(deleteItem({ id: 'item-1' })).resolves.toBeUndefined();
      expect(svc.deleteItem).toHaveBeenCalledWith('item-1');
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(deleteItem({ id: 'any-id' })).rejects.toThrow();
    });

    it('should propagate service errors', async () => {
      svc.deleteItem.mockRejectedValue(new Error('not found'));

      await expect(deleteItem({ id: 'missing' })).rejects.toThrow('not found');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getWarehouse
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getWarehouse', () => {
    it('should return warehouse by id', async () => {
      const warehouse = createWarehouseFixture();
      svc.getWarehouse.mockResolvedValue(warehouse);

      const result = await getWarehouse({ id: warehouse.id });

      expect(result).toEqual(warehouse);
      expect(svc.getWarehouse).toHaveBeenCalledWith(warehouse.id);
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(getWarehouse({ id: 'any-id' })).rejects.toThrow();
    });

    it('should propagate service errors', async () => {
      svc.getWarehouse.mockRejectedValue(new Error('not found'));

      await expect(getWarehouse({ id: 'missing' })).rejects.toThrow('not found');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // listWarehouses
  // ═══════════════════════════════════════════════════════════════════════════

  describe('listWarehouses', () => {
    it('should return paginated warehouses with defaults', async () => {
      const response = {
        data: [createWarehouseFixture()],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      svc.listWarehouses.mockResolvedValue(response);

      const result = await listWarehouses({});

      expect(result).toEqual(response);
      expect(svc.listWarehouses).toHaveBeenCalledWith(TEST_TENANT_ID, { page: 1, limit: 20 });
    });

    it('should pass custom pagination params', async () => {
      svc.listWarehouses.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 50,
        totalPages: 0,
      });

      await listWarehouses({ page: 2, limit: 50 });

      expect(svc.listWarehouses).toHaveBeenCalledWith(TEST_TENANT_ID, { page: 2, limit: 50 });
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(listWarehouses({})).rejects.toThrow();
    });

    it('should reject invalid page (non-positive)', async () => {
      await expect(listWarehouses({ page: 0 })).rejects.toThrow(ValidationError);
    });

    it('should reject limit exceeding maximum', async () => {
      await expect(listWarehouses({ limit: 101 })).rejects.toThrow(ValidationError);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // createWarehouse
  // ═══════════════════════════════════════════════════════════════════════════

  describe('createWarehouse', () => {
    it('should create warehouse with valid input', async () => {
      const input = createWarehouseInputFixture();
      const warehouse = createWarehouseFixture();
      svc.createWarehouse.mockResolvedValue(warehouse);

      const result = await createWarehouse(input);

      expect(result).toEqual(warehouse);
      expect(svc.createWarehouse).toHaveBeenCalledWith(TEST_TENANT_ID, input);
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(createWarehouse(createWarehouseInputFixture())).rejects.toThrow();
    });

    it('should reject missing name', async () => {
      const { name, ...rest } = createWarehouseInputFixture();

      await expect(createWarehouse(rest as unknown as CreateWarehouseRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should reject missing code', async () => {
      const { code: _, ...rest } = createWarehouseInputFixture();

      await expect(createWarehouse(rest as unknown as CreateWarehouseRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should propagate service errors', async () => {
      svc.createWarehouse.mockRejectedValue(new Error('duplicate code'));

      await expect(createWarehouse(createWarehouseInputFixture())).rejects.toThrow(
        'duplicate code',
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // updateWarehouse
  // ═══════════════════════════════════════════════════════════════════════════

  describe('updateWarehouse', () => {
    it('should update warehouse with valid input', async () => {
      const updated = { ...createWarehouseFixture(), name: 'Updated WH' };
      svc.updateWarehouse.mockResolvedValue(updated);

      const result = await updateWarehouse({ id: updated.id, name: 'Updated WH' });

      expect(result).toEqual(updated);
      expect(svc.updateWarehouse).toHaveBeenCalledWith(updated.id, { name: 'Updated WH' });
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(updateWarehouse({ id: 'any-id', name: 'Test' })).rejects.toThrow();
    });

    it('should reject empty name', async () => {
      await expect(updateWarehouse({ id: 'any-id', name: '' })).rejects.toThrow(ValidationError);
    });

    it('should propagate service errors', async () => {
      svc.updateWarehouse.mockRejectedValue(new Error('not found'));

      await expect(updateWarehouse({ id: 'missing', name: 'Test' })).rejects.toThrow('not found');
    });

    it('should allow partial updates without name', async () => {
      const updated = { ...createWarehouseFixture(), city: 'New City' };
      svc.updateWarehouse.mockResolvedValue(updated);

      const result = await updateWarehouse({ id: updated.id, city: 'New City' });

      expect(result).toEqual(updated);
      expect(svc.updateWarehouse).toHaveBeenCalledWith(updated.id, { city: 'New City' });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // deleteWarehouse
  // ═══════════════════════════════════════════════════════════════════════════

  describe('deleteWarehouse', () => {
    it('should delete warehouse', async () => {
      svc.deleteWarehouse.mockResolvedValue(undefined);

      await expect(deleteWarehouse({ id: 'wh-1' })).resolves.toBeUndefined();
      expect(svc.deleteWarehouse).toHaveBeenCalledWith('wh-1');
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(deleteWarehouse({ id: 'any-id' })).rejects.toThrow();
    });

    it('should propagate service errors', async () => {
      svc.deleteWarehouse.mockRejectedValue(new Error('not found'));

      await expect(deleteWarehouse({ id: 'missing' })).rejects.toThrow('not found');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getItemCategory
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getItemCategory', () => {
    it('should return category by id', async () => {
      const category = createItemCategoryFixture();
      svc.getItemCategory.mockResolvedValue(category);

      const result = await getItemCategory({ id: category.id });

      expect(result).toEqual(category);
      expect(svc.getItemCategory).toHaveBeenCalledWith(category.id);
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(getItemCategory({ id: 'any-id' })).rejects.toThrow();
    });

    it('should propagate service errors', async () => {
      svc.getItemCategory.mockRejectedValue(new Error('not found'));

      await expect(getItemCategory({ id: 'missing' })).rejects.toThrow('not found');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // listItemCategories
  // ═══════════════════════════════════════════════════════════════════════════

  describe('listItemCategories', () => {
    it('should return paginated categories with defaults', async () => {
      const response = {
        data: [createItemCategoryFixture()],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      svc.listItemCategories.mockResolvedValue(response);

      const result = await listItemCategories({});

      expect(result).toEqual(response);
      expect(svc.listItemCategories).toHaveBeenCalledWith(TEST_TENANT_ID, { page: 1, limit: 20 });
    });

    it('should pass custom pagination params', async () => {
      svc.listItemCategories.mockResolvedValue({
        data: [],
        total: 0,
        page: 5,
        limit: 5,
        totalPages: 0,
      });

      await listItemCategories({ page: 5, limit: 5 });

      expect(svc.listItemCategories).toHaveBeenCalledWith(TEST_TENANT_ID, { page: 5, limit: 5 });
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(listItemCategories({})).rejects.toThrow();
    });

    it('should reject negative limit', async () => {
      await expect(listItemCategories({ limit: -1 })).rejects.toThrow(ValidationError);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // createItemCategory
  // ═══════════════════════════════════════════════════════════════════════════

  describe('createItemCategory', () => {
    it('should create category with valid input', async () => {
      const input = createItemCategoryInputFixture();
      const category = createItemCategoryFixture();
      svc.createItemCategory.mockResolvedValue(category);

      const result = await createItemCategory(input);

      expect(result).toEqual(category);
      expect(svc.createItemCategory).toHaveBeenCalledWith(TEST_TENANT_ID, input);
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(createItemCategory(createItemCategoryInputFixture())).rejects.toThrow();
    });

    it('should reject missing name', async () => {
      const { name, ...rest } = createItemCategoryInputFixture();

      await expect(
        createItemCategory(rest as unknown as CreateItemCategoryRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should reject missing code', async () => {
      const { code: _, ...rest } = createItemCategoryInputFixture();

      await expect(
        createItemCategory(rest as unknown as CreateItemCategoryRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should reject invalid parentId format', async () => {
      await expect(
        createItemCategory(createItemCategoryInputFixture({ parentId: 'not-uuid' })),
      ).rejects.toThrow(ValidationError);
    });

    it('should propagate service errors', async () => {
      svc.createItemCategory.mockRejectedValue(new Error('duplicate code'));

      await expect(createItemCategory(createItemCategoryInputFixture())).rejects.toThrow(
        'duplicate code',
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // updateItemCategory
  // ═══════════════════════════════════════════════════════════════════════════

  describe('updateItemCategory', () => {
    it('should update category with valid input', async () => {
      const updated = { ...createItemCategoryFixture(), name: 'Updated Cat' };
      svc.updateItemCategory.mockResolvedValue(updated);

      const result = await updateItemCategory({ id: updated.id, name: 'Updated Cat' });

      expect(result).toEqual(updated);
      expect(svc.updateItemCategory).toHaveBeenCalledWith(updated.id, { name: 'Updated Cat' });
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(updateItemCategory({ id: 'any-id', name: 'Test' })).rejects.toThrow();
    });

    it('should reject empty name', async () => {
      await expect(updateItemCategory({ id: 'any-id', name: '' })).rejects.toThrow(ValidationError);
    });

    it('should propagate service errors', async () => {
      svc.updateItemCategory.mockRejectedValue(new Error('not found'));

      await expect(updateItemCategory({ id: 'missing', name: 'Test' })).rejects.toThrow(
        'not found',
      );
    });

    it('should allow setting parentId to null', async () => {
      const updated = { ...createItemCategoryFixture(), parentId: null };
      svc.updateItemCategory.mockResolvedValue(updated);

      const result = await updateItemCategory({ id: updated.id, parentId: null });

      expect(result).toEqual(updated);
      expect(svc.updateItemCategory).toHaveBeenCalledWith(updated.id, { parentId: null });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // deleteItemCategory
  // ═══════════════════════════════════════════════════════════════════════════

  describe('deleteItemCategory', () => {
    it('should delete category', async () => {
      svc.deleteItemCategory.mockResolvedValue(undefined);

      await expect(deleteItemCategory({ id: 'cat-1' })).resolves.toBeUndefined();
      expect(svc.deleteItemCategory).toHaveBeenCalledWith('cat-1');
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(deleteItemCategory({ id: 'any-id' })).rejects.toThrow();
    });

    it('should propagate service errors', async () => {
      svc.deleteItemCategory.mockRejectedValue(new Error('has children'));

      await expect(deleteItemCategory({ id: 'cat-1' })).rejects.toThrow('has children');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getUnitOfMeasure
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getUnitOfMeasure', () => {
    it('should return UOM by id', async () => {
      const uom = createUnitOfMeasureFixture();
      svc.getUnitOfMeasure.mockResolvedValue(uom);

      const result = await getUnitOfMeasure({ id: uom.id });

      expect(result).toEqual(uom);
      expect(svc.getUnitOfMeasure).toHaveBeenCalledWith(uom.id);
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(getUnitOfMeasure({ id: 'any-id' })).rejects.toThrow();
    });

    it('should propagate service errors', async () => {
      svc.getUnitOfMeasure.mockRejectedValue(new Error('not found'));

      await expect(getUnitOfMeasure({ id: 'missing' })).rejects.toThrow('not found');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // listUnitOfMeasures
  // ═══════════════════════════════════════════════════════════════════════════

  describe('listUnitOfMeasures', () => {
    it('should return paginated UOMs with defaults', async () => {
      const response = {
        data: [createUnitOfMeasureFixture()],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      svc.listUnitOfMeasures.mockResolvedValue(response);

      const result = await listUnitOfMeasures({});

      expect(result).toEqual(response);
      expect(svc.listUnitOfMeasures).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });

    it('should pass custom pagination params', async () => {
      svc.listUnitOfMeasures.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      });

      await listUnitOfMeasures({ limit: 50 });

      expect(svc.listUnitOfMeasures).toHaveBeenCalledWith({ page: 1, limit: 50 });
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(listUnitOfMeasures({})).rejects.toThrow();
    });

    it('should reject non-integer page', async () => {
      await expect(listUnitOfMeasures({ page: 1.5 })).rejects.toThrow(ValidationError);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getStockLevel
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getStockLevel', () => {
    it('should return stock level by item and warehouse', async () => {
      const level = createStockLevelFixture();
      svc.getStockLevel.mockResolvedValue(level);

      const result = await getStockLevel({ itemId: level.itemId, warehouseId: level.warehouseId });

      expect(result).toEqual(level);
      expect(svc.getStockLevel).toHaveBeenCalledWith(level.itemId, level.warehouseId);
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(getStockLevel({ itemId: 'i1', warehouseId: 'w1' })).rejects.toThrow();
    });

    it('should propagate service errors', async () => {
      svc.getStockLevel.mockRejectedValue(new Error('not found'));

      await expect(getStockLevel({ itemId: 'i1', warehouseId: 'w1' })).rejects.toThrow('not found');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // listStockLevels
  // ═══════════════════════════════════════════════════════════════════════════

  describe('listStockLevels', () => {
    it('should return paginated stock levels with defaults', async () => {
      const response = {
        data: [createStockLevelFixture()],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      svc.listStockLevels.mockResolvedValue(response);

      const result = await listStockLevels({});

      expect(result).toEqual(response);
      expect(svc.listStockLevels).toHaveBeenCalledWith(TEST_TENANT_ID, { page: 1, limit: 20 });
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(listStockLevels({})).rejects.toThrow();
    });

    it('should reject limit exceeding maximum', async () => {
      await expect(listStockLevels({ limit: 1000 })).rejects.toThrow(ValidationError);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getStockMovement
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getStockMovement', () => {
    it('should return stock movement by id', async () => {
      const movement = createStockMovementFixture();
      svc.getStockMovement.mockResolvedValue(movement);

      const result = await getStockMovement({ id: movement.id });

      expect(result).toEqual(movement);
      expect(svc.getStockMovement).toHaveBeenCalledWith(movement.id);
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(getStockMovement({ id: 'any-id' })).rejects.toThrow();
    });

    it('should propagate service errors', async () => {
      svc.getStockMovement.mockRejectedValue(new Error('not found'));

      await expect(getStockMovement({ id: 'missing' })).rejects.toThrow('not found');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // listStockMovements
  // ═══════════════════════════════════════════════════════════════════════════

  describe('listStockMovements', () => {
    it('should return paginated stock movements with defaults', async () => {
      const response = {
        data: [createStockMovementFixture()],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      svc.listStockMovements.mockResolvedValue(response);

      const result = await listStockMovements({});

      expect(result).toEqual(response);
      expect(svc.listStockMovements).toHaveBeenCalledWith(TEST_TENANT_ID, { page: 1, limit: 20 });
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(listStockMovements({})).rejects.toThrow();
    });

    it('should reject negative page', async () => {
      await expect(listStockMovements({ page: -5 })).rejects.toThrow(ValidationError);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // createStockMovement
  // ═══════════════════════════════════════════════════════════════════════════

  describe('createStockMovement', () => {
    it('should create stock movement with valid input', async () => {
      const input = createStockMovementInputFixture({
        itemId: UUID.ITEM,
        warehouseId: UUID.WAREHOUSE,
        sourceDocumentId: UUID.SOURCE_DOC,
        movementDate: '2026-07-15T10:00:00Z',
      });
      const movement = createStockMovementFixture();
      svc.createStockMovement.mockResolvedValue(movement);

      const result = await createStockMovement(input);

      expect(result).toEqual(movement);
      expect(svc.createStockMovement).toHaveBeenCalledWith(TEST_TENANT_ID, TEST_USER_ID, input);
    });

    it('should throw when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);

      await expect(createStockMovement(createStockMovementInputFixture())).rejects.toThrow();
    });

    it('should reject missing itemId', async () => {
      const { itemId: _, ...rest } = createStockMovementInputFixture();

      await expect(
        createStockMovement(rest as unknown as CreateStockMovementRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should reject missing warehouseId', async () => {
      const { warehouseId: _, ...rest } = createStockMovementInputFixture();

      await expect(
        createStockMovement(rest as unknown as CreateStockMovementRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should reject missing movementType', async () => {
      const { movementType: _, ...rest } = createStockMovementInputFixture();

      await expect(
        createStockMovement(rest as unknown as CreateStockMovementRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should reject invalid movementType enum', async () => {
      await expect(
        createStockMovement(
          createStockMovementInputFixture({
            movementType: 'invalid' as unknown as CreateStockMovementRequest['movementType'],
          }),
        ),
      ).rejects.toThrow(ValidationError);
    });

    it('should reject missing quantity', async () => {
      const { quantity: _, ...rest } = createStockMovementInputFixture();

      await expect(
        createStockMovement(rest as unknown as CreateStockMovementRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should reject missing sourceDocumentType', async () => {
      const { sourceDocumentType: _, ...rest } = createStockMovementInputFixture();

      await expect(
        createStockMovement(rest as unknown as CreateStockMovementRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should reject missing sourceDocumentId', async () => {
      const { sourceDocumentId: _, ...rest } = createStockMovementInputFixture();

      await expect(
        createStockMovement(rest as unknown as CreateStockMovementRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should reject invalid itemId format', async () => {
      await expect(
        createStockMovement(createStockMovementInputFixture({ itemId: 'not-uuid' })),
      ).rejects.toThrow(ValidationError);
    });

    it('should propagate service errors', async () => {
      svc.createStockMovement.mockRejectedValue(new Error('insufficient stock'));

      await expect(
        createStockMovement(
          createStockMovementInputFixture({
            itemId: UUID.ITEM,
            warehouseId: UUID.WAREHOUSE,
            sourceDocumentId: UUID.SOURCE_DOC,
            movementDate: '2026-07-15T10:00:00Z',
          }),
        ),
      ).rejects.toThrow('insufficient stock');
    });

    it('should accept all valid movement types', async () => {
      for (const type of ['inbound', 'outbound', 'transfer', 'adjustment'] as const) {
        const movement = createStockMovementFixture({ movementType: type });
        svc.createStockMovement.mockResolvedValue(movement);

        const result = await createStockMovement(
          createStockMovementInputFixture({
            movementType: type,
            itemId: UUID.ITEM,
            warehouseId: UUID.WAREHOUSE,
            sourceDocumentId: UUID.SOURCE_DOC,
            movementDate: '2026-07-15T10:00:00Z',
          }),
        );
        expect(result.movementType).toBe(type);
      }
    });
  });
});
