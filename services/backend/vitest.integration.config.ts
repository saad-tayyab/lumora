import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.integration.test.ts'],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['./src/lib/test-setup.ts'],
  },
  resolve: {
    alias: {
      '~encore': path.resolve(__dirname, './encore.gen'),
      '@lumora/database': path.resolve(__dirname, '../../packages/database/src'),
      '@lumora/database/*': path.resolve(__dirname, '../../packages/database/src/*'),
      '@lumora/auth': path.resolve(__dirname, '../../packages/auth/src'),
      '@lumora/auth/*': path.resolve(__dirname, '../../packages/auth/src/*'),
      '@lumora/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@lumora/shared/*': path.resolve(__dirname, '../../packages/shared/src/*'),
      '@lumora/config': path.resolve(__dirname, '../../packages/config/src'),
      '@lumora/config/*': path.resolve(__dirname, '../../packages/config/src/*'),
      '@lumora/validation': path.resolve(__dirname, '../../packages/validation/src'),
      '@lumora/validation/*': path.resolve(__dirname, '../../packages/validation/src/*'),
    },
  },
});
