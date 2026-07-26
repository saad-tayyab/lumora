import type { Payment } from '$lib/types';
import { formatCurrency, formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Payment) => string;
}

export const columns: ColumnDef[] = [
  { key: 'paymentNumber', label: 'Payment #' },
  {
    key: 'paymentDate',
    label: 'Date',
    format: (row) => formatDate(row.paymentDate),
  },
  {
    key: 'amount',
    label: 'Amount',
    class: 'text-right',
    format: (row) => formatCurrency(row.amount),
  },
  {
    key: 'paymentMethod',
    label: 'Method',
    format: (row) => row.paymentMethod.replace('_', ' '),
  },
  { key: 'referenceNumber', label: 'Reference' },
];
