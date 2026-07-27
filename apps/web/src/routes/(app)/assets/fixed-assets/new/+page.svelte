<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { Button } from '$lib/components/ui/button';
import { Label } from '$lib/components/ui/label';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Input } from '$lib/components/ui/input';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

const inputClass = "w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50";

$effect(() => {
	if ($message) {
		toast.success($message);
		goto('/assets/fixed-assets');
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Fixed Asset</h1>
		<p class="text-muted-foreground">Register a new fixed asset</p>
	</div>

	<form method="POST" use:enhance class="space-y-4">
		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="name">Name *</Label>
				<input id="name" type="text" value={$form.name} oninput={(e) => $form.name = e.currentTarget.value} class={inputClass} />
				{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
			</div>
			<div class="space-y-1.5">
				<Label for="code">Code *</Label>
				<input id="code" type="text" value={$form.code} oninput={(e) => $form.code = e.currentTarget.value} class={inputClass} />
				{#if $errors.code}<p class="text-sm text-destructive">{$errors.code}</p>{/if}
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="categoryId">Category *</Label>
				<select id="categoryId" bind:value={$form.categoryId} class={inputClass}>
					<option value="">Select category</option>
					{#each data.categories as cat}
						<option value={cat.id}>{cat.name} ({cat.code})</option>
					{/each}
				</select>
				{#if $errors.categoryId}<p class="text-sm text-destructive">{$errors.categoryId}</p>{/if}
			</div>
			<div class="space-y-1.5">
				<Label for="purchaseDate">Purchase Date *</Label>
				<DatePicker bind:value={$form.purchaseDate} />
				{#if $errors.purchaseDate}<p class="text-sm text-destructive">{$errors.purchaseDate}</p>{/if}
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-3">
			<div class="space-y-1.5">
				<Label for="purchasePrice">Purchase Price *</Label>
				<input id="purchasePrice" type="number" value={$form.purchasePrice} oninput={(e) => $form.purchasePrice = Number(e.currentTarget.value)} class={inputClass} />
				{#if $errors.purchasePrice}<p class="text-sm text-destructive">{$errors.purchasePrice}</p>{/if}
			</div>
			<div class="space-y-1.5">
				<Label for="salvageValue">Salvage Value</Label>
				<input id="salvageValue" type="number" value={$form.salvageValue} oninput={(e) => $form.salvageValue = Number(e.currentTarget.value)} class={inputClass} />
			</div>
			<div class="space-y-1.5">
				<Label for="usefulLife">Useful Life (months) *</Label>
				<input id="usefulLife" type="number" value={$form.usefulLife} oninput={(e) => $form.usefulLife = Number(e.currentTarget.value)} class={inputClass} />
				{#if $errors.usefulLife}<p class="text-sm text-destructive">{$errors.usefulLife}</p>{/if}
			</div>
		</div>

		<div class="space-y-1.5">
			<Label for="depreciationMethod">Depreciation Method</Label>
			<select id="depreciationMethod" bind:value={$form.depreciationMethod} class={inputClass}>
				<option value="straight_line">Straight Line</option>
				<option value="declining_balance">Declining Balance</option>
				<option value="units_of_production">Units of Production</option>
			</select>
		</div>

		<div class="space-y-1.5">
			<Label for="notes">Notes</Label>
			<input id="notes" type="text" value={$form.notes ?? ''} oninput={(e) => $form.notes = e.currentTarget.value} class={inputClass} />
		</div>

		<div class="flex justify-end gap-3 pt-4">
			<Button variant="outline" href="/assets/fixed-assets">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{#if $submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}
				Create Asset
			</Button>
		</div>
	</form>
</div>
