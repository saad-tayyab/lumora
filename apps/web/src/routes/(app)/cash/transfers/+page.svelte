<script lang="ts">
import { goto } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    default: return 'bg-gray-100 text-gray-800';
  }
}

const columns: ColumnDef<any, any>[] = [
  {
    accessorKey: 'fromAccountName',
    header: 'From',
    cell: ({ row }) => `<span class="font-medium">${(row as any).original.fromAccountName || '—'}</span>`,
  },
  {
    accessorKey: 'toAccountName',
    header: 'To',
    cell: ({ row }) => `<span class="font-medium">${(row as any).original.toAccountName || '—'}</span>`,
  },
  {
    accessorKey: 'transferDate',
    header: 'Date',
    cell: ({ row }) => `<span class="text-muted-foreground">${formatDate((row as any).original.transferDate)}</span>`,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => `<span class="text-right font-medium">${formatCurrency((row as any).original.amount)}</span>`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor((row as any).original.status)}">${(row as any).original.status}</span>`,
  },
  {
    accessorKey: 'reference',
    header: 'Reference',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.reference || '—'}</span>`,
  },
];
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Transfers</h1>
      <p class="text-muted-foreground">Bank account transfers</p>
    </div>
    <Button href="/cash/transfers/new">New Transfer</Button>
  </div>

  <AppDataTable
    {columns}
    data={data.transfers}
    emptyMessage="No transfers found."
    onRowClick={(row) => goto(`/cash/transfers/${row.id}`)}
  />
</div>
