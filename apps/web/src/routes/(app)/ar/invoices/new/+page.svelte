<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import * as Field from '$lib/components/ui/field';
import { Input } from '$lib/components/ui/input';
import { Button } from '$lib/components/ui/button';
import { Textarea } from '$lib/components/ui/textarea';
import * as Card from '$lib/components/ui/card';
import * as Select from '$lib/components/ui/select';
import DatePicker from '$lib/components/ui/date-picker.svelte';
import { formatCurrency } from '$lib/utils/format';

let { data } = $props();
const { form, enhance, submitting } = superForm(data.form);
let customers = $derived(data.customers);

let lineItems = $state([
	{ description: '', quantity: '1', unitPrice: '0', taxRate: '', sortOrder: 0 },
]);

const subtotal = $derived(
	lineItems.reduce((sum, item) => {
		const qty = parseFloat(item.quantity) || 0;
		const price = parseFloat(item.unitPrice) || 0;
		return sum + qty * price;
	}, 0),
);

function addLineItem() {
	lineItems = [
		...lineItems,
		{ description: '', quantity: '1', unitPrice: '0', taxRate: '', sortOrder: lineItems.length },
	];
}

function removeLineItem(index: number) {
	lineItems = lineItems.filter((_, i) => i !== index);
}
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Create Invoice</h1>
		<p class="text-muted-foreground">Create a new customer invoice</p>
	</div>

	<Card.Root>
		<Card.Content>
		<form method="POST" use:enhance>
			<Field.FieldGroup>
				<div class="grid gap-4 md:grid-cols-3">
					<Field.Field>
						<Field.FieldLabel for="customerId">Customer *</Field.FieldLabel>
						<Select.Root bind:value={$form.customerId}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select a customer" />
							</Select.Trigger>
							<Select.Content>
								{#each customers as customer}
									<Select.Item value={customer.id}>{customer.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="invoiceNumber">Invoice Number *</Field.FieldLabel>
						<Input id="invoiceNumber" bind:value={$form.invoiceNumber} placeholder="INV-001" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="currency">Currency</Field.FieldLabel>
						<Select.Root bind:value={$form.currency}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select currency" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="USD">USD</Select.Item>
								<Select.Item value="EUR">EUR</Select.Item>
								<Select.Item value="GBP">GBP</Select.Item>
							</Select.Content>
						</Select.Root>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="issueDate">Issue Date *</Field.FieldLabel>
						<DatePicker bind:value={$form.issueDate} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="dueDate">Due Date *</Field.FieldLabel>
						<DatePicker bind:value={$form.dueDate} />
					</Field.Field>
				</div>

				<div>
					<div class="mb-3 flex items-center justify-between">
						<h3 class="text-sm font-medium text-card-foreground">Line Items</h3>
						<Button type="button" variant="outline" size="sm" onclick={addLineItem}>Add Line</Button>
					</div>

					<div class="flex flex-col gap-3">
						{#each lineItems as item, index}
							<div class="grid items-end gap-3 rounded-md border p-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
								<div>
									{#if index === 0}
										<span class="text-xs text-muted-foreground">Description</span>
									{/if}
									<Input
										type="text"
										name="lineDescription_{index}"
										bind:value={item.description}
										placeholder="Item description"
									/>
								</div>
								<div>
									{#if index === 0}
										<span class="text-xs text-muted-foreground">Quantity</span>
									{/if}
									<Input
										type="number"
										name="lineQuantity_{index}"
										value={item.quantity}
										oninput={(e) => (item.quantity = e.currentTarget.value)}
										step="0.01"
										min="0"
									/>
								</div>
								<div>
									{#if index === 0}
										<span class="text-xs text-muted-foreground">Unit Price</span>
									{/if}
									<Input
										type="number"
										name="lineUnitPrice_{index}"
										value={item.unitPrice}
										oninput={(e) => (item.unitPrice = e.currentTarget.value)}
										step="0.01"
										min="0"
									/>
								</div>
								<div>
									{#if index === 0}
										<span class="text-xs text-muted-foreground">Tax Rate</span>
									{/if}
									<Input
										type="number"
										name="lineTaxRate_{index}"
										value={item.taxRate}
										oninput={(e) => (item.taxRate = e.currentTarget.value)}
										step="0.0001"
										min="0"
										placeholder="0.0000"
									/>
								</div>
								{#if lineItems.length > 1}
									<Button
										type="button"
										variant="destructive"
										size="icon-sm"
										onclick={() => removeLineItem(index)}
										class="mb-1"
										aria-label="Remove line"
									>
										&times;
									</Button>
								{:else}
									<div></div>
								{/if}
							</div>
						{/each}
					</div>

					<div class="mt-3 flex justify-end">
						<div class="text-sm font-medium text-card-foreground">
							Subtotal: {formatCurrency(subtotal)}
						</div>
					</div>
				</div>

				<Field.Field>
					<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
					<Textarea id="notes" bind:value={$form.notes} rows={3} placeholder="Additional notes..." />
				</Field.Field>

				<div class="flex items-center gap-3">
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Invoice'}
					</Button>
					<Button variant="outline" href="/ar/invoices">Cancel</Button>
				</div>
			</Field.FieldGroup>
		</form>
		</Card.Content>
	</Card.Root>
</div>
