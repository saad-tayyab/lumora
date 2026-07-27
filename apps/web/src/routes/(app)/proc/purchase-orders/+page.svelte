<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { type PurchaseOrder, procApi } from '$lib/api/proc';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let { data }: { data: PageData } = $props();
let purchaseOrders = $state<PurchaseOrder[]>(data.purchaseOrders);
let total = $state(data.total);
let statusFilter = $state('');
let isLoading = $state(false);

function poStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    partially_received: 'bg-orange-100 text-orange-800',
    fully_received: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

async function filterByStatus() {
  isLoading = true;
  try {
    const result = await procApi.purchaseOrders.list({
      status: statusFilter || undefined,
      limit: 20,
    });
    purchaseOrders = result.data;
    total = result.total;
  } catch {
    toast.error('Failed to filter purchase orders');
  } finally {
    isLoading = false;
  }
}

async function deletePO(id: string) {
  if (!confirm('Are you sure you want to delete this purchase order?')) return;
  try {
    await procApi.purchaseOrders.delete(id);
    purchaseOrders = purchaseOrders.filter((po) => po.id !== id);
    total--;
    toast.success('Purchase order deleted');
  } catch {
    toast.error('Failed to delete purchase order');
  }
}

$effect(() => {
  statusFilter;
  filterByStatus();
});

const columns: ColumnDef<PurchaseOrder>[] = [
  { accessorKey: 'poNumber', header: 'PO Number', cell: (row) => `<a href="/proc/purchase-orders/${(row as any).original.id}" class="font-medium text-primary hover:underline">${(row as any).original.poNumber}</a>` },
  { accessorKey: 'vendorName', header: 'Vendor', cell: (row) => `<span class="text-sm">${(row as any).original.vendorName}</span>` },
  { accessorKey: 'orderDate', header: 'Date', cell: (row) => `<span class="text-sm">${formatDate((row as any).original.orderDate)}</span>` },
  { accessorKey: 'expectedDeliveryDate', header: 'Expected Delivery', cell: (row) => `<span class="text-sm">${(row as any).original.expectedDeliveryDate ? formatDate((row as any).original.expectedDeliveryDate) : '-'}</span>` },
  { accessorKey: 'totalAmount', header: 'Amount', cell: (row) => `<span class="text-sm text-right font-medium">${formatCurrency((row as any).original.totalAmount)}</span>` },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => `<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium ${poStatusColor((row as any).original.status)}">${formatStatus((row as any).original.status)}</span>`,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => {
      let html = `<div class="flex items-center justify-end gap-2"><a href="/proc/purchase-orders/${(row as any).original.id}" class="text-sm text-primary hover:underline">View</a>`;
      if ((row as any).original.status === 'draft') {
        html += `<a href="/proc/purchase-orders/${(row as any).original.id}/edit" class="text-sm text-primary hover:underline">Edit</a>`;
        html += `<button onclick="window.dispatchEvent(new CustomEvent('delete-po', {detail:'${(row as any).original.id}'}))" class="text-sm text-destructive hover:underline">Delete</button>`;
      }
      html += '</div>';
      return html;
    },
  },
];

$effect(() => {
  const handler = (e: Event) => deletePO((e as CustomEvent).detail);
  window.addEventListener('delete-po', handler);
  return () => window.removeEventListener('delete-po', handler);
});
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Purchase Orders</h1>
      <p class="text-muted-foreground">Manage procurement purchase orders</p>
    </div>
    <a
      href="/proc/purchase-orders/new"
      class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      New Purchase Order
    </a>
  </div>

  <div class="flex items-center gap-4">
    <select
      bind:value={statusFilter}
      class="rounded-md border bg-background px-3 py-2 text-sm"
    >
      <option value="">All Statuses</option>
      <option value="draft">Draft</option>
      <option value="pending_approval">Pending Approval</option>
      <option value="approved">Approved</option>
      <option value="partially_received">Partially Received</option>
      <option value="fully_received">Fully Received</option>
      <option value="closed">Closed</option>
      <option value="cancelled">Cancelled</option>
    </select>
    <span class="text-sm text-muted-foreground">{total} total</span>
  </div>

  <AppDataTable
    {columns}
    data={purchaseOrders}
    loading={isLoading}
    emptyMessage="No purchase orders found"
    pageSize={20}
    totalItems={total}
    onRowClick={(row) => goto(`/proc/purchase-orders/${row.id}`)}
  />
</div>
