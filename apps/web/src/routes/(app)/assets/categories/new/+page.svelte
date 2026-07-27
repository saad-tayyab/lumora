<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { Button } from '$lib/components/ui/button';
import { Label } from '$lib/components/ui/label';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Input } from '$lib/components/ui/input';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

const inputClass = "w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50";

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/assets/categories');
		}
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Asset Category</h1>
		<p class="text-muted-foreground">Create a new fixed asset category</p>
	</div>

	<form method="POST" use:enhance class="space-y-4">
		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="name">Name *</Label>
				<input id="name" type="text" value={$form.name} oninput={(e) => $form.name = e.currentTarget.value} class={inputClass} placeholder="e.g. Office Equipment" />
				{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
			</div>
			<div class="space-y-1.5">
				<Label for="code">Code *</Label>
				<input id="code" type="text" value={$form.code} oninput={(e) => $form.code = e.currentTarget.value} class={inputClass} maxlength="20" placeholder="e.g. OE" />
				{#if $errors.code}<p class="text-sm text-destructive">{$errors.code}</p>{/if}
			</div>
		</div>

		<div class="space-y-1.5">
			<Label for="description">Description</Label>
			<input id="description" type="text" value={$form.description ?? ''} oninput={(e) => $form.description = e.currentTarget.value} class={inputClass} />
		</div>

		<div class="grid gap-4 md:grid-cols-3">
			<div class="space-y-1.5">
				<Label for="defaultDepreciationMethod">Depreciation Method</Label>
				<select id="defaultDepreciationMethod" bind:value={$form.defaultDepreciationMethod} class={inputClass}>
					<option value="straight_line">Straight Line</option>
					<option value="declining_balance">Declining Balance</option>
					<option value="sum_of_years_digits">Sum of Years Digits</option>
					<option value="units_of_activity">Units of Activity</option>
				</select>
			</div>
			<div class="space-y-1.5">
				<Label for="defaultUsefulLifeMonths">Useful Life (months)</Label>
				<input id="defaultUsefulLifeMonths" type="number" value={$form.defaultUsefulLifeMonths} oninput={(e) => $form.defaultUsefulLifeMonths = Number(e.currentTarget.value)} class={inputClass} />
			</div>
			<div class="space-y-1.5">
				<Label for="defaultSalvageValuePercent">Salvage Value %</Label>
				<input id="defaultSalvageValuePercent" type="number" value={$form.defaultSalvageValuePercent} oninput={(e) => $form.defaultSalvageValuePercent = Number(e.currentTarget.value)} class={inputClass} />
			</div>
		</div>

		<div class="flex items-center gap-2">
			<input id="isDepreciable" type="checkbox" bind:checked={$form.isDepreciable} class="h-4 w-4 rounded border-input" />
			<Label for="isDepreciable">Is Depreciable</Label>
		</div>

		<div class="flex justify-end gap-3 pt-4">
			<Button variant="outline" href="/assets/categories">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{#if $submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}
				Create Category
			</Button>
		</div>
	</form>
</div>
