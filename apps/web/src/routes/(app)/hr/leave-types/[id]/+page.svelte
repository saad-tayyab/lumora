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
		<a href="/hr/leave-types" class="hover:underline">Leave Types</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">{data.leaveType?.name || ''}</span>
	</nav>

	{#if data.leaveType}
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-foreground">{data.leaveType.name}</h1>
				<p class="text-muted-foreground">Leave type details</p>
			</div>
			<div class="flex gap-2">
				<Button variant="destructive" onclick={() => (showDeleteConfirm = true)}>Delete</Button>
			</div>
		</div>

		<Card>
			<CardContent>
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Leave Type Details</h2>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Name</dt>
						<dd class="text-sm font-medium">{data.leaveType.name}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Days Per Year</dt>
						<dd class="text-sm font-medium">{data.leaveType.daysPerYear}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Paid</dt>
						<dd class="text-sm font-medium">{data.leaveType.isPaid ? 'Yes' : 'No'}</dd>
					</div>
					{#if data.leaveType.description}
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Description</dt>
							<dd class="text-sm font-medium">{data.leaveType.description}</dd>
						</div>
					{/if}
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Created</dt>
						<dd class="text-sm font-medium">{formatDate(data.leaveType.createdAt)}</dd>
					</div>
				</dl>
			</CardContent>
		</Card>
	{:else}
		<div class="py-12 text-center text-muted-foreground">Leave type not found</div>
	{/if}
</div>

{#if showDeleteConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="mx-4 w-full max-w-sm rounded-lg bg-card p-6 shadow-lg">
			<h3 class="text-lg font-semibold text-card-foreground">Delete Leave Type</h3>
			<p class="mt-2 text-sm text-muted-foreground">
				Are you sure you want to delete "{data.leaveType?.name}"? This action cannot be undone.
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
								toast.success('Leave type deleted');
								goto('/hr/leave-types');
							} else {
								toast.error('Failed to delete leave type');
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
