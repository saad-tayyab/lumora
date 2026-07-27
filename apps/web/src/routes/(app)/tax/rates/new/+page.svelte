<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { Button } from '$lib/components/ui/button';
import { Spinner } from '$lib/components/ui/spinner';
import { Input } from '$lib/components/ui/input';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
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
			goto('/tax/rates');
		}
	}
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Tax Rate</h1>
		<p class="text-muted-foreground">Add a versioned tax rate</p>
	</div>

	<form method="POST" use:enhance>
		<Field.FieldGroup>
			<Field.Field>
				<Field.FieldLabel for="taxCodeId">Tax Code *</Field.FieldLabel>
			<Select.Root bind:value={$form.taxCodeId}>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="Select tax code" />
				</Select.Trigger>
				<Select.Content>
					{#each data.codes as code}
						<Select.Item value={code.id}>{code.name} ({code.code})</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
				{#if $errors.taxCodeId}<Field.FieldError>{$errors.taxCodeId}</Field.FieldError>{/if}
			</Field.Field>

			<div class="grid gap-4 md:grid-cols-3">
				<Field.Field>
					<Field.FieldLabel for="rate">Rate *</Field.FieldLabel>
					<Input id="rate" type="number" value={$form.rate} oninput={(e) => $form.rate = Number(e.currentTarget.value)} placeholder="e.g. 15" />
					{#if $errors.rate}<Field.FieldError>{$errors.rate}</Field.FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="effectiveDate">Effective Date *</Field.FieldLabel>
					<DatePicker bind:value={$form.effectiveDate} />
					{#if $errors.effectiveDate}<Field.FieldError>{$errors.effectiveDate}</Field.FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="expiryDate">Expiry Date</Field.FieldLabel>
					<DatePicker bind:value={$form.expiryDate} />
				</Field.Field>
			</div>
		</Field.FieldGroup>

		<div class="flex justify-end gap-3 pt-4">
			<Button variant="outline" href="/tax/rates">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{#if $submitting}<Spinner data-icon="inline-start" class="text-primary-foreground" />{/if}
				Create Tax Rate
			</Button>
		</div>
	</form>
</div>
