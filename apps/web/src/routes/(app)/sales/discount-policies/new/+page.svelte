<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Checkbox } from '$lib/components/ui/checkbox';
import { Input } from '$lib/components/ui/input';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
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
			goto('/sales/discount-policies');
		}
	}
});
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Discount Policy</h1>
		<p class="text-muted-foreground">Create a new discount policy</p>
	</div>

	<Card.Root>
		<Card.Content>
			<form method="POST" use:enhance>
				<h2 class="text-lg font-semibold text-card-foreground">Policy Details</h2>
				<Field.FieldGroup>
					<div class="grid gap-4 md:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="name">Name *</Field.FieldLabel>
							<Input id="name" bind:value={$form.name} placeholder="Policy name" />
							{#if $errors.name}<Field.FieldError>{$errors.name}</Field.FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="type">Type *</Field.FieldLabel>
						<Select.Root bind:value={$form.type}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select type" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="percentage">Percentage</Select.Item>
								<Select.Item value="fixed_amount">Fixed Amount</Select.Item>
								<Select.Item value="tiered">Tiered</Select.Item>
							</Select.Content>
						</Select.Root>
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="value">Value *</Field.FieldLabel>
							<Input id="value" type="number" bind:value={$form.value} min="0" step="0.01" />
							<p class="mt-1 text-xs text-muted-foreground">
								{$form.type === 'percentage' ? 'Enter as decimal (e.g., 0.10 for 10%)' : 'Enter amount'}
							</p>
							{#if $errors.value}<Field.FieldError>{$errors.value}</Field.FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="minQuantity">Minimum Quantity</Field.FieldLabel>
							<Input id="minQuantity" type="number" bind:value={$form.minQuantity} min="0" />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="minAmount">Minimum Amount</Field.FieldLabel>
							<Input id="minAmount" type="number" bind:value={$form.minAmount} min="0" step="0.01" />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="maxDiscountAmount">Max Discount Amount</Field.FieldLabel>
							<Input id="maxDiscountAmount" type="number" bind:value={$form.maxDiscountAmount} min="0" step="0.01" />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="startDate">Start Date *</Field.FieldLabel>
							<DatePicker bind:value={$form.startDate} />
							{#if $errors.startDate}<Field.FieldError>{$errors.startDate}</Field.FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="endDate">End Date</Field.FieldLabel>
							<DatePicker bind:value={$form.endDate} />
						</Field.Field>
						<Field.Field class="flex flex-row items-center gap-2">
							<Checkbox id="isActive" bind:checked={$form.isActive} />
							<Field.FieldLabel for="isActive">Active</Field.FieldLabel>
						</Field.Field>
					</div>
				</Field.FieldGroup>

				<div class="flex items-center justify-end gap-3">
					<Button variant="outline" href="/sales/discount-policies">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{#if $submitting}<Spinner data-icon="inline-start" class="text-primary-foreground" />{/if}
						Create Discount Policy
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
