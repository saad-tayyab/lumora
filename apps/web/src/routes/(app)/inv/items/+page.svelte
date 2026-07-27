<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatCurrency } from '$lib/utils/format';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { badgeVariants } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
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
		cell: ({ row }) => `<span class="${badgeVariants({ variant: (row as any).original.status === 'active' ? 'secondary' : 'outline' })}">${(row as any).original.status}</span>`,
		},
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Items</h1>
			<p class="text-muted-foreground">Manage your inventory items</p>
		</div>
		<Button href="/inv/items/new">Add Item</Button>
	</div>

	<Card.Root>
		<Card.Content>
			<div class="flex items-center gap-4 border-b pb-4">
				<Input
					type="text"
					placeholder="Search items by name or SKU..."
					class="max-w-sm"
				/>
			<Select.Root>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="All Categories" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="">All Categories</Select.Item>
				</Select.Content>
			</Select.Root>
			</div>
			<AppDataTable
				{columns}
				data={data.items}
				emptyMessage="No items found"
				pageSize={20}
				onRowClick={(row) => goto(`/inv/items/${row.id}`)}
			/>
		</Card.Content>
	</Card.Root>
</div>
