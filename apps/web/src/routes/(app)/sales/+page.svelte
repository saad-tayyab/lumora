<script lang="ts">
import { toast } from 'svelte-sonner';
import { type Quotation, type SalesOrder, salesApi } from '$lib/api/sales';
import { formatCurrency, formatDate } from '$lib/utils/format';

let orders = $state<SalesOrder[]>([]);
let quotations = $state<Quotation[]>([]);
let loading = $state(true);

async function loadData() {
  loading = true;
  try {
    const [orderRes, quoteRes] = await Promise.all([
      salesApi.orders.list({ limit: 5 }),
      salesApi.quotations.list({ limit: 5 }),
    ]);
    orders = orderRes.data;
    quotations = quoteRes.data;
  } catch {
    toast.error('Failed to load sales data');
  } finally {
    loading = false;
  }
}

$effect(() => {
  loadData();
});

function orderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    closed: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function quotationStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-orange-100 text-orange-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Sales</h1>
    <p class="text-muted-foreground">Manage orders, quotations, and discount policies</p>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    <a
      href="/sales/orders"
      class="flex items-center gap-3 rounded-lg border bg-card p-6 shadow-sm hover:bg-accent"
    >
      <span class="text-2xl">📦</span>
      <div>
        <div class="text-sm font-medium text-muted-foreground">Sales Orders</div>
        <div class="text-2xl font-bold text-card-foreground">{orders.length}</div>
      </div>
    </a>

    <a
      href="/sales/quotations"
      class="flex items-center gap-3 rounded-lg border bg-card p-6 shadow-sm hover:bg-accent"
    >
      <span class="text-2xl">📄</span>
      <div>
        <div class="text-sm font-medium text-muted-foreground">Quotations</div>
        <div class="text-2xl font-bold text-card-foreground">{quotations.length}</div>
      </div>
    </a>

    <a
      href="/sales/discount-policies"
      class="flex items-center gap-3 rounded-lg border bg-card p-6 shadow-sm hover:bg-accent"
    >
      <span class="text-2xl">🏷️</span>
      <div>
        <div class="text-sm font-medium text-muted-foreground">Discount Policies</div>
      </div>
    </a>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Recent Orders</h2>
        <a href="/sales/orders" class="text-sm text-primary hover:underline">View all</a>
      </div>
      {#if loading}
        <div class="flex justify-center py-8">
          <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      {:else if orders.length === 0}
        <p class="py-4 text-center text-sm text-muted-foreground">No sales orders yet</p>
      {:else}
        <div class="space-y-3">
          {#each orders as order}
            <a
              href="/sales/orders/{order.id}"
              class="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
            >
              <div>
                <div class="font-medium text-card-foreground">{order.orderNumber}</div>
                <div class="text-sm text-muted-foreground">{order.customerName}</div>
              </div>
              <div class="text-right">
                <div class="font-medium text-card-foreground">{formatCurrency(order.totalAmount)}</div>
                <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {orderStatusColor(order.status)}">
                  {formatStatus(order.status)}
                </span>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Recent Quotations</h2>
        <a href="/sales/quotations" class="text-sm text-primary hover:underline">View all</a>
      </div>
      {#if loading}
        <div class="flex justify-center py-8">
          <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      {:else if quotations.length === 0}
        <p class="py-4 text-center text-sm text-muted-foreground">No quotations yet</p>
      {:else}
        <div class="space-y-3">
          {#each quotations as qt}
            <a
              href="/sales/quotations/{qt.id}"
              class="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
            >
              <div>
                <div class="font-medium text-card-foreground">{qt.quotationNumber}</div>
                <div class="text-sm text-muted-foreground">{qt.customerName}</div>
              </div>
              <div class="text-right">
                <div class="font-medium text-card-foreground">{formatCurrency(qt.totalAmount)}</div>
                <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {quotationStatusColor(qt.status)}">
                  {formatStatus(qt.status)}
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
        href="/sales/orders/new"
        class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        📦 New Sales Order
      </a>
      <a
        href="/sales/quotations/new"
        class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        📄 New Quotation
      </a>
      <a
        href="/sales/discount-policies/new"
        class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        🏷️ New Discount Policy
      </a>
    </div>
  </div>
</div>
