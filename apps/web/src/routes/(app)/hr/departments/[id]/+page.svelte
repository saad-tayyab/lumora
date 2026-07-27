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

<div class="flex flex-col mx-auto max-w-4xl gap-6">
	<nav class="mb-4 text-sm text-muted-foreground">
		<a href="/hr/departments" class="hover:underline">Departments</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">{data.department?.name || ''}</span>
	</nav>

	{#if data.department}
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-foreground">{data.department.name}</h1>
				<p class="text-muted-foreground">Department details</p>
			</div>
			<div class="flex gap-2">
				<Button variant="destructive" onclick={() => (showDeleteConfirm = true)}>Delete</Button>
			</div>
		</div>

		<Card.Root>
			<Card.Content>
				<Card.Header>
				<Card.Title>Department Details</Card.Title>
			</Card.Header>
				<dl class="flex flex-col gap-3">
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Name</dt>
						<dd class="text-sm font-medium">{data.department.name}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Code</dt>
						<dd class="text-sm font-mono font-medium">{data.department.code}</dd>
					</div>
					{#if data.department.description}
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Description</dt>
							<dd class="text-sm font-medium">{data.department.description}</dd>
						</div>
					{/if}
					{#if data.department.managerName}
						<div class="flex justify-between">
							<dt class="text-sm text-muted-foreground">Manager</dt>
							<dd class="text-sm font-medium">{data.department.managerName}</dd>
						</div>
					{/if}
					<div class="flex justify-between">
						<dt class="text-sm text-muted-foreground">Created</dt>
						<dd class="text-sm font-medium">{formatDate(data.department.createdAt)}</dd>
					</div>
				</dl>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="py-12 text-center text-muted-foreground">Department not found</div>
	{/if}
</div>

<Dialog.Root bind:open={showDeleteConfirm}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Department</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete "{data.department?.name}"? This action cannot be undone.
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
							toast.success('Department deleted');
							goto('/hr/departments');
						} else {
							toast.error('Failed to delete department');
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
