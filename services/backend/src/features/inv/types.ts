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
  costMethod?: 'fifo' | 'lifo' | 'weighted_average' | 'specific_identification';
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
  costMethod?: 'fifo' | 'lifo' | 'weighted_average' | 'specific_identification';
}

export interface ItemResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  createdBy: string;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  categoryId: string;
  unitOfMeasureId: string;
  isActive: boolean;
  isSerialized: boolean;
  isLotTracked: boolean;
  reorderPoint: number;
  reorderOptimalQuantity: number;
  reorderLeadTimeDays: number;
  reorderSafetyStock: number;
  costMethod: 'fifo' | 'lifo' | 'weighted_average' | 'specific_identification';
}

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

export interface WarehouseResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  name: string;
  code: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  isActive: boolean;
  isDefault: boolean;
}

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

export interface ItemCategoryResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  name: string;
  code: string;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
}

export type ListItemCategoriesResponse = PaginatedResponse<ItemCategoryResponse>;

// ─── Unit of Measure Types ────────────────────────────────────────────────────

export interface UnitOfMeasureResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  code: string;
  name: string;
  category: 'count' | 'weight' | 'volume' | 'length' | 'area';
  decimalPlaces: number;
  baseUomId: string | null;
  conversionFactor: string;
}

export type ListUnitOfMeasuresResponse = PaginatedResponse<UnitOfMeasureResponse>;

// ─── Stock Level Types ────────────────────────────────────────────────────────

export interface StockLevelResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  itemId: string;
  warehouseId: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  quantityOnOrder: number;
  lastCountedAt: Date | null;
  lastMovementAt: Date | null;
}

export type ListStockLevelsResponse = PaginatedResponse<StockLevelResponse>;

export interface GetStockLevelRequest {
  itemId: string;
  warehouseId: string;
}

// ─── Stock Movement Types ─────────────────────────────────────────────────────

export interface CreateStockMovementRequest {
  itemId: string;
  warehouseId: string;
  movementType: 'inbound' | 'outbound' | 'transfer' | 'adjustment';
  quantity: number;
  sourceDocumentType: string;
  sourceDocumentId: string;
  unitCost?: string;
  totalCost?: string;
  referenceWarehouseId?: string;
  reason?: string;
  movementDate?: string;
}

export interface StockMovementResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  itemId: string;
  warehouseId: string;
  movementType: 'inbound' | 'outbound' | 'transfer' | 'adjustment';
  quantity: number;
  sourceDocumentType: string;
  sourceDocumentId: string;
  unitCost: string;
  totalCost: string;
  referenceWarehouseId: string | null;
  reason: string | null;
  movementDate: Date;
  createdBy: string;
}

export type ListStockMovementsResponse = PaginatedResponse<StockMovementResponse>;
