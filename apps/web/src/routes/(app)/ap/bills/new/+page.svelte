<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { Input } from '$lib/components/ui/input';
import DatePicker from '$lib/components/ui/date-picker.svelte';
import { Label } from '$lib/components/ui/label';
import { Button } from '$lib/components/ui/button';
import { Textarea } from '$lib/components/ui/textarea';
import { Card, CardContent } from '$lib/components/ui/card';

let { data } = $props();
const { form, enhance, submitting } = superForm(data.form);

let lineItems = $state([
	{ description: '', quantity: '1', unitPrice: '', amount: '0' },
]);

function updateLineAmount(index: number) {
	const qty = parseFloat(lineItems[index].quantity) || 0;
	const price = parseFloat(lineItems[index].unitPrice) || 0;
	lineItems[index].amount = (qty * price).toFixed(2);
	recalculateTotal();
}

function recalculateTotal() {
	const sub = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
	$form.subtotal = sub.toFixed(2);
	const tax = parseFloat($form.taxAmount) || 0;
	$form.total = (sub + tax).toFixed(2);
}

function addLineItem() {
	lineItems = [...lineItems, { description: '', quantity: '1', unitPrice: '', amount: '0' }];
}

function removeLineItem(index: number) {
	lineItems = lineItems.filter((_, i) => i !== index);
	recalculateTotal();
}
</script>

<div class="mx-auto max-w-4xl space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/ap/bills" class="hover:underline">Bills</a>
			<span>/</span>
			<span>New Bill</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Record Bill</h1>
	</div>

	<Card>
		<CardContent>
		<form method="POST" use:enhance class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-2">
				<Label for="vendorId">Vendor *</Label>
				<select
					id="vendorId"
					bind:value={$form.vendorId}
					class="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
				>
					<option value="">Select vendor</option>
					{#each data.vendors as vendor}
						<option value={vendor.id}>{vendor.name}</option>
					{/each}
				</select>
			</div>
			<div class="space-y-2">
				<Label for="billNumber">Bill Number *</Label>
				<Input id="billNumber" bind:value={$form.billNumber} />
			</div>
			<div class="space-y-2">
				<Label for="issueDate">Issue Date *</Label>
				<DatePicker bind:value={$form.issueDate} />
			</div>
			<div class="space-y-2">
				<Label for="dueDate">Due Date *</Label>
				<DatePicker bind:value={$form.dueDate} />
			</div>
		</div>

		<div class="space-y-2">
			<Label>Line Items</Label>
			<div class="space-y-3">
				{#each lineItems as _, i}
					<div class="grid grid-cols-[1fr_100px_120px_120px_40px] items-end gap-2">
						<div class="space-y-1">
							{#if i === 0}<Label class="text-xs text-muted-foreground">Description</Label>{/if}
							<Input bind:value={lineItems[i].description} name="lineDescription_{i}" placeholder="Description" />
						</div>
						<div class="space-y-1">
							{#if i === 0}<Label class="text-xs text-muted-foreground">Qty</Label>{/if}
							<Input
								value={lineItems[i].quantity}
								name="lineQuantity_{i}"
								type="number"
								min="0"
								step="0.01"
								oninput={(e) => {
									lineItems[i].quantity = e.currentTarget.value;
									updateLineAmount(i);
								}}
							/>
						</div>
						<div class="space-y-1">
							{#if i === 0}<Label class="text-xs text-muted-foreground">Unit Price</Label>{/if}
							<Input
								value={lineItems[i].unitPrice}
								name="lineUnitPrice_{i}"
								type="number"
								min="0"
								step="0.01"
								oninput={(e) => {
									lineItems[i].unitPrice = e.currentTarget.value;
									updateLineAmount(i);
								}}
							/>
						</div>
						<div class="space-y-1">
							{#if i === 0}<Label class="text-xs text-muted-foreground">Amount</Label>{/if}
							<Input value={lineItems[i].amount} name="lineAmount_{i}" readonly class="bg-muted" />
						</div>
						<div>
							{#if i === 0}<Label class="invisible text-xs">x</Label>{/if}
							<Button type="button" variant="destructive" size="icon-sm" onclick={() => removeLineItem(i)}>
								&times;
							</Button>
						</div>
					</div>
				{/each}
			</div>
			<Button type="button" variant="ghost" size="sm" onclick={addLineItem} class="mt-2">
				+ Add Line Item
			</Button>
		</div>

		<div class="grid gap-4 md:grid-cols-3">
			<div class="space-y-2">
				<Label for="subtotal">Subtotal</Label>
				<Input id="subtotal" bind:value={$form.subtotal} readonly class="bg-muted" />
			</div>
			<div class="space-y-2">
				<Label for="taxAmount">Tax Amount</Label>
				<Input
					id="taxAmount"
					type="number"
					min="0"
					step="0.01"
					value={$form.taxAmount}
					oninput={(e) => {
						$form.taxAmount = e.currentTarget.value;
						recalculateTotal();
					}}
				/>
			</div>
			<div class="space-y-2">
				<Label for="total">Total</Label>
				<Input id="total" bind:value={$form.total} readonly class="bg-muted font-bold" />
			</div>
		</div>

		<div class="space-y-2">
			<Label for="notes">Notes</Label>
			<Textarea id="notes" bind:value={$form.notes} rows={3} />
		</div>

		<div class="flex justify-end gap-3">
			<Button variant="outline" href="/ap/bills">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{$submitting ? 'Creating...' : 'Create Bill'}
			</Button>
		</div>
	</form>
		</CardContent>
	</Card>
</div>
