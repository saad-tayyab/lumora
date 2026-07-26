<script lang="ts">
let {
  open,
  asset,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  asset: { name: string; assetNumber: string; netBookValue: string };
  onConfirm: (data: { disposalDate: string; disposalProceeds: string }) => void;
  onCancel: () => void;
} = $props();

let disposalDate = $state('');
let disposalProceeds = $state('0');

function handleSubmit(e: Event) {
  e.preventDefault();
  if (!disposalDate) return;
  onConfirm({ disposalDate, disposalProceeds });
}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<div class="fixed inset-0 bg-black/50" role="presentation" onclick={onCancel}></div>
		<div class="relative z-50 w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
			<h2 class="text-lg font-semibold text-card-foreground">Dispose Asset</h2>
			<p class="mt-1 text-sm text-muted-foreground">
				You are about to dispose <span class="font-medium text-foreground">{asset.name}</span>
				({asset.assetNumber}). Net book value: {asset.netBookValue}.
			</p>

			<form onsubmit={handleSubmit} class="mt-6 space-y-4">
				<div class="space-y-1.5">
					<label for="disposalDate" class="text-sm font-medium text-card-foreground">Disposal Date *</label>
					<input
						id="disposalDate"
						type="date"
						required
						bind:value={disposalDate}
						class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="disposalProceeds" class="text-sm font-medium text-card-foreground">Disposal Proceeds *</label>
					<input
						id="disposalProceeds"
						type="number"
						step="0.01"
						min="0"
						required
						bind:value={disposalProceeds}
						class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<div class="flex justify-end gap-3 pt-2">
					<button
						type="button"
						onclick={onCancel}
						class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
					>
						Dispose Asset
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
