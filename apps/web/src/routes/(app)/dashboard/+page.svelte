<script lang="ts">
import { formatCurrency } from '$lib/utils/format';
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Dashboard</h1>
    <p class="text-muted-foreground">Welcome to Lumora ERP</p>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="text-sm font-medium text-muted-foreground">Total Revenue</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{formatCurrency('0')}</div>
      <p class="mt-1 text-xs text-muted-foreground">Coming soon</p>
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="text-sm font-medium text-muted-foreground">Outstanding Invoices</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{formatCurrency('0')}</div>
      <p class="mt-1 text-xs text-muted-foreground">Coming soon</p>
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="text-sm font-medium text-muted-foreground">Pending Bills</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{formatCurrency('0')}</div>
      <p class="mt-1 text-xs text-muted-foreground">Coming soon</p>
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="text-sm font-medium text-muted-foreground">Total Assets</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{formatCurrency('0')}</div>
      <p class="mt-1 text-xs text-muted-foreground">Coming soon</p>
    </div>
  </div>

  <div class="rounded-lg border bg-card p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-semibold text-card-foreground">Quick Actions</h2>
    <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <a
        href="/ar/invoices/new"
        class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        📄 Create Invoice
      </a>
      <a
        href="/ap/bills/new"
        class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        📄 Record Bill
      </a>
      <a
        href="/ar/payments/new"
        class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        💵 Record Payment
      </a>
      <a
        href="/financial/journal-entries/new"
        class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        📝 Journal Entry
      </a>
    </div>
  </div>
</div>
