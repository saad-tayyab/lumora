<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import * as Card from '$lib/components/ui/card';
import * as Field from '$lib/components/ui/field';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/inv/items');
		}
	}
});
</script>

<div class="mx-auto max-w-2xl flex flex-col gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/inv/items" class="hover:underline">Items</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Add Item</h1>
	</div>

	<Card.Root>
		<Card.Content>
			<form method="POST" use:enhance>
				<Field.FieldGroup>
					<div class="grid gap-4 md:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="name">Name *</Field.FieldLabel>
							<Input id="name" bind:value={$form.name} />
							{#if $errors.name}<p class="text-xs text-destructive">{$errors.name}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="sku">SKU *</Field.FieldLabel>
							<Input id="sku" bind:value={$form.sku} />
							{#if $errors.sku}<p class="text-xs text-destructive">{$errors.sku}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="categoryId">Category</Field.FieldLabel>
						<Select.Root bind:value={$form.categoryId}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select category" />
							</Select.Trigger>
							<Select.Content>
								{#each data.categories as category}
									<Select.Item value={category.id}>{category.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="unitOfMeasure">Unit of Measure *</Field.FieldLabel>
						<Select.Root bind:value={$form.unitOfMeasure}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select unit" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="pcs">Pieces</Select.Item>
								<Select.Item value="kg">Kilograms</Select.Item>
								<Select.Item value="g">Grams</Select.Item>
								<Select.Item value="l">Liters</Select.Item>
								<Select.Item value="ml">Milliliters</Select.Item>
								<Select.Item value="m">Meters</Select.Item>
								<Select.Item value="box">Box</Select.Item>
								<Select.Item value="set">Set</Select.Item>
							</Select.Content>
						</Select.Root>
							{#if $errors.unitOfMeasure}<p class="text-xs text-destructive">{$errors.unitOfMeasure}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="costPrice">Cost Price *</Field.FieldLabel>
							<Input id="costPrice" type="number" step="0.01" min="0" bind:value={$form.costPrice} />
							{#if $errors.costPrice}<p class="text-xs text-destructive">{$errors.costPrice}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="salePrice">Sale Price *</Field.FieldLabel>
							<Input id="salePrice" type="number" step="0.01" min="0" bind:value={$form.salePrice} />
							{#if $errors.salePrice}<p class="text-xs text-destructive">{$errors.salePrice}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="reorderPoint">Reorder Point</Field.FieldLabel>
							<Input id="reorderPoint" type="number" step="0.01" min="0" bind:value={$form.reorderPoint} />
						</Field.Field>
					</div>

					<Field.Field>
						<Field.FieldLabel for="description">Description</Field.FieldLabel>
						<Textarea id="description" bind:value={$form.description} rows="3" />
					</Field.Field>

					<div class="flex justify-end gap-3">
						<Button href="/inv/items" variant="outline">Cancel</Button>
						<Button type="submit" disabled={$submitting}>
							{$submitting ? 'Creating...' : 'Create Item'}
						</Button>
					</div>
				</Field.FieldGroup>
			</form>
		</Card.Content>
	</Card.Root>
</div>
