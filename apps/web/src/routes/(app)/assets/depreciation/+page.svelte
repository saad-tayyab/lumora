<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import { Badge } from '$lib/components/ui/badge';

let { data }: { data: PageData } = $props();

function methodLabel(method: string): string {
  const labels: Record<string, string> = {
    straight_line: 'Straight Line',
    declining_balance: 'Declining Balance',
    sum_of_years_digits: 'Sum of Years Digits',
    units_of_activity: 'Units of Activity',
  };
  return labels[method] || method;
}

const columns: ColumnDef<any>[] = [
  { accessorKey: 'assetId', header: 'Asset ID', cell: (row) => `<span class="font-mono text-xs">${(row as any).original.assetId.slice(0, 8)}...</span>` },
  { accessorKey: 'startDate', header: 'Start Date', cell: (row) => formatDate((row as any).original.startDate) },
  { accessorKey: 'endDate', header: 'End Date', cell: (row) => formatDate((row as any).original.endDate) },
  { accessorKey: 'totalDepreciableCost', header: 'Total Depreciable', cell: (row) => `<span class="text-right">${formatCurrency((row as any).original.totalDepreciableCost)}</span>` },
  { accessorKey: 'monthlyAmount', header: 'Monthly Amount', cell: (row) => `<span class="text-right font-medium">${formatCurrency((row as any).original.monthlyAmount)}</span>` },
  { accessorKey: 'method', header: 'Method', cell: (row) => methodLabel((row as any).original.method) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => `<Badge variant="secondary">${(row as any).original.status}</Badge>`,
  },
];
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Depreciation Schedules</h1>
    <p class="text-muted-foreground">{data.total} schedules</p>
  </div>

  <AppDataTable
    {columns}
    data={data.schedules}
    emptyMessage="No schedules found"
    pageSize={20}
    totalItems={data.total}
  />
</div>
