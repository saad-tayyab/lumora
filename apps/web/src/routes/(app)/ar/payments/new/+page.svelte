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
let customers = $derived(data.customers);
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Record Payment</h1>
		<p class="text-muted-foreground">Record a customer payment</p>
	</div>

	<Card>
		<CardContent>
		<form method="POST" use:enhance class="space-y-6">
			<div class="grid gap-4 md:grid-cols-2">
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
					<Label for="paymentNumber">Payment Number *</Label>
					<Input id="paymentNumber" bind:value={$form.paymentNumber} placeholder="PAY-001" />
				</div>
				<div class="space-y-2">
					<Label for="paymentDate">Payment Date *</Label>
					<DatePicker bind:value={$form.paymentDate} />
				</div>
				<div class="space-y-2">
					<Label for="amount">Amount *</Label>
					<Input
						id="amount"
						type="number"
						step="0.01"
						min="0"
						value={$form.amount}
						oninput={(e) => ($form.amount = Number(e.currentTarget.value))}
						placeholder="0.00"
					/>
				</div>
				<div class="space-y-2">
					<Label for="paymentMethod">Payment Method *</Label>
					<select
						id="paymentMethod"
						bind:value={$form.paymentMethod}
						class="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
					>
						<option value="cash">Cash</option>
						<option value="check">Check</option>
						<option value="bank_transfer">Bank Transfer</option>
						<option value="credit_card">Credit Card</option>
						<option value="online">Online</option>
					</select>
				</div>
				<div class="space-y-2">
					<Label for="referenceNumber">Reference Number</Label>
					<Input id="referenceNumber" bind:value={$form.referenceNumber} placeholder="Check #, transaction ID, etc." />
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
			</div>

			<div class="space-y-2">
				<Label for="notes">Notes</Label>
				<Textarea id="notes" bind:value={$form.notes} rows={3} placeholder="Payment notes..." />
			</div>

			<div class="flex items-center gap-3">
				<Button type="submit" disabled={$submitting}>
					{$submitting ? 'Recording...' : 'Record Payment'}
				</Button>
				<Button variant="outline" href="/ar/payments">Cancel</Button>
			</div>
		</form>
		</CardContent>
	</Card>
</div>
