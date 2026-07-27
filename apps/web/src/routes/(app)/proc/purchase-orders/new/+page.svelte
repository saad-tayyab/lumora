<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Spinner } from '$lib/components/ui/spinner';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import DatePicker from '$lib/components/ui/date-picker.svelte';
import * as Card from '$lib/components/ui/card';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

function addLineItem() {
	$form.lineItems = [...$form.lineItems, { itemId: '', description: '', quantity: 1, unitPrice: 0 }];
}

function removeLineItem(index: number) {
	if ($form.lineItems.length > 1) {
		$form.lineItems = $form.lineItems.filter((_: any, i: number) => i !== index);
	}
}

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/proc/purchase-orders');
		}
	}
});
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Purchase Order</h1>
		<p class="text-muted-foreground">Create a new purchase order</p>
	</div>

	<form method="POST" use:enhance>
		<Card.Root>
			<Card.Content>
				<Card.Header>
				<Card.Title>Order Details</Card.Title>
			</Card.Header>
				<Field.FieldGroup>
					<div class="grid gap-4 md:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="vendorId">Vendor *</Field.FieldLabel>
						<Select.Root bind:value={$form.vendorId}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select vendor" />
							</Select.Trigger>
							<Select.Content>
							</Select.Content>
						</Select.Root>
							{#if $errors.vendorId}<Field.FieldError>{$errors.vendorId}</Field.FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="expectedDeliveryDate">Expected Delivery Date</Field.FieldLabel>
							<DatePicker bind:value={$form.expectedDeliveryDate} />
						</Field.Field>
					</div>
					<Field.Field>
						<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
						<Textarea id="notes" bind:value={$form.notes} rows="3" placeholder="Optional notes"></Textarea>
					</Field.Field>
				</Field.FieldGroup>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-card-foreground">Line Items</h2>
					<Button type="button" variant="outline" onclick={addLineItem}>+ Add Line</Button>
				</div>
				{#if $errors.lineItems}<p class="mb-2 text-xs text-destructive">{$errors.lineItems}</p>{/if}
				<div class="flex flex-col gap-4">
					{#each $form.lineItems as item, index}
						<div class="grid items-end gap-3 rounded-md border p-4 md:grid-cols-4">
							<Field.Field>
								<Field.FieldLabel class="text-xs">Item *</Field.FieldLabel>
								<Input bind:value={item.itemId} placeholder="Item ID" />
							</Field.Field>
							<Field.Field>
								<Field.FieldLabel class="text-xs">Description</Field.FieldLabel>
								<Input bind:value={item.description} placeholder="Description" />
							</Field.Field>
							<Field.Field>
								<Field.FieldLabel class="text-xs">Quantity *</Field.FieldLabel>
								<Input type="number" bind:value={item.quantity} min="1" step="1" />
							</Field.Field>
							<div class="flex gap-2">
								<Field.Field class="flex-1">
									<Field.FieldLabel class="text-xs">Unit Price *</Field.FieldLabel>
									<Input type="number" bind:value={item.unitPrice} min="0" step="0.01" />
								</Field.Field>
								{#if $form.lineItems.length > 1}
									<button type="button" onclick={() => removeLineItem(index)} class="mb-0.5 rounded-md border px-2 py-2 text-sm text-destructive hover:bg-destructive/10">X</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<div class="flex items-center justify-end gap-3">
			<Button variant="outline" href="/proc/purchase-orders">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{#if $submitting}<Spinner data-icon="inline-start" class="text-primary-foreground" />{/if}
				Create Purchase Order
			</Button>
		</div>
	</form>
</div>
