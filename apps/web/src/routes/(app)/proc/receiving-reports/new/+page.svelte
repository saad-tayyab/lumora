<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import DatePicker from '$lib/components/ui/date-picker.svelte';
import { Label } from '$lib/components/ui/label';
import { Card, CardContent } from '$lib/components/ui/card';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		toast.success($message);
		goto('/proc/receiving-reports');
	}
});
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">New Receiving Report</h1>
		<p class="text-muted-foreground">Record incoming shipment</p>
	</div>

	<Card>
		<CardContent>
			<form method="POST" use:enhance class="space-y-6">
				<h2 class="text-lg font-semibold text-card-foreground">Receiving Details</h2>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="purchaseOrderId">Purchase Order *</Label>
						<select id="purchaseOrderId" bind:value={$form.purchaseOrderId} class="w-full rounded-md border bg-background px-3 py-2 text-sm">
							<option value="">Select purchase order</option>
							{#each data.purchaseOrders as po}
								<option value={po.id}>{po.poNumber} - {po.vendorName}</option>
							{/each}
						</select>
						{#if $errors.purchaseOrderId}<p class="text-xs text-destructive">{$errors.purchaseOrderId}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="receivedDate">Received Date *</Label>
						<DatePicker bind:value={$form.receivedDate} />
						{#if $errors.receivedDate}<p class="text-xs text-destructive">{$errors.receivedDate}</p>{/if}
					</div>
				</div>
				<div class="space-y-2">
					<Label for="notes">Notes</Label>
					<textarea id="notes" bind:value={$form.notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Optional notes"></textarea>
				</div>

				<div class="flex items-center justify-end gap-3">
					<Button variant="outline" href="/proc/receiving-reports">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{#if $submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}
						Create Receiving Report
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
