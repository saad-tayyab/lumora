<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Button } from '$lib/components/ui/button';
import { Textarea } from '$lib/components/ui/textarea';

let { data } = $props();
const { form, enhance, submitting } = superForm(data.form);
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Customer</h1>
		<p class="text-muted-foreground">Add a new customer account</p>
	</div>

	<div class="rounded-lg border bg-card p-6 shadow-sm">
		<form method="POST" use:enhance class="space-y-6">
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="name">Name *</Label>
					<Input id="name" bind:value={$form.name} placeholder="Customer name" />
				</div>
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" type="email" bind:value={$form.email} placeholder="customer@example.com" />
				</div>
				<div class="space-y-2">
					<Label for="phone">Phone</Label>
					<Input id="phone" bind:value={$form.phone} placeholder="+1 (555) 000-0000" />
				</div>
				<div class="space-y-2">
					<Label for="paymentTerms">Payment Terms</Label>
					<select
						id="paymentTerms"
						bind:value={$form.paymentTerms}
						class="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
					>
						<option value="Net 15">Net 15</option>
						<option value="Net 30">Net 30</option>
						<option value="Net 45">Net 45</option>
						<option value="Net 60">Net 60</option>
						<option value="Due on Receipt">Due on Receipt</option>
					</select>
				</div>
				<div class="space-y-2">
					<Label for="creditLimit">Credit Limit</Label>
					<Input
						id="creditLimit"
						type="number"
						step="0.01"
						min="0"
						value={$form.creditLimit ?? ''}
						oninput={(e) => ($form.creditLimit = Number(e.currentTarget.value) || undefined)}
						placeholder="0.00"
					/>
				</div>
			</div>

			<div class="space-y-4">
				<h3 class="text-sm font-medium text-card-foreground">Address</h3>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2 md:col-span-2">
						<Label for="addressLine1">Address Line 1</Label>
						<Input id="addressLine1" bind:value={$form.addressLine1} placeholder="Street address" />
					</div>
					<div class="space-y-2 md:col-span-2">
						<Label for="addressLine2">Address Line 2</Label>
						<Input id="addressLine2" bind:value={$form.addressLine2} placeholder="Suite, unit, etc." />
					</div>
					<div class="space-y-2">
						<Label for="city">City</Label>
						<Input id="city" bind:value={$form.city} />
					</div>
					<div class="space-y-2">
						<Label for="state">State</Label>
						<Input id="state" bind:value={$form.state} />
					</div>
					<div class="space-y-2">
						<Label for="postalCode">Postal Code</Label>
						<Input id="postalCode" bind:value={$form.postalCode} />
					</div>
					<div class="space-y-2">
						<Label for="country">Country (3-letter code)</Label>
						<Input id="country" bind:value={$form.country} maxlength={3} placeholder="USA" />
					</div>
				</div>
			</div>

			<div class="flex items-center gap-3">
				<Button type="submit" disabled={$submitting}>
					{$submitting ? 'Creating...' : 'Create Customer'}
				</Button>
				<Button variant="outline" href="/ar/customers">Cancel</Button>
			</div>
		</form>
	</div>
</div>
