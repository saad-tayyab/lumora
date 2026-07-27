<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { type SalesOrder, salesApi } from '$lib/api/sales';
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import AppDataTable from '$lib/components/data/AppDataTable.svelte';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let { data }: { data: PageData } = $props();
	let orders = $state<SalesOrder[]>(data.orders);
	let total = $state(data.total);
	let statusFilter = $state('');
	let loading = $state(false);

	function orderStatusVariant(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'cancelled': return 'destructive';
    case 'closed': return 'outline';
    case 'confirmed': return 'secondary';
    case 'delivered': return 'secondary';
    case 'draft': return 'outline';
    case 'processing': return 'outline';
    case 'shipped': return 'outline';
    default: return 'outline';
  }
}

	function formatStatus(status: string): string {
		return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
	}

	async function filterByStatus() {
		loading = true;
		try {
			const result = await salesApi.orders.list({
				status: statusFilter || undefined,
				limit: 20,
			});
			orders = result.data;
			total = result.total;
		} catch {
			toast.error('Failed to filter orders');
		} finally {
			loading = false;
		}
	}

	const columns: ColumnDef<SalesOrder, any>[] = [
		{
			accessorKey: 'orderNumber',
			header: 'Order #',
			cell: ({ row }) =>
				`<a href="/sales/orders/${(row as any).original.id}" class="font-medium text-primary hover:underline">${(row as any).original.orderNumber}</a>`,
		},
		{
			accessorKey: 'customerName',
			header: 'Customer',
		},
		{
			accessorKey: 'orderDate',
			header: 'Date',
			cell: ({ row }) => formatDate((row as any).original.orderDate),
		},
		{
			accessorKey: 'expectedDeliveryDate',
			header: 'Expected Delivery',
			cell: ({ row }) =>
				(row as any).original.expectedDeliveryDate
					? formatDate((row as any).original.expectedDeliveryDate)
					: '-',
		},
		{
			accessorKey: 'totalAmount',
			header: 'Amount',
			cell: ({ row }) =>
				`<span class="font-medium">${formatCurrency((row as any).original.totalAmount)}</span>`,
		},
		{
			accessorKey: 'status',
			header: 'Status',
			cell: ({ row }) => {
				const cls = orderStatusVariant((row as any).original.status);
				return `<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}">${formatStatus((row as any).original.status)}</span>`;
			},
		},
	];

	$effect(() => {
		statusFilter;
		filterByStatus();
	});
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Sales Orders</h1>
			<p class="text-muted-foreground">Manage customer sales orders</p>
		</div>
		<a
			href="/sales/orders/new"
			class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
		>
			New Sales Order
		</a>
	</div>

	<div class="flex items-center gap-4">
		<Select.Root bind:value={statusFilter}>
			<Select.Trigger class="w-full">
				<Select.Value placeholder="All Statuses" />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="">All Statuses</Select.Item>
				<Select.Item value="draft">Draft</Select.Item>
				<Select.Item value="confirmed">Confirmed</Select.Item>
				<Select.Item value="processing">Processing</Select.Item>
				<Select.Item value="shipped">Shipped</Select.Item>
				<Select.Item value="delivered">Delivered</Select.Item>
				<Select.Item value="cancelled">Cancelled</Select.Item>
			</Select.Content>
		</Select.Root>
		<span class="text-sm text-muted-foreground">{total} total</span>
	</div>

	<AppDataTable
		{columns}
		data={orders}
		{loading}
		emptyMessage="No sales orders found"
		pageSize={20}
		totalItems={total}
		onRowClick={(row) => goto(`/sales/orders/${row.id}`)}
	/>
</div>
