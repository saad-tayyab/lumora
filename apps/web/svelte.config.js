import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '../..');

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      '$lib': 'src/lib',
      '$components': 'src/lib/components',
      '$utils': 'src/lib/utils',
      '$types': 'src/lib/types',
      '$stores': 'src/lib/stores',
      '@lumora/shared': path.resolve(monorepoRoot, 'packages/shared/src'),
      '@lumora/shared/*': path.resolve(monorepoRoot, 'packages/shared/src/*'),
      '@lumora/validation': path.resolve(monorepoRoot, 'packages/validation/src'),
      '@lumora/validation/*': path.resolve(monorepoRoot, 'packages/validation/src/*'),
      '@lumora/config': path.resolve(monorepoRoot, 'packages/config/src'),
      '@lumora/config/*': path.resolve(monorepoRoot, 'packages/config/src/*'),
    }
  }
};

export default config;
