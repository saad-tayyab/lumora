<script lang="ts">
let {
  vendors,
  bill,
  errors = {},
}: {
  vendors: Array<{ id: string; name: string }>;
  bill?: {
    vendorId: string;
    billNumber: string;
    issueDate: string;
    dueDate: string;
    notes: string | null;
  };
  errors?: Record<string, string[]>;
} = $props();

let vendorId = $state(bill?.vendorId ?? '');
let billNumber = $state(bill?.billNumber ?? '');
let issueDate = $state(bill?.issueDate ?? '');
let dueDate = $state(bill?.dueDate ?? '');
let notes = $state(bill?.notes ?? '');

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

let lineItems = $state<LineItem[]>([
  { description: '', quantity: '1', unitPrice: '', amount: '0' },
]);

function updateLineAmount(index: number) {
  const qty = parseFloat(lineItems[index].quantity) || 0;
  const price = parseFloat(lineItems[index].unitPrice) || 0;
  lineItems[index].amount = (qty * price).toFixed(2);
  lineItems = [...lineItems];
}

function addLineItem() {
  lineItems = [...lineItems, { description: '', quantity: '1', unitPrice: '', amount: '0' }];
}

function removeLineItem(index: number) {
  lineItems = lineItems.filter((_, i) => i !== index);
}

const subtotal = $derived(lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0));

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="vendorId" class="block text-sm font-medium text-card-foreground">Vendor *</label>
				<select id="vendorId" name="vendorId" required bind:value={vendorId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="">Select vendor</option>
					{#each vendors as vendor}
						<option value={vendor.id}>{vendor.name}</option>
					{/each}
				</select>
				{#if errors.vendorId}<p class="mt-1 text-xs text-destructive">{errors.vendorId[0]}</p>{/if}
			</div>
			<div>
				<label for="billNumber" class="block text-sm font-medium text-card-foreground">Bill Number *</label>
				<input id="billNumber" name="billNumber" type="text" required bind:value={billNumber} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="BILL-001" />
			</div>
			<div>
				<label for="issueDate" class="block text-sm font-medium text-card-foreground">Issue Date *</label>
				<input id="issueDate" name="issueDate" type="date" required bind:value={issueDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="dueDate" class="block text-sm font-medium text-card-foreground">Due Date *</label>
				<input id="dueDate" name="dueDate" type="date" required bind:value={dueDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-sm font-medium text-card-foreground">Line Items</h3>
				<button type="button" onclick={addLineItem} class="rounded-md border px-3 py-1 text-sm text-card-foreground hover:bg-accent">+ Add Line</button>
			</div>
			<div class="space-y-3">
				{#each lineItems as item, index}
					<div class="grid items-end gap-3 rounded-md border p-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
						<div>
							{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Description</label>{/if}
							<input type="text" bind:value={item.description} required placeholder="Item description" class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
						</div>
						<div>
							{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Quantity</label>{/if}
							<input type="number" bind:value={item.quantity} step="0.01" min="0" oninput={() => updateLineAmount(index)} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
						</div>
						<div>
							{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Unit Price</label>{/if}
							<input type="number" bind:value={item.unitPrice} step="0.01" min="0" oninput={() => updateLineAmount(index)} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
						</div>
						<div>
							{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Amount</label>{/if}
							<input type="text" bind:value={item.amount} readonly class="mt-1 block w-full rounded-md border bg-muted px-3 py-2 text-sm" />
						</div>
						{#if lineItems.length > 1}
							<button type="button" onclick={() => removeLineItem(index)} class="mb-1 rounded-md border border-destructive/50 px-2 py-2 text-destructive hover:bg-destructive/10">×</button>
						{:else}
							<div></div>
						{/if}
					</div>
				{/each}
			</div>
			<div class="mt-3 flex justify-end">
				<div class="text-sm font-medium text-card-foreground">Subtotal: ${subtotal.toFixed(2)}</div>
			</div>
		</div>

		<div>
			<label for="notes" class="block text-sm font-medium text-card-foreground">Notes</label>
			<textarea id="notes" name="notes" rows="3" bind:value={notes} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{bill ? 'Update Bill' : 'Create Bill'}{/if}
			</button>
			<a href="/ap/bills" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
