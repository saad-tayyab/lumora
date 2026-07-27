<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import * as Field from '$lib/components/ui/field';
import DatePicker from '$lib/components/ui/date-picker.svelte';
import * as Card from '$lib/components/ui/card';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/financial/fiscal-years');
		}
	}
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<a href="/financial/fiscal-years" class="text-sm text-muted-foreground hover:text-foreground">
			← Back to Fiscal Years
		</a>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Fiscal Year</h1>
		<p class="mt-1 text-muted-foreground">Create a new fiscal year period</p>
	</div>

	<Card.Root>
		<Card.Content>
			<form method="POST" use:enhance>
				<Field.FieldGroup>
					<Field.Field>
						<Field.FieldLabel for="name">Year Name *</Field.FieldLabel>
						<Input id="name" bind:value={$form.name} placeholder="e.g. FY 2026" />
						{#if $errors.name}<Field.FieldError>{$errors.name}</Field.FieldError>{/if}
					</Field.Field>

					<div class="grid gap-4 sm:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="startDate">Start Date *</Field.FieldLabel>
							<DatePicker bind:value={$form.startDate} />
							{#if $errors.startDate}<Field.FieldError>{$errors.startDate}</Field.FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="endDate">End Date *</Field.FieldLabel>
							<DatePicker bind:value={$form.endDate} />
							{#if $errors.endDate}<Field.FieldError>{$errors.endDate}</Field.FieldError>{/if}
						</Field.Field>
					</div>
				</Field.FieldGroup>

				<div class="flex justify-end gap-3 pt-2">
					<Button href="/financial/fiscal-years" variant="outline">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Fiscal Year'}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
