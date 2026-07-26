<script lang="ts">
import { goto } from '$app/navigation';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

$effect(() => {
  if (data.user) {
    goto('/dashboard', { replaceState: true });
  } else {
    goto('/login', { replaceState: true });
  }
});
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
</div>
