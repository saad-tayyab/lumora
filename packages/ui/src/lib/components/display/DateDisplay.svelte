<script lang="ts">
  import { cn } from '$lib/utils/cn';

  type DateDisplayFormat = 'short' | 'long' | 'relative';

  interface Props {
    date: string | Date;
    format?: DateDisplayFormat;
    class?: string;
  }

  let { date, format = 'short', class: className }: Props = $props();

  let dateObj = $derived(typeof date === 'string' ? new Date(date) : date);

  let formatted = $derived.by(() => {
    if (format === 'relative') {
      return getRelativeTime(dateObj);
    }
    if (format === 'long') {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(dateObj);
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  });

  function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  }
</script>

<time
  class={cn('text-sm text-muted-foreground', className)}
  datetime={dateObj.toISOString()}
  title={new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(dateObj)}
>
  {formatted}
</time>
