import { formatCurrency } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'bankName', label: 'Bank' },
  { key: 'accountName', label: 'Account Name' },
  { key: 'accountNumber', label: 'Account #' },
  { key: 'accountType', label: 'Type' },
  { key: 'currencyCode', label: 'Currency' },
  {
    key: 'currentBalance',
    label: 'Balance',
    class: 'text-right',
    format: (row) => formatCurrency(row.currentBalance as string, row.currencyCode as string),
  },
  {
    key: 'status',
    label: 'Status',
    format: (row) => (row.status ? String(row.status) : 'active'),
  },
];
