import { formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'employeeName', label: 'Employee' },
  {
    key: 'date',
    label: 'Date',
    format: (row) => formatDate(row.date as string),
  },
  { key: 'status', label: 'Status' },
  { key: 'checkIn', label: 'Check In' },
  { key: 'checkOut', label: 'Check Out' },
];
