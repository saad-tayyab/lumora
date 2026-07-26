import { writable } from 'svelte/store';

function createThemeStore() {
  const { subscribe, set, update } = writable<'light' | 'dark'>(
    typeof window !== 'undefined'
      ? (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
      : 'dark',
  );

  return {
    subscribe,
    toggle: () => {
      update((current) => {
        const next = current === 'dark' ? 'light' : 'dark';
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', next);
          document.documentElement.classList.toggle('dark', next === 'dark');
        }
        return next;
      });
    },
    set: (value: 'light' | 'dark') => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', value);
        document.documentElement.classList.toggle('dark', value === 'dark');
      }
      set(value);
    },
  };
}

export const theme = createThemeStore();
