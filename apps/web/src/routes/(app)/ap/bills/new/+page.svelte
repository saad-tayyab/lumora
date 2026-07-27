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

<div class="flex flex-col mx-auto max-w-4xl gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/ap/bills" class="hover:underline">Bills</a>
			<span>/</span>
			<span>New Bill</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Record Bill</h1>
	</div>

	<Card.Root>
		<Card.Content>
		<form method="POST" use:enhance>
			<Field.FieldGroup>
				<div class="grid gap-4 md:grid-cols-2">
					<Field.Field>
						<Field.FieldLabel for="vendorId">Vendor *</Field.FieldLabel>
						<Select.Root bind:value={$form.vendorId}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select vendor" />
							</Select.Trigger>
							<Select.Content>
								{#each data.vendors as vendor}
									<Select.Item value={vendor.id}>{vendor.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="billNumber">Bill Number *</Field.FieldLabel>
						<Input id="billNumber" bind:value={$form.billNumber} />
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
					<span class="text-sm font-medium text-card-foreground">Line Items</span>
					<div class="flex flex-col mt-2 gap-3">
						{#each lineItems as _, i}
							<div class="grid grid-cols-[1fr_100px_120px_120px_40px] items-end gap-2">
								<div>
									{#if i === 0}<span class="text-xs text-muted-foreground">Description</span>{/if}
									<Input bind:value={lineItems[i].description} name="lineDescription_{i}" placeholder="Description" />
								</div>
								<div>
									{#if i === 0}<span class="text-xs text-muted-foreground">Qty</span>{/if}
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
								<div>
									{#if i === 0}<span class="text-xs text-muted-foreground">Unit Price</span>{/if}
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
								<div>
									{#if i === 0}<span class="text-xs text-muted-foreground">Amount</span>{/if}
									<Input value={lineItems[i].amount} name="lineAmount_{i}" readonly class="bg-muted" />
								</div>
								<div>
									{#if i === 0}<span class="invisible text-xs">x</span>{/if}
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
					<Field.Field>
						<Field.FieldLabel for="subtotal">Subtotal</Field.FieldLabel>
						<Input id="subtotal" bind:value={$form.subtotal} readonly class="bg-muted" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="taxAmount">Tax Amount</Field.FieldLabel>
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
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="total">Total</Field.FieldLabel>
						<Input id="total" bind:value={$form.total} readonly class="bg-muted font-bold" />
					</Field.Field>
				</div>

				<Field.Field>
					<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
					<Textarea id="notes" bind:value={$form.notes} rows={3} />
				</Field.Field>

				<div class="flex justify-end gap-3">
					<Button variant="outline" href="/ap/bills">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Bill'}
					</Button>
				</div>
			</Field.FieldGroup>
		</form>
		</Card.Content>
	</Card.Root>
</div>
