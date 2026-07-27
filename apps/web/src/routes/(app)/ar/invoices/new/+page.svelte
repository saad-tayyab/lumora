<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Button } from '$lib/components/ui/button';
import { Textarea } from '$lib/components/ui/textarea';
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

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Create Invoice</h1>
		<p class="text-muted-foreground">Create a new customer invoice</p>
	</div>

	<div class="rounded-lg border bg-card p-6 shadow-sm">
		<form method="POST" use:enhance class="space-y-6">
			<div class="grid gap-4 md:grid-cols-3">
				<div class="space-y-2">
					<Label for="customerId">Customer *</Label>
					<select
						id="customerId"
						bind:value={$form.customerId}
						class="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
					>
						<option value="">Select a customer</option>
						{#each customers as customer}
							<option value={customer.id}>{customer.name}</option>
						{/each}
					</select>
				</div>
				<div class="space-y-2">
					<Label for="invoiceNumber">Invoice Number *</Label>
					<Input id="invoiceNumber" bind:value={$form.invoiceNumber} placeholder="INV-001" />
				</div>
				<div class="space-y-2">
					<Label for="currency">Currency</Label>
					<select
						id="currency"
						bind:value={$form.currency}
						class="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
					>
						<option value="USD">USD</option>
						<option value="EUR">EUR</option>
						<option value="GBP">GBP</option>
					</select>
				</div>
				<div class="space-y-2">
					<Label for="issueDate">Issue Date *</Label>
					<Input id="issueDate" type="date" bind:value={$form.issueDate} />
				</div>
				<div class="space-y-2">
					<Label for="dueDate">Due Date *</Label>
					<Input id="dueDate" type="date" bind:value={$form.dueDate} />
				</div>
			</div>

			<div>
				<div class="mb-3 flex items-center justify-between">
					<h3 class="text-sm font-medium text-card-foreground">Line Items</h3>
					<Button type="button" variant="outline" size="sm" onclick={addLineItem}>Add Line</Button>
				</div>

				<div class="space-y-3">
					{#each lineItems as item, index}
						<div class="grid items-end gap-3 rounded-md border p-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
							<div class="space-y-1">
								{#if index === 0}
									<Label class="text-xs text-muted-foreground">Description</Label>
								{/if}
								<Input
									type="text"
									name="lineDescription_{index}"
									bind:value={item.description}
									placeholder="Item description"
								/>
							</div>
							<div class="space-y-1">
								{#if index === 0}
									<Label class="text-xs text-muted-foreground">Quantity</Label>
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
							<div class="space-y-1">
								{#if index === 0}
									<Label class="text-xs text-muted-foreground">Unit Price</Label>
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
							<div class="space-y-1">
								{#if index === 0}
									<Label class="text-xs text-muted-foreground">Tax Rate</Label>
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

			<div class="space-y-2">
				<Label for="notes">Notes</Label>
				<Textarea id="notes" bind:value={$form.notes} rows={3} placeholder="Additional notes..." />
			</div>

			<div class="flex items-center gap-3">
				<Button type="submit" disabled={$submitting}>
					{$submitting ? 'Creating...' : 'Create Invoice'}
				</Button>
				<Button variant="outline" href="/ar/invoices">Cancel</Button>
			</div>
		</form>
	</div>
</div>
