<script lang="ts">
import '../app.css';
import { ModeWatcher } from 'mode-watcher';
import { setContext } from 'svelte';
import { Toaster } from 'svelte-sonner';
import type { LayoutData } from './$types';

let { data, children }: { data: LayoutData; children: any } = $props();

setContext('user', data.user);
setContext('tenantId', data.tenantId);
</script>

<ModeWatcher defaultMode="dark" />
{@render children()}
<Toaster position="top-right" />
