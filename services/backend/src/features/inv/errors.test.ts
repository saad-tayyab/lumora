import { describe, expect, it, vi } from 'vitest';

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

import {
  DuplicateItemCategoryCodeError,
  DuplicateItemSkuError,
  DuplicateWarehouseCodeError,
  InsufficientStockError,
  InvalidMovementWarehouseError,
  ItemBarcodeConflictError,
  ItemCategoryHasChildrenError,
  ItemCategoryHasItemsError,
  ItemCategoryNotFoundError,
  ItemCategoryRequiredError,
  ItemNotFoundError,
  MissingSourceDocumentError,
  NegativeStockError,
  ReferenceWarehouseRequiredError,
  StockLevelNotFoundError,
  StockMovementNotFoundError,
  UnitOfMeasureNotFoundError,
  WarehouseNotFoundError,
} from './errors';

// ─── Item Errors ──────────────────────────────────────────────────────────

describe('ItemNotFoundError', () => {
  it('should have code NOT_FOUND and status 404', () => {
    const error = new ItemNotFoundError('item-123');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
  });

  it('should include the id in the message', () => {
    const error = new ItemNotFoundError('item-abc');
    expect(error.message).toContain('item-abc');
    expect(error.message).toMatch(/Item with id 'item-abc' not found/);
  });
});

describe('DuplicateItemSkuError', () => {
  it('should have code CONFLICT and status 409', () => {
    const error = new DuplicateItemSkuError('SKU-100');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
  });

  it('should include the sku in the message', () => {
    const error = new DuplicateItemSkuError('SKU-100');
    expect(error.message).toContain('SKU-100');
    expect(error.message).toMatch(/Item with SKU 'SKU-100' already exists/);
  });
});

describe('ItemBarcodeConflictError', () => {
  it('should have code CONFLICT and status 409', () => {
    const error = new ItemBarcodeConflictError('BC-200');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
  });

  it('should include the barcode in the message', () => {
    const error = new ItemBarcodeConflictError('BC-200');
    expect(error.message).toContain('BC-200');
    expect(error.message).toMatch(/Item with barcode 'BC-200' already exists/);
  });
});

// ─── Warehouse Errors ─────────────────────────────────────────────────────

describe('WarehouseNotFoundError', () => {
  it('should have code NOT_FOUND and status 404', () => {
    const error = new WarehouseNotFoundError('wh-456');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
  });

  it('should include the id in the message', () => {
    const error = new WarehouseNotFoundError('wh-456');
    expect(error.message).toContain('wh-456');
    expect(error.message).toMatch(/Warehouse with id 'wh-456' not found/);
  });
});

describe('DuplicateWarehouseCodeError', () => {
  it('should have code CONFLICT and status 409', () => {
    const error = new DuplicateWarehouseCodeError('WH-01');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
  });

  it('should include the code in the message', () => {
    const error = new DuplicateWarehouseCodeError('WH-01');
    expect(error.message).toContain('WH-01');
    expect(error.message).toMatch(/Warehouse with code 'WH-01' already exists/);
  });
});

// ─── Item Category Errors ─────────────────────────────────────────────────

describe('ItemCategoryNotFoundError', () => {
  it('should have code NOT_FOUND and status 404', () => {
    const error = new ItemCategoryNotFoundError('cat-789');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
  });

  it('should include the id in the message', () => {
    const error = new ItemCategoryNotFoundError('cat-789');
    expect(error.message).toContain('cat-789');
    expect(error.message).toMatch(/Item category with id 'cat-789' not found/);
  });
});

describe('DuplicateItemCategoryCodeError', () => {
  it('should have code CONFLICT and status 409', () => {
    const error = new DuplicateItemCategoryCodeError('ELEC');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
  });

  it('should include the code in the message', () => {
    const error = new DuplicateItemCategoryCodeError('ELEC');
    expect(error.message).toContain('ELEC');
    expect(error.message).toMatch(/Item category with code 'ELEC' already exists/);
  });
});

describe('ItemCategoryHasChildrenError', () => {
  it('should have code CONFLICT and status 409', () => {
    const error = new ItemCategoryHasChildrenError('cat-parent');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
  });

  it('should include the id in the message', () => {
    const error = new ItemCategoryHasChildrenError('cat-parent');
    expect(error.message).toContain('cat-parent');
    expect(error.message).toMatch(/has child categories and cannot be deleted/);
  });
});

describe('ItemCategoryHasItemsError', () => {
  it('should have code CONFLICT and status 409', () => {
    const error = new ItemCategoryHasItemsError('cat-items');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
  });

  it('should include the id in the message', () => {
    const error = new ItemCategoryHasItemsError('cat-items');
    expect(error.message).toContain('cat-items');
    expect(error.message).toMatch(/has associated items and cannot be deleted/);
  });
});

// ─── Unit of Measure Errors ───────────────────────────────────────────────

describe('UnitOfMeasureNotFoundError', () => {
  it('should have code NOT_FOUND and status 404', () => {
    const error = new UnitOfMeasureNotFoundError('uom-100');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
  });

  it('should include the id in the message', () => {
    const error = new UnitOfMeasureNotFoundError('uom-100');
    expect(error.message).toContain('uom-100');
    expect(error.message).toMatch(/Unit of measure with id 'uom-100' not found/);
  });
});

// ─── Stock Level Errors ───────────────────────────────────────────────────

describe('StockLevelNotFoundError', () => {
  it('should have code NOT_FOUND and status 404', () => {
    const error = new StockLevelNotFoundError('sl-200');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
  });

  it('should include the id in the message', () => {
    const error = new StockLevelNotFoundError('sl-200');
    expect(error.message).toContain('sl-200');
    expect(error.message).toMatch(/Stock level with id 'sl-200' not found/);
  });
});

// ─── Stock Movement Errors ────────────────────────────────────────────────

describe('StockMovementNotFoundError', () => {
  it('should have code NOT_FOUND and status 404', () => {
    const error = new StockMovementNotFoundError('sm-300');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
  });

  it('should include the id in the message', () => {
    const error = new StockMovementNotFoundError('sm-300');
    expect(error.message).toContain('sm-300');
    expect(error.message).toMatch(/Stock movement with id 'sm-300' not found/);
  });
});

// ─── Business Rule Errors ─────────────────────────────────────────────────

describe('InsufficientStockError', () => {
  it('should have code UNPROCESSABLE and status 422', () => {
    const error = new InsufficientStockError('item-1', 'wh-1', 100, 50);
    expect(error.code).toBe('UNPROCESSABLE');
    expect(error.status).toBe(422);
  });

  it('should include item, warehouse, requested, and available in message', () => {
    const error = new InsufficientStockError('item-abc', 'wh-xyz', 100, 50);
    expect(error.message).toContain('item-abc');
    expect(error.message).toContain('wh-xyz');
    expect(error.message).toContain('100');
    expect(error.message).toContain('50');
    expect(error.message).toMatch(/Insufficient stock/);
  });
});

describe('NegativeStockError', () => {
  it('should have code UNPROCESSABLE and status 422', () => {
    const error = new NegativeStockError('item-1', 'wh-1', -10);
    expect(error.code).toBe('UNPROCESSABLE');
    expect(error.status).toBe(422);
  });

  it('should include item, warehouse, and resulting quantity in message', () => {
    const error = new NegativeStockError('item-def', 'wh-abc', -25);
    expect(error.message).toContain('item-def');
    expect(error.message).toContain('wh-abc');
    expect(error.message).toContain('-25');
    expect(error.message).toMatch(/negative quantity/);
  });
});

describe('MissingSourceDocumentError', () => {
  it('should have code VALIDATION_ERROR and status 400', () => {
    const error = new MissingSourceDocumentError();
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
  });

  it('should have descriptive message', () => {
    const error = new MissingSourceDocumentError();
    expect(error.message).toMatch(/source document type and source document id/);
  });
});

describe('ItemCategoryRequiredError', () => {
  it('should have code VALIDATION_ERROR and status 400', () => {
    const error = new ItemCategoryRequiredError('item-1');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
  });

  it('should include item id in message', () => {
    const error = new ItemCategoryRequiredError('item-xyz');
    expect(error.message).toContain('item-xyz');
    expect(error.message).toMatch(/must belong to exactly one category/);
  });
});

describe('ReferenceWarehouseRequiredError', () => {
  it('should have code VALIDATION_ERROR and status 400', () => {
    const error = new ReferenceWarehouseRequiredError();
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
  });

  it('should have descriptive message', () => {
    const error = new ReferenceWarehouseRequiredError();
    expect(error.message).toMatch(/Transfer movements must specify a reference warehouse/);
  });
});

describe('InvalidMovementWarehouseError', () => {
  it('should have code VALIDATION_ERROR and status 400', () => {
    const error = new InvalidMovementWarehouseError();
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
  });

  it('should have descriptive message about same warehouse', () => {
    const error = new InvalidMovementWarehouseError();
    expect(error.message).toMatch(/Source warehouse and reference warehouse cannot be the same/);
  });
});

// ─── Error Inheritance ────────────────────────────────────────────────────

describe('Error inheritance', () => {
  it('should all be instances of Error', () => {
    expect(new ItemNotFoundError('x')).toBeInstanceOf(Error);
    expect(new DuplicateItemSkuError('x')).toBeInstanceOf(Error);
    expect(new ItemBarcodeConflictError('x')).toBeInstanceOf(Error);
    expect(new WarehouseNotFoundError('x')).toBeInstanceOf(Error);
    expect(new DuplicateWarehouseCodeError('x')).toBeInstanceOf(Error);
    expect(new ItemCategoryNotFoundError('x')).toBeInstanceOf(Error);
    expect(new DuplicateItemCategoryCodeError('x')).toBeInstanceOf(Error);
    expect(new ItemCategoryHasChildrenError('x')).toBeInstanceOf(Error);
    expect(new ItemCategoryHasItemsError('x')).toBeInstanceOf(Error);
    expect(new UnitOfMeasureNotFoundError('x')).toBeInstanceOf(Error);
    expect(new StockLevelNotFoundError('x')).toBeInstanceOf(Error);
    expect(new StockMovementNotFoundError('x')).toBeInstanceOf(Error);
    expect(new InsufficientStockError('a', 'b', 1, 0)).toBeInstanceOf(Error);
    expect(new NegativeStockError('a', 'b', -1)).toBeInstanceOf(Error);
    expect(new MissingSourceDocumentError()).toBeInstanceOf(Error);
    expect(new ItemCategoryRequiredError('x')).toBeInstanceOf(Error);
    expect(new ReferenceWarehouseRequiredError()).toBeInstanceOf(Error);
    expect(new InvalidMovementWarehouseError()).toBeInstanceOf(Error);
  });

  it('should all have name APIError', () => {
    const error = new ItemNotFoundError('x');
    expect(error.name).toBe('APIError');
  });
});
