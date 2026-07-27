<script lang="ts">
import { toast } from 'svelte-sonner';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

function getTypeColor(type: string): string {
  return type === 'credit' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'unmatched': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    case 'auto_matched': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'manually_matched': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'excluded': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'disputed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default: return 'bg-gray-100 text-gray-800';
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
    cell: ({ row }) => `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor((row as any).original.type)}">${(row as any).original.type}</span>`,
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
    cell: ({ row }) => `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor((row as any).original.status)}">${(row as any).original.status.replace('_', ' ')}</span>`,
  },
];
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Reconciliation</h1>
    <p class="text-muted-foreground">Match bank statement entries with journal entries</p>
  </div>

  <div class="flex items-center gap-4">
    <select
      bind:value={bankAccountId}
      class="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      onchange={() => {
        const url = new URL(window.location.href);
        if (bankAccountId) {
          url.searchParams.set('bankAccountId', bankAccountId);
        } else {
          url.searchParams.delete('bankAccountId');
        }
        window.location.href = url.toString();
      }}
    >
      <option value="">All Accounts</option>
      {#each data.accounts as account}
        <option value={account.id}>{account.name}</option>
      {/each}
    </select>
  </div>

  <AppDataTable
    {columns}
    data={data.entries}
    emptyMessage="No reconciliation entries found."
  />
</div>
