<script lang="ts">
let {
  adjustment,
  assets,
  errors = {},
}: {
  adjustment?: {
    assetId: string;
    adjustmentType: string;
    adjustmentDate: string;
    adjustmentAmount: string;
    direction: string;
    description: string;
    revisedUsefulLifeMonths: number | null;
    revisedSalvageValue: string | null;
  };
  assets: Array<{ id: string; name: string; assetNumber: string }>;
  errors?: Record<string, string[]>;
} = $props();

let assetId = $state(adjustment?.assetId ?? '');
let adjustmentType = $state(adjustment?.adjustmentType ?? 'revaluation');
let adjustmentDate = $state(adjustment?.adjustmentDate ?? '');
let adjustmentAmount = $state(adjustment?.adjustmentAmount ?? '0');
let direction = $state(adjustment?.direction ?? 'increase');
let description = $state(adjustment?.description ?? '');
let revisedUsefulLifeMonths = $state(adjustment?.revisedUsefulLifeMonths ?? '');
let revisedSalvageValue = $state(adjustment?.revisedSalvageValue ?? '');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="assetId" class="block text-sm font-medium text-card-foreground">Asset *</label>
				<select id="assetId" name="assetId" required bind:value={assetId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="">Select asset</option>
					{#each assets as asset}
						<option value={asset.id}>{asset.assetNumber} - {asset.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="adjustmentType" class="block text-sm font-medium text-card-foreground">Type *</label>
				<select id="adjustmentType" name="adjustmentType" bind:value={adjustmentType} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="revaluation">Revaluation</option>
					<option value="impairment">Impairment</option>
					<option value="restoration">Restoration</option>
					<option value="transfer">Transfer</option>
					<option value="reclassification">Reclassification</option>
				</select>
			</div>
			<div>
				<label for="adjustmentDate" class="block text-sm font-medium text-card-foreground">Date *</label>
				<input id="adjustmentDate" name="adjustmentDate" type="date" required bind:value={adjustmentDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="direction" class="block text-sm font-medium text-card-foreground">Direction *</label>
				<select id="direction" name="direction" bind:value={direction} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="increase">Increase</option>
					<option value="decrease">Decrease</option>
				</select>
			</div>
			<div>
				<label for="adjustmentAmount" class="block text-sm font-medium text-card-foreground">Amount *</label>
				<input id="adjustmentAmount" name="adjustmentAmount" type="number" step="0.01" min="0" required bind:value={adjustmentAmount} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="revisedSalvageValue" class="block text-sm font-medium text-card-foreground">Revised Salvage Value</label>
				<input id="revisedSalvageValue" name="revisedSalvageValue" type="number" step="0.01" min="0" bind:value={revisedSalvageValue} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="revisedUsefulLifeMonths" class="block text-sm font-medium text-card-foreground">Revised Useful Life (mo)</label>
				<input id="revisedUsefulLifeMonths" name="revisedUsefulLifeMonths" type="number" min="1" bind:value={revisedUsefulLifeMonths} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div>
			<label for="description" class="block text-sm font-medium text-card-foreground">Description *</label>
			<textarea id="description" name="description" rows="2" required bind:value={description} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}Create Adjustment{/if}
			</button>
			<a href="/assets" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
