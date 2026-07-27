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
		goto('/inv/items');
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/inv/items" class="hover:underline">Items</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Add Item</h1>
	</div>

	<Card>
		<CardContent>
			<form method="POST" use:enhance class="space-y-6">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="name">Name *</Label>
						<Input id="name" bind:value={$form.name} />
						{#if $errors.name}<p class="text-xs text-destructive">{$errors.name}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="sku">SKU *</Label>
						<Input id="sku" bind:value={$form.sku} />
						{#if $errors.sku}<p class="text-xs text-destructive">{$errors.sku}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="categoryId">Category</Label>
						<select id="categoryId" bind:value={$form.categoryId} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
							<option value="">Select category</option>
							{#each data.categories as category}
								<option value={category.id}>{category.name}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-2">
						<Label for="unitOfMeasure">Unit of Measure *</Label>
						<select id="unitOfMeasure" bind:value={$form.unitOfMeasure} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
							<option value="pcs">Pieces</option>
							<option value="kg">Kilograms</option>
							<option value="g">Grams</option>
							<option value="l">Liters</option>
							<option value="ml">Milliliters</option>
							<option value="m">Meters</option>
							<option value="box">Box</option>
							<option value="set">Set</option>
						</select>
						{#if $errors.unitOfMeasure}<p class="text-xs text-destructive">{$errors.unitOfMeasure}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="costPrice">Cost Price *</Label>
						<Input id="costPrice" type="number" step="0.01" min="0" bind:value={$form.costPrice} />
						{#if $errors.costPrice}<p class="text-xs text-destructive">{$errors.costPrice}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="salePrice">Sale Price *</Label>
						<Input id="salePrice" type="number" step="0.01" min="0" bind:value={$form.salePrice} />
						{#if $errors.salePrice}<p class="text-xs text-destructive">{$errors.salePrice}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="reorderPoint">Reorder Point</Label>
						<Input id="reorderPoint" type="number" step="0.01" min="0" bind:value={$form.reorderPoint} />
					</div>
				</div>

				<div class="space-y-2">
					<Label for="description">Description</Label>
					<textarea id="description" bind:value={$form.description} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
				</div>

				<div class="flex justify-end gap-3">
					<Button href="/inv/items" variant="outline">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Item'}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
