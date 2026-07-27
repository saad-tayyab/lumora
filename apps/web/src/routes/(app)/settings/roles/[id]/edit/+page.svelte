<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import { RoleForm } from '$lib/components/auth';
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
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/settings/roles" class="hover:underline">Roles</a>
      <span>/</span>
      <span>Edit</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Edit Role</h1>
    <p class="text-muted-foreground">Update role details</p>
  </div>

  {#if data.role}
    <form method="POST" use:enhance>
      <RoleForm role={data.role} />
    </form>
  {:else}
    <div class="py-12 text-center text-muted-foreground">Role not found</div>
  {/if}
</div>
