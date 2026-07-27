<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Card, CardContent } from '$lib/components/ui/card';

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

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Add Catalog Item</h1>
		<p class="text-muted-foreground">Add a new item to the vendor catalog</p>
	</div>

	<Card>
		<CardContent>
			<form method="POST" use:enhance class="space-y-6">
				<h2 class="text-lg font-semibold text-card-foreground">Catalog Details</h2>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<label for="vendorId" class="mb-1 block text-sm font-medium text-card-foreground">Vendor ID *</label>
						<Input id="vendorId" bind:value={$form.vendorId} placeholder="Vendor ID" />
						{#if $errors.vendorId}<p class="text-xs text-destructive">{$errors.vendorId}</p>{/if}
					</div>
					<div class="space-y-2">
						<label for="itemId" class="mb-1 block text-sm font-medium text-card-foreground">Item ID *</label>
						<Input id="itemId" bind:value={$form.itemId} placeholder="Item ID" />
						{#if $errors.itemId}<p class="text-xs text-destructive">{$errors.itemId}</p>{/if}
					</div>
					<div class="space-y-2">
						<label for="vendorSku" class="mb-1 block text-sm font-medium text-card-foreground">Vendor SKU</label>
						<Input id="vendorSku" bind:value={$form.vendorSku} placeholder="Vendor's SKU" />
					</div>
					<div class="space-y-2">
						<label for="unitPrice" class="mb-1 block text-sm font-medium text-card-foreground">Unit Price *</label>
						<Input id="unitPrice" type="number" bind:value={$form.unitPrice} min="0" step="0.01" />
						{#if $errors.unitPrice}<p class="text-xs text-destructive">{$errors.unitPrice}</p>{/if}
					</div>
					<div class="space-y-2">
						<label for="leadTimeDays" class="mb-1 block text-sm font-medium text-card-foreground">Lead Time (days)</label>
						<Input id="leadTimeDays" type="number" bind:value={$form.leadTimeDays} min="0" placeholder="Delivery lead time" />
					</div>
					<div class="space-y-2">
						<label for="minimumOrderQuantity" class="mb-1 block text-sm font-medium text-card-foreground">Min Order Quantity</label>
						<Input id="minimumOrderQuantity" type="number" bind:value={$form.minimumOrderQuantity} min="0" placeholder="Minimum order quantity" />
					</div>
				</div>
				<div class="space-y-2">
					<label for="notes" class="mb-1 block text-sm font-medium text-card-foreground">Notes</label>
					<textarea id="notes" bind:value={$form.notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Optional notes"></textarea>
				</div>

				<div class="flex items-center justify-end gap-3">
					<a href="/proc/vendor-catalog" class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</a>
					<Button type="submit" disabled={$submitting}>
						{#if $submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}
						Add Catalog Item
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
