<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import type { ActionData, PageData } from './$types';

let { form, data }: { form: ActionData; data: PageData } = $props();
let customer = $derived(data.customer);
let isLoading = $state(false);

$effect(() => {
  if (form?.error) {
    toast.error(form.error);
  }
});
</script>

<div class="space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/ar/customers" class="hover:underline">Customers</a>
			<span>/</span>
			<a href="/ar/customers/{customer.id}" class="hover:underline">{customer.name}</a>
			<span>/</span>
			<span>Edit</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Edit Customer</h1>
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
						value={customer.name}
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
					/>
				</div>
				<div>
					<label for="email" class="block text-sm font-medium text-card-foreground">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						value={customer.email || ''}
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
					/>
				</div>
				<div>
					<label for="phone" class="block text-sm font-medium text-card-foreground">Phone</label>
					<input
						id="phone"
						name="phone"
						type="text"
						value={customer.phone || ''}
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
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
						<option value="Net 15" selected={customer.paymentTerms === 'Net 15'}>Net 15</option>
						<option value="Net 30" selected={customer.paymentTerms === 'Net 30'}>Net 30</option>
						<option value="Net 45" selected={customer.paymentTerms === 'Net 45'}>Net 45</option>
						<option value="Net 60" selected={customer.paymentTerms === 'Net 60'}>Net 60</option>
						<option value="Due on Receipt" selected={customer.paymentTerms === 'Due on Receipt'}>Due on Receipt</option>
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
						value={customer.creditLimit || ''}
						class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-card-foreground">Status</label>
					<label class="mt-1 flex items-center gap-2">
						<input
							type="checkbox"
							name="isActive"
							value="true"
							checked={customer.isActive}
							class="h-4 w-4 rounded border-input"
						/>
						<span class="text-sm text-card-foreground">Active</span>
					</label>
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
							value={customer.addressLine1 || ''}
							class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
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
							value={customer.addressLine2 || ''}
							class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
						/>
					</div>
					<div>
						<label for="city" class="block text-sm font-medium text-card-foreground">City</label>
						<input
							id="city"
							name="city"
							type="text"
							value={customer.city || ''}
							class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
						/>
					</div>
					<div>
						<label for="state" class="block text-sm font-medium text-card-foreground">State</label>
						<input
							id="state"
							name="state"
							type="text"
							value={customer.state || ''}
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
							value={customer.postalCode || ''}
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
							value={customer.country || ''}
							class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
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
						Saving...
					{:else}
						Save Changes
					{/if}
				</button>
				<a
					href="/ar/customers/{customer.id}"
					class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent"
				>
					Cancel
				</a>
			</div>
		</form>
	</div>
</div>
