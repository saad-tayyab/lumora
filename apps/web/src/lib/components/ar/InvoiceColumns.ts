import type { Invoice } from '$lib/types';
import { formatCurrency, formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Invoice) => string;
}

export const columns: ColumnDef[] = [
  { key: 'invoiceNumber', label: 'Invoice #' },
  {
    key: 'issueDate',
    label: 'Issue Date',
    format: (row) => formatDate(row.issueDate),
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    format: (row) => formatDate(row.dueDate),
  },
  {
    key: 'totalAmount',
    label: 'Total',
    class: 'text-right',
    format: (row) => formatCurrency(row.totalAmount),
  },
  {
    key: 'balanceDue',
    label: 'Balance Due',
    class: 'text-right',
    format: (row) => formatCurrency(row.balanceDue),
  },
  { key: 'status', label: 'Status' },
];
