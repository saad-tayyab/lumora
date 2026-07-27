<script lang="ts">
import { goto } from '$app/navigation';
import { listPayments } from '$lib/api/ar';
import type { Payment } from '$lib/types';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let payments = $state<Payment[]>([]);
let loading = $state(true);
let error = $state<string | null>(null);
let total = $state(0);
let page = $state(0);
const limit = 20;

async function load() {
  loading = true;
  error = null;
  try {
    const res = await listPayments({ limit, offset: page * limit });
    payments = res.data;
    total = res.total;
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Failed to load payments';
  } finally {
    loading = false;
  }
}

$effect(() => {
  load();
});

const columns: ColumnDef<Payment, any>[] = [
  {
    accessorKey: 'paymentNumber',
    header: 'Payment #',
    cell: ({ row }) => `<span class="font-medium text-card-foreground">${(row as any).original.paymentNumber}</span>`,
  },
  {
    accessorKey: 'paymentDate',
    header: 'Date',
    cell: ({ row }) => `<span class="text-muted-foreground">${formatDate((row as any).original.paymentDate)}</span>`,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => `<span class="text-right font-medium text-card-foreground">${formatCurrency((row as any).original.amount)}</span>`,
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Method',
    cell: ({ row }) => `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">${(row as any).original.paymentMethod.replace('_', ' ')}</span>`,
  },
  {
    accessorKey: 'referenceNumber',
    header: 'Reference',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.referenceNumber || '—'}</span>`,
  },
];
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Payments</h1>
			<p class="text-muted-foreground">Customer payment history</p>
		</div>
		<Button href="/ar/payments/new">Record Payment</Button>
	</div>

	{#if error}
		<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
			{error}
		</div>
	{/if}

	<AppDataTable
		{columns}
		data={payments}
		{loading}
		emptyMessage="No payments found."
		pageSize={limit}
		totalItems={total}
		onRowClick={(row) => goto(`/ar/payments/${row.id}`)}
	/>
</div>
