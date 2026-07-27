<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { Button } from '$lib/components/ui/button';
import { Label } from '$lib/components/ui/label';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

const inputClass = "w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50";

$effect(() => {
	if ($message) {
		toast.success($message);
		goto('/tax/rules');
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Auto-Assignment Rule</h1>
		<p class="text-muted-foreground">Automatically assign tax codes based on entity attributes</p>
	</div>

	<form method="POST" use:enhance class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="name">Name *</Label>
				<input id="name" type="text" value={$form.name} oninput={(e) => $form.name = e.currentTarget.value} class={inputClass} maxlength="100" />
				{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
			</div>
			<div class="space-y-1.5">
				<Label for="priority">Priority</Label>
				<input id="priority" type="number" value={$form.priority} oninput={(e) => $form.priority = Number(e.currentTarget.value)} class={inputClass} />
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="taxCodeId">Tax Code *</Label>
				<select id="taxCodeId" bind:value={$form.taxCodeId} class={inputClass}>
					<option value="">Select tax code</option>
					{#each data.codes as code}
						<option value={code.id}>{code.name} ({code.code})</option>
					{/each}
				</select>
				{#if $errors.taxCodeId}<p class="text-sm text-destructive">{$errors.taxCodeId}</p>{/if}
			</div>
			<div class="space-y-1.5">
				<Label for="entityType">Entity Type *</Label>
				<input id="entityType" type="text" value={$form.entityType} oninput={(e) => $form.entityType = e.currentTarget.value} class={inputClass} maxlength="50" placeholder="e.g. invoice, bill" />
				{#if $errors.entityType}<p class="text-sm text-destructive">{$errors.entityType}</p>{/if}
			</div>
		</div>

		<div class="space-y-1.5">
			<Label for="description">Description</Label>
			<input id="description" type="text" value={$form.description ?? ''} oninput={(e) => $form.description = e.currentTarget.value} class={inputClass} />
		</div>

		<div class="space-y-1.5">
			<Label for="regionCode">Region Code</Label>
			<input id="regionCode" type="text" value={$form.regionCode ?? ''} oninput={(e) => $form.regionCode = e.currentTarget.value} class={inputClass} maxlength="10" />
		</div>

		<div class="flex justify-end gap-3 pt-4">
			<a href="/tax/rules" class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Cancel</a>
			<Button type="submit" disabled={$submitting}>
				{#if $submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}
				Create Rule
			</Button>
		</div>
	</form>
</div>
