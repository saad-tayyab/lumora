import { formatCurrency, formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'paymentNumber', label: 'Payment #' },
  { key: 'vendorName', label: 'Vendor' },
  {
    key: 'paymentDate',
    label: 'Date',
    format: (row) => formatDate(row.paymentDate as string),
  },
  {
    key: 'amount',
    label: 'Amount',
    class: 'text-right',
    format: (row) => formatCurrency(row.amount as string),
  },
  {
    key: 'paymentMethod',
    label: 'Method',
    format: (row) => (row.paymentMethod as string).replace('_', ' '),
  },
];
