<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatDateTime } from '$lib/utils/format';
	import { Button } from '$lib/components/ui/button';
	import { badgeVariants } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import AppDataTable from '$lib/components/data/AppDataTable.svelte';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function movementTypeVariant(type: string): 'secondary' | 'destructive' | 'default' | 'outline' {
		switch (type) {
			case 'in': return 'secondary';
			case 'out': return 'destructive';
			case 'transfer': return 'default';
			case 'adjustment': return 'outline';
			default: return 'outline';
		}
	}

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
		cell: ({ row }) => `<span class="${badgeVariants({ variant: movementTypeVariant((row as any).original.type) })}">${(row as any).original.type}</span>`,
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

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Stock Movements</h1>
			<p class="text-muted-foreground">Track inventory movements</p>
		</div>
		<Button href="/inv/stock-movements/new">Record Movement</Button>
	</div>

	<Card.Root>
		<Card.Content>
			<AppDataTable
				{columns}
				data={data.movements}
				emptyMessage="No stock movements found"
				pageSize={20}
				onRowClick={(row) => goto(`/inv/stock-movements/${row.id}`)}
			/>
		</Card.Content>
	</Card.Root>
</div>
