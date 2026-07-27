<script lang="ts">
import { toast } from 'svelte-sonner';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import * as Select from '$lib/components/ui/select';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import type { PageData } from './$types';
import { badgeVariants } from '$lib/components/ui/badge';

let { data }: { data: PageData } = $props();

function getTypeVariant(type: string): 'secondary' | 'destructive' {
  return type === 'credit' ? 'secondary' : 'destructive';
}

function getStatusVariant(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'auto_matched': return 'secondary';
    case 'disputed': return 'outline';
    case 'excluded': return 'destructive';
    case 'manually_matched': return 'default';
    case 'unmatched': return 'outline';
    default: return 'outline';
  }
}

let bankAccountId = $state('');

async function handleAction(action: string, id: string) {
  const response = await fetch(`/cash/reconciliation-entries/${id}/${action}`, { method: 'POST' });
  if (response.ok) {
    toast.success(`Entry ${action}d successfully`);
    window.location.reload();
  } else {
    toast.error(`Failed to ${action} entry`);
  }
}

const columns: ColumnDef<any, any>[] = [
  {
    accessorKey: 'transactionDate',
    header: 'Date',
    cell: ({ row }) => `<span class="text-muted-foreground">${formatDate((row as any).original.transactionDate)}</span>`,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => `<span class="font-medium">${(row as any).original.description}</span>`,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => `<span class="${badgeVariants({ variant: getTypeVariant((row as any).original.type) })}">${(row as any).original.type}</span>`,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const color = (row as any).original.type === 'credit' ? 'text-green-600' : 'text-red-600';
      const prefix = (row as any).original.type === 'credit' ? '+' : '-';
      return `<span class="text-right font-medium ${color}">${prefix}${formatCurrency((row as any).original.amount)}</span>`;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => `<span class="${badgeVariants({ variant: getStatusVariant((row as any).original.status) })}">${(row as any).original.status.replace('_', ' ')}</span>`,
  },
];
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Reconciliation</h1>
    <p class="text-muted-foreground">Match bank statement entries with journal entries</p>
  </div>

  <div class="flex items-center gap-4">
    <Select.Root bind:value={bankAccountId}>
      <Select.Trigger class="w-full">
        <Select.Value placeholder="All Accounts" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="">All Accounts</Select.Item>
        {#each data.accounts as account}
          <Select.Item value={account.id}>{account.name}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>

  <AppDataTable
    {columns}
    data={data.entries}
    emptyMessage="No reconciliation entries found."
  />
</div>
