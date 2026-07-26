import { formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'taxCodeName', label: 'Tax Code' },
  { key: 'rate', label: 'Rate', class: 'text-right' },
  {
    key: 'effectiveDate',
    label: 'Effective',
    format: (row) => formatDate(row.effectiveDate as string),
  },
  {
    key: 'expiryDate',
    label: 'Expires',
    format: (row) => (row.expiryDate ? formatDate(row.expiryDate as string) : '—'),
  },
  {
    key: 'isActive',
    label: 'Status',
    format: (row) => (row.isActive ? 'Active' : 'Inactive'),
  },
];
