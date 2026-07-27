<script lang="ts">
import { goto } from '$app/navigation';
import { listInvoices } from '$lib/api/ar';
import type { Invoice } from '$lib/types';
import { formatCurrency, formatDate } from '$lib/utils/format';
import * as Select from '$lib/components/ui/select';
import { Button } from '$lib/components/ui/button';
import { badgeVariants } from '$lib/components/ui/badge';
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

function getStatusVariant(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'paid': return 'secondary';
    case 'overdue': return 'destructive';
    case 'sent': return 'default';
    case 'draft': return 'outline';
    default: return 'outline';
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
    cell: ({ row }) => `<span class="${badgeVariants({ variant: getStatusVariant((row as any).original.status) })}">${(row as any).original.status}</span>`,
  },
];
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Invoices</h1>
			<p class="text-muted-foreground">Manage customer invoices</p>
		</div>
		<Button href="/ar/invoices/new">Create Invoice</Button>
	</div>

	<div class="flex items-center gap-4">
		<label for="status" class="text-sm font-medium text-foreground">Status:</label>
		<Select.Root bind:value={statusFilter}>
			<Select.Trigger class="w-full">
				<Select.Value placeholder="All" />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="">All</Select.Item>
				<Select.Item value="draft">Draft</Select.Item>
				<Select.Item value="sent">Sent</Select.Item>
				<Select.Item value="paid">Paid</Select.Item>
				<Select.Item value="overdue">Overdue</Select.Item>
				<Select.Item value="voided">Voided</Select.Item>
			</Select.Content>
		</Select.Root>
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
