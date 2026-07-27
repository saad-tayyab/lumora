<script lang="ts">
import { enhance } from '$app/forms';
import { toast } from 'svelte-sonner';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import * as Field from '$lib/components/ui/field';
import * as Card from '$lib/components/ui/card';
import DatePicker from '$lib/components/ui/date-picker.svelte';
import type { PageData, ActionData } from './$types';

let { data, form }: { data: PageData; form: ActionData } = $props();
let submitting = $state(false);

let customerId = $state(data.order?.customerId ?? '');
let orderDate = $state(data.order?.orderDate?.split('T')[0] ?? '');
let expectedDeliveryDate = $state(data.order?.expectedDeliveryDate?.split('T')[0] ?? '');
let notes = $state(data.order?.notes ?? '');

$effect(() => {
	if (form?.error) {
		toast.error(form.error);
	}
});
</script>

<div class="mx-auto max-w-2xl flex flex-col gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/sales/orders" class="hover:underline">Sales Orders</a>
			<span>/</span>
			<span>Edit</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Edit Sales Order</h1>
		<p class="text-muted-foreground">{data.order?.orderNumber}</p>
	</div>

	{#if data.order}
		<form
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<Card.Root>
				<Card.Content>
					<Field.FieldGroup>
						<Field.Field>
							<Field.FieldLabel for="customerId">Customer ID *</Field.FieldLabel>
							<Input id="customerId" name="customerId" bind:value={customerId} required />
						</Field.Field>
						<div class="grid gap-4 md:grid-cols-2">
							<Field.Field>
								<Field.FieldLabel for="orderDate">Order Date *</Field.FieldLabel>
								<DatePicker bind:value={orderDate} />
								<input type="hidden" name="orderDate" value={orderDate} />
							</Field.Field>
							<Field.Field>
								<Field.FieldLabel for="expectedDeliveryDate">Expected Delivery</Field.FieldLabel>
								<DatePicker bind:value={expectedDeliveryDate} />
								<input type="hidden" name="expectedDeliveryDate" value={expectedDeliveryDate} />
							</Field.Field>
						</div>
						<Field.Field>
							<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
							<Textarea id="notes" name="notes" bind:value={notes} rows="3"></Textarea>
						</Field.Field>
					</Field.FieldGroup>

					<div class="flex justify-end gap-3 pt-4">
						<Button href="/sales/orders/{data.order.id}" variant="outline">Cancel</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? 'Saving...' : 'Save Changes'}
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</form>
	{:else}
		<div class="py-12 text-center text-muted-foreground">Sales order not found</div>
	{/if}
</div>
