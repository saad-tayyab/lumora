<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
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
			goto('/assets/adjustments');
		}
	}
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Asset Adjustment</h1>
		<p class="text-muted-foreground">Record a revaluation, impairment, or transfer</p>
	</div>

	<form method="POST" use:enhance>
		<Field.FieldGroup>
			<Field.Field>
				<Field.FieldLabel for="asset">Asset *</Field.FieldLabel>
				<Select.Root bind:value={$form.assetId}>
					<Select.Trigger class="w-full">
						<Select.Value placeholder="Select asset" />
					</Select.Trigger>
					<Select.Content>
						{#each data.assets as asset}
							<Select.Item value={asset.id}>{asset.name} ({asset.assetNumber})</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if $errors.assetId}<Field.FieldError>{$errors.assetId}</Field.FieldError>{/if}
			</Field.Field>

			<div class="grid gap-4 md:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel for="type">Adjustment Type *</Field.FieldLabel>
					<Select.Root bind:value={$form.adjustmentType}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Select type" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="revaluation">Revaluation</Select.Item>
							<Select.Item value="impairment">Impairment</Select.Item>
							<Select.Item value="restoration">Restoration</Select.Item>
							<Select.Item value="transfer">Transfer</Select.Item>
							<Select.Item value="reclassification">Reclassification</Select.Item>
						</Select.Content>
					</Select.Root>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="direction">Direction *</Field.FieldLabel>
					<Select.Root bind:value={$form.direction}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Select direction" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="increase">Increase</Select.Item>
							<Select.Item value="decrease">Decrease</Select.Item>
						</Select.Content>
					</Select.Root>
				</Field.Field>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel for="date">Date *</Field.FieldLabel>
					<DatePicker bind:value={$form.adjustmentDate} />
					{#if $errors.adjustmentDate}<Field.FieldError>{$errors.adjustmentDate}</Field.FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="amount">Amount *</Field.FieldLabel>
					<Input id="amount" type="number" step="0.01" min="0.01" bind:value={$form.adjustmentAmount} />
					{#if $errors.adjustmentAmount}<Field.FieldError>{$errors.adjustmentAmount}</Field.FieldError>{/if}
				</Field.Field>
			</div>

			<Field.Field>
				<Field.FieldLabel for="description">Description *</Field.FieldLabel>
				<Textarea id="description" bind:value={$form.description} rows="2"></Textarea>
				{#if $errors.description}<Field.FieldError>{$errors.description}</Field.FieldError>{/if}
			</Field.Field>

			<div class="grid gap-4 md:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel for="revisedLife">Revised Useful Life (months)</Field.FieldLabel>
					<Input id="revisedLife" type="number" bind:value={$form.revisedUsefulLifeMonths} />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="revisedSalvage">Revised Salvage Value</Field.FieldLabel>
					<Input id="revisedSalvage" bind:value={$form.revisedSalvageValue} />
				</Field.Field>
			</div>
		</Field.FieldGroup>

		<div class="flex justify-end gap-3 pt-4">
			<a href="/assets/adjustments" class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Cancel</a>
			<Button type="submit" disabled={$submitting}>
				{$submitting ? 'Creating...' : 'Create Adjustment'}
			</Button>
		</div>
	</form>
</div>
