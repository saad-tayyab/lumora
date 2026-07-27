<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		toast.success($message);
		goto('/assets/adjustments');
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Asset Adjustment</h1>
		<p class="text-muted-foreground">Record a revaluation, impairment, or transfer</p>
	</div>

	<form method="POST" use:enhance class="space-y-4">
		<div class="space-y-1.5">
			<label for="asset" class="text-sm font-medium text-foreground">Asset *</label>
			<select id="asset" bind:value={$form.assetId} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
				<option value="">Select asset</option>
				{#each data.assets as asset}
					<option value={asset.id}>{asset.name} ({asset.assetNumber})</option>
				{/each}
			</select>
			{#if $errors.assetId}<p class="text-xs text-destructive">{$errors.assetId}</p>{/if}
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-1.5">
				<label for="type" class="text-sm font-medium text-foreground">Adjustment Type *</label>
				<select id="type" bind:value={$form.adjustmentType} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
					<option value="revaluation">Revaluation</option>
					<option value="impairment">Impairment</option>
					<option value="restoration">Restoration</option>
					<option value="transfer">Transfer</option>
					<option value="reclassification">Reclassification</option>
				</select>
			</div>
			<div class="space-y-1.5">
				<label for="direction" class="text-sm font-medium text-foreground">Direction *</label>
				<select id="direction" bind:value={$form.direction} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
					<option value="increase">Increase</option>
					<option value="decrease">Decrease</option>
				</select>
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-1.5">
				<label for="date" class="text-sm font-medium text-foreground">Date *</label>
				<DatePicker bind:value={$form.adjustmentDate} />
				{#if $errors.adjustmentDate}<p class="text-xs text-destructive">{$errors.adjustmentDate}</p>{/if}
			</div>
			<div class="space-y-1.5">
				<label for="amount" class="text-sm font-medium text-foreground">Amount *</label>
				<Input id="amount" type="number" step="0.01" min="0.01" bind:value={$form.adjustmentAmount} />
				{#if $errors.adjustmentAmount}<p class="text-xs text-destructive">{$errors.adjustmentAmount}</p>{/if}
			</div>
		</div>

		<div class="space-y-1.5">
			<label for="description" class="text-sm font-medium text-foreground">Description *</label>
			<textarea id="description" bind:value={$form.description} rows="2" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
			{#if $errors.description}<p class="text-xs text-destructive">{$errors.description}</p>{/if}
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-1.5">
				<label for="revisedLife" class="text-sm font-medium text-foreground">Revised Useful Life (months)</label>
				<Input id="revisedLife" type="number" bind:value={$form.revisedUsefulLifeMonths} />
			</div>
			<div class="space-y-1.5">
				<label for="revisedSalvage" class="text-sm font-medium text-foreground">Revised Salvage Value</label>
				<Input id="revisedSalvage" bind:value={$form.revisedSalvageValue} />
			</div>
		</div>

		<div class="flex justify-end gap-3 pt-4">
			<a href="/assets/adjustments" class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Cancel</a>
			<Button type="submit" disabled={$submitting}>
				{$submitting ? 'Creating...' : 'Create Adjustment'}
			</Button>
		</div>
	</form>
</div>
