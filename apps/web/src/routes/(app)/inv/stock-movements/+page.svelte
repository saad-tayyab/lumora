<script lang="ts">
import { formatDateTime } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent } from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const movementTypeColor: Record<string, string> = {
  in: 'bg-green-100 text-green-800',
  out: 'bg-red-100 text-red-800',
  transfer: 'bg-blue-100 text-blue-800',
  adjustment: 'bg-yellow-100 text-yellow-800',
};
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Stock Movements</h1>
      <p class="text-muted-foreground">Track inventory movements</p>
    </div>
    <Button href="/inv/stock-movements/new">Record Movement</Button>
  </div>

  <Card>
    <CardContent>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-t bg-muted/50">
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Item</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Warehouse</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">Quantity</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Reference</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Notes</th>
            </tr>
          </thead>
          <tbody>
            {#each data.movements as movement (movement.id)}
              <tr class="border-t hover:bg-muted/30">
                <td class="px-4 py-3 text-muted-foreground">{formatDateTime(movement.createdAt)}</td>
                <td class="px-4 py-3">
                  <span class="font-medium">{movement.itemName || '-'}</span>
                  <span class="text-xs text-muted-foreground ml-1">({movement.itemSku || '-'})</span>
                </td>
                <td class="px-4 py-3 text-muted-foreground">{movement.warehouseName || '-'}</td>
                <td class="px-4 py-3">
                  <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {movementTypeColor[movement.type] || 'bg-gray-100 text-gray-800'}">
                    {movement.type}
                  </span>
                </td>
                <td class="px-4 py-3 text-right font-medium {movement.type === 'out' ? 'text-red-600' : 'text-green-600'}">
                  {movement.type === 'out' ? '-' : '+'}{movement.quantity}
                </td>
                <td class="px-4 py-3 text-muted-foreground">{movement.referenceType || '-'} {movement.referenceId ? `#${movement.referenceId.slice(0, 8)}` : ''}</td>
                <td class="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{movement.notes || '-'}</td>
              </tr>
            {:else}
              <tr>
                <td colspan="7" class="px-4 py-8 text-center text-muted-foreground">
                  No stock movements found.
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
</div>
