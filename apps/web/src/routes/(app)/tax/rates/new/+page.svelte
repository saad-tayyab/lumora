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
		goto('/tax/rates');
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Tax Rate</h1>
		<p class="text-muted-foreground">Add a versioned tax rate</p>
	</div>

	<form method="POST" use:enhance class="space-y-4">
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

		<div class="grid gap-4 md:grid-cols-3">
			<div class="space-y-1.5">
				<Label for="rate">Rate *</Label>
				<input id="rate" type="number" value={$form.rate} oninput={(e) => $form.rate = Number(e.currentTarget.value)} class={inputClass} placeholder="e.g. 15" />
				{#if $errors.rate}<p class="text-sm text-destructive">{$errors.rate}</p>{/if}
			</div>
			<div class="space-y-1.5">
				<Label for="effectiveDate">Effective Date *</Label>
				<DatePicker bind:value={$form.effectiveDate} />
				{#if $errors.effectiveDate}<p class="text-sm text-destructive">{$errors.effectiveDate}</p>{/if}
			</div>
			<div class="space-y-1.5">
				<Label for="expiryDate">Expiry Date</Label>
				<DatePicker bind:value={$form.expiryDate} />
			</div>
		</div>

		<div class="flex justify-end gap-3 pt-4">
			<Button variant="outline" href="/tax/rates">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{#if $submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}
				Create Tax Rate
			</Button>
		</div>
	</form>
</div>
