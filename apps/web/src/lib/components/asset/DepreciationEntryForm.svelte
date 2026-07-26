<script lang="ts">
let {
  entry,
  assets,
  schedules,
  errors = {},
}: {
  entry?: {
    assetId: string;
    scheduleId: string | null;
    periodStartDate: string;
    periodEndDate: string;
    depreciationAmount: string;
  };
  assets: Array<{ id: string; name: string; assetNumber: string }>;
  schedules: Array<{ id: string; assetId: string; startDate: string; endDate: string }>;
  errors?: Record<string, string[]>;
} = $props();

let assetId = $state(entry?.assetId ?? '');
let scheduleId = $state(entry?.scheduleId ?? '');
let periodStartDate = $state(entry?.periodStartDate ?? '');
let periodEndDate = $state(entry?.periodEndDate ?? '');
let depreciationAmount = $state(entry?.depreciationAmount ?? '0');

let isSubmitting = $state(false);

let filteredSchedules = $derived(
  assetId ? schedules.filter((s) => s.assetId === assetId) : schedules
);
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
				<label for="scheduleId" class="block text-sm font-medium text-card-foreground">Schedule</label>
				<select id="scheduleId" name="scheduleId" bind:value={scheduleId} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="">No schedule</option>
					{#each filteredSchedules as schedule}
						<option value={schedule.id}>{schedule.startDate} — {schedule.endDate}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="periodStartDate" class="block text-sm font-medium text-card-foreground">Period Start Date *</label>
				<input id="periodStartDate" name="periodStartDate" type="date" required bind:value={periodStartDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
				{#if errors?.periodStartDate}
					<p class="mt-1 text-xs text-destructive">{errors.periodStartDate[0]}</p>
				{/if}
			</div>
			<div>
				<label for="periodEndDate" class="block text-sm font-medium text-card-foreground">Period End Date *</label>
				<input id="periodEndDate" name="periodEndDate" type="date" required bind:value={periodEndDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
				{#if errors?.periodEndDate}
					<p class="mt-1 text-xs text-destructive">{errors.periodEndDate[0]}</p>
				{/if}
			</div>
			<div>
				<label for="depreciationAmount" class="block text-sm font-medium text-card-foreground">Depreciation Amount *</label>
				<input id="depreciationAmount" name="depreciationAmount" type="number" step="0.01" min="0" required bind:value={depreciationAmount} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
				{#if errors?.depreciationAmount}
					<p class="mt-1 text-xs text-destructive">{errors.depreciationAmount[0]}</p>
				{/if}
			</div>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Saving...{:else}{entry ? 'Update Entry' : 'Create Entry'}{/if}
			</button>
			<a href="/assets/depreciation-entries" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
