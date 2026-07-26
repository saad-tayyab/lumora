import type { Customer } from '$lib/types';
import { formatCurrency } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Customer) => string;
}

export const columns: ColumnDef[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'paymentTerms', label: 'Payment Terms' },
  {
    key: 'creditLimit',
    label: 'Credit Limit',
    class: 'text-right',
    format: (row) => (row.creditLimit ? formatCurrency(row.creditLimit) : '—'),
  },
  {
    key: 'isActive',
    label: 'Status',
    format: (row) => (row.isActive ? 'Active' : 'Inactive'),
  },
];
