<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Button } from '$lib/components/ui/button';
import { Textarea } from '$lib/components/ui/textarea';

let { data } = $props();
const { form, enhance, submitting } = superForm(data.form);
let customers = $derived(data.customers);
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Create Credit Note</h1>
		<p class="text-muted-foreground">Issue a credit note to a customer</p>
	</div>

	<div class="rounded-lg border bg-card p-6 shadow-sm">
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
					<Label for="creditNoteNumber">Credit Note Number *</Label>
					<Input id="creditNoteNumber" bind:value={$form.creditNoteNumber} placeholder="CN-001" />
				</div>
				<div class="space-y-2">
					<Label for="issueDate">Issue Date *</Label>
					<Input id="issueDate" type="date" bind:value={$form.issueDate} />
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
				<Label for="reason">Reason *</Label>
				<Input id="reason" bind:value={$form.reason} maxlength={500} placeholder="Reason for credit note" />
			</div>

			<div class="space-y-2">
				<Label for="notes">Notes</Label>
				<Textarea id="notes" bind:value={$form.notes} rows={3} placeholder="Additional notes..." />
			</div>

			<div class="flex items-center gap-3">
				<Button type="submit" disabled={$submitting}>
					{$submitting ? 'Creating...' : 'Create Credit Note'}
				</Button>
				<Button variant="outline" href="/ar/credit-notes">Cancel</Button>
			</div>
		</form>
	</div>
</div>
