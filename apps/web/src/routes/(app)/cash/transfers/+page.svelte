<script lang="ts">
import { goto } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { badgeVariants } from '$lib/components/ui/badge';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

function getStatusVariant(status: string): 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'pending': return 'outline';
    case 'processing': return 'outline';
    case 'completed': return 'secondary';
    case 'failed': return 'destructive';
    case 'cancelled': return 'outline';
    default: return 'outline';
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
    cell: ({ row }) => `<span class="${badgeVariants({ variant: getStatusVariant((row as any).original.status) })}">${(row as any).original.status}</span>`,
  },
  {
    accessorKey: 'reference',
    header: 'Reference',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.reference || '—'}</span>`,
  },
];
</script>

<div class="flex flex-col gap-6">
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
