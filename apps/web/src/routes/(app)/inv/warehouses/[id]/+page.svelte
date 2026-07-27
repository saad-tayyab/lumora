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

<div class="mx-auto max-w-4xl flex flex-col gap-6">
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
			<Card.Root>
				<Card.Header>
					<Card.Title>Warehouse Details</Card.Title>
				</Card.Header>
				<Card.Content>
					<dl class="flex flex-col gap-3">
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
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Status & Info</Card.Title>
				</Card.Header>
				<Card.Content>
					<dl class="flex flex-col gap-3">
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Status</dt>
							<dd>
								<Badge variant={data.warehouse.status === 'active' ? 'secondary' : 'outline'}>
									{data.warehouse.status}
								</Badge>
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
				</Card.Content>
			</Card.Root>
		</div>
	{:else}
		<div class="py-12 text-center text-muted-foreground">Warehouse not found</div>
	{/if}
</div>

<Dialog.Root bind:open={showDeleteConfirm}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Warehouse</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete "{data.warehouse?.name}"? This action cannot be undone.
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
	</Dialog.Content>
</Dialog.Root>
