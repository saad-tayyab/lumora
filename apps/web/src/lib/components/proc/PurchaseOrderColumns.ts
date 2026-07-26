import { formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'poNumber', label: 'PO #' },
  { key: 'vendorName', label: 'Vendor' },
  {
    key: 'expectedDeliveryDate',
    label: 'Expected Delivery',
    format: (row) =>
      row.expectedDeliveryDate ? formatDate(row.expectedDeliveryDate as string) : '—',
  },
  {
    key: 'totalAmount',
    label: 'Total',
    class: 'text-right',
    format: (row) => `$${parseFloat((row.totalAmount as string) || '0').toFixed(2)}`,
  },
  { key: 'status', label: 'Status' },
];
