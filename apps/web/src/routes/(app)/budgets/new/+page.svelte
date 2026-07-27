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
		goto('/budgets');
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Budget</h1>
		<p class="text-muted-foreground">Create a new budget for a period</p>
	</div>

	<form method="POST" use:enhance class="space-y-4">
		<div class="space-y-1.5">
			<label for="name" class="text-sm font-medium text-foreground">Name *</label>
			<input id="name" bind:value={$form.name} maxlength="100" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
			{#if $errors.name}<p class="text-xs text-destructive">{$errors.name}</p>{/if}
		</div>

		<div class="space-y-1.5">
			<label for="description" class="text-sm font-medium text-foreground">Description</label>
			<textarea id="description" bind:value={$form.description} rows="2" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
		</div>

		<div class="grid gap-4 md:grid-cols-3">
			<div class="space-y-1.5">
				<label for="periodStart" class="text-sm font-medium text-foreground">Period Start *</label>
				<DatePicker bind:value={$form.periodStart} />
				{#if $errors.periodStart}<p class="text-xs text-destructive">{$errors.periodStart}</p>{/if}
			</div>
			<div class="space-y-1.5">
				<label for="periodEnd" class="text-sm font-medium text-foreground">Period End *</label>
				<DatePicker bind:value={$form.periodEnd} />
				{#if $errors.periodEnd}<p class="text-xs text-destructive">{$errors.periodEnd}</p>{/if}
			</div>
			<div class="space-y-1.5">
				<label for="totalAmount" class="text-sm font-medium text-foreground">Total Amount</label>
				<Input id="totalAmount" type="number" step="0.01" bind:value={$form.totalAmount} />
			</div>
		</div>

		<div class="flex justify-end gap-3 pt-4">
			<Button variant="outline" href="/budgets">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{$submitting ? 'Creating...' : 'Create Budget'}
			</Button>
		</div>
	</form>
</div>
