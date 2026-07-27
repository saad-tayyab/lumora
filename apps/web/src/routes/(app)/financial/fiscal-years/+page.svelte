<script lang="ts">
	import { goto } from '$app/navigation';
	import type { FiscalYearStatus } from '$lib/types';
	import { formatDate } from '$lib/utils/format';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import AppDataTable from '$lib/components/data/AppDataTable.svelte';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const statusBadgeColors: Record<FiscalYearStatus, string> = {
		open: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
	};

	const columns: ColumnDef<(typeof data.fiscalYears)[number], any>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) => `<span class="font-medium">${(row as any).original.name}</span>`,
		},
		{
			accessorKey: 'startDate',
			header: 'Start Date',
			cell: ({ row }) => formatDate((row as any).original.startDate),
		},
		{
			accessorKey: 'endDate',
			header: 'End Date',
			cell: ({ row }) => formatDate((row as any).original.endDate),
		},
		{
			accessorKey: 'status',
			header: 'Status',
			cell: ({ row }) => {
				const cls = statusBadgeColors[(row as any).original.status as FiscalYearStatus] || '';
				return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}">${(row as any).original.status}</span>`;
			},
		},
	];
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Fiscal Years</h1>
			<p class="mt-1 text-muted-foreground">Manage fiscal year periods and closing</p>
		</div>
		<Button href="/financial/fiscal-years/new">New Fiscal Year</Button>
	</div>

	<Card>
		<CardContent>
			<AppDataTable
				{columns}
				data={data.fiscalYears}
				emptyMessage="No fiscal years found"
				pageSize={20}
				totalItems={data.fiscalYears.length}
				onRowClick={(row) => goto(`/financial/fiscal-years/${row.id}`)}
			/>
		</CardContent>
	</Card>

	<div class="text-sm text-muted-foreground">
		Showing {data.fiscalYears.length} fiscal year{data.fiscalYears.length !== 1 ? 's' : ''}
	</div>
</div>
