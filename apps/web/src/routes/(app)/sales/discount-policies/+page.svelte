<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { type DiscountPolicy, salesApi } from '$lib/api/sales';
	import { formatCurrency, formatDate, formatPercent } from '$lib/utils/format';
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import AppDataTable from '$lib/components/data/AppDataTable.svelte';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let { data }: { data: PageData } = $props();
	let policies = $state<DiscountPolicy[]>(data.policies);
	let total = $state(data.total);

	function typeLabel(type: string): string {
		const labels: Record<string, string> = {
			percentage: 'Percentage',
			fixed_amount: 'Fixed Amount',
			tiered: 'Tiered',
		};
		return labels[type] || type;
	}

	function typeColor(type: string): string {
		const colors: Record<string, string> = {
			percentage: 'bg-blue-100 text-blue-800',
			fixed_amount: 'bg-green-100 text-green-800',
			tiered: 'bg-purple-100 text-purple-800',
		};
		return colors[type] || 'bg-gray-100 text-gray-800';
	}

	const columns: ColumnDef<DiscountPolicy, any>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) => `<span class="font-medium">${(row as any).original.name}</span>`,
		},
		{
			accessorKey: 'type',
			header: 'Type',
			cell: ({ row }) => {
				const cls = typeColor((row as any).original.type);
				return `<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}">${typeLabel((row as any).original.type)}</span>`;
			},
		},
		{
			accessorKey: 'value',
			header: 'Value',
			cell: ({ row }) =>
				(row as any).original.type === 'percentage'
					? formatPercent((row as any).original.value)
					: formatCurrency((row as any).original.value),
		},
		{
			accessorKey: 'startDate',
			header: 'Start Date',
			cell: ({ row }) => formatDate((row as any).original.startDate),
		},
		{
			accessorKey: 'endDate',
			header: 'End Date',
			cell: ({ row }) =>
				(row as any).original.endDate ? formatDate((row as any).original.endDate) : '-',
		},
		{
			accessorKey: 'isActive',
			header: 'Active',
			cell: ({ row }) => {
				if ((row as any).original.isActive) {
					return '<span class="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Active</span>';
				}
				return '<span class="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">Inactive</span>';
			},
		},
	];

	async function deletePolicy(id: string) {
		if (!confirm('Are you sure you want to delete this discount policy?')) return;
		try {
			await salesApi.discountPolicies.delete(id);
			policies = policies.filter((p) => p.id !== id);
			total--;
			toast.success('Discount policy deleted');
		} catch {
			toast.error('Failed to delete discount policy');
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Discount Policies</h1>
			<p class="text-muted-foreground">Manage discount rules and promotions</p>
		</div>
		<Button href="/sales/discount-policies/new">New Discount Policy</Button>
	</div>

	<AppDataTable
		{columns}
		data={policies}
		emptyMessage="No discount policies found"
		pageSize={20}
		totalItems={total}
	/>
</div>
