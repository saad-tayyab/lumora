import { api, type PaginatedResponse } from '$lib/api';

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  routingNumber: string | null;
  currency: string;
  balance: string;
  status: 'active' | 'inactive' | 'frozen' | 'closed';
  glAccountId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  fromAccountName?: string;
  toAccountId: string;
  toAccountName?: string;
  amount: string;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  reference: string | null;
  transferDate: string;
  completedDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Statement {
  id: string;
  bankAccountId: string;
  bankAccountName?: string;
  statementDate: string;
  openingBalance: string;
  closingBalance: string;
  status: 'draft' | 'reconciled';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationEntry {
  id: string;
  bankAccountId: string;
  bankAccountName?: string;
  statementId: string | null;
  transactionDate: string;
  description: string;
  amount: string;
  type: 'credit' | 'debit';
  status: 'unmatched' | 'auto_matched' | 'manually_matched' | 'excluded' | 'disputed';
  matchedJournalEntryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface CreateBankAccountInput {
  name: string;
  accountNumber: string;
  bankName: string;
  routingNumber?: string;
  currency?: string;
  glAccountId?: string;
  notes?: string;
}

export interface CreateTransferInput {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  transferDate: string;
  reference?: string;
  notes?: string;
}

export interface CreateStatementInput {
  bankAccountId: string;
  statementDate: string;
  openingBalance: string;
  closingBalance: string;
  notes?: string;
}

export const cashApi = {
  bankAccounts: {
    list: (params?: { limit?: number; offset?: number }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.offset) q.set('offset', String(params.offset));
      const qs = q.toString();
      return api.get<PaginatedResponse<BankAccount>>(`/cash/bank-accounts${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => api.get<BankAccount>(`/cash/bank-accounts/${id}`),
    create: (data: CreateBankAccountInput) => api.post<BankAccount>('/cash/bank-accounts', data),
    update: (id: string, data: Partial<CreateBankAccountInput>) =>
      api.patch<BankAccount>(`/cash/bank-accounts/${id}`, data),
    delete: (id: string) => api.del<{ success: boolean }>(`/cash/bank-accounts/${id}`),
  },

  transfers: {
    list: (params?: { limit?: number; offset?: number }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.offset) q.set('offset', String(params.offset));
      const qs = q.toString();
      return api.get<PaginatedResponse<Transfer>>(`/cash/transfers${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => api.get<Transfer>(`/cash/transfers/${id}`),
    create: (data: CreateTransferInput) => api.post<Transfer>('/cash/transfers', data),
    complete: (id: string) => api.post<Transfer>(`/cash/transfers/${id}/complete`, {}),
    cancel: (id: string) => api.post<Transfer>(`/cash/transfers/${id}/cancel`, {}),
  },

  statements: {
    list: (params?: { limit?: number; offset?: number }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.offset) q.set('offset', String(params.offset));
      const qs = q.toString();
      return api.get<PaginatedResponse<Statement>>(`/cash/statements${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => api.get<Statement>(`/cash/statements/${id}`),
    create: (data: CreateStatementInput) => api.post<Statement>('/cash/statements', data),
    update: (id: string, data: Partial<CreateStatementInput>) =>
      api.patch<Statement>(`/cash/statements/${id}`, data),
  },

  reconciliation: {
    list: (params?: { limit?: number; offset?: number; bankAccountId?: string }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.offset) q.set('offset', String(params.offset));
      if (params?.bankAccountId) q.set('bankAccountId', params.bankAccountId);
      const qs = q.toString();
      return api.get<PaginatedResponse<ReconciliationEntry>>(
        `/cash/reconciliation-entries${qs ? `?${qs}` : ''}`,
      );
    },
    get: (id: string) => api.get<ReconciliationEntry>(`/cash/reconciliation-entries/${id}`),
    match: (id: string) =>
      api.post<ReconciliationEntry>(`/cash/reconciliation-entries/${id}/match`, {}),
    exclude: (id: string) =>
      api.post<ReconciliationEntry>(`/cash/reconciliation-entries/${id}/exclude`, {}),
  },

  currencies: {
    list: () => api.get<Currency[]>('/cash/currencies'),
  },
};
