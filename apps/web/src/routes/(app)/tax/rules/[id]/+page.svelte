<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { Badge } from '$lib/components/ui/badge';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
import * as Dialog from '$lib/components/ui/dialog';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let showDeleteConfirm = $state(false);
let deleting = $state(false);
</script>

<div class="flex flex-col mx-auto max-w-4xl gap-6">
	<nav class="mb-4 text-sm text-muted-foreground">
		<a href="/tax/rules" class="hover:underline">Auto-Assignment Rules</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">{data.rule?.name || ''}</span>
	</nav>

	{#if data.rule}
		<div class="flex items-center justify-between">
			<div>
				<div class="flex items-center gap-3">
					<h1 class="text-3xl font-bold text-foreground">{data.rule.name}</h1>
					<Badge variant={data.rule.isActive ? "secondary" : "outline"}>{data.rule.isActive ? 'Active' : 'Inactive'}</Badge>
				</div>
				<p class="text-muted-foreground">Auto-assignment rule details</p>
			</div>
			<div class="flex gap-2">
				<Button variant="destructive" onclick={() => (showDeleteConfirm = true)}>Delete</Button>
			</div>
		</div>

		<Card.Root>
			<Card.Header>
				<Card.Title>Rule Details</Card.Title>
			</Card.Header>
			<Card.Content>
				<dl class="flex flex-col gap-3">
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Name</dt>
						<dd class="text-sm font-medium">{data.rule.name}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Priority</dt>
						<dd class="text-sm font-mono font-medium">{data.rule.priority}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Entity Type</dt>
						<dd class="text-sm font-medium">{data.rule.entityType}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Tax Code</dt>
						<dd class="text-sm font-medium">{data.rule.taxCodeId}</dd>
					</div>
					{#if data.rule.regionCode}
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Region</dt>
							<dd class="text-sm font-medium">{data.rule.regionCode}</dd>
						</div>
					{/if}
					{#if data.rule.description}
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Description</dt>
							<dd class="text-sm font-medium">{data.rule.description}</dd>
						</div>
					{/if}
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Status</dt>
						<dd>
							<Badge variant={data.rule.isActive ? "secondary" : "outline"}>{data.rule.isActive ? 'Active' : 'Inactive'}</Badge>
						</dd>
					</div>
				</dl>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="py-12 text-center text-muted-foreground">Tax rule not found</div>
	{/if}
</div>

<Dialog.Root bind:open={showDeleteConfirm}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Tax Rule</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete "{data.rule?.name}"? This action cannot be undone.
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
							toast.success('Tax rule deleted');
							goto('/tax/rules');
						} else {
							toast.error('Failed to delete tax rule');
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
