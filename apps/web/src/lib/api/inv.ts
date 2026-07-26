import { api, type PaginatedResponse } from '$lib/api';

export interface ItemCategory {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  country: string | null;
  managerId: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  categoryId: string | null;
  categoryName?: string;
  unitOfMeasure: string;
  costPrice: string;
  salePrice: string;
  reorderPoint: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface StockLevel {
  id: string;
  itemId: string;
  itemName?: string;
  itemSku?: string;
  warehouseId: string;
  warehouseName?: string;
  quantity: string;
  reservedQuantity: string;
  availableQuantity: string;
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName?: string;
  itemSku?: string;
  warehouseId: string;
  warehouseName?: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: string;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
}

export interface CreateItemInput {
  name: string;
  sku: string;
  description?: string;
  categoryId?: string;
  unitOfMeasure: string;
  costPrice: string;
  salePrice: string;
  reorderPoint?: string;
}

export interface CreateWarehouseInput {
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  managerId?: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  parentId?: string;
}

export interface CreateStockMovementInput {
  itemId: string;
  warehouseId: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: string;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
}

export const invApi = {
  items: {
    list: (params?: { limit?: number; offset?: number; categoryId?: string }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.offset) q.set('offset', String(params.offset));
      if (params?.categoryId) q.set('categoryId', params.categoryId);
      const qs = q.toString();
      return api.get<PaginatedResponse<Item>>(`/inv/items${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => api.get<Item>(`/inv/items/${id}`),
    create: (data: CreateItemInput) => api.post<Item>('/inv/items', data),
    update: (id: string, data: Partial<CreateItemInput>) =>
      api.patch<Item>(`/inv/items/${id}`, data),
    delete: (id: string) => api.del<{ success: boolean }>(`/inv/items/${id}`),
  },

  warehouses: {
    list: (params?: { limit?: number; offset?: number }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.offset) q.set('offset', String(params.offset));
      const qs = q.toString();
      return api.get<PaginatedResponse<Warehouse>>(`/inv/warehouses${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => api.get<Warehouse>(`/inv/warehouses/${id}`),
    create: (data: CreateWarehouseInput) => api.post<Warehouse>('/inv/warehouses', data),
    update: (id: string, data: Partial<CreateWarehouseInput>) =>
      api.patch<Warehouse>(`/inv/warehouses/${id}`, data),
    delete: (id: string) => api.del<{ success: boolean }>(`/inv/warehouses/${id}`),
  },

  categories: {
    list: (params?: { limit?: number; offset?: number }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.offset) q.set('offset', String(params.offset));
      const qs = q.toString();
      return api.get<PaginatedResponse<ItemCategory>>(`/inv/item-categories${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => api.get<ItemCategory>(`/inv/item-categories/${id}`),
    create: (data: CreateCategoryInput) => api.post<ItemCategory>('/inv/item-categories', data),
    update: (id: string, data: Partial<CreateCategoryInput>) =>
      api.patch<ItemCategory>(`/inv/item-categories/${id}`, data),
    delete: (id: string) => api.del<{ success: boolean }>(`/inv/item-categories/${id}`),
  },

  stockLevels: {
    list: (params?: { warehouseId?: string; itemId?: string }) => {
      const q = new URLSearchParams();
      if (params?.warehouseId) q.set('warehouseId', params.warehouseId);
      if (params?.itemId) q.set('itemId', params.itemId);
      const qs = q.toString();
      return api.get<PaginatedResponse<StockLevel>>(`/inv/stock-levels${qs ? `?${qs}` : ''}`);
    },
    listAll: () => api.get<StockLevel[]>('/inv/stock-levels/list'),
  },

  stockMovements: {
    list: (params?: { limit?: number; offset?: number; itemId?: string; warehouseId?: string }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.offset) q.set('offset', String(params.offset));
      if (params?.itemId) q.set('itemId', params.itemId);
      if (params?.warehouseId) q.set('warehouseId', params.warehouseId);
      const qs = q.toString();
      return api.get<PaginatedResponse<StockMovement>>(`/inv/stock-movements${qs ? `?${qs}` : ''}`);
    },
    create: (data: CreateStockMovementInput) =>
      api.post<StockMovement>('/inv/stock-movements', data),
  },
};
