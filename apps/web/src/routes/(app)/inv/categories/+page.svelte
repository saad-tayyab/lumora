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
      <h1 class="text-3xl font-bold text-foreground">Item Categories</h1>
      <p class="text-muted-foreground">Organize your inventory items</p>
    </div>
    <Button href="/inv/categories/new">Add Category</Button>
  </div>

  <Card>
    <CardContent>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-t bg-muted/50">
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody>
            {#each data.categories as category (category.id)}
              <tr class="border-t hover:bg-muted/30">
                <td class="px-4 py-3 font-medium">{category.name}</td>
                <td class="px-4 py-3 text-muted-foreground">{category.description || '-'}</td>
                <td class="px-4 py-3 text-muted-foreground">{formatDate(category.createdAt)}</td>
              </tr>
            {:else}
              <tr>
                <td colspan="3" class="px-4 py-8 text-center text-muted-foreground">
                  No categories found.
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
</div>
