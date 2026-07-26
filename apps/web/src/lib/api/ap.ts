import { api, type PaginatedResponse } from '$lib/api';

export interface Vendor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
  taxId: string | null;
  paymentTerms: number;
  currency: string;
  notes: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface BillLineItem {
  id: string;
  billId: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
  accountId: string | null;
  taxCodeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: string;
  vendorId: string;
  vendorName?: string;
  billNumber: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'partially_paid' | 'paid' | 'voided';
  issueDate: string;
  dueDate: string;
  subtotal: string;
  taxAmount: string;
  total: string;
  amountPaid: string;
  notes: string | null;
  lineItems?: BillLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  vendorId: string;
  vendorName?: string;
  billId: string | null;
  billNumber?: string;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  reference: string | null;
  bankAccountId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
  taxId?: string;
  paymentTerms?: number;
  currency?: string;
  notes?: string;
}

export interface CreateBillInput {
  vendorId: string;
  billNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  taxAmount?: string;
  total: string;
  notes?: string;
  lineItems?: {
    description: string;
    quantity: string;
    unitPrice: string;
    amount: string;
    accountId?: string;
    taxCodeId?: string;
  }[];
}

export interface CreatePaymentInput {
  vendorId: string;
  billId?: string;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  bankAccountId?: string;
  notes?: string;
}

export const apApi = {
  vendors: {
    list: (params?: { limit?: number; offset?: number }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.offset) q.set('offset', String(params.offset));
      const qs = q.toString();
      return api.get<PaginatedResponse<Vendor>>(`/ap/vendors${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => api.get<Vendor>(`/ap/vendors/${id}`),
    create: (data: CreateVendorInput) => api.post<Vendor>('/ap/vendors', data),
    update: (id: string, data: Partial<CreateVendorInput>) =>
      api.patch<Vendor>(`/ap/vendors/${id}`, data),
    delete: (id: string) => api.del<{ success: boolean }>(`/ap/vendors/${id}`),
  },

  bills: {
    list: (params?: { limit?: number; offset?: number; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.offset) q.set('offset', String(params.offset));
      if (params?.status) q.set('status', params.status);
      const qs = q.toString();
      return api.get<PaginatedResponse<Bill>>(`/ap/bills${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => api.get<Bill>(`/ap/bills/${id}`),
    create: (data: CreateBillInput) => api.post<Bill>('/ap/bills', data),
    update: (id: string, data: Partial<CreateBillInput>) =>
      api.patch<Bill>(`/ap/bills/${id}`, data),
    delete: (id: string) => api.del<{ success: boolean }>(`/ap/bills/${id}`),
    submitForApproval: (id: string) => api.post<Bill>(`/ap/bills/${id}/submit-for-approval`, {}),
    approve: (id: string) => api.post<Bill>(`/ap/bills/${id}/approve`, {}),
    void: (id: string) => api.post<Bill>(`/ap/bills/${id}/void`, {}),
    lineItems: {
      list: (billId: string) =>
        api.get<PaginatedResponse<BillLineItem>>(`/ap/bills/${billId}/line-items`),
      create: (
        billId: string,
        data: Omit<BillLineItem, 'id' | 'billId' | 'createdAt' | 'updatedAt'>,
      ) => api.post<BillLineItem>(`/ap/bills/${billId}/line-items`, data),
      update: (billId: string, lineItemId: string, data: Partial<BillLineItem>) =>
        api.patch<BillLineItem>(`/ap/bills/${billId}/line-items/${lineItemId}`, data),
      delete: (billId: string, lineItemId: string) =>
        api.del<{ success: boolean }>(`/ap/bills/${billId}/line-items/${lineItemId}`),
    },
  },

  payments: {
    list: (params?: { limit?: number; offset?: number }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.offset) q.set('offset', String(params.offset));
      const qs = q.toString();
      return api.get<PaginatedResponse<Payment>>(`/ap/payments${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => api.get<Payment>(`/ap/payments/${id}`),
    create: (data: CreatePaymentInput) => api.post<Payment>('/ap/payments', data),
    delete: (id: string) => api.del<{ success: boolean }>(`/ap/payments/${id}`),
  },
};
