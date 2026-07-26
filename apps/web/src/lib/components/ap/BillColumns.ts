import { formatCurrency, formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'billNumber', label: 'Bill #' },
  { key: 'vendorName', label: 'Vendor' },
  {
    key: 'issueDate',
    label: 'Issue Date',
    format: (row) => formatDate(row.issueDate as string),
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    format: (row) => formatDate(row.dueDate as string),
  },
  {
    key: 'totalAmount',
    label: 'Total',
    class: 'text-right',
    format: (row) => formatCurrency(row.totalAmount as string),
  },
  { key: 'status', label: 'Status' },
];
