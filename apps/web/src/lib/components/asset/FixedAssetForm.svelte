<script lang="ts">
let {
  asset,
  categories,
  errors = {},
}: {
  asset?: {
    name: string;
    assetNumber: string;
    description: string | null;
    categoryId: string;
    acquisitionDate: string;
    acquisitionCost: string;
    salvageValue: string;
    usefulLifeMonths: number;
    depreciationMethod: string;
  };
  categories: Array<{ id: string; name: string }>;
  errors?: Record<string, string[]>;
} = $props();

let name = $state(asset?.name ?? '');
let assetNumber = $state(asset?.assetNumber ?? '');
let description = $state(asset?.description ?? '');
let categoryId = $state(asset?.categoryId ?? '');
let acquisitionDate = $state(asset?.acquisitionDate ?? '');
let acquisitionCost = $state(asset?.acquisitionCost ?? '0');
let salvageValue = $state(asset?.salvageValue ?? '0');
let usefulLifeMonths = $state(asset?.usefulLifeMonths ?? 60);
let depreciationMethod = $state(asset?.depreciationMethod ?? 'straight_line');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="name" class="block text-sm font-medium text-card-foreground">Name *</label>
				<input id="name" name="name" type="text" required bind:value={name} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="assetNumber" class="block text-sm font-medium text-card-foreground">Asset Number *</label>
				<input id="assetNumber" name="assetNumber" type="text" required bind:value={assetNumber} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="categoryId" class="block text-sm font-medium text-card-foreground">Category *</label>
				<select id="categoryId" name="categoryId" required bind:value={categoryId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="">Select category</option>
					{#each categories as cat}
						<option value={cat.id}>{cat.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="acquisitionDate" class="block text-sm font-medium text-card-foreground">Acquisition Date *</label>
				<input id="acquisitionDate" name="acquisitionDate" type="date" required bind:value={acquisitionDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="acquisitionCost" class="block text-sm font-medium text-card-foreground">Acquisition Cost *</label>
				<input id="acquisitionCost" name="acquisitionCost" type="number" step="0.01" min="0" required bind:value={acquisitionCost} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="salvageValue" class="block text-sm font-medium text-card-foreground">Salvage Value</label>
				<input id="salvageValue" name="salvageValue" type="number" step="0.01" min="0" bind:value={salvageValue} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="usefulLifeMonths" class="block text-sm font-medium text-card-foreground">Useful Life (months)</label>
				<input id="usefulLifeMonths" name="usefulLifeMonths" type="number" min="1" bind:value={usefulLifeMonths} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="depreciationMethod" class="block text-sm font-medium text-card-foreground">Depreciation Method</label>
				<select id="depreciationMethod" name="depreciationMethod" bind:value={depreciationMethod} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="straight_line">Straight Line</option>
					<option value="declining_balance">Declining Balance</option>
					<option value="sum_of_years">Sum of Years</option>
					<option value="units_of_production">Units of Production</option>
				</select>
			</div>
		</div>

		<div>
			<label for="description" class="block text-sm font-medium text-card-foreground">Description</label>
			<textarea id="description" name="description" rows="2" bind:value={description} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{asset ? 'Update Asset' : 'Create Asset'}{/if}
			</button>
			<a href="/assets" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
