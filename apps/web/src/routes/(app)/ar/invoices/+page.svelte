<script lang="ts">
import { goto } from '$app/navigation';
import { listInvoices } from '$lib/api/ar';
import type { Invoice } from '$lib/types';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let invoices = $state<Invoice[]>([]);
let loading = $state(true);
let error = $state<string | null>(null);
let total = $state(0);
let page = $state(0);
let statusFilter = $state('');
const limit = 20;

async function load() {
  loading = true;
  error = null;
  try {
    const params: { limit: number; offset: number; status?: string } = {
      limit,
      offset: page * limit,
    };
    if (statusFilter) params.status = statusFilter;
    const res = await listInvoices(params);
    invoices = res.data;
    total = res.total;
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Failed to load invoices';
  } finally {
    loading = false;
  }
}

$effect(() => {
  void statusFilter;
  page = 0;
  load();
});

function getStatusColor(status: string): string {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    default: return 'bg-gray-100 text-gray-800';
  }
}

const columns: ColumnDef<Invoice, any>[] = [
  {
    accessorKey: 'invoiceNumber',
    header: 'Invoice #',
    cell: ({ row }) => `<a href="/ar/invoices/${(row as any).original.id}" class="font-medium text-primary hover:underline">${(row as any).original.invoiceNumber}</a>`,
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
    accessorKey: 'totalAmount',
    header: 'Total',
    cell: ({ row }) => `<span class="text-right">${formatCurrency((row as any).original.totalAmount)}</span>`,
  },
  {
    accessorKey: 'balanceDue',
    header: 'Balance Due',
    cell: ({ row }) => `<span class="text-right">${formatCurrency((row as any).original.balanceDue)}</span>`,
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
			<h1 class="text-3xl font-bold text-foreground">Invoices</h1>
			<p class="text-muted-foreground">Manage customer invoices</p>
		</div>
		<Button href="/ar/invoices/new">Create Invoice</Button>
	</div>

	<div class="flex items-center gap-4">
		<label for="status" class="text-sm font-medium text-foreground">Status:</label>
		<select
			id="status"
			bind:value={statusFilter}
			class="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
		>
			<option value="">All</option>
			<option value="draft">Draft</option>
			<option value="sent">Sent</option>
			<option value="paid">Paid</option>
			<option value="overdue">Overdue</option>
			<option value="voided">Voided</option>
		</select>
	</div>

	{#if error}
		<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
			{error}
		</div>
	{/if}

	<AppDataTable
		{columns}
		data={invoices}
		{loading}
		emptyMessage="No invoices found."
		pageSize={limit}
		totalItems={total}
		onRowClick={(row) => goto(`/ar/invoices/${row.id}`)}
	/>
</div>
