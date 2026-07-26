<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import { ReceivingReportForm } from '$lib/components/proc';
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
      <a href="/proc/receiving-reports" class="hover:underline">Receiving Reports</a>
      <span>/</span>
      <span>Edit</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Edit Receiving Report</h1>
    <p class="text-muted-foreground">Update receiving report details</p>
  </div>

  {#if data.report}
    <form method="POST" use:enhance>
      <ReceivingReportForm
        vendors={data.purchaseOrders.map((po: any) => ({ id: po.vendorId, name: po.vendorName }))}
        items={[]}
      />
    </form>
  {:else}
    <div class="py-12 text-center text-muted-foreground">Receiving report not found</div>
  {/if}
</div>
