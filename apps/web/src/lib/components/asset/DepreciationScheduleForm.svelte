<script lang="ts">
let {
  schedule,
  assets,
  errors = {},
}: {
  schedule?: {
    assetId: string;
    startDate: string;
    endDate: string;
    totalDepreciableCost: string;
    monthlyAmount: string;
    method: string;
  };
  assets: Array<{ id: string; name: string; assetNumber: string }>;
  errors?: Record<string, string[]>;
} = $props();

let assetId = $state(schedule?.assetId ?? '');
let startDate = $state(schedule?.startDate ?? '');
let endDate = $state(schedule?.endDate ?? '');
let totalDepreciableCost = $state(schedule?.totalDepreciableCost ?? '0');
let monthlyAmount = $state(schedule?.monthlyAmount ?? '0');
let method = $state(schedule?.method ?? 'straight_line');

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
				{#if errors?.assetId}
					<p class="mt-1 text-xs text-destructive">{errors.assetId[0]}</p>
				{/if}
			</div>
			<div>
				<label for="method" class="block text-sm font-medium text-card-foreground">Depreciation Method *</label>
				<select id="method" name="method" required bind:value={method} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="straight_line">Straight Line</option>
					<option value="declining_balance">Declining Balance</option>
					<option value="sum_of_years_digits">Sum of Years Digits</option>
					<option value="units_of_production">Units of Production</option>
				</select>
			</div>
			<div>
				<label for="startDate" class="block text-sm font-medium text-card-foreground">Start Date *</label>
				<input id="startDate" name="startDate" type="date" required bind:value={startDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
				{#if errors?.startDate}
					<p class="mt-1 text-xs text-destructive">{errors.startDate[0]}</p>
				{/if}
			</div>
			<div>
				<label for="endDate" class="block text-sm font-medium text-card-foreground">End Date *</label>
				<input id="endDate" name="endDate" type="date" required bind:value={endDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
				{#if errors?.endDate}
					<p class="mt-1 text-xs text-destructive">{errors.endDate[0]}</p>
				{/if}
			</div>
			<div>
				<label for="totalDepreciableCost" class="block text-sm font-medium text-card-foreground">Total Depreciable Cost *</label>
				<input id="totalDepreciableCost" name="totalDepreciableCost" type="number" step="0.01" min="0" required bind:value={totalDepreciableCost} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
				{#if errors?.totalDepreciableCost}
					<p class="mt-1 text-xs text-destructive">{errors.totalDepreciableCost[0]}</p>
				{/if}
			</div>
			<div>
				<label for="monthlyAmount" class="block text-sm font-medium text-card-foreground">Monthly Amount *</label>
				<input id="monthlyAmount" name="monthlyAmount" type="number" step="0.01" min="0" required bind:value={monthlyAmount} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
				{#if errors?.monthlyAmount}
					<p class="mt-1 text-xs text-destructive">{errors.monthlyAmount[0]}</p>
				{/if}
			</div>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{schedule ? 'Update Schedule' : 'Create Schedule'}{/if}
			</button>
			<a href="/assets/depreciation" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
