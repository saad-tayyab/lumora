<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import * as Field from '$lib/components/ui/field';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/budgets');
		}
	}
});
</script>

<div class="mx-auto max-w-2xl flex flex-col gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Budget</h1>
		<p class="text-muted-foreground">Create a new budget for a period</p>
	</div>

	<form method="POST" use:enhance>
		<Field.FieldGroup>
			<Field.Field>
				<Field.FieldLabel for="name">Name *</Field.FieldLabel>
				<Input id="name" bind:value={$form.name} maxlength="100" />
				{#if $errors.name}<Field.FieldError>{$errors.name}</Field.FieldError>{/if}
			</Field.Field>

			<Field.Field>
				<Field.FieldLabel for="description">Description</Field.FieldLabel>
				<Textarea id="description" bind:value={$form.description} rows="2"></Textarea>
			</Field.Field>

			<div class="grid gap-4 md:grid-cols-3">
				<Field.Field>
					<Field.FieldLabel for="periodStart">Period Start *</Field.FieldLabel>
					<DatePicker bind:value={$form.periodStart} />
					{#if $errors.periodStart}<Field.FieldError>{$errors.periodStart}</Field.FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="periodEnd">Period End *</Field.FieldLabel>
					<DatePicker bind:value={$form.periodEnd} />
					{#if $errors.periodEnd}<Field.FieldError>{$errors.periodEnd}</Field.FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="totalAmount">Total Amount</Field.FieldLabel>
					<Input id="totalAmount" type="number" step="0.01" bind:value={$form.totalAmount} />
				</Field.Field>
			</div>
		</Field.FieldGroup>

		<div class="flex justify-end gap-3 pt-4">
			<Button variant="outline" href="/budgets">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{$submitting ? 'Creating...' : 'Create Budget'}
			</Button>
		</div>
	</form>
</div>
