import { api, type PaginatedResponse } from '$lib/api';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  status: string;
  orderDate: string;
  expectedDeliveryDate: string | null;
  totalAmount: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderLineItem {
  id: string;
  purchaseOrderId: string;
  itemId: string;
  itemName: string;
  description: string | null;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
  receivedQuantity: string;
}

export interface ReceivingReport {
  id: string;
  reportNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  vendorName: string;
  status: string;
  receivedDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReceivingReportLineItem {
  id: string;
  receivingReportId: string;
  purchaseOrderLineItemId: string;
  itemName: string;
  quantityReceived: string;
  quantityAccepted: string;
  quantityRejected: string;
  notes: string | null;
}

export interface VendorCatalogItem {
  id: string;
  vendorId: string;
  vendorName: string;
  itemId: string;
  itemName: string;
  vendorSku: string | null;
  unitPrice: string;
  leadTimeDays: number | null;
  minimumOrderQuantity: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const procApi = {
  purchaseOrders: {
    list: (params?: { status?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      const q = qs.toString();
      return api.get<PaginatedResponse<PurchaseOrder>>(`/proc/purchase-orders${q ? `?${q}` : ''}`);
    },
    get: (id: string) => api.get<PurchaseOrder>(`/proc/purchase-orders/${id}`),
    create: (data: Partial<PurchaseOrder>) =>
      api.post<PurchaseOrder>('/proc/purchase-orders', data),
    update: (id: string, data: Partial<PurchaseOrder>) =>
      api.patch<PurchaseOrder>(`/proc/purchase-orders/${id}`, data),
    delete: (id: string) => api.del<void>(`/proc/purchase-orders/${id}`),
    submitForApproval: (id: string) =>
      api.post<PurchaseOrder>(`/proc/purchase-orders/${id}/submit-for-approval`, {}),
    approve: (id: string) => api.post<PurchaseOrder>(`/proc/purchase-orders/${id}/approve`, {}),
    cancel: (id: string) => api.post<PurchaseOrder>(`/proc/purchase-orders/${id}/cancel`, {}),
    close: (id: string) => api.post<PurchaseOrder>(`/proc/purchase-orders/${id}/close`, {}),
    lineItems: {
      list: (poId: string) =>
        api.get<PurchaseOrderLineItem[]>(`/proc/purchase-orders/${poId}/line-items`),
      create: (poId: string, data: Partial<PurchaseOrderLineItem>) =>
        api.post<PurchaseOrderLineItem>(`/proc/purchase-orders/${poId}/line-items`, data),
      update: (poId: string, lineItemId: string, data: Partial<PurchaseOrderLineItem>) =>
        api.patch<PurchaseOrderLineItem>(
          `/proc/purchase-orders/${poId}/line-items/${lineItemId}`,
          data,
        ),
      delete: (poId: string, lineItemId: string) =>
        api.del<void>(`/proc/purchase-orders/${poId}/line-items/${lineItemId}`),
    },
  },
  receivingReports: {
    list: (params?: { status?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      const q = qs.toString();
      return api.get<PaginatedResponse<ReceivingReport>>(
        `/proc/receiving-reports${q ? `?${q}` : ''}`,
      );
    },
    get: (id: string) => api.get<ReceivingReport>(`/proc/receiving-reports/${id}`),
    create: (data: Partial<ReceivingReport>) =>
      api.post<ReceivingReport>('/proc/receiving-reports', data),
    update: (id: string, data: Partial<ReceivingReport>) =>
      api.patch<ReceivingReport>(`/proc/receiving-reports/${id}`, data),
    delete: (id: string) => api.del<void>(`/proc/receiving-reports/${id}`),
    confirm: (id: string) => api.post<ReceivingReport>(`/proc/receiving-reports/${id}/confirm`, {}),
    reject: (id: string) => api.post<ReceivingReport>(`/proc/receiving-reports/${id}/reject`, {}),
  },
  vendorCatalog: {
    list: (params?: { vendorId?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.vendorId) qs.set('vendorId', params.vendorId);
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      const q = qs.toString();
      return api.get<PaginatedResponse<VendorCatalogItem>>(
        `/proc/vendor-catalog-items${q ? `?${q}` : ''}`,
      );
    },
    get: (id: string) => api.get<VendorCatalogItem>(`/proc/vendor-catalog-items/${id}`),
    create: (data: Partial<VendorCatalogItem>) =>
      api.post<VendorCatalogItem>('/proc/vendor-catalog-items', data),
    update: (id: string, data: Partial<VendorCatalogItem>) =>
      api.patch<VendorCatalogItem>(`/proc/vendor-catalog-items/${id}`, data),
    delete: (id: string) => api.del<void>(`/proc/vendor-catalog-items/${id}`),
  },
};
