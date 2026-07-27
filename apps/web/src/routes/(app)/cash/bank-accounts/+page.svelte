<script lang="ts">
import { goto } from '$app/navigation';
import { formatCurrency } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'frozen': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
}

const columns: ColumnDef<any, any>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => `<a href="/cash/bank-accounts/${(row as any).original.id}" class="font-medium text-primary hover:underline">${(row as any).original.name}</a>`,
  },
  {
    accessorKey: 'bankName',
    header: 'Bank',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.bankName}</span>`,
  },
  {
    accessorKey: 'accountNumber',
    header: 'Account #',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.accountNumber}</span>`,
  },
  {
    accessorKey: 'currency',
    header: 'Currency',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.currency}</span>`,
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    cell: ({ row }) => `<span class="text-right font-medium">${formatCurrency((row as any).original.balance, (row as any).original.currency)}</span>`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor((row as any).original.status)}">${(row as any).original.status}</span>`,
  },
];
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Bank Accounts</h1>
      <p class="text-muted-foreground">Manage your bank accounts</p>
    </div>
    <Button href="/cash/bank-accounts/new">Add Bank Account</Button>
  </div>

  <AppDataTable
    {columns}
    data={data.accounts}
    emptyMessage="No bank accounts found."
    onRowClick={(row) => goto(`/cash/bank-accounts/${row.id}`)}
  />
</div>
