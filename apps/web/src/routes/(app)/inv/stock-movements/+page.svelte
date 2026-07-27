<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatDateTime } from '$lib/utils/format';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import AppDataTable from '$lib/components/data/AppDataTable.svelte';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const movementTypeColor: Record<string, string> = {
		in: 'bg-green-100 text-green-800',
		out: 'bg-red-100 text-red-800',
		transfer: 'bg-blue-100 text-blue-800',
		adjustment: 'bg-yellow-100 text-yellow-800',
	};

	const columns: ColumnDef<(typeof data.movements)[number], any>[] = [
		{
			accessorKey: 'createdAt',
			header: 'Date',
			cell: ({ row }) =>
				`<span class="text-muted-foreground">${formatDateTime((row as any).original.createdAt)}</span>`,
		},
		{
			accessorKey: 'itemName',
			header: 'Item',
			cell: ({ row }) =>
				`<span class="font-medium">${(row as any).original.itemName || '-'}</span><span class="text-xs text-muted-foreground ml-1">(${(row as any).original.itemSku || '-'})</span>`,
		},
		{
			accessorKey: 'warehouseName',
			header: 'Warehouse',
			cell: ({ row }) =>
				`<span class="text-muted-foreground">${(row as any).original.warehouseName || '-'}</span>`,
		},
		{
			accessorKey: 'type',
			header: 'Type',
			cell: ({ row }) => {
				const cls = movementTypeColor[(row as any).original.type] || 'bg-gray-100 text-gray-800';
				return `<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}">${(row as any).original.type}</span>`;
			},
		},
		{
			accessorKey: 'quantity',
			header: 'Quantity',
			cell: ({ row }) => {
				const colorClass = (row as any).original.type === 'out' ? 'text-red-600' : 'text-green-600';
				const sign = (row as any).original.type === 'out' ? '-' : '+';
				return `<span class="font-medium ${colorClass}">${sign}${(row as any).original.quantity}</span>`;
			},
		},
		{
			accessorKey: 'referenceType',
			header: 'Reference',
			cell: ({ row }) => {
				const ref = (row as any).original.referenceType || '-';
				const refId = (row as any).original.referenceId
					? ` #${(row as any).original.referenceId.slice(0, 8)}`
					: '';
				return `<span class="text-muted-foreground">${ref}${refId}</span>`;
			},
		},
		{
			accessorKey: 'notes',
			header: 'Notes',
			cell: ({ row }) =>
				`<span class="text-muted-foreground max-w-[200px] truncate inline-block">${(row as any).original.notes || '-'}</span>`,
		},
	];
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Stock Movements</h1>
			<p class="text-muted-foreground">Track inventory movements</p>
		</div>
		<Button href="/inv/stock-movements/new">Record Movement</Button>
	</div>

	<Card>
		<CardContent>
			<AppDataTable
				{columns}
				data={data.movements}
				emptyMessage="No stock movements found"
				pageSize={20}
				onRowClick={(row) => goto(`/inv/stock-movements/${row.id}`)}
			/>
		</CardContent>
	</Card>
</div>
