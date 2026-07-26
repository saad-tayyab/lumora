<script lang="ts">
import type { Invoice, Payment } from '$lib/types';
import { formatCurrency } from '$lib/utils/format';

let { payment, invoices }: { payment: Payment; invoices: Invoice[] } = $props();

let applications = $state<{ invoiceId: string; amount: string }[]>([]);

const remaining = $derived(
  parseFloat(payment.amount) -
    applications.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0),
);

function addApplication() {
  applications = [...applications, { invoiceId: '', amount: '0' }];
}

function removeApplication(index: number) {
  applications = applications.filter((_, i) => i !== index);
}

function updateApplication(index: number, field: string, value: string) {
  const updated = [...applications];
  (updated[index] as Record<string, string>)[field] = value;
  applications = updated;
}
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
	<div class="flex items-center justify-between">
		<div>
			<h3 class="text-lg font-semibold text-card-foreground">Apply Payment</h3>
			<p class="text-sm text-muted-foreground">
				Payment: {formatCurrency(payment.amount)} | Remaining: {formatCurrency(remaining)}
			</p>
		</div>
		<button type="button" onclick={addApplication} class="rounded-md border px-3 py-1 text-sm text-card-foreground hover:bg-accent">
			+ Add Application
		</button>
	</div>

	{#each applications as app, index}
		<div class="grid items-end gap-3 rounded-md border p-3 md:grid-cols-[2fr_1fr_auto]">
			<div>
				{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Invoice</label>{/if}
				<select value={app.invoiceId} oninput={(e) => updateApplication(index, 'invoiceId', (e.target as HTMLSelectElement).value)} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="">Select invoice</option>
					{#each invoices as inv}
						<option value={inv.id}>{inv.invoiceNumber} ({formatCurrency(inv.balanceDue)})</option>
					{/each}
				</select>
			</div>
			<div>
				{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Amount</label>{/if}
				<input type="number" value={app.amount} oninput={(e) => updateApplication(index, 'amount', (e.target as HTMLInputElement).value)} step="0.01" min="0" class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			{#if applications.length > 1}
				<button type="button" onclick={() => removeApplication(index)} class="mb-1 rounded-md border border-destructive/50 px-2 py-2 text-destructive hover:bg-destructive/10">×</button>
			{:else}
				<div></div>
			{/if}
		</div>
	{/each}
</div>
