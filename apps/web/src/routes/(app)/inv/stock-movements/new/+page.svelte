<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Card, CardContent } from '$lib/components/ui/card';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		toast.success($message);
		goto('/inv/stock-movements');
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/inv/stock-movements" class="hover:underline">Stock Movements</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Record Stock Movement</h1>
	</div>

	<Card>
		<CardContent>
			<form method="POST" use:enhance class="space-y-6">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="itemId">Item *</Label>
						<select id="itemId" bind:value={$form.itemId} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
							<option value="">Select item</option>
							{#each data.items as item}
								<option value={item.id}>{item.name} ({item.sku})</option>
							{/each}
						</select>
						{#if $errors.itemId}<p class="text-xs text-destructive">{$errors.itemId}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="warehouseId">Warehouse *</Label>
						<select id="warehouseId" bind:value={$form.warehouseId} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
							<option value="">Select warehouse</option>
							{#each data.warehouses as warehouse}
								<option value={warehouse.id}>{warehouse.name}</option>
							{/each}
						</select>
						{#if $errors.warehouseId}<p class="text-xs text-destructive">{$errors.warehouseId}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="type">Movement Type *</Label>
						<select id="type" bind:value={$form.type} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
							<option value="in">Stock In</option>
							<option value="out">Stock Out</option>
							<option value="transfer">Transfer</option>
							<option value="adjustment">Adjustment</option>
						</select>
						{#if $errors.type}<p class="text-xs text-destructive">{$errors.type}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="quantity">Quantity *</Label>
						<Input id="quantity" type="number" min="0.01" step="0.01" bind:value={$form.quantity} />
						{#if $errors.quantity}<p class="text-xs text-destructive">{$errors.quantity}</p>{/if}
					</div>
				</div>

				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="referenceType">Reference Type</Label>
						<Input id="referenceType" bind:value={$form.referenceType} placeholder="e.g., purchase_order" />
					</div>
					<div class="space-y-2">
						<Label for="referenceId">Reference ID</Label>
						<Input id="referenceId" bind:value={$form.referenceId} />
					</div>
				</div>

				<div class="space-y-2">
					<Label for="notes">Notes</Label>
					<textarea id="notes" bind:value={$form.notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
				</div>

				<div class="flex justify-end gap-3">
					<Button href="/inv/stock-movements" variant="outline">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Recording...' : 'Record Movement'}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
