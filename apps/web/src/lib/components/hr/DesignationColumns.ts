export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'code', label: 'Code' },
  { key: 'title', label: 'Title' },
  { key: 'departmentName', label: 'Department' },
  { key: 'level', label: 'Level', class: 'text-right' },
];
