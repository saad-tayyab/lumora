<script lang="ts">
import { Button } from '$lib/components/ui/button';
import * as Dialog from '$lib/components/ui/dialog';

let {
  open = $bindable(),
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

<Dialog.Root bind:open onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Dispose Asset</Dialog.Title>
			<Dialog.Description>
				You are about to dispose <span class="font-medium text-foreground">{asset.name}</span>
				({asset.assetNumber}). Net book value: {asset.netBookValue}.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="flex flex-col gap-4">
			<div class="flex flex-col gap-1.5">
				<label for="disposalDate" class="text-sm font-medium text-card-foreground">Disposal Date *</label>
				<input
					id="disposalDate"
					type="date"
					required
					bind:value={disposalDate}
					class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<div class="flex flex-col gap-1.5">
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
				<Button type="button" variant="outline" onclick={onCancel}>Cancel</Button>
				<Button type="submit" variant="destructive">Dispose Asset</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
