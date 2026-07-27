<script lang="ts">
import { goto } from '$app/navigation';
import { Spinner } from '$lib/components/ui/spinner';
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
  <Spinner class="size-8 text-primary" />
</div>
