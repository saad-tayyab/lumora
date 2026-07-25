import { AppError } from '../../lib/errors';

// ─── Item Errors ──────────────────────────────────────────────────────────────

export class ItemNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Item with id '${id}' not found`, 404);
  }
}

export class DuplicateItemSkuError extends AppError {
  constructor(sku: string) {
    super('CONFLICT', `Item with SKU '${sku}' already exists`, 409);
  }
}

export class ItemBarcodeConflictError extends AppError {
  constructor(barcode: string) {
    super('CONFLICT', `Item with barcode '${barcode}' already exists`, 409);
  }
}

// ─── Warehouse Errors ─────────────────────────────────────────────────────────

export class WarehouseNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Warehouse with id '${id}' not found`, 404);
  }
}

export class DuplicateWarehouseCodeError extends AppError {
  constructor(code: string) {
    super('CONFLICT', `Warehouse with code '${code}' already exists`, 409);
  }
}

// ─── Item Category Errors ─────────────────────────────────────────────────────

export class ItemCategoryNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Item category with id '${id}' not found`, 404);
  }
}

export class DuplicateItemCategoryCodeError extends AppError {
  constructor(code: string) {
    super('CONFLICT', `Item category with code '${code}' already exists`, 409);
  }
}

export class ItemCategoryHasChildrenError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Item category '${id}' has child categories and cannot be deleted`, 409);
  }
}

export class ItemCategoryHasItemsError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Item category '${id}' has associated items and cannot be deleted`, 409);
  }
}

// ─── Unit of Measure Errors ───────────────────────────────────────────────────

export class UnitOfMeasureNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Unit of measure with id '${id}' not found`, 404);
  }
}

// ─── Stock Level Errors ───────────────────────────────────────────────────────

export class StockLevelNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Stock level with id '${id}' not found`, 404);
  }
}

// ─── Stock Movement Errors ────────────────────────────────────────────────────

export class StockMovementNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Stock movement with id '${id}' not found`, 404);
  }
}

// ─── Business Rule Errors (INV Invariants) ────────────────────────────────────

/**
 * INV-INV-001: Stock quantity cannot go negative unless explicitly allowed
 * by configuration.
 */
export class InsufficientStockError extends AppError {
  constructor(itemId: string, warehouseId: string, requested: number, available: number) {
    super(
      'UNPROCESSABLE',
      `Insufficient stock for item '${itemId}' in warehouse '${warehouseId}': requested ${requested}, available ${available}`,
      422,
    );
  }
}

/**
 * INV-INV-001: Stock quantity cannot go negative unless explicitly allowed
 * by configuration.
 */
export class NegativeStockError extends AppError {
  constructor(itemId: string, warehouseId: string, resultingQuantity: number) {
    super(
      'UNPROCESSABLE',
      `Stock adjustment would result in negative quantity (${resultingQuantity}) for item '${itemId}' in warehouse '${warehouseId}'`,
      422,
    );
  }
}

/**
 * INV-INV-002: Every stock movement must reference a source document.
 */
export class MissingSourceDocumentError extends AppError {
  constructor() {
    super(
      'VALIDATION_ERROR',
      'Stock movement must reference a source document type and source document id',
      400,
    );
  }
}

/**
 * INV-INV-003: Items must belong to exactly one category.
 */
export class ItemCategoryRequiredError extends AppError {
  constructor(itemId: string) {
    super('VALIDATION_ERROR', `Item '${itemId}' must belong to exactly one category`, 400);
  }
}

/**
 * Transfer movements must include a reference warehouse (destination).
 */
export class ReferenceWarehouseRequiredError extends AppError {
  constructor() {
    super(
      'VALIDATION_ERROR',
      'Transfer movements must specify a reference warehouse as the destination',
      400,
    );
  }
}

/**
 * Outbound movements cannot use a reference warehouse as destination.
 */
export class InvalidMovementWarehouseError extends AppError {
  constructor() {
    super('VALIDATION_ERROR', 'Source warehouse and reference warehouse cannot be the same', 400);
  }
}
