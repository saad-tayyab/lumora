import { formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'itemName', label: 'Item' },
  { key: 'movementType', label: 'Type' },
  { key: 'fromWarehouseName', label: 'From' },
  { key: 'toWarehouseName', label: 'To' },
  { key: 'quantity', label: 'Qty', class: 'text-right' },
  {
    key: 'createdAt',
    label: 'Date',
    format: (row) => formatDate(row.createdAt as string),
  },
];
