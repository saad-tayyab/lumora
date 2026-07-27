<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatDate } from '$lib/utils/format';
	import { Button } from '$lib/components/ui/button';
	import { badgeVariants } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import AppDataTable from '$lib/components/data/AppDataTable.svelte';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const columns: ColumnDef<(typeof data.warehouses)[number], any>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) => `<span class="font-medium">${(row as any).original.name}</span>`,
		},
		{ accessorKey: 'code', header: 'Code' },
		{
			accessorKey: 'city',
			header: 'City',
			cell: ({ row }) => (row as any).original.city || '-',
		},
		{
			accessorKey: 'country',
			header: 'Country',
			cell: ({ row }) => (row as any).original.country || '-',
		},
		{
			accessorKey: 'status',
			header: 'Status',
		cell: ({ row }) => `<span class="${badgeVariants({ variant: (row as any).original.status === 'active' ? 'secondary' : 'outline' })}">${(row as any).original.status}</span>`,
		},
		{
			accessorKey: 'createdAt',
			header: 'Created',
			cell: ({ row }) =>
				`<span class="text-muted-foreground">${formatDate((row as any).original.createdAt)}</span>`,
		},
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Warehouses</h1>
			<p class="text-muted-foreground">Manage warehouse locations</p>
		</div>
		<Button href="/inv/warehouses/new">Add Warehouse</Button>
	</div>

	<Card.Root>
		<Card.Content>
			<AppDataTable
				{columns}
				data={data.warehouses}
				emptyMessage="No warehouses found"
				pageSize={20}
				onRowClick={(row) => goto(`/inv/warehouses/${row.id}`)}
			/>
		</Card.Content>
	</Card.Root>
</div>
