<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Card, CardContent } from '$lib/components/ui/card';
	import AppDataTable from '$lib/components/data/AppDataTable.svelte';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const statusBadgeColors: Record<string, string> = {
		draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
		posted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		voided: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
	};

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
				const cls = statusBadgeColors[(row as any).original.status] || '';
				return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}">${(row as any).original.status}</span>`;
			},
		},
	];
</script>

<div class="space-y-6">
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
		<select
			bind:value={filterStatus}
			class="rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
		>
			<option value="">All Statuses</option>
			<option value="draft">Draft</option>
			<option value="posted">Posted</option>
			<option value="voided">Voided</option>
		</select>
	</div>

	<Card>
		<CardContent>
			<AppDataTable
				{columns}
				data={filteredEntries}
				emptyMessage="No journal entries found"
				pageSize={20}
				totalItems={data.entries.length}
				onRowClick={(row) => goto(`/financial/journal-entries/${row.id}`)}
			/>
		</CardContent>
	</Card>

	<div class="text-sm text-muted-foreground">
		Showing {filteredEntries.length} of {data.entries.length} entries
	</div>
</div>
