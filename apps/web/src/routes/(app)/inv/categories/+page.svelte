<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatDate } from '$lib/utils/format';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import AppDataTable from '$lib/components/data/AppDataTable.svelte';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const columns: ColumnDef<(typeof data.categories)[number], any>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) => `<span class="font-medium">${(row as any).original.name}</span>`,
		},
		{
			accessorKey: 'description',
			header: 'Description',
			cell: ({ row }) => (row as any).original.description || '-',
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
			<h1 class="text-3xl font-bold text-foreground">Item Categories</h1>
			<p class="text-muted-foreground">Organize your inventory items</p>
		</div>
		<Button href="/inv/categories/new">Add Category</Button>
	</div>

	<Card.Root>
		<Card.Content>
			<AppDataTable
				{columns}
				data={data.categories}
				emptyMessage="No categories found"
				pageSize={20}
				onRowClick={(row) => goto(`/inv/categories/${row.id}`)}
			/>
		</Card.Content>
	</Card.Root>
</div>
