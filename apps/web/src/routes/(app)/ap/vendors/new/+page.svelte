<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Button } from '$lib/components/ui/button';
import { Textarea } from '$lib/components/ui/textarea';
import { Card, CardContent } from '$lib/components/ui/card';

let { data } = $props();
const { form, enhance, submitting } = superForm(data.form);
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Add Vendor</h1>
		<p class="text-muted-foreground">Create a new vendor record</p>
	</div>

	<Card>
		<CardContent>
		<form method="POST" use:enhance class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-2">
				<Label for="name">Name *</Label>
				<Input id="name" bind:value={$form.name} />
			</div>
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input id="email" type="email" bind:value={$form.email} />
			</div>
			<div class="space-y-2">
				<Label for="phone">Phone</Label>
				<Input id="phone" bind:value={$form.phone} />
			</div>
			<div class="space-y-2">
				<Label for="taxId">Tax ID</Label>
				<Input id="taxId" bind:value={$form.taxId} />
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
					<option value="PKR">PKR</option>
				</select>
			</div>
			<div class="space-y-2">
				<Label for="paymentTerms">Payment Terms (days)</Label>
				<Input
					id="paymentTerms"
					type="number"
					value={$form.paymentTerms ?? ''}
					oninput={(e) => ($form.paymentTerms = e.currentTarget.value || undefined)}
				/>
			</div>
		</div>

		<div class="space-y-2">
			<Label for="address">Address</Label>
			<Input id="address" bind:value={$form.address} />
		</div>

		<div class="grid gap-4 md:grid-cols-3">
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
		</div>

		<div class="space-y-2">
			<Label for="country">Country</Label>
			<Input id="country" bind:value={$form.country} />
		</div>

		<div class="space-y-2">
			<Label for="notes">Notes</Label>
			<Textarea id="notes" bind:value={$form.notes} rows={3} />
		</div>

		<div class="flex justify-end gap-3">
			<Button variant="outline" href="/ap/vendors">Cancel</Button>
			<Button type="submit" disabled={$submitting}>
				{$submitting ? 'Creating...' : 'Create Vendor'}
			</Button>
		</div>
	</form>
		</CardContent>
	</Card>
</div>
