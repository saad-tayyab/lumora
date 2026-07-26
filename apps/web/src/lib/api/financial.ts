import { api } from '$lib/api';
import type { AccountType, FiscalYearStatus } from '$lib/types';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  description?: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryLine {
  id?: string;
  accountId: string;
  accountCode?: string;
  accountName?: string;
  description?: string;
  debit: string;
  credit: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  status: 'draft' | 'posted' | 'voided';
  lines: JournalEntryLine[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FiscalYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: FiscalYearStatus;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountInput {
  code: string;
  name: string;
  type: AccountType;
  description?: string;
}

export interface UpdateAccountInput {
  code?: string;
  name?: string;
  type?: AccountType;
  description?: string;
  isActive?: boolean;
}

export interface CreateJournalEntryInput {
  date: string;
  description: string;
  lines: {
    accountId: string;
    description?: string;
    debit: string;
    credit: string;
  }[];
}

export interface UpdateJournalEntryInput {
  date?: string;
  description?: string;
  lines?: {
    accountId: string;
    description?: string;
    debit: string;
    credit: string;
  }[];
}

export interface CreateFiscalYearInput {
  name: string;
  startDate: string;
  endDate: string;
}

export const financialApi = {
  accounts: {
    list: () => api.get<{ data: Account[] }>('/accounts'),
    get: (id: string) => api.get<Account>(`/accounts/${id}`),
    create: (data: CreateAccountInput) => api.post<Account>('/accounts', data),
    update: (id: string, data: UpdateAccountInput) => api.put<Account>(`/accounts/${id}`, data),
    delete: (id: string) => api.del<void>(`/accounts/${id}`),
  },

  journalEntries: {
    list: () => api.get<{ data: JournalEntry[] }>('/journal-entries'),
    get: (id: string) => api.get<JournalEntry>(`/journal-entries/${id}`),
    create: (data: CreateJournalEntryInput) => api.post<JournalEntry>('/journal-entries', data),
    update: (id: string, data: UpdateJournalEntryInput) =>
      api.put<JournalEntry>(`/journal-entries/${id}`, data),
    post: (id: string) => api.post<JournalEntry>(`/journal-entries/${id}/post`, {}),
    void: (id: string) => api.post<JournalEntry>(`/journal-entries/${id}/void`, {}),
  },

  fiscalYears: {
    list: () => api.get<{ data: FiscalYear[] }>('/fiscal-years'),
    get: (id: string) => api.get<FiscalYear>(`/fiscal-years/${id}`),
    create: (data: CreateFiscalYearInput) => api.post<FiscalYear>('/fiscal-years', data),
    update: (id: string, data: Partial<CreateFiscalYearInput>) =>
      api.put<FiscalYear>(`/fiscal-years/${id}`, data),
    close: (id: string) => api.post<FiscalYear>(`/fiscal-years/${id}/close`, {}),
  },
};
