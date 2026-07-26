<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import { WarehouseForm } from '$lib/components/inv';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  $effect(() => {
    if (form?.error) {
      toast.error(form.error);
    }
  });
</script>

<div class="space-y-6">
  <div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/inv/warehouses" class="hover:underline">Warehouses</a>
      <span>/</span>
      <span>Edit</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Edit Warehouse</h1>
    <p class="text-muted-foreground">Update warehouse information</p>
  </div>

  {#if data.warehouse}
    <form method="POST" use:enhance>
      <WarehouseForm warehouse={data.warehouse} />
    </form>
  {:else}
    <div class="py-12 text-center text-muted-foreground">Warehouse not found</div>
  {/if}
</div>
