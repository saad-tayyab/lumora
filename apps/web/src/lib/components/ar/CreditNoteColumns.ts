import type { CreditNote } from '$lib/types';
import { formatCurrency, formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: CreditNote) => string;
}

export const columns: ColumnDef[] = [
  { key: 'creditNoteNumber', label: 'Credit Note #' },
  {
    key: 'issueDate',
    label: 'Issue Date',
    format: (row) => formatDate(row.issueDate),
  },
  { key: 'reason', label: 'Reason' },
  {
    key: 'amount',
    label: 'Amount',
    class: 'text-right',
    format: (row) => formatCurrency(row.amount),
  },
  {
    key: 'balance',
    label: 'Balance',
    class: 'text-right',
    format: (row) => formatCurrency(row.balance),
  },
  { key: 'status', label: 'Status' },
];
