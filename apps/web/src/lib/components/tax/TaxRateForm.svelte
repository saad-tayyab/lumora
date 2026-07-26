<script lang="ts">
let {
  taxRate,
  taxCodes,
  errors = {},
}: {
  taxRate?: {
    taxCodeId: string;
    rate: string;
    effectiveDate: string;
    expiryDate: string | null;
    description: string | null;
  };
  taxCodes: Array<{ id: string; code: string; name: string }>;
  errors?: Record<string, string[]>;
} = $props();

let taxCodeId = $state(taxRate?.taxCodeId ?? '');
let rate = $state(taxRate?.rate ?? '0');
let effectiveDate = $state(taxRate?.effectiveDate ?? '');
let expiryDate = $state(taxRate?.expiryDate ?? '');
let description = $state(taxRate?.description ?? '');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="taxCodeId" class="block text-sm font-medium text-card-foreground">Tax Code *</label>
				<select id="taxCodeId" name="taxCodeId" required bind:value={taxCodeId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="">Select tax code</option>
					{#each taxCodes as tc}
						<option value={tc.id}>{tc.code} - {tc.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="rate" class="block text-sm font-medium text-card-foreground">Rate *</label>
				<input id="rate" name="rate" type="number" step="0.0001" min="0" required bind:value={rate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="0.0000" />
			</div>
			<div>
				<label for="effectiveDate" class="block text-sm font-medium text-card-foreground">Effective Date *</label>
				<input id="effectiveDate" name="effectiveDate" type="date" required bind:value={effectiveDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="expiryDate" class="block text-sm font-medium text-card-foreground">Expiry Date</label>
				<input id="expiryDate" name="expiryDate" type="date" bind:value={expiryDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div>
			<label for="description" class="block text-sm font-medium text-card-foreground">Description</label>
			<textarea id="description" name="description" rows="2" bind:value={description} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{taxRate ? 'Update Tax Rate' : 'Create Tax Rate'}{/if}
			</button>
			<a href="/tax/rates" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
