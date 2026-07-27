<script lang="ts">
import { goto } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

let statusFilter = $state(data.statusFilter || '');

function getStatusColor(status: string): string {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    case 'pending_approval': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'partially_paid': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'voided': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800';
  }
}

const columns: ColumnDef<any, any>[] = [
  {
    accessorKey: 'billNumber',
    header: 'Bill #',
    cell: ({ row }) => `<a href="/ap/bills/${(row as any).original.id}" class="font-medium text-primary hover:underline">${(row as any).original.billNumber}</a>`,
  },
  {
    accessorKey: 'vendorName',
    header: 'Vendor',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.vendorName || '—'}</span>`,
  },
  {
    accessorKey: 'issueDate',
    header: 'Issue Date',
    cell: ({ row }) => `<span class="text-muted-foreground">${formatDate((row as any).original.issueDate)}</span>`,
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => `<span class="text-muted-foreground">${formatDate((row as any).original.dueDate)}</span>`,
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => `<span class="text-right font-medium">${formatCurrency((row as any).original.total)}</span>`,
  },
  {
    accessorKey: 'amountPaid',
    header: 'Amount Paid',
    cell: ({ row }) => `<span class="text-right text-muted-foreground">${formatCurrency((row as any).original.amountPaid)}</span>`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor((row as any).original.status)}">${(row as any).original.status.replace('_', ' ')}</span>`,
  },
];
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Bills</h1>
      <p class="text-muted-foreground">Manage vendor bills</p>
    </div>
    <Button href="/ap/bills/new">
      Record Bill
    </Button>
  </div>

  <div class="flex items-center gap-4">
    <Input
      type="text"
      placeholder="Search bills..."
      class="max-w-sm"
    />
    <select
      bind:value={statusFilter}
      class="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      onchange={() => {
        const url = new URL(window.location.href);
        if (statusFilter) {
          url.searchParams.set('status', statusFilter);
        } else {
          url.searchParams.delete('status');
        }
        window.location.href = url.toString();
      }}
    >
      <option value="">All Statuses</option>
      <option value="draft">Draft</option>
      <option value="pending_approval">Pending Approval</option>
      <option value="approved">Approved</option>
      <option value="partially_paid">Partially Paid</option>
      <option value="paid">Paid</option>
      <option value="voided">Voided</option>
    </select>
  </div>

  <AppDataTable
    {columns}
    data={data.bills}
    emptyMessage="No bills found."
    onRowClick={(row) => goto(`/ap/bills/${row.id}`)}
  />
</div>
