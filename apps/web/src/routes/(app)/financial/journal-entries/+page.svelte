<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import { Button } from '$lib/components/ui/button';
	import { badgeVariants } from '$lib/components/ui/badge';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import AppDataTable from '$lib/components/data/AppDataTable.svelte';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function statusBadgeVariants(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'draft': return 'outline';
    case 'posted': return 'secondary';
    case 'voided': return 'destructive';
    default: return 'outline';
  }
}

	let search = $state('');
	let filterStatus = $state('');

	const filteredEntries = $derived(
		data.entries.filter((entry) => {
			const matchesSearch =
				!search ||
				entry.entryNumber.toLowerCase().includes(search.toLowerCase()) ||
				entry.description.toLowerCase().includes(search.toLowerCase());
			const matchesStatus = !filterStatus || entry.status === filterStatus;
			return matchesSearch && matchesStatus;
		}),
	);

	const columns: ColumnDef<(typeof data.entries)[number], any>[] = [
		{
			accessorKey: 'entryNumber',
			header: 'Entry #',
			cell: ({ row }) => `<span class="font-mono">${(row as any).original.entryNumber}</span>`,
		},
		{
			accessorKey: 'date',
			header: 'Date',
			cell: ({ row }) => formatDate((row as any).original.date),
		},
		{
			accessorKey: 'description',
			header: 'Description',
		},
		{
			accessorKey: 'status',
			header: 'Status',
			cell: ({ row }) => {
				const variant = statusBadgeVariants((row as any).original.status);
				return `<span class="${badgeVariants({ variant })}">${(row as any).original.status}</span>`;
			},
		},
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Journal Entries</h1>
			<p class="mt-1 text-muted-foreground">Record and manage double-entry transactions</p>
		</div>
		<Button href="/financial/journal-entries/new">New Entry</Button>
	</div>

	<div class="flex gap-3">
		<Input
			type="text"
			placeholder="Search by number or description..."
			bind:value={search}
			class="flex-1"
		/>
		<Select.Root bind:value={filterStatus}>
			<Select.Trigger class="w-full">
				<Select.Value placeholder="All Statuses" />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="">All Statuses</Select.Item>
				<Select.Item value="draft">Draft</Select.Item>
				<Select.Item value="posted">Posted</Select.Item>
				<Select.Item value="voided">Voided</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>

	<Card.Root>
		<Card.Content>
			<AppDataTable
				{columns}
				data={filteredEntries}
				emptyMessage="No journal entries found"
				pageSize={20}
				totalItems={data.entries.length}
				onRowClick={(row) => goto(`/financial/journal-entries/${row.id}`)}
			/>
		</Card.Content>
	</Card.Root>

	<div class="text-sm text-muted-foreground">
		Showing {filteredEntries.length} of {data.entries.length} entries
	</div>
</div>
