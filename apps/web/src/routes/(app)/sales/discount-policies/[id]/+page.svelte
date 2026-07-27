<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { formatCurrency, formatDate, formatPercent } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent } from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let showDeleteConfirm = $state(false);
let deleting = $state(false);

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
</script>

<div class="mx-auto max-w-4xl space-y-6">
	<nav class="mb-4 text-sm text-muted-foreground">
		<a href="/sales/discount-policies" class="hover:underline">Discount Policies</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">{data.policy?.name || ''}</span>
	</nav>

	{#if data.policy}
		<div class="flex items-center justify-between">
			<div>
				<div class="flex items-center gap-3">
					<h1 class="text-3xl font-bold text-foreground">{data.policy.name}</h1>
					<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {typeColor(data.policy.type)}">{typeLabel(data.policy.type)}</span>
					{#if data.policy.isActive}
						<span class="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Active</span>
					{:else}
						<span class="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">Inactive</span>
					{/if}
				</div>
				<p class="text-muted-foreground">Discount policy details</p>
			</div>
			<div class="flex gap-2">
				<Button variant="destructive" onclick={() => (showDeleteConfirm = true)}>Delete</Button>
			</div>
		</div>

		<div class="grid gap-6 lg:grid-cols-2">
			<Card>
				<CardContent>
					<h2 class="mb-4 text-lg font-semibold text-card-foreground">Policy Details</h2>
					<dl class="space-y-3">
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Name</dt>
							<dd class="text-sm font-medium">{data.policy.name}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Type</dt>
							<dd>
								<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {typeColor(data.policy.type)}">{typeLabel(data.policy.type)}</span>
							</dd>
						</div>
						<div class="flex justify-between border-t pt-3">
							<dt class="text-sm font-medium text-card-foreground">Value</dt>
							<dd class="text-lg font-bold">
								{#if data.policy.type === 'percentage'}
									{formatPercent(data.policy.value)}
								{:else}
									{formatCurrency(data.policy.value)}
								{/if}
							</dd>
						</div>
						{#if data.policy.minQuantity}
							<div class="flex justify-between">
								<dt class="text-sm text-muted-foreground">Min Quantity</dt>
								<dd class="text-sm font-medium">{data.policy.minQuantity}</dd>
							</div>
						{/if}
						{#if data.policy.minAmount}
							<div class="flex justify-between">
								<dt class="text-sm text-muted-foreground">Min Amount</dt>
								<dd class="text-sm font-medium">{formatCurrency(data.policy.minAmount)}</dd>
							</div>
						{/if}
						{#if data.policy.maxDiscountAmount}
							<div class="flex justify-between">
								<dt class="text-sm text-muted-foreground">Max Discount</dt>
								<dd class="text-sm font-medium">{formatCurrency(data.policy.maxDiscountAmount)}</dd>
							</div>
						{/if}
					</dl>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<h2 class="mb-4 text-lg font-semibold text-card-foreground">Status & Info</h2>
					<dl class="space-y-3">
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Active</dt>
							<dd>
								<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {data.policy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
									{data.policy.isActive ? 'Yes' : 'No'}
								</span>
							</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Start Date</dt>
							<dd class="text-sm font-medium">{formatDate(data.policy.startDate)}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">End Date</dt>
							<dd class="text-sm font-medium">{data.policy.endDate ? formatDate(data.policy.endDate) : '-'}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Created</dt>
							<dd class="text-sm font-medium">{formatDate(data.policy.createdAt)}</dd>
						</div>
					</dl>
				</CardContent>
			</Card>
		</div>
	{:else}
		<div class="py-12 text-center text-muted-foreground">Discount policy not found</div>
	{/if}
</div>

{#if showDeleteConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="mx-4 w-full max-w-sm rounded-lg bg-card p-6 shadow-lg">
			<h3 class="text-lg font-semibold text-card-foreground">Delete Discount Policy</h3>
			<p class="mt-2 text-sm text-muted-foreground">
				Are you sure you want to delete "{data.policy?.name}"? This action cannot be undone.
			</p>
			<div class="mt-4 flex justify-end gap-3">
				<Button variant="outline" onclick={() => (showDeleteConfirm = false)}>Cancel</Button>
				<form
					method="POST"
					action="?/delete"
					use:enhance={() => {
						deleting = true;
						return async ({ result }) => {
							deleting = false;
							if (result.type === 'success') {
								toast.success('Discount policy deleted');
								goto('/sales/discount-policies');
							} else {
								toast.error('Failed to delete discount policy');
							}
							showDeleteConfirm = false;
						};
					}}
				>
					<Button type="submit" variant="destructive" disabled={deleting}>
						{deleting ? 'Deleting...' : 'Delete'}
					</Button>
				</form>
			</div>
		</div>
	</div>
{/if}
