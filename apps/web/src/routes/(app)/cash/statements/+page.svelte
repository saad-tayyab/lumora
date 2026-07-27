<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import { badgeVariants } from '$lib/components/ui/badge';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

function getStatusVariant(status: string): 'secondary' | 'outline' {
  return status === 'reconciled' ? 'secondary' : 'outline';
}

const columns: ColumnDef<any, any>[] = [
  {
    accessorKey: 'bankAccountName',
    header: 'Bank Account',
    cell: ({ row }) => `<span class="font-medium">${(row as any).original.bankAccountName || '—'}</span>`,
  },
  {
    accessorKey: 'statementDate',
    header: 'Statement Date',
    cell: ({ row }) => `<span class="text-muted-foreground">${formatDate((row as any).original.statementDate)}</span>`,
  },
  {
    accessorKey: 'openingBalance',
    header: 'Opening Balance',
    cell: ({ row }) => `<span class="text-right">${formatCurrency((row as any).original.openingBalance)}</span>`,
  },
  {
    accessorKey: 'closingBalance',
    header: 'Closing Balance',
    cell: ({ row }) => `<span class="text-right font-medium">${formatCurrency((row as any).original.closingBalance)}</span>`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => `<span class="${badgeVariants({ variant: getStatusVariant((row as any).original.status) })}">${(row as any).original.status}</span>`,
  },
  {
    accessorKey: 'id',
    header: 'Actions',
    cell: ({ row }) => `<a href="/cash/reconciliation?statementId=${(row as any).original.id}" class="text-primary hover:underline">Reconcile</a>`,
  },
];
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Bank Statements</h1>
    <p class="text-muted-foreground">Manage bank statements for reconciliation</p>
  </div>

  <AppDataTable
    {columns}
    data={data.statements}
    emptyMessage="No statements found."
  />
</div>
