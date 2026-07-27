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
			goto('/assets/fixed-assets');
		}
	}
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Fixed Asset</h1>
		<p class="text-muted-foreground">Register a new fixed asset</p>
	</div>

	<form method="POST" use:enhance>
		<Field.FieldGroup>
			<div class="grid gap-4 md:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel for="name">Name *</Field.FieldLabel>
					<Input id="name" type="text" value={$form.name} oninput={(e) => $form.name = e.currentTarget.value} />
					{#if $errors.name}<Field.FieldError>{$errors.name}</Field.FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="code">Code *</Field.FieldLabel>
					<Input id="code" type="text" value={$form.code} oninput={(e) => $form.code = e.currentTarget.value} />
					{#if $errors.code}<Field.FieldError>{$errors.code}</Field.FieldError>{/if}
				</Field.Field>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel for="categoryId">Category *</Field.FieldLabel>
					<Select.Root bind:value={$form.categoryId}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Select category" />
						</Select.Trigger>
						<Select.Content>
							{#each data.categories as cat}
								<Select.Item value={cat.id}>{cat.name} ({cat.code})</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					{#if $errors.categoryId}<Field.FieldError>{$errors.categoryId}</Field.FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="purchaseDate">Purchase Date *</Field.FieldLabel>
					<DatePicker bind:value={$form.purchaseDate} />
					{#if $errors.purchaseDate}<Field.FieldError>{$errors.purchaseDate}</Field.FieldError>{/if}
				</Field.Field>
			</div>

			<div class="grid gap-4 md:grid-cols-3">
				<Field.Field>
					<Field.FieldLabel for="purchasePrice">Purchase Price *</Field.FieldLabel>
					<Input id="purchasePrice" type="number" value={$form.purchasePrice} oninput={(e) => $form.purchasePrice = Number(e.currentTarget.value)} />
					{#if $errors.purchasePrice}<Field.FieldError>{$errors.purchasePrice}</Field.FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="salvageValue">Salvage Value</Field.FieldLabel>
					<Input id="salvageValue" type="number" value={$form.salvageValue} oninput={(e) => $form.salvageValue = Number(e.currentTarget.value)} />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="usefulLife">Useful Life (months) *</Field.FieldLabel>
					<Input id="usefulLife" type="number" value={$form.usefulLife} oninput={(e) => $form.usefulLife = Number(e.currentTarget.value)} />
					{#if $errors.usefulLife}<Field.FieldError>{$errors.usefulLife}</Field.FieldError>{/if}
				</Field.Field>
			</div>

			<Field.Field>
				<Field.FieldLabel for="depreciationMethod">Depreciation Method</Field.FieldLabel>
				<Select.Root bind:value={$form.depreciationMethod}>
					<Select.Trigger class="w-full">
						<Select.Value placeholder="Select method" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="straight_line">Straight Line</Select.Item>
						<Select.Item value="declining_balance">Declining Balance</Select.Item>
						<Select.Item value="units_of_production">Units of Production</Select.Item>
					</Select.Content>
				</Select.Root>
			</Field.Field>

			<Field.Field>
				<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
				<Input id="notes" type="text" value={$form.notes ?? ''} oninput={(e) => $form.notes = e.currentTarget.value} />
			</Field.Field>
		</Field.FieldGroup>

		<div class="flex justify-end gap-3 pt-4">
			<Button variant="outline" href="/assets/fixed-assets">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{#if $submitting}<Spinner data-icon="inline-start" class="text-primary-foreground" />{/if}
				Create Asset
			</Button>
		</div>
	</form>
</div>
