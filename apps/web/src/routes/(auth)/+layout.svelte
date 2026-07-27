<script lang="ts">
import type { Snippet } from 'svelte';
import { prefersReducedMotion } from 'svelte/motion';
import { fade } from 'svelte/transition';

let { children }: { children: Snippet } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-background p-4">
  <div
    class="w-full max-w-md"
    in:fade={{ duration: prefersReducedMotion.current ? 0 : 300 }}
  >
    {@render children()}
  </div>
</div>
