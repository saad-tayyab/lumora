<script lang="ts">
import { toast } from 'svelte-sonner';
import { type PurchaseOrder, procApi, type ReceivingReport } from '$lib/api/proc';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Spinner } from '$lib/components/ui/spinner';

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

function poStatusVariant(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'approved': return 'default';
    case 'cancelled': return 'destructive';
    case 'closed': return 'outline';
    case 'draft': return 'outline';
    case 'fully_received': return 'secondary';
    case 'partially_received': return 'outline';
    case 'pending_approval': return 'outline';
    default: return 'outline';
  }
}

function rrStatusVariant(status: sfunction rrStatusVariant(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'confirmed': return 'secondary';
    case 'draft': return 'outline';
    case 'rejected': return 'destructive';
    default: return 'outline';
  }
}string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
</script>

<div class="flex flex-col gap-6">
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
          <Spinner class="size-6 text-primary" />
        </div>
      {:else if purchaseOrders.length === 0}
        <p class="py-4 text-center text-sm text-muted-foreground">No purchase orders yet</p>
      {:else}
        <div class="flex flex-col gap-3">
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
                <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {poStatusVariant(po.status)}">
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
          <Spinner class="size-6 text-primary" />
        </div>
      {:else if receivingReports.length === 0}
        <p class="py-4 text-center text-sm text-muted-foreground">No receiving reports yet</p>
      {:else}
        <div class="flex flex-col gap-3">
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
                <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {rrStatusVariant(rr.status)}">
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
