<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

function getStatusColor(status: string): string {
  return status === 'reconciled' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
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
    cell: ({ row }) => `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor((row as any).original.status)}">${(row as any).original.status}</span>`,
  },
  {
    accessorKey: 'id',
    header: 'Actions',
    cell: ({ row }) => `<a href="/cash/reconciliation?statementId=${(row as any).original.id}" class="text-primary hover:underline">Reconcile</a>`,
  },
];
</script>

<div class="space-y-6">
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
