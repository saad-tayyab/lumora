import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.integration.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/features/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.integration.test.ts', 'src/**/*.d.ts'],
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
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
