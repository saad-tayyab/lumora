<script lang="ts">
let {
  vendor,
  errors = {},
}: {
  vendor?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    addressLine1: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    paymentTerms: string;
    isActive: boolean;
  };
  errors?: Record<string, string[]>;
} = $props();

let name = $state(vendor?.name ?? '');
let email = $state(vendor?.email ?? '');
let phone = $state(vendor?.phone ?? '');
let addressLine1 = $state(vendor?.addressLine1 ?? '');
let city = $state(vendor?.city ?? '');
let stateVal = $state(vendor?.state ?? '');
let country = $state(vendor?.country ?? '');
let paymentTerms = $state(vendor?.paymentTerms ?? 'Net 30');
let isActive = $state(vendor?.isActive ?? true);

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="name" class="block text-sm font-medium text-card-foreground">Name *</label>
				<input id="name" name="name" type="text" required bind:value={name} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Vendor name" />
				{#if errors.name}<p class="mt-1 text-xs text-destructive">{errors.name[0]}</p>{/if}
			</div>
			<div>
				<label for="email" class="block text-sm font-medium text-card-foreground">Email</label>
				<input id="email" name="email" type="email" bind:value={email} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="vendor@example.com" />
			</div>
			<div>
				<label for="phone" class="block text-sm font-medium text-card-foreground">Phone</label>
				<input id="phone" name="phone" type="text" bind:value={phone} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="paymentTerms" class="block text-sm font-medium text-card-foreground">Payment Terms</label>
				<select id="paymentTerms" name="paymentTerms" bind:value={paymentTerms} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="Net 15">Net 15</option>
					<option value="Net 30">Net 30</option>
					<option value="Net 45">Net 45</option>
					<option value="Net 60">Net 60</option>
					<option value="Due on Receipt">Due on Receipt</option>
				</select>
			</div>
		</div>

		<div class="space-y-4">
			<h3 class="text-sm font-medium text-card-foreground">Address</h3>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="md:col-span-2">
					<label for="addressLine1" class="block text-sm font-medium text-card-foreground">Address</label>
					<input id="addressLine1" name="addressLine1" type="text" bind:value={addressLine1} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
				</div>
				<div>
					<label for="city" class="block text-sm font-medium text-card-foreground">City</label>
					<input id="city" name="city" type="text" bind:value={city} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
				</div>
				<div>
					<label for="state" class="block text-sm font-medium text-card-foreground">State</label>
					<input id="state" name="state" type="text" bind:value={stateVal} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
				</div>
				<div>
					<label for="country" class="block text-sm font-medium text-card-foreground">Country</label>
					<input id="country" name="country" type="text" maxlength="3" bind:value={country} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="USA" />
				</div>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<input id="isActive" name="isActive" type="checkbox" bind:checked={isActive} class="h-4 w-4 rounded border-input" />
			<label for="isActive" class="text-sm font-medium text-card-foreground">Active</label>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{vendor ? 'Update Vendor' : 'Create Vendor'}{/if}
			</button>
			<a href="/ap/vendors" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
