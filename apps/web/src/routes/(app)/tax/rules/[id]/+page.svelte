<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent } from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let showDeleteConfirm = $state(false);
let deleting = $state(false);
</script>

<div class="mx-auto max-w-4xl space-y-6">
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
					<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {data.rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
						{data.rule.isActive ? 'Active' : 'Inactive'}
					</span>
				</div>
				<p class="text-muted-foreground">Auto-assignment rule details</p>
			</div>
			<div class="flex gap-2">
				<Button variant="destructive" onclick={() => (showDeleteConfirm = true)}>Delete</Button>
			</div>
		</div>

		<Card>
			<CardContent>
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Rule Details</h2>
				<dl class="space-y-3">
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
							<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {data.rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
								{data.rule.isActive ? 'Active' : 'Inactive'}
							</span>
						</dd>
					</div>
				</dl>
			</CardContent>
		</Card>
	{:else}
		<div class="py-12 text-center text-muted-foreground">Tax rule not found</div>
	{/if}
</div>

{#if showDeleteConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="mx-4 w-full max-w-sm rounded-lg bg-card p-6 shadow-lg">
			<h3 class="text-lg font-semibold text-card-foreground">Delete Tax Rule</h3>
			<p class="mt-2 text-sm text-muted-foreground">
				Are you sure you want to delete "{data.rule?.name}"? This action cannot be undone.
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
		</div>
	</div>
{/if}
