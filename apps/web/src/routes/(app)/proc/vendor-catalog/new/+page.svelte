<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Spinner } from '$lib/components/ui/spinner';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import * as Field from '$lib/components/ui/field';
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
			goto('/proc/vendor-catalog');
		}
	}
});
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Add Catalog Item</h1>
		<p class="text-muted-foreground">Add a new item to the vendor catalog</p>
	</div>

	<Card.Root>
		<Card.Content>
			<form method="POST" use:enhance>
				<h2 class="text-lg font-semibold text-card-foreground">Catalog Details</h2>
				<Field.FieldGroup>
					<div class="grid gap-4 md:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="vendorId">Vendor ID *</Field.FieldLabel>
							<Input id="vendorId" bind:value={$form.vendorId} placeholder="Vendor ID" />
							{#if $errors.vendorId}<Field.FieldError>{$errors.vendorId}</Field.FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="itemId">Item ID *</Field.FieldLabel>
							<Input id="itemId" bind:value={$form.itemId} placeholder="Item ID" />
							{#if $errors.itemId}<Field.FieldError>{$errors.itemId}</Field.FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="vendorSku">Vendor SKU</Field.FieldLabel>
							<Input id="vendorSku" bind:value={$form.vendorSku} placeholder="Vendor's SKU" />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="unitPrice">Unit Price *</Field.FieldLabel>
							<Input id="unitPrice" type="number" bind:value={$form.unitPrice} min="0" step="0.01" />
							{#if $errors.unitPrice}<Field.FieldError>{$errors.unitPrice}</Field.FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="leadTimeDays">Lead Time (days)</Field.FieldLabel>
							<Input id="leadTimeDays" type="number" bind:value={$form.leadTimeDays} min="0" placeholder="Delivery lead time" />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="minimumOrderQuantity">Min Order Quantity</Field.FieldLabel>
							<Input id="minimumOrderQuantity" type="number" bind:value={$form.minimumOrderQuantity} min="0" placeholder="Minimum order quantity" />
						</Field.Field>
					</div>
					<Field.Field>
						<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
						<Textarea id="notes" bind:value={$form.notes} rows="3" placeholder="Optional notes"></Textarea>
					</Field.Field>
				</Field.FieldGroup>

				<div class="flex items-center justify-end gap-3">
					<a href="/proc/vendor-catalog" class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</a>
					<Button type="submit" disabled={$submitting}>
						{#if $submitting}<Spinner data-icon="inline-start" class="text-primary-foreground" />{/if}
						Add Catalog Item
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
