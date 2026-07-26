import { formatCurrency, formatDateTime } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'budgetLineId', label: 'Budget Line' },
  { key: 'description', label: 'Description' },
  {
    key: 'amount',
    label: 'Amount',
    class: 'text-right',
    format: (row) => formatCurrency(row.amount as string),
  },
  {
    key: 'consumptionDate',
    label: 'Date',
    format: (row) => formatDateTime(row.consumptionDate as string),
  },
];
