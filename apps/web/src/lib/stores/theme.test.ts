import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((_index: number) => null),
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

beforeEach(() => {
  localStorageMock.clear();
  localStorageMock.getItem.mockReset();
  localStorageMock.getItem.mockReturnValue(null as unknown as string);
  vi.clearAllMocks();
  vi.resetModules();
});

describe('theme store', () => {
  it('defaults to dark when no localStorage value', async () => {
    const { theme } = await import('./theme');
    expect(get(theme)).toBe('dark');
  });

  it('reads from localStorage on init', async () => {
    localStorageMock.getItem.mockReturnValue('light');
    const { theme } = await import('./theme');
    expect(get(theme)).toBe('light');
  });

  it('toggle switches from dark to light', async () => {
    const { theme } = await import('./theme');
    expect(get(theme)).toBe('dark');
    theme.toggle();
    expect(get(theme)).toBe('light');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('toggle switches from light to dark', async () => {
    localStorageMock.getItem.mockReturnValue('light');
    const { theme } = await import('./theme');
    expect(get(theme)).toBe('light');
    theme.toggle();
    expect(get(theme)).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('set updates the theme to a specific value', async () => {
    const { theme } = await import('./theme');
    theme.set('dark');
    expect(get(theme)).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('set to light stores in localStorage', async () => {
    const { theme } = await import('./theme');
    theme.set('light');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });
});
