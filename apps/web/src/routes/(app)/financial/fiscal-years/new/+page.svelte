<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import DatePicker from '$lib/components/ui/date-picker.svelte';
import { Label } from '$lib/components/ui/label';
import { Card, CardContent } from '$lib/components/ui/card';
import type { ActionData } from './$types';

let { form }: { form: ActionData } = $props();

let submitting = $state(false);
let name = $state(form?.name ?? '');
let startDate = $state(form?.startDate ?? '');
let endDate = $state(form?.endDate ?? '');

$effect(() => {
  if (form?.error) {
    toast.error(form.error);
  }
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <a href="/financial/fiscal-years" class="text-sm text-muted-foreground hover:text-foreground">
      ← Back to Fiscal Years
    </a>
    <h1 class="mt-2 text-3xl font-bold text-foreground">New Fiscal Year</h1>
    <p class="mt-1 text-muted-foreground">Create a new fiscal year period</p>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => {
        await update();
        submitting = false;
      };
    }}
  >
    <Card>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Year Name *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            bind:value={name}
            placeholder="e.g. FY 2026"
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="startDate">Start Date *</Label>
            <DatePicker bind:value={startDate} />
            <input type="hidden" name="startDate" value={startDate} />
          </div>
          <div class="space-y-2">
            <Label for="endDate">End Date *</Label>
            <DatePicker bind:value={endDate} />
            <input type="hidden" name="endDate" value={endDate} />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <Button href="/financial/fiscal-years" variant="outline">Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Fiscal Year'}
          </Button>
        </div>
      </CardContent>
    </Card>
  </form>
</div>
