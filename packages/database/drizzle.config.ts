import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: ['./src/schema/*/schema.ts', './src/schema/common/*.ts'],
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
