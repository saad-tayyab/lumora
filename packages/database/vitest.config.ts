import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.integration.test.ts'],
    fileParallelism: false,
    setupFiles: ['./src/test-setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
