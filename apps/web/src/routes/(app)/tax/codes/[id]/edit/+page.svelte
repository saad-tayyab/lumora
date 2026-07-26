<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import { TaxCodeForm } from '$lib/components/tax';
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
      <a href="/tax/codes" class="hover:underline">Tax Codes</a>
      <span>/</span>
      <span>Edit</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Edit Tax Code</h1>
    <p class="text-muted-foreground">Update tax code configuration</p>
  </div>

  {#if data.taxCode}
    <form method="POST" use:enhance>
      <TaxCodeForm taxCode={data.taxCode} />
    </form>
  {:else}
    <div class="py-12 text-center text-muted-foreground">Tax code not found</div>
  {/if}
</div>
