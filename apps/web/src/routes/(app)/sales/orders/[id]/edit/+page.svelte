<script lang="ts">
import { enhance } from '$app/forms';
import { toast } from 'svelte-sonner';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent } from '$lib/components/ui/card';
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

<div class="mx-auto max-w-2xl space-y-6">
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
			<Card>
				<CardContent class="space-y-4">
					<div class="space-y-1.5">
						<label for="customerId" class="text-sm font-medium text-foreground">Customer ID *</label>
						<input id="customerId" name="customerId" bind:value={customerId} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
					</div>
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-1.5">
							<label for="orderDate" class="text-sm font-medium text-foreground">Order Date *</label>
							<DatePicker bind:value={orderDate} />
							<input type="hidden" name="orderDate" value={orderDate} />
						</div>
						<div class="space-y-1.5">
							<label for="expectedDeliveryDate" class="text-sm font-medium text-foreground">Expected Delivery</label>
							<DatePicker bind:value={expectedDeliveryDate} />
							<input type="hidden" name="expectedDeliveryDate" value={expectedDeliveryDate} />
						</div>
					</div>
					<div class="space-y-1.5">
						<label for="notes" class="text-sm font-medium text-foreground">Notes</label>
						<textarea id="notes" name="notes" bind:value={notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
					</div>

					<div class="flex justify-end gap-3 pt-4">
						<Button href="/sales/orders/{data.order.id}" variant="outline">Cancel</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? 'Saving...' : 'Save Changes'}
						</Button>
					</div>
				</CardContent>
			</Card>
		</form>
	{:else}
		<div class="py-12 text-center text-muted-foreground">Sales order not found</div>
	{/if}
</div>
