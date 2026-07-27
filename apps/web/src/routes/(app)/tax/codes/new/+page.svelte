<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { Button } from '$lib/components/ui/button';
import { Checkbox } from '$lib/components/ui/checkbox';
import { Spinner } from '$lib/components/ui/spinner';
import { Input } from '$lib/components/ui/input';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/tax/codes');
		}
	}
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Tax Code</h1>
		<p class="text-muted-foreground">Define a new tax code</p>
	</div>

	<form method="POST" use:enhance>
		<Field.FieldGroup>
			<div class="grid gap-4 md:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel for="code">Code *</Field.FieldLabel>
					<Input id="code" type="text" value={$form.code} oninput={(e) => $form.code = e.currentTarget.value} maxlength="20" />
					{#if $errors.code}<Field.FieldError>{$errors.code}</Field.FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="name">Name *</Field.FieldLabel>
					<Input id="name" type="text" value={$form.name} oninput={(e) => $form.name = e.currentTarget.value} maxlength="100" />
					{#if $errors.name}<Field.FieldError>{$errors.name}</Field.FieldError>{/if}
				</Field.Field>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel for="type">Type *</Field.FieldLabel>
				<Select.Root bind:value={$form.type}>
					<Select.Trigger class="w-full">
						<Select.Value placeholder="Select type" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="output_tax">Output Tax</Select.Item>
						<Select.Item value="input_tax">Input Tax</Select.Item>
						<Select.Item value="exempt">Exempt</Select.Item>
						<Select.Item value="zero_rated">Zero Rated</Select.Item>
					</Select.Content>
				</Select.Root>
					{#if $errors.type}<Field.FieldError>{$errors.type}</Field.FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="postingRule">Posting Rule</Field.FieldLabel>
					<Select.Root bind:value={$form.postingRule}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Select rule" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="output_liability">Output Liability</Select.Item>
							<Select.Item value="input_asset">Input Asset</Select.Item>
						</Select.Content>
					</Select.Root>
				</Field.Field>
			</div>

			<Field.Field>
				<Field.FieldLabel for="rate">Rate *</Field.FieldLabel>
				<Input id="rate" type="number" value={$form.rate} oninput={(e) => $form.rate = Number(e.currentTarget.value)} placeholder="e.g. 15" />
				{#if $errors.rate}<Field.FieldError>{$errors.rate}</Field.FieldError>{/if}
			</Field.Field>

			<Field.Field>
				<Field.FieldLabel for="glAccountId">GL Account ID</Field.FieldLabel>
				<Input id="glAccountId" type="text" value={$form.glAccountId ?? ''} oninput={(e) => $form.glAccountId = e.currentTarget.value} />
			</Field.Field>

			<Field.Field>
				<Field.FieldLabel for="description">Description</Field.FieldLabel>
				<Input id="description" type="text" value={$form.description ?? ''} oninput={(e) => $form.description = e.currentTarget.value} />
			</Field.Field>

			<Field.Field class="flex flex-row items-center gap-2">
				<Checkbox id="isClaimable" bind:checked={$form.isClaimable} />
				<Field.FieldLabel for="isClaimable">Is Claimable</Field.FieldLabel>
			</Field.Field>

			<Field.Field class="flex flex-row items-center gap-2">
				<Checkbox id="isActive" bind:checked={$form.isActive} />
				<Field.FieldLabel for="isActive">Is Active</Field.FieldLabel>
			</Field.Field>
		</Field.FieldGroup>

		<div class="flex justify-end gap-3 pt-4">
			<Button variant="outline" href="/tax/codes">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{#if $submitting}<Spinner data-icon="inline-start" class="text-primary-foreground" />{/if}
				Create Tax Code
			</Button>
		</div>
	</form>
</div>
