<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent } from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let showDeleteConfirm = $state(false);
let deleting = $state(false);
</script>

<div class="mx-auto max-w-4xl space-y-6">
	<nav class="mb-4 text-sm text-muted-foreground">
		<a href="/tax/rates" class="hover:underline">Tax Rates</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">Tax Rate Details</span>
	</nav>

	{#if data.rate}
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-foreground">Tax Rate</h1>
				<p class="text-muted-foreground">{(parseFloat(data.rate.rate) * 100).toFixed(2)}% rate</p>
			</div>
			<div class="flex gap-2">
				<Button variant="destructive" onclick={() => (showDeleteConfirm = true)}>Delete</Button>
			</div>
		</div>

		<Card>
			<CardContent>
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Rate Details</h2>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Tax Code</dt>
						<dd class="text-sm font-medium">{data.rate.taxCodeId}</dd>
					</div>
					<div class="flex justify-between border-t pt-3">
						<dt class="text-sm font-medium text-card-foreground">Rate</dt>
						<dd class="text-lg font-bold">{(parseFloat(data.rate.rate) * 100).toFixed(2)}%</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Effective Date</dt>
						<dd class="text-sm font-medium">{formatDate(data.rate.effectiveDate)}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Expiry Date</dt>
						<dd class="text-sm font-medium">{data.rate.expiryDate ? formatDate(data.rate.expiryDate) : 'None'}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Status</dt>
						<dd>
							<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {data.rate.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
								{data.rate.isActive ? 'Active' : 'Inactive'}
							</span>
						</dd>
					</div>
					{#if data.rate.description}
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Description</dt>
							<dd class="text-sm font-medium">{data.rate.description}</dd>
						</div>
					{/if}
				</dl>
			</CardContent>
		</Card>
	{:else}
		<div class="py-12 text-center text-muted-foreground">Tax rate not found</div>
	{/if}
</div>

{#if showDeleteConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="mx-4 w-full max-w-sm rounded-lg bg-card p-6 shadow-lg">
			<h3 class="text-lg font-semibold text-card-foreground">Delete Tax Rate</h3>
			<p class="mt-2 text-sm text-muted-foreground">
				Are you sure you want to delete this tax rate? This action cannot be undone.
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
								toast.success('Tax rate deleted');
								goto('/tax/rates');
							} else {
								toast.error('Failed to delete tax rate');
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
