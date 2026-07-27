<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { procApi } from '$lib/api/proc';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let { data }: { data: PageData } = $props();

let purchaseOrderId = $state('');
let receivedDate = $state(new Date().toISOString().split('T')[0]);
let notes = $state('');
let submitting = $state(false);

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!purchaseOrderId) {
    toast.error('Please select a purchase order');
    return;
  }

  submitting = true;
  try {
    const report = await procApi.receivingReports.create({
      purchaseOrderId,
      receivedDate,
      notes: notes || null,
    });
    toast.success('Receiving report created');
    goto(`/proc/receiving-reports/${report.id}`);
  } catch {
    toast.error('Failed to create receiving report');
  } finally {
    submitting = false;
  }
}
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">New Receiving Report</h1>
    <p class="text-muted-foreground">Record incoming shipment</p>
  </div>

  <form onsubmit={handleSubmit} class="space-y-6">
    <Card.Root class="shadow-sm"><Card.Content>
      <h2 class="mb-4 text-lg font-semibold text-card-foreground">Receiving Details</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label for="purchaseOrderId" class="mb-1 block text-sm font-medium text-card-foreground">Purchase Order *</label>
          <select
            id="purchaseOrderId"
            bind:value={purchaseOrderId}
            class="w-full rounded-md border bg-background px-3 py-2 text-sm"
            required
          >
            <option value="">Select purchase order</option>
            {#each data.purchaseOrders as po}
              <option value={po.id}>{po.poNumber} - {po.vendorName}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="receivedDate" class="mb-1 block text-sm font-medium text-card-foreground">Received Date *</label>
          <DatePicker bind:value={receivedDate} />
        </div>
      </div>
      <div class="mt-4">
        <label for="notes" class="mb-1 block text-sm font-medium text-card-foreground">Notes</label>
        <textarea
          id="notes"
          bind:value={notes}
          rows="3"
          class="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Optional notes"
        ></textarea>
      </div>
    </Card.Content></Card.Root>

    <div class="flex items-center justify-end gap-3">
      <Button variant="outline" href="/proc/receiving-reports">Cancel</Button>
      <Button type="submit" disabled={submitting}>
        {#if submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}
        Create Receiving Report
      </Button>
    </div>
  </form>
</div>
