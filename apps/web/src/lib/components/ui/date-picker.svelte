<script lang="ts">
  import { parseDate, type DateValue } from '@internationalized/date';
  import * as Popover from '$lib/components/ui/popover';
  import { Button } from '$lib/components/ui/button';
  import { Calendar } from '$lib/components/ui/calendar';
  import { cn } from '$lib/utils/cn';
  import { CalendarIcon } from '@lucide/svelte';

  interface Props {
    value?: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    class?: string;
  }

  let { value = $bindable(''), label, placeholder = 'Pick a date', disabled = false, class: className }: Props = $props();
  let open = $state(false);

  let dateValue = $derived.by(() => {
    if (!value) return undefined;
    try {
      return parseDate(value);
    } catch {
      return undefined;
    }
  });

  function onSelect(d: DateValue | undefined) {
    if (d) {
      value = `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
    } else {
      value = '';
    }
    open = false;
  }

  function formatDateDisplay(d: string): string {
    if (!d) return placeholder;
    try {
      const date = new Date(d + 'T00:00:00');
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return d;
    }
  }
</script>

<div class={cn('flex flex-col gap-1.5', className)}>
  {#if label}
    <label class="text-sm font-medium leading-none">{label}</label>
  {/if}
  <Popover.Root bind:open>
    <Popover.Trigger>
      {#snippet child({ props })}
        <Button
          variant="outline"
          class={cn('w-full justify-start text-left font-normal', !value && 'text-muted-foreground')}
          {disabled}
          {...props}
        >
          <CalendarIcon data-icon="inline-start" class="shrink-0" />
          {formatDateDisplay(value)}
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-auto p-0">
      <Calendar type="single" value={dateValue} onValueChange={onSelect} initialFocus />
    </Popover.Content>
  </Popover.Root>
</div>
