<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import { EmployeeForm } from '$lib/components/hr';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  $effect(() => {
    if (form?.error) {
      toast.error(form.error);
    }
  });
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Edit Employee</h1>
    <p class="text-muted-foreground">Update employee information</p>
  </div>

  {#if data.employee}
    <form method="POST" use:enhance>
      <EmployeeForm
        employee={data.employee}
        departments={data.departments}
        designations={data.designations}
      />
    </form>
  {:else}
    <div class="py-12 text-center text-muted-foreground">Employee not found</div>
  {/if}
</div>
