<script lang="ts">
let {
  category,
  errors = {},
}: {
  category?: {
    name: string;
    code: string;
    description: string | null;
    defaultDepreciationMethod: string;
    defaultUsefulLifeMonths: number;
    defaultSalvageValuePercent: string;
    isDepreciable: boolean;
  };
  errors?: Record<string, string[]>;
} = $props();

let name = $state(category?.name ?? '');
let code = $state(category?.code ?? '');
let description = $state(category?.description ?? '');
let defaultDepreciationMethod = $state(category?.defaultDepreciationMethod ?? 'straight_line');
let defaultUsefulLifeMonths = $state(category?.defaultUsefulLifeMonths ?? 60);
let defaultSalvageValuePercent = $state(category?.defaultSalvageValuePercent ?? '0');
let isDepreciable = $state(category?.isDepreciable ?? true);

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<label for="name" class="block text-sm font-medium text-card-foreground">Name *</label>
				<input id="name" name="name" type="text" required bind:value={name} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="e.g. Office Equipment" />
			</div>
			<div>
				<label for="code" class="block text-sm font-medium text-card-foreground">Code *</label>
				<input id="code" name="code" type="text" required maxlength="20" bind:value={code} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="e.g. OE" />
			</div>
		</div>

		<div>
			<label for="description" class="block text-sm font-medium text-card-foreground">Description</label>
			<textarea id="description" name="description" rows="2" bind:value={description} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
		</div>

		<div class="grid gap-4 md:grid-cols-3">
			<div>
				<label for="method" class="block text-sm font-medium text-card-foreground">Depreciation Method</label>
				<select id="method" name="defaultDepreciationMethod" bind:value={defaultDepreciationMethod} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="straight_line">Straight Line</option>
					<option value="declining_balance">Declining Balance</option>
					<option value="sum_of_years_digits">Sum of Years Digits</option>
					<option value="units_of_production">Units of Production</option>
				</select>
			</div>
			<div>
				<label for="usefulLife" class="block text-sm font-medium text-card-foreground">Useful Life (months)</label>
				<input id="usefulLife" name="defaultUsefulLifeMonths" type="number" min="1" bind:value={defaultUsefulLifeMonths} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="salvage" class="block text-sm font-medium text-card-foreground">Salvage Value %</label>
				<input id="salvage" name="defaultSalvageValuePercent" type="number" step="0.01" min="0" max="100" bind:value={defaultSalvageValuePercent} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
		</div>

		<div class="flex items-center gap-2">
			<input id="isDepreciable" name="isDepreciable" type="checkbox" bind:checked={isDepreciable} class="h-4 w-4 rounded border-input" />
			<label for="isDepreciable" class="text-sm font-medium text-card-foreground">Is Depreciable</label>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{category ? 'Update Category' : 'Create Category'}{/if}
			</button>
			<a href="/assets/categories" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
