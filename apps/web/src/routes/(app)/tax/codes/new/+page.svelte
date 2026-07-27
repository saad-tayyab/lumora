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
		goto('/tax/codes');
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Tax Code</h1>
		<p class="text-muted-foreground">Define a new tax code</p>
	</div>

	<form method="POST" use:enhance class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="code">Code *</Label>
				<input id="code" type="text" value={$form.code} oninput={(e) => $form.code = e.currentTarget.value} class={inputClass} maxlength="20" />
				{#if $errors.code}<p class="text-sm text-destructive">{$errors.code}</p>{/if}
			</div>
			<div class="space-y-1.5">
				<Label for="name">Name *</Label>
				<input id="name" type="text" value={$form.name} oninput={(e) => $form.name = e.currentTarget.value} class={inputClass} maxlength="100" />
				{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="type">Type *</Label>
				<select id="type" bind:value={$form.type} class={inputClass}>
					<option value="output_tax">Output Tax</option>
					<option value="input_tax">Input Tax</option>
					<option value="exempt">Exempt</option>
					<option value="zero_rated">Zero Rated</option>
				</select>
				{#if $errors.type}<p class="text-sm text-destructive">{$errors.type}</p>{/if}
			</div>
			<div class="space-y-1.5">
				<Label for="postingRule">Posting Rule</Label>
				<select id="postingRule" bind:value={$form.postingRule} class={inputClass}>
					<option value="output_liability">Output Liability</option>
					<option value="input_asset">Input Asset</option>
				</select>
			</div>
		</div>

		<div class="space-y-1.5">
			<Label for="rate">Rate *</Label>
			<input id="rate" type="number" value={$form.rate} oninput={(e) => $form.rate = Number(e.currentTarget.value)} class={inputClass} placeholder="e.g. 15" />
			{#if $errors.rate}<p class="text-sm text-destructive">{$errors.rate}</p>{/if}
		</div>

		<div class="space-y-1.5">
			<Label for="glAccountId">GL Account ID</Label>
			<input id="glAccountId" type="text" value={$form.glAccountId ?? ''} oninput={(e) => $form.glAccountId = e.currentTarget.value} class={inputClass} />
		</div>

		<div class="space-y-1.5">
			<Label for="description">Description</Label>
			<input id="description" type="text" value={$form.description ?? ''} oninput={(e) => $form.description = e.currentTarget.value} class={inputClass} />
		</div>

		<div class="flex items-center gap-2">
			<input id="isClaimable" type="checkbox" bind:checked={$form.isClaimable} class="h-4 w-4 rounded border-input" />
			<Label for="isClaimable">Is Claimable</Label>
		</div>

		<div class="flex items-center gap-2">
			<input id="isActive" type="checkbox" bind:checked={$form.isActive} class="h-4 w-4 rounded border-input" />
			<Label for="isActive">Is Active</Label>
		</div>

		<div class="flex justify-end gap-3 pt-4">
			<a href="/tax/codes" class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Cancel</a>
			<Button type="submit" disabled={$submitting}>
				{#if $submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}
				Create Tax Code
			</Button>
		</div>
	</form>
</div>
