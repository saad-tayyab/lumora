<script lang="ts">
import { goto } from '$app/navigation';
import { listCreditNotes } from '$lib/api/ar';
import type { CreditNote } from '$lib/types';
import { formatCurrency, formatDate } from '$lib/utils/format';
import * as Select from '$lib/components/ui/select';
import { Button } from '$lib/components/ui/button';
import { badgeVariants } from '$lib/components/ui/badge';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let creditNotes = $state<CreditNote[]>([]);
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
    const res = await listCreditNotes(params);
    creditNotes = res.data;
    total = res.total;
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Failed to load credit notes';
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
    case 'issued': return 'default';
    case 'applied': return 'secondary';
    case 'draft': return 'outline';
    case 'voided': return 'outline';
    default: return 'outline';
  }
}

const columns: ColumnDef<CreditNote, any>[] = [
  {
    accessorKey: 'creditNoteNumber',
    header: 'Credit Note #',
    cell: ({ row }) => `<a href="/ar/credit-notes/${(row as any).original.id}" class="font-medium text-primary hover:underline">${(row as any).original.creditNoteNumber}</a>`,
  },
  {
    accessorKey: 'issueDate',
    header: 'Issue Date',
    cell: ({ row }) => `<span class="text-muted-foreground">${formatDate((row as any).original.issueDate)}</span>`,
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.reason}</span>`,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => `<span class="text-right">${formatCurrency((row as any).original.amount)}</span>`,
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    cell: ({ row }) => `<span class="text-right">${formatCurrency((row as any).original.balance)}</span>`,
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
			<h1 class="text-3xl font-bold text-foreground">Credit Notes</h1>
			<p class="text-muted-foreground">Manage customer credit notes</p>
		</div>
		<Button href="/ar/credit-notes/new">Create Credit Note</Button>
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
				<Select.Item value="issued">Issued</Select.Item>
				<Select.Item value="applied">Applied</Select.Item>
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
		data={creditNotes}
		{loading}
		emptyMessage="No credit notes found."
		pageSize={limit}
		totalItems={total}
		onRowClick={(row) => goto(`/ar/credit-notes/${row.id}`)}
	/>
</div>
