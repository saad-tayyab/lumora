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
			goto('/assets/categories');
		}
	}
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Asset Category</h1>
		<p class="text-muted-foreground">Create a new fixed asset category</p>
	</div>

	<form method="POST" use:enhance>
		<Field.FieldGroup>
			<div class="grid gap-4 md:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel for="name">Name *</Field.FieldLabel>
					<Input id="name" type="text" value={$form.name} oninput={(e) => $form.name = e.currentTarget.value} placeholder="e.g. Office Equipment" />
					{#if $errors.name}<Field.FieldError>{$errors.name}</Field.FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="code">Code *</Field.FieldLabel>
					<Input id="code" type="text" value={$form.code} oninput={(e) => $form.code = e.currentTarget.value} maxlength="20" placeholder="e.g. OE" />
					{#if $errors.code}<Field.FieldError>{$errors.code}</Field.FieldError>{/if}
				</Field.Field>
			</div>

			<Field.Field>
				<Field.FieldLabel for="description">Description</Field.FieldLabel>
				<Input id="description" type="text" value={$form.description ?? ''} oninput={(e) => $form.description = e.currentTarget.value} />
			</Field.Field>

			<div class="grid gap-4 md:grid-cols-3">
				<Field.Field>
					<Field.FieldLabel for="defaultDepreciationMethod">Depreciation Method</Field.FieldLabel>
					<Select.Root bind:value={$form.defaultDepreciationMethod}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Select method" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="straight_line">Straight Line</Select.Item>
							<Select.Item value="declining_balance">Declining Balance</Select.Item>
							<Select.Item value="sum_of_years_digits">Sum of Years Digits</Select.Item>
							<Select.Item value="units_of_activity">Units of Activity</Select.Item>
						</Select.Content>
					</Select.Root>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="defaultUsefulLifeMonths">Useful Life (months)</Field.FieldLabel>
					<Input id="defaultUsefulLifeMonths" type="number" value={$form.defaultUsefulLifeMonths} oninput={(e) => $form.defaultUsefulLifeMonths = Number(e.currentTarget.value)} />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="defaultSalvageValuePercent">Salvage Value %</Field.FieldLabel>
					<Input id="defaultSalvageValuePercent" type="number" value={$form.defaultSalvageValuePercent} oninput={(e) => $form.defaultSalvageValuePercent = Number(e.currentTarget.value)} />
				</Field.Field>
			</div>

			<Field.Field class="flex flex-row items-center gap-2">
				<Checkbox id="isDepreciable" bind:checked={$form.isDepreciable} />
				<Field.FieldLabel for="isDepreciable">Is Depreciable</Field.FieldLabel>
			</Field.Field>
		</Field.FieldGroup>

		<div class="flex justify-end gap-3 pt-4">
			<Button variant="outline" href="/assets/categories">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{#if $submitting}<Spinner data-icon="inline-start" class="text-primary-foreground" />{/if}
				Create Category
			</Button>
		</div>
	</form>
</div>
