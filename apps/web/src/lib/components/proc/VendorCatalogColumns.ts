import { formatCurrency } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'vendorName', label: 'Vendor' },
  { key: 'itemName', label: 'Item' },
  { key: 'vendorPartNumber', label: 'Vendor Part #' },
  {
    key: 'unitPrice',
    label: 'Price',
    class: 'text-right',
    format: (row) => formatCurrency(row.unitPrice as string),
  },
  { key: 'leadTimeDays', label: 'Lead Time', class: 'text-right' },
  { key: 'minimumOrderQty', label: 'Min Qty', class: 'text-right' },
];
