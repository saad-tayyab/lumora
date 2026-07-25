import { APIError, api } from 'encore.dev/api';
import { z } from 'zod';
import { getAuthData } from '~encore/auth';
import { ValidationError } from '../../lib/errors';
import * as service from './service';
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
  StockLevelResponse,
  StockMovementResponse,
  UnitOfMeasureResponse,
  UpdateItemCategoryRequest,
  UpdateItemRequest,
  UpdateWarehouseRequest,
  WarehouseResponse,
} from './types';

// ─── Validation Schemas ───────────────────────────────────────────────────────

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const createItemSchema = z.object({
  sku: z.string().min(1).max(50),
  barcode: z.string().max(100).optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  categoryId: z.string().uuid(),
  unitOfMeasureId: z.string().uuid(),
  isActive: z.boolean().optional(),
  isSerialized: z.boolean().optional(),
  isLotTracked: z.boolean().optional(),
  reorderPoint: z.number().int().min(0).optional(),
  reorderOptimalQuantity: z.number().int().min(0).optional(),
  reorderLeadTimeDays: z.number().int().min(0).optional(),
  reorderSafetyStock: z.number().int().min(0).optional(),
  costMethod: z.enum(['fifo', 'lifo', 'weighted_average', 'specific_identification']).optional(),
});

const updateItemSchema = z.object({
  barcode: z.string().max(100).optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  categoryId: z.string().uuid().optional(),
  unitOfMeasureId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  isSerialized: z.boolean().optional(),
  isLotTracked: z.boolean().optional(),
  reorderPoint: z.number().int().min(0).optional(),
  reorderOptimalQuantity: z.number().int().min(0).optional(),
  reorderLeadTimeDays: z.number().int().min(0).optional(),
  reorderSafetyStock: z.number().int().min(0).optional(),
  costMethod: z.enum(['fifo', 'lifo', 'weighted_average', 'specific_identification']).optional(),
});

const createWarehouseSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  addressLine1: z.string().max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(3).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

const updateWarehouseSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  addressLine1: z.string().max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(3).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

const createItemCategorySchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  description: z.string().max(500).optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

const updateItemCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  parentId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
});

const createStockMovementSchema = z.object({
  itemId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  movementType: z.enum(['inbound', 'outbound', 'transfer', 'adjustment']),
  quantity: z.number().int(),
  sourceDocumentType: z.string().min(1).max(50),
  sourceDocumentId: z.string().uuid(),
  unitCost: z.string().optional(),
  totalCost: z.string().optional(),
  referenceWarehouseId: z.string().uuid().optional(),
  reason: z.string().max(500).optional(),
  movementDate: z.string().datetime().optional(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      details[path] = [issue.message];
    }
    throw new ValidationError('Validation failed', details);
  }
  return result.data;
}

// ─── Items ────────────────────────────────────────────────────────────────────

export const getItem = api(
  { expose: true, auth: true, method: 'GET', path: '/inv/items/:id' },
  async ({ id }: { id: string }): Promise<ItemResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getItem(id);
  },
);

export const listItems = api(
  { expose: true, auth: true, method: 'GET', path: '/inv/items' },
  async (params: { page?: number; limit?: number }): Promise<ListItemsResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const query = validate(paginationSchema, params);
    return service.listItems(auth.tenantId, query);
  },
);

export const createItem = api(
  { expose: true, auth: true, method: 'POST', path: '/inv/items' },
  async (req: CreateItemRequest): Promise<ItemResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(createItemSchema, req);
    return service.createItem(auth.tenantId, auth.userId, input);
  },
);

export const updateItem = api(
  { expose: true, auth: true, method: 'PATCH', path: '/inv/items/:id' },
  async ({ id, ...body }: { id: string } & UpdateItemRequest): Promise<ItemResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(updateItemSchema, body);
    return service.updateItem(id, input);
  },
);

export const deleteItem = api(
  { expose: true, auth: true, method: 'DELETE', path: '/inv/items/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteItem(id);
  },
);

// ─── Warehouses ───────────────────────────────────────────────────────────────

export const getWarehouse = api(
  { expose: true, auth: true, method: 'GET', path: '/inv/warehouses/:id' },
  async ({ id }: { id: string }): Promise<WarehouseResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getWarehouse(id);
  },
);

export const listWarehouses = api(
  { expose: true, auth: true, method: 'GET', path: '/inv/warehouses' },
  async (params: { page?: number; limit?: number }): Promise<ListWarehousesResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const query = validate(paginationSchema, params);
    return service.listWarehouses(auth.tenantId, query);
  },
);

export const createWarehouse = api(
  { expose: true, auth: true, method: 'POST', path: '/inv/warehouses' },
  async (req: CreateWarehouseRequest): Promise<WarehouseResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(createWarehouseSchema, req);
    return service.createWarehouse(auth.tenantId, input);
  },
);

export const updateWarehouse = api(
  { expose: true, auth: true, method: 'PATCH', path: '/inv/warehouses/:id' },
  async ({ id, ...body }: { id: string } & UpdateWarehouseRequest): Promise<WarehouseResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(updateWarehouseSchema, body);
    return service.updateWarehouse(id, input);
  },
);

export const deleteWarehouse = api(
  { expose: true, auth: true, method: 'DELETE', path: '/inv/warehouses/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteWarehouse(id);
  },
);

// ─── Item Categories ──────────────────────────────────────────────────────────

export const getItemCategory = api(
  { expose: true, auth: true, method: 'GET', path: '/inv/item-categories/:id' },
  async ({ id }: { id: string }): Promise<ItemCategoryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getItemCategory(id);
  },
);

export const listItemCategories = api(
  { expose: true, auth: true, method: 'GET', path: '/inv/item-categories' },
  async (params: { page?: number; limit?: number }): Promise<ListItemCategoriesResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const query = validate(paginationSchema, params);
    return service.listItemCategories(auth.tenantId, query);
  },
);

export const createItemCategory = api(
  { expose: true, auth: true, method: 'POST', path: '/inv/item-categories' },
  async (req: CreateItemCategoryRequest): Promise<ItemCategoryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(createItemCategorySchema, req);
    return service.createItemCategory(auth.tenantId, input);
  },
);

export const updateItemCategory = api(
  { expose: true, auth: true, method: 'PATCH', path: '/inv/item-categories/:id' },
  async ({
    id,
    ...body
  }: { id: string } & UpdateItemCategoryRequest): Promise<ItemCategoryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(updateItemCategorySchema, body);
    return service.updateItemCategory(id, input);
  },
);

export const deleteItemCategory = api(
  { expose: true, auth: true, method: 'DELETE', path: '/inv/item-categories/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteItemCategory(id);
  },
);

// ─── Unit of Measures ─────────────────────────────────────────────────────────

export const getUnitOfMeasure = api(
  { expose: true, auth: true, method: 'GET', path: '/inv/unit-of-measures/:id' },
  async ({ id }: { id: string }): Promise<UnitOfMeasureResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getUnitOfMeasure(id);
  },
);

export const listUnitOfMeasures = api(
  { expose: true, auth: true, method: 'GET', path: '/inv/unit-of-measures' },
  async (params: { page?: number; limit?: number }): Promise<ListUnitOfMeasuresResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const query = validate(paginationSchema, params);
    return service.listUnitOfMeasures(query);
  },
);

// ─── Stock Levels ─────────────────────────────────────────────────────────────

export const getStockLevel = api(
  { expose: true, auth: true, method: 'GET', path: '/inv/stock-levels' },
  async (params: { itemId: string; warehouseId: string }): Promise<StockLevelResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getStockLevel(params.itemId, params.warehouseId);
  },
);

export const listStockLevels = api(
  { expose: true, auth: true, method: 'GET', path: '/inv/stock-levels/list' },
  async (params: { page?: number; limit?: number }): Promise<ListStockLevelsResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const query = validate(paginationSchema, params);
    return service.listStockLevels(auth.tenantId, query);
  },
);

// ─── Stock Movements ──────────────────────────────────────────────────────────

export const getStockMovement = api(
  { expose: true, auth: true, method: 'GET', path: '/inv/stock-movements/:id' },
  async ({ id }: { id: string }): Promise<StockMovementResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getStockMovement(id);
  },
);

export const listStockMovements = api(
  { expose: true, auth: true, method: 'GET', path: '/inv/stock-movements' },
  async (params: { page?: number; limit?: number }): Promise<ListStockMovementsResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const query = validate(paginationSchema, params);
    return service.listStockMovements(auth.tenantId, query);
  },
);

export const createStockMovement = api(
  { expose: true, auth: true, method: 'POST', path: '/inv/stock-movements' },
  async (req: CreateStockMovementRequest): Promise<StockMovementResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(createStockMovementSchema, req);
    return service.createStockMovement(auth.tenantId, auth.userId, input);
  },
);
