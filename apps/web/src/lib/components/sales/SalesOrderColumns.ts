import { formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'orderNumber', label: 'Order #' },
  { key: 'customerName', label: 'Customer' },
  {
    key: 'orderDate',
    label: 'Date',
    format: (row) => formatDate(row.orderDate as string),
  },
  {
    key: 'totalAmount',
    label: 'Total',
    class: 'text-right',
    format: (row) => `$${parseFloat((row.totalAmount as string) || '0').toFixed(2)}`,
  },
  { key: 'status', label: 'Status' },
];
