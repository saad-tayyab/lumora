<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import DatePicker from '$lib/components/ui/date-picker.svelte';
import { Card, CardContent } from '$lib/components/ui/card';

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
		toast.success($message);
		goto('/proc/purchase-orders');
	}
});
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Purchase Order</h1>
		<p class="text-muted-foreground">Create a new purchase order</p>
	</div>

	<form method="POST" use:enhance class="space-y-6">
		<Card>
			<CardContent>
				<h2 class="mb-4 text-lg font-semibold text-card-foreground">Order Details</h2>
				<div class="grid gap-4 md:grid-cols-2">
					<div>
						<label for="vendorId" class="mb-1 block text-sm font-medium text-card-foreground">Vendor *</label>
						<select id="vendorId" bind:value={$form.vendorId} class="w-full rounded-md border bg-background px-3 py-2 text-sm" required>
							<option value="">Select vendor</option>
						</select>
						{#if $errors.vendorId}<p class="text-xs text-destructive">{$errors.vendorId}</p>{/if}
					</div>
					<div>
						<label for="expectedDeliveryDate" class="mb-1 block text-sm font-medium text-card-foreground">Expected Delivery Date</label>
						<DatePicker bind:value={$form.expectedDeliveryDate} />
					</div>
				</div>
				<div class="mt-4">
					<label for="notes" class="mb-1 block text-sm font-medium text-card-foreground">Notes</label>
					<textarea id="notes" bind:value={$form.notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Optional notes"></textarea>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardContent>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-card-foreground">Line Items</h2>
					<Button type="button" variant="outline" onclick={addLineItem}>+ Add Line</Button>
				</div>
				{#if $errors.lineItems}<p class="mb-2 text-xs text-destructive">{$errors.lineItems}</p>{/if}
				<div class="space-y-4">
					{#each $form.lineItems as item, index}
						<div class="grid items-end gap-3 rounded-md border p-4 md:grid-cols-4">
							<div>
								<label class="mb-1 block text-xs font-medium text-muted-foreground">Item *</label>
								<Input bind:value={item.itemId} placeholder="Item ID" />
							</div>
							<div>
								<label class="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
								<Input bind:value={item.description} placeholder="Description" />
							</div>
							<div>
								<label class="mb-1 block text-xs font-medium text-muted-foreground">Quantity *</label>
								<Input type="number" bind:value={item.quantity} min="1" step="1" />
							</div>
							<div class="flex gap-2">
								<div class="flex-1">
									<label class="mb-1 block text-xs font-medium text-muted-foreground">Unit Price *</label>
									<Input type="number" bind:value={item.unitPrice} min="0" step="0.01" />
								</div>
								{#if $form.lineItems.length > 1}
									<button type="button" onclick={() => removeLineItem(index)} class="mb-0.5 rounded-md border px-2 py-2 text-sm text-destructive hover:bg-destructive/10">X</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>

		<div class="flex items-center justify-end gap-3">
			<Button variant="outline" href="/proc/purchase-orders">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{#if $submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}
				Create Purchase Order
			</Button>
		</div>
	</form>
</div>
