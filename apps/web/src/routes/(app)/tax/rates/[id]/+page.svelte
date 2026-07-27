<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { Badge } from '$lib/components/ui/badge';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
import * as Dialog from '$lib/components/ui/dialog';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let showDeleteConfirm = $state(false);
let deleting = $state(false);
</script>

<div class="flex flex-col mx-auto max-w-4xl gap-6">
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

		<Card.Root>
			<Card.Header>
				<Card.Title>Rate Details</Card.Title>
			</Card.Header>
			<Card.Content>
				<dl class="flex flex-col gap-3">
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
							<Badge variant={data.rate.isActive ? "secondary" : "outline"}>{data.rate.isActive ? 'Active' : 'Inactive'}</Badge>
						</dd>
					</div>
					{#if data.rate.description}
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Description</dt>
							<dd class="text-sm font-medium">{data.rate.description}</dd>
						</div>
					{/if}
				</dl>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="py-12 text-center text-muted-foreground">Tax rate not found</div>
	{/if}
</div>

<Dialog.Root bind:open={showDeleteConfirm}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Tax Rate</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this tax rate? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<div class="flex justify-end gap-3">
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
	</Dialog.Content>
</Dialog.Root>
