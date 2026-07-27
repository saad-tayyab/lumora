<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatCurrency } from '$lib/utils/format';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Card, CardContent } from '$lib/components/ui/card';
	import AppDataTable from '$lib/components/data/AppDataTable.svelte';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const columns: ColumnDef<(typeof data.items)[number], any>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) =>
				`<a href="/inv/items/${(row as any).original.id}" class="font-medium text-primary hover:underline">${(row as any).original.name}</a>`,
		},
		{ accessorKey: 'sku', header: 'SKU' },
		{
			accessorKey: 'categoryName',
			header: 'Category',
			cell: ({ row }) => (row as any).original.categoryName || '-',
		},
		{ accessorKey: 'unitOfMeasure', header: 'UoM' },
		{
			accessorKey: 'costPrice',
			header: 'Cost Price',
			cell: ({ row }) => formatCurrency((row as any).original.costPrice),
		},
		{
			accessorKey: 'salePrice',
			header: 'Sale Price',
			cell: ({ row }) =>
				`<span class="font-medium">${formatCurrency((row as any).original.salePrice)}</span>`,
		},
		{
			accessorKey: 'status',
			header: 'Status',
			cell: ({ row }) => {
				const cls =
					(row as any).original.status === 'active'
						? 'bg-green-100 text-green-800'
						: 'bg-gray-100 text-gray-800';
				return `<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}">${(row as any).original.status}</span>`;
			},
		},
	];
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Items</h1>
			<p class="text-muted-foreground">Manage your inventory items</p>
		</div>
		<Button href="/inv/items/new">Add Item</Button>
	</div>

	<Card>
		<CardContent>
			<div class="flex items-center gap-4 border-b pb-4">
				<Input
					type="text"
					placeholder="Search items by name or SKU..."
					class="max-w-sm"
				/>
				<select
					class="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
				>
					<option value="">All Categories</option>
				</select>
			</div>
			<AppDataTable
				{columns}
				data={data.items}
				emptyMessage="No items found"
				pageSize={20}
				onRowClick={(row) => goto(`/inv/items/${row.id}`)}
			/>
		</CardContent>
	</Card>
</div>
