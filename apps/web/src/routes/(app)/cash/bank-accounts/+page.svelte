<script lang="ts">
import { goto } from '$app/navigation';
import { formatCurrency } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { badgeVariants } from '$lib/components/ui/badge';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

function getStatusVariant(status: string): 'secondary' | 'default' | 'outline' {
  switch (status) {
    case 'active': return 'secondary';
    case 'frozen': return 'default';
    default: return 'outline';
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
    cell: ({ row }) => `<span class="${badgeVariants({ variant: getStatusVariant((row as any).original.status) })}">${(row as any).original.status}</span>`,
  },
];
</script>

<div class="flex flex-col gap-6">
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
