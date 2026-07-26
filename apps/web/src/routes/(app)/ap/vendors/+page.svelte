<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Vendors</h1>
      <p class="text-muted-foreground">Manage your vendors</p>
    </div>
    <a
      href="/ap/vendors/new"
      class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      Add Vendor
    </a>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="p-4">
      <div class="relative">
        <input
          type="text"
          placeholder="Search vendors..."
          class="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-t bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Currency</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.vendors as vendor (vendor.id)}
            <tr class="border-t hover:bg-muted/30">
              <td class="px-4 py-3">
                <a href="/ap/vendors/{vendor.id}" class="font-medium text-primary hover:underline">
                  {vendor.name}
                </a>
              </td>
              <td class="px-4 py-3 text-muted-foreground">{vendor.email || '-'}</td>
              <td class="px-4 py-3 text-muted-foreground">{vendor.phone || '-'}</td>
              <td class="px-4 py-3 text-muted-foreground">{vendor.currency}</td>
              <td class="px-4 py-3">
                <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                  {vendor.status}
                </span>
              </td>
              <td class="px-4 py-3 text-muted-foreground">{formatDate(vendor.createdAt)}</td>
              <td class="px-4 py-3 text-right">
                <a href="/ap/vendors/{vendor.id}/edit" class="text-primary hover:underline">Edit</a>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="7" class="px-4 py-8 text-center text-muted-foreground">
                No vendors found.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
