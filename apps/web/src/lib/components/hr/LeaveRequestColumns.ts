import { formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'employeeName', label: 'Employee' },
  { key: 'leaveType', label: 'Type' },
  {
    key: 'startDate',
    label: 'From',
    format: (row) => formatDate(row.startDate as string),
  },
  {
    key: 'endDate',
    label: 'To',
    format: (row) => formatDate(row.endDate as string),
  },
  { key: 'status', label: 'Status' },
];
