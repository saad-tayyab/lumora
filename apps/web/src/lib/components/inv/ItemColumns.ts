import { formatCurrency } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: 'Name' },
  { key: 'categoryName', label: 'Category' },
  {
    key: 'unitPrice',
    label: 'Unit Price',
    class: 'text-right',
    format: (row) => formatCurrency(row.unitPrice as string),
  },
  {
    key: 'costPrice',
    label: 'Cost Price',
    class: 'text-right',
    format: (row) => formatCurrency(row.costPrice as string),
  },
  {
    key: 'isActive',
    label: 'Status',
    format: (row) => (row.isActive ? 'Active' : 'Inactive'),
  },
];
