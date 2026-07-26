<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import type { ActionData, PageData } from './$types';

let { form, data }: { form: ActionData; data: PageData } = $props();
let customers = $derived(data.customers);
let isLoading = $state(false);

$effect(() => {
  if (form?.error) {
    toast.error(form.error);
  }
});
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Record Payment</h1>
		<p class="text-muted-foreground">Record a customer payment</p>
	</div>

	<div class="rounded-lg border bg-card p-6 shadow-sm">
		<form
			method="POST"
			use:enhance={() => {
				isLoading = true;
				return async ({ update }) => {
					isLoading = false;
					await update();
				};
			}}
			class="space-y-6"
		>
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<label for="customerId" class="block text-sm font-medium text-card-foreground">
						Customer *
					</label>
					<select
						id="customerId"
						name="customerId"
						required
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
					>
						<option value="">Select a customer</option>
						{#each customers as customer}
							<option value={customer.id}>{customer.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="paymentNumber" class="block text-sm font-medium text-card-foreground">
						Payment Number *
					</label>
					<input
						id="paymentNumber"
						name="paymentNumber"
						type="text"
						required
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
						placeholder="PAY-001"
					/>
				</div>
				<div>
					<label for="paymentDate" class="block text-sm font-medium text-card-foreground">
						Payment Date *
					</label>
					<input
						id="paymentDate"
						name="paymentDate"
						type="date"
						required
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
					/>
				</div>
				<div>
					<label for="amount" class="block text-sm font-medium text-card-foreground">
						Amount *
					</label>
					<input
						id="amount"
						name="amount"
						type="number"
						step="0.01"
						min="0"
						required
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
						placeholder="0.00"
					/>
				</div>
				<div>
					<label for="paymentMethod" class="block text-sm font-medium text-card-foreground">
						Payment Method *
					</label>
					<select
						id="paymentMethod"
						name="paymentMethod"
						required
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
					>
						<option value="cash">Cash</option>
						<option value="check">Check</option>
						<option value="bank_transfer">Bank Transfer</option>
						<option value="credit_card">Credit Card</option>
						<option value="online">Online</option>
					</select>
				</div>
				<div>
					<label for="referenceNumber" class="block text-sm font-medium text-card-foreground">
						Reference Number
					</label>
					<input
						id="referenceNumber"
						name="referenceNumber"
						type="text"
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
						placeholder="Check #, transaction ID, etc."
					/>
				</div>
				<div>
					<label for="currency" class="block text-sm font-medium text-card-foreground">
						Currency
					</label>
					<select
						id="currency"
						name="currency"
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
					>
						<option value="USD" selected>USD</option>
						<option value="EUR">EUR</option>
						<option value="GBP">GBP</option>
					</select>
				</div>
			</div>

			<div>
				<label for="notes" class="block text-sm font-medium text-card-foreground">Notes</label>
				<textarea
					id="notes"
					name="notes"
					rows="3"
					class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
					placeholder="Payment notes..."
				></textarea>
			</div>

			<div class="flex items-center gap-3">
				<button
					type="submit"
					disabled={isLoading}
					class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isLoading}
						Recording...
					{:else}
						Record Payment
					{/if}
				</button>
				<a
					href="/ar/payments"
					class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent"
				>
					Cancel
				</a>
			</div>
		</form>
	</div>
</div>
