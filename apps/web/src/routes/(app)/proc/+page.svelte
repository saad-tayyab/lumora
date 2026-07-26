<script lang="ts">
import { toast } from 'svelte-sonner';
import { type PurchaseOrder, procApi, type ReceivingReport } from '$lib/api/proc';
import { formatCurrency, formatDate } from '$lib/utils/format';

let purchaseOrders = $state<PurchaseOrder[]>([]);
let receivingReports = $state<ReceivingReport[]>([]);
let loading = $state(true);

async function loadData() {
  loading = true;
  try {
    const [poRes, rrRes] = await Promise.all([
      procApi.purchaseOrders.list({ limit: 5 }),
      procApi.receivingReports.list({ limit: 5 }),
    ]);
    purchaseOrders = poRes.data;
    receivingReports = rrRes.data;
  } catch (_err) {
    toast.error('Failed to load procurement data');
  } finally {
    loading = false;
  }
}

$effect(() => {
  loadData();
});

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

function rrStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    confirmed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Procurement</h1>
    <p class="text-muted-foreground">Manage purchase orders, receiving, and vendor catalog</p>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    <a
      href="/proc/purchase-orders"
      class="flex items-center gap-3 rounded-lg border bg-card p-6 shadow-sm hover:bg-accent"
    >
      <span class="text-2xl">🛒</span>
      <div>
        <div class="text-sm font-medium text-muted-foreground">Purchase Orders</div>
        <div class="text-2xl font-bold text-card-foreground">{purchaseOrders.length}</div>
      </div>
    </a>

    <a
      href="/proc/receiving-reports"
      class="flex items-center gap-3 rounded-lg border bg-card p-6 shadow-sm hover:bg-accent"
    >
      <span class="text-2xl">📦</span>
      <div>
        <div class="text-sm font-medium text-muted-foreground">Receiving Reports</div>
        <div class="text-2xl font-bold text-card-foreground">{receivingReports.length}</div>
      </div>
    </a>

    <a
      href="/proc/vendor-catalog"
      class="flex items-center gap-3 rounded-lg border bg-card p-6 shadow-sm hover:bg-accent"
    >
      <span class="text-2xl">📋</span>
      <div>
        <div class="text-sm font-medium text-muted-foreground">Vendor Catalog</div>
      </div>
    </a>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Recent Purchase Orders</h2>
        <a href="/proc/purchase-orders" class="text-sm text-primary hover:underline">View all</a>
      </div>
      {#if loading}
        <div class="flex justify-center py-8">
          <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      {:else if purchaseOrders.length === 0}
        <p class="py-4 text-center text-sm text-muted-foreground">No purchase orders yet</p>
      {:else}
        <div class="space-y-3">
          {#each purchaseOrders as po}
            <a
              href="/proc/purchase-orders/{po.id}"
              class="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
            >
              <div>
                <div class="font-medium text-card-foreground">{po.poNumber}</div>
                <div class="text-sm text-muted-foreground">{po.vendorName}</div>
              </div>
              <div class="text-right">
                <div class="font-medium text-card-foreground">{formatCurrency(po.totalAmount)}</div>
                <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {poStatusColor(po.status)}">
                  {formatStatus(po.status)}
                </span>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Recent Receiving Reports</h2>
        <a href="/proc/receiving-reports" class="text-sm text-primary hover:underline">View all</a>
      </div>
      {#if loading}
        <div class="flex justify-center py-8">
          <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      {:else if receivingReports.length === 0}
        <p class="py-4 text-center text-sm text-muted-foreground">No receiving reports yet</p>
      {:else}
        <div class="space-y-3">
          {#each receivingReports as rr}
            <a
              href="/proc/receiving-reports/{rr.id}"
              class="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
            >
              <div>
                <div class="font-medium text-card-foreground">{rr.reportNumber}</div>
                <div class="text-sm text-muted-foreground">{rr.purchaseOrderNumber} - {rr.vendorName}</div>
              </div>
              <div class="text-right">
                <div class="text-sm text-muted-foreground">{formatDate(rr.receivedDate)}</div>
                <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {rrStatusColor(rr.status)}">
                  {formatStatus(rr.status)}
                </span>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="rounded-lg border bg-card p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-semibold text-card-foreground">Quick Actions</h2>
    <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <a
        href="/proc/purchase-orders/new"
        class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        📄 New Purchase Order
      </a>
      <a
        href="/proc/receiving-reports/new"
        class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        📦 New Receiving Report
      </a>
      <a
        href="/proc/vendor-catalog/new"
        class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        📋 Add Catalog Item
      </a>
    </div>
  </div>
</div>
