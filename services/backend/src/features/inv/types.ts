import type {
  Item,
  ItemCategory,
  NewItem,
  NewItemCategory,
  NewStockLevel,
  NewStockMovement,
  NewUnitOfMeasure,
  NewWarehouse,
  StockLevel,
  StockMovement,
  UnitOfMeasure,
  Warehouse,
} from '@lumora/database/schema/inv';

// ─── Re-export Domain Types ───────────────────────────────────────────────────

export type {
  Item,
  ItemCategory,
  NewItem,
  NewItemCategory,
  NewStockLevel,
  NewStockMovement,
  NewUnitOfMeasure,
  NewWarehouse,
  StockLevel,
  StockMovement,
  UnitOfMeasure,
  Warehouse,
};

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Item Types ───────────────────────────────────────────────────────────────

export interface CreateItemRequest {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId: string;
  unitOfMeasureId: string;
  isActive?: boolean;
  isSerialized?: boolean;
  isLotTracked?: boolean;
  reorderPoint?: number;
  reorderOptimalQuantity?: number;
  reorderLeadTimeDays?: number;
  reorderSafetyStock?: number;
  costMethod?: Item['costMethod'];
}

export interface UpdateItemRequest {
  barcode?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  unitOfMeasureId?: string;
  isActive?: boolean;
  isSerialized?: boolean;
  isLotTracked?: boolean;
  reorderPoint?: number;
  reorderOptimalQuantity?: number;
  reorderLeadTimeDays?: number;
  reorderSafetyStock?: number;
  costMethod?: Item['costMethod'];
}

export type ItemResponse = Item;
export type ListItemsResponse = PaginatedResponse<ItemResponse>;

// ─── Warehouse Types ──────────────────────────────────────────────────────────

export interface CreateWarehouseRequest {
  name: string;
  code: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface UpdateWarehouseRequest {
  name?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export type WarehouseResponse = Warehouse;
export type ListWarehousesResponse = PaginatedResponse<WarehouseResponse>;

// ─── Item Category Types ──────────────────────────────────────────────────────

export interface CreateItemCategoryRequest {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface UpdateItemCategoryRequest {
  name?: string;
  description?: string;
  parentId?: string | null;
  isActive?: boolean;
}

export type ItemCategoryResponse = ItemCategory;
export type ListItemCategoriesResponse = PaginatedResponse<ItemCategoryResponse>;

// ─── Unit of Measure Types ────────────────────────────────────────────────────

export type UnitOfMeasureResponse = UnitOfMeasure;
export type ListUnitOfMeasuresResponse = PaginatedResponse<UnitOfMeasureResponse>;

// ─── Stock Level Types ────────────────────────────────────────────────────────

export type StockLevelResponse = StockLevel;
export type ListStockLevelsResponse = PaginatedResponse<StockLevelResponse>;

export interface GetStockLevelRequest {
  itemId: string;
  warehouseId: string;
}

// ─── Stock Movement Types ─────────────────────────────────────────────────────

export interface CreateStockMovementRequest {
  itemId: string;
  warehouseId: string;
  movementType: StockMovement['movementType'];
  quantity: number;
  sourceDocumentType: string;
  sourceDocumentId: string;
  unitCost?: string;
  totalCost?: string;
  referenceWarehouseId?: string;
  reason?: string;
  movementDate?: string;
}

export type StockMovementResponse = StockMovement;
export type ListStockMovementsResponse = PaginatedResponse<StockMovementResponse>;
