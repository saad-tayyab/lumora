export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Name' },
  { key: 'defaultDepreciationMethod', label: 'Method' },
  { key: 'defaultUsefulLifeMonths', label: 'Life (mo)', class: 'text-right' },
  {
    key: 'isDepreciable',
    label: 'Depreciable',
    format: (row) => (row.isDepreciable ? 'Yes' : 'No'),
  },
  {
    key: 'isActive',
    label: 'Status',
    format: (row) => (row.isActive ? 'Active' : 'Inactive'),
  },
];
