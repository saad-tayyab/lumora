<script lang="ts">
import { formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent } from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Warehouses</h1>
      <p class="text-muted-foreground">Manage warehouse locations</p>
    </div>
    <Button href="/inv/warehouses/new">Add Warehouse</Button>
  </div>

  <Card>
    <CardContent>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-t bg-muted/50">
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Code</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">City</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Country</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody>
            {#each data.warehouses as warehouse (warehouse.id)}
              <tr class="border-t hover:bg-muted/30">
                <td class="px-4 py-3 font-medium">{warehouse.name}</td>
                <td class="px-4 py-3 text-muted-foreground">{warehouse.code}</td>
                <td class="px-4 py-3 text-muted-foreground">{warehouse.city || '-'}</td>
                <td class="px-4 py-3 text-muted-foreground">{warehouse.country || '-'}</td>
                <td class="px-4 py-3">
                  <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {warehouse.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                    {warehouse.status}
                  </span>
                </td>
                <td class="px-4 py-3 text-muted-foreground">{formatDate(warehouse.createdAt)}</td>
              </tr>
            {:else}
              <tr>
                <td colspan="6" class="px-4 py-8 text-center text-muted-foreground">
                  No warehouses found.
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
</div>
