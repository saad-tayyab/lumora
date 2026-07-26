import type { JournalEntry } from '$lib/types';
import { formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: JournalEntry) => string;
}

export const columns: ColumnDef[] = [
  { key: 'reference', label: 'Reference' },
  {
    key: 'entryDate',
    label: 'Date',
    format: (row) => formatDate(row.entryDate),
  },
  { key: 'description', label: 'Description' },
  {
    key: 'totalDebit',
    label: 'Debit',
    class: 'text-right',
    format: (row) => `$${parseFloat(row.totalDebit).toFixed(2)}`,
  },
  {
    key: 'totalCredit',
    label: 'Credit',
    class: 'text-right',
    format: (row) => `$${parseFloat(row.totalCredit).toFixed(2)}`,
  },
  { key: 'status', label: 'Status' },
];
