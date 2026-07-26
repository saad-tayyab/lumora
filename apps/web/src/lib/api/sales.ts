import { api, type PaginatedResponse } from '$lib/api';

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: string;
  orderDate: string;
  expectedDeliveryDate: string | null;
  totalAmount: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrderLineItem {
  id: string;
  salesOrderId: string;
  itemId: string;
  itemName: string;
  description: string | null;
  quantity: string;
  unitPrice: string;
  discount: string;
  totalPrice: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  status: string;
  quotationDate: string;
  validUntil: string | null;
  totalAmount: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationLineItem {
  id: string;
  quotationId: string;
  itemId: string;
  itemName: string;
  description: string | null;
  quantity: string;
  unitPrice: string;
  discount: string;
  totalPrice: string;
}

export interface DiscountPolicy {
  id: string;
  name: string;
  type: string;
  value: string;
  minQuantity: string | null;
  minAmount: string | null;
  maxDiscountAmount: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const salesApi = {
  orders: {
    list: (params?: { status?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      const q = qs.toString();
      return api.get<PaginatedResponse<SalesOrder>>(`/sales/orders${q ? `?${q}` : ''}`);
    },
    get: (id: string) => api.get<SalesOrder>(`/sales/orders/${id}`),
    create: (data: Partial<SalesOrder>) => api.post<SalesOrder>('/sales/orders', data),
    update: (id: string, data: Partial<SalesOrder>) =>
      api.put<SalesOrder>(`/sales/orders/${id}`, data),
    delete: (id: string) => api.del<void>(`/sales/orders/${id}`),
    updateStatus: (id: string, status: string) =>
      api.put<SalesOrder>(`/sales/orders/${id}/status`, { status }),
    lineItems: {
      list: (orderId: string) =>
        api.get<SalesOrderLineItem[]>(`/sales/orders/${orderId}/line-items`),
      create: (orderId: string, data: Partial<SalesOrderLineItem>) =>
        api.post<SalesOrderLineItem>(`/sales/orders/${orderId}/line-items`, data),
      update: (lineItemId: string, data: Partial<SalesOrderLineItem>) =>
        api.put<SalesOrderLineItem>(`/sales/orders/line-items/${lineItemId}`, data),
      delete: (lineItemId: string) => api.del<void>(`/sales/orders/line-items/${lineItemId}`),
    },
  },
  quotations: {
    list: (params?: { status?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      const q = qs.toString();
      return api.get<PaginatedResponse<Quotation>>(`/sales/quotations${q ? `?${q}` : ''}`);
    },
    get: (id: string) => api.get<Quotation>(`/sales/quotations/${id}`),
    create: (data: Partial<Quotation>) => api.post<Quotation>('/sales/quotations', data),
    update: (id: string, data: Partial<Quotation>) =>
      api.put<Quotation>(`/sales/quotations/${id}`, data),
    delete: (id: string) => api.del<void>(`/sales/quotations/${id}`),
    updateStatus: (id: string, status: string) =>
      api.put<Quotation>(`/sales/quotations/${id}/status`, { status }),
    lineItems: {
      list: (quotationId: string) =>
        api.get<QuotationLineItem[]>(`/sales/quotations/${quotationId}/line-items`),
      create: (quotationId: string, data: Partial<QuotationLineItem>) =>
        api.post<QuotationLineItem>(`/sales/quotations/${quotationId}/line-items`, data),
      update: (lineItemId: string, data: Partial<QuotationLineItem>) =>
        api.put<QuotationLineItem>(`/sales/quotations/line-items/${lineItemId}`, data),
      delete: (lineItemId: string) => api.del<void>(`/sales/quotations/line-items/${lineItemId}`),
    },
  },
  discountPolicies: {
    list: (params?: { limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      const q = qs.toString();
      return api.get<PaginatedResponse<DiscountPolicy>>(
        `/sales/discount-policies${q ? `?${q}` : ''}`,
      );
    },
    get: (id: string) => api.get<DiscountPolicy>(`/sales/discount-policies/${id}`),
    create: (data: Partial<DiscountPolicy>) =>
      api.post<DiscountPolicy>('/sales/discount-policies', data),
    update: (id: string, data: Partial<DiscountPolicy>) =>
      api.put<DiscountPolicy>(`/sales/discount-policies/${id}`, data),
    delete: (id: string) => api.del<void>(`/sales/discount-policies/${id}`),
  },
};
