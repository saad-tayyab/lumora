<script lang="ts">
import type { Customer } from '$lib/types';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import { Button } from '$lib/components/ui/button';

let { customers, errors = {} }: { customers: Customer[]; errors?: Record<string, string[]> } =
  $props();

let customerId = $state('');
let paymentNumber = $state('');
let paymentDate = $state('');
let amount = $state('');
let paymentMethod = $state('cash');
let referenceNumber = $state('');
let currency = $state('USD');
let notes = $state('');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST">
		<Field.FieldGroup>
			<div class="grid gap-4 md:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel for="customerId">Customer *</Field.FieldLabel>
					<Select.Root bind:value={customerId}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Select a customer" />
						</Select.Trigger>
						<Select.Content>
							{#each customers as customer}
								<Select.Item value={customer.id}>{customer.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					{#if errors.customerId}<p class="text-xs text-destructive">{errors.customerId[0]}</p>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="paymentNumber">Payment Number *</Field.FieldLabel>
					<Input id="paymentNumber" name="paymentNumber" type="text" required bind:value={paymentNumber} placeholder="PAY-001" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="paymentDate">Payment Date *</Field.FieldLabel>
					<Input id="paymentDate" name="paymentDate" type="date" required bind:value={paymentDate} />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="amount">Amount *</Field.FieldLabel>
					<Input id="amount" name="amount" type="number" step="0.01" min="0" required bind:value={amount} placeholder="0.00" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="paymentMethod">Payment Method *</Field.FieldLabel>
					<Select.Root bind:value={paymentMethod}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Select method" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="cash">Cash</Select.Item>
							<Select.Item value="check">Check</Select.Item>
							<Select.Item value="bank_transfer">Bank Transfer</Select.Item>
							<Select.Item value="credit_card">Credit Card</Select.Item>
							<Select.Item value="online">Online</Select.Item>
						</Select.Content>
					</Select.Root>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="referenceNumber">Reference Number</Field.FieldLabel>
					<Input id="referenceNumber" name="referenceNumber" type="text" bind:value={referenceNumber} placeholder="Check #, transaction ID" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="currency">Currency</Field.FieldLabel>
					<Select.Root bind:value={currency}>
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
			</div>

			<Field.Field>
				<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
				<Textarea id="notes" name="notes" rows="3" bind:value={notes} placeholder="Payment notes..." />
			</Field.Field>

			<div class="flex items-center gap-3">
				<Button type="submit" disabled={isSubmitting}>
					{#if isSubmitting}Recording...{:else}Record Payment{/if}
				</Button>
				<Button variant="outline" href="/ar/payments">Cancel</Button>
			</div>
		</Field.FieldGroup>
	</form>
</div>
