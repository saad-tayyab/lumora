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
		<a href="/inv/warehouses" class="hover:underline">Warehouses</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">{data.warehouse?.name || ''}</span>
	</nav>

	{#if data.warehouse}
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-foreground">{data.warehouse.name}</h1>
				<p class="text-muted-foreground">Warehouse details</p>
			</div>
			<div class="flex gap-2">
				<Button href="/inv/warehouses/{data.warehouse.id}/edit" variant="outline">Edit</Button>
				<Button variant="destructive" onclick={() => (showDeleteConfirm = true)}>Delete</Button>
			</div>
		</div>

		<div class="grid gap-6 lg:grid-cols-2">
			<Card>
				<CardContent>
					<h2 class="mb-4 text-lg font-semibold text-card-foreground">Warehouse Details</h2>
					<dl class="space-y-3">
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Name</dt>
							<dd class="text-sm font-medium">{data.warehouse.name}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Code</dt>
							<dd class="text-sm font-mono font-medium">{data.warehouse.code}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">City</dt>
							<dd class="text-sm font-medium">{data.warehouse.city || '-'}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Country</dt>
							<dd class="text-sm font-medium">{data.warehouse.country || '-'}</dd>
						</div>
					</dl>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<h2 class="mb-4 text-lg font-semibold text-card-foreground">Status & Info</h2>
					<dl class="space-y-3">
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Status</dt>
							<dd>
								<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {data.warehouse.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
									{data.warehouse.status}
								</span>
							</dd>
						</div>
						{#if data.warehouse.address}
							<div class="flex justify-between">
								<dt class="text-sm text-muted-foreground">Address</dt>
								<dd class="text-sm font-medium">{data.warehouse.address}</dd>
							</div>
						{/if}
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Created</dt>
							<dd class="text-sm font-medium">{formatDate(data.warehouse.createdAt)}</dd>
						</div>
					</dl>
				</CardContent>
			</Card>
		</div>
	{:else}
		<div class="py-12 text-center text-muted-foreground">Warehouse not found</div>
	{/if}
</div>

{#if showDeleteConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="mx-4 w-full max-w-sm rounded-lg bg-card p-6 shadow-lg">
			<h3 class="text-lg font-semibold text-card-foreground">Delete Warehouse</h3>
			<p class="mt-2 text-sm text-muted-foreground">
				Are you sure you want to delete "{data.warehouse?.name}"? This action cannot be undone.
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
								toast.success('Warehouse deleted');
								goto('/inv/warehouses');
							} else {
								toast.error('Failed to delete warehouse');
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
