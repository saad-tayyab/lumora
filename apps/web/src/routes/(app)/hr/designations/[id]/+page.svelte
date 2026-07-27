<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
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
		<a href="/hr/designations" class="hover:underline">Designations</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">{data.designation?.title || ''}</span>
	</nav>

	{#if data.designation}
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-foreground">{data.designation.title}</h1>
				<p class="text-muted-foreground">Designation details</p>
			</div>
			<div class="flex gap-2">
				<Button variant="destructive" onclick={() => (showDeleteConfirm = true)}>Delete</Button>
			</div>
		</div>

		<Card.Root>
			<Card.Content>
				<Card.Header>
				<Card.Title>Designation Details</Card.Title>
			</Card.Header>
				<dl class="flex flex-col gap-3">
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Title</dt>
						<dd class="text-sm font-medium">{data.designation.title}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Code</dt>
						<dd class="text-sm font-mono font-medium">{data.designation.code}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Department</dt>
						<dd class="text-sm font-medium">{data.designation.departmentName}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Level</dt>
						<dd class="text-sm font-medium">{data.designation.level}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Created</dt>
						<dd class="text-sm font-medium">{formatDate(data.designation.createdAt)}</dd>
					</div>
				</dl>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="py-12 text-center text-muted-foreground">Designation not found</div>
	{/if}
</div>

<Dialog.Root bind:open={showDeleteConfirm}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Designation</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete "{data.designation?.title}"? This action cannot be undone.
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
							toast.success('Designation deleted');
							goto('/hr/designations');
						} else {
							toast.error('Failed to delete designation');
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
