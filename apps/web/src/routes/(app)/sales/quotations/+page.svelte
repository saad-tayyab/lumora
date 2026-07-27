<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { type Quotation, salesApi } from '$lib/api/sales';
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import AppDataTable from '$lib/components/data/AppDataTable.svelte';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let { data }: { data: PageData } = $props();
	let quotations = $state<Quotation[]>(data.quotations);
	let total = $state(data.total);
	let statusFilter = $state('');
	let loading = $state(false);

	function qtStatusVariant(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'accepted': return 'secondary';
    case 'cancelled': return 'destructive';
    case 'draft': return 'outline';
    case 'expired': return 'outline';
    case 'rejected': return 'destructive';
    case 'sent': return 'default';
    default: return 'outline';
  }
}

	function formatStatus(status: string): string {
		return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
	}

	async function filterByStatus() {
		loading = true;
		try {
			const result = await salesApi.quotations.list({
				status: statusFilter || undefined,
				limit: 20,
			});
			quotations = result.data;
			total = result.total;
		} catch {
			toast.error('Failed to filter quotations');
		} finally {
			loading = false;
		}
	}

	const columns: ColumnDef<Quotation, any>[] = [
		{
			accessorKey: 'quotationNumber',
			header: 'Quotation #',
			cell: ({ row }) =>
				`<a href="/sales/quotations/${(row as any).original.id}" class="font-medium text-primary hover:underline">${(row as any).original.quotationNumber}</a>`,
		},
		{
			accessorKey: 'customerName',
			header: 'Customer',
		},
		{
			accessorKey: 'quotationDate',
			header: 'Date',
			cell: ({ row }) => formatDate((row as any).original.quotationDate),
		},
		{
			accessorKey: 'validUntil',
			header: 'Valid Until',
			cell: ({ row }) =>
				(row as any).original.validUntil ? formatDate((row as any).original.validUntil) : '-',
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
				const cls = qtStatusVariant((row as any).original.status);
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
			<h1 class="text-3xl font-bold text-foreground">Quotations</h1>
			<p class="text-muted-foreground">Manage customer quotations</p>
		</div>
		<Button href="/sales/quotations/new">New Quotation</Button>
	</div>

	<div class="flex items-center gap-4">
		<Select.Root bind:value={statusFilter}>
			<Select.Trigger class="w-full">
				<Select.Value placeholder="All Statuses" />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="">All Statuses</Select.Item>
				<Select.Item value="draft">Draft</Select.Item>
				<Select.Item value="sent">Sent</Select.Item>
				<Select.Item value="accepted">Accepted</Select.Item>
				<Select.Item value="rejected">Rejected</Select.Item>
				<Select.Item value="expired">Expired</Select.Item>
				<Select.Item value="cancelled">Cancelled</Select.Item>
			</Select.Content>
		</Select.Root>
		<span class="text-sm text-muted-foreground">{total} total</span>
	</div>

	<AppDataTable
		{columns}
		data={quotations}
		{loading}
		emptyMessage="No quotations found"
		pageSize={20}
		totalItems={total}
		onRowClick={(row) => goto(`/sales/quotations/${row.id}`)}
	/>
</div>
