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
import { stockAdjusted } from './events';
import * as repo from './repo';
import type {
  CreateItemCategoryRequest,
  CreateItemRequest,
  CreateStockMovementRequest,
  CreateWarehouseRequest,
  ItemCategoryResponse,
  ItemResponse,
  ListItemCategoriesResponse,
  ListItemsResponse,
  ListStockLevelsResponse,
  ListStockMovementsResponse,
  ListUnitOfMeasuresResponse,
  ListWarehousesResponse,
  PaginationParams,
  StockLevelResponse,
  StockMovementResponse,
  UnitOfMeasureResponse,
  UpdateItemCategoryRequest,
  UpdateItemRequest,
  UpdateWarehouseRequest,
  WarehouseResponse,
} from './types';

// ─── Items ────────────────────────────────────────────────────────────────────

export async function getItem(id: string): Promise<ItemResponse> {
  const item = await repo.itemRepo.findById(id);
  if (!item) {
    throw new ItemNotFoundError(id);
  }
  return item;
}

export async function listItems(
  tenantId: string,
  params: PaginationParams,
): Promise<ListItemsResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.itemRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createItem(
  tenantId: string,
  createdBy: string,
  input: CreateItemRequest,
): Promise<ItemResponse> {
  // INV-INV-003: Items must belong to exactly one category
  const category = await repo.itemCategoryRepo.findById(input.categoryId);
  if (!category) {
    throw new ItemCategoryNotFoundError(input.categoryId);
  }

  // Validate unit of measure exists
  const uom = await repo.unitOfMeasureRepo.findById(input.unitOfMeasureId);
  if (!uom) {
    throw new UnitOfMeasureNotFoundError(input.unitOfMeasureId);
  }

  // Check SKU uniqueness (global constraint)
  const existingSku = await repo.itemRepo.findBySku(input.sku);
  if (existingSku) {
    throw new DuplicateItemSkuError(input.sku);
  }

  // Check barcode uniqueness if provided
  if (input.barcode) {
    const existingBarcode = await repo.itemRepo.findByBarcode(input.barcode);
    if (existingBarcode) {
      throw new DuplicateItemSkuError(input.barcode);
    }
  }

  const [item] = await repo.itemRepo.create({
    ...input,
    tenantId,
    createdBy,
  });

  return item;
}

export async function updateItem(id: string, input: UpdateItemRequest): Promise<ItemResponse> {
  const existing = await repo.itemRepo.findById(id);
  if (!existing) {
    throw new ItemNotFoundError(id);
  }

  // If changing category, validate it exists (INV-INV-003)
  if (input.categoryId) {
    const category = await repo.itemCategoryRepo.findById(input.categoryId);
    if (!category) {
      throw new ItemCategoryNotFoundError(input.categoryId);
    }
  }

  // If changing unit of measure, validate it exists
  if (input.unitOfMeasureId) {
    const uom = await repo.unitOfMeasureRepo.findById(input.unitOfMeasureId);
    if (!uom) {
      throw new UnitOfMeasureNotFoundError(input.unitOfMeasureId);
    }
  }

  // Check barcode uniqueness if changing
  if (input.barcode && input.barcode !== existing.barcode) {
    const existingBarcode = await repo.itemRepo.findByBarcode(input.barcode);
    if (existingBarcode) {
      throw new DuplicateItemSkuError(input.barcode);
    }
  }

  const [updated] = await repo.itemRepo.update(id, input);
  return updated;
}

export async function deleteItem(id: string): Promise<void> {
  const existing = await repo.itemRepo.findById(id);
  if (!existing) {
    throw new ItemNotFoundError(id);
  }

  await repo.itemRepo.softDelete(id);
}

// ─── Warehouses ───────────────────────────────────────────────────────────────

export async function getWarehouse(id: string): Promise<WarehouseResponse> {
  const warehouse = await repo.warehouseRepo.findById(id);
  if (!warehouse) {
    throw new WarehouseNotFoundError(id);
  }
  return warehouse;
}

export async function listWarehouses(
  tenantId: string,
  params: PaginationParams,
): Promise<ListWarehousesResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.warehouseRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createWarehouse(
  tenantId: string,
  input: CreateWarehouseRequest,
): Promise<WarehouseResponse> {
  // Check code uniqueness within tenant
  const existing = await repo.warehouseRepo.findByCode(tenantId, input.code);
  if (existing) {
    throw new DuplicateWarehouseCodeError(input.code);
  }

  const [warehouse] = await repo.warehouseRepo.create({
    ...input,
    tenantId,
  });

  return warehouse;
}

export async function updateWarehouse(
  id: string,
  input: UpdateWarehouseRequest,
): Promise<WarehouseResponse> {
  const existing = await repo.warehouseRepo.findById(id);
  if (!existing) {
    throw new WarehouseNotFoundError(id);
  }

  const [updated] = await repo.warehouseRepo.update(id, input);
  return updated;
}

export async function deleteWarehouse(id: string): Promise<void> {
  const existing = await repo.warehouseRepo.findById(id);
  if (!existing) {
    throw new WarehouseNotFoundError(id);
  }

  await repo.warehouseRepo.softDelete(id);
}

// ─── Item Categories ──────────────────────────────────────────────────────────

export async function getItemCategory(id: string): Promise<ItemCategoryResponse> {
  const category = await repo.itemCategoryRepo.findById(id);
  if (!category) {
    throw new ItemCategoryNotFoundError(id);
  }
  return category;
}

export async function listItemCategories(
  tenantId: string,
  params: PaginationParams,
): Promise<ListItemCategoriesResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.itemCategoryRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createItemCategory(
  tenantId: string,
  input: CreateItemCategoryRequest,
): Promise<ItemCategoryResponse> {
  // Check code uniqueness within tenant
  const existing = await repo.itemCategoryRepo.findByCode(tenantId, input.code);
  if (existing) {
    throw new DuplicateItemCategoryCodeError(input.code);
  }

  // Validate parent exists if provided
  if (input.parentId) {
    const parent = await repo.itemCategoryRepo.findById(input.parentId);
    if (!parent) {
      throw new ItemCategoryNotFoundError(input.parentId);
    }
  }

  const [category] = await repo.itemCategoryRepo.create({
    ...input,
    tenantId,
  });

  return category;
}

export async function updateItemCategory(
  id: string,
  input: UpdateItemCategoryRequest,
): Promise<ItemCategoryResponse> {
  const existing = await repo.itemCategoryRepo.findById(id);
  if (!existing) {
    throw new ItemCategoryNotFoundError(id);
  }

  // Prevent circular parent reference
  if (input.parentId && input.parentId === id) {
    throw new ItemCategoryNotFoundError(id);
  }

  const [updated] = await repo.itemCategoryRepo.update(id, input);
  return updated;
}

export async function deleteItemCategory(id: string): Promise<void> {
  const existing = await repo.itemCategoryRepo.findById(id);
  if (!existing) {
    throw new ItemCategoryNotFoundError(id);
  }

  // Check for child categories
  const children = await repo.itemCategoryRepo.findByParentId(id);
  if (children.length > 0) {
    throw new ItemCategoryHasChildrenError(id);
  }

  // Check for associated items
  const itemCount = await repo.itemCategoryRepo.countItemsByCategory(id);
  if (itemCount > 0) {
    throw new ItemCategoryHasItemsError(id);
  }

  await repo.itemCategoryRepo.softDelete(id);
}

// ─── Unit of Measures ─────────────────────────────────────────────────────────

export async function getUnitOfMeasure(id: string): Promise<UnitOfMeasureResponse> {
  const uom = await repo.unitOfMeasureRepo.findById(id);
  if (!uom) {
    throw new UnitOfMeasureNotFoundError(id);
  }
  return uom;
}

export async function listUnitOfMeasures(
  params: PaginationParams,
): Promise<ListUnitOfMeasuresResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.unitOfMeasureRepo.findMany({
    limit,
    offset,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── Stock Levels ─────────────────────────────────────────────────────────────

export async function getStockLevel(
  itemId: string,
  warehouseId: string,
): Promise<StockLevelResponse> {
  const level = await repo.stockLevelRepo.findByItemAndWarehouse(itemId, warehouseId);
  if (!level) {
    throw new StockLevelNotFoundError(`${itemId}:${warehouseId}`);
  }
  return level;
}

export async function listStockLevels(
  tenantId: string,
  params: PaginationParams,
): Promise<ListStockLevelsResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.stockLevelRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── Stock Movements ──────────────────────────────────────────────────────────

export async function getStockMovement(id: string): Promise<StockMovementResponse> {
  const movement = await repo.stockMovementRepo.findById(id);
  if (!movement) {
    throw new StockMovementNotFoundError(id);
  }
  return movement;
}

export async function listStockMovements(
  tenantId: string,
  params: PaginationParams,
): Promise<ListStockMovementsResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.stockMovementRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Creates a stock movement and updates the corresponding stock level.
 *
 * Enforces:
 * - INV-INV-001: Stock quantity cannot go negative
 * - INV-INV-002: Every stock movement must reference a source document
 * - INV-INV-003: Items must belong to exactly one category (via item lookup)
 */
export async function createStockMovement(
  tenantId: string,
  createdBy: string,
  input: CreateStockMovementRequest,
): Promise<StockMovementResponse> {
  // INV-INV-002: Every stock movement must reference a source document
  if (!input.sourceDocumentType || !input.sourceDocumentId) {
    throw new MissingSourceDocumentError();
  }

  // Validate item exists
  const item = await repo.itemRepo.findById(input.itemId);
  if (!item) {
    throw new ItemNotFoundError(input.itemId);
  }

  // Validate warehouse exists
  const warehouse = await repo.warehouseRepo.findById(input.warehouseId);
  if (!warehouse) {
    throw new WarehouseNotFoundError(input.warehouseId);
  }

  // Validate reference warehouse for transfers
  if (input.movementType === 'transfer') {
    if (!input.referenceWarehouseId) {
      throw new ReferenceWarehouseRequiredError();
    }
    if (input.referenceWarehouseId === input.warehouseId) {
      throw new InvalidMovementWarehouseError();
    }
    const refWarehouse = await repo.warehouseRepo.findById(input.referenceWarehouseId);
    if (!refWarehouse) {
      throw new WarehouseNotFoundError(input.referenceWarehouseId);
    }
  }

  // Get current stock level
  const currentLevel = await repo.stockLevelRepo.findByItemAndWarehouse(
    input.itemId,
    input.warehouseId,
  );
  const currentQuantity = currentLevel?.quantityOnHand ?? 0;
  const quantity = Math.abs(input.quantity);

  // Calculate resulting stock based on movement type
  let resultingQuantity: number;
  switch (input.movementType) {
    case 'inbound':
      resultingQuantity = currentQuantity + quantity;
      break;
    case 'outbound':
      resultingQuantity = currentQuantity - quantity;
      break;
    case 'adjustment':
      // quantity can be positive (increase) or negative (decrease)
      resultingQuantity = currentQuantity + input.quantity;
      break;
    case 'transfer':
      // Transfer deducts from source warehouse
      resultingQuantity = currentQuantity - quantity;
      break;
    default:
      resultingQuantity = currentQuantity;
  }

  // INV-INV-001: Stock quantity cannot go negative
  if (resultingQuantity < 0) {
    throw new InsufficientStockError(input.itemId, input.warehouseId, quantity, currentQuantity);
  }

  // Create the movement record
  const [movement] = await repo.stockMovementRepo.create({
    ...input,
    tenantId,
    createdBy,
    quantity: input.quantity,
  });

  // Update stock level for source warehouse
  await repo.stockLevelRepo.upsertByItemAndWarehouse(input.itemId, input.warehouseId, {
    quantityOnHand: resultingQuantity,
    lastMovementAt: new Date(),
  });

  // For transfers, also update destination warehouse
  if (input.movementType === 'transfer' && input.referenceWarehouseId) {
    const destLevel = await repo.stockLevelRepo.findByItemAndWarehouse(
      input.itemId,
      input.referenceWarehouseId,
    );
    const destQuantity = destLevel?.quantityOnHand ?? 0;

    await repo.stockLevelRepo.upsertByItemAndWarehouse(input.itemId, input.referenceWarehouseId, {
      quantityOnHand: destQuantity + quantity,
      lastMovementAt: new Date(),
    });
  }

  await stockAdjusted.publish({
    itemId: movement.itemId,
    warehouseId: movement.warehouseId,
    quantity: movement.quantity,
    tenantId,
  });

  return movement;
}
