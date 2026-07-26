<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import type { ActionData } from './$types';

let { form }: { form: ActionData } = $props();
let isLoading = $state(false);

$effect(() => {
  if (form?.error) {
    toast.error(form.error);
  }
});
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Customer</h1>
		<p class="text-muted-foreground">Add a new customer account</p>
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
					<label for="name" class="block text-sm font-medium text-card-foreground">Name *</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
						placeholder="Customer name"
					/>
				</div>
				<div>
					<label for="email" class="block text-sm font-medium text-card-foreground">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
						placeholder="customer@example.com"
					/>
				</div>
				<div>
					<label for="phone" class="block text-sm font-medium text-card-foreground">Phone</label>
					<input
						id="phone"
						name="phone"
						type="text"
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
						placeholder="+1 (555) 000-0000"
					/>
				</div>
				<div>
					<label for="paymentTerms" class="block text-sm font-medium text-card-foreground">
						Payment Terms
					</label>
					<select
						id="paymentTerms"
						name="paymentTerms"
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
					>
						<option value="Net 15">Net 15</option>
						<option value="Net 30" selected>Net 30</option>
						<option value="Net 45">Net 45</option>
						<option value="Net 60">Net 60</option>
						<option value="Due on Receipt">Due on Receipt</option>
					</select>
				</div>
				<div>
					<label for="creditLimit" class="block text-sm font-medium text-card-foreground">
						Credit Limit
					</label>
					<input
						id="creditLimit"
						name="creditLimit"
						type="number"
						step="0.01"
						min="0"
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
						placeholder="0.00"
					/>
				</div>
			</div>

			<div class="space-y-4">
				<h3 class="text-sm font-medium text-card-foreground">Address</h3>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="md:col-span-2">
						<label for="addressLine1" class="block text-sm font-medium text-card-foreground">
							Address Line 1
						</label>
						<input
							id="addressLine1"
							name="addressLine1"
							type="text"
							class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
							placeholder="Street address"
						/>
					</div>
					<div class="md:col-span-2">
						<label for="addressLine2" class="block text-sm font-medium text-card-foreground">
							Address Line 2
						</label>
						<input
							id="addressLine2"
							name="addressLine2"
							type="text"
							class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
							placeholder="Suite, unit, etc."
						/>
					</div>
					<div>
						<label for="city" class="block text-sm font-medium text-card-foreground">City</label>
						<input
							id="city"
							name="city"
							type="text"
							class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
						/>
					</div>
					<div>
						<label for="state" class="block text-sm font-medium text-card-foreground">State</label>
						<input
							id="state"
							name="state"
							type="text"
							class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
						/>
					</div>
					<div>
						<label for="postalCode" class="block text-sm font-medium text-card-foreground">
							Postal Code
						</label>
						<input
							id="postalCode"
							name="postalCode"
							type="text"
							class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
						/>
					</div>
					<div>
						<label for="country" class="block text-sm font-medium text-card-foreground">
							Country (3-letter code)
						</label>
						<input
							id="country"
							name="country"
							type="text"
							maxlength="3"
							class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
							placeholder="USA"
						/>
					</div>
				</div>
			</div>

			<div class="flex items-center gap-3">
				<button
					type="submit"
					disabled={isLoading}
					class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isLoading}
						Creating...
					{:else}
						Create Customer
					{/if}
				</button>
				<a
					href="/ar/customers"
					class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent"
				>
					Cancel
				</a>
			</div>
		</form>
	</div>
</div>
