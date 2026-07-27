<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import * as Card from '$lib/components/ui/card';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/inv/stock-movements');
		}
	}
});
</script>

<div class="mx-auto max-w-2xl flex flex-col gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/inv/stock-movements" class="hover:underline">Stock Movements</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Record Stock Movement</h1>
	</div>

	<Card.Root>
		<Card.Content>
			<form method="POST" use:enhance>
				<Field.FieldGroup>
					<div class="grid gap-4 md:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="itemId">Item *</Field.FieldLabel>
						<Select.Root bind:value={$form.itemId}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select item" />
							</Select.Trigger>
							<Select.Content>
								{#each data.items as item}
									<Select.Item value={item.id}>{item.name} ({item.sku})</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
							{#if $errors.itemId}<p class="text-xs text-destructive">{$errors.itemId}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="warehouseId">Warehouse *</Field.FieldLabel>
						<Select.Root bind:value={$form.warehouseId}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select warehouse" />
							</Select.Trigger>
							<Select.Content>
								{#each data.warehouses as warehouse}
									<Select.Item value={warehouse.id}>{warehouse.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
							{#if $errors.warehouseId}<p class="text-xs text-destructive">{$errors.warehouseId}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="type">Movement Type *</Field.FieldLabel>
						<Select.Root bind:value={$form.type}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select type" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="in">Stock In</Select.Item>
								<Select.Item value="out">Stock Out</Select.Item>
								<Select.Item value="transfer">Transfer</Select.Item>
								<Select.Item value="adjustment">Adjustment</Select.Item>
							</Select.Content>
						</Select.Root>
							{#if $errors.type}<p class="text-xs text-destructive">{$errors.type}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="quantity">Quantity *</Field.FieldLabel>
							<Input id="quantity" type="number" min="0.01" step="0.01" bind:value={$form.quantity} />
							{#if $errors.quantity}<p class="text-xs text-destructive">{$errors.quantity}</p>{/if}
						</Field.Field>
					</div>

					<div class="grid gap-4 md:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="referenceType">Reference Type</Field.FieldLabel>
							<Input id="referenceType" bind:value={$form.referenceType} placeholder="e.g., purchase_order" />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="referenceId">Reference ID</Field.FieldLabel>
							<Input id="referenceId" bind:value={$form.referenceId} />
						</Field.Field>
					</div>

					<Field.Field>
						<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
						<Textarea id="notes" bind:value={$form.notes} rows="3" />
					</Field.Field>

					<div class="flex justify-end gap-3">
						<Button href="/inv/stock-movements" variant="outline">Cancel</Button>
						<Button type="submit" disabled={$submitting}>
							{$submitting ? 'Recording...' : 'Record Movement'}
						</Button>
					</div>
				</Field.FieldGroup>
			</form>
		</Card.Content>
	</Card.Root>
</div>
