<script lang="ts">
	import { goto } from '$app/navigation';
	import type { FiscalYearStatus } from '$lib/types';
	import { formatDate } from '$lib/utils/format';
	import { Button } from '$lib/components/ui/button';
	import { badgeVariants } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import AppDataTable from '$lib/components/data/AppDataTable.svelte';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function statusVariant(status: FiscalYearStatus): 'secondary' | 'outline' {
		return status === 'open' ? 'secondary' : 'outline';
	}

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
				const variant = statusVariant((row as any).original.status as FiscalYearStatus);
				return `<span class="${badgeVariants({ variant })}">${(row as any).original.status}</span>`;
			},
		},
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Fiscal Years</h1>
			<p class="mt-1 text-muted-foreground">Manage fiscal year periods and closing</p>
		</div>
		<Button href="/financial/fiscal-years/new">New Fiscal Year</Button>
	</div>

	<Card.Root>
		<Card.Content>
			<AppDataTable
				{columns}
				data={data.fiscalYears}
				emptyMessage="No fiscal years found"
				pageSize={20}
				totalItems={data.fiscalYears.length}
				onRowClick={(row) => goto(`/financial/fiscal-years/${row.id}`)}
			/>
		</Card.Content>
	</Card.Root>

	<div class="text-sm text-muted-foreground">
		Showing {data.fiscalYears.length} fiscal year{data.fiscalYears.length !== 1 ? 's' : ''}
	</div>
</div>
