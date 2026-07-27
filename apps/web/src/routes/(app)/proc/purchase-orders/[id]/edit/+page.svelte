<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { type PurchaseOrder, type PurchaseOrderLineItem, procApi } from '$lib/api/proc';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import { Spinner } from '$lib/components/ui/spinner';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import * as Card from '$lib/components/ui/card';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let { data }: { data: PageData } = $props();
let purchaseOrder = $state<PurchaseOrder | null>(data.purchaseOrder);

let vendorId = $state(data.purchaseOrder?.vendorId || '');
let expectedDeliveryDate = $state(data.purchaseOrder?.expectedDeliveryDate || '');
let notes = $state(data.purchaseOrder?.notes || '');
let lineItems = $state<
  Array<{ id?: string; itemId: string; description: string; quantity: string; unitPrice: string }>
>(
  data.lineItems.map((li: PurchaseOrderLineItem) => ({
    id: li.id,
    itemId: li.itemId,
    description: li.description || '',
    quantity: li.quantity,
    unitPrice: li.unitPrice,
  })),
);
let submitting = $state(false);

function addLineItem() {
  lineItems = [...lineItems, { itemId: '', description: '', quantity: '1', unitPrice: '0' }];
}

function removeLineItem(index: number) {
  lineItems = lineItems.filter((_, i) => i !== index);
}

function updateLineItem(index: number, field: string, value: string) {
  const updated = [...lineItems];
  (updated[index] as unknown as Record<string, string>)[field] = value;
  lineItems = updated;
}

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!vendorId) {
    toast.error('Please select a vendor');
    return;
  }

  submitting = true;
  try {
    await procApi.purchaseOrders.update(purchaseOrder!.id, {
      vendorId,
      expectedDeliveryDate: expectedDeliveryDate || null,
      notes: notes || null,
    });

    for (const item of lineItems) {
      if (item.id) {
        await procApi.purchaseOrders.lineItems.update(purchaseOrder!.id, item.id, {
          itemId: item.itemId,
          description: item.description || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
      } else if (item.itemId) {
        await procApi.purchaseOrders.lineItems.create(purchaseOrder!.id, {
          itemId: item.itemId,
          description: item.description || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
      }
    }

    toast.success('Purchase order updated');
    goto(`/proc/purchase-orders/${purchaseOrder?.id}`);
  } catch {
    toast.error('Failed to update purchase order');
  } finally {
    submitting = false;
  }
}
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Edit Purchase Order</h1>
    <p class="text-muted-foreground">Editing {purchaseOrder?.poNumber}</p>
  </div>

  <form onsubmit={handleSubmit}>
    <Card.Root class="shadow-sm"><Card.Content>
      <Card.Header>
				<Card.Title>Order Details</Card.Title>
			</Card.Header>
      <Field.FieldGroup>
        <div class="grid gap-4 md:grid-cols-2">
          <Field.Field>
            <Field.FieldLabel for="vendorId">Vendor *</Field.FieldLabel>
            <Select.Root bind:value={vendorId}>
              <Select.Trigger class="w-full">
                <Select.Value placeholder="Select vendor" />
              </Select.Trigger>
              <Select.Content>
              </Select.Content>
            </Select.Root>
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="expectedDeliveryDate">Expected Delivery Date</Field.FieldLabel>
            <DatePicker bind:value={expectedDeliveryDate} />
          </Field.Field>
        </div>
        <Field.Field>
          <Field.FieldLabel for="notes">Notes</Field.FieldLabel>
          <Textarea
            id="notes"
            bind:value={notes}
            rows="3"
            placeholder="Optional notes"
          ></Textarea>
        </Field.Field>
      </Field.FieldGroup>
    </Card.Content></Card.Root>

    <Card.Root class="shadow-sm"><Card.Content>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Line Items</h2>
        <Button type="button" variant="outline" onclick={addLineItem}>
          + Add Line
        </Button>
      </div>
      <div class="flex flex-col gap-4">
        {#each lineItems as item, index}
          <div class="grid items-end gap-3 rounded-md border p-4 md:grid-cols-4">
            <Field.Field>
              <Field.FieldLabel class="text-xs">Item *</Field.FieldLabel>
              <Input type="text" value={item.itemId} oninput={(e) => updateLineItem(index, 'itemId', (e.target as HTMLInputElement).value)} required />
            </Field.Field>
            <Field.Field>
              <Field.FieldLabel class="text-xs">Description</Field.FieldLabel>
              <Input type="text" value={item.description} oninput={(e) => updateLineItem(index, 'description', (e.target as HTMLInputElement).value)} />
            </Field.Field>
            <Field.Field>
              <Field.FieldLabel class="text-xs">Quantity *</Field.FieldLabel>
              <Input type="number" value={item.quantity} oninput={(e) => updateLineItem(index, 'quantity', (e.target as HTMLInputElement).value)} min="0" step="1" required />
            </Field.Field>
            <div class="flex gap-2">
              <Field.Field class="flex-1">
                <Field.FieldLabel class="text-xs">Unit Price *</Field.FieldLabel>
                <Input type="number" value={item.unitPrice} oninput={(e) => updateLineItem(index, 'unitPrice', (e.target as HTMLInputElement).value)} min="0" step="0.01" required />
              </Field.Field>
              {#if lineItems.length > 1}
                <button
                  type="button"
                  onclick={() => removeLineItem(index)}
                  class="mb-0.5 rounded-md border px-2 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  X
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </Card.Content></Card.Root>

    <div class="flex items-center justify-end gap-3">
      <Button variant="outline" href="/proc/purchase-orders/{purchaseOrder?.id}">Cancel</Button>
      <Button type="submit" disabled={submitting}>
        {#if submitting}<Spinner data-icon="inline-start" class="text-primary-foreground" />{/if}
        Save Changes
      </Button>
    </div>
  </form>
</div>
