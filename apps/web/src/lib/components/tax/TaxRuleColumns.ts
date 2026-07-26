export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'name', label: 'Name' },
  { key: 'priority', label: 'Priority', class: 'text-right' },
  { key: 'taxCodeName', label: 'Tax Code' },
  { key: 'entityType', label: 'Entity Type' },
  {
    key: 'isActive',
    label: 'Status',
    format: (row) => (row.isActive ? 'Active' : 'Inactive'),
  },
];
