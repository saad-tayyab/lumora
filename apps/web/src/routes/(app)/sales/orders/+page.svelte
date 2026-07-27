<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { type SalesOrder, salesApi } from '$lib/api/sales';
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import AppDataTable from '$lib/components/data/AppDataTable.svelte';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let { data }: { data: PageData } = $props();
	let orders = $state<SalesOrder[]>(data.orders);
	let total = $state(data.total);
	let statusFilter = $state('');
	let loading = $state(false);

	function orderStatusColor(status: string): string {
		const colors: Record<string, string> = {
			draft: 'bg-gray-100 text-gray-800',
			confirmed: 'bg-blue-100 text-blue-800',
			processing: 'bg-yellow-100 text-yellow-800',
			shipped: 'bg-purple-100 text-purple-800',
			delivered: 'bg-green-100 text-green-800',
			cancelled: 'bg-red-100 text-red-800',
			closed: 'bg-gray-100 text-gray-800',
		};
		return colors[status] || 'bg-gray-100 text-gray-800';
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
				const cls = orderStatusColor((row as any).original.status);
				return `<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}">${formatStatus((row as any).original.status)}</span>`;
			},
		},
	];

	$effect(() => {
		statusFilter;
		filterByStatus();
	});
</script>

<div class="space-y-6">
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
		<select
			bind:value={statusFilter}
			class="rounded-md border bg-background px-3 py-2 text-sm"
		>
			<option value="">All Statuses</option>
			<option value="draft">Draft</option>
			<option value="confirmed">Confirmed</option>
			<option value="processing">Processing</option>
			<option value="shipped">Shipped</option>
			<option value="delivered">Delivered</option>
			<option value="cancelled">Cancelled</option>
		</select>
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
